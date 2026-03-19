#include "map-includes-helper.au3"

Local $mConfig[]
$mConfig.appName = "TestApp"
$mConfig.version = "1.0"

AddConfigKeys($mConfig)

; $mConfig should now have keys from both files
