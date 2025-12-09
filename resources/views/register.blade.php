

@section('content')
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
        <x-header_register />


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
            
            <form method="POST" action="{{ route('register') }}">
                @csrf
                
                <div class="input-group">
                    <input type="text" name="name" value="{{ old('name') }}" placeholder="Nombre" required autofocus>
                    @error('name') <span class="error-message">{{ $message }}</span> @enderror
                </div>

                <div class="input-group">
                    <input type="email" name="email" value="{{ old('email') }}" placeholder="Correo Electrónico" required>
                    @error('email') <span class="error-message">{{ $message }}</span> @enderror
                </div>
            
                <div class="input-group">
                    <input type="password" name="password" placeholder="Contraseña" required autocomplete="new-password">
                    @error('password') <span class="error-message">{{ $message }}</span> @enderror
                </div>

                <div class="input-group">
                    <input type="password" name="password_confirmation" placeholder="Repetir Contraseña" required>
                </div>

                <!-- <div class="checkbox-group">
                    <input type="checkbox" id="terms" name="terms" required>
                    <label for="terms">
                        He leído y acepto los <a href="#">términos y condiciones</a>.
                    </label>
                </div> -->
                 @error('terms') <span class="error-message" style="display:block; margin-bottom:15px;">{{ $message }}</span> @enderror

                <button type="submit" class="login-button">
                    REGISTRARSE
                </button>
            </form>

            <div class="bottom-link">
                ¿Ya tienes una cuenta? <a href="{{ route('login') }}">Inicia sesión aquí</a>
            </div>

           
        </div>
    </div>

</body>
</html>

