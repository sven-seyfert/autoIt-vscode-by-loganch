; nested include to test recursion (not existing to simulate missing readable)
#include "missing.au3"
Const $CONST_ONE = 1
    Local   $helperVar = 2
; volatile before name
Func volatile HelperFunc($v)
    Return $v
EndFunc