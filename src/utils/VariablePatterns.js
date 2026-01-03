/**
 * Regex patterns for variable analysis in AutoIt code
 * Based on existing patterns in src/util.js and src/parsers/MapParser.js
 */

export default class VariablePatterns {
  constructor() {
    // Function patterns (reuse from MapParser for consistency)
    this.function = /^\s*(?:Volatile\s+)?Func\s+(\w+)\s*\(([^)]*)\)/im;
    this.endFunc = /^\s*EndFunc\b/im;

    // Explicit variable declarations
    // Global declarations at script level (Volatile keyword supported)
    // Captures comma-separated variable lists: Global $a, $b, $c
    this.global = /^\s*(?:Global|Volatile)\s+((?:\$\w+(?:\s*,\s*\$\w+)*))/gim;

    // Local declarations inside functions (Volatile keyword supported)
    // Captures comma-separated variable lists: Local $x, $y, $z
    this.local = /^\s*(?:Local|Volatile)\s+((?:\$\w+(?:\s*,\s*\$\w+)*))/gim;

    // Static declarations (function-scoped, persists between calls) (Volatile keyword supported)
    // Captures comma-separated variable lists: Static $s1, $s2
    this.static = /^\s*(?:Static|Volatile)\s+((?:\$\w+(?:\s*,\s*\$\w+)*))/gim;

    // Dim declarations (context-dependent: global at script level, local in functions)
    // Captures comma-separated variable lists: Dim $data, $info
    this.dim = /^\s*Dim\s+((?:\$\w+(?:\s*,\s*\$\w+)*))/gim;

    // Parameter extraction from function signature
    this.parameter = /\$\w+/g;

    // Assignment pattern for implicit variables (lower priority, for fallback)
    this.assignment = /^\s*(\$\w+)\s*=/gim;

    // Utility patterns
    this.comment = /^\s*;/;
    // AutoIt string pattern: handles double-character escaping ("" or '')
    // Matches: "He said ""hello""" and 'Don''t'
    this.string = /"(?:[^"]|"")*"|'(?:[^']|'')*'/g;
    this.includePattern = /#include\s+[<"]([^>"]+)[>"]/gim;
  }

  /**
   * Extract individual variable names from a comma-separated list
   * @param {string} variablesStr - The matched variable list (e.g., "$a, $b, $c")
   * @returns {string[]} Array of variable names (e.g., ["$a", "$b", "$c"])
   * @example
   * // For "Global $a, $b, $c = 1"
   * const match = line.match(patterns.global);
   * if (match) {
   *   const variables = patterns.extractVariables(match[1]);
   *   // variables = ["$a", "$b", "$c"]
   * }
   */
  extractVariables(variablesStr) {
    if (!variablesStr) {
      return [];
    }
    return variablesStr
      .split(',')
      .map(v => v.trim())
      .filter(v => v && v.startsWith('$'));
  }

  /**
   * Check if a line is a comment
   * @param {string} line - The line to check
   * @returns {boolean} True if the line is a comment
   */
  isComment(line) {
    return this.comment.test(line);
  }

  /**
   * Remove strings from a line to prevent false pattern matches
   * Handles AutoIt's double-character escaping ("" and '')
   * @param {string} line - The line to clean
   * @returns {string} Line with string contents removed
   * @example
   * removeStrings('Local $msg = "He said ""hello"""') // => 'Local $msg = ""'
   * removeStrings("Local $text = 'Don''t'") // => "Local $text = \"\""
   */
  removeStrings(line) {
    return line.replace(this.string, '""');
  }

  /**
   * Remove comments from a line
   * @param {string} line - The line to clean
   * @returns {string} Line with comments removed
   */
  removeComments(line) {
    const commentIdx = line.indexOf(';');
    return commentIdx !== -1 ? line.substring(0, commentIdx) : line;
  }

  /**
   * Clean a line for pattern matching (remove comments and strings)
   * @param {string} line - The line to clean
   * @returns {string} Cleaned line
   */
  cleanLine(line) {
    return this.removeComments(this.removeStrings(line));
  }
}
