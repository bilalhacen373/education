<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FileController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware(['role:school_admin'])->group(function () {
    Route::post('/files/upload', [FileController::class, 'upload'])->name('api.files.upload');
    Route::post('/files/upload-multiple', [FileController::class, 'uploadMultiple'])->name('api.files.upload-multiple');
    Route::post('/files/delete', [FileController::class, 'delete'])->name('api.files.delete');
    Route::post('/files/delete-multiple', [FileController::class, 'deleteMultiple'])->name('api.files.delete-multiple');
    Route::post('/files/download', [FileController::class, 'download'])->name('api.files.download');
});
