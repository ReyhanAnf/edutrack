<?php

namespace App\Http\Controllers\Api;

use App\Domains\ArtificialIntelligence\Actions\ParseUrlContentAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AiAssistantController extends Controller
{
    public function parseUrl(Request $request, ParseUrlContentAction $action)
    {
        $request->validate([
            'url' => 'required|url',
        ]);

        $result = $action->execute($request->url);

        if (isset($result['error'])) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }
}
