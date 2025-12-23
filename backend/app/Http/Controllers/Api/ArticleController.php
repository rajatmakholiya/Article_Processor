<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function index()
    {
        return response()->json(Article::orderBy('created_at', 'desc')->get());
    }
    
    public function getPending()
    {
        $article = Article::where('status', 'pending')->first();

        if (!$article) {
            return response()->json(['message' => 'No pending articles'], 404);
        }

        $article->update(['status' => 'processing']);

        return response()->json($article);
    }

    public function show($id)
    {
        $article = Article::find($id);
        if (!$article) return response()->json(['error' => 'Not Found'], 404);
        return response()->json($article);
    }

    public function update(Request $request, $id)
    {
        $article = Article::find($id);
        if (!$article) return response()->json(['error' => 'Not Found'], 404);

        $article->update($request->all());

        return response()->json([
            'message' => 'Article updated successfully',
            'article' => $article
        ]);
    }
}