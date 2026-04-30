<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtAuthMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $header = $request->header('Authorization', '');
        if (!str_starts_with($header, 'Bearer ')) {
            return response()->json(['success' => false, 'message' => 'Token requerido'], 401);
        }

        try {
            $token   = substr($header, 7);
            $decoded = JWT::decode($token, new Key(config('app.jwt_secret'), 'HS256'));
            $request->merge(['user_id' => $decoded->sub, 'user_role' => $decoded->role ?? 'CLIENT']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Token inválido'], 401);
        }

        return $next($request);
    }
}
