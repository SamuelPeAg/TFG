@props(['entrenadores'])

<div class="table-container">
    <table class="facto-table">
        <thead>
            <tr>
                <th>Entrenador</th>
                <th>Email</th>
                {{-- Si tu tabla trainers no tiene IBAN, puedes quitar esta columna o dejarla vacía --}}
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            @forelse($entrenadores as $entrenador)
            <tr>
                <td>
                    <div class="user-info">
                        <div class="avatar-circle">
                            {{-- Usamos 'name' en lugar de 'nombre' para coincidir con tu base de datos --}}
                            {{ strtoupper(substr($entrenador->name, 0, 1)) }}
                        </div>
                        <span>{{ $entrenador->name }}</span>
                    </div>
                </td>
                <td>{{ $entrenador->email }}</td>
                <td>
                    <div class="action-buttons">
                        {{-- 1. BOTÓN SESIONES (Añadido) --}}
                        <a href="{{ route('sesiones', $entrenador->id) }}" 
                           class="btn-icon" 
                           style="color: #4BB7AE;" 
                           title="Ver Sesiones">
                            <i class="fas fa-calendar-check"></i>
                        </a>

                        {{-- 2. BOTÓN EDITAR --}}
                        <button type="button" class="btn-icon btn-edit" 
                            onclick="abrirModalEditar(
                                '{{ $entrenador->id }}', 
                                '{{ $entrenador->name }}', 
                                '{{ $entrenador->email }}',
                                '{{ $entrenador->iban ?? '' }}' 
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