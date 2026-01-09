<table class="excel-table">
    <thead>
        <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>IBAN</th>
            <th>Firma Digital</th>
            <th width="150px">Acciones</th>
        </tr>
    </thead>

    <tbody>
        @foreach($users as $user)
        <tr>

            {{-- EDITAR --}}
            <form action="{{ route('users.update', $user->id) }}" method="POST">
                @csrf
                @method('PUT')

                <td>{{ $user->id }}</td>

                <td>
                    <input type="text" name="name" value="{{ $user->name }}" class="table-input">
                </td>

                <td>
                    <input type="email" name="email" value="{{ $user->email }}" class="table-input">
                </td>

                <td>
                    <input type="text" name="IBAN" value="{{ $user->IBAN }}" class="table-input">
                </td>

                <td>
                    <input type="text" name="firma_digital" value="{{ $user->firma_digital }}" class="table-input">
                </td>

                <td class="actions-cell">

                    {{-- Guardar --}}
                    <button type="submit" class="icon-btn save-btn">
                        <img src="/img/guardar.webp" class="action-icon">
                    </button>
            </form>

                    {{-- Borrar --}}
                    <form action="{{ route('users.destroy', $user->id) }}" method="POST">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="icon-btn delete-btn">
                            <img src="/img/borrar.webp" class="action-icon">
                        </button>
                    </form>

                </td>
        </tr>
        @endforeach
    </tbody>
</table>
