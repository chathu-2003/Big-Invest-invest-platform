<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function csrf()
    {
        return response()->json(['success' => true, 'data' => ['token' => csrf_token()]])->header('Cache-Control', 'no-store');
    }

    public function login(Request $request)
    {
        $values = $request->validate(['email' => ['required', 'email', 'max:254'], 'password' => ['required', 'string', 'max:255']]);
        $values['email'] = strtolower($values['email']);
        if (! Auth::attempt([...$values, 'is_admin' => true])) {
            throw ValidationException::withMessages(['email' => ['The login details could not be verified.']]);
        }
        $request->session()->regenerate();

        return $this->me($request);
    }

    public function me(Request $request)
    {
        return response()->json(['success' => true, 'data' => $request->user()->only(['id', 'name', 'email'])])->header('Cache-Control', 'no-store');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['success' => true, 'message' => 'Signed out.']);
    }
}
