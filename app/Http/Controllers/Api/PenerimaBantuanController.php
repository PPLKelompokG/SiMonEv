<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PenerimaBantuan;
use Illuminate\Http\Request;

class PenerimaBantuanController extends Controller
{
    public function index(Request $request)
    {
        $query = PenerimaBantuan::with(['creator', 'verifier', 'penyaluranBantuan.programBantuan']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%");
            });
        }

        if ($request->filled('wilayah')) {
            $query->where('wilayah', 'like', "%{$request->wilayah}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('program_id')) {
            $query->whereHas('penyaluranBantuan', function($q) use ($request) {
                $q->where('program_bantuan_id', $request->program_id);
            });
        }

        // Optional pagination
        if ($request->boolean('paginate')) {
            $data = $query->latest()->paginate($request->get('per_page', 15));
        } else {
            $data = $query->latest()->get();
        }

        return response()->json([
            'message' => 'Data penerima berhasil diambil',
            'data' => $data,
        ]);
    }

    public function export(Request $request)
    {
        $query = PenerimaBantuan::with(['penyaluranBantuan.programBantuan']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%");
            });
        }

        if ($request->filled('wilayah')) {
            $query->where('wilayah', 'like', "%{$request->wilayah}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('program_id')) {
            $query->whereHas('penyaluranBantuan', function($q) use ($request) {
                $q->where('program_bantuan_id', $request->program_id);
            });
        }

        $data = $query->latest()->get();

        $csvFileName = 'data_penerima_bantuan_' . date('Y-m-d_H-i-s') . '.csv';
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$csvFileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use($data) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['NIK', 'Nama', 'Alamat', 'Wilayah', 'Kondisi Ekonomi', 'Jumlah Tanggungan', 'Status', 'Program yang Diikuti']);

            foreach ($data as $row) {
                $programs = $row->penyaluranBantuan->map(function($pb) {
                    return $pb->programBantuan ? $pb->programBantuan->nama_program : '';
                })->filter()->unique()->implode(', ');

                fputcsv($file, [
                    "'" . $row->nik, // add quote to prevent excel formatting as scientific
                    $row->nama,
                    $row->alamat,
                    $row->wilayah,
                    $row->kondisi_ekonomi,
                    $row->jumlah_tanggungan,
                    $row->status,
                    $programs
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nik' => ['required', 'digits:16', 'unique:penerima_bantuans,nik'],
            'nama' => ['required', 'string', 'max:255'],
            'alamat' => ['required', 'string'],
            'wilayah' => ['nullable', 'string', 'max:255'],
            'kondisi_ekonomi' => ['required', 'string', 'max:255'],
            'jumlah_tanggungan' => ['required', 'integer', 'min:0'],
            'foto_ktp' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);

        $fotoPath = null;
        if ($request->hasFile('foto_ktp')) {
            $fotoPath = $request->file('foto_ktp')->store('ktp', 'public');
        }

        $penerima = PenerimaBantuan::create([
            'nik' => $validated['nik'],
            'nama' => $validated['nama'],
            'alamat' => $validated['alamat'],
            'wilayah' => $validated['wilayah'] ?? null,
            'kondisi_ekonomi' => $validated['kondisi_ekonomi'],
            'jumlah_tanggungan' => $validated['jumlah_tanggungan'],
            'foto_ktp' => $fotoPath,
            'status' => 'diajukan',
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Penerima bantuan berhasil didaftarkan',
            'data' => $penerima,
        ], 201);
    }
}