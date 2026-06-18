import { test, expect } from '../fixtures/auth-fixture';
import { TestHelpers } from '../helpers/test-helpers';

test.describe('Shopping Cart Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto('/');
  });

  test('should add product to cart successfully', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Find and add first available product to cart
    const addToCartButton = page.locator('[data-testid^="add-to-cart-"]').first();
    await expect(addToCartButton).toBeVisible();
    
    // Get initial cart count
    const cartBadge = page.locator('[data-testid="cart-count"]');
    const initialCount = await cartBadge.textContent() || '0';
    
    // Add product to cart
    await addToCartButton.click();
    
    // Verify cart count increased
    await expect(cartBadge).toHaveText((Number.parseInt(initialCount) + 1).toString());
    
    // Verify success message or notification
    const successMessage = page.locator('[data-testid="add-to-cart-success"]')
      .or(page.locator('text=Added to cart'))
      .or(page.locator('text=Item added'));
    
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  test('should display correct items in cart page', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Add a product to cart
    const productCard = page.locator('[data-testid^="product-card-"]').first();
    const productName = await productCard.locator('[data-testid="product-name"]').textContent();
    
    await productCard.locator('[data-testid^="add-to-cart-"]').click();
    await page.waitForTimeout(1000);
    
    // Navigate to cart
    await helpers.navigateToCart();
    
    // Verify product is in cart
    if (productName) {
      await expect(page.locator(`text=${productName}`)).toBeVisible();
    }
    
    // Verify cart item structure
    const cartItem = page.locator('[data-testid^="cart-item-"]').first();
    await expect(cartItem).toBeVisible();
    
    // Check for quantity controls
    await expect(cartItem.locator('[data-testid^="quantity-"]')).toBeVisible();
    
    // Check for remove button
    await expect(cartItem.locator('[data-testid^="remove-"]')).toBeVisible();
  });

  test('should update product quantity in cart', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Add product to cart
    await page.locator('[data-testid^="add-to-cart-"]').first().click();
    await page.waitForTimeout(1000);
    
    // Navigate to cart
    await helpers.navigateToCart();
    
    // Get first cart item
    const cartItem = page.locator('[data-testid^="cart-item-"]').first();
    const quantityInput = cartItem.locator('[data-testid^="quantity-"]');
    
    // Update quantity to 3
    await quantityInput.fill('3');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    // Verify quantity updated
    await expect(quantityInput).toHaveValue('3');
    
    // Verify total price updated (if displayed)
    const itemTotal = cartItem.locator('[data-testid="item-total"]');
    if (await itemTotal.isVisible()) {
      const totalText = await itemTotal.textContent();
      expect(totalText).toBeTruthy();
    }
  });

  test('should remove product from cart', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Add product to cart
    await page.locator('[data-testid^="add-to-cart-"]').first().click();
    await page.waitForTimeout(1000);
    
    // Navigate to cart
    await helpers.navigateToCart();
    
    // Get initial cart items count
    const cartItems = page.locator('[data-testid^="cart-item-"]');
    const initialCount = await cartItems.count();
    
    // Remove first item
    const removeButton = page.locator('[data-testid^="remove-"]').first();
    await removeButton.click();
    
    // Wait for removal
    await page.waitForTimeout(1000);
    
    // Verify item removed
    const newCount = await cartItems.count();
    expect(newCount).toBe(initialCount - 1);
    
    // If cart is empty, should show empty message
    if (newCount === 0) {
      const emptyMessage = page.locator('[data-testid="empty-cart"]')
        .or(page.locator('text=Your cart is empty'))
        .or(page.locator('text=No items in cart'));
      
      await expect(emptyMessage).toBeVisible();
    }
  });

  test('should calculate correct cart totals', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Add multiple products to cart
    const addToCartButtons = page.locator('[data-testid^="add-to-cart-"]');
    const buttonCount = Math.min(await addToCartButtons.count(), 3);
    
    for (let i = 0; i < buttonCount; i++) {
      await addToCartButtons.nth(i).click();
      await page.waitForTimeout(500);
    }
    
    // Navigate to cart
    await helpers.navigateToCart();
    
    // Check subtotal
    const subtotal = page.locator('[data-testid="cart-subtotal"]');
    if (await subtotal.isVisible()) {
      const subtotalText = await subtotal.textContent();
      expect(subtotalText).toMatch(/\$\d+\.\d{2}/);
    }
    
    // Check tax (if applicable)
    const tax = page.locator('[data-testid="cart-tax"]');
    if (await tax.isVisible()) {
      const taxText = await tax.textContent();
      expect(taxText).toMatch(/\$\d+\.\d{2}/);
    }
    
    // Check total
    const total = page.locator('[data-testid="cart-total"]');
    if (await total.isVisible()) {
      const totalText = await total.textContent();
      expect(totalText).toMatch(/\$\d+\.\d{2}/);
    }
  });

  test('should persist cart items across page refreshes', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Add product to cart
    await page.locator('[data-testid^="add-to-cart-"]').first().click();
    await page.waitForTimeout(1000);
    
    // Get cart count
    const cartBadge = page.locator('[data-testid="cart-count"]');
    const cartCount = await cartBadge.textContent();
    
    // Refresh page
    await page.reload();
    
    // Verify cart count persisted
    await expect(cartBadge).toHaveText(cartCount || '0');
    
    // Navigate to cart and verify items
    await helpers.navigateToCart();
    const cartItems = page.locator('[data-testid^="cart-item-"]');
    await expect(cartItems).toHaveCount(Number.parseInt(cartCount || '0'));
  });

  test('should handle adding same product multiple times', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Add same product multiple times
    const addToCartButton = page.locator('[data-testid^="add-to-cart-"]').first();
    
    await addToCartButton.click();
    await page.waitForTimeout(500);
    await addToCartButton.click();
    await page.waitForTimeout(500);
    await addToCartButton.click();
    await page.waitForTimeout(500);
    
    // Navigate to cart
    await helpers.navigateToCart();
    
    // Should have one item with quantity 3, or 3 separate items
    const cartItems = page.locator('[data-testid^="cart-item-"]');
    const itemCount = await cartItems.count();
    
    if (itemCount === 1) {
      // Single item with quantity 3
      const quantityInput = cartItems.first().locator('[data-testid^="quantity-"]');
      await expect(quantityInput).toHaveValue('3');
    } else {
      // Multiple separate items
      expect(itemCount).toBe(3);
    }
  });

  test('should show cart icon with correct count in navigation', async ({ page }) => {
    // Initially cart should be empty
    const cartBadge = page.locator('[data-testid="cart-count"]');
    await expect(cartBadge).toHaveText('0');
    
    // Add products and verify count updates
    const addToCartButtons = page.locator('[data-testid^="add-to-cart-"]');
    const buttonCount = Math.min(await addToCartButtons.count(), 2);
    
    for (let i = 0; i < buttonCount; i++) {
      await addToCartButtons.nth(i).click();
      await page.waitForTimeout(500);
      
      // Verify count increased
      await expect(cartBadge).toHaveText((i + 1).toString());
    }
  });

  test('should handle cart operations for authenticated users', async ({ authenticatedPage }) => {
    const helpers = new TestHelpers(authenticatedPage);
    
    // Navigate to home
    await authenticatedPage.goto('/');
    
    // Add product to cart
    await authenticatedPage.locator('[data-testid^="add-to-cart-"]').first().click();
    await authenticatedPage.waitForTimeout(1000);
    
    // Navigate to cart
    await helpers.navigateToCart();
    
    // Verify cart has items
    const cartItems = authenticatedPage.locator('[data-testid^="cart-item-"]');
    await expect(cartItems).toHaveCount(1);
    
    // Should show checkout button for authenticated users
    const checkoutButton = authenticatedPage.locator('[data-testid="checkout-button"]');
    await expect(checkoutButton).toBeVisible();
  });

  test('should handle cart operations for guest users', async ({ guestPage }) => {
    const helpers = new TestHelpers(guestPage);
    
    // Navigate to home
    await guestPage.goto('/');
    
    // Add product to cart
    await guestPage.locator('[data-testid^="add-to-cart-"]').first().click();
    await guestPage.waitForTimeout(1000);
    
    // Navigate to cart
    await helpers.navigateToCart();
    
    // Verify cart has items
    const cartItems = guestPage.locator('[data-testid^="cart-item-"]');
    await expect(cartItems).toHaveCount(1);
    
    // Should prompt to login or allow guest checkout
    const loginPrompt = guestPage.locator('[data-testid="login-prompt"]')
      .or(guestPage.locator('text=Please log in'))
      .or(guestPage.locator('[data-testid="guest-checkout"]'));
    
    await expect(loginPrompt).toBeVisible();
  });

  test('should handle empty cart state', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Navigate to cart without adding items
    await helpers.navigateToCart();
    
    // Should show empty cart message
    const emptyMessage = page.locator('[data-testid="empty-cart"]')
      .or(page.locator('text=Your cart is empty'))
      .or(page.locator('text=No items in cart'));
    
    await expect(emptyMessage).toBeVisible();
    
    // Should show continue shopping button
    const continueShoppingButton = page.locator('[data-testid="continue-shopping"]')
      .or(page.locator('text=Continue Shopping'))
      .or(page.locator('text=Start Shopping'));
    
    if (await continueShoppingButton.isVisible()) {
      await continueShoppingButton.click();
      
      // Should navigate back to products/home
      await expect(page).toHaveURL(/\/(products)?$/);
    }
  });

  test('should handle quantity limits and validation', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Add product to cart
    await page.locator('[data-testid^="add-to-cart-"]').first().click();
    await page.waitForTimeout(1000);
    
    // Navigate to cart
    await helpers.navigateToCart();
    
    const quantityInput = page.locator('[data-testid^="quantity-"]').first();
    
    // Test invalid quantities
    const invalidQuantities = ['0', '-1', 'abc', '999999'];
    
    for (const qty of invalidQuantities) {
      await quantityInput.fill(qty);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      // Should either show error or revert to valid quantity
      const errorMessage = page.locator('[data-testid="quantity-error"]')
        .or(page.locator('text=Invalid quantity'));
      
      if (await errorMessage.isVisible()) {
        // Error shown, good
        continue;
      } else {
        // Should revert to minimum valid quantity (usually 1)
        const currentValue = await quantityInput.inputValue();
        expect(Number.parseInt(currentValue)).toBeGreaterThan(0);
      }
    }
  });
});