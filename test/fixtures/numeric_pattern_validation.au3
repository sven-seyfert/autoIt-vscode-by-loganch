; Numeric Literal Pattern Test Cases
; Tests for improved numeric literal highlighting with word boundaries

; === HEXADECIMAL (should highlight) ===
$hex1 = 0xFF
$hex2 = 0xABCD
$hex3 = 0x0
$hex4 = 0X123  ; uppercase X
$result = 0xDEADBEEF + 0xCAFE

; === DECIMAL INTEGERS (should highlight) ===
$int1 = 123
$int2 = -456
$int3 = +789
$zero = 0
$calculation = 100 + 200 - 50

; === FLOATING POINT (should highlight) ===
$float1 = 3.14
$float2 = -2.5
$float3 = +1.0
$float4 = .5      ; leading decimal point
$float5 = 123.456
$float6 = 0.0

; === SCIENTIFIC NOTATION (should highlight) ===
$sci1 = 1.5e10
$sci2 = -2.3E-5
$sci3 = 3e+8
$sci4 = 1e0
$sci5 = .5e-10

; === EDGE CASES (should NOT highlight as numbers) ===
$var123 = "identifier"     ; 123 is part of variable name
$name0x = "test"           ; 0x at end of identifier
$test0xFFvar = "invalid"   ; 0xFF embedded in identifier
$string = "0xFF in string" ; 0xFF inside string literal (string rules apply)
$path = "C:\123\test.txt"  ; 123 in string path

; === ARRAYS AND EXPRESSIONS (should highlight appropriately) ===
Global $array[10]          ; 10 should highlight
$array[0] = 100            ; both 0 and 100 should highlight
$array[5] = 0x10           ; both 5 and 0x10 should highlight
$result = ($value * 2.5) + 0xFF  ; 2.5 and 0xFF should highlight

; === FUNCTION CALLS (should highlight) ===
Sleep(1000)                ; 1000 should highlight
For $i = 0 To 10 Step 2    ; 0, 10, 2 should highlight
MsgBox(0, "Title", "Text") ; 0 should highlight

; === BOUNDARY TESTS ===
$test = 123abc             ; Only 123 should highlight, not 'abc'
$val = abc123              ; 123 should NOT highlight (part of identifier)
$result = 1 + 2            ; Both 1 and 2 should highlight separately
$mixed = 0xABC + 123.45e-2 ; Both hex and scientific notation should highlight
