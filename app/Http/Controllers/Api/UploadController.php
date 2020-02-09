<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Utils\Upload;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function upload(Request $request)
    {
        $upload = new Upload('test', $request->file);
        $upload->saveFileToS3();

        return ['url' => $upload->getFilePath()];
    }
}
