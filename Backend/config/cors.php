<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Allowed origins are read from CORS_ALLOWED_ORIGINS env variable.
    | In production set this to: https://angkor-electronic-1qgb.vercel.app
    | For local dev include: http://localhost:3000
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(
        array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', 'https://angkor-electronic-1qgb.vercel.app,http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173')))
    ),

    'allowed_origins_patterns' => [
        '#^https://.*\.vercel\.app$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Set-Cookie'],

    'max_age' => 86400,

    'supports_credentials' => true,

];
