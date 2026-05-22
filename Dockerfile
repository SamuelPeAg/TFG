FROM php:8.2-fpm

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev

# Limpiar cache de apt para reducir el tamaño de la imagen
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Configurar e instalar extensiones de PHP requeridas para Laravel
# Nota: 'mbstring' ya viene preinstalada y activa en la imagen base de php:8.2, por lo que no es necesario instalarla explícitamente.
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql exif pcntl bcmath gd zip opcache

# Copiar la configuración personalizada de PHP (incluyendo OPcache y optimizaciones)
COPY docker/php/local.ini /usr/local/etc/php/conf.d/local.ini


# Instalar Node.js v20 (para compilar React con Vite)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Instalar Composer desde la imagen oficial
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar el directorio de trabajo dentro del contenedor
WORKDIR /var/www

# Exponer el puerto por defecto de PHP-FPM
EXPOSE 9000

CMD ["php-fpm"]
