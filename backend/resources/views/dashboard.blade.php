<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Dashboard
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

            <!-- WELCOME -->
            <div class="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Selamat Datang 👋
                </h3>
                <p class="text-gray-500 mt-1">
                    Kamu sudah login dan bisa mengelola data penerima bantuan.
                </p>
            </div>

            <!-- STATISTIK -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

                <!-- TOTAL KELUARGA -->
                <div class="bg-blue-500 text-white p-6 rounded-2xl shadow">
                    <h3 class="text-lg font-semibold">
                        Total Anggota Keluarga
                    </h3>
                    <p class="text-3xl font-bold mt-2">
                        {{ $jumlahKeluarga }}
                    </p>
                </div>

                <!-- CARD TAMBAHAN (BIAR KELIHATAN FULL) -->
                <div class="bg-green-500 text-white p-6 rounded-2xl shadow">
                    <h3 class="text-lg font-semibold">
                        Status Sistem
                    </h3>
                    <p class="text-xl mt-2">
                        Aktif
                    </p>
                </div>

                <div class="bg-purple-500 text-white p-6 rounded-2xl shadow">
                    <h3 class="text-lg font-semibold">
                        User Login
                    </h3>
                    <p class="text-xl mt-2">
                        {{ Auth::user()->name ?? 'Guest' }}
                    </p>
                </div>

            </div>

            <!-- MENU FITUR -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

                <!-- VERIFIKASI DATA -->
                <div class="bg-gray-800 hover:bg-gray-700 transition p-6 rounded-2xl shadow">
                    <h3 class="text-white text-lg font-semibold mb-2">
                        Verifikasi Data
                    </h3>
                    <p class="text-gray-400 text-sm mb-4">
                        Validasi data penerima bantuan
                    </p>

                    <a href="#" class="text-blue-400 hover:text-blue-300 text-sm">
                        Masuk →
                    </a>
                </div>

                <!-- MANAJEMEN KELUARGA -->
                <div class="bg-gray-800 hover:bg-gray-700 transition p-6 rounded-2xl shadow">
                    <h3 class="text-white text-lg font-semibold mb-2">
                        Manajemen Keluarga
                    </h3>
                    <p class="text-gray-400 text-sm mb-4">
                        Kelola anggota keluarga penerima bantuan
                    </p>

                    <a href="/manajemen-keluarga" class="text-blue-400 hover:text-blue-300 text-sm">
                        Masuk →
                    </a>
                </div>

            </div>

        </div>
    </div>
</x-app-layout>