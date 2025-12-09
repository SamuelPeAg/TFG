<table class="excel-table">
    <thead>
        <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th width="150px">Acciones</th>
        </tr>
    </thead>

    <tbody>
        @foreach($trainers as $trainer)
        <tr>

            <td>
                <form action="{{ route('trainers.update', $trainer->id) }}" method="POST">
                    @csrf
                    @method('PUT')
                    <input type="text" name="name" value="{{ $trainer->name }}" class="table-input">
            </td>

            <td>
                    <input type="email" name="email" value="{{ $trainer->email }}" class="table-input">
            </td>

            <td class="actions-cell">

                <!-- Guardar -->
                <button type="submit" class="icon-btn save-btn">
                    <img src="/img/guardar.webp" class="action-icon save-icon">
                </button>
                </form>

                <!-- Borrar -->
                <form action="{{ route('trainers.destroy', $trainer->id) }}" method="POST">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="icon-btn delete-btn">
                        <img src="/img/borrar.webp" class="action-icon delete-icon">
                    </button>
                </form>

                <!-- Sesiones -->
                <a href="{{ route('sesiones', $trainer->id) }}" class="icon-btn sessions-btn">
                    <img src="/img/sesiones.webp" class="action-icon sessions-icon">
                </a>

            </td>

        </tr>
        @endforeach
    </tbody>
</table>
