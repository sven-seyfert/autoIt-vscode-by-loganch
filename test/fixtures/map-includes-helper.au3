; Helper file with Map keys
Func AddConfigKeys(ByRef $config)
    $config.apiEndpoint = "https://api.example.com"
    $config.timeout = 5000
    $config.retries = 3
EndFunc
