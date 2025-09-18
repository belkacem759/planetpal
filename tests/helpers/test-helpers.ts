import { Page, Locator, expect } from '@playwright/test';

export class TestHelpers {
  constructor(public readonly page: Page) {}

  // Navigation helpers
  async navigateToHome() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToLogin() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToRegister() {
    await this.page.goto('/register');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToCart() {
    await this.page.goto('/cart');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToCheckout() {
    await this.page.goto('/checkout');
    await this.page.waitForLoadState('networkidle');
  }

  // Authentication helpers
  async login(email: string, password: string) {
    await this.navigateToLogin();
    
    // Fill login form
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    
    // Submit form
    await this.page.click('[data-testid="login-button"]');
    
    // Wait for navigation or success indicator
    await this.page.waitForURL('/', { timeout: 10000 });
  }

  async register(userData: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName?: string;
    lastName?: string;
  }) {
    await this.navigateToRegister();
    
    // Fill registration form
    await this.page.fill('[data-testid="email-input"]', userData.email);
    await this.page.fill('[data-testid="password-input"]', userData.password);
    await this.page.fill('[data-testid="confirm-password-input"]', userData.confirmPassword);
    
    if (userData.firstName) {
      await this.page.fill('[data-testid="first-name-input"]', userData.firstName);
    }
    
    if (userData.lastName) {
      await this.page.fill('[data-testid="last-name-input"]', userData.lastName);
    }
    
    // Submit form
    await this.page.click('[data-testid="register-button"]');
    
    // Wait for success or redirect
    await this.page.waitForLoadState('networkidle');
  }

  async logout() {
    // Look for logout button/link
    const logoutButton = this.page.locator('[data-testid="logout-button"]');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // Try user menu dropdown
      await this.page.click('[data-testid="user-menu"]');
      await this.page.click('[data-testid="logout-button"]');
    }
    
    await this.page.waitForURL('/login', { timeout: 10000 });
  }

  // Product and shopping helpers
  async searchProduct(query: string) {
    const searchInput = this.page.locator('[data-testid="search-input"]');
    await searchInput.fill(query);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async addProductToCart(productId?: string) {
    if (productId) {
      await this.page.click(`[data-testid="add-to-cart-${productId}"]`);
    } else {
      // Add first available product
      await this.page.click('[data-testid^="add-to-cart-"]');
    }
    
    // Wait for cart update
    await this.page.waitForTimeout(1000);
  }

  async updateCartQuantity(productId: string, quantity: number) {
    const quantityInput = this.page.locator(`[data-testid="quantity-${productId}"]`);
    await quantityInput.fill(quantity.toString());
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(1000);
  }

  async removeFromCart(productId: string) {
    await this.page.click(`[data-testid="remove-${productId}"]`);
    await this.page.waitForTimeout(1000);
  }

  // Checkout helpers
  async fillShippingAddress(address: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  }) {
    await this.page.fill('[data-testid="shipping-first-name"]', address.firstName);
    await this.page.fill('[data-testid="shipping-last-name"]', address.lastName);
    await this.page.fill('[data-testid="shipping-address1"]', address.address1);
    await this.page.fill('[data-testid="shipping-city"]', address.city);
    await this.page.fill('[data-testid="shipping-state"]', address.state);
    await this.page.fill('[data-testid="shipping-zip"]', address.zipCode);
    
    if (address.country) {
      await this.page.selectOption('[data-testid="shipping-country"]', address.country);
    }
  }

  async fillPaymentInfo(paymentData: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvc: string;
    cardholderName?: string;
  }) {
    // Handle Stripe Elements or regular inputs
    const cardNumberFrame = this.page.frameLocator('[name*="cardnumber"]');
    if (await cardNumberFrame.locator('input').isVisible()) {
      // Stripe Elements
      await cardNumberFrame.locator('input').fill(paymentData.cardNumber);
      
      const expiryFrame = this.page.frameLocator('[name*="cardexpiry"]');
      await expiryFrame.locator('input').fill(`${paymentData.expiryMonth}/${paymentData.expiryYear}`);
      
      const cvcFrame = this.page.frameLocator('[name*="cardcvc"]');
      await cvcFrame.locator('input').fill(paymentData.cvc);
    } else {
      // Regular inputs
      await this.page.fill('[data-testid="card-number"]', paymentData.cardNumber);
      await this.page.fill('[data-testid="expiry-month"]', paymentData.expiryMonth);
      await this.page.fill('[data-testid="expiry-year"]', paymentData.expiryYear);
      await this.page.fill('[data-testid="cvc"]', paymentData.cvc);
    }
    
    if (paymentData.cardholderName) {
      await this.page.fill('[data-testid="cardholder-name"]', paymentData.cardholderName);
    }
  }

  async completeCheckout() {
    await this.page.click('[data-testid="complete-order-button"]');
    
    // Wait for order confirmation or success page
    await this.page.waitForLoadState('networkidle');
  }

  // Assertion helpers
  async expectToBeLoggedIn() {
    // Check for user indicator or logout button
    await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible();
  }

  async expectToBeLoggedOut() {
    // Check for login button or redirect to login
    const currentUrl = this.page.url();
    if (currentUrl.includes('/login')) {
      return;
    }
    await expect(this.page.locator('[data-testid="login-button"]')).toBeVisible();
  }

  async expectCartItemCount(count: number) {
    const cartBadge = this.page.locator('[data-testid="cart-count"]');
    await expect(cartBadge).toHaveText(count.toString());
  }

  async expectProductInCart(productName: string) {
    await this.navigateToCart();
    await expect(this.page.locator(`text=${productName}`)).toBeVisible();
  }

  async expectOrderSuccess() {
    // Look for success message or order confirmation
    await expect(
      this.page.locator('[data-testid="order-success"]')
        .or(this.page.locator('text=Order confirmed'))
        .or(this.page.locator('text=Thank you for your order'))
    ).toBeVisible();
  }

  // Utility helpers
  async waitForElement(selector: string, timeout = 10000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async scrollToElement(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png` });
  }

  // Generate test data
  generateTestEmail(): string {
    return `test-${Date.now()}@example.com`;
  }

  generateTestUser() {
    const timestamp = Date.now();
    return {
      email: `test-${timestamp}@example.com`,
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User'
    };
  }

  generateTestAddress() {
    return {
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Test Street',
      city: 'Test City',
      state: 'CA',
      zipCode: '12345',
      country: 'US'
    };
  }

  // Stripe test card data
  getTestCardData() {
    return {
      cardNumber: '4242424242424242', // Visa test card
      expiryMonth: '12',
      expiryYear: '2030',
      cvc: '123',
      cardholderName: 'Test User'
    };
  }

  getDeclinedCardData() {
    return {
      cardNumber: '4000000000000002', // Declined card
      expiryMonth: '12',
      expiryYear: '2030',
      cvc: '123',
      cardholderName: 'Test User'
    };
  }
}