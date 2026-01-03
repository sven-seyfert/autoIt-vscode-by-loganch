import VariableParser from '../../src/parsers/VariableParser.js';

describe('VariableParser', () => {
  describe('parseExplicitDeclarations', () => {
    it('should parse Global variable declarations', () => {
      const source = 'Global $g_vVar1, $g_vVar2';
      const parser = new VariableParser(source);
      const variables = parser.parseVariableDeclarations();

      const globalVars = variables.filter(v => v.declarationKeyword === 'Global');
      expect(globalVars).toHaveLength(2);
      expect(globalVars[0].name).toBe('$g_vVar1');
      expect(globalVars[1].name).toBe('$g_vVar2');
    });

    it('should parse Local variable declarations', () => {
      const source = 'Local $vVar1, $vVar2';
      const parser = new VariableParser(source);
      const variables = parser.parseVariableDeclarations();

      const localVars = variables.filter(v => v.declarationKeyword === 'Local');
      expect(localVars).toHaveLength(2);
      expect(localVars[0].name).toBe('$vVar1');
      expect(localVars[1].name).toBe('$vVar2');
    });

    it('should parse Static variable declarations', () => {
      const source = 'Static $s_vVar1, $s_vVar2';
      const parser = new VariableParser(source);
      const variables = parser.parseVariableDeclarations();

      const staticVars = variables.filter(v => v.declarationKeyword === 'Static');
      expect(staticVars).toHaveLength(2);
      expect(staticVars[0].name).toBe('$s_vVar1');
      expect(staticVars[1].name).toBe('$s_vVar2');
    });
  });

  describe('parseDimDeclarations', () => {
    it('should parse Dim variable declarations', () => {
      const source = 'Dim $vVar1';
      const parser = new VariableParser(source);
      const variables = parser.parseVariableDeclarations();

      const dimVars = variables.filter(v => v.declarationKeyword === 'Dim');
      expect(dimVars).toHaveLength(1);
      expect(dimVars[0].name).toBe('$vVar1');
    });
  });

  describe('parseFunctionParameters', () => {
    it('should parse function parameters as variables', () => {
      const source = 'Func MyFunc($p1, $p2 = 0)\nEndFunc';
      const parser = new VariableParser(source);
      const variables = parser.parseVariableDeclarations();

      const params = variables.filter(v => v.type === 'parameter');
      expect(params).toHaveLength(2);
      expect(params[0].name).toBe('$p1');
      expect(params[1].name).toBe('$p2');
    });
  });
});
