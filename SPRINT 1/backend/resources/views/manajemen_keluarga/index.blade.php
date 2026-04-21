@extends('layouts.app') {{-- sesuaikan dengan layout kamu --}}

@section('content')
<div class="p-6">
    <h1 class="text-2xl font-bold mb-2">Manajemen Data Keluarga</h1>
    <p class="mb-4 text-gray-400">Kelola informasi anggota keluarga penerima manfaat</p>

    <a href="#" class="bg-blue-500 text-white px-4 py-2 rounded mb-4 inline-block">
        + Tambah Anggota
    </a>

    <div class="bg-gray-800 p-4 rounded-lg">
        <table class="w-full text-left">
            <thead>
                <tr class="border-b border-gray-600">
                    <th>Nama</th>
                    <th>Usia</th>
                    <th>Hubungan</th>
                    <th>Pekerjaan</th>
                    <th>Pendidikan</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                <tr class="border-b border-gray-700">
                    <td>Ahmad Susanto</td>
                    <td>42</td>
                    <td>Kepala Keluarga</td>
                    <td>Buruh</td>
                    <td>SD</td>
                    <td>
                        <button class="text-yellow-400">Edit</button>
                        <button class="text-red-400 ml-2">Hapus</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
@endsection