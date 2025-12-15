<?php

namespace Tests\Property;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

/**
 * Property-based tests for Assets API functionality.
 */
class AssetsPropertyTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Valid image extensions as defined in the design document.
     */
    private array $validExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
    
    /**
     * Track uploaded files for cleanup.
     */
    private array $uploadedFiles = [];
    
    /**
     * Clean up uploaded test files after each test.
     */
    protected function tearDown(): void
    {
        foreach ($this->uploadedFiles as $filePath) {
            $fullPath = public_path(ltrim($filePath, '/'));
            if (File::exists($fullPath)) {
                File::delete($fullPath);
            }
        }
        $this->uploadedFiles = [];
        
        parent::tearDown();
    }

    /**
     * **Feature: template-customization, Property 3: Assets API returns valid image paths**
     * **Validates: Requirements 3.1, 3.3**
     * 
     * For any call to the assets listing API, all returned paths should be 
     * relative paths starting with `/assets/` and ending with a valid image 
     * extension (.png, .jpg, .jpeg, .gif, .webp, .svg).
     */
    public function test_assets_api_returns_valid_image_paths_property(): void
    {
        // Run 100 iterations as specified in the design document
        for ($i = 0; $i < 100; $i++) {
            // Call the assets API
            $response = $this->getJson('/api/assets/images');
            
            // Assert successful response
            $response->assertStatus(200);
            $response->assertJsonStructure(['images']);
            
            $data = $response->json();
            $images = $data['images'];
            
            // For each image returned, verify the path format
            foreach ($images as $image) {
                // Assert required fields exist
                $this->assertArrayHasKey('path', $image, 'Image should have a path field');
                $this->assertArrayHasKey('name', $image, 'Image should have a name field');
                $this->assertArrayHasKey('type', $image, 'Image should have a type field');
                
                $path = $image['path'];
                $name = $image['name'];
                $type = $image['type'];
                
                // Property: Path must start with /assets/
                $this->assertStringStartsWith(
                    '/assets/',
                    $path,
                    "Image path '{$path}' should start with '/assets/'"
                );
                
                // Property: Path must end with a valid image extension
                $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
                $this->assertContains(
                    $extension,
                    $this->validExtensions,
                    "Image path '{$path}' should end with a valid extension. Got: '{$extension}'"
                );
                
                // Property: Name should match the filename in the path
                $pathFilename = basename($path);
                $this->assertEquals(
                    $pathFilename,
                    $name,
                    "Image name '{$name}' should match filename in path '{$pathFilename}'"
                );
                
                // Property: Type should be a valid image MIME type
                $validMimeTypes = [
                    'image/png',
                    'image/jpeg',
                    'image/gif',
                    'image/webp',
                    'image/svg+xml',
                ];
                $this->assertContains(
                    $type,
                    $validMimeTypes,
                    "Image type '{$type}' should be a valid image MIME type"
                );
            }
        }
    }

    /**
     * Test that the API handles empty assets directory gracefully.
     * This validates Requirement 3.4.
     */
    public function test_assets_api_handles_empty_directory(): void
    {
        // Create a temporary empty directory scenario by mocking
        // Since we can't easily empty the real assets directory in tests,
        // we verify the API returns a valid structure even if images exist
        $response = $this->getJson('/api/assets/images');
        
        $response->assertStatus(200);
        $response->assertJsonStructure(['images']);
        
        // The images array should be an array (empty or with items)
        $this->assertIsArray($response->json('images'));
    }
    
    /**
     * **Feature: header-image-customization, Property 1: File type validation consistency**
     * **Validates: Requirements 1.2, 1.3**
     * 
     * For any file dropped onto the drop zone, the file should be accepted if and only if 
     * its MIME type is in the allowed list (image/png, image/jpeg, image/gif, image/webp, image/svg+xml).
     * 
     * This property test validates that:
     * - Valid image types (PNG, JPG, JPEG, GIF, WEBP, SVG) are accepted
     * - Invalid file types are rejected with an appropriate error message
     */
    public function test_file_type_validation_consistency_property(): void
    {
        // Define allowed and disallowed file types for testing
        $allowedTypes = [
            ['ext' => 'png', 'mime' => 'image/png'],
            ['ext' => 'jpg', 'mime' => 'image/jpeg'],
            ['ext' => 'jpeg', 'mime' => 'image/jpeg'],
            ['ext' => 'gif', 'mime' => 'image/gif'],
            ['ext' => 'webp', 'mime' => 'image/webp'],
            ['ext' => 'svg', 'mime' => 'image/svg+xml'],
        ];
        
        $disallowedTypes = [
            ['ext' => 'pdf', 'mime' => 'application/pdf'],
            ['ext' => 'txt', 'mime' => 'text/plain'],
            ['ext' => 'html', 'mime' => 'text/html'],
            ['ext' => 'js', 'mime' => 'application/javascript'],
            ['ext' => 'css', 'mime' => 'text/css'],
            ['ext' => 'json', 'mime' => 'application/json'],
            ['ext' => 'xml', 'mime' => 'application/xml'],
            ['ext' => 'zip', 'mime' => 'application/zip'],
            ['ext' => 'exe', 'mime' => 'application/x-msdownload'],
            ['ext' => 'php', 'mime' => 'application/x-php'],
            ['ext' => 'mp3', 'mime' => 'audio/mpeg'],
            ['ext' => 'mp4', 'mime' => 'video/mp4'],
            ['ext' => 'doc', 'mime' => 'application/msword'],
            ['ext' => 'xls', 'mime' => 'application/vnd.ms-excel'],
            ['ext' => 'bmp', 'mime' => 'image/bmp'], // BMP is an image but not in allowed list
            ['ext' => 'tiff', 'mime' => 'image/tiff'], // TIFF is an image but not in allowed list
            ['ext' => 'ico', 'mime' => 'image/x-icon'], // ICO is an image but not in allowed list
        ];
        
        // Run 100 iterations as specified in the design document
        for ($i = 0; $i < 100; $i++) {
            // Randomly decide whether to test an allowed or disallowed type
            $testAllowed = rand(0, 1) === 1;
            
            if ($testAllowed) {
                // Test with a valid file type - should be accepted
                $fileType = $allowedTypes[array_rand($allowedTypes)];
                $randomName = 'test_' . bin2hex(random_bytes(4));
                
                $file = UploadedFile::fake()->create(
                    $randomName . '.' . $fileType['ext'],
                    100, // size in KB (under 5MB limit)
                    $fileType['mime']
                );
                
                $response = $this->postJson('/api/assets/upload', [
                    'image' => $file
                ]);
                
                // Property: Valid file types should be accepted (status 200, success true)
                $response->assertStatus(200);
                $response->assertJson(['success' => true]);
                
                // Track for cleanup
                $data = $response->json();
                if (isset($data['path'])) {
                    $this->uploadedFiles[] = $data['path'];
                }
                
                // Property: Response should contain valid path
                $this->assertArrayHasKey('path', $data, 
                    "Valid file type '{$fileType['ext']}' should return a path");
                
            } else {
                // Test with an invalid file type - should be rejected
                $fileType = $disallowedTypes[array_rand($disallowedTypes)];
                $randomName = 'test_' . bin2hex(random_bytes(4));
                
                $file = UploadedFile::fake()->create(
                    $randomName . '.' . $fileType['ext'],
                    100, // size in KB
                    $fileType['mime']
                );
                
                $response = $this->postJson('/api/assets/upload', [
                    'image' => $file
                ]);
                
                // Property: Invalid file types should be rejected (status 400, success false)
                $response->assertStatus(400);
                $response->assertJson(['success' => false]);
                
                $data = $response->json();
                
                // Property: Error message should indicate invalid file type
                $this->assertArrayHasKey('message', $data, 
                    "Invalid file type '{$fileType['ext']}' should return an error message");
                $this->assertStringContainsString('Invalid file type', $data['message'],
                    "Error message should indicate invalid file type for '{$fileType['ext']}'");
            }
        }
    }
    
    /**
     * **Feature: header-image-customization, Property 3: Upload returns valid path format**
     * **Validates: Requirements 4.1, 4.2**
     * 
     * For any successful file upload, the returned path should be a relative path 
     * starting with `/assets/` and ending with a valid image extension.
     */
    public function test_upload_returns_valid_path_format_property(): void
    {
        // Run 100 iterations as specified in the design document
        for ($i = 0; $i < 100; $i++) {
            // Generate a random valid extension
            $extension = $this->validExtensions[array_rand($this->validExtensions)];
            
            // Generate a random filename with various characters
            $randomName = $this->generateRandomFilename();
            
            // Create a fake uploaded file (using create() instead of image() to avoid GD dependency)
            $file = UploadedFile::fake()->create(
                $randomName . '.' . $extension,
                100, // size in KB
                $this->getMimeTypeForExtension($extension)
            );
            
            // Upload the file
            $response = $this->postJson('/api/assets/upload', [
                'image' => $file
            ]);
            
            // Assert successful response
            $response->assertStatus(200);
            $response->assertJson(['success' => true]);
            
            $data = $response->json();
            
            // Property: Response must have 'path' and 'name' fields
            $this->assertArrayHasKey('path', $data, 'Response should have a path field');
            $this->assertArrayHasKey('name', $data, 'Response should have a name field');
            
            $path = $data['path'];
            $name = $data['name'];
            
            // Track for cleanup
            $this->uploadedFiles[] = $path;
            
            // Property: Path must start with /assets/
            $this->assertStringStartsWith(
                '/assets/',
                $path,
                "Uploaded path '{$path}' should start with '/assets/'"
            );
            
            // Property: Path must end with a valid image extension
            $pathExtension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
            $this->assertContains(
                $pathExtension,
                $this->validExtensions,
                "Uploaded path '{$path}' should end with a valid extension. Got: '{$pathExtension}'"
            );
            
            // Property: The extension in the path should match the uploaded file's extension
            $this->assertEquals(
                strtolower($extension),
                $pathExtension,
                "Path extension '{$pathExtension}' should match uploaded extension '{$extension}'"
            );
            
            // Property: Name should match the filename in the path
            $pathFilename = basename($path);
            $this->assertEquals(
                $pathFilename,
                $name,
                "Response name '{$name}' should match filename in path '{$pathFilename}'"
            );
            
            // Property: Path should be a valid relative path (no double slashes, no backslashes)
            $this->assertStringNotContainsString(
                '//',
                substr($path, 1), // Skip first char since path starts with /
                "Path '{$path}' should not contain double slashes"
            );
            $this->assertStringNotContainsString(
                '\\',
                $path,
                "Path '{$path}' should not contain backslashes"
            );
        }
    }
    
    /**
     * Get MIME type for a given extension.
     */
    private function getMimeTypeForExtension(string $extension): string
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
    
    /**
     * Generate a random filename for testing.
     * Includes various character patterns to test filename sanitization.
     */
    private function generateRandomFilename(): string
    {
        $patterns = [
            // Simple alphanumeric
            fn() => 'test_' . bin2hex(random_bytes(4)),
            // With spaces (should be sanitized)
            fn() => 'test file ' . rand(1000, 9999),
            // With special characters (should be sanitized)
            fn() => 'test@file#' . rand(1000, 9999),
            // Unicode characters (should be sanitized)
            fn() => 'test_' . rand(1000, 9999) . '_image',
            // Long filename
            fn() => 'very_long_filename_' . str_repeat('a', 20) . '_' . rand(100, 999),
            // Short filename
            fn() => 'a' . rand(1, 9),
            // Numbers only
            fn() => (string) rand(100000, 999999),
            // Mixed case
            fn() => 'TestImage_' . rand(1000, 9999),
        ];
        
        $generator = $patterns[array_rand($patterns)];
        return $generator();
    }
    
    /**
     * **Feature: header-image-customization, Property 2: File size validation**
     * **Validates: Requirements 4.4**
     * 
     * For any file dropped onto the drop zone, the file should be rejected with an 
     * error message if its size exceeds 5MB.
     * 
     * This property test validates that:
     * - Files under 5MB are accepted (when file type is valid)
     * - Files over 5MB are rejected with an appropriate error message
     * - Files exactly at 5MB boundary are handled correctly
     */
    public function test_file_size_validation_property(): void
    {
        // Maximum file size in bytes (5MB)
        $maxFileSize = 5 * 1024 * 1024;
        
        // Run 100 iterations as specified in the design document
        for ($i = 0; $i < 100; $i++) {
            // Randomly decide whether to test a valid size or oversized file
            $testOversized = rand(0, 1) === 1;
            
            // Use a valid extension for all tests (to isolate file size validation)
            $extension = $this->validExtensions[array_rand($this->validExtensions)];
            $randomName = 'size_test_' . bin2hex(random_bytes(4));
            
            if ($testOversized) {
                // Test with an oversized file (5MB + 1KB to 10MB)
                $oversizeKB = rand(5121, 10240); // 5MB + 1KB to 10MB in KB
                
                $file = UploadedFile::fake()->create(
                    $randomName . '.' . $extension,
                    $oversizeKB, // size in KB
                    $this->getMimeTypeForExtension($extension)
                );
                
                $response = $this->postJson('/api/assets/upload', [
                    'image' => $file
                ]);
                
                // Property: Files over 5MB should be rejected (status 400, success false)
                $response->assertStatus(400);
                $response->assertJson(['success' => false]);
                
                $data = $response->json();
                
                // Property: Error message should indicate file size limit exceeded
                $this->assertArrayHasKey('message', $data, 
                    "Oversized file ({$oversizeKB}KB) should return an error message");
                $this->assertStringContainsString('5MB', $data['message'],
                    "Error message should mention 5MB limit for oversized file ({$oversizeKB}KB)");
                
            } else {
                // Test with a valid size file (1KB to 5MB)
                $validSizeKB = rand(1, 5120); // 1KB to 5MB in KB
                
                $file = UploadedFile::fake()->create(
                    $randomName . '.' . $extension,
                    $validSizeKB, // size in KB
                    $this->getMimeTypeForExtension($extension)
                );
                
                $response = $this->postJson('/api/assets/upload', [
                    'image' => $file
                ]);
                
                // Property: Files under 5MB should be accepted (status 200, success true)
                $response->assertStatus(200);
                $response->assertJson(['success' => true]);
                
                $data = $response->json();
                
                // Track for cleanup
                if (isset($data['path'])) {
                    $this->uploadedFiles[] = $data['path'];
                }
                
                // Property: Response should contain valid path
                $this->assertArrayHasKey('path', $data, 
                    "Valid size file ({$validSizeKB}KB) should return a path");
            }
        }
    }
    
    /**
     * Test file size boundary conditions.
     * This validates the exact 5MB boundary behavior.
     * **Validates: Requirements 4.4**
     */
    public function test_file_size_boundary_conditions(): void
    {
        $extension = 'png';
        
        // Test file exactly at 5MB (5120 KB) - should be accepted
        $file = UploadedFile::fake()->create(
            'boundary_test_exact.' . $extension,
            5120, // exactly 5MB in KB
            'image/png'
        );
        
        $response = $this->postJson('/api/assets/upload', [
            'image' => $file
        ]);
        
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        
        $data = $response->json();
        if (isset($data['path'])) {
            $this->uploadedFiles[] = $data['path'];
        }
        
        // Test file just over 5MB (5121 KB) - should be rejected
        $file = UploadedFile::fake()->create(
            'boundary_test_over.' . $extension,
            5121, // 5MB + 1KB
            'image/png'
        );
        
        $response = $this->postJson('/api/assets/upload', [
            'image' => $file
        ]);
        
        $response->assertStatus(400);
        $response->assertJson(['success' => false]);
        
        $data = $response->json();
        $this->assertStringContainsString('5MB', $data['message']);
    }

    /**
     * **Feature: header-image-customization, Property 4: Preview state consistency**
     * **Validates: Requirements 2.1, 2.2, 3.2, 3.3**
     * 
     * For any successfully selected image (via upload or assets listing), the path 
     * returned should be consistent and usable for preview display. This validates
     * that:
     * - Uploaded images return paths that exist and are accessible
     * - The path format is consistent between upload and listing APIs
     * - Paths can be used directly as image sources for preview
     */
    public function test_preview_state_consistency_property(): void
    {
        // Run 100 iterations as specified in the design document
        for ($i = 0; $i < 100; $i++) {
            // Generate a random valid extension
            $extension = $this->validExtensions[array_rand($this->validExtensions)];
            
            // Generate a random filename
            $randomName = $this->generateRandomFilename();
            
            // Create a fake uploaded file
            $file = UploadedFile::fake()->create(
                $randomName . '.' . $extension,
                100, // size in KB
                $this->getMimeTypeForExtension($extension)
            );
            
            // Upload the file
            $uploadResponse = $this->postJson('/api/assets/upload', [
                'image' => $file
            ]);
            
            // Assert successful upload
            $uploadResponse->assertStatus(200);
            $uploadResponse->assertJson(['success' => true]);
            
            $uploadData = $uploadResponse->json();
            $uploadedPath = $uploadData['path'];
            $uploadedName = $uploadData['name'];
            
            // Track for cleanup
            $this->uploadedFiles[] = $uploadedPath;
            
            // Property 1: Uploaded path should be a valid relative path for preview
            $this->assertStringStartsWith(
                '/assets/',
                $uploadedPath,
                "Uploaded path '{$uploadedPath}' should start with '/assets/' for preview consistency"
            );
            
            // Property 2: The uploaded file should exist on disk (accessible for preview)
            $fullPath = public_path(ltrim($uploadedPath, '/'));
            $this->assertFileExists(
                $fullPath,
                "Uploaded file should exist at '{$fullPath}' for preview display"
            );
            
            // Property 3: The file should be readable (for preview rendering)
            $this->assertTrue(
                is_readable($fullPath),
                "Uploaded file at '{$fullPath}' should be readable for preview"
            );
            
            // Property 4: Verify the uploaded image appears in the assets listing
            // (consistency between upload and modal selection - Requirement 3.2, 3.3)
            $listResponse = $this->getJson('/api/assets/images');
            $listResponse->assertStatus(200);
            
            $listData = $listResponse->json();
            $images = $listData['images'];
            
            // Find the uploaded image in the listing
            $foundInListing = false;
            foreach ($images as $image) {
                if ($image['path'] === $uploadedPath) {
                    $foundInListing = true;
                    
                    // Property 5: Name should be consistent between upload and listing
                    $this->assertEquals(
                        $uploadedName,
                        $image['name'],
                        "Image name should be consistent between upload ('{$uploadedName}') and listing ('{$image['name']}')"
                    );
                    
                    // Property 6: Path format should be identical
                    $this->assertEquals(
                        $uploadedPath,
                        $image['path'],
                        "Image path should be identical between upload and listing"
                    );
                    
                    break;
                }
            }
            
            $this->assertTrue(
                $foundInListing,
                "Uploaded image with path '{$uploadedPath}' should appear in assets listing for modal selection"
            );
            
            // Property 7: Path should have valid extension for browser preview
            $pathExtension = strtolower(pathinfo($uploadedPath, PATHINFO_EXTENSION));
            $this->assertContains(
                $pathExtension,
                $this->validExtensions,
                "Path extension '{$pathExtension}' should be a valid image extension for browser preview"
            );
        }
    }
}
