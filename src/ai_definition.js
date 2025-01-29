import { join } from 'path';
import { readdirSync, statSync } from 'fs';
import { languages, Location, Position, Uri } from 'vscode';
import { AUTOIT_MODE, getIncludePath, getIncludeText, getIncludeScripts } from './util';

const AutoItDefinitionProvider = {
  /**
   * Finds the definition of a word in a document and returns its location.
   * @param {TextDocument} document - The document in which to search for the word definition.
   * @param {Position} position - The position of the word for which to find the definition.
   * @returns {Location|null} - The location of the word definition, or null if not found.
   */
  provideDefinition(document, position) {
    const lookupRange = document.getWordRangeAtPosition(position);
    const lookupText = document.getText(lookupRange);
    const documentText = document.getText();

    const definitionRegex = this.determineRegex(lookupText);
    let match = documentText.match(definitionRegex);

    if (match) {
      return new Location(document.uri, document.positionAt(match.index + (match[1] || '').length));
    }

    // If nothing was found, search include files
    match = this.findDefinitionInIncludeFiles(documentText, definitionRegex, document);

    if (match && match.found) {
      const { scriptPath } = match;
      const scriptContentBeforeMatch = match.scriptContent
        .slice(0, match.found.index + (match[1] || '').length)
        .split('\n');
      const matchLine = scriptContentBeforeMatch.length - 1;
      const matchCharacterIndex =
        scriptContentBeforeMatch[scriptContentBeforeMatch.length - 1].length;
      return new Location(Uri.file(scriptPath), new Position(matchLine, matchCharacterIndex));
    }

    return null;
  },

  /**
   * Determines the regex for a given lookup string.
   * @param {string} lookup - The lookup string.
   * @returns {RegExp} The regex for the lookup string.
   */
  determineRegex(lookup) {
    const variableRegex = /(?<![;].*)(?<!(?:#cs|#comments-start).*)((?:Local|Global|Const)\s*)?@(?:\[[\w\d\\$]+\])?\s*=?.*(?![^#]*(#ce|#comments-end))/;

    if (lookup.startsWith('$')) {
      return new RegExp(variableRegex.source.replace('@', `\\${lookup}\\b`), 'i');
    }
    return new RegExp(
      `(?<![;].*)(?<!(?:#cs|#comments-start).*)(Func\\s+)${lookup}\\s*\\((?![^#]*(#ce|#comments-end))`,
    );
  },

  /**
   * Searches the included scripts in a document for a definition matching a regular expression.
   * @param {string} docText - The text of the document.
   * @param {RegExp} defRegex - The regular expression to search for.
   * @param {TextDocument} document - The document being searched.
   * @returns {object|null} - An object containing information about the found definition, or null if not found.
   */
  findDefinitionInIncludeFiles(docText, defRegex, document) {
    function searchForPath(directoryName) {
      const file = document.fileName;
      const filePathParts = file.split('\\');

      for (let index = filePathParts.length - 1; index >= 0; index--) {
        if (filePathParts[index] !== directoryName) {
          filePathParts.splice(index, 1);
        } else {
          break;
        }
      }

      return filePathParts.join('\\');
    }

    function getAu3FilesOfDirectoryRecursive(currentDir) {
      let files;
      let fileList = [];

      try {
        files = readdirSync(currentDir);
      } catch (error) {
        return fileList;
      }

      files.forEach((file) => {
        const filePath = join(currentDir, file);
        const fileStat = statSync(filePath);

        if (fileStat.isFile() && file.endsWith('.au3')) {
          if (!file.endsWith('_stripped.au3')) {
            fileList.push(filePath);
          }
        } else if (fileStat.isDirectory()) {
          fileList = fileList.concat(getAu3FilesOfDirectoryRecursive(filePath));
        }
      });

      return fileList;
    }

    const srcDirectory = searchForPath('src');
    const libDirectory = searchForPath('src').replace('src', 'lib');
    const filesOfSrcDir = getAu3FilesOfDirectoryRecursive(srcDirectory);
    const filesOfLibDir = getAu3FilesOfDirectoryRecursive(libDirectory);

    let scriptsToSearch = [];
    scriptsToSearch = filesOfSrcDir.concat(filesOfLibDir);

    let returnObject = false;
    getIncludeScripts(document, docText, scriptsToSearch);

    const searchScript = (script) => {
      const scriptPath = getIncludePath(script, document);
      const scriptContent = getIncludeText(scriptPath);
      const found = scriptContent.match(defRegex);

      if (returnObject) return { scriptPath, scriptContent, found };

      return found;
    };

    const match = scriptsToSearch.find(searchScript);

    if (match) {
      returnObject = true;
      return searchScript(match);
    }

    return null;
  },
};

const defProvider = languages.registerDefinitionProvider(AUTOIT_MODE, AutoItDefinitionProvider);

export default defProvider;
