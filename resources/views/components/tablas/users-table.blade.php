@props(['users'])

<div class="table-container">
    <table class="facto-table">
        <thead>
            <tr>
                <th>Usuario</th>
                <th>Email</th> 
                <th>iban</th>
                <th>Firma</th>
                <th>Acciones</th>
            </tr>
        </thead>

        <tbody>
            @forelse($users as $user)
            <tr>
                <td data-label="Usuario">
                    <div class="user-info">
                        <div class="avatar-circle">
                            {{ strtoupper(substr($user->name, 0, 1)) }}
                        </div>
                        <span>{{ $user->name }}</span>
                    </div>
                </td>

                <td data-label="Email">{{ $user->email }}</td>

                <td data-label="IBAN" style="font-family: monospace;">{{ $user->iban ?? '---' }}</td>
                <td data-label="Firma" style="font-family: monospace;">{{ $user->firma_digital ?? 'No' }}</td>

                <td data-label="Acciones">
                    <div class="action-buttons">
                        {{-- EDITAR --}}
                        <button
                            type="button"
                            class="btn-icon btn-edit js-edit-user"
                            data-id="{{ $user->id }}"
                            data-name="{{ $user->name }}"
                            data-email="{{ $user->email }}"
                            data-iban="{{ $user->iban }}"
                            data-firma="{{ $user->firma_digital }}"
                        >
                            <i class="fas fa-pencil-alt"></i>
                        </button>

                        {{-- ELIMINAR --}}
                        <button type="button" class="btn-icon btn-delete" 
                            onclick="abrirModalEliminarUsuario('{{ $user->id }}', '{{ $user->name }}')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="5" style="text-align:center; padding:30px; color:#94a3b8;">
                    No hay usuarios registrados aún.
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>
</div>