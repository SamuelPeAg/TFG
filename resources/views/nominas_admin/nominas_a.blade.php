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

        <main class="flex-1 p-4 md:p-8 lg:ml-[260px] ml-0 fade-in w-full transition-all duration-300">
            
            {{-- HEADER --}}
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 class="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900">
                        Gestión de Nóminas
                    </h1>
                    <p class="text-slate-400 mt-1 font-medium text-sm md:text-base">Supervisión y control de pagos a entrenadores</p>
                </div>
                
                <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    {{-- Search Bar --}}
                    <div class="relative w-full md:w-64">
                        <input type="text" id="searchInput" placeholder="Buscar entrenador..." 
                               class="pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-teal focus:outline-none w-full transition-colors font-medium text-slate-600 shadow-sm"
                               onkeyup="filterTable()">
                        <i class="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                    </div>

                    <form action="{{ route('admin.nominas.generar') }}" method="POST" class="w-full md:w-auto">
                        @csrf
                        <button type="submit" onclick="return confirm('¿Calcular nóminas para el mes actual?')"
                                class="w-full md:w-auto group flex items-center justify-center gap-2 bg-gradient-to-r from-brand-teal to-teal-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-brand-teal/40 hover:-translate-y-0.5 transition-all duration-200">
                            <i class="fas fa-bolt group-hover:animate-pulse"></i> 
                            <span class="whitespace-nowrap">Generar Mes Actual</span>
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
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
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

                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
                    <table class="w-full text-left min-w-[800px]">
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
                                    <div class="flex items-center justify-end gap-2">
                                        <button onclick="abrirModalRevision(this)"
                                                data-id="{{ $nomina->id }}" 
                                                data-userid="{{ $nomina->user_id }}"
                                                data-name="{{ $nomina->user->name }}" 
                                                data-importe="{{ $nomina->importe }}"
                                                data-mes="{{ $nomina->mes }}"
                                                data-anio="{{ $nomina->anio }}"
                                                data-detalles="{{ json_encode($nomina->detalles) }}"
                                                data-archivo="{{ $nomina->archivo_path ? asset('storage/'.$nomina->archivo_path) : '' }}"
                                                class="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg shadow hover:bg-slate-700 transition-all">
                                            Revisar
                                        </button>

                                        <form action="{{ route('admin.nominas.destroy', $nomina->id) }}" method="POST" onsubmit="return confirm('¿Estás seguro de que deseas eliminar este borrador?');">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors shadow-sm" title="Eliminar Borrador">
                                                <i class="fas fa-trash-alt"></i>
                                            </button>
                                        </form>
                                    </div>
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

                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
                    <table class="w-full text-left min-w-[800px]">
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
                            <tr class="hover:bg-slate-50/50 transition-colors search-item">
                                <td class="py-4 px-6">
                                    <div class="font-bold text-slate-700 name-cell">{{ $nomina->user->name }}</div>
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
                                                    'archivo_url' => $nomina->archivo_path ? asset('storage/'.$nomina->archivo_path) : '',
                                                    'detalles' => $nomina->detalles
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
    <div id="modalRevision" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000] hidden items-center justify-center fade-in overflow-y-auto">
        <div class="bg-white w-full max-w-2xl rounded-2xl p-8 shadow-2xl relative my-8">
            <button type="button" onclick="cerrarModalRevision()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <i class="fas fa-times text-xl"></i>
            </button>
            
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    <i class="fas fa-calculator"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-800">Cálculo Detallado de Nómina</h2>
                <p class="text-slate-500 mt-1">Revisa y ajusta cada componente del pago</p>
            </div>

            <form id="formRevision" method="POST" enctype="multipart/form-data">
                @csrf
                @method('PUT')
                
                {{-- Campos Ocultos para enviar el desglose al servidor --}}
                <input type="hidden" name="salario_bruto" id="input_salario_bruto">
                <input type="hidden" name="ss_trabajador" id="input_ss_trabajador">
                <input type="hidden" name="irpf" id="input_irpf">
                <input type="hidden" name="ss_empresa" id="input_ss_empresa">
                <input type="hidden" name="coste_total" id="input_coste_total">

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {{-- Bloque 1: Datos Base --}}
                    <div class="space-y-4">
                        <h4 class="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Datos Base</h4>
                        
                        <div>
                            <label class="block text-xs font-bold text-slate-500 mb-1">Entrenador</label>
                            <div id="modalEntrenadorNombre" class="w-full p-3 rounded-xl border-2 border-slate-100 font-bold text-slate-700 bg-slate-50">
                                --
                            </div>
                            <input type="hidden" name="user_id" id="modalEntrenadorId">
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-500 mb-1">Horas Trabajadas</label>
                            <input type="number" step="0.01" name="horas_trabajadas" id="modalHoras" 
                                   class="w-full p-3 rounded-xl border-2 border-slate-200 font-bold text-slate-700 focus:outline-none focus:border-brand-teal transition-all">
                        </div>
                    </div>

                    {{-- Bloque 2: Salario Bruto y Deducciones --}}
                    <div class="space-y-4">
                        <h4 class="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Desglose Económico</h4>
                        
                        <div class="flex items-center justify-between gap-4">
                            <label class="text-xs font-bold text-slate-500">Salario Bruto (€)</label>
                            <input type="number" step="0.01" id="editBruto" class="w-32 p-2 rounded-lg border border-slate-200 text-right font-bold text-slate-700 focus:outline-none focus:border-brand-teal">
                        </div>

                        <div class="flex items-center justify-between gap-4 text-red-500">
                            <label class="text-xs font-bold uppercase">- SS Trab (6.35%)</label>
                            <span id="labelSSTrab" class="font-bold">0.00 €</span>
                        </div>

                        <div class="flex items-center justify-between gap-4 text-red-500">
                            <label class="text-xs font-bold uppercase">- IRPF (0%)</label>
                            <input type="number" step="0.1" id="editIRPF" value="0" class="w-16 p-2 rounded-lg border border-slate-200 text-right font-bold focus:outline-none">
                        </div>
                    </div>
                </div>

                {{-- CONCEPTOS EXTRA --}}
                <div class="mb-8 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest">Conceptos Adicionales (Extras/Bonos)</h4>
                        <button type="button" onclick="agregarFilaExtra()" class="text-xs font-bold bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-all">
                            <i class="fas fa-plus mr-1"></i> Añadir
                        </button>
                    </div>
                    <div id="contenedorExtras" class="space-y-3">
                        {{-- Las filas de extras se insertarán aquí dinámicamente --}}
                    </div>
                </div>

                {{-- TOTALES FINALES --}}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div class="bg-teal-50 p-6 rounded-2xl border border-teal-100">
                        <label class="block text-xs font-bold text-teal-600 uppercase mb-1">SALARIO NETO (A Pagar)</label>
                        <div class="flex items-baseline gap-1">
                            <input type="number" step="0.01" name="importe" id="modalImporte" 
                                   class="bg-transparent border-none p-0 text-3xl font-black text-teal-700 w-full focus:outline-none">
                            <span class="text-2xl font-black text-teal-700">€</span>
                        </div>
                        <p class="text-[10px] text-teal-500 font-bold mt-2">Este importe es el que verá el entrenador</p>
                    </div>

                    <div class="bg-slate-800 p-6 rounded-2xl text-white">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs font-bold text-slate-400">SS Empresa (31.40%):</span>
                            <span id="labelSSEmp" class="font-bold">0.00 €</span>
                        </div>
                        <div class="flex justify-between items-center pt-2 border-t border-slate-700">
                            <span class="text-xs font-bold text-slate-300 uppercase">COSTE TOTAL:</span>
                            <span id="labelCosteTotal" class="text-xl font-black text-brand-teal">0.00 €</span>
                        </div>
                    </div>
                </div>

                <div class="mb-8">
                    <label class="block text-sm font-bold text-slate-700 mb-2">Documento PDF (Opcional)</label>
                    <input type="file" name="archivo" accept="application/pdf"
                           class="w-full p-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200">
                    <div id="linkArchivoActual" class="mt-2 text-sm text-center hidden">
                        <a href="#" target="_blank" class="text-brand-teal font-bold hover:underline"><i class="fas fa-file-pdf mr-1"></i> Ver PDF actual</a>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <button type="submit" name="accion" value="guardar" 
                            class="py-4 px-4 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">
                        <i class="fas fa-save mr-2"></i> Guardar Borrador
                    </button>
                    <button type="submit" name="accion" value="confirmar" 
                            class="py-4 px-4 rounded-xl font-bold bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all">
                        <i class="fas fa-check-circle mr-2"></i> Confirmar y Publicar
                    </button>
                </div>
            </form>
        </div>
    </div>
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

                <div id="modalDetalleDesglose" class="bg-white border-2 border-slate-100 p-5 rounded-xl hidden">
                    <h4 class="text-xs font-bold text-slate-400 uppercase mb-4 text-center">Desglose Económico</h4>
                    <div class="space-y-3">
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-500 font-medium">Salario Bruto:</span>
                            <span id="detBruto" class="font-bold text-slate-800">--</span>
                        </div>
                        <div class="flex justify-between text-sm text-red-500">
                            <span class="font-medium">- SS Trabajador (<span id="detPSSTrab">--</span>%):</span>
                            <span id="detSSTrab" class="font-bold">--</span>
                        </div>
                        <div class="flex justify-between text-sm text-red-500">
                            <span class="font-medium">- IRPF (<span id="detPIRPF">--</span>%):</span>
                            <span id="detIRPF" class="font-bold">--</span>
                        </div>
                        
                        {{-- Contenedor de Extras en el detalle --}}
                        <div id="detExtrasContainer" class="hidden border-t border-slate-50 pt-2 space-y-1">
                            <h5 class="text-[10px] font-bold text-slate-400 uppercase">Conceptos Adicionales:</h5>
                            <div id="detExtrasList" class="space-y-1"></div>
                        </div>

                        <div class="pt-3 border-t border-slate-200">
                            <div class="flex justify-between text-teal-600">
                                <span class="font-bold uppercase text-xs">Salario Neto:</span>
                                <span id="detNeto" class="font-black text-lg">--</span>
                            </div>
                        </div>

                        <div class="mt-4 pt-3 border-t-2 border-dotted border-slate-100">
                            <div class="flex justify-between text-xs text-slate-400 mb-1">
                                <span>+ SS Empresa (<span id="detPSSEmp">--</span>%):</span>
                                <span id="detSSEmp" class="font-bold">--</span>
                            </div>
                            <div class="flex justify-between text-xs font-bold text-slate-600">
                                <span class="uppercase">Coste Total Empresa:</span>
                                <span id="detCosteTotal">--</span>
                            </div>
                        </div>
                    </div>
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

        // --- NUEVO: Modal Detalle (Read Only) ---
        function abrirModalDetalle(data) {
            document.getElementById('modalDetalleEntrenador').textContent = data.entrenador;
            document.getElementById('modalDetalleConcepto').textContent = data.concepto;
            document.getElementById('modalDetallePeriodo').textContent = data.mes + '/' + data.anio;
            document.getElementById('modalDetalleImporte').textContent = data.importe + ' €';
            
            // --- MOSTRAR DESGLOSE ---
            const container = document.getElementById('modalDetalleDesglose');
            if (data.detalles && data.detalles.salario_bruto) {
                const det = data.detalles;
                document.getElementById('detBruto').textContent = parseFloat(det.salario_bruto).toFixed(2) + ' €';
                document.getElementById('detSSTrab').textContent = '-' + parseFloat(det.ss_trabajador).toFixed(2) + ' €';
                document.getElementById('detIRPF').textContent = '-' + parseFloat(det.irpf).toFixed(2) + ' €';
                document.getElementById('detNeto').textContent = parseFloat(det.salario_neto).toFixed(2) + ' €';
                document.getElementById('detSSEmp').textContent = '+' + parseFloat(det.ss_empresa).toFixed(2) + ' €';
                document.getElementById('detCosteTotal').textContent = parseFloat(det.coste_total).toFixed(2) + ' €';
                
                // Porcentajes
                if (det.porcentajes) {
                    document.getElementById('detPSSTrab').textContent = det.porcentajes.ss_trab;
                    document.getElementById('detPIRPF').textContent = det.porcentajes.irpf;
                    document.getElementById('detPSSEmp').textContent = det.porcentajes.ss_emp;
                }

                // Extras
                const extrasCont = document.getElementById('detExtrasContainer');
                const extrasList = document.getElementById('detExtrasList');
                extrasList.innerHTML = '';
                if (det.extras && det.extras.length > 0) {
                    det.extras.forEach(ex => {
                        const row = document.createElement('div');
                        row.className = 'flex justify-between text-xs text-slate-600 italic';
                        row.innerHTML = `<span>+ ${ex.concepto}</span><span class="font-bold">${parseFloat(ex.importe).toFixed(2)} €</span>`;
                        extrasList.appendChild(row);
                    });
                    extrasCont.classList.remove('hidden');
                } else {
                    extrasCont.classList.add('hidden');
                }

                container.classList.remove('hidden');
            } else {
                container.classList.add('hidden');
            }
            // ------------------------

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

        // --- LÓGICA REVISIÓN (EDICIÓN VIVA) ---

        function abrirModalRevision(btn) {
            const id = btn.dataset.id;
            const userid = btn.dataset.userid; 
            const name = btn.dataset.name;
            const archivo = btn.dataset.archivo;
            const mes = btn.dataset.mes || new Date().getMonth() + 1;
            const anio = btn.dataset.anio || new Date().getFullYear();

            const modal = document.getElementById('modalRevision');
            modal.dataset.mes = mes;
            modal.dataset.anio = anio;
            
            let detalles = null;
            try { detalles = JSON.parse(btn.dataset.detalles || 'null'); } catch(e) { console.error(e); }

            // Rellenar Datos Entrenador (Estático)
            document.getElementById('modalEntrenadorNombre').textContent = name;
            document.getElementById('modalEntrenadorId').value = userid;
            document.getElementById('contenedorExtras').innerHTML = '';
            
            if (detalles) {
                document.getElementById('modalHoras').value = detalles.horas_trabajadas || 0;
                document.getElementById('editBruto').value = detalles.salario_bruto || 0;
                document.getElementById('editIRPF').value = (detalles.porcentajes ? detalles.porcentajes.irpf : 0);
                
                // Cargar Extras
                if (detalles.extras && detalles.extras.length > 0) {
                    detalles.extras.forEach(extra => {
                        agregarFilaExtra(extra.concepto, extra.importe);
                    });
                }
            } else {
                document.getElementById('modalHoras').value = 0;
                document.getElementById('editBruto').value = 0;
                document.getElementById('editIRPF').value = 0;
            }

            // Configurar URL Form
            const url = "{{ route('admin.nominas.update', ':id') }}";
            document.getElementById('formRevision').action = url.replace(':id', id);

            // PDF
            const linkDiv = document.getElementById('linkArchivoActual');
            if (archivo) {
                linkDiv.querySelector('a').href = archivo;
                linkDiv.classList.remove('hidden');
            } else {
                linkDiv.classList.add('hidden');
            }

            recalcularTodo(); // Primera ejecución

            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function agregarFilaExtra(concepto = '', importe = 0) {
            const container = document.getElementById('contenedorExtras');
            const div = document.createElement('div');
            div.className = 'flex items-center gap-2 extra-row';
            div.innerHTML = `
                <input type="text" name="extra_conceptos[]" value="${concepto}" placeholder="Concepto (Plus, Bono...)" 
                       class="flex-1 p-2 rounded-lg border border-slate-200 text-sm font-medium focus:border-brand-teal focus:outline-none">
                <input type="number" step="0.01" name="extra_importes[]" value="${importe}" 
                       class="w-24 p-2 rounded-lg border border-slate-200 text-sm font-bold text-right focus:border-brand-teal focus:outline-none input-extra-importe">
                <button type="button" onclick="this.parentElement.remove(); recalcularTodo();" class="text-red-400 hover:text-red-600 p-2">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            container.appendChild(div);
            
            // Listen to new input
            div.querySelector('.input-extra-importe').addEventListener('input', recalcularTodo);
            div.querySelector('input[type="text"]').addEventListener('input', recalcularTodo);
        }

        function recalcularTodo(event) {
            // Si el cambio viene de "Horas", calculamos por tramos y actualizamos Bruto
            if (event && event.target.id === 'modalHoras') {
                const horas = parseFloat(document.getElementById('modalHoras').value) || 0;
                let bruto = 0;
                let rem = horas;
                let h1 = Math.min(rem, 25); bruto += h1 * 7.6; rem -= h1;
                if (rem > 0) { let h2 = Math.min(rem, 5); bruto += h2 * 10.9; rem -= h2; }
                if (rem > 0) { bruto += rem * 13.3; }
                document.getElementById('editBruto').value = bruto.toFixed(2);
            }

            // Datos Base
            const bruto = parseFloat(document.getElementById('editBruto').value) || 0;
            const irpf_p = (parseFloat(document.getElementById('editIRPF').value) || 0) / 100;
            const ss_trab_p = 0.0635;
            const ss_emp_p = 0.3140;

            // Cálculos
            const ss_trabajador = bruto * ss_trab_p;
            const irpf_importe = bruto * irpf_p;
            
            // Extras
            let totalExtras = 0;
            document.querySelectorAll('.input-extra-importe').forEach(inp => {
                totalExtras += parseFloat(inp.value) || 0;
            });

            const neto = bruto - ss_trabajador - irpf_importe + totalExtras;
            const ss_emp_importe = bruto * ss_emp_p;
            const coste_total = bruto + ss_emp_importe + totalExtras;

            // Actualizar Visual (Etiquetas)
            document.getElementById('labelSSTrab').textContent = '-' + ss_trabajador.toFixed(2) + ' €';
            document.getElementById('labelSSEmp').textContent = '+' + ss_emp_importe.toFixed(2) + ' €';
            document.getElementById('labelCosteTotal').textContent = coste_total.toFixed(2) + ' €';

            // Actualizar Inputs Visibles
            document.getElementById('modalImporte').value = neto.toFixed(2);

            // Actualizar Inputs Ocultos (para el Form)
            document.getElementById('input_salario_bruto').value = bruto.toFixed(2);
            document.getElementById('input_ss_trabajador').value = ss_trabajador.toFixed(2);
            document.getElementById('input_irpf').value = irpf_importe.toFixed(2);
            document.getElementById('input_ss_empresa').value = ss_emp_importe.toFixed(2);
            document.getElementById('input_coste_total').value = coste_total.toFixed(2);
        }

        // Listeners Principales
        document.getElementById('modalHoras').addEventListener('input', recalcularTodo);
        document.getElementById('editBruto').addEventListener('input', recalcularTodo);
        document.getElementById('editIRPF').addEventListener('input', recalcularTodo);
        document.getElementById('modalImporte').addEventListener('input', function() {
            // Si editan el neto a mano, lo permitimos, pero avisamos que rompe el desglose directo
            // Opcional: Podrías ajustar el bruto para que cuadre, pero es complejo con extras.
        });

        function cerrarModalRevision() {
            document.getElementById('modalRevision').classList.add('hidden');
            document.getElementById('modalRevision').classList.remove('flex');
        }
        
        document.getElementById('modalRevision').addEventListener('click', function(e) {
            if (e.target === this) cerrarModalRevision();
        });

        function cerrarModalDetalle() {
            document.getElementById('modalDetalleAdmin').classList.add('hidden');
            document.getElementById('modalDetalleAdmin').classList.remove('flex');
        }

        document.getElementById('modalDetalleAdmin').addEventListener('click', function(e) {
            if (e.target === this) cerrarModalDetalle();
        });

        // Al cambiar de entrenador, opcionalmente podrías recalcular sessions pero lo dejaremos manual por ahora
        // document.getElementById('modalEntrenadorSelect').addEventListener('change', function() { ... });
    </script>
</body>
</html>
