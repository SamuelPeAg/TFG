<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Nóminas - Factomove</title>

    {{-- Tailwind CSS via CDN for valid utility classes in this view if build step is not running/configured fully --}}
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
        /* Keep global overrides if needed, but rely on Tailwind */
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>

<body class="bg-slate-50 text-slate-800">

    <div class="flex min-h-screen">
        {{-- SIDEBAR COMPONENT --}}
        @auth
            @if(auth()->user()->hasRole('admin'))
                @include('components.sidebar.sidebar_admin')
            @elseif(auth()->user()->hasRole('entrenador'))
                @include('components.sidebar.sidebar_entrenador')
            @endif
        @endauth

        <main class="flex-1 p-8 ml-[250px] fade-in max-w-7xl mx-auto">
            
            {{-- HEADER --}}
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900">
                        Gestión de Nóminas
                    </h1>
                    <p class="text-slate-400 mt-1 font-medium">Supervisión y control de pagos a entrenadores</p>
                </div>
                
                <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    {{-- Search Bar --}}
                    <div class="relative w-full md:w-64">
                        <input type="text" id="searchInput" placeholder="Buscar entrenador..." 
                               class="pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-teal focus:outline-none w-full transition-colors font-medium text-slate-600"
                               onkeyup="filterTable()">
                        <i class="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                    </div>

                    <form action="{{ route('admin.nominas.generar') }}" method="POST">
                        @csrf
                        <button type="submit" onclick="return confirm('¿Calcular nóminas para el mes actual?')"
                                class="w-full md:w-auto group flex items-center justify-center gap-2 bg-gradient-to-r from-brand-teal to-teal-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-brand-teal/40 hover:-translate-y-0.5 transition-all duration-200">
                            <i class="fas fa-bolt group-hover:animate-pulse"></i> 
                            Generar Mes Actual
                        </button>
                    </form>
                </div>
            </div>

            @if(session('success'))
                <div class="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-xl mb-6 flex items-center gap-3 shadow-sm">
                    <i class="fas fa-check-circle text-green-600 text-xl"></i>
                    {{ session('success') }}
                </div>
            @endif


            {{-- SUMMARY CARDS --}}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <!-- Card 1: Borradores -->
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div class="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
                    <div class="flex justify-between items-center">
                        <div>
                            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Por Revisar</h4>
                            <p class="text-3xl font-black text-slate-800">{{ $borradores->count() }}</p>
                            <p class="text-sm font-semibold text-orange-500 mt-1">
                                {{ number_format($borradores->sum('importe'), 2) }} € est.
                            </p>
                        </div>
                        <div class="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 text-xl group-hover:scale-110 transition-transform">
                            <i class="fas fa-edit"></i>
                        </div>
                    </div>
                </div>

                <!-- Card 2: Pendientes Pago -->
                @php $pendientesPago = $historial->where('estado_nomina', 'pendiente_pago'); @endphp
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div class="absolute top-0 left-0 w-1.5 h-full bg-teal-500"></div>
                    <div class="flex justify-between items-center">
                        <div>
                            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pendiente Pago</h4>
                            <p class="text-3xl font-black text-slate-800">{{ $pendientesPago->count() }}</p>
                            <p class="text-sm font-semibold text-teal-600 mt-1">
                                {{ number_format($pendientesPago->sum('importe'), 2) }} € total
                            </p>
                        </div>
                        <div class="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 text-xl group-hover:scale-110 transition-transform">
                            <i class="fas fa-clock"></i>
                        </div>
                    </div>
                </div>

                <!-- Card 3: Pagado Histórico -->
                @php $pagadas = $historial->where('estado_nomina', 'pagado'); @endphp
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div class="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
                    <div class="flex justify-between items-center">
                        <div>
                            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pagado (Histórico)</h4>
                            <p class="text-3xl font-black text-slate-800">{{ $pagadas->count() }}</p>
                            <p class="text-sm font-semibold text-green-600 mt-1">
                                {{ number_format($pagadas->sum('importe'), 2) }} €
                            </p>
                        </div>
                        <div class="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 text-xl group-hover:scale-110 transition-transform">
                            <i class="fas fa-check-double"></i>
                        </div>
                    </div>
                </div>
            </div>


            {{-- SECCIÓN 1: BORRADORES --}}
            @if($borradores->isNotEmpty())
            <div class="mb-12">
                <div class="flex items-center gap-3 mb-4 pl-1">
                    <div class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <i class="fas fa-exclamation"></i>
                    </div>
                    <h3 class="text-xl font-bold text-slate-800">Pendientes de Revisión</h3>
                </div>

                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th class="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Entrenador</th>
                                <th class="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Periodo</th>
                                <th class="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Importe Calc.</th>
                                <th class="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Estado</th>
                                <th class="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            @foreach($borradores as $nomina)
                            <tr class="hover:bg-slate-50/80 transition-colors search-item">
                                <td class="py-4 px-6">
                                    <div class="flex items-center gap-3">
                                        <div class="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                                            {{ substr($nomina->user->name, 0, 1) }}
                                        </div>
                                        <span class="font-semibold text-slate-700 name-cell">{{ $nomina->user->name }}</span>
                                    </div>
                                </td>
                                <td class="py-4 px-6 text-slate-600 font-medium">{{ $nomina->mes }}/{{ $nomina->anio }}</td>
                                <td class="py-4 px-6 text-slate-800 font-bold text-lg">{{ number_format($nomina->importe, 2) }} €</td>
                                <td class="py-4 px-6">
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100">
                                        <i class="fas fa-pencil-alt text-[10px]"></i> Borrador
                                    </span>
                                </td>
                                <td class="py-4 px-6 text-right">
                                    <button onclick="abrirModalRevision(this)"
                                            data-id="{{ $nomina->id }}" 
                                            data-userid="{{ $nomina->user_id }}"
                                            data-name="{{ $nomina->user->name }}" 
                                            data-importe="{{ $nomina->importe }}"
                                            data-archivo="{{ $nomina->archivo_path ? asset('storage/'.$nomina->archivo_path) : '' }}"
                                            class="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg shadow hover:bg-slate-700 transition-all">
                                        Revisar
                                    </button>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
            @else
            <!-- Empty State Borradores -->
             <div class="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200 mb-12">
                <div class="text-5xl text-slate-200 mb-3"><i class="fas fa-clipboard-check"></i></div>
                <h3 class="text-lg font-bold text-slate-600">Todo al día</h3>
                <p class="text-slate-400">No hay nóminas pendientes de revisión.</p>
             </div>
            @endif


            {{-- SECCIÓN 2: HISTORIAL --}}
            <div>
                <div class="flex items-center gap-3 mb-4 pl-1">
                    <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                        <i class="fas fa-history"></i>
                    </div>
                    <h3 class="text-xl font-bold text-slate-800">Historial de Pagos</h3>
                </div>

                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th class="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Entrenador</th>
                                <th class="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Periodo</th>
                                <th class="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Importe</th>
                                <th class="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Estado</th>
                                <th class="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            @forelse($historial as $nomina)
                            <tr class="hover:bg-slate-50/50 transition-colors">
                                <td class="py-4 px-6">
                                    <div class="font-bold text-slate-700">{{ $nomina->user->name }}</div>
                                    <div class="text-xs text-slate-400">{{ $nomina->concepto }}</div>
                                </td>
                                <td class="py-4 px-6 text-slate-600">{{ $nomina->mes }}/{{ $nomina->anio }}</td>
                                <td class="py-4 px-6 font-bold text-slate-700">{{ number_format($nomina->importe, 2) }} €</td>
                                <td class="py-4 px-6">
                                    @if($nomina->estado_nomina == 'pagado')
                                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                                            <i class="fas fa-check text-[10px]"></i> Pagado
                                        </span>
                                    @else
                                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100">
                                            <i class="fas fa-hourglass-half text-[10px]"></i> Pend. Pago
                                        </span>
                                    @endif
                                </td>
                                <td class="py-4 px-6 text-right">
                                    <div class="flex justify-end gap-2">
                                        <button data-nomina="{{ json_encode([
                                                    'concepto' => $nomina->concepto,
                                                    'mes' => $nomina->mes,
                                                    'anio' => $nomina->anio,
                                                    'importe' => number_format($nomina->importe, 2),
                                                    'estado' => $nomina->estado_nomina,
                                                    'entrenador' => $nomina->user->name,
                                                    'fecha_pago' => $nomina->fecha_pago ? $nomina->fecha_pago->format('d/m/Y') : 'Pendiente',
                                                    'archivo_url' => $nomina->archivo_path ? asset('storage/'.$nomina->archivo_path) : ''
                                                ]) }}"
                                                onclick="abrirModalDetalle(JSON.parse(this.dataset.nomina))"
                                                class="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Ver Detalles">
                                            <i class="fas fa-eye"></i>
                                        </button>

                                        @if($nomina->estado_nomina == 'pendiente_pago')
                                            <form action="{{ route('admin.nominas.pagar', $nomina->id) }}" method="POST">
                                                @csrf
                                                <button type="submit" class="w-9 h-9 rounded-lg flex items-center justify-center bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Marcar como Pagado">
                                                    <i class="fas fa-check"></i>
                                                </button>
                                            </form>
                                        @endif
                                        
                                        <form action="{{ route('admin.nominas.destroy', $nomina->id) }}" method="POST" onsubmit="return confirm('¿Seguro que deseas eliminar esta nómina?');">
                                            @csrf @method('DELETE')
                                            <button class="w-9 h-9 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Eliminar">
                                                <i class="fas fa-trash-alt"></i>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="5" class="py-8 text-center text-slate-400 italic">No hay historial disponible.</td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>

        </main>
    </div>

    {{-- MODAL REVISION (Tailwind) --}}
    <div id="modalRevision" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] hidden items-center justify-center fade-in">
        <div class="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl relative">
            <button onclick="cerrarModalRevision()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <i class="fas fa-times text-xl"></i>
            </button>
            
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    <i class="fas fa-pencil-alt"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-800">Revisar Nómina</h2>
                <p class="text-slate-500 mt-1">Ajusta el importe si es necesario</p>
            </div>

            <form id="formRevision" method="POST" enctype="multipart/form-data">
                @csrf
                @method('PUT')
                
                <div class="mb-6">
                    <label class="block text-sm font-bold text-slate-700 mb-2">Entrenador Asignado</label>
                    <div class="relative">
                        <select name="user_id" id="modalEntrenadorSelect" class="w-full p-4 rounded-xl border-2 border-slate-200 text-lg font-bold text-slate-700 focus:outline-none focus:border-brand-teal transition-colors appearance-none bg-white">
                            @foreach($entrenadores as $entrenador)
                                <option value="{{ $entrenador->id }}">{{ $entrenador->name }}</option>
                            @endforeach
                        </select>
                        <i class="fas fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                    </div>
                </div>

                <div class="mb-6">
                    <label class="block text-sm font-bold text-slate-700 mb-2">Importe Final (€)</label>
                    <input type="number" step="0.01" name="importe" id="modalImporte" 
                           class="w-full p-4 rounded-xl border-2 border-slate-200 text-xl font-bold text-slate-800 focus:outline-none focus:border-brand-teal transition-colors">
                </div>

                <div class="mb-6">
                    <label class="block text-sm font-bold text-slate-700 mb-2">Subir PDF Nómina</label>
                    <input type="file" name="archivo" accept="application/pdf"
                           class="w-full p-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200">
                    
                    <div id="linkArchivoActual" class="mt-2 text-sm text-center hidden">
                        <a href="#" target="_blank" class="text-brand-teal font-bold hover:underline">Ver PDF actual</a>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <button type="submit" name="accion" value="guardar" 
                            class="py-3 px-4 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                        Solo Guardar
                    </button>
                    <button type="submit" name="accion" value="confirmar" 
                            class="py-3 px-4 rounded-xl font-bold bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-colors">
                        Confirmar y Publicar
                    </button>
                </div>
            </form>
        </div>
    </div>

    <div id="modalDetalleAdmin" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] hidden items-center justify-center fade-in">
        <div class="bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl relative">
            <button onclick="cerrarModalDetalle()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <i class="fas fa-times text-xl"></i>
            </button>
            
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    <i class="fas fa-info-circle"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-800">Detalle de Nómina</h2>
                <p class="text-slate-500 mt-1" id="modalDetalleEntrenador"></p>
            </div>

            <div class="space-y-4 mb-8">
                <div class="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                    <span class="text-slate-500 font-medium">Concepto</span>
                    <span class="text-slate-800 font-bold text-right text-sm" id="modalDetalleConcepto">--</span>
                </div>

                <div class="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                    <span class="text-slate-500 font-medium">Periodo</span>
                    <span class="text-slate-800 font-bold" id="modalDetallePeriodo">--</span>
                </div>
                
                <div class="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                    <span class="text-slate-500 font-medium">Importe</span>
                    <span class="text-2xl font-black text-slate-800" id="modalDetalleImporte">-- €</span>
                </div>

                <div class="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                    <span class="text-slate-500 font-medium">Estado</span>
                    <span id="modalDetalleEstadoBadge" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold">
                        --
                    </span>
                </div>
            </div>

            <a id="btnDescargarPDFAdmin" href="#" target="_blank" class="flex items-center justify-center gap-3 w-full py-4 bg-slate-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <i class="fas fa-file-pdf text-red-400 text-xl"></i>
                <span>Ver documento PDF</span>
            </a>
            
            <div id="noPDFMessageAdmin" class="hidden text-center text-slate-400 italic mt-4 text-sm">
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
                const nameCell = row.querySelector('.name-cell');
                const name = nameCell.textContent.toLowerCase();
                if (name.includes(filter)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }

        function abrirModalRevision(btn) {
            const id = btn.dataset.id;
            const userid = btn.dataset.userid; 
            const importe = btn.dataset.importe;
            const archivo = btn.dataset.archivo;

            // Pre-seleccionar entrenador
            const select = document.getElementById('modalEntrenadorSelect');
            if(select) {
                select.value = userid;
            }

            document.getElementById('modalImporte').value = importe;
            
            // Mostrar enlace si hay archivo
            const linkDiv = document.getElementById('linkArchivoActual');
            const linkTag = linkDiv.querySelector('a');
            if (archivo) {
                linkTag.href = archivo;
                linkDiv.classList.remove('hidden');
            } else {
                linkDiv.classList.add('hidden');
            }
            
            const url = "{{ route('admin.nominas.update', ':id') }}";
            document.getElementById('formRevision').action = url.replace(':id', id);

            document.getElementById('modalRevision').classList.remove('hidden');
            document.getElementById('modalRevision').classList.add('flex');
        }

        function cerrarModalRevision() {
            document.getElementById('modalRevision').classList.add('hidden');
            document.getElementById('modalRevision').classList.remove('flex');
        }
        
        document.getElementById('modalRevision').addEventListener('click', function(e) {
            if (e.target === this) {
                cerrarModalRevision();
            }
        });

        // --- NUEVO: Modal Detalle (Read Only) ---
        function abrirModalDetalle(data) {
            document.getElementById('modalDetalleEntrenador').textContent = data.entrenador;
            document.getElementById('modalDetalleConcepto').textContent = data.concepto;
            document.getElementById('modalDetallePeriodo').textContent = data.mes + '/' + data.anio;
            document.getElementById('modalDetalleImporte').textContent = data.importe + ' €';
            
            const badge = document.getElementById('modalDetalleEstadoBadge');
            if (data.estado === 'pagado') {
                badge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100';
                badge.innerHTML = '<i class="fas fa-check"></i> Pagado';
            } else {
                badge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100';
                badge.innerHTML = '<i class="fas fa-hourglass-half"></i> Pendiente';
            }

            const btnPDF = document.getElementById('btnDescargarPDFAdmin');
            const msgPDF = document.getElementById('noPDFMessageAdmin');

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

            document.getElementById('modalDetalleAdmin').classList.remove('hidden');
            document.getElementById('modalDetalleAdmin').classList.add('flex');
        }

        function cerrarModalDetalle() {
            document.getElementById('modalDetalleAdmin').classList.add('hidden');
            document.getElementById('modalDetalleAdmin').classList.remove('flex');
        }

        document.getElementById('modalDetalleAdmin').addEventListener('click', function(e) {
            if (e.target === this) {
                cerrarModalDetalle();
            }
        });
    </script>
</body>
</html>
