<?php
try {
    $pdo = new PDO("mysql:host=localhost", "root", "");
    echo "Conectado exitosamente usando localhost!\n";
} catch (PDOException $e) {
    echo "Error usando localhost: " . $e->getMessage() . "\n";
}
