{{-- resources/views/components/cards/trainer-summary.blade.php --}}
@props(['resumen' => []])

<div {{ $attributes->merge(['class' => 'card', 'style' => 'margin-top:20px;']) }}>
    @if(empty($resumen))
        <p style="text-align:center;color:#777;margin:0;">
            No hay datos para los filtros seleccionados
        </p>
    @else
        {{-- Cabecera con el Total --}}
        <div class="summary-card" style="background:var(--teal-dark);color:#fff;">
            <strong>Resumen por entrenador</strong>
            <span class="badge" style="background:#fff; color: var(--teal-dark);">
                TOTAL:
                {{ number_format(collect($resumen)->sum('facturacion'), 2, ',', '.') }} €
            </span>
        </div>

        {{-- Lista de Entrenadores --}}
        @foreach($resumen as $nombre => $info)
            <div class="summary-card">
                <div>
                    <strong>{{ strtoupper($nombre) }}</strong>
                </div>
                <div style="display:flex;gap:10px;">
                    <span class="badge">
                        Pagos: {{ $info['Pagos'] }}
                    </span>
                    <span class="badge">
                        {{ number_format($info['facturacion'], 2, ',', '.') }} €
                    </span>
                </div>
            </div>
        @endforeach
    @endif
</div>