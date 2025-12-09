<table class="excel-table">
    <thead>
        <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th width="150px">Acciones</th>
        </tr>
    </thead>

    <tbody>
        @foreach($trainers as $trainer)
        <tr>

            <td>{{ $trainer->id }}</td>

            <td>
                <form action="{{ route('trainers.update', $trainer->id) }}" method="POST">
                    @csrf
                    @method('PUT')
                    <input type="text" name="name" value="{{ $trainer->name }}" class="table-input">
            </td>

            <td>
                    <input type="email" name="email" value="{{ $trainer->email }}" class="table-input">
            </td>

            <td class="d-flex gap-2 align-items-center actions-cell">
                    <button type="submit" class="btn btn-primary btn-sm">
                        <img src="/img/guardar.webp" width="20">
                    </button>
                </form>

                <form action="{{ route('trainers.destroy', $trainer->id) }}" method="POST">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="btn btn-danger btn-sm">
                        <img src="/img/borrar.webp" width="20">
                    </button>
                </form>

                <a href="{{ route('sesiones', $trainer->id) }}" class="btn btn-sm sesiones">
                    <img src="/img/sesiones.webp" width="20">
                </a>
            </td>

        </tr>
        @endforeach
    </tbody>
</table>
