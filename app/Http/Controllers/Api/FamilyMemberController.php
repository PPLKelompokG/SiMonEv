<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FamilyMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FamilyMemberController extends Controller
{
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'penerima_bantuan_id' => 'required|exists:penerima_bantuans,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $members = FamilyMember::where('penerima_bantuan_id', $request->penerima_bantuan_id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $members
        ]);
    }

    public function store(Request $request)
    {
        if (auth()->user()->role !== 'petugas_lapangan') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Hanya Petugas Lapangan yang dapat mengelola data anggota keluarga.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'penerima_bantuan_id' => 'required|exists:penerima_bantuans,id',
            'name' => 'required|string|max:255',
            'age' => 'required|integer|min:0',
            'relationship' => 'required|string|max:255',
            'job' => 'nullable|string|max:255',
            'education' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $member = FamilyMember::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Anggota keluarga berhasil ditambahkan',
            'data' => $member
        ], 201);
    }

    public function update(Request $request, $id)
    {
        if (auth()->user()->role !== 'petugas_lapangan') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Hanya Petugas Lapangan yang dapat mengelola data anggota keluarga.'
            ], 403);
        }

        $member = FamilyMember::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'age' => 'required|integer|min:0',
            'relationship' => 'required|string|max:255',
            'job' => 'nullable|string|max:255',
            'education' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $member->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Anggota keluarga berhasil diperbarui',
            'data' => $member
        ]);
    }

    public function destroy($id)
    {
        if (auth()->user()->role !== 'petugas_lapangan') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Hanya Petugas Lapangan yang dapat mengelola data anggota keluarga.'
            ], 403);
        }

        $member = FamilyMember::findOrFail($id);
        $member->delete();

        return response()->json([
            'success' => true,
            'message' => 'Anggota keluarga berhasil dihapus'
        ]);
    }
}
