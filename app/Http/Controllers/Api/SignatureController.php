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
        $signature->setFileKey($request->name);
        $datas = $signature->create();

        return $datas;
    }
}
