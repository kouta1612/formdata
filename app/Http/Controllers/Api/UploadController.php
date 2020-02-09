<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UploadController extends Controller
{
    public function upload(Request $request)
    {
        $data = [
            'file' => $request->file,
            'size' => $request->size,
            'type' => $request->type,
        ];

        return $data;
    }
}
