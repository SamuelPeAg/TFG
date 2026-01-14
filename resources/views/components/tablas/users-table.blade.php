@props(['users'])

<div class="table-container">
    <table class="facto-table">
        <thead>
            <tr>
                <th class="check-column">
                    <input type="checkbox" id="selectAll" class="custom-checkbox">
                </th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Grupos</th> 
                <th>IBAN</th>
                <th>Firma</th>
                <th>Acciones</th>
            </tr>
        </thead>

        <tbody>
            @forelse($users as $user)
            <tr>
                <td class="check-column">
                    {{-- Este checkbox es vital para la barra flotante JS --}}
                    <input type="checkbox" class="user-check custom-checkbox" value="{{ $user->id }}">
                </td>
                
                <td>
                    <div class="user-info">
                        <div class="avatar-circle">
                            {{ strtoupper(substr($user->name, 0, 1)) }}
                        </div>
                        <span>{{ $user->name }}</span>
                    </div>
                </td>

                <td>{{ $user->email }}</td>
                
                <td>
                    @forelse($user->groups as $group)
                        <span class="group-tag">{{ $group->name }}</span>
                    @empty
                        <span style="color: #cbd5e0; font-size: 0.8em;">-</span>
                    @endforelse
                </td>

                <td style="font-family: monospace;">{{ $user->IBAN ?? '---' }}</td>
                <td style="font-family: monospace;">{{ $user->FirmaDigital ?? 'No' }}</td>

                <td>
                    <div class="action-buttons">
                        {{-- EDITAR --}}
                        <button
                            type="button"
                            class="btn-icon btn-edit js-edit-user"
                            data-id="{{ $user->id }}"
                            data-name="{{ $user->name }}"
                            data-email="{{ $user->email }}"
                            data-iban="{{ $user->IBAN }}"
                            data-firma="{{ $user->FirmaDigital }}"
                        >
                            <i class="fas fa-pencil-alt"></i>
                        </button>

                        {{-- ELIMINAR --}}
                        <form
                            action="{{ route('users.destroy', $user->id) }}"
                            method="POST"
                            onsubmit="return confirm('¿Estás seguro de que deseas eliminar este usuario?');"
                        >
                            @csrf @method('DELETE')
                            <button type="submit" class="btn-icon btn-delete">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </form>
                    </div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align:center; padding:30px; color:#94a3b8;">
                    No hay usuarios registrados aún.
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>
</div>