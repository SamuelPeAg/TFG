@props(['groups'])

{{-- ID id="modalGestionGrupos" es necesario para que el JS lo encuentre --}}
<div id="modalGestionGrupos" class="modal-overlay" aria-hidden="true">
    <div class="modal-card" style="max-width: 500px;">
        {{-- Botón de cerrar que llama a la función JS de la vista principal --}}
        <button type="button" class="close-btn" onclick="cerrarModalGestionGrupos()">&times;</button>
        
        <div class="modal-header-custom">
            <div class="logo-simulado"><i class="fas fa-trash-alt"></i></div>
            <h2>Grupos Existentes</h2>
            <p>Gestiona o elimina tus grupos.</p>
        </div>

        <div style="max-height: 300px; overflow-y: auto; margin-top: 15px;">
            @if(isset($groups) && $groups->count() > 0)
                <table class="w-full text-left" style="width: 100%; border-collapse: collapse;">
                    <thead style="background: #f7fafc; border-bottom: 2px solid #edf2f7; position: sticky; top: 0;">
                        <tr>
                            <th style="padding: 10px; color: #718096; font-size: 0.85em;">GRUPO</th>
                            <th style="padding: 10px; text-align: right; color: #718096; font-size: 0.85em;">ACCIÓN</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($groups as $group)
                            <tr style="border-bottom: 1px solid #edf2f7;">
                                <td style="padding: 12px; font-weight: 600; color: #2D3748;">
                                    {{ $group->name }}
                                    <span style="font-size: 0.75em; color: #a0aec0; font-weight: normal; margin-left: 5px;">
                                        ({{ $group->users_count }} usuarios)
                                    </span>
                                </td>
                                <td style="padding: 12px; text-align: right;">
                                    <form action="{{ route('users.group.destroy', $group->id) }}" method="POST" onsubmit="return confirm('¿Borrar el grupo {{ $group->name }}?');">
                                        @csrf @method('DELETE')
                                        <button type="submit" style="background: #FFF5F5; color: #E53E3E; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; transition: all 0.2s;" title="Eliminar Grupo">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <div style="text-align: center; padding: 20px; color: #A0AEC0;">
                    <i class="fas fa-folder-open" style="font-size: 2em; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
                    No hay grupos creados todavía.
                </div>
            @endif
        </div>
    </div>
</div>