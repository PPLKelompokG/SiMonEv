<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Program Bantuan</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        h2 { text-align: center; }
        .badge { padding: 4px 8px; border-radius: 4px; color: white; font-size: 10px; }
        .bg-success { background-color: #28a745; }
        .bg-danger { background-color: #dc3545; }
    </style>
</head>
<body>
    <h2>Laporan SiMonEv - Program Bantuan</h2>
    <p>Periode: {{ request('start_date') ?: 'Awal' }} s/d {{ request('end_date') ?: 'Sekarang' }}</p>
    
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nama Program</th>
                <th>Kategori SDG</th>
                <th>Anggaran (Rp)</th>
                <th>Periode</th>
                <th>Status</th>
                <th>Tanggal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($programs as $index => $program)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $program->nama_program }}</td>
                <td>{{ $program->kategori_sdg }}</td>
                <td>Rp {{ number_format($program->anggaran, 0, ',', '.') }}</td>
                <td>{{ $program->periode }}</td>
                <td>
                    <span class="badge {{ $program->status ? 'bg-success' : 'bg-danger' }}">
                        {{ $program->status ? 'Aktif' : 'Nonaktif' }}
                    </span>
                </td>
                <td>{{ $program->created_at->format('d-m-Y') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
