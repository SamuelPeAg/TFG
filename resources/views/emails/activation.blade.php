<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Activa tu cuenta en Factomove</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 0;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <tr>
            <td style="padding: 40px 40px 0; text-align: center;">
                <h2 style="color: #0f172a; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.025em;">¡Bienvenido a Factomove!</h2>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px 40px 40px; text-align: center;">
                <p style="color: #64748b; font-size: 16px; font-weight: 500; line-height: 24px; margin: 0;">Estamos encantados de que te unas a nosotros, {{ $user->name }}.</p>
                <p style="color: #64748b; font-size: 16px; font-weight: 500; line-height: 24px; margin: 20px 0 0;">Para poder acceder a tu cuenta, necesitas establecer una contraseña segura:</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
                <a href="{{ $url }}" style="display: inline-block; background-color: #38C1A3; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 16px 32px; border-radius: 16px; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 0 10px 15px -3px rgba(56, 193, 163, 0.2);">Establecer Contraseña</a>
            </td>
        </tr>
        <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; font-weight: 500; line-height: 18px; margin: 0;">Si no solicitaste este registro, simplemente ignora este mensaje.</p>
                <p style="color: #94a3b8; font-size: 12px; font-weight: 500; line-height: 18px; margin: 10px 0 0;">Este enlace expirará en 24 horas.</p>
            </td>
        </tr>
    </table>
</body>
</html>
