<!DOCTYPE html>
<html>
<head>
    <title>Edit Anggota</title>

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
    <h4 class="fw-bold">Edit Anggota</h4>
    <p class="text-muted">Perbarui data anggota keluarga</p>

    <!-- CARD -->
    <div class="card card-custom p-4">

        <form action="{{ route('family.update', $member->id) }}" method="POST">
            @csrf
            @method('PUT')

            <div class="mb-3">
                <label class="form-label">Nama</label>
                <input type="text" name="name" class="form-control" value="{{ $member->name }}">
            </div>

            <div class="mb-3">
                <label class="form-label">Usia</label>
                <input type="number" name="age" class="form-control" value="{{ $member->age }}">
            </div>

            <div class="mb-3">
                <label class="form-label">Hubungan</label>
                <select name="relationship" class="form-control">
                    <option {{ $member->relationship=='Head'?'selected':'' }}>Head</option>
                    <option {{ $member->relationship=='Spouse'?'selected':'' }}>Spouse</option>
                    <option {{ $member->relationship=='Child'?'selected':'' }}>Child</option>
                </select>
            </div>

            <div class="mb-3">
                <label class="form-label">Pekerjaan</label>
                <input type="text" name="job" class="form-control" value="{{ $member->job }}">
            </div>

            <div class="mb-3">
                <label class="form-label">Pendidikan</label>
                <input type="text" name="education" class="form-control" value="{{ $member->education }}">
            </div>

            <div class="d-flex justify-content-between">
                <a href="{{ route('family.index') }}" class="btn btn-secondary">Kembali</a>
                <button type="submit" class="btn btn-primary">Update</button>
            </div>

        </form>

    </div>

</div>

</body>
</html>