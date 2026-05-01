<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$req = Illuminate\Http\Request::create('/suscripciones', 'GET');
$req->headers->set('Accept', 'application/json');
$res = app()->make('App\Http\Controllers\SuscripcionController')->index($req);
echo json_encode($res->getData());
