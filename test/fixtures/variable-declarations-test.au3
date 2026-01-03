; Test file for variable declaration parsing
; This file tests various variable declaration scenarios to ensure
; the VariableParser handles them correctly without infinite loops

; ==========================================
; GLOBAL VARIABLES
; ==========================================
Global $g_DatabaseConnection
Global $g_ConfigPath
Global $g_UserSettings

; ==========================================
; DIM DECLARATIONS (Global scope at script level)
; ==========================================
Dim $dimVariable1
Dim $dimVariable2

; ==========================================
; STATIC VARIABLES (Global context)
; ==========================================
Static $s_Counter
Static $s_LastValue

; ==========================================
; FUNCTION WITH LOCAL VARIABLES
; ==========================================
Func TestLocalVariables($param1, $param2 = "default")
    Local $localVar1
    Local $localVar2
    Local $result

    ; Test with Dim inside function (should be local scope)
    Dim $dimInsideFunc

    ; Static variable inside function
    Static $staticCounter = 0
    $staticCounter += 1

    $result = $param1 & $param2
    Return $result
EndFunc

; ==========================================
; FUNCTION WITH MULTIPLE PARAMETERS
; ==========================================
Func ProcessData($input, $mode, $flags = 0, $callback = Null)
    Local $output
    Local $tempData
    Local $errorCode

    Global $g_ProcessCount ; Global declared inside function
    $g_ProcessCount += 1

    Return $output
EndFunc

; ==========================================
; HELPER FUNCTION
; ==========================================
Func InnerFunction($innerParam)
    Local $innerVar
    Static $innerStatic

    Return $innerParam * 2
EndFunc

; ==========================================
; FUNCTION CALLING OTHER FUNCTIONS
; ==========================================
Func OuterFunction($value)
    Local $outerVar

    $outerVar = InnerFunction($value)
    Return $outerVar
EndFunc

; ==========================================
; VOLATILE FUNCTION
; ==========================================
Volatile Func VolatileTest($x, $y)
    Local $volatileVar
    Return $x + $y
EndFunc

; ==========================================
; EDGE CASES
; ==========================================

; Variable with underscores
Global $g_My_Variable_Name

; Variable with numbers
Local $var123test

; Whitespace variations
Global   $g_ExtraSpaces
Local	$l_TabIndented
Dim    $dimMultipleSpaces

; Comments should be ignored
; Global $commentedOut
; Local $alsoCommented

; Inline comments
Global $g_InlineComment ; This is a comment

; ==========================================
; ASSIGNMENT VARIATIONS
; ==========================================
Global $g_WithAssignment = "test"
Local $l_WithNumber = 42
Dim $dimWithArray[10]

; ==========================================
; MAIN SCRIPT
; ==========================================
$result1 = TestLocalVariables("Hello", "World")
$result2 = ProcessData("data", 1)
$result3 = OuterFunction(5)
$result4 = VolatileTest(10, 20)

ConsoleWrite("Test completed" & @CRLF)