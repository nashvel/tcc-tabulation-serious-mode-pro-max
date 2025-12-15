<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class AssetsController extends Controller
{
    /**
     * Valid image extensions for upload and listing.
     */
    private const VALID_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
    
    /**
     * Maximum file size in bytes (5MB).
     */
    private const MAX_FILE_SIZE = 5 * 1024 * 1024;

    /**
     * List available images from the public assets directory.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function listImages()
    {
        $assetsPath = public_path('assets');
        $images = [];
        
        if (File::isDirectory($assetsPath)) {
            $files = File::allFiles($assetsPath);
            
            foreach ($files as $file) {
                $extension = strtolower($file->getExtension());
                
                if (in_array($extension, self::VALID_EXTENSIONS)) {
                    $relativePath = '/assets/' . str_replace('\\', '/', $file->getRelativePathname());
                    
                    $images[] = [
                        'path' => $relativePath,
                        'name' => $file->getFilename(),
                        'type' => $this->getMimeType($extension),
                    ];
                }
            }
        }
        
        return response()->json(['images' => $images]);
    }
    
    /**
     * Upload an image file to the public assets directory.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function upload(Request $request)
    {
        // Check if file was uploaded
        if (!$request->hasFile('image')) {
            return response()->json([
                'success' => false,
                'message' => 'No image file provided'
            ], 400);
        }
        
        $file = $request->file('image');
        
        // Validate file type by extension
        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, self::VALID_EXTENSIONS)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid file type. Allowed: png, jpg, jpeg, gif, webp, svg'
            ], 400);
        }
        
        // Validate file size (max 5MB)
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            return response()->json([
                'success' => false,
                'message' => 'File size exceeds 5MB limit'
            ], 400);
        }
        
        // Generate unique filename with timestamp
        $timestamp = time();
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $originalName);
        $filename = $safeName . '-' . $timestamp . '.' . $extension;
        
        // Store file in public/assets directory
        $destinationPath = public_path('assets');
        
        // Ensure directory exists
        if (!File::isDirectory($destinationPath)) {
            File::makeDirectory($destinationPath, 0755, true);
        }
        
        try {
            $file->move($destinationPath, $filename);
            
            return response()->json([
                'success' => true,
                'path' => '/assets/' . $filename,
                'name' => $filename
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload file: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get MIME type for image extension.
     * 
     * @param string $extension
     * @return string
     */
    private function getMimeType(string $extension): string
    {
        $mimeTypes = [
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml',
        ];
        
        return $mimeTypes[$extension] ?? 'application/octet-stream';
    }
}
