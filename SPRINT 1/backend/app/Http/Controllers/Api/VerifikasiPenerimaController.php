<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PenerimaBantuan;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VerifikasiPenerimaController extends Controller
{
    public function pending()
    {
        \Illuminate\Support\Facades\Gate::authorize('verify-penerima');

        $data = PenerimaBantuan::where('status', 'diajukan')
            ->with('creator')
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Data penerima menunggu verifikasi',
            'data' => $data,
        ]);
    }

    public function verify(Request $request, $id)
    {
        \Illuminate\Support\Facades\Gate::authorize('verify-penerima');

        $validated = $request->validate([
            'status' => ['required', Rule::in(['disetujui', 'ditolak'])],
            'catatan_verifikasi' => ['nullable', 'string'],
        ]);

        $penerima = PenerimaBantuan::findOrFail($id);

        $penerima->status = $validated['status'];
        $penerima->catatan_verifikasi = $validated['catatan_verifikasi'] ?? null;
        $penerima->verified_by = auth()->id();
        $penerima->verified_at = now();
        $penerima->save();

        return response()->json([
            'message' => 'Verifikasi berhasil disimpan',
            'data' => $penerima,
        ]);
    }
}