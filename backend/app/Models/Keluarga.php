@extends('layouts.app')

@section('content')
<div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Manajemen Data Keluarga</h1>

    <!-- FORM TAMBAH -->
    <form method="POST" action="/manajemen-keluarga" class="mb-6">
        @csrf
        <div class="grid grid-cols-5 gap-2">
            <input name="nama" placeholder="Nama" class="p-2 rounded bg-gray-700 text-white">
            <input name="usia" placeholder="Usia" class="p-2 rounded bg-gray-700 text-white">
            <input name="hubungan" placeholder="Hubungan" class="p-2 rounded bg-gray-700 text-white">
            <input name="pekerjaan" placeholder="Pekerjaan" class="p-2 rounded bg-gray-700 text-white">
            <input name="pendidikan" placeholder="Pendidikan" class="p-2 rounded bg-gray-700 text-white">
        </div>
        <button class="mt-2 bg-blue-500 px-4 py-2 rounded">Tambah</button>
    </form>

    <!-- TABEL -->
    <table class="w-full">
        <thead>
            <tr class="border-b">
                <th>Nama</th>
                <th>Usia</th>
                <th>Hubungan</th>
                <th>Pekerjaan</th>
                <th>Pendidikan</th>
                <th>Aksi</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $d)
            <tr class="border-b">
                <td>{{ $d->nama }}</td>
                <td>{{ $d->usia }}</td>
                <td>{{ $d->hubungan }}</td>
                <td>{{ $d->pekerjaan }}</td>
                <td>{{ $d->pendidikan }}</td>
                <td>
                    <form method="POST" action="/manajemen-keluarga/{{ $d->id }}">
                        @csrf
                        @method('DELETE')
                        <button class="text-red-500">Hapus</button>
                    </form>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endsection