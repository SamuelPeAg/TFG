# 🐳 Factomove Gym - Guía Definitiva de Instalación (Con Docker)

Este proyecto está completamente dockerizado. Esta guía está diseñada **para principiantes** y te llevará paso a paso para que puedas levantar el proyecto en cualquier PC sin necesidad de configurar PHP, Node.js, Composer o MySQL a mano.

---

## 🚨 1. Requisitos Previos MUY Importantes

Antes de hacer nada, asegúrate de cumplir esto al 100%:

1. **Tener instalado Docker Desktop**.
2. **¡ABRIR DOCKER DESKTOP!** 
   * *Error común:* Intentar instalar todo sin abrir la aplicación de Docker. Te dará un error diciendo `open //./pipe/dockerDesktopLinuxEngine: El sistema no puede encontrar el archivo especificado`. 
   * *Solución:* Abre la app Docker Desktop y espera a que abajo a la izquierda salga el icono verde de "Engine running" (Motor en ejecución).
3. **Apagar WAMP, XAMPP o Laragon**.
   * *Error común:* Si tienes WAMP o XAMPP abierto, el puerto de la base de datos (3306) estará ocupado. Te saldrá un error de Docker diciendo `Ports are not available: exposing port TCP 0.0.0.0:3306`.
   * *Solución:* Cierra por completo WAMP/XAMPP antes de empezar (botón derecho en el icono de la barra de tareas -> Salir).

> ⚠️ **ADVERTENCIA: ¿Qué tienes que instalar TÚ y qué instala EL SCRIPT?**
> Para evitar confusiones, es vital que entiendas esto:
> - **Lo ÚNICO que tú tienes que instalar en tu ordenador es: Docker Desktop y Git.** (Nada más).
> - **NO tienes que instalar PHP.** (El script descarga un contenedor con PHP 8.2).
> - **NO tienes que instalar Composer.** (El script lo ejecuta en un contenedor temporal para descargar las librerías).
> - **NO tienes que instalar Node.js ni NPM.** (El script usa un contenedor de Node para instalar React, Vite y Tailwind).
> - **NO tienes que instalar MySQL.** (El script crea un servidor de MySQL aislado y limpio para este proyecto).
> Si instalas esas cosas en tu PC, solo conseguirás generar conflictos y dolores de cabeza. ¡Deja que Docker haga el trabajo sucio!

---

## ⚙️ 2. Preparar el archivo de configuración (.env)

El archivo `.env` es el DNI de la aplicación. **NO debes saltarte este paso.**

1. En la carpeta raíz del proyecto, debes tener un archivo llamado `.env` (si solo tienes `.env.example`, haz una copia y llámala `.env`).
2. Abre tu archivo `.env` y asegúrate de que **los datos de conexión a la base de datos coincidan exactamente con los que espera el proyecto** (si trabajas en equipo, pídele el `.env` actualizado a tu compañero).
   
   La configuración típica en Docker suele ser así:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=db
   DB_PORT=3306
   DB_DATABASE=davante25_daw16  # <-- Asegúrate de que el nombre sea correcto
   DB_USERNAME=root
   DB_PASSWORD=root             # <-- O la contraseña que use vuestro equipo
   ```
   * *Error común:* Si los datos no coinciden, el instalador fallará al final al intentar crear las tablas (dará un error `SQLSTATE[HY000] [1045] Access denied...`) y **la página web se quedará en blanco**.

---

## 🚀 3. Pasos para la Instalación Automática

Con Docker abierto y tu `.env` listo, abre una terminal en la carpeta del proyecto y ejecuta el script según tu sistema:

### En Windows (PowerShell) 🪟
1. Abre **PowerShell** en la raíz del proyecto.
2. Ejecuta el script:
   ```powershell
   .\setup.ps1
   ```
   > 💡 **Nota**: Si PowerShell te bloquea y da letras rojas por políticas de seguridad, ejecuta primero este comando: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` y luego vuelve a lanzar `.\setup.ps1`.

### En Linux / macOS / Git Bash (Unix) 🐧🍎
1. Abre tu terminal.
2. Dale permisos y ejecútalo:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

---

## 🕒 4. ¡Paciencia durante la instalación! (Cosas normales que pueden pasar)

Mientras el script se ejecuta, descargará medio Internet. Es normal que tarde, pero ten en cuenta esto:

* 🐌 **¿Se ha quedado atascado al 99% (136/137) en Composer?**
  * *Por qué pasa:* Esto es súper común en Windows. Composer está descomprimiendo miles de archivos pequeños y **Windows Defender (el antivirus)** se vuelve loco analizándolos uno a uno, lo que frena el proceso.
  * *Solución:* ¡Espera! Vete a tomar un café, terminará. Si pasan más de 15 minutos y sigue igual, pulsa `Ctrl + C` para cancelar y vuelve a ejecutar el script `.\setup.ps1`. La segunda vez usará la caché y tardará 2 segundos.
* ⏳ **¿Está un buen rato en `transforming...` con Vite?**
  * Es normal. Está traduciendo todo el código de React. Tarda un par de minutos, déjalo trabajar.

---

## 🌐 5. ¡A jugar! ¿Cómo ver la aplicación?

Cuando el script termine y te diga `INSTALACIÓN COMPLETADA CON ÉXITO`, ve a tu navegador y entra en:

👉 **[http://localhost:8000](http://localhost:8000)**

### 👻 Problema: ¡Terminó con éxito pero la página se ve toda en blanco!

Si entras a `localhost:8000`, la pestaña carga pero no se ve absolutamente NADA, lo más probable es que se haya quedado un archivo "fantasma" que bloquea el diseño.

* *Por qué pasa:* Alguien del equipo subió sin querer a Git un archivo llamado `hot` en la carpeta `public`. Ese archivo le dice a Laravel que estás programando en vivo (y como no lo estás, bloquea todo).
* *Solución:* Ve a la carpeta `public` de tu proyecto y **busca un archivo que se llame exactamente `hot` (sin extensión) y BÓRRALO**. Refresca la página en tu navegador (F5) y ¡magia!, aparecerá el diseño.

---
