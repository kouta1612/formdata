<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Utils\Upload;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    private $request;
    private $fileKey;
    private $now;
    private $bucket;
    private $accessKey;
    private $region;
    private $secret;
    private $url;
    private $policy;
    private $dateKey;
    private $dateRegionKey;
    private $dateRegionServiceKey;
    private $signingKey;
    private $signature;
    private $data;

    public function policies(Request $request)
    {
        $this->setRequest($request);
        $this->setNow(time());
        // AWS設定
        $this->setFileKey('test');
        $this->setBucket(config('filesystems.disks.s3.bucket'));
        $this->setAccessKey(config('filesystems.disks.s3.key'));
        $this->setRegion(config('filesystems.disks.s3.region'));
        $this->setSecret(config('filesystems.disks.s3.secret'));
        $this->setUrl('https://' . $this->bucket . '.s3.amazonaws.com');
        // ポリシー作成
        $this->setPolicy();
        // 署名作成
        $this->setDateKey();
        $this->setDateRegionKey();
        $this->setDateRegionServiceKey();
        $this->setSigningKey();
        // シグネチャ作成
        $this->setSignature();
        // POSTデータ作成
        $this->setData();

        return [
            'url' => $this->url,
            'date' => $this->data
        ];
    }

    public function upload(Request $request)
    {
        // S3にファイルをアップロード
        $upload = new Upload('test', $request->file);
        $upload->saveFileToS3();

        return ['url' => $upload->getFilePath()];
    }

    private function setRequest($request)
    {
        $this->request = $request;
    }

    private function setFileKey($fileKey)
    {
        $this->fileKey = $fileKey;
    }

    private function setNow($now)
    {
        $this->now = $now;
    }

    private function setBucket($bucket)
    {
        $this->bucket = $bucket;
    }

    private function setAccessKey($accessKey)
    {
        $this->accessKey = $accessKey;
    }

    private function setRegion($region)
    {
        $this->region = $region;
    }

    private function setSecret($secret)
    {
        $this->secret = $secret;
    }

    private function setUrl($url)
    {
        $this->url = $url;
    }

    private function setPolicy()
    {
        $policyDocument = [
            'expiration' => gmdate('Y-m-d\TH:i:s.000\Z', $this->now + 60),
            'conditions' => [
                ['bucket' => config('filesystems.disks.s3.bucket')],
                ['key' => $this->fileKey],
                ['Content-Type' => $this->request->contentType],
                ['content-length-range', $this->request->size, $this->request->size],
                ['acl' => 'public-read'],
                ['success_action_status' => '201'],
                ['x-amz-algorithm' => 'AWS4-HMAC-SHA256'],
                ['x-amz-credential' => implode('/', [config('filesystems.disks.s3.key'), gmdate('Ymd', $this->now), config('filesystems.disks.s3.region'), 's3', 'aws4_request'])],
                ['x-amz-date' => gmdate('Ymd\THis\Z', $this->now)]
            ]
        ];
        $this->policy = base64_encode(json_encode($policyDocument));
    }

    private function setDateKey()
    {
        $this->dateKey = hash_hmac(
            'sha256',
            gmdate('Ymd', $this->now),
            'AWS4' . $this->secret,
            true
        );
    }

    private function setDateRegionKey()
    {
        $this->dateRegionKey = hash_hmac('sha256', $this->region, $this->dateKey, true);
    }

    private function setDateRegionServiceKey()
    {
        $this->dateRegionServiceKey = hash_hmac('sha256', 's3', $this->dateRegionKey, true);
    }

    private function setSigningKey()
    {
        $this->signingKey = hash_hmac('sha256', 'aws4_request', $this->dateRegionServiceKey, true);
    }

    private function setSignature()
    {
        $this->signature = hash_hmac('sha256', $this->policy, $this->signingKey, false);
    }

    private function setData()
    {
        $this->data = [
            'bucket' => $this->bucket,
            'key' => $this->fileKey,
            'Content-Type' => $this->request->type,
            'acl' => 'public-read',
            'success_action_status' => 201,
            'policy' => $this->policy,
            'x-amz-credential' => implode('/', [
                $this->accessKey, gmdate('Ymd', $this->now), $this->region, 's3', 'aws4_request'
            ]),
            'x-amz-signature' => $this->signature,
            'x-amz-algorithm' => 'AWS4-HMAC-SHA256',
            'x-amz-date' => gmdate('Ymd\THis\Z', $this->now)
        ];
    }
}
