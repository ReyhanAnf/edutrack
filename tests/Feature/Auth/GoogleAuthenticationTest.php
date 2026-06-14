<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;

function fakeGoogleUser(array $overrides = []): SocialiteUser
{
    $user = new SocialiteUser;

    return $user->setRaw(array_merge([
        'sub' => 'google-123',
        'name' => 'Google Student',
        'email' => 'student@example.com',
        'picture' => 'https://example.com/avatar.jpg',
    ], $overrides))->map([
        'id' => $overrides['sub'] ?? 'google-123',
        'nickname' => null,
        'name' => $overrides['name'] ?? 'Google Student',
        'email' => $overrides['email'] ?? 'student@example.com',
        'avatar' => $overrides['picture'] ?? 'https://example.com/avatar.jpg',
    ]);
}

function mockGoogleCallback(SocialiteUser $googleUser): void
{
    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->once()->andReturn($googleUser);

    Socialite::shouldReceive('driver')
        ->once()
        ->with('google')
        ->andReturn($provider);
}

test('users can register using google', function () {
    mockGoogleCallback(fakeGoogleUser());

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('dashboard', absolute: false));
    $this->assertAuthenticated();

    $this->assertDatabaseHas('users', [
        'name' => 'Google Student',
        'email' => 'student@example.com',
        'google_id' => 'google-123',
        'avatar' => 'https://example.com/avatar.jpg',
    ]);
});

test('google login links an existing email account', function () {
    $user = User::factory()->create([
        'email' => 'student@example.com',
        'google_id' => null,
        'password' => Hash::make('password'),
    ]);

    mockGoogleCallback(fakeGoogleUser());

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('dashboard', absolute: false));
    $this->assertAuthenticatedAs($user);

    expect($user->refresh())
        ->google_id->toBe('google-123')
        ->avatar->toBe('https://example.com/avatar.jpg')
        ->email_verified_at->not->toBeNull();
});
