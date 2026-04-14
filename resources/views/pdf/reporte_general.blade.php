<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>{{ $titulo ?? 'Reporte de Facturación' }} - FACTOMOVE</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #1e293b; line-height: 1.6; font-size: 12px; margin: 0; padding: 20px; }
        .header { margin-bottom: 30px; border-bottom: 4px solid #38C1A3; padding-bottom: 20px; }
        .logo-table { width: 100%; border: none; }
        .logo-td-img { width: 50px; border: none; vertical-align: middle; padding: 0; }
        .logo-td-text { border: none; vertical-align: middle; padding: 0 0 0 10px; }
        .logo-img { width: 45px; height: auto; display: block; }
        .logo-text { font-size: 32px; font-weight: 900; letter-spacing: -1.5px; line-height: 1; }
        .company-info { margin-top: 15px; }
        .report-info { float: right; width: 35%; text-align: right; }
        .clear { clear: both; }
        
        .title-box { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 30px; }
        .report-title { font-size: 20px; font-weight: 900; color: #334155; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
        .report-subtitle { font-size: 13px; color: #64748b; margin-top: 5px; }

        table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 30px; }
        thead { display: table-header-group; }
        th { background: #38C1A3; color: white; text-align: left; padding: 12px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 900; }
        th:first-child { border-top-left-radius: 8px; }
        th:last-child { border-top-right-radius: 8px; }
        td { padding: 10px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
        tr:nth-child(even) td { background-color: #fbfdfe; }
        
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-bottom: 20px; }
        
        .total-section { float: right; width: 250px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 2px solid #38C1A3; margin-top: 20px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .total-label { font-weight: bold; color: #64748b; }
        .total-value { font-weight: 900; color: #0f172a; font-size: 16px; text-align: right; }
        
        .badge { display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
        .badge-info { background: #e0f2fe; color: #0369a1; }
        
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .bold { font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <table class="logo-table">
            <tr>
                <td class="logo-td-img">
                    <img src="{{ public_path('img/logopng.png') }}" class="logo-img">
                </td>
                <td class="logo-td-text">
                    <div class="logo-text">
                        <span style="color: #0f172a;">FACTO</span><span style="color: #38C1A3;">MOVE</span>
                    </div>
                </td>
                <td style="text-align: right; border: none; vertical-align: top;">
                    <div style="font-size: 14px; font-weight: 900; color: #0f172a;">REPORTE CORPORATIVO</div>
                    <div style="color: #64748b; margin-top: 5px; font-size: 12px;">Fecha: <strong>{{ date('d/m/Y') }}</strong></div>
                    <div style="color: #64748b; font-size: 12px;">Ref: <strong>EXP-{{ date('Ymd') }}-{{ rand(100, 999) }}</strong></div>
                </td>
            </tr>
        </table>
        
        <div class="company-info">
            <div style="margin-top: 5px; font-size: 14px; color: #334155;"><strong>Moverte da Vida S.L.</strong></div>
            <div style="color: #64748b; font-size: 11px;">NIF: B-12345678 | Av. del Deporte, 45, Córdoba</div>
            <div style="color: #64748b; font-size: 11px;">contacto@factomove.es | www.factomove.es</div>
        </div>
    </div>

    <div class="title-box">
        <h1 class="report-title">{{ $titulo }}</h1>
        <div class="report-subtitle">
            Periodo: <strong>{{ $periodo }}</strong> | 
            Centro: <strong>{{ $centro }}</strong> | 
            Nº Registros: <strong>{{ count($items) }}</strong>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                @foreach($columnas as $col)
                    <th @if(str_contains(strtolower($col), 'importe') || str_contains(strtolower($col), 'total')) class="text-right" @endif>{{ $col }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($items as $item)
            <tr>
                @foreach($item as $key => $value)
                    <td @if(str_contains(strtolower($key), 'importe') || str_contains(strtolower($key), 'total')) class="text-right bold" @endif>
                        @if(str_contains(strtolower($key), 'importe') || str_contains(strtolower($key), 'total'))
                            {{ number_format((float)$value, 2) }} €
                        @else
                            {{ $value }}
                        @endif
                    </td>
                @endforeach
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="total-section">
        <div style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Resumen Total Acumulado</div>
        <div class="total-value">{{ number_format($total, 2) }} €</div>
        <div style="font-size: 9px; color: #94a3b8; margin-top: 5px; font-style: italic;">
            * Los importes incluyen los impuestos correspondientes según el régimen aplicable.
        </div>
    </div>
    <div class="clear"></div>

    <div style="margin-top: 50px; background: #fdf2f2; padding: 15px; border-radius: 8px; font-size: 10px; color: #991b1b; border: 1px solid #fecaca;">
        <strong>AVISO IMPORTANTE:</strong> Este documento es un resumen de transacciones para control interno y soporte administrativo. No sustituye la validez legal de las facturas individuales emitidas para cada cliente final, las cuales deben ser gestionadas de acuerdo a la normativa vigente.
    </div>

    <div class="footer">
        Este documento ha sido generado por el Sistema de Gestión de Facturación FACTOMOVE.<br>
        &copy; {{ date('Y') }} Moverte da Vida S.L. - Todos los derechos reservados.
    </div>
</body>
</html>
