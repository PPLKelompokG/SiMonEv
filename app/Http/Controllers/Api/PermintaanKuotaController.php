<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PermintaanKuota;
use App\Models\ProgramBantuan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PermintaanKuotaController extends Controller
{
    public function index()
    {
        $requests = PermintaanKuota::with(['programBantuan', 'requester:id,name'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $requests
        ], 200);
    }

    public function store(Request $request)
    {
        if (auth()->user()->role !== 'petugas_lapangan') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Hanya Petugas Lapangan yang dapat mengajukan permintaan kuota.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'program_bantuan_id' => 'required|exists:program_bantuans,id',
            'jumlah_kuota' => 'required|integer|min:1',
            'justifikasi' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $quotaRequest = PermintaanKuota::create([
            'program_bantuan_id' => $request->program_bantuan_id,
            'jumlah_kuota' => $request->jumlah_kuota,
            'justifikasi' => $request->justifikasi,
            'status' => 'Pending',
            'requested_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permintaan kuota berhasil diajukan',
            'data' => $quotaRequest->load('programBantuan')
        ], 201);
    }

    public function getPrograms()
    {
        $programs = ProgramBantuan::select('id', 'nama_program', 'kuota')->get();

        return response()->json([
            'success' => true,
            'data' => $programs
        ], 200);
    }

    public function updateStatus(Request $request, $id)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Hanya Admin yang dapat memproses permintaan kuota.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:Approved,Rejected',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $quotaRequest = PermintaanKuota::findOrFail($id);

        if ($quotaRequest->status !== 'Pending') {
            return response()->json([
                'success' => false,
                'message' => 'Permintaan kuota sudah diproses sebelumnya.'
            ], 400);
        }

        $quotaRequest->status = $request->status;
        $quotaRequest->save();

        if ($request->status === 'Approved') {
            $program = ProgramBantuan::findOrFail($quotaRequest->program_bantuan_id);
            $program->kuota += $quotaRequest->jumlah_kuota;
            $program->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Status permintaan kuota berhasil diperbarui.',
            'data' => $quotaRequest->load('programBantuan')
        ]);
    }
}
