@props(['entrenadores'])

<div class="table-container">
    <table class="facto-table">
        <thead>
            <tr>
                <th>Entrenador</th>
                <th>Email</th>
                {{-- Si tu tabla trainers no tiene iban, puedes quitar esta columna o dejarla vacía --}}
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            @forelse($entrenadores as $entrenador)
            <tr>
                <td>
                    <div class="user-info">
                        <div class="avatar-circle" style="display: flex; align-items: center; justify-content: center;">
                            {{-- Usamos 'name' en lugar de 'nombre' para coincidir con tu base de datos --}}
                            @if($entrenador->foto_de_perfil)
                                <img src="{{ asset('storage/' . $entrenador->foto_de_perfil) }}" 
                                     alt="{{ $entrenador->name }}" 
                                     style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"
                                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                                <span style="display:none;">{{ strtoupper(substr($entrenador->name, 0, 1)) }}</span>
                            @else
                                {{ strtoupper(substr($entrenador->name, 0, 1)) }}
                            @endif
                        </div>
                        <span>{{ $entrenador->name }}</span>
                    </div>
                </td>
                <td>{{ $entrenador->email }}</td>
                <td>
                    <div class="action-buttons">
                        {{-- 1. BOTÓN Pagos (Añadido) --}}
                        <a href="{{ route('Pagos', $entrenador->id) }}" 
                           class="btn-icon" 
                           style="color: #4BB7AE;" 
                           title="Ver Pagos">
                            <i class="fas fa-calendar-check"></i>
                        </a>

                        {{-- 2. BOTÓN EDITAR --}}
                        <button type="button" class="btn-icon btn-edit" 
                            onclick="abrirModalEditar(
                                '{{ $entrenador->id }}', 
                                '{{ $entrenador->name }}', 
                                '{{ $entrenador->email }}',
                                '{{ $entrenador->iban ?? '' }}',
                                '{{ $entrenador->foto_de_perfil }}'
                            )">
                            <i class="fas fa-pencil-alt"></i>
                        </button>

                        {{-- 3. BOTÓN ELIMINAR --}}
                        {{-- Nota: Usamos la ruta 'trainers.destroy' --}}
                        <form action="{{ route('trainers.destroy', $entrenador->id) }}" method="POST" 
                              onsubmit="return confirm('¿Estás seguro de eliminar a {{ $entrenador->name }}?');">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="btn-icon btn-delete" title="Eliminar">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </form>
                    </div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="3" style="text-align: center; padding: 30px; color: #94a3b8;">
                    No hay entrenadores registrados aún.
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>
</div>