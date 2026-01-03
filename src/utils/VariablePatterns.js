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
    this.global = /^\s*(?:Global|Volatile)\s+(\$\w+)/gim;

    // Local declarations inside functions (Volatile keyword supported)
    this.local = /^\s*(?:Local|Volatile)\s+(\$\w+)/gim;

    // Static declarations (function-scoped, persists between calls) (Volatile keyword supported)
    this.static = /^\s*(?:Static|Volatile)\s+(\$\w+)/gim;

    // Dim declarations (context-dependent: global at script level, local in functions)
    this.dim = /^\s*Dim\s+(\$\w+)/gim;

    // Parameter extraction from function signature
    this.parameter = /\$\w+/g;

    // Assignment pattern for implicit variables (lower priority, for fallback)
    this.assignment = /^\s*(\$\w+)\s*=/gim;

    // Utility patterns
    this.comment = /^\s*;/;
    this.string = /["'].*?["']/g;
    this.includePattern = /#include\s+[<"]([^>"]+)[>"]/gim;
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
   * @param {string} line - The line to clean
   * @returns {string} Line with string contents removed
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
