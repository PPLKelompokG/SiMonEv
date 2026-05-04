<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body>
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nama Program</th>
                <th>Kategori SDG</th>
                <th>Anggaran (Rp)</th>
                <th>Periode</th>
                <th>Status</th>
                <th>Tanggal Ditambahkan</th>
            </tr>
        </thead>
        <tbody>
            @foreach($programs as $index => $program)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $program->nama_program }}</td>
                <td>{{ $program->kategori_sdg }}</td>
                <td>{{ $program->anggaran }}</td>
                <td>{{ $program->periode }}</td>
                <td>{{ $program->status ? 'Aktif' : 'Nonaktif' }}</td>
                <td>{{ $program->created_at->format('Y-m-d') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
