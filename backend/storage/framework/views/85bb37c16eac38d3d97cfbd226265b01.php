<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>SiMonEv</title>
        <?php echo app('Illuminate\Foundation\Vite')->reactRefresh(); ?>
        <?php echo app('Illuminate\Foundation\Vite')(['resources/js/main.jsx']); ?>
    </head>
    <body class="antialiased">
        <div id="root"></div>
    </body>
</html>
<?php /**PATH C:\Users\acer\Documents\SEMESTER 6\Proyek Perangkat Lunak\SiMonEv\backend\resources\views/app.blade.php ENDPATH**/ ?>