<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Factura_{{ date('Ymd') }}</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; margin: 0; padding: 40px; line-height: 1.6; }
        .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #4BB7AE; padding-bottom: 30px; margin-bottom: 40px; }
        .logo { font-size: 32px; font-weight: 900; color: #111827; }
        .logo span { color: #4BB7AE; }
        .invoice-title { text-align: right; }
        .invoice-title h1 { margin: 0; font-size: 24px; color: #4BB7AE; text-transform: uppercase; }
        
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 50px; }
        .info-box h3 { font-size: 12px; text-transform: uppercase; color: #9ca3af; margin-bottom: 10px; letter-spacing: 1px; }
        .info-content { font-size: 14px; font-weight: 700; }
        
        .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        .invoice-table th { text-align: left; padding: 15px; background: #f9fafb; font-size: 11px; text-transform: uppercase; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
        .invoice-table td { padding: 15px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
        
        .total-box { margin-left: auto; width: 250px; background: #111827; color: white; padding: 25px; border-radius: 12px; text-align: right; }
        .total-label { font-size: 12px; text-transform: uppercase; opacity: 0.8; display: block; margin-bottom: 5px; }
        .total-value { font-size: 28px; font-weight: 900; }
        
        .footer { margin-top: 100px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        
        @media print {
            .no-print { display: none; }
            body { padding: 0; }
        }
    </style>
</head>
<body>
    <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="descargarPDF()" style="padding: 10px 20px; background: #4BB7AE; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">
            <i class="fa-solid fa-download"></i> Descargar Reporte PDF
        </button>
    </div>

    <div class="invoice-header">
        <div class="logo">Facto<span>move</span></div>
        <div class="invoice-title">
            <h1>Hoja de Liquidación</h1>
            <p>Ref: #LIQ-{{ strtoupper(uniqid()) }}</p>
            <p>Generado: {{ date('d/m/Y') }}</p>
        </div>
    </div>

    <div class="info-grid">
        <div class="info-box">
            <h3>Profesional / Entrenador:</h3>
            <div class="info-content">
                @if($esGlobal)
                    <span style="color:#4BB7AE;">REPORTE DE COSTES GLOBAL</span><br>
                    Centros: {{ $centro }}
                @else
                    {{ $entrenador->name }}<br>
                    DNI: {{ $entrenador->dni ?? 'No especificado' }}<br>
                    IBAN: {{ $entrenador->iban ?? 'No especificado' }}
                @endif
            </div>
        </div>
        <div class="info-box" style="text-align: right;">
            <h3>Resumen Financiero:</h3>
            <div class="info-content">
                Periodo: {{ $desde ? date('d/m/Y', strtotime($desde)) : 'Inicio' }} - {{ $hasta ? date('d/m/Y', strtotime($hasta)) : date('d/m/Y') }}<br>
                Comisión Aplicada: {{ $comision }}%<br>
                Estado: Borrador de Liquidación
            </div>
        </div>
    </div>

    <table class="invoice-table">
        <thead>
            <tr>
                <th>Centro / Actividad</th>
                <th style="text-align: center;">Nº Sesiones</th>
                <th style="text-align: right;">Bruto Generado</th>
                <th style="text-align: right;">Liquidación ({{ $comision }}%)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($items as $item)
            <tr>
                <td style="font-weight: 700;">{{ $item['nombre'] }}</td>
                <td style="text-align: center;">{{ $item['sesiones'] }}</td>
                <td style="text-align: right; color: #9ca3af; font-size: 12px;">€{{ number_format($item['total'], 2) }}</td>
                <td style="text-align: right; font-weight: 800;">€{{ number_format($item['liquidacion'], 2) }}</td>
                
            </tr>
            @empty
            <tr>
                <td colspan="4" style="text-align:center; padding: 40px; color: #9ca3af;">No hay actividades registradas.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div style="display: flex; justify-content: flex-end; gap: 20px;">
        <div class="total-box" style="background: #f9fafb; color: #111827; border: 1px solid #e5e7eb;">
            <span class="total-label">Caja Bruta</span>
            <span class="total-value" style="font-size: 20px;">€{{ number_format($totalBruto, 2) }}</span>
        </div>
        <div class="total-box" style="background: {{ $isCenterReport ? '#4BB7AE' : '#EF5D7A' }};">
            <span class="total-label">{{ $isCenterReport ? 'Beneficio Neto Empresa' : 'A Pagar al Profesional' }}</span>
            <span class="total-value">€{{ number_format($isCenterReport ? ($totalBruto - $totalLiquidacion) : $totalLiquidacion, 2) }}</span>
        </div>
    </div>

    <div class="footer">
        Factomove S.L. &bull; 
        @if($isCenterReport)
            Reporte consolidado de rentabilidad operativa por centro.
        @else
            Liquidación interna de servicios prestados por el profesional. Los importes son brutos.
        @endif
    </div>

    <!-- Librería para descarga directa -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>

    <script>
        function descargarPDF() {
            const element = document.body;
            const noPrint = document.querySelector('.no-print');
            
            // Ocultamos el botón antes de generar el PDF
            noPrint.style.display = 'none';

            const opt = {
                margin:       10,
                filename:     'Liquidacion_{{ date("Ymd") }}.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Ejecutamos la descarga
            html2pdf().set(opt).from(element).save().then(() => {
                // Volvemos a mostrar el botón
                noPrint.style.display = 'block';
            });
        }
    </script>
</body>
</html>
