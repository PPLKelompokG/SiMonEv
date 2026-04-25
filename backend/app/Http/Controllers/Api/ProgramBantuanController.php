<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProgramBantuan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProgramBantuanController extends Controller
{
    public function index()
    {
        $programs = ProgramBantuan::all();
        return response()->json([
            'success' => true,
            'message' => 'Daftar Program Bantuan',
            'data'    => $programs
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_program' => 'required|string|max:255',
            'kategori_sdg' => 'required|string|max:255',
            'anggaran'     => 'required|numeric|min:0',
            'periode'      => 'required|string|max:255',
            'status'       => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation Error',
                'errors'  => $validator->errors()
            ], 422);
        }

        $program = ProgramBantuan::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Program Bantuan berhasil ditambahkan',
            'data'    => $program
        ], 201);
    }

    public function show($id)
    {
        $program = ProgramBantuan::find($id);

        if (!$program) {
            return response()->json([
                'success' => false,
                'message' => 'Program Bantuan tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail Program Bantuan',
            'data'    => $program
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $program = ProgramBantuan::find($id);

        if (!$program) {
            return response()->json([
                'success' => false,
                'message' => 'Program Bantuan tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nama_program' => 'sometimes|string|max:255',
            'kategori_sdg' => 'sometimes|string|max:255',
            'anggaran'     => 'sometimes|numeric|min:0',
            'periode'      => 'sometimes|string|max:255',
            'status'       => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation Error',
                'errors'  => $validator->errors()
            ], 422);
        }

        $program->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Program Bantuan berhasil diperbarui',
            'data'    => $program
        ], 200);
    }

    public function destroy($id)
    {
        $program = ProgramBantuan::find($id);

        if (!$program) {
            return response()->json([
                'success' => false,
                'message' => 'Program Bantuan tidak ditemukan'
            ], 404);
        }

        $program->delete();

        return response()->json([
            'success' => true,
            'message' => 'Program Bantuan berhasil dihapus'
        ], 200);
    }
}
