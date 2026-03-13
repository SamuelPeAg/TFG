@props(['users'])

<div class="table-container">
    <table class="facto-table">
        <thead>
            <tr>
                <th>Cliente</th>
                <th>Email</th> 
                <th>iban</th>
                <th>Firma</th>
                <th>Saldo</th>
                <th>Acciones</th>
            </tr>
        </thead>

        <tbody>
            @forelse($users as $user)
            <tr>
                <td data-label="Usuario">
                    <div class="user-info">
                        <div class="avatar-circle" style="display: flex; align-items: center; justify-content: center;">
                            @if($user->foto_de_perfil)
                                <img src="{{ asset('storage/' . $user->foto_de_perfil) }}" 
                                     alt="{{ $user->name }}" 
                                     style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"
                                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                                <span style="display:none;">{{ strtoupper(substr($user->name, 0, 1)) }}</span>
                            @else
                                {{ strtoupper(substr($user->name, 0, 1)) }}
                            @endif
                        </div>
                        <span>{{ $user->name }}</span>
                    </div>
                </td>

                <td data-label="Email">{{ $user->email }}</td>

                <td data-label="IBAN" style="font-family: monospace;">{{ $user->iban ?? '---' }}</td>
                <td data-label="Firma" style="font-family: monospace;">{{ $user->firma_digital ?? 'No' }}</td>
                <td data-label="Saldo">
                    @if($user->suscripciones && $user->suscripciones->count() > 0)
                        @foreach($user->suscripciones as $su)
                            <div style="font-size: 11px; margin-bottom: 2px;">
                                <span style="background: #4BB7AE; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;">{{ $su->saldo_actual }}</span> 
                                <span style="color: #64748b;">{{ $su->suscripcion->tipo_credito }}</span>
                            </div>
                        @endforeach
                    @else
                        <span style="color: #94a3b8; font-size: 12px; font-style: italic;">Sin saldo</span>
                    @endif
                </td>

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
                            data-photo="{{ $user->foto_de_perfil }}"
                        >
                            <i class="fas fa-pencil-alt"></i>
                        </button>

                        {{-- SUSCRIPCIONES --}}
                        <button
                            type="button"
                            class="btn-icon js-view-subscriptions"
                            style="background-color: #4BB7AE; color: white;"
                            data-id="{{ $user->id }}"
                            data-name="{{ $user->name }}"
                            title="Gestionar Suscripciones"
                        >
                            <i class="fas fa-ticket-alt"></i>
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
                <td colspan="6" style="text-align:center; padding:30px; color:#94a3b8;">
                    No hay usuarios registrados aún.
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>
</div>