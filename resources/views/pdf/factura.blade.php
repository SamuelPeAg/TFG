<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Factura - {{ $pago->user->name ?? 'Cliente' }} - {{ $pago->id }}</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #1e293b; line-height: 1.6; font-size: 13px; }
        .header { margin-bottom: 40px; border-bottom: 3px solid #38C1A3; padding-bottom: 20px; }
        .logo-table { width: 100%; border: none; }
        .logo-td-img { width: 45px; border: none; vertical-align: middle; padding: 0; }
        .logo-td-text { border: none; vertical-align: middle; padding: 0 0 0 12px; }
        .logo-img { width: 40px; height: auto; display: block; }
        .logo-text { font-size: 28px; font-weight: 900; letter-spacing: -1px; line-height: 1; }
        .company-info { margin-top: 20px; }
        .client-info { float: right; width: 45%; text-align: right; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .clear { clear: both; }
        
        .invoice-title-area { margin-bottom: 30px; text-align: right; }
        .invoice-title { font-size: 24px; font-weight: 900; color: #334155; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; }
        .invoice-date { font-size: 12px; color: #64748b; font-weight: bold; }

        .section-title { background: #f1f5f9; padding: 8px 12px; font-weight: 900; margin: 30px 0 15px 0; text-transform: uppercase; font-size: 11px; letter-spacing: 1.5px; color: #475569; border-radius: 6px; }
        
        table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 30px; }
        th { background: #38C1A3; color: white; text-align: left; padding: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
        th:first-child { border-top-left-radius: 8px; border-bottom-left-radius: 8px; }
        th:last-child { border-top-right-radius: 8px; border-bottom-right-radius: 8px; }
        td { padding: 15px 12px; border-bottom: 1px solid #e2e8f0; color: #334155; font-weight: 500;}
        tr:last-child td { border-bottom: none; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }

        .totals-wrapper { width: 100%; margin-top: 20px; }
        .totals-table { width: 320px; float: right; border-collapse: collapse; }
        .totals-table td { border-bottom: 1px solid #f1f5f9; padding: 10px 12px; font-size: 13px; }
        .totals-table td.label { font-weight: bold; color: #64748b; }
        .totals-table tr.grand-total td { border-top: 3px solid #38C1A3; background: #f8fafc; color: #0f172a; font-size: 18px; font-weight: 900; padding: 15px 12px; }
        
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;}
        .badge-paid { background: #ccfbf1; color: #14b8a6; }
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
            </tr>
        </table>
        
        <div class="company-info">
            <div style="margin-top: 8px; font-size: 14px; color: #334155;"><strong>{{ $pago->centro_rel?->empresa?->nombre ?? 'Moverte da Vida S.L.' }}</strong></div>
            <div style="color: #64748b;">NIF: {{ $pago->centro_rel?->empresa?->cif_dni ?? 'B-12345678' }}</div>
            <div style="color: #64748b;">{{ $pago->centro_rel?->empresa?->direccion ?? 'Av. del Deporte, 45' }}, {{ $pago->centro_rel?->empresa?->ciudad ?? 'Córdoba' }}</div>
            <div style="color: #64748b;">contacto@factomove.es</div>
        </div>
        
        <div class="invoice-title-area">
            <div class="invoice-title">FACTURA</div>
            <div class="invoice-date">
                Nº Factura: <strong>{{ $pago->numero_completo ?? 'FCT-'.date('Y').'-'.str_pad($pago->id, 5, '0', STR_PAD_LEFT) }}</strong><br>
                Fecha de Emisión: <strong>{{ \Carbon\Carbon::parse($pago->fecha_registro)->format('d/m/Y') }}</strong>
            </div>
            <div style="margin-top: 15px;">
                <span class="badge badge-paid">Abonada / Pagada</span>
            </div>
        </div>
        <div class="clear"></div>
    </div>

    <div class="client-info" style="float:none; width:auto; text-align:left; margin-bottom: 40px;">
        <div style="font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Facturar a:</div>
        <div style="font-size: 18px; font-weight: 900; color: #0f172a;">{{ $pago->user->name ?? 'Cliente General' }}</div>
        @if($pago->user && $pago->user->dni)
        <div style="color: #475569; margin-top: 3px;"><strong>DNI/NIE:</strong> {{ $pago->user->dni }}</div>
        @endif
        @if($pago->user && $pago->user->email)
        <div style="color: #475569;"><strong>Email:</strong> {{ $pago->user->email }}</div>
        @endif
    </div>

    <div class="section-title">Detalle de Servicios / Conceptos</div>
    <table>
        <thead>
            <tr>
                <th>Concepto / Descripción</th>
                <th>Método de Pago</th>
                <th>Centro</th>
                <th class="text-right">Importe Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <strong style="color: #0f172a; font-size: 14px;">{{ $pago->nombre_clase ?? 'Servicio de Entrenamiento / Cuota' }}</strong>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Referencia: {{ $pago->tipo_clase ?? 'General' }}</div>
                </td>
                <td>{{ $pago->metodo_pago ?? 'No especificado' }}</td>
                <td>{{ $pago->centro ?? 'General' }}</td>
                <td class="text-right"><strong style="font-size: 14px;">{{ number_format($pago->importe, 2) }} €</strong></td>
            </tr>
        </tbody>
    </table>

    <div class="totals-wrapper">
        <div class="totals-table">
            <table>
                <tr>
                    <td class="label">Base Imponible:</td>
                    <td class="text-right">{{ number_format($pago->importe / 1.21, 2) }} €</td>
                </tr>
                <tr>
                    <td class="label">IVA (21%):</td>
                    <td class="text-right">{{ number_format($pago->importe - ($pago->importe / 1.21), 2) }} €</td>
                </tr>
                <tr class="grand-total">
                    <td class="label" style="color: #0f172a;">TOTAL FACTURA:</td>
                    <td class="text-right">{{ number_format($pago->importe, 2) }} €</td>
                </tr>
            </table>
        </div>
        <div class="clear"></div>
    </div>

    <!-- Mensaje Legal -->
    <div style="margin-top: 60px; background: #f8fafc; padding: 15px; border-radius: 8px; font-size: 11px; color: #64748b; border: 1px dashed #cbd5e1;">
        <strong style="color: #475569;">Condiciones:</strong><br>
        Esta factura confirma el pago del servicio descrito. Operación exenta o sujeta a IVA según el régimen fiscal aplicable a los servicios prestados.
        Para cualquier duda relacionada con la presente factura, por favor póngase en contacto a través de nuestro correo electrónico.
    </div>

    <div class="footer">
        Copia generada automáticamente en origen digital - Sistema de Facturación de FACTOMOVE.<br>
        pág. 1 de 1
    </div>
</body>
</html>
