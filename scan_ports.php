<?php
$host = '127.0.0.1';
$user = 'root';
$pass = '';

$ports = [3306, 3307, 3308];
foreach ($ports as $port) {
    try {
        $pdo = new PDO("mysql:host=$host;port=$port", $user, $pass);
        echo "Conectado exitosamente al puerto $port!\n";
        exit;
    } catch (PDOException $e) {
        echo "Error en puerto $port: " . $e->getMessage() . "\n";
    }
}
echo "No se pudo conectar a ningún puerto común.\n";
