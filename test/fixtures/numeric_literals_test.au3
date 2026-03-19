; Test file for numeric literal highlighting
; Should highlight correctly:
Local $hex1 = 0xFF
Local $hex2 = 0xABCD1234
Local $hex3 = 0x0
Local $decimal1 = 123
Local $decimal2 = -456
Local $decimal3 = +789
Local $float1 = 3.14
Local $float2 = -2.5
Local $float3 = .5
Local $float4 = 123.456
Local $scientific1 = 1.5e10
Local $scientific2 = -2.3E-5
Local $scientific3 = 3e+8

; Should NOT highlight (edge cases):
Local $var123a = "test"  ; 123a should not be highlighted as separate number
Local $name0x = "test"   ; 0x at end of identifier should not highlight
Local $test = "string0xFF"  ; 0xFF inside string should be handled by string rules
