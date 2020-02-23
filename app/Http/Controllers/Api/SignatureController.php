<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Utils\Signature;
use Illuminate\Http\Request;

class SignatureController extends Controller
{
    public function store(Request $request)
    {
        $signature = new Signature($request);
        $fileName = md5(rand()) . '.' . str_replace('image/', '', $request->type);
        $signature->setFileKey("uploads/{$fileName}");
        $datas = $signature->create();

        return $datas;
    }
}
