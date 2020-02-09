<?php

namespace App\Utils;

use Illuminate\Support\Facades\Storage;

class Upload
{
    private $dir;
    private $file;
    private $filePath;

    public function __construct($dir, $file)
    {
        $this->dir = $dir;
        $this->file = $file;
    }

    public function saveFileToS3()
    {
        $path = Storage::put($this->dir, $this->file, 'public');
        $this->setFilePath(Storage::url($path));
    }

    public function getDir()
    {
        return $this->dir;
    }

    public function getFile()
    {
        return $this->file;
    }

    public function getFilePath()
    {
        return $this->filePath;
    }

    private function setFilePath($filePath)
    {
        $this->filePath = $filePath;
    }
}
