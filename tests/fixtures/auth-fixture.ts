import { test as base, Page } from '@playwright/test';
import { TestHelpers } from '../helpers/test-helpers';
import path from 'path';

// Define the types for our fixtures
type AuthFixtures = {
  testHelpers: TestHelpers;
  authenticatedPage: Page;
  guestPage: Page;
};

// Extend the base test with our fixtures
export const test = base.extend<AuthFixtures>({
  // Test helpers fixture
  testHelpers: async ({ page }, use) => {
    const helpers = new TestHelpers(page);
    await use(helpers);
  },

  // Authenticated user fixture
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const helpers = new TestHelpers(page);

    // Create a test user and log them in
    const testUser = helpers.generateTestUser();
    
    try {
      // Register the user first (you might want to use API calls for this)
      await helpers.register(testUser);
      
      // Then log them in
      await helpers.login(testUser.email, testUser.password);
      
      // Verify login was successful
      await helpers.expectToBeLoggedIn();
      
      await use(page);
    } finally {
      await context.close();
    }
  },

  // Guest (non-authenticated) user fixture
  guestPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';