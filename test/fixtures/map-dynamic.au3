; Dynamic keys
Local $mData[]
Local $keyName = "dynamicKey1"
Local $anotherKey = "dynamicKey2"

$mData.staticKey = "static value"
$mData[$keyName] = "dynamic value 1"
$mData[$anotherKey] = "dynamic value 2"
$mData["quoted"] = "quoted value"
