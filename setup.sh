#!/bin/bash

# Asegurar que el script se detenga ante cualquier error
set -e

echo "=== INICIANDO DOCKERIZACIÓN DE LA APLICACIÓN ==="

# 1. Levantar los contenedores en segundo plano
echo "Levantando contenedores de Docker (app, db, web)..."
docker-compose up -d --build

# 2. Espera inteligente para la base de datos MySQL
echo "Esperando a que la base de datos MySQL esté lista y acepte conexiones..."
until docker-compose exec -T app php -r "
try {
    \$pdo = new PDO('mysql:host=db;port=3306;dbname=davante25_daw16', 'root', 'root');
    exit(0);
} catch (Exception \$e) {
    exit(1);
}
" &> /dev/null; do
    echo -n "."
    sleep 2
done
echo ""
echo "¡Base de datos en línea y lista para operar!"

# 3. Instalar dependencias de Composer
echo "Instalando dependencias de Composer dentro del contenedor..."
docker-compose exec -T app composer install --no-interaction --prefer-dist --optimize-autoloader

# 4. Instalar dependencias de npm y compilar assets de React (Vite)
echo "Instalando dependencias de Node.js (npm)..."
docker-compose exec -T app npm install

echo "Compilando assets de React con Vite (npm run build)..."
docker-compose exec -T app npm run build

# 5. Generar la clave de la aplicación Laravel
echo "Generando clave de la aplicación Laravel..."
docker-compose exec -T app php artisan key:generate --ansi

# 6. Ejecutar migraciones y seeders
echo "Ejecutando migraciones y seeders en la base de datos..."
docker-compose exec -T app php artisan migrate:fresh --seed --force

echo "=== ¡INSTALACIÓN Y DOCKERIZACIÓN COMPLETADA CON ÉXITO! ==="
echo "Puedes acceder a la aplicación en: http://localhost:8000"
echo "El servidor de desarrollo de Vite está listo en el puerto 5173"
