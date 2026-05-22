Write-Host "=== INICIANDO DOCKERIZACIÓN DE LA APLICACIÓN (WINDOWS) ===" -ForegroundColor Cyan

# 1. Levantar los contenedores en segundo plano
Write-Host "Levantando contenedores de Docker (app, db, web)..." -ForegroundColor Yellow
docker-compose up -d --build

# 2. Espera inteligente para la base de datos MySQL
Write-Host "Esperando a que la base de datos MySQL esté lista y acepte conexiones..." -ForegroundColor Yellow
$dbReady = $false
while (-not $dbReady) {
    # Ejecutamos el comprobador de conexión PHP PDO dentro del contenedor app
    # Escapamos la variable PHP con ` para que PowerShell no la interprete como suya
    $null = docker-compose exec -T app php -r "
    try {
        new PDO('mysql:host=db;port=3306;dbname=mi_base_de_datos', 'root', 'root');
        exit(0);
    } catch (Exception `$e) {
        exit(1);
    }
    " 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        $dbReady = $true
    } else {
        Write-Host -NoNewline "."
        Start-Sleep -Seconds 2
    }
}
Write-Host ""
Write-Host "¡Base de datos en línea y lista para operar!" -ForegroundColor Green

# 3. Instalar dependencias de Composer
Write-Host "Instalando dependencias de Composer dentro del contenedor..." -ForegroundColor Yellow
docker-compose exec -T app composer install --no-interaction --prefer-dist --optimize-autoloader

# 4. Instalar dependencias de npm y compilar assets de React (Vite)
Write-Host "Instalando dependencias de Node.js (npm)..." -ForegroundColor Yellow
docker-compose exec -T app npm install

Write-Host "Compilando assets de React con Vite (npm run build)..." -ForegroundColor Yellow
docker-compose exec -T app npm run build

# 5. Generar la clave de la aplicación Laravel
Write-Host "Generando clave de la aplicación Laravel..." -ForegroundColor Yellow
docker-compose exec -T app php artisan key:generate --ansi

# 6. Ejecutar migraciones y seeders
Write-Host "Ejecutando migraciones y seeders en la base de datos..." -ForegroundColor Yellow
docker-compose exec -T app php artisan migrate:fresh --seed --force

Write-Host "=== ¡INSTALACIÓN Y DOCKERIZACIÓN COMPLETADA CON ÉXITO! ===" -ForegroundColor Green
Write-Host "Puedes acceder a la aplicación en: http://localhost:8000" -ForegroundColor Cyan
Write-Host "El servidor de desarrollo de Vite está listo en el puerto 5173" -ForegroundColor Cyan
