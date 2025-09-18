import { test, expect } from '../fixtures/auth-fixture';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ guestPage }) => {
    // Navigate to login page before each test
    await guestPage.goto('/login');
  });

  test('should login successfully with valid credentials', async ({ guestPage, testHelpers }) => {
    // Create a test user first
    const testUser = testHelpers.generateTestUser();
    
    // Register the user (assuming registration works)
    await testHelpers.register(testUser);
    
    // Now test login
    await testHelpers.login(testUser.email, testUser.password);
    
    // Verify successful login
    await testHelpers.expectToBeLoggedIn();
    
    // Should redirect to home page
    await expect(guestPage).toHaveURL('/');
  });

  test('should show error for invalid email', async ({ guestPage }) => {
    await guestPage.fill('[data-testid="email-input"]', 'invalid-email');
    await guestPage.fill('[data-testid="password-input"]', 'password123');
    await guestPage.click('[data-testid="login-button"]');
    
    // Should show validation error
    await expect(guestPage.locator('[data-testid="email-error"]')).toBeVisible();
  });

  test('should show error for wrong password', async ({ guestPage, testHelpers }) => {
    // Create a test user
    const testUser = testHelpers.generateTestUser();
    await testHelpers.register(testUser);
    
    // Try to login with wrong password
    await guestPage.fill('[data-testid="email-input"]', testUser.email);
    await guestPage.fill('[data-testid="password-input"]', 'wrongpassword');
    await guestPage.click('[data-testid="login-button"]');
    
    // Should show error message
    await expect(
      guestPage.locator('[data-testid="login-error"]')
        .or(guestPage.locator('text=Invalid credentials'))
        .or(guestPage.locator('text=Login failed'))
    ).toBeVisible();
  });

  test('should show error for non-existent user', async ({ guestPage }) => {
    await guestPage.fill('[data-testid="email-input"]', 'nonexistent@example.com');
    await guestPage.fill('[data-testid="password-input"]', 'password123');
    await guestPage.click('[data-testid="login-button"]');
    
    // Should show error message
    await expect(
      guestPage.locator('[data-testid="login-error"]')
        .or(guestPage.locator('text=User not found'))
        .or(guestPage.locator('text=Invalid credentials'))
    ).toBeVisible();
  });

  test('should require email field', async ({ guestPage }) => {
    await guestPage.fill('[data-testid="password-input"]', 'password123');
    await guestPage.click('[data-testid="login-button"]');
    
    // Should show required field error
    await expect(
      guestPage.locator('[data-testid="email-error"]')
        .or(guestPage.locator('text=Email is required'))
    ).toBeVisible();
  });

  test('should require password field', async ({ guestPage }) => {
    await guestPage.fill('[data-testid="email-input"]', 'test@example.com');
    await guestPage.click('[data-testid="login-button"]');
    
    // Should show required field error
    await expect(
      guestPage.locator('[data-testid="password-error"]')
        .or(guestPage.locator('text=Password is required'))
    ).toBeVisible();
  });

  test('should have working "Remember me" checkbox', async ({ guestPage }) => {
    const rememberCheckbox = guestPage.locator('[data-testid="remember-me"]');
    
    if (await rememberCheckbox.isVisible()) {
      // Test checking and unchecking
      await rememberCheckbox.check();
      await expect(rememberCheckbox).toBeChecked();
      
      await rememberCheckbox.uncheck();
      await expect(rememberCheckbox).not.toBeChecked();
    }
  });

  test('should have working "Forgot Password" link', async ({ guestPage }) => {
    const forgotPasswordLink = guestPage.locator('[data-testid="forgot-password-link"]');
    
    if (await forgotPasswordLink.isVisible()) {
      await forgotPasswordLink.click();
      
      // Should navigate to forgot password page
      await expect(guestPage).toHaveURL(/.*forgot-password.*/);
    }
  });

  test('should have working "Sign Up" link', async ({ guestPage }) => {
    const signUpLink = guestPage.locator('[data-testid="signup-link"]');
    
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
      
      // Should navigate to registration page
      await expect(guestPage).toHaveURL(/.*register.*/);
    }
  });

  test('should handle login form submission with Enter key', async ({ guestPage, testHelpers }) => {
    const testUser = testHelpers.generateTestUser();
    await testHelpers.register(testUser);
    
    // Fill form and press Enter
    await guestPage.fill('[data-testid="email-input"]', testUser.email);
    await guestPage.fill('[data-testid="password-input"]', testUser.password);
    await guestPage.keyboard.press('Enter');
    
    // Should login successfully
    await testHelpers.expectToBeLoggedIn();
  });

  test('should prevent multiple rapid login attempts', async ({ guestPage }) => {
    // Fill invalid credentials
    await guestPage.fill('[data-testid="email-input"]', 'test@example.com');
    await guestPage.fill('[data-testid="password-input"]', 'wrongpassword');
    
    // Click login button multiple times rapidly
    const loginButton = guestPage.locator('[data-testid="login-button"]');
    await loginButton.click();
    await loginButton.click();
    await loginButton.click();
    
    // Button should be disabled or show loading state
    await expect(loginButton).toBeDisabled();
  });
});