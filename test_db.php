<?php
$host = 'localhost';
$user = 'davante25_daw16';
$pass = 'davante25_daw16';
$db   = 'davante25_daw16';

echo "Probando conexión a $host...\n";
$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("ERROR DE CONEXIÓN: " . $conn->connect_error . "\n");
}
echo "¡CONEXIÓN EXITOSA!\n";
$conn->close();
