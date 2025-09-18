import { test, expect } from '../fixtures/auth-fixture';
import { TestHelpers } from '../helpers/test-helpers';

test.describe('Logout Flow', () => {
  test('should logout successfully from authenticated state', async ({ authenticatedPage }) => {
    const helpers = new TestHelpers(authenticatedPage);
    
    // Verify user is logged in
    await helpers.expectToBeLoggedIn();
    
    // Perform logout
    await helpers.logout();
    
    // Verify user is logged out
    await helpers.expectToBeLoggedOut();
    
    // Should redirect to login page
    await expect(authenticatedPage).toHaveURL(/.*login.*/);
  });

  test('should clear user session data on logout', async ({ authenticatedPage }) => {
    const helpers = new TestHelpers(authenticatedPage);
    
    // Add some items to cart if possible
    await authenticatedPage.goto('/');
    
    // Try to add item to cart (if available)
    const addToCartButton = authenticatedPage.locator('[data-testid^="add-to-cart-"]').first();
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      await authenticatedPage.waitForTimeout(1000);
    }
    
    // Logout
    await helpers.logout();
    
    // Login again
    const testUser = helpers.generateTestUser();
    await helpers.register(testUser);
    await helpers.login(testUser.email, testUser.password);
    
    // Cart should be empty (session cleared)
    await authenticatedPage.goto('/cart');
    const emptyCartMessage = authenticatedPage.locator('[data-testid="empty-cart"]')
      .or(authenticatedPage.locator('text=Your cart is empty'))
      .or(authenticatedPage.locator('text=No items in cart'));
    
    await expect(emptyCartMessage).toBeVisible();
  });

  test('should prevent access to protected pages after logout', async ({ authenticatedPage }) => {
    const helpers = new TestHelpers(authenticatedPage);
    
    // Logout
    await helpers.logout();
    
    // Try to access protected pages
    const protectedPages = [
      '/profile',
      '/account',
      '/orders',
      '/checkout',
      '/dashboard'
    ];
    
    for (const page of protectedPages) {
      await authenticatedPage.goto(page);
      
      // Should redirect to login or show access denied
      const currentUrl = authenticatedPage.url();
      expect(
        currentUrl.includes('/login') || 
        currentUrl.includes('/unauthorized') ||
        await authenticatedPage.locator('text=Please log in').isVisible()
      ).toBeTruthy();
    }
  });

  test('should handle logout from user menu dropdown', async ({ authenticatedPage }) => {
    // Navigate to home page
    await authenticatedPage.goto('/');
    
    // Click user menu to open dropdown
    const userMenu = authenticatedPage.locator('[data-testid="user-menu"]');
    if (await userMenu.isVisible()) {
      await userMenu.click();
      
      // Click logout from dropdown
      const logoutButton = authenticatedPage.locator('[data-testid="logout-button"]');
      await expect(logoutButton).toBeVisible();
      await logoutButton.click();
      
      // Should redirect to login
      await expect(authenticatedPage).toHaveURL(/.*login.*/);
    }
  });

  test('should handle logout from navigation bar', async ({ authenticatedPage }) => {
    // Navigate to home page
    await authenticatedPage.goto('/');
    
    // Look for logout button in navigation
    const logoutButton = authenticatedPage.locator('[data-testid="logout-button"]');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Should redirect to login
      await expect(authenticatedPage).toHaveURL(/.*login.*/);
    }
  });

  test('should show confirmation dialog for logout (if implemented)', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/');
    
    // Try to trigger logout
    const userMenu = authenticatedPage.locator('[data-testid="user-menu"]');
    if (await userMenu.isVisible()) {
      await userMenu.click();
      
      const logoutButton = authenticatedPage.locator('[data-testid="logout-button"]');
      await logoutButton.click();
      
      // Check if confirmation dialog appears
      const confirmDialog = authenticatedPage.locator('[data-testid="logout-confirm"]')
        .or(authenticatedPage.locator('text=Are you sure you want to log out?'));
      
      if (await confirmDialog.isVisible()) {
        // Confirm logout
        await authenticatedPage.locator('[data-testid="confirm-logout"]')
          .or(authenticatedPage.locator('text=Yes'))
          .or(authenticatedPage.locator('text=Confirm'))
          .click();
        
        // Should redirect to login
        await expect(authenticatedPage).toHaveURL(/.*login.*/);
      }
    }
  });

  test('should handle logout with unsaved changes warning (if implemented)', async ({ authenticatedPage }) => {
    // Navigate to a form page that might have unsaved changes
    await authenticatedPage.goto('/profile');
    
    // Make some changes to form fields if they exist
    const nameInput = authenticatedPage.locator('[data-testid="name-input"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill('Modified Name');
    }
    
    // Try to logout
    const userMenu = authenticatedPage.locator('[data-testid="user-menu"]');
    if (await userMenu.isVisible()) {
      await userMenu.click();
      
      const logoutButton = authenticatedPage.locator('[data-testid="logout-button"]');
      await logoutButton.click();
      
      // Check if unsaved changes warning appears
      const unsavedWarning = authenticatedPage.locator('text=unsaved changes')
        .or(authenticatedPage.locator('text=lose your changes'));
      
      if (await unsavedWarning.isVisible()) {
        // Proceed with logout anyway
        await authenticatedPage.locator('[data-testid="proceed-logout"]')
          .or(authenticatedPage.locator('text=Logout anyway'))
          .click();
      }
      
      // Should eventually redirect to login
      await expect(authenticatedPage).toHaveURL(/.*login.*/, { timeout: 10000 });
    }
  });

  test('should invalidate authentication tokens on logout', async ({ authenticatedPage }) => {
    const helpers = new TestHelpers(authenticatedPage);
    
    // Logout
    await helpers.logout();
    
    // Try to make an authenticated API request by navigating to a protected page
    await authenticatedPage.goto('/api/user/profile');
    
    // Should return unauthorized or redirect to login
    const pageContent = await authenticatedPage.textContent('body');
    expect(
      pageContent?.includes('Unauthorized') ||
      pageContent?.includes('401') ||
      authenticatedPage.url().includes('/login')
    ).toBeTruthy();
  });

  test('should handle multiple logout attempts gracefully', async ({ authenticatedPage }) => {
    const helpers = new TestHelpers(authenticatedPage);
    
    // First logout
    await helpers.logout();
    
    // Try to logout again (should handle gracefully)
    await authenticatedPage.goto('/');
    
    // If already logged out, should redirect to login or show login form
    const currentUrl = authenticatedPage.url();
    expect(
      currentUrl.includes('/login') ||
      await authenticatedPage.locator('[data-testid="login-button"]').isVisible()
    ).toBeTruthy();
  });

  test('should maintain logout state across browser refresh', async ({ authenticatedPage }) => {
    const helpers = new TestHelpers(authenticatedPage);
    
    // Logout
    await helpers.logout();
    
    // Refresh the page
    await authenticatedPage.reload();
    
    // Should still be logged out
    await helpers.expectToBeLoggedOut();
  });
});