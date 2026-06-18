<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Scheduler: Pengingat Jadwal Distribusi Bantuan
|--------------------------------------------------------------------------
| Command dijalankan setiap hari pukul 07:00 WIB.
| Logic internal command yang menentukan apakah notifikasi perlu dikirim
| (tgl 1, 8, atau 15 tiap bulan) dan apakah distribusi sudah tercatat.
|
| Untuk menjalankan scheduler secara lokal:
|   php artisan schedule:run
|
| Untuk produksi, tambahkan cron entry di server:
|   * * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
*/
Schedule::command('notifikasi:kirim-pengingat-distribusi')
    ->dailyAt('07:00')
    ->timezone('Asia/Jakarta')
    ->withoutOverlapping()
    ->runInBackground()
    ->appendOutputTo(storage_path('logs/scheduler-notifikasi.log'));
