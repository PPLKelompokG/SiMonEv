<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    public function index()
    {
        \Illuminate\Support\Facades\Gate::authorize('admin');

        $users = User::latest()->get();

        return response()->json([
            'message' => 'Data user berhasil diambil',
            'data' => $users,
        ]);
    }

    public function store(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('admin');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'min:6'],
            'role' => ['required', Rule::in(['admin', 'supervisor', 'petugas_lapangan'])],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => $validated['role'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'User berhasil ditambahkan',
            'data' => $user,
        ], 201);
    }

    public function show($id)
    {
        \Illuminate\Support\Facades\Gate::authorize('admin');

        $user = User::findOrFail($id);

        return response()->json([
            'message' => 'Detail user',
            'data' => $user,
        ]);
    }

    public function update(Request $request, $id)
    {
        \Illuminate\Support\Facades\Gate::authorize('admin');

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'min:6'],
            'role' => ['required', Rule::in(['admin', 'supervisor', 'petugas_lapangan'])],
            'is_active' => ['required', 'boolean'],
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];
        $user->is_active = $validated['is_active'];

        if (!empty($validated['password'])) {
            $user->password = $validated['password'];
        }

        $user->save();

        return response()->json([
            'message' => 'User berhasil diupdate',
            'data' => $user,
        ]);
    }
}