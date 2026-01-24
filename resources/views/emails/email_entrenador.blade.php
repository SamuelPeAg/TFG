<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Completa tu registro - Factomove</title>
    <style>
        /* Reset de estilos para clientes de email */
        body, table, td, a {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }
        body {
            margin: 0;
            padding: 0;
            width: 100% !important;
            height: 100% !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7f9;
        }
        
        /* Estilos principales */
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .logo {
            max-width: 180px;
            height: auto;
        }
        .content {
            padding: 40px 30px;
            color: #333333;
            line-height: 1.6;
        }
        .greeting {
            font-size: 28px;
            font-weight: bold;
            color: #00897b;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #555555;
            margin-bottom: 30px;
        }
        .cta-button {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 50px;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0, 137, 123, 0.3);
            transition: all 0.3s ease;
        }
        .cta-button:hover {
            box-shadow: 0 6px 20px rgba(0, 137, 123, 0.4);
            transform: translateY(-2px);
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            color: #888888;
            font-size: 14px;
            border-top: 1px solid #e0e0e0;
        }
        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #00897b, transparent);
            margin: 30px 0;
        }
        .warning-text {
            font-size: 14px;
            color: #999999;
            margin-top: 30px;
            padding: 15px;
            background-color: #f8f9fa;
            border-left: 4px solid #00897b;
            border-radius: 4px;
        }
        
        /* Responsive */
        @media only screen and (max-width: 600px) {
            .content {
                padding: 30px 20px !important;
            }
            .greeting {
                font-size: 24px !important;
            }
            .message {
                font-size: 15px !important;
            }
            .cta-button {
                padding: 14px 30px !important;
                font-size: 16px !important;
            }
        }
    </style>
</head>
<body>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
            <td style="padding: 20px 0;">
                <table class="email-container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    
                    
                    
                    <!-- Contenido Principal -->
                    <tr>
                        <td class="content">
                            <h1 class="greeting">¡Hola, {{ $nombre }}! 👋</h1>
                            
                            <p class="message">
                                Nos alegra tenerte en el equipo de <strong>Factomove</strong>. Has sido registrado como entrenador en nuestra plataforma.
                            </p>
                            
                            <p class="message">
                                Para completar tu registro y activar tu cuenta, solo necesitas hacer clic en el botón de abajo:
                            </p>
                            
                            <div class="button-container">
                                <a href="{{ $url }}" class="cta-button" target="_blank">
                                    ✓ Completar mi Registro
                                </a>
                            </div>
                            
                            <div class="divider"></div>
                            
                            <p class="message" style="font-size: 14px;">
                                Si el botón no funciona, copia y pega este enlace en tu navegador:
                                <br>
                                <a href="{{ $url }}" style="color: #00897b; word-break: break-all;">{{ $url }}</a>
                            </p>
                            
                            <div class="warning-text">
                                <strong>⚠️ Nota importante:</strong> Si no solicitaste este registro, puedes ignorar este correo de forma segura.
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td class="footer">
                            <p style="margin: 0 0 10px 0;">
                                <strong>Factomove</strong> - Tu plataforma de entrenamiento
                            </p>
                            <p style="margin: 0; font-size: 12px;">
                                Este es un correo automático, por favor no respondas a este mensaje.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
