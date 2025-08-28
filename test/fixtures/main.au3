#include "helper.au3"
#include <Array.au3>
Local $a, $b = 1, _
    $c
Global $Mixed_Name123 = 0
; function with volatile after name
    Func DoWork volatile($x, $y)
        Return $x + $y
    EndFunc
; function normal
Func NormalFunc($p)
    Return $p
EndFunc