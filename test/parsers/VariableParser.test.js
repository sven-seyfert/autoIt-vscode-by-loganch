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

  describe('Column position accuracy', () => {
    it('should calculate correct column for Global variables with potential name collisions in comments', () => {
      const source = '; $test comment\nGlobal $test, $value';
      const parser = new VariableParser(source);
      const variables = parser.parseVariableDeclarations();

      const globalVars = variables.filter(v => v.declarationKeyword === 'Global');
      expect(globalVars).toHaveLength(2);
      // $test should be found at position 7 (after "Global "), not at position in comment
      expect(globalVars[0].name).toBe('$test');
      expect(globalVars[0].position.column).toBe(7);
      expect(globalVars[1].name).toBe('$value');
      expect(globalVars[1].position.column).toBe(14); // After "$test, "
    });

    it('should calculate correct column for multiple variables on same line', () => {
      const source = 'Local $first, $second, $third';
      const parser = new VariableParser(source);
      const variables = parser.parseVariableDeclarations();

      expect(variables).toHaveLength(3);
      expect(variables[0].name).toBe('$first');
      expect(variables[0].position.column).toBe(6); // After "Local "
      expect(variables[1].name).toBe('$second');
      expect(variables[1].position.column).toBe(14); // After "$first, "
      expect(variables[2].name).toBe('$third');
      expect(variables[2].position.column).toBe(23); // After "$second, "
    });

    it('should calculate correct column for Dim variables with name in comments', () => {
      const source = '; $data is for storage\nDim $data, $info';
      const parser = new VariableParser(source);
      const variables = parser.parseVariableDeclarations();

      const dimVars = variables.filter(v => v.declarationKeyword === 'Dim');
      expect(dimVars).toHaveLength(2);
      // $data should be at position after "Dim ", not in comment
      expect(dimVars[0].name).toBe('$data');
      expect(dimVars[0].position.column).toBe(4); // After "Dim "
      expect(dimVars[1].name).toBe('$info');
      expect(dimVars[1].position.column).toBe(11); // After "$data, "
    });

    it('should calculate correct column for function parameters with similar names elsewhere', () => {
      const source = '; Function uses $param for testing\nFunc TestFunc($param, $value)\nEndFunc';
      const parser = new VariableParser(source);
      const variables = parser.parseVariableDeclarations();

      const params = variables.filter(v => v.type === 'parameter');
      expect(params).toHaveLength(2);
      // $param should be found in parameter list, not in comment
      expect(params[0].name).toBe('$param');
      expect(params[0].position.line).toBe(1);
      expect(params[0].position.column).toBe(14); // After "Func TestFunc("
      expect(params[1].name).toBe('$value');
      expect(params[1].position.column).toBe(22); // After "$param, "
    });

    it('should handle variables with whitespace variations', () => {
      const source = 'Global  $var1 ,  $var2';
      const parser = new VariableParser(source);
      const variables = parser.parseVariableDeclarations();

      expect(variables).toHaveLength(2);
      expect(variables[0].name).toBe('$var1');
      expect(variables[0].position.column).toBe(8); // After "Global  "
      expect(variables[1].name).toBe('$var2');
      expect(variables[1].position.column).toBe(17); // After "$var1 ,  "
    });
  });
});
