import { Diagnostic, DiagnosticSeverity, Range, Position, Uri } from 'vscode';

/**
 * Returns the diagnostic severity based on the severity string.
 * @param {string} severityString - The severity string to convert to DiagnosticSeverity.
 * @returns {DiagnosticSeverity} - The DiagnosticSeverity based on the severity string.
 */
export const getDiagnosticSeverity = severityString => {
  switch (severityString) {
    case 'warning':
      return DiagnosticSeverity.Warning;
    default:
      return DiagnosticSeverity.Error;
  }
};

/**
 * Returns a diagnostic range for a given line and position.
 * @param {number} line - The line number.
 * @param {number} position - The position number.
 * @returns {Range} - The diagnostic range.
 */
export const createDiagnosticRange = (line, position) => {
  const diagnosticPosition = new Position(parseInt(line, 10) - 1, parseInt(position, 10) - 1);

  return new Range(diagnosticPosition, diagnosticPosition);
};

/**
 * Adds a new diagnostic to a Map of diagnostics.
 * @param {Map} diagnostics - The current diagnostics object.
 * @param {string} scriptPath - The path of the script that the diagnostic is for.
 * @param {Diagnostic} diagnosticToAdd - The new diagnostics object to add.
 */
export const updateDiagnostics = (diagnostics, scriptPath, diagnosticToAdd) => {
  let diagnosticArray;
  if (diagnostics.has(scriptPath)) {
    diagnosticArray = diagnostics.get(scriptPath);
  } else {
    diagnosticArray = [];
  }
  diagnosticArray.push(diagnosticToAdd);
  diagnostics.set(scriptPath, diagnosticArray);
};

const OUTPUT_REGEXP = /"(?<scriptPath>.+)"\((?<line>\d{1,4}),(?<position>\d{1,4})\)\s:\s(?<severity>warning|error):\s(?<description>.+)\r/gm;

/**
 * Normalize Windows-like paths to a comparable form:
 * - If path starts with "/C:" style, convert to "C:".
 * - Convert forward slashes to backslashes.
 * - Trim whitespace.
 */
const normalizeWindowsPath = (p) => {
  if (!p || typeof p !== 'string') return '';
  let n = p.trim();
  if (n.startsWith('/')) {
    n = n.slice(1);
  }
  if (n[1] === ':') {
    n = n[0].toUpperCase() + n.slice(1);
  }
  n = n.replace(/\//g, '\\'); // / -> \
  return n;
};

/**
 * Case-insensitive comparison after normalization to determine if two paths
 * refer to the same file. This is a simple heuristic suitable for Windows.
 */
const pathsReferToSameFile = (a, b) => {
  const na = normalizeWindowsPath(a);
  const nb = normalizeWindowsPath(b);
  if (!na || !nb) return false;
  return na.toLowerCase() === nb.toLowerCase();
};

/**
 * Detect presence of non-ASCII characters that may trigger AU3Check encoding issues.
 * Returns true if any character is outside the 0x20-0x7E printable ASCII range.
 */
const hasSpecialCharacters = (p) => {
  if (!p) return false;
  return Array.from(p).some(char => {
    const code = char.charCodeAt(0);
    return code < 0x20 || code > 0x7E;
  });
};

/**
 * Processes the results of AU3Check, identifies warnings and errors.
 * @param {string} output Text returned from AU3Check.
 * @param {DiagnosticCollection} collection - The diagnostic collection to update.
 * @param {Uri} documentURI - The URI of the document that was checked
 */
export const parseAu3CheckOutput = (output, collection, documentURI) => {
  if (output.includes('- 0 error(s), 0 warning(s)')) {
    collection.delete(documentURI);
    return;
  }

  const diagnostics = new Map();

  const matches = [...output.matchAll(OUTPUT_REGEXP)];
  matches.forEach(match => {
    const { line, position, severity, description, scriptPath } = match.groups;
    const diagnosticRange = createDiagnosticRange(line, position);
    const diagnosticSeverity = getDiagnosticSeverity(severity);

    const diagnosticToAdd = new Diagnostic(diagnosticRange, description, diagnosticSeverity);

    // Use scriptPath by default to correctly attribute diagnostics to included files.
    // Fall back to documentURI only when AU3Check's path encoding likely corrupts the path:
    // specifically, when both paths refer to the same file AND either contains special characters.
    const normalizedScriptPath = normalizeWindowsPath(scriptPath);
    const normalizedDocumentPath = normalizeWindowsPath(documentURI.fsPath ?? documentURI.path ?? String(documentURI));

    let chosenPath = normalizedScriptPath;

    const scriptHasSpecial = hasSpecialCharacters(normalizedScriptPath);
    const docHasSpecial = hasSpecialCharacters(normalizedDocumentPath);

    // Fallback condition: same file and special chars present -> prefer documentURI (stable encoding).
    if (
      (!normalizedScriptPath || normalizedScriptPath.length === 0) ||
      (pathsReferToSameFile(normalizedScriptPath, normalizedDocumentPath) && (scriptHasSpecial || docHasSpecial))
    ) {
      chosenPath = normalizedDocumentPath;
    }

    updateDiagnostics(diagnostics, chosenPath, diagnosticToAdd);
  });

  diagnostics.forEach((diagnosticArray, file) => {
    collection.set(Uri.file(file), diagnosticArray);
  });
};

export default parseAu3CheckOutput;