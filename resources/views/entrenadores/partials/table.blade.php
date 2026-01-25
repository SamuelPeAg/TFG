<div class="table-container">
    <table class="facto-table">
        <thead>
            <tr>
                <th>Entrenador</th>
                <th>Email</th>
                <th>iban</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            @forelse($entrenadores as $entrenador)
            <tr>
                <td>
                    <div class="user-info">
                        <div class="avatar-circle">
                            {{ strtoupper(substr($entrenador->name, 0, 1)) }}
                        </div>
                        <span>{{ $entrenador->name }}</span>
                    </div>
                </td>
                <td>{{ $entrenador->email }}</td>
                <td style="font-family: monospace;">{{ $entrenador->iban }}</td>
                <td>
                    <div class="action-buttons">
                        @php
                            $u = \App\Models\User::where('email', $entrenador->email)->first();
                            $isAdmin = ($u && method_exists($u,'hasRole') && $u->hasRole('admin')) ? '1' : '0';
                        @endphp
                        <button type="button" class="btn-icon btn-view" title="Ver Perfil Detallado"
                            onclick="abrirModalPerfil(
                                '{{ $entrenador->id }}',
                                '{{ $entrenador->name }}',
                                '{{ $entrenador->email }}',
                                '{{ $entrenador->dni ?? 'No asignado' }}',
                                '{{ $entrenador->telefono ?? 'No asignado' }}',
                                '{{ $entrenador->direccion ?? 'No asignada' }}',
                                '{{ $entrenador->fecha_nacimiento ? \Carbon\Carbon::parse($entrenador->fecha_nacimiento)->format('d/m/Y') : 'No asignada' }}',
                                '{{ $entrenador->foto_de_perfil ? asset('storage/' . $entrenador->foto_de_perfil) : '' }}',
                                '{{ $entrenador->iban ?? 'No asignado' }}'
                            )">
                            <i class="fas fa-id-badge"></i>
                        </button>

                        <button type="button" class="btn-icon btn-edit" 
                            onclick="abrirModalEditar(
                                '{{ $entrenador->id }}', 
                                '{{ $entrenador->name }}', 
                                '{{ $entrenador->email }}', 
                                '{{ $entrenador->iban }}',
                                '{{ $isAdmin }}',
                                '{{ $entrenador->dni }}',
                                '{{ $entrenador->telefono }}',
                                '{{ $entrenador->direccion }}',
                                '{{ $entrenador->fecha_nacimiento }}'
                            )">
                            <i class="fas fa-pencil-alt"></i>
                        </button>

                        <button type="button" class="btn-icon btn-delete" 
                            onclick="abrirModalEliminar('{{ $entrenador->id }}', '{{ $entrenador->name }}')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="4" style="text-align: center; padding: 30px; color: #94a3b8;">
                    No hay entrenadores registrados aún.
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>
</div>
