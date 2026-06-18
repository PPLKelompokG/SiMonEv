<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotifikasiController extends Controller
{
    // ── GET /notifikasi ───────────────────────────────────────────────────────
    /**
     * Ambil semua notifikasi milik user yang sedang login.
     * Urutan: belum-dibaca terlebih dahulu, lalu sudah-dibaca (terbaru di atas).
     */
    public function index(Request $request)
    {
        $perPage = min((int) $request->query('per_page', 20), 100);

        $notifikasi = $request->user()
            ->notifications()
            ->orderByRaw('read_at IS NOT NULL, created_at DESC')
            ->paginate($perPage);

        return response()->json([
            'message' => 'Data notifikasi berhasil diambil',
            'data'    => $notifikasi,
        ]);
    }

    // ── GET /notifikasi/unread-count ──────────────────────────────────────────
    /**
     * Jumlah notifikasi yang belum dibaca milik user saat ini.
     * Berguna untuk badge indicator di frontend.
     */
    public function unreadCount(Request $request)
    {
        $count = $request->user()->unreadNotifications()->count();

        return response()->json([
            'message'       => 'Jumlah notifikasi belum dibaca',
            'unread_count'  => $count,
        ]);
    }

    // ── POST /notifikasi/{id}/read ────────────────────────────────────────────
    /**
     * Tandai satu notifikasi sebagai sudah dibaca (isi field read_at).
     */
    public function markAsRead(Request $request, string $id)
    {
        /** @var \Illuminate\Notifications\DatabaseNotification|null $notifikasi */
        $notifikasi = $request->user()
            ->notifications()
            ->where('id', $id)
            ->first();

        if (!$notifikasi) {
            return response()->json(['message' => 'Notifikasi tidak ditemukan'], 404);
        }

        $notifikasi->markAsRead();

        return response()->json([
            'message'    => 'Notifikasi berhasil ditandai sebagai dibaca',
            'notifikasi' => $notifikasi,
        ]);
    }

    // ── POST /notifikasi/read-all ─────────────────────────────────────────────
    /**
     * Tandai semua notifikasi yang belum dibaca sebagai sudah dibaca.
     */
    public function markAllAsRead(Request $request)
    {
        $jumlah = $request->user()->unreadNotifications()->count();
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json([
            'message'         => "Semua notifikasi berhasil ditandai sebagai dibaca",
            'jumlah_diproses' => $jumlah,
        ]);
    }

    // ── DELETE /notifikasi/{id} ───────────────────────────────────────────────
    /**
     * Hapus satu notifikasi milik user yang sedang login.
     */
    public function destroy(Request $request, string $id)
    {
        $notifikasi = $request->user()
            ->notifications()
            ->where('id', $id)
            ->first();

        if (!$notifikasi) {
            return response()->json(['message' => 'Notifikasi tidak ditemukan'], 404);
        }

        $notifikasi->delete();

        return response()->json(['message' => 'Notifikasi berhasil dihapus']);
    }
}
