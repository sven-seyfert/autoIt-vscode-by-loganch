; Test file for SendKeys syntax highlighting
; This tests the refactored send-keys pattern

; Special literal characters
Send("{!}")    ; Exclamation
Send("{#}")    ; Hash
Send("{+}")    ; Plus
Send("{^}")    ; Caret
Send("{{}}")   ; Braces
Send("{{}")    ; Left brace
Send("{}}")    ; Right brace

; ASC codes
Send("{ASC 065}")     ; 3 digits
Send("{ASC 2709}")    ; 4 digits (Unicode)

; Function keys
Send("{F1}")
Send("{F10}")
Send("{F12}")
Send("{F5 3}")        ; With repeat count

; Single char with modifiers
Send("{A DOWN}")
Send("{S UP}")
Send("{Z down}")      ; Case insensitive

; Modifier keys
Send("{ALTDOWN}")
Send("{SHIFTUP}")
Send("{CTRLDOWN}")
Send("{LWINDOWN}")
Send("{RWINUP}")
Send("{LALTDOWN}")
Send("{RCTRLUP}")

; Browser keys
Send("{BROWSER_BACK}")
Send("{BROWSER_FORWARD}")
Send("{BROWSER_REFRESH}")
Send("{BROWSER_STOP}")
Send("{BROWSER_SEARCH}")
Send("{BROWSER_FAVORITES}")
Send("{BROWSER_HOME}")

; Media keys
Send("{MEDIA_NEXT}")
Send("{MEDIA_PREV}")
Send("{MEDIA_STOP}")
Send("{MEDIA_PLAY_PAUSE}")
Send("{VOLUME_MUTE}")
Send("{VOLUME_DOWN}")
Send("{VOLUME_UP}")

; Launch keys
Send("{LAUNCH_MAIL}")
Send("{LAUNCH_MEDIA}")
Send("{LAUNCH_APP1}")
Send("{LAUNCH_APP2}")

; Navigation keys
Send("{UP}")
Send("{DOWN}")
Send("{LEFT}")
Send("{RIGHT}")
Send("{HOME}")
Send("{END}")
Send("{PGUP}")
Send("{PGDN}")
Send("{HOME 2}")      ; With repeat

; Numpad keys
Send("{NUMPAD0}")
Send("{NUMPAD9}")
Send("{NUMPADMULT}")
Send("{NUMPADADD}")
Send("{NUMPADSUB}")
Send("{NUMPADDIV}")
Send("{NUMPADDOT}")
Send("{NUMPADENTER}")

; Lock and special keys
Send("{NUMLOCK}")
Send("{CAPSLOCK}")
Send("{SCROLLLOCK}")
Send("{BREAK}")
Send("{PAUSE}")
Send("{SLEEP}")
Send("{OEM_102}")

; Common editing keys
Send("{ENTER}")
Send("{TAB}")
Send("{SPACE}")
Send("{BACKSPACE}")
Send("{BS}")
Send("{DELETE}")
Send("{DEL}")
Send("{INSERT}")
Send("{INS}")
Send("{ESCAPE}")
Send("{ESC}")
Send("{TAB 4}")       ; With repeat

; System keys
Send("{PRINTSCREEN}")
Send("{APPSKEY}")
Send("{LWIN}")
Send("{RWIN}")
Send("{LALT}")
Send("{RALT}")
Send("{LCTRL}")
Send("{RCTRL}")
Send("{LSHIFT}")
Send("{RSHIFT}")
Send("{ALT}")
Send("{CTRL}")
Send("{SHIFT}")

; Mixed usage
Send("+{TAB 4}")      ; Shift + Tab 4 times
Send("^{HOME}")       ; Ctrl + Home
Send("!f")            ; Alt + f
Send("{DOWN}{ENTER}") ; Multiple keys

; Variable usage
Local $iCount = 4
Send("+{TAB " & $iCount & "}")

; Edge cases that should still work with fallback
Send("{CUSTOMKEY}")   ; Unknown key should still highlight via fallback
