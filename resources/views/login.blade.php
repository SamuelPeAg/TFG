<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - Factomove</title>
    
    {{-- Enlace al archivo CSS externo --}}
    <link rel="stylesheet" href="{{ asset('css/principal.css') }}">
</head>
<body>

    <div class="login-wrapper">
        <div class="left-panel">
            <img src="{{ asset('img/logopng.png') }}" alt="Factomove Logo Blanco" class="logo-img">
            <h2>Bienvenido a Factomove</h2>
            <p>Donde cada movimiento cuenta. Inicia sesión para acceder a tu plataforma de gestión.</p>
        </div>

        <div class="right-panel">
            <div class="form-header-logo">
                <img src="{{ asset('img/logopng.png') }}" alt="Factomove Logo"> 
            </div>
            
            <form method="POST" action="{{ route('login') }}">
                @csrf
                
                <div class="input-group">
                    <label for="name">Usuario</label>
                    <input type="text" id="name" name="name" value="{{ old('name') }}" placeholder="Ingresa tu nombre de usuario" required autofocus>
                    @error('name')
                        <span class="error-message">{{ $message }}</span>
                    @enderror
                </div>

                <div class="input-group">
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" name="password" placeholder="Ingresa tu contraseña" required autocomplete="current-password">
                    @error('password')
                        <span class="error-message">{{ $message }}</span>
                    @enderror
                </div>

                <button type="submit" class="login-button">
                    ACCEDER
                </button>
            </form>


            <div class="social-login">
                <p>O inicia sesión con</p>
                <div class="social-buttons">
                    <a href="#" class="social-button">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Google-flutter-logo.png" alt="Google"> Google
                    </a>
                    <a href="#" class="social-button">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" alt="Facebook"> Facebook
                    </a>
                </div>
            </div>
        </div>
    </div>

</body>
</html>


