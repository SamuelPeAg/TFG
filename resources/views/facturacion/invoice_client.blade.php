<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Factura_{{ $cliente->name ?? 'Cliente' }}_{{ date('Ymd') }}</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; margin: 0; padding: 40px; line-height: 1.6; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ef5d7a; padding-bottom: 20px; margin-bottom: 40px; }
        .logo { font-size: 32px; font-weight: 900; color: #111827; }
        .logo span { color: #ef5d7a; } /* Brand Coral for Clients */
        
        .client-info { margin-bottom: 40px; background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #ef5d7a; }
        .client-info h3 { margin: 0 0 10px 0; color: #ef5d7a; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
        .client-info p { margin: 0; font-weight: bold; font-size: 16px; }

        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; color: #6b7280; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        th { text-align: left; padding: 15px; background: #ef5d7a; color: white; font-size: 12px; text-transform: uppercase; }
        td { padding: 15px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
        tr:nth-child(even) { background-color: #fafafa; }

        .total-section { text-align: right; margin-top: 20px; }
        .total-label { font-size: 14px; color: #6b7280; margin-right: 15px; }
        .total-amount { font-size: 32px; font-weight: 900; color: #111827; }

        .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        
        @media print {
            .no-print { display: none; }
            body { padding: 0; }
        }
    </style>
</head>
<body>
    <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #ef5d7a; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">
            <i class="fa-solid fa-print"></i> Imprimir / Guardar PDF
        </button>
    </div>

    <div class="header">
        <div class="logo">Facto<span>move</span></div>
        <div style="text-align: right;">
            <h1 style="margin: 0; font-size: 24px; color: #374151;">FACTURA</h1>
            <p style="margin: 5px 0 0; color: #9ca3af; font-size: 14px;">#FAC-{{ date('Y') }}-{{ strtoupper(substr($cliente->id ?? 'UNK', 0, 5)) }}</p>
        </div>
    </div>

    <div class="invoice-details">
        <div>
            <strong>Fecha de Emisión:</strong> {{ date('d/m/Y') }}
        </div>
        <div>
            <strong>Periodo:</strong> {{ $desde ? date('d/m/Y', strtotime($desde)) : 'Inicio' }} - {{ $hasta ? date('d/m/Y', strtotime($hasta)) : 'Hoy' }}
        </div>
    </div>

    <div class="client-info">
        <h3>Facturado a:</h3>
        <p>{{ $cliente->name ?? 'Cliente General' }}</p>
        <p style="font-size: 14px; font-weight: normal; color: #555; margin-top: 5px;">{{ $cliente->email ?? '' }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Descripción / Sesión</th>
                <th>Fecha</th>
                <th>Entrenador(es)</th>
                <th style="text-align: right;">Importe</th>
            </tr>
        </thead>
        <tbody>
            @forelse($pagos as $pago)
            <tr>
                <td>{{ $pago->nombre_clase ?? 'Entrenamiento Personal' }} <br> <span style="font-size: 11px; color: #888;">{{ $pago->centro ?? '' }}</span></td>
                <td>{{ $pago->fecha_registro ? date('d/m/Y', strtotime($pago->fecha_registro)) : '-' }}</td>
                <td style="font-size: 13px;">
                    @foreach($pago->entrenadores as $ent)
                        {{ $ent->name }}@if(!$loop->last), @endif
                    @endforeach
                </td>
                <td style="text-align: right; font-weight: bold;">€{{ number_format($pago->importe, 2) }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="4" style="text-align: center; padding: 30px; color: #999;">No hay cobros registrados en este periodo.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="total-section">
        <span class="total-label">TOTAL A PAGAR</span>
        <div class="total-amount">€{{ number_format($total, 2) }}</div>
    </div>

    <div class="footer">
        <p>Gracias por confiar en <strong>Factomove</strong> para tu entrenamiento.</p>
        <p>Factomove S.L. - Calle Ejemplo 123, Madrid - NIF: B12345678</p>
    </div>
</body>
</html>
