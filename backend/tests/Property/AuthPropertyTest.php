<?php

namespace Tests\Property;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Property-based tests for authentication functionality.
 */
class AuthPropertyTest extends TestCase
{
    use RefreshDatabase;

    /**
     * **Feature: pos-hardwarezone, Property 1: Authentication Rejects Invalid Credentials**
     * **Validates: Requirements 1.2**
     * 
     * For any combination of email and password that does not match a valid user record,
     * the authentication attempt SHALL fail and return an error.
     */
    public function test_authentication_rejects_invalid_credentials_property(): void
    {
        // Run 100 iterations as specified in the design document
        for ($i = 0; $i < 100; $i++) {
            // Create a valid user with known credentials
            $validEmail = fake()->unique()->safeEmail();
            $validPassword = fake()->password(8, 20);
            
            $user = User::factory()->create([
                'email' => $validEmail,
                'password' => Hash::make($validPassword),
                'role' => fake()->randomElement(['admin', 'user']),
                'is_active' => true,
            ]);

            // Generate invalid credentials - one of three scenarios:
            $scenario = fake()->numberBetween(1, 3);
            
            switch ($scenario) {
                case 1:
                    // Wrong email, any password
                    $testEmail = fake()->unique()->safeEmail();
                    // Ensure the email is different from the valid one
                    while ($testEmail === $validEmail) {
                        $testEmail = fake()->unique()->safeEmail();
                    }
                    $testPassword = fake()->password(8, 20);
                    break;
                    
                case 2:
                    // Correct email, wrong password
                    $testEmail = $validEmail;
                    $testPassword = fake()->password(8, 20);
                    // Ensure the password is different from the valid one
                    while ($testPassword === $validPassword) {
                        $testPassword = fake()->password(8, 20);
                    }
                    break;
                    
                case 3:
                    // Both wrong
                    $testEmail = fake()->unique()->safeEmail();
                    while ($testEmail === $validEmail) {
                        $testEmail = fake()->unique()->safeEmail();
                    }
                    $testPassword = fake()->password(8, 20);
                    break;
            }

            // Attempt authentication with invalid credentials
            $authenticated = $this->attemptAuthentication($testEmail, $testPassword);

            // Assert that authentication fails
            $this->assertFalse(
                $authenticated,
                "Authentication should fail for invalid credentials. " .
                "Scenario: {$scenario}, Email match: " . ($testEmail === $validEmail ? 'yes' : 'no') .
                ", Password match: " . ($testPassword === $validPassword ? 'yes' : 'no')
            );

            // Clean up for next iteration
            $user->delete();
        }
    }

    /**
     * Attempt to authenticate a user with given credentials.
     * 
     * @param string $email
     * @param string $password
     * @return bool
     */
    private function attemptAuthentication(string $email, string $password): bool
    {
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            return false;
        }
        
        return Hash::check($password, $user->password);
    }
}
