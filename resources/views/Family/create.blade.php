<!DOCTYPE html>
<html>
<head>
    <title>Tambah Anggota</title>

    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <style>
        body {
            background-color: #f5f7fa;
        }
        .card-custom {
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .btn-primary {
            border-radius: 8px;
        }
        .form-control {
            border-radius: 8px;
        }
    </style>
</head>
<body>

<div class="container mt-5">

    <!-- HEADER -->
    <h4 class="fw-bold">Tambah Anggota</h4>
    <p class="text-muted">Tambahkan data anggota keluarga</p>

    <!-- CARD -->
    <div class="card card-custom p-4">

        <form action="{{ route('family.store') }}" method="POST">
            @csrf

            <div class="mb-3">
                <label class="form-label">Nama</label>
                <input type="text" name="name" class="form-control" placeholder="Masukkan nama">
            </div>

            <div class="mb-3">
                <label class="form-label">Usia</label>
                <input type="number" name="age" class="form-control" placeholder="Masukkan usia">
            </div>

            <div class="mb-3">
                <label class="form-label">Hubungan</label>
                <select name="relationship" class="form-control">
                    <option>Head</option>
                    <option>Spouse</option>
                    <option>Child</option>
                </select>
            </div>

            <div class="mb-3">
                <label class="form-label">Pekerjaan</label>
                <input type="text" name="job" class="form-control" placeholder="Masukkan pekerjaan">
            </div>

            <div class="mb-3">
                <label class="form-label">Pendidikan</label>
                <input type="text" name="education" class="form-control" placeholder="Masukkan pendidikan">
            </div>

            <div class="d-flex justify-content-between">
                <a href="{{ route('family.index') }}" class="btn btn-secondary">Kembali</a>
                <button type="submit" class="btn btn-primary">Simpan</button>
            </div>

        </form>

    </div>

</div>

</body>
</html>