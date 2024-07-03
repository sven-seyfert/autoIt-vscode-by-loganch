import { languages, workspace, window } from 'vscode';
import { provideDocumentSymbols } from './ai_symbols';

let symbolsCache = [];

async function getWorkspaceSymbols() {
  const workspaceScripts = await workspace.findFiles('**/*.{au3,a3x}');

  const scriptPromises = workspaceScripts.map(async file => {
    const thisDocument = await workspace.openTextDocument(file);
    return provideDocumentSymbols(thisDocument);
  });

  try {
    const symbols = await Promise.all(scriptPromises);
    return symbols.flat();
  } catch (error) {
    window.showErrorMessage(error);
    return null;
  }
}

async function provideWorkspaceSymbols() {
  if (symbolsCache.length === 0) {
    symbolsCache = await getWorkspaceSymbols();
  }
  return symbolsCache;
}

const watcher = workspace.createFileSystemWatcher('**/*.{au3,a3x}');

const resetCache = () => {
  symbolsCache = [];
};

watcher.onDidChange(resetCache);
watcher.onDidCreate(resetCache);
watcher.onDidDelete(resetCache);

const workspaceSymbolProvider = languages.registerWorkspaceSymbolProvider({
  provideWorkspaceSymbols,
});

export default workspaceSymbolProvider;
