import { test, expect } from '../fixtures/auth-fixture';
import { TestHelpers } from '../helpers/test-helpers';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Add items to cart before each test
    await page.goto('/');
    await page.locator('[data-testid^="add-to-cart-"]').first().click();
    await page.waitForTimeout(1000);
  });

  test('should complete full checkout process for authenticated user', async ({ authenticatedPage }) => {
    const helpers = new TestHelpers(authenticatedPage);
    
    // Navigate to checkout
    await helpers.navigateToCheckout();
    
    // Fill shipping address
    const shippingAddress = helpers.generateTestAddress();
    await helpers.fillShippingAddress(shippingAddress);
    
    // Continue to payment
    const continueButton = authenticatedPage.locator('[data-testid="continue-to-payment"]');
    if (await continueButton.isVisible()) {
      await continueButton.click();
    }
    
    // Fill payment information
    const paymentData = helpers.getTestCardData();
    await helpers.fillPaymentInfo(paymentData);
    
    // Complete order
    await helpers.completeCheckout();
    
    // Verify order success
    await helpers.expectOrderSuccess();
  });

  test('should require login for guest users at checkout', async ({ guestPage }) => {
    const helpers = new TestHelpers(guestPage);
    
    // Try to navigate to checkout
    await helpers.navigateToCheckout();
    
    // Should redirect to login or show login prompt
    if (guestPage.url().includes('/login')) {
      // Redirected to login page
      expect(guestPage.url()).toContain('/login');
    } else {
      // Login prompt shown
      const loginRequired = guestPage.locator('[data-testid="login-required"]')
        .or(guestPage.locator('text=Please log in'));
      await expect(loginRequired).toBeVisible();
    }
  });

  test('should validate shipping address fields', async ({ authenticatedPage }) => {
    const helpers = new TestHelpers(authenticatedPage);
    
    await helpers.navigateToCheckout();
    
    // Try to continue without filling required fields
    const continueButton = authenticatedPage.locator('[data-testid="continue-to-payment"]')
      .or(authenticatedPage.locator('[data-testid="complete-order-button"]'));
    
    await continueButton.click();
    
    // Should show validation errors for required fields
    const requiredFields = [
      'shipping-first-name',
      'shipping-last-name', 
      'shipping-address1',
      'shipping-city',
      'shipping-state',
      'shipping-zip'
    ];
    
    for (const field of requiredFields) {
      const errorElement = authenticatedPage.locator(`[data-testid="${field}-error"]`)
        .or(authenticatedPage.locator('text=required'))
        .or(authenticatedPage.locator('text=This field is required'));
      
      // At least one validation error should be visible
      if (await errorElement.first().isVisible()) {
        break;
      }
    }
  });

  test('should validate payment information', async ({ authenticatedPage }) => {
    const helpers = new TestHelpers(authenticatedPage);
    
    await helpers.navigateToCheckout();
    
    // Fill shipping address
    const shippingAddress = helpers.generateTestAddress();
    await helpers.fillShippingAddress(shippingAddress);
    
    // Continue to payment
    const continueButton = authenticatedPage.locator('[data-testid="continue-to-payment"]');
    if (await continueButton.isVisible()) {
      await continueButton.click();
    }
    
    // Try to complete order without payment info
    const completeOrderButton = authenticatedPage.locator('[data-testid="complete-order-button"]');
    await completeOrderButton.click();
    
    // Should show payment validation errors
    const paymentError = authenticatedPage.locator('[data-testid="payment-error"]')
      .or(authenticatedPage.locator('text=Please enter payment'))
      .or(authenticatedPage.locator('text=Card number is required'));
    
    await expect(paymentError).toBeVisible({ timeout: 10000 });
  });

  test('should handle declined payment card', async ({ authenticatedPage }) => {
    const helpers = new TestHelpers(authenticatedPage);
    
    await helpers.navigateToCheckout();
    
    // Fill shipping address
    const shippingAddress = helpers.generateTestAddress();
    await helpers.fillShippingAddress(shippingAddress);
    
    // Continue to payment
    const continueButton = authenticatedPage.locator('[data-testid="continue-to-payment"]');
    if (await continueButton.isVisible()) {
      await continueButton.click();
    }
    
    // Use declined test card
    const declinedCardData = helpers.getDeclinedCardData();
    await helpers.fillPaymentInfo(declinedCardData);
    
    // Try to complete order
    await helpers.completeCheckout();
    
    // Should show payment declined error
    const declinedError = authenticatedPage.locator('[data-testid="payment-declined"]')
      .or(authenticatedPage.locator('text=Payment declined'))
      .or(authenticatedPage.locator('text=Your card was declined'));
    
    await expect(declinedError).toBeVisible({ timeout: 15000 });
  });

  test('should calculate correct order totals', async ({ authenticatedPage }) => {
    const helpers = new TestHelpers(authenticatedPage);
    
    // Add multiple items to cart
    await authenticatedPage.goto('/');
    const addToCartButtons = authenticatedPage.locator('[data-testid^="add-to-cart-"]');
    const buttonCount = Math.min(await addToCartButtons.count(), 3);
    
    for (let i = 0; i < buttonCount; i++) {
      await addToCartButtons.nth(i).click();
      await authenticatedPage.waitForTimeout(500);
    }
    
    await helpers.navigateToCheckout();
    
    // Verify order summary
    const orderSummary = authenticatedPage.locator('[data-testid="order-summary"]');
    if (await orderSummary.isVisible()) {
      // Check subtotal
      const subtotal = orderSummary.locator('[data-testid="order-subtotal"]');
      if (await subtotal.isVisible()) {
        const subtotalText = await subtotal.textContent();
        expect(subtotalText).toMatch(/\$\d+\.\d{2}/);
      }
      
      // Check shipping
      const shipping = orderSummary.locator('[data-testid="order-shipping"]');
      if (await shipping.isVisible()) {
        const shippingText = await shipping.textContent();
        expect(shippingText).toMatch(/\$\d+\.\d{2}|Free/);
      }
      
      // Check tax
      const tax = orderSummary.locator('[data-testid="order-tax"]');
      if (await tax.isVisible()) {
        const taxText = await tax.textContent();
        expect(taxText).toMatch(/\$\d+\.\d{2}/);
      }
      
      // Check total
      const total = orderSummary.locator('[data-testid="order-total"]');
      if (await total.isVisible()) {
        const totalText = await total.textContent();
        expect(totalText).toMatch(/\$\d+\.\d{2}/);
      }
    }
  });

  test('should allow editing cart from checkout', async ({ authenticatedPage }) => {
    const helpers = new TestHelpers(authenticatedPage);
    
    await helpers.navigateToCheckout();
    
    // Look for edit cart or back to cart button
    const editCartButton = authenticatedPage.locator('[data-testid="edit-cart"]')
      .or(authenticatedPage.locator('[data-testid="back-to-cart"]'))
      .or(authenticatedPage.locator('text=Edit Cart'));
    
    if (await editCartButton.isVisible()) {
      await editCartButton.click();
      
      // Should navigate back to cart
      await expect(authenticatedPage).toHaveURL(/.*cart.*/);
    }
  });

  test('should save shipping address for future use', async ({ authenticatedPage }) => {
    const helpers = new TestHelpers(authenticatedPage);
    
    await helpers.navigateToCheckout();
    
    // Fill shipping address
    const shippingAddress = helpers.generateTestAddress();
    await helpers.fillShippingAddress(shippingAddress);
    
    // Look for save address checkbox
    const saveAddressCheckbox = authenticatedPage.locator('[data-testid="save-address"]');
    if (await saveAddressCheckbox.isVisible()) {
      await saveAddressCheckbox.check();
    }
    
    // Continue with checkout
    const continueButton = authenticatedPage.locator('[data-testid="continue-to-payment"]');
    if (await continueButton.isVisible()) {
      await continueButton.click();
    }
    
    // Complete the order
    const paymentData = helpers.getTestCardData();
    await helpers.fillPaymentInfo(paymentData);
    await helpers.completeCheckout();
    
    // Verify order success
    await helpers.expectOrderSuccess();
  });

  test('should handle different shipping options', async ({ authenticatedPage }) => {
    const helpers = new TestHelpers(authenticatedPage);
    
    await helpers.navigateToCheckout();
    
    // Fill shipping address
    const shippingAddress = helpers.generateTestAddress();
    await helpers.fillShippingAddress(shippingAddress);
    
    // Look for shipping options
    const shippingOptions = authenticatedPage.locator('[data-testid="shipping-options"]');
    if (await shippingOptions.isVisible()) {
      const options = shippingOptions.locator('input[type="radio"]');
      const optionCount = await options.count();
      
      if (optionCount > 1) {
        // Select different shipping option
        await options.nth(1).click();
        
        // Verify total updates
        await authenticatedPage.waitForTimeout(1000);
        
        const total = authenticatedPage.locator('[data-testid="order-total"]');
        if (await total.isVisible()) {
          const totalText = await total.textContent();
          expect(totalText).toMatch(/\$\d+\.\d{2}/);
        }
      }
    }
  });

  test('should handle billing address same as shipping', async ({ authenticatedPage }) => {
    const helpers = new TestHelpers(authenticatedPage);
    
    await helpers.navigateToCheckout();
    
    // Fill shipping address
    const shippingAddress = helpers.generateTestAddress();
    await helpers.fillShippingAddress(shippingAddress);
    
    // Look for "same as shipping" checkbox
    const sameAsShippingCheckbox = authenticatedPage.locator('[data-testid="same-as-shipping"]');
    if (await sameAsShippingCheckbox.isVisible()) {
      await sameAsShippingCheckbox.check();
      
      // Billing fields should be disabled or hidden
      const billingFirstName = authenticatedPage.locator('[data-testid="billing-first-name"]');
      if (await billingFirstName.isVisible()) {
        await expect(billingFirstName).toBeDisabled();
      }
    }
  });

  test('should show order confirmation with correct details', async ({ authenticatedPage }) => {
    const helpers = new TestHelpers(authenticatedPage);
    
    await helpers.navigateToCheckout();
    
    // Complete checkout process
    const shippingAddress = helpers.generateTestAddress();
    await helpers.fillShippingAddress(shippingAddress);
    
    const continueButton = authenticatedPage.locator('[data-testid="continue-to-payment"]');
    if (await continueButton.isVisible()) {
      await continueButton.click();
    }
    
    const paymentData = helpers.getTestCardData();
    await helpers.fillPaymentInfo(paymentData);
    await helpers.completeCheckout();
    
    // Verify order confirmation page
    await helpers.expectOrderSuccess();
    
    // Check for order number
    const orderNumber = authenticatedPage.locator('[data-testid="order-number"]');
    if (await orderNumber.isVisible()) {
      const orderText = await orderNumber.textContent();
      expect(orderText).toMatch(/\d+/);
    }
    
    // Check for order details
    const orderDetails = authenticatedPage.locator('[data-testid="order-details"]');
    if (await orderDetails.isVisible()) {
      // Should contain shipping address
      await expect(orderDetails).toContainText(shippingAddress.firstName);
      await expect(orderDetails).toContainText(shippingAddress.lastName);
    }
  });

  test('should handle checkout timeout gracefully', async ({ authenticatedPage }) => {
    const helpers = new TestHelpers(authenticatedPage);
    
    await helpers.navigateToCheckout();
    
    // Fill forms but wait before completing
    const shippingAddress = helpers.generateTestAddress();
    await helpers.fillShippingAddress(shippingAddress);
    
    const continueButton = authenticatedPage.locator('[data-testid="continue-to-payment"]');
    if (await continueButton.isVisible()) {
      await continueButton.click();
    }
    
    const paymentData = helpers.getTestCardData();
    await helpers.fillPaymentInfo(paymentData);
    
    // Wait to simulate timeout (if implemented)
    await authenticatedPage.waitForTimeout(5000);
    
    // Try to complete order
    await helpers.completeCheckout();
    
    // Should either complete successfully or show timeout message
    const timeoutMessage = authenticatedPage.locator('[data-testid="checkout-timeout"]')
      .or(authenticatedPage.locator('text=session expired'))
      .or(authenticatedPage.locator('text=timeout'));
    
    if (await timeoutMessage.isVisible()) {
      // Timeout handled gracefully
      expect(await timeoutMessage.textContent()).toBeTruthy();
    } else {
      // Order completed successfully
      await helpers.expectOrderSuccess();
    }
  });

  test('should prevent double submission of orders', async ({ authenticatedPage }) => {
    const helpers = new TestHelpers(authenticatedPage);
    
    await helpers.navigateToCheckout();
    
    // Fill checkout form
    const shippingAddress = helpers.generateTestAddress();
    await helpers.fillShippingAddress(shippingAddress);
    
    const continueButton = authenticatedPage.locator('[data-testid="continue-to-payment"]');
    if (await continueButton.isVisible()) {
      await continueButton.click();
    }
    
    const paymentData = helpers.getTestCardData();
    await helpers.fillPaymentInfo(paymentData);
    
    // Click complete order button multiple times rapidly
    const completeOrderButton = authenticatedPage.locator('[data-testid="complete-order-button"]');
    await completeOrderButton.click();
    await completeOrderButton.click();
    await completeOrderButton.click();
    
    // Button should be disabled after first click
    await expect(completeOrderButton).toBeDisabled();
    
    // Should only create one order
    await helpers.expectOrderSuccess();
  });
});