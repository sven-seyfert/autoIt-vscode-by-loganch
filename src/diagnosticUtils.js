import { Diagnostic, DiagnosticSeverity, Range, Position, Uri } from 'vscode';


const SEVERITY_MAP = {
  warning: DiagnosticSeverity.Warning,
  error: DiagnosticSeverity.Error
};

/** Regular expression to parse diagnostic entries */
const OUTPUT_REGEXP = /"(?<scriptPath>.+)"\((?<line>\d+),(?<position>\d+)\)\s:\s(?<severity>warning|error):\s(?<description>.+)\r?$/gm;

/** Regular expression to check for successful validation with no issues */
const NO_ISSUES_REGEX = /^- 0 error\(s\), 0 warning\(s\)\r?$/m;

/**
 * Returns the diagnostic severity based on the severity string.
 * @param {string} severityString - The severity string to convert to DiagnosticSeverity.
 * @returns {DiagnosticSeverity} - The DiagnosticSeverity based on the severity string.
 */
export const getDiagnosticSeverity = (severityString) => {
  return SEVERITY_MAP[severityString] || DiagnosticSeverity.Error;
};


/**
 * Returns a diagnostic range for a given line and position.
 * @param {number} line - The line number.
 * @param {number} position - The position number.
 * @returns {Range} - The diagnostic range.
 */
export const createDiagnosticRange = (line, position) => {
  const lineNumber = parseInt(line, 10) - 1;
  const columnNumber = parseInt(position, 10) - 1;
  const startPosition = new Position(lineNumber, columnNumber);
  return new Range(startPosition, startPosition);
};

/**
 * Processes the results of AU3Check, identifies warnings and errors.
 * @param {string} output Text returned from AU3Check.
 * @param {DiagnosticCollection} collection - The diagnostic collection to update.
 * @param {Uri} documentURI - The URI of the document that was checked
 */
export const parseAu3CheckOutput = (output, collection, documentURI) => {
  if (NO_ISSUES_REGEX.test(output)) {
    collection.delete(documentURI);
    return;
  }

  const diagnostics = new Map();

  for (const match of output.matchAll(OUTPUT_REGEXP)) {
    const { groups } = match;
    if (!groups) continue;

    const { line, position, severity, scriptPath, description } = groups;
    const range = createDiagnosticRange(line, position);
    const severityLevel = getDiagnosticSeverity(severity);

    const diagnostic = new Diagnostic(range, description, severityLevel);
    diagnostic.source = 'AU3Check';

    const fileDiagnostics = diagnostics.get(scriptPath) || [];
    fileDiagnostics.push(diagnostic);
    diagnostics.set(scriptPath, fileDiagnostics);
  }

  diagnostics.forEach((fileDiagnostics, scriptPath) => {
    collection.set(Uri.file(scriptPath), fileDiagnostics);
  });
};

export default parseAu3CheckOutput;
