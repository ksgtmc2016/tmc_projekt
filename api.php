<?php
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(0);

if(isset($_GET['a']) && isset($_GET['b']) && isset($_GET['c']) && isset($_GET['d']) && isset($_GET['e']) && isset($_GET['f']))
{
    $flat = $_GET['a'];
    $flon = $_GET['b'];
    $tlat = $_GET['c'];
    $tlon = $_GET['d'];

    echo file_get_contents('http://www.yournavigation.org/api/1.0/gosmore.php?format=geojson&flat=' . $flat . '&flon=' . $flon . '&tlat=' . $tlat . '&tlon=' . $tlon . '&v=bicycle&fast=' . $f . '&layer=mapnik&lang=pl&instructions=1');
}
?>