<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ArticleController;

Route::get('/test', function () {
    return ['message' => 'API is working!'];
});

Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/pending', [ArticleController::class, 'getPending']);
Route::get('/articles/{id}', [ArticleController::class, 'show']);
Route::put('/articles/{id}', [ArticleController::class, 'update']);