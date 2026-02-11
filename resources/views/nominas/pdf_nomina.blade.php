<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Nómina - {{ $user->name }} - {{ $mes_nombre }} {{ $nomina->anio }}</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.5; font-size: 12px; }
        .header { margin-bottom: 30px; border-bottom: 2px solid #4BB7AE; padding-bottom: 10px; }
        .logo { font-size: 24px; font-weight: bold; color: #4BB7AE; }
        .company-info { float: left; width: 50%; }
        .employee-info { float: right; width: 45%; text-align: right; }
        .clear { clear: both; }
        .section-title { background: #f4f4f4; padding: 5px 10px; font-weight: bold; margin: 20px 0 10px 0; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #4BB7AE; color: white; text-align: left; padding: 8px; font-size: 10px; }
        td { padding: 8px; border-bottom: 1px solid #eee; }
        .text-right { text-align: right; }
        .totals-table { width: 300px; margin-left: auto; }
        .totals-table td { border: none; }
        .totals-table td.label { font-weight: bold; }
        .totals-table tr.grand-total td { border-top: 2px solid #EF5D7A; color: #EF5D7A; font-size: 16px; font-weight: bold; padding-top: 10px; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
        .badge-paid { background: #e6fffa; color: #38b2ac; }
        .badge-pending { background: #fffaf0; color: #ed8936; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            <div class="logo">FACTOMOVE</div>
            <div><strong>Moverte da Vida S.L.</strong></div>
            <div>Gestión de Centros de Entrenamiento</div>
            <div>Córdoba, España</div>
        </div>
        <div class="employee-info">
            <div><strong>{{ $user->name }}</strong></div>
            <div>DNI/NIE: {{ $user->dni ?? 'N/A' }}</div>
            <div>IBAN: {{ $user->iban ?? 'N/A' }}</div>
            <div style="margin-top: 10px;">
                <strong>Período:</strong> {{ $mes_nombre }} {{ $nomina->anio }}<br>
                <strong>Estado:</strong> 
                <span class="badge {{ $nomina->estado_nomina == 'pagado' ? 'badge-paid' : 'badge-pending' }}">
                    {{ $nomina->estado_nomina == 'pagado' ? 'PAGADO' : 'PENDIENTE' }}
                </span>
            </div>
        </div>
        <div class="clear"></div>
    </div>

    <div class="section-title">Detalle de Sesiones y Clases</div>
    <table>
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Clase / Tipo</th>
                <th>Centro</th>
                <th class="text-right">Duración</th>
            </tr>
        </thead>
        <tbody>
            @if(isset($detalles['sesiones']) && !empty($detalles['sesiones']))
                @foreach($detalles['sesiones'] as $sesion)
                <tr>
                    <td>{{ $sesion['fecha'] }}</td>
                    <td>{{ $sesion['hora'] }}</td>
                    <td>{{ $sesion['clase'] }}</td>
                    <td>{{ $sesion['centro'] }}</td>
                    <td class="text-right">{{ $sesion['duracion'] }} min</td>
                </tr>
                @endforeach
            @else
                <tr>
                    <td colspan="5" style="text-align: center; color: #999; font-style: italic;">No hay desglose detallado disponible para este período.</td>
                </tr>
            @endif
        </tbody>
    </table>

    <div class="section-title">Resumen Económico</div>
    <div class="totals-table">
        <table>
            <tr>
                <td class="label">Total Horas Trabajadas:</td>
                <td class="text-right">{{ $detalles['horas_trabajadas'] }} h</td>
            </tr>
            <tr>
                <td class="label">Salario Bruto:</td>
                <td class="text-right">{{ number_format($detalles['salario_bruto'], 2) }} €</td>
            </tr>
            <tr>
                <td class="label">Deducción SS Trabajador ({{ $detalles['porcentajes']['ss_trab'] }}%):</td>
                <td class="text-right" style="color: #e53e3e;">-{{ number_format($detalles['ss_trabajador'], 2) }} €</td>
            </tr>
            <tr>
                <td class="label">Retención IRPF ({{ $detalles['porcentajes']['irpf'] }}%):</td>
                <td class="text-right" style="color: #e53e3e;">-{{ number_format($detalles['irpf'], 2) }} €</td>
            </tr>
            
            @if(isset($detalles['extras']) && !empty($detalles['extras']))
                @foreach($detalles['extras'] as $extra)
                <tr>
                    <td class="label">{{ $extra['concepto'] }}:</td>
                    <td class="text-right" style="color: #38b2ac;">+{{ number_format($extra['importe'], 2) }} €</td>
                </tr>
                @endforeach
            @endif

            <tr class="grand-total">
                <td class="label">TOTAL NETO A PERCIBIR:</td>
                <td class="text-right">{{ number_format($nomina->importe, 2) }} €</td>
            </tr>
        </table>
    </div>

    <div style="margin-top: 50px;">
        <div style="float: left; width: 45%; border-top: 1px solid #ccc; text-align: center; padding-top: 10px;">
            Firma Empresa
        </div>
        <div style="float: right; width: 45%; border-top: 1px solid #ccc; text-align: center; padding-top: 10px;">
            Firma Empleado
        </div>
        <div class="clear"></div>
    </div>

    <div class="footer">
        Este documento es un justificante de pago generado por FACTOMOVE para Moverte da Vida S.L.<br>
        Generado el {{ date('d/m/Y H:i') }}
    </div>
</body>
</html>
