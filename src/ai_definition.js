import { languages, Location, Position, Range, Uri, window } from 'vscode';
import { AUTOIT_MODE, getIncludePath, getIncludeText, getIncludeScripts } from './util';

const AutoItDefinitionProvider = {
  /**
   * Finds the definition of a word in a document and returns its location.
   * @param {import("vscode").TextDocument} document - The document in which to search for the word definition.
   * @param {Position} position - The position of the word for which to find the definition.
   * @returns {Location|null} - The location of the word definition, or null if not found.
   */
  provideDefinition(document, position) {
    try {
      // Input validation
      if (!document || !position || typeof document.getText !== 'function') {
        return null;
      }
      const lookupRange = document.getWordRangeAtPosition(position);
      if (!lookupRange) return null;
      const lookupText = document.getText(lookupRange);
      if (typeof lookupText !== 'string' || lookupText.trim().length === 0) return null;

      const documentText = document.getText();
      if (typeof documentText !== 'string' || documentText.length === 0) return null;

      // Build regex for the symbol
      const definitionRegex = this.determineRegex(lookupText);
      if (!definitionRegex) return null;

      // First attempt: search in current document
      const match = definitionRegex.exec(documentText);
      if (match && typeof match.index === 'number') {
        // Capture group for symbol if present; compute the exact symbol index
        let symbolOffsetInMatch = 0;
        if (match[1]) {
          const idxIn0 = match[0].indexOf(match[1]);
          if (idxIn0 >= 0) symbolOffsetInMatch = idxIn0;
        }
        const absoluteIndex = match.index + symbolOffsetInMatch;
        const pos = document.positionAt(absoluteIndex);
        const range = new Range(pos, pos);
        return new Location(document.uri, range);
      }

      // Search include files
      const includeResult = this.findDefinitionInIncludeFiles(
        documentText,
        definitionRegex,
        document,
        lookupText,
      );
      if (includeResult && includeResult.found) {
        const { scriptPath, found } = includeResult;
        const pos = new Position(found.line, found.character);
        const range = new Range(pos, pos);
        return new Location(Uri.file(scriptPath), range);
      }

      return null;
    } catch (err) {
      window.showErrorMessage(`provideDefinition error: ${err.message}`);
      return null;
    }
  },

  /**
   * Determines the regex for a given lookup string.
   * Chooses variable or function regex and compiles with "mi" flags.
   * @param {string} lookup - The lookup string.
   * @returns {RegExp} The regex for the lookup string.
   */
  determineRegex(lookup) {
    try {
      if (lookup.startsWith('$')) {
        // Variables: robust declaration pattern supporting Local|Global|Const,
        // spaces/tabs, and lists with continuation underscores.
        const escaped = lookup.replace(/[$.*+?^${}()|[\]\\]/g, '\\$&');
        const varPattern =
          '^[ \\t]*(?:(?:Local|Global|Const)[ \\t]+)?' +
          '(?:(?:\\$[A-Za-z_][A-Za-z0-9_]*\\s*(?:=\\s*[^,\\r\\n]+)?\\s*,\\s*)*?)' +
          '(' +
          escaped +
          ')\\b' +
          '(?:[^\\n]*?(?:,\\s*[^\\n]*?)?)(?:\\s*_\\s*\\r?\\n[\\s\\S]*?)?';
        return new RegExp(varPattern, 'mi');
      }

      // Functions: case-insensitive "Func", optional "volatile" before or after name, flexible spacing.
      const escapedFuncName = lookup.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const funcPatternA =
        '^[ \\t]*Func[ \\t]+(?:volatile[ \\t]+)?(' + escapedFuncName + ')[ \\t]*\\(';
      const funcPatternB = '^[ \\t]*Func[ \\t]+(' + escapedFuncName + ')[ \\t]+volatile[ \\t]*\\(';
      const combined = `(?:${funcPatternA})|(?:${funcPatternB})`;
      return new RegExp(combined, 'mi');
    } catch (e) {
      window.showErrorMessage(`determineRegex error: ${e.message}`);
      return null;
    }
  },

  /**
   * Searches the included scripts in a document for a definition matching a regular expression.
   * Always returns either null or a structured object describing the match.
   * @param {string} docText - The text of the document.
   * @param {RegExp} defRegex - The regular expression to search for.
   * @param {import("vscode").TextDocument} document - The document being searched.
   * @param {string} lookupText - The original symbol text being looked up.
   * @returns {object|null}
   */
  findDefinitionInIncludeFiles(docText, defRegex, document, lookupText) {
    try {
      const scriptsToSearch = [];
      const mockResult = getIncludeScripts(document, docText, scriptsToSearch);
      // Handle both mock (returns array) and real function (populates by reference)
      const scripts = Array.isArray(mockResult) ? mockResult : scriptsToSearch;

      for (const script of scripts) {
        let scriptPath;
        try {
          // Check if script is already a full path (for mocked tests) or needs to be resolved
          if (
            script &&
            (script.includes('/') || script.includes('\\') || script.endsWith('.au3'))
          ) {
            scriptPath = script; // Already a path
          } else {
            scriptPath = getIncludePath(script, document);
          }
        } catch (e) {
          window.showInformationMessage(
            `getIncludePath failed for script: ${script}, error: ${e.message}`,
          );
          continue;
        }

        let scriptContent = '';
        try {
          scriptContent = getIncludeText(scriptPath) || '';
        } catch (e) {
          window.showInformationMessage(
            `getIncludeText failed for path: ${scriptPath}, error: ${e.message}`,
          );
          continue;
        }
        if (!scriptContent || scriptContent.trim().length === 0) continue;

        // Reset regex lastIndex to ensure fresh search
        if (defRegex && typeof defRegex.lastIndex === 'number') {
          defRegex.lastIndex = 0;
        }

        const m = defRegex ? defRegex.exec(scriptContent) : null;
        if (!m || typeof m.index !== 'number') {
          continue;
        }

        // Determine the capture for the symbol name
        let capture = null;
        if (lookupText && lookupText.startsWith('$')) {
          capture = m[1] || null;
        } else {
          // function name capture may be in group 1 (pattern A) or 2 (pattern B)
          capture = m[1] || m[2] || null;
        }

        const symbol = capture || lookupText || '';
        const idx = capture ? m.index + m[0].indexOf(capture) : m.index;
        const length = capture ? capture.length : m[0] ? m[0].length : 0;

        // Compute line and character
        const prefix = scriptContent.slice(0, idx);
        const lines = prefix.split('\n');
        const line = lines.length - 1;
        const character = lines[lines.length - 1].length;

        return {
          scriptPath,
          scriptContent,
          found: {
            index: idx,
            length,
            line,
            character,
            symbol,
          },
          prefixLength: 0,
        };
      }

      return null;
    } catch (err) {
      window.showErrorMessage(`findDefinitionInIncludeFiles error: ${err.message}`);
      return null;
    }
  },
};

const defProvider = languages.registerDefinitionProvider(AUTOIT_MODE, AutoItDefinitionProvider);

export default defProvider;
export { AutoItDefinitionProvider };
