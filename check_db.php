<?php
$host = '127.0.0.1';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host", $user, $pass);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS tfg");
    echo "Base de datos 'tfg' verificada/creada exitosamente.\n";
} catch (PDOException $e) {
    echo "Error al conectar: " . $e->getMessage() . "\n";
}
