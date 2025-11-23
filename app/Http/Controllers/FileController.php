<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:' . $this->getMaxFileSize($request->type),
            'type' => 'required|in:image,document,video,audio',
            'folder' => 'nullable|string',
        ]);

        $file = $request->file('file');
        $type = $request->type;
        $folder = $request->folder ?? $type . 's';

        $this->validateFileType($file, $type);

        $filename = Str::random(40) . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs($folder, $filename, 'public');

        return response()->json([
            'success' => true,
            'file' => [
                'path' => $path,
                'url' => Storage::disk('public')->url($path),
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ],
        ]);
    }

    public function uploadMultiple(Request $request)
    {
        $request->validate([
            'files' => 'required|array|max:10',
            'files.*' => 'file|max:' . $this->getMaxFileSize($request->type),
            'type' => 'required|in:image,document,video,audio',
            'folder' => 'nullable|string',
        ]);

        $files = $request->file('files');
        $type = $request->type;
        $folder = $request->folder ?? $type . 's';
        $uploadedFiles = [];

        foreach ($files as $file) {
            $this->validateFileType($file, $type);

            $filename = Str::random(40) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs($folder, $filename, 'public');

            $uploadedFiles[] = [
                'path' => $path,
                'url' => Storage::disk('public')->url($path),
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ];
        }

        return response()->json([
            'success' => true,
            'files' => $uploadedFiles,
        ]);
    }

    public function delete(Request $request)
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        $path = $request->path;

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);

            return response()->json([
                'success' => true,
                'message' => 'تم حذف الملف بنجاح',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'الملف غير موجود',
        ], 404);
    }

    public function deleteMultiple(Request $request)
    {
        $request->validate([
            'paths' => 'required|array',
            'paths.*' => 'string',
        ]);

        $paths = $request->paths;
        $deleted = [];
        $notFound = [];

        foreach ($paths as $path) {
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
                $deleted[] = $path;
            } else {
                $notFound[] = $path;
            }
        }

        return response()->json([
            'success' => true,
            'deleted' => $deleted,
            'not_found' => $notFound,
            'message' => 'تم حذف ' . count($deleted) . ' ملف',
        ]);
    }

    public function download(Request $request)
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        $path = $request->path;

        if (!Storage::disk('public')->exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'الملف غير موجود',
            ], 404);
        }

        return Storage::disk('public')->download($path);
    }

    private function validateFileType($file, $type)
    {
        $mimeTypes = [
            'image' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
            'document' => [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/plain',
            ],
            'video' => ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
            'audio' => ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
        ];

        if (!in_array($file->getMimeType(), $mimeTypes[$type])) {
            abort(422, 'نوع الملف غير مسموح به');
        }
    }

    private function getMaxFileSize($type)
    {
        $sizes = [
            'image' => 5120,
            'document' => 10240,
            'video' => 102400,
            'audio' => 20480,
        ];

        return $sizes[$type] ?? 5120;
    }
}
