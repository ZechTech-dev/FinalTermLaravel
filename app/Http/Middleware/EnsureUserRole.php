<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        abort_unless($user, 401);

        $databaseRole = (string) $user->role;
        $spatieRoles = $user->getRoleNames()->all();
        $allowed = collect($roles)->flatMap(fn ($role) => explode('|', $role))->filter()->values();

        abort_unless($allowed->contains($databaseRole) && $allowed->intersect($spatieRoles)->isNotEmpty(), 403);

        return $next($request);
    }
}
