<?php

//include 'ChromePhp.php';
$json = json_encode($_POST);

$MyApplicationId = 'aO7qIhUq9uxg9B49yDpynbyJFY6Fs6LpkQsdH6Qd';
$MyParseRestAPIKey = 'y8r4nCbNZhC6fOBCruudnNpdaUuJoUvZJkyCWqi1';
$MyAccessToken='u2y3gqrp13zzg1zt66fxgnqrc';

$url = "https://api.parse.com/1/functions/ComputeTariff";
$headers = array(
    "Content-Type: application/json",
    "X-Parse-Application-Id: " . $MyApplicationId,
    "X-Parse-REST-API-Key: " . $MyParseRestAPIKey
);

    $handle = curl_init();
    curl_setopt($handle, CURLOPT_URL, $url);
    curl_setopt($handle, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($handle, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($handle, CURLOPT_POST, true);
    curl_setopt($handle, CURLOPT_POSTFIELDS, $json);

    $data = curl_exec($handle);
    curl_close($handle);
    print $data;

?>