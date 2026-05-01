<!DOCTYPE html>
<html>
<head>
    <title>Manajemen Data Keluarga</title>

    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- Icon -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">

    <style>
        body {
            background-color: #f5f7fa;
        }
        .card-custom {
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .header-title {
            font-weight: 600;
        }
        .sub-title {
            color: #888;
            font-size: 14px;
        }
        .btn-primary {
            border-radius: 8px;
        }
        table td {
            vertical-align: middle;
        }
        .action-btn i {
            margin: 0 5px;
            cursor: pointer;
        }
        .fa-pen {
            color: #0d6efd;
        }
        .fa-trash {
            color: red;
        }
    </style>
</head>
<body>

<div class="container mt-5">

    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
            <h4 class="header-title">Manajemen Data Keluarga</h4>
            <div class="sub-title">Kelola informasi anggota keluarga penerima manfaat</div>
        </div>

        <a href="{{ route('family.create') }}" class="btn btn-primary">
            <i class="fa fa-plus"></i> Tambah Anggota
        </a>
    </div>

    <!-- CARD -->
    <div class="card card-custom p-3">

        <h6 class="mb-3"><i class="fa fa-users"></i> Anggota Keluarga</h6>

        <table class="table table-hover">
            <thead class="table-light">
                <tr>
                    <th>Nama</th>
                    <th>Usia</th>
                    <th>Hubungan</th>
                    <th>Pekerjaan</th>
                    <th>Pendidikan</th>
                    <th class="text-center">Aksi</th>
                </tr>
            </thead>

            <tbody>
                @forelse($members as $m)
                <tr>
                    <td>{{ $m->name }}</td>
                    <td>{{ $m->age }}</td>
                    <td>{{ $m->relationship }}</td>
                    <td>{{ $m->job }}</td>
                    <td>{{ $m->education }}</td>

                    <td class="text-center action-btn">
                        <!-- EDIT -->
                        <a href="{{ route('family.edit', $m->id) }}">
                            <i class="fa fa-pen"></i>
                        </a>

                        <!-- DELETE -->
                        <form action="{{ route('family.destroy', $m->id) }}" method="POST" style="display:inline;">
                            @csrf
                            @method('DELETE')
                            <button style="border:none;background:none;">
                                <i class="fa fa-trash"></i>
                            </button>
                        </form>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        Belum ada data
                    </td>
                </tr>
                @endforelse
            </tbody>

        </table>

    </div>

</div>

</body>
</html>