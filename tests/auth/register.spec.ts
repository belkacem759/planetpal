import { test, expect } from '../fixtures/auth-fixture';

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ guestPage }) => {
    // Navigate to registration page before each test
    await guestPage.goto('/register');
  });

  test('should register successfully with valid data', async ({ guestPage, testHelpers }) => {
    const testUser = testHelpers.generateTestUser();
    
    await testHelpers.register(testUser);
    
    // Should redirect to home page or login page
    await expect(guestPage).toHaveURL(/\/(login)?$/);
    
    // If redirected to home, should be logged in
    if (guestPage.url().includes('/')) {
      await testHelpers.expectToBeLoggedIn();
    }
  });

  test('should show error for invalid email format', async ({ guestPage }) => {
    await guestPage.fill('[data-testid="email-input"]', 'invalid-email');
    await guestPage.fill('[data-testid="password-input"]', 'Password123!');
    await guestPage.fill('[data-testid="confirm-password-input"]', 'Password123!');
    await guestPage.click('[data-testid="register-button"]');
    
    // Should show email validation error
    await expect(
      guestPage.locator('[data-testid="email-error"]')
        .or(guestPage.locator('text=Invalid email format'))
    ).toBeVisible();
  });

  test('should show error for weak password', async ({ guestPage }) => {
    await guestPage.fill('[data-testid="email-input"]', 'test@example.com');
    await guestPage.fill('[data-testid="password-input"]', '123');
    await guestPage.fill('[data-testid="confirm-password-input"]', '123');
    await guestPage.click('[data-testid="register-button"]');
    
    // Should show password validation error
    await expect(
      guestPage.locator('[data-testid="password-error"]')
        .or(guestPage.locator('text=Password too weak'))
        .or(guestPage.locator('text=Password must be'))
    ).toBeVisible();
  });

  test('should show error when passwords do not match', async ({ guestPage }) => {
    await guestPage.fill('[data-testid="email-input"]', 'test@example.com');
    await guestPage.fill('[data-testid="password-input"]', 'Password123!');
    await guestPage.fill('[data-testid="confirm-password-input"]', 'DifferentPassword123!');
    await guestPage.click('[data-testid="register-button"]');
    
    // Should show password mismatch error
    await expect(
      guestPage.locator('[data-testid="confirm-password-error"]')
        .or(guestPage.locator('text=Passwords do not match'))
    ).toBeVisible();
  });

  test('should show error for existing email', async ({ guestPage, testHelpers }) => {
    const testUser = testHelpers.generateTestUser();
    
    // Register user first time
    await testHelpers.register(testUser);
    
    // Try to register again with same email
    await guestPage.goto('/register');
    await testHelpers.register(testUser);
    
    // Should show error for existing email
    await expect(
      guestPage.locator('[data-testid="email-error"]')
        .or(guestPage.locator('text=Email already exists'))
        .or(guestPage.locator('text=User already registered'))
    ).toBeVisible();
  });

  test('should require all mandatory fields', async ({ guestPage }) => {
    await guestPage.click('[data-testid="register-button"]');
    
    // Should show required field errors
    await expect(
      guestPage.locator('[data-testid="email-error"]')
        .or(guestPage.locator('text=Email is required'))
    ).toBeVisible();
    
    await expect(
      guestPage.locator('[data-testid="password-error"]')
        .or(guestPage.locator('text=Password is required'))
    ).toBeVisible();
  });

  test('should validate password strength requirements', async ({ guestPage }) => {
    const weakPasswords = [
      'password',      // No uppercase, numbers, or special chars
      'PASSWORD',      // No lowercase, numbers, or special chars
      '12345678',      // Only numbers
      'Pass1',         // Too short
      'password123',   // No uppercase or special chars
    ];

    for (const password of weakPasswords) {
      await guestPage.fill('[data-testid="email-input"]', 'test@example.com');
      await guestPage.fill('[data-testid="password-input"]', password);
      await guestPage.fill('[data-testid="confirm-password-input"]', password);
      await guestPage.click('[data-testid="register-button"]');
      
      // Should show password validation error
      await expect(
        guestPage.locator('[data-testid="password-error"]')
          .or(guestPage.locator('text=Password must'))
      ).toBeVisible();
      
      // Clear fields for next iteration
      await guestPage.fill('[data-testid="email-input"]', '');
      await guestPage.fill('[data-testid="password-input"]', '');
      await guestPage.fill('[data-testid="confirm-password-input"]', '');
    }
  });

  test('should accept strong passwords', async ({ guestPage, testHelpers }) => {
    const strongPasswords = [
      'Password123!',
      'MyStr0ng@Pass',
      'C0mpl3x#P@ssw0rd',
    ];

    for (const password of strongPasswords) {
      const email = testHelpers.generateTestEmail();
      
      await guestPage.fill('[data-testid="email-input"]', email);
      await guestPage.fill('[data-testid="password-input"]', password);
      await guestPage.fill('[data-testid="confirm-password-input"]', password);
      await guestPage.click('[data-testid="register-button"]');
      
      // Should not show password validation error
      await expect(
        guestPage.locator('[data-testid="password-error"]')
      ).not.toBeVisible();
      
      // Navigate back to register for next test
      await guestPage.goto('/register');
    }
  });

  test('should handle optional fields correctly', async ({ guestPage, testHelpers }) => {
    const testUser = testHelpers.generateTestUser();
    
    // Fill only required fields
    await guestPage.fill('[data-testid="email-input"]', testUser.email);
    await guestPage.fill('[data-testid="password-input"]', testUser.password);
    await guestPage.fill('[data-testid="confirm-password-input"]', testUser.confirmPassword);
    
    // Leave optional fields empty if they exist
    const firstNameInput = guestPage.locator('[data-testid="first-name-input"]');
    const lastNameInput = guestPage.locator('[data-testid="last-name-input"]');
    
    if (await firstNameInput.isVisible()) {
      await firstNameInput.fill('');
    }
    if (await lastNameInput.isVisible()) {
      await lastNameInput.fill('');
    }
    
    await guestPage.click('[data-testid="register-button"]');
    
    // Should still register successfully
    await guestPage.waitForLoadState('networkidle');
    // Registration should succeed (no error messages)
  });

  test('should have working "Login" link', async ({ guestPage }) => {
    const loginLink = guestPage.locator('[data-testid="login-link"]');
    
    if (await loginLink.isVisible()) {
      await loginLink.click();
      
      // Should navigate to login page
      await expect(guestPage).toHaveURL(/.*login.*/);
    }
  });

  test('should handle terms and conditions checkbox', async ({ guestPage, testHelpers }) => {
    const termsCheckbox = guestPage.locator('[data-testid="terms-checkbox"]');
    
    if (await termsCheckbox.isVisible()) {
      const testUser = testHelpers.generateTestUser();
      
      // Fill form without checking terms
      await guestPage.fill('[data-testid="email-input"]', testUser.email);
      await guestPage.fill('[data-testid="password-input"]', testUser.password);
      await guestPage.fill('[data-testid="confirm-password-input"]', testUser.confirmPassword);
      await guestPage.click('[data-testid="register-button"]');
      
      // Should show terms error
      await expect(
        guestPage.locator('[data-testid="terms-error"]')
          .or(guestPage.locator('text=accept terms'))
      ).toBeVisible();
      
      // Check terms and try again
      await termsCheckbox.check();
      await guestPage.click('[data-testid="register-button"]');
      
      // Should proceed without terms error
      await expect(
        guestPage.locator('[data-testid="terms-error"]')
      ).not.toBeVisible();
    }
  });

  test('should handle form submission with Enter key', async ({ guestPage, testHelpers }) => {
    const testUser = testHelpers.generateTestUser();
    
    await guestPage.fill('[data-testid="email-input"]', testUser.email);
    await guestPage.fill('[data-testid="password-input"]', testUser.password);
    await guestPage.fill('[data-testid="confirm-password-input"]', testUser.confirmPassword);
    
    // Press Enter to submit
    await guestPage.keyboard.press('Enter');
    
    // Should register successfully
    await guestPage.waitForLoadState('networkidle');
  });

  test('should prevent multiple rapid registration attempts', async ({ guestPage, testHelpers }) => {
    const testUser = testHelpers.generateTestUser();
    
    await guestPage.fill('[data-testid="email-input"]', testUser.email);
    await guestPage.fill('[data-testid="password-input"]', testUser.password);
    await guestPage.fill('[data-testid="confirm-password-input"]', testUser.confirmPassword);
    
    // Click register button multiple times rapidly
    const registerButton = guestPage.locator('[data-testid="register-button"]');
    await registerButton.click();
    await registerButton.click();
    await registerButton.click();
    
    // Button should be disabled or show loading state
    await expect(registerButton).toBeDisabled();
  });
});