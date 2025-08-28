module.exports = {
  Position: class Position {
    constructor(line, character) {
      this.line = line;
      this.character = character;
    }
  },
  Range: class Range {
    constructor(start, end) {
      this.start = start;
      this.end = end;
    }
  },
  Location: class Location {
    constructor(uri, range) {
      this.uri = uri;
      this.range = range;
    }
  },
  Uri: {
    file: p => ({ fsPath: p }),
  },
};
