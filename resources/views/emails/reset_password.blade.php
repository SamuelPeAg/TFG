<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Restablecer contraseña - Factomove</title>
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f9; }

        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #00897b 0%, #00695c 100%); padding: 40px 20px; text-align: center; }
        .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
        .greeting { font-size: 28px; font-weight: bold; color: #00897b; margin-bottom: 20px; }
        .message { font-size: 16px; color: #555555; margin-bottom: 18px; }
        .cta-button {
            display: inline-block; padding: 16px 40px;
            background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
            color: #ffffff !important; text-decoration: none; border-radius: 50px;
            font-size: 18px; font-weight: bold; text-align: center;
            box-shadow: 0 4px 15px rgba(0, 137, 123, 0.3);
        }
        .button-container { text-align: center; margin: 26px 0; }
        .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #888888; font-size: 14px; border-top: 1px solid #e0e0e0; }
        .divider { height: 1px; background: linear-gradient(to right, transparent, #00897b, transparent); margin: 30px 0; }
        .warning-text { font-size: 14px; color: #999999; margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #00897b; border-radius: 4px; }
        @media only screen and (max-width: 600px) {
            .content { padding: 30px 20px !important; }
            .greeting { font-size: 24px !important; }
            .message { font-size: 15px !important; }
            .cta-button { padding: 14px 30px !important; font-size: 16px !important; }
        }
    </style>
</head>
<body>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
        <td style="padding: 20px 0;">
            <table class="email-container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">

                <tr>
                    <td class="content">
                        <h1 class="greeting">¡Hola{{ $nombre ? ', '.$nombre : '' }}! 👋</h1>

                        <p class="message">
                            Hemos recibido una solicitud para <strong>restablecer tu contraseña</strong> en <strong>Factomove</strong>.
                        </p>

                        <p class="message">
                            Haz clic en el botón para crear una nueva contraseña:
                        </p>

                        <div class="button-container">
                            <a href="{{ $url }}" class="cta-button" target="_blank">
                                🔒 Restablecer contraseña
                            </a>
                        </div>

                        <div class="divider"></div>

                        <p class="message" style="font-size: 14px;">
                            Si el botón no funciona, copia y pega este enlace en tu navegador:
                            <br>
                            <a href="{{ $url }}" style="color: #00897b; word-break: break-all;">{{ $url }}</a>
                        </p>

                        <div class="warning-text">
                            <strong>⚠️ Importante:</strong> Este enlace caduca en {{ $expire ?? 60 }} minutos.
                            Si no solicitaste el cambio, ignora este correo.
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="footer">
                        <p style="margin: 0 0 10px 0;"><strong>Factomove</strong> - Tu plataforma de entrenamiento</p>
                        <p style="margin: 0; font-size: 12px;">Este es un correo automático, por favor no respondas a este mensaje.</p>
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>
</body>
</html>
