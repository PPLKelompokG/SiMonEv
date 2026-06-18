<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EvaluasiCapaian;
use App\Models\ProgramBantuan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EvaluasiCapaianController extends Controller
{
    /**
     * List all evaluations with optional filters.
     */
    public function index(Request $request)
    {
        $query = EvaluasiCapaian::with(['programBantuan', 'penilai']);

        if ($request->filled('program_id')) {
            $query->where('program_bantuan_id', $request->program_id);
        }

        if ($request->filled('periode')) {
            $query->where('periode', $request->periode);
        }

        if ($request->filled('status')) {
            $query->where('status_capaian', $request->status);
        }

        $data = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    /**
     * Create a new evaluation record.
     * skor_capaian and status_capaian are computed automatically.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'program_bantuan_id' => 'required|exists:program_bantuans,id',
            'periode'            => 'required|string|max:50',
            'nama_indikator'     => 'required|string|max:255',
            'satuan'             => 'required|string|max:50',
            'target'             => 'required|numeric|min:0.01',
            'realisasi'          => 'required|numeric|min:0',
            'catatan'            => 'nullable|string',
        ]);

        // Auto-compute score
        $skor = ($validated['realisasi'] / $validated['target']) * 100;
        $skor = round($skor, 2);

        if ($skor >= 100) {
            $status = 'melebihi_target';
        } elseif ($skor >= 80) {
            $status = 'tercapai';
        } else {
            $status = 'tidak_tercapai';
        }

        $evaluasi = EvaluasiCapaian::create([
            ...$validated,
            'skor_capaian'  => $skor,
            'status_capaian' => $status,
            'dinilai_oleh'  => Auth::id(),
        ]);

        $evaluasi->load(['programBantuan', 'penilai']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Evaluasi capaian berhasil disimpan.',
            'data'    => $evaluasi,
        ], 201);
    }

    /**
     * Show a single evaluation record.
     */
    public function show($id)
    {
        $evaluasi = EvaluasiCapaian::with(['programBantuan', 'penilai'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $evaluasi,
        ]);
    }

    /**
     * Update an existing evaluation record.
     */
    public function update(Request $request, $id)
    {
        $evaluasi = EvaluasiCapaian::findOrFail($id);

        $validated = $request->validate([
            'program_bantuan_id' => 'sometimes|exists:program_bantuans,id',
            'periode'            => 'sometimes|string|max:50',
            'nama_indikator'     => 'sometimes|string|max:255',
            'satuan'             => 'sometimes|string|max:50',
            'target'             => 'sometimes|numeric|min:0.01',
            'realisasi'          => 'sometimes|numeric|min:0',
            'catatan'            => 'nullable|string',
        ]);

        $evaluasi->fill($validated);

        // Recompute score
        $target = $evaluasi->target;
        $realisasi = $evaluasi->realisasi;
        $skor = ($realisasi / $target) * 100;
        $skor = round($skor, 2);

        if ($skor >= 100) {
            $status = 'melebihi_target';
        } elseif ($skor >= 80) {
            $status = 'tercapai';
        } else {
            $status = 'tidak_tercapai';
        }

        $evaluasi->skor_capaian = $skor;
        $evaluasi->status_capaian = $status;
        $evaluasi->save();

        $evaluasi->load(['programBantuan', 'penilai']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Evaluasi capaian berhasil diperbarui.',
            'data'    => $evaluasi,
        ]);
    }

    /**
     * Delete an evaluation record.
     */
    public function destroy($id)
    {
        $evaluasi = EvaluasiCapaian::findOrFail($id);
        $evaluasi->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Evaluasi capaian berhasil dihapus.',
        ]);
    }

    /**
     * Get aggregated statistics for the evaluations.
     */
    public function statistik(Request $request)
    {
        $query = EvaluasiCapaian::query();

        if ($request->filled('program_id')) {
            $query->where('program_bantuan_id', $request->program_id);
        }

        $total = (clone $query)->count();
        $tercapai = (clone $query)->where('status_capaian', 'tercapai')->count();
        $melebihi = (clone $query)->where('status_capaian', 'melebihi_target')->count();
        $tidakTercapai = (clone $query)->where('status_capaian', 'tidak_tercapai')->count();
        $rataRataSkor = (clone $query)->avg('skor_capaian');

        // Per-program summary
        $perProgram = EvaluasiCapaian::select(
                'program_bantuan_id',
                DB::raw('COUNT(*) as total_indikator'),
                DB::raw('AVG(skor_capaian) as rata_rata_skor'),
                DB::raw("SUM(CASE WHEN status_capaian IN ('tercapai', 'melebihi_target') THEN 1 ELSE 0 END) as total_tercapai"),
                DB::raw("SUM(CASE WHEN status_capaian = 'tidak_tercapai' THEN 1 ELSE 0 END) as total_tidak_tercapai")
            )
            ->with('programBantuan:id,nama_program,kategori_sdg')
            ->groupBy('program_bantuan_id')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total'            => $total,
                'tercapai'         => $tercapai,
                'melebihi'         => $melebihi,
                'tidak_tercapai'   => $tidakTercapai,
                'rata_rata_skor'   => round($rataRataSkor ?? 0, 2),
                'per_program'      => $perProgram,
            ],
        ]);
    }
}
