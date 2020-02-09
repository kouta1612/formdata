<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    private $file;
    private $filePath;

    public function upload(Request $request)
    {
        $this->setFile($request->file('file'));
        $this->saveFileToS3();

        return ['url' => $this->filePath];
    }
    private function setFile($file)
    {
        $this->file = $file;
    }

    private function saveFileToS3()
    {
        $path = Storage::put('test', $this->file, 'public');
        $this->setFilePath(Storage::url($path));
    }

    private function setFilePath($filePath)
    {
        $this->filePath = $filePath;
    }
}
