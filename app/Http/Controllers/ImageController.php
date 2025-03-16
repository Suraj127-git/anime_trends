<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Image;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ImageController extends Controller
{
    public function generate(Request $request)
    {
        Log::info('Starting image generation process', ['user_id' => $request->user()->id]);

        // Validate request parameters
        $validated = $request->validate([
            'prompt' => 'required|string|max:500',
        ]);

        Log::info('Request validated successfully', ['prompt' => $validated['prompt']]);

        // Send the prompt to your AI service (Hugging Face API)
        Log::info('Sending request to Hugging Face API', [
            'api_url' => env('HUGGINGFACEHUB_API_URL'),
            'prompt' => $validated['prompt']
        ]);

        $response = Http::withToken(env('HUGGINGFACEHUB_API_TOKEN'))
            ->withHeaders([
                'Content-Type' => 'application/json'
            ])
            ->timeout(5 * 60) // 5 minutes timeout in seconds
            ->post(env('HUGGINGFACEHUB_API_URL'), [
                'inputs' => $validated['prompt']
            ]);

        if ($response->failed()) {
            Log::error('Image generation API request failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return redirect()->back()->withErrors(['error' => 'Image generation failed']);
        }

        Log::info('Successfully received response from API');
        Log::info('Response body:', ['body' => $response->body()]);

        // Process binary image data returned from the API
        $imageBinary = $response->body();
        $imageName = Str::uuid() . '.jpg';
        $storagePath = "generated_images/{$imageName}";

        // Save the binary image to the public disk
        Storage::disk('public')->put($storagePath, $imageBinary);

        // Retrieve the public URL to the stored image
        $imageUrl = Storage::disk('public')->url($storagePath);
        Log::info('Image saved successfully', ['image_url' => $imageUrl]);

        // Store image metadata in the database
        try {
            $uuid = (string) Str::uuid();
            DB::insert(
                'INSERT INTO images (id, user_id, prompt, model_used, parameters, storage_path, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    $uuid,
                    $request->user()->id,
                    $validated['prompt'],
                    'huggingface',
                    json_encode(['api_version' => '1.0']),
                    $imageUrl,
                    now(),
                    now()
                ]
            );
            
            // Fetch the inserted record for consistency
            $image = DB::table('images')->where('id', $uuid)->first();

            Log::info('Image metadata stored successfully', ['image_id' => $image->id]);
        } catch (\Exception $e) {
            Log::error('Failed to store image metadata', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->withErrors(['error' => 'Failed to store image metadata']);
        }

        Log::info('Image generation process completed successfully', ['image_id' => $image->id]);

        // Return a valid Inertia response
        return Inertia::render('dashboard', [
            'image' => $image,
            'imageUrl' => $imageUrl
        ]);
    }
}
