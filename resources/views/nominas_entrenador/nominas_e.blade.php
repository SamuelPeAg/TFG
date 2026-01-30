<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mis Nóminas - Factomove</title>

    {{-- Tailwind CSS --}}
    <script src="https://cdn.tailwindcss.com"></script> 
    
    <link rel="stylesheet" href="{{ asset('css/global.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'brand-teal': '#4BB7AE',
                        'brand-dark': '#0f172a',
                        'brand-orange': '#f97316',
                    }
                }
            }
        }
    </script>
    <style>
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>

<body class="bg-slate-50 text-slate-800">

    <div class="flex min-h-screen">
        {{-- SIDEBAR COMPONENT --}}
        @include('components.sidebar.sidebar_entrenador')

        <main class="flex-1 p-8 ml-[250px] fade-in max-w-7xl mx-auto">
            
            {{-- HEADER --}}
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900">
                        Mis Nóminas
                    </h1>
                    <p class="text-slate-400 mt-1 font-medium">Historial de pagos y recibos.</p>
                </div>
                
                {{-- Search Bar --}}
                <div class="relative w-full md:w-64">
                    <input type="text" id="searchInput" placeholder="Buscar concepto o mes..." 
                           class="pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-teal focus:outline-none w-full transition-colors font-medium text-slate-600"
                           onkeyup="filterTable()">
                    <i class="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                </div>
            </div>

            @if(session('error'))
                <div class="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-xl mb-6 flex items-center gap-3 shadow-sm">
                    <i class="fas fa-exclamation-circle text-red-600 text-xl"></i>
                    {{ session('error') }}
                </div>
            @endif

            {{-- SUMMARY CARDS (Opcional, resumen rápido) --}}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
                    <div>
                        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pendiente de Cobro</h4>
                        <p class="text-3xl font-black text-slate-800">
                            {{ number_format($nominas->where('estado_nomina', '!=', 'pagado')->sum('importe'), 2) }} €
                        </p>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
                    <div>
                        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Cobrado (Año)</h4>
                        <p class="text-3xl font-black text-slate-800">
                            {{ number_format($nominas->where('estado_nomina', 'pagado')->sum('importe'), 2) }} €
                        </p>
                    </div>
                </div>
            </div>

            {{-- TABS FILTRO (Visual) --}}
            <div class="flex gap-6 mb-6 border-b border-slate-200 pb-1">
                <a href="{{ route('nominas_e', ['estado' => 'pendiente']) }}" 
                   class="pb-3 text-sm font-bold transition-colors {{ $filtro == 'pendiente' ? 'text-brand-teal border-b-2 border-brand-teal' : 'text-slate-400 hover:text-slate-600' }}">
                   <i class="fas fa-clock mr-1"></i> Por Pagar
                </a>
                <a href="{{ route('nominas_e', ['estado' => 'pagado']) }}" 
                   class="pb-3 text-sm font-bold transition-colors {{ $filtro == 'pagado' ? 'text-brand-teal border-b-2 border-brand-teal' : 'text-slate-400 hover:text-slate-600' }}">
                   <i class="fas fa-check-circle mr-1"></i> Pagadas
                </a>
            </div>

            {{-- TABLA --}}
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table class="w-full text-left">
                    <thead class="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th class="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Periodo</th>
                            <th class="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Concepto</th>
                            <th class="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Importe</th>
                            <th class="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Fecha Pago</th>
                            <th class="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Estado</th>
                            <th class="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-right">Documento</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        @forelse($nominas as $nomina)
                        <tr class="hover:bg-slate-50/50 transition-colors search-item">
                            <td class="py-4 px-6 text-slate-600 font-medium">{{ $nomina->mes }}/{{ $nomina->anio }}</td>
                            <td class="py-4 px-6 text-slate-800 font-semibold concept-cell">{{ $nomina->concepto }}</td>
                            <td class="py-4 px-6 text-slate-800 font-bold text-lg">{{ number_format($nomina->importe, 2) }} €</td>
                            <td class="py-4 px-6 text-slate-500 text-sm">
                                {{ $nomina->fecha_pago ? $nomina->fecha_pago->format('d/m/Y') : '-' }}
                            </td>
                            <td class="py-4 px-6">
                                @if($nomina->estado_nomina == 'pagado')
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                                        <i class="fas fa-check text-[10px]"></i> Pagado
                                    </span>
                                @else
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100">
                                        <i class="fas fa-hourglass-half text-[10px]"></i> Pendiente
                                    </span>
                                @endif
                            </td>
                            <td class="py-4 px-6 text-right">
                                <button data-nomina="{{ json_encode([
                                            'concepto' => $nomina->concepto,
                                            'mes' => $nomina->mes,
                                            'anio' => $nomina->anio,
                                            'importe' => number_format($nomina->importe, 2),
                                            'estado' => $nomina->estado_nomina,
                                            'fecha_pago' => $nomina->fecha_pago ? $nomina->fecha_pago->format('d/m/Y') : 'Pendiente',
                                            'archivo_url' => $nomina->archivo_path ? route('nominas_e.descargar', $nomina->id) : ''
                                        ]) }}" 
                                        onclick="abrirModalDetalle(JSON.parse(this.dataset.nomina))"
                                        class="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-200 transition-all border border-slate-200">
                                    <i class="fas fa-eye text-brand-teal"></i> Ver Detalle
                                </button>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="6" class="py-12 text-center">
                                <div class="flex flex-col items-center justify-center text-slate-300">
                                    <i class="fas fa-folder-open text-4xl mb-3"></i>
                                    <p class="text-sm font-medium">No se encontraron nóminas en esta sección.</p>
                                </div>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

        </main>
    </div>

    {{-- MODAL DETALLE (Tailwind) --}}
    <div id="modalDetalle" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] hidden items-center justify-center fade-in">
        <div class="bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl relative">
            <button onclick="cerrarModalDetalle()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <i class="fas fa-times text-xl"></i>
            </button>
            
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-teal-50 text-brand-teal rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    <i class="fas fa-file-invoice-dollar"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-800">Detalle de Nómina</h2>
                <p class="text-slate-500 mt-1" id="modalConcepto">concept_placeholder</p>
            </div>

            <div class="space-y-4 mb-8">
                <div class="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                    <span class="text-slate-500 font-medium">Periodo</span>
                    <span class="text-slate-800 font-bold" id="modalPeriodo">--</span>
                </div>
                
                <div class="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                    <span class="text-slate-500 font-medium">Importe</span>
                    <span class="text-2xl font-black text-slate-800" id="modalImporte">-- €</span>
                </div>

                <div class="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                    <span class="text-slate-500 font-medium">Estado</span>
                    <span id="modalEstadoBadge" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold">
                        --
                    </span>
                </div>

                <div class="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                    <span class="text-slate-500 font-medium">Fecha de Pago</span>
                    <span class="text-slate-800 font-bold" id="modalFechaPago">--</span>
                </div>
            </div>

            <a id="btnDescargarPDF" href="#" class="flex items-center justify-center gap-3 w-full py-4 bg-brand-dark text-white rounded-xl font-bold shadow-lg hover:shadow-brand-teal/20 transition-all hover:-translate-y-1">
                <i class="fas fa-file-pdf text-red-400 text-xl"></i>
                <span>Descargar Nómina (PDF)</span>
            </a>
            
            <div id="noPDFMessage" class="hidden text-center text-slate-400 italic mt-4 text-sm">
                No hay documento PDF adjunto.
            </div>

        </div>
    </div>

    <script>
        function filterTable() {
            const input = document.getElementById('searchInput');
            const filter = input.value.toLowerCase();
            const rows = document.querySelectorAll('.search-item');

            rows.forEach(row => {
                const conceptCell = row.querySelector('.concept-cell');
                const concept = conceptCell.textContent.toLowerCase();
                if (concept.includes(filter)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }

        function abrirModalDetalle(data) {
            document.getElementById('modalConcepto').textContent = data.concepto;
            document.getElementById('modalPeriodo').textContent = data.mes + '/' + data.anio;
            document.getElementById('modalImporte').textContent = data.importe + ' €';
            
            const badge = document.getElementById('modalEstadoBadge');
            if (data.estado === 'pagado') {
                badge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100';
                badge.innerHTML = '<i class="fas fa-check"></i> Pagado';
            } else {
                badge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100';
                badge.innerHTML = '<i class="fas fa-hourglass-half"></i> Pendiente';
            }

            document.getElementById('modalFechaPago').textContent = data.fecha_pago;

            const btnPDF = document.getElementById('btnDescargarPDF');
            const msgPDF = document.getElementById('noPDFMessage');

            if (data.archivo_url) {
                btnPDF.href = data.archivo_url;
                btnPDF.classList.remove('hidden');
                btnPDF.classList.add('flex');
                msgPDF.classList.add('hidden');
            } else {
                btnPDF.classList.add('hidden');
                btnPDF.classList.remove('flex');
                msgPDF.classList.remove('hidden');
            }

            document.getElementById('modalDetalle').classList.remove('hidden');
            document.getElementById('modalDetalle').classList.add('flex');
        }

        function cerrarModalDetalle() {
            document.getElementById('modalDetalle').classList.add('hidden');
            document.getElementById('modalDetalle').classList.remove('flex');
        }
        
        document.getElementById('modalDetalle').addEventListener('click', function(e) {
            if (e.target === this) {
                cerrarModalDetalle();
            }
        });
    </script>
</body>
</html>
