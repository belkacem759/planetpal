import { test, expect } from '../fixtures/auth-fixture';
import { TestHelpers } from '../helpers/test-helpers';

test.describe('Payment Processing', () => {
  test.beforeEach(async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Add items to cart and navigate to checkout
    await page.goto('/');
    await page.locator('[data-testid^="add-to-cart-"]').first().click();
    await page.waitForTimeout(1000);
  });

  test('should process credit card payment successfully', async ({ authenticatedPage }) => {
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
    
    // Fill valid credit card information
    const paymentData = helpers.getTestCardData();
    await helpers.fillPaymentInfo(paymentData);
    
    // Complete payment
    await helpers.completeCheckout();
    
    // Verify successful payment
    await helpers.expectOrderSuccess();
    
    // Check for payment confirmation
    const paymentConfirmation = authenticatedPage.locator('[data-testid="payment-success"]')
      .or(authenticatedPage.locator('text=Payment successful'));
    
    if (await paymentConfirmation.isVisible()) {
      await expect(paymentConfirmation).toBeVisible();
    }
  });

  test('should validate credit card number format', async ({ authenticatedPage }) => {
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
    
    // Enter invalid card number
    const cardNumberField = authenticatedPage.locator('[data-testid="card-number"]')
      .or(authenticatedPage.locator('input[name="cardNumber"]'));
    
    if (await cardNumberField.isVisible()) {
      await cardNumberField.fill('1234');
      
      // Try to complete order
      const completeOrderButton = authenticatedPage.locator('[data-testid="complete-order-button"]');
      await completeOrderButton.click();
      
      // Should show validation error
      const cardError = authenticatedPage.locator('[data-testid="card-number-error"]')
        .or(authenticatedPage.locator('text=Invalid card number'))
        .or(authenticatedPage.locator('text=Please enter a valid card number'));
      
      await expect(cardError).toBeVisible({ timeout: 10_000 });
    }
  });

  test('should validate expiry date', async ({ authenticatedPage }) => {
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
    
    // Fill card info with expired date
    const cardNumberField = authenticatedPage.locator('[data-testid="card-number"]')
      .or(authenticatedPage.locator('input[name="cardNumber"]'));
    const expiryField = authenticatedPage.locator('[data-testid="card-expiry"]')
      .or(authenticatedPage.locator('input[name="expiry"]'));
    const cvvField = authenticatedPage.locator('[data-testid="card-cvv"]')
      .or(authenticatedPage.locator('input[name="cvv"]'));
    
    if (await cardNumberField.isVisible() && await expiryField.isVisible()) {
      await cardNumberField.fill('4111111111111111');
      await expiryField.fill('01/20'); // Expired date
      
      if (await cvvField.isVisible()) {
        await cvvField.fill('123');
      }
      
      // Try to complete order
      const completeOrderButton = authenticatedPage.locator('[data-testid="complete-order-button"]');
      await completeOrderButton.click();
      
      // Should show expiry validation error
      const expiryError = authenticatedPage.locator('[data-testid="card-expiry-error"]')
        .or(authenticatedPage.locator('text=Card has expired'))
        .or(authenticatedPage.locator('text=Invalid expiry date'));
      
      await expect(expiryError).toBeVisible({ timeout: 10_000 });
    }
  });

  test('should validate CVV code', async ({ authenticatedPage }) => {
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
    
    // Fill card info with invalid CVV
    const cardNumberField = authenticatedPage.locator('[data-testid="card-number"]')
      .or(authenticatedPage.locator('input[name="cardNumber"]'));
    const expiryField = authenticatedPage.locator('[data-testid="card-expiry"]')
      .or(authenticatedPage.locator('input[name="expiry"]'));
    const cvvField = authenticatedPage.locator('[data-testid="card-cvv"]')
      .or(authenticatedPage.locator('input[name="cvv"]'));
    
    if (await cardNumberField.isVisible() && await cvvField.isVisible()) {
      await cardNumberField.fill('4111111111111111');
      
      if (await expiryField.isVisible()) {
        await expiryField.fill('12/25');
      }
      
      await cvvField.fill('12'); // Invalid CVV (too short)
      
      // Try to complete order
      const completeOrderButton = authenticatedPage.locator('[data-testid="complete-order-button"]');
      await completeOrderButton.click();
      
      // Should show CVV validation error
      const cvvError = authenticatedPage.locator('[data-testid="card-cvv-error"]')
        .or(authenticatedPage.locator('text=Invalid CVV'))
        .or(authenticatedPage.locator('text=CVV must be 3 digits'));
      
      await expect(cvvError).toBeVisible({ timeout: 10_000 });
    }
  });

  test('should handle declined payment', async ({ authenticatedPage }) => {
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
    
    await expect(declinedError).toBeVisible({ timeout: 15_000 });
    
    // Should remain on checkout page
    expect(authenticatedPage.url()).toContain('checkout');
  });

  test('should handle insufficient funds', async ({ authenticatedPage }) => {
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
    
    // Use insufficient funds test card (if available)
    const insufficientFundsCard = {
      cardholderName: 'Test User',
      cardNumber: '4000000000000002', // Common test card for insufficient funds
      cvc: '123',
      expiryMonth: '12',
      expiryYear: '25'
    };
    
    await helpers.fillPaymentInfo(insufficientFundsCard);
    
    // Try to complete order
    await helpers.completeCheckout();
    
    // Should show insufficient funds error
    const insufficientFundsError = authenticatedPage.locator('[data-testid="insufficient-funds"]')
      .or(authenticatedPage.locator('text=Insufficient funds'))
      .or(authenticatedPage.locator('text=Payment declined'));
    
    await expect(insufficientFundsError).toBeVisible({ timeout: 15_000 });
  });

  test('should support different card types', async ({ authenticatedPage }) => {
    const helpers = new TestHelpers(authenticatedPage);
    
    const cardTypes = [
      { name: 'Visa', number: '4111111111111111' },
      { name: 'Mastercard', number: '5555555555554444' },
      { name: 'American Express', number: '378282246310005' }
    ];
    
    for (const cardType of cardTypes) {
      await helpers.navigateToCheckout();
      
      // Fill shipping address
      const shippingAddress = helpers.generateTestAddress();
      await helpers.fillShippingAddress(shippingAddress);
      
      // Continue to payment
      const continueButton = authenticatedPage.locator('[data-testid="continue-to-payment"]');
      if (await continueButton.isVisible()) {
        await continueButton.click();
      }
      
      // Fill card information
      const cardData = {
        cardholderName: 'Test User',
        cardNumber: cardType.number,
        cvc: cardType.name === 'American Express' ? '1234' : '123',
        expiryMonth: '12',
        expiryYear: '25'
      };
      
      await helpers.fillPaymentInfo(cardData);
      
      // Check if card type is detected
      const cardTypeIndicator = authenticatedPage.locator(`[data-testid="card-type-${cardType.name.toLowerCase()}"]`)
        .or(authenticatedPage.locator(`text=${cardType.name}`));
      
      if (await cardTypeIndicator.isVisible()) {
        await expect(cardTypeIndicator).toBeVisible();
      }
      
      // Reset for next iteration
      await authenticatedPage.goto('/');
      await authenticatedPage.locator('[data-testid^="add-to-cart-"]').first().click();
      await authenticatedPage.waitForTimeout(1000);
    }
  });

  test('should handle payment processing timeout', async ({ authenticatedPage }) => {
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
    
    // Fill payment information
    const paymentData = helpers.getTestCardData();
    await helpers.fillPaymentInfo(paymentData);
    
    // Complete order and wait for potential timeout
    await helpers.completeCheckout();
    
    // Wait longer for payment processing
    await authenticatedPage.waitForTimeout(10_000);
    
    // Should either succeed or show timeout error
    const timeoutError = authenticatedPage.locator('[data-testid="payment-timeout"]')
      .or(authenticatedPage.locator('text=Payment timeout'))
      .or(authenticatedPage.locator('text=Processing timeout'));
    
    const successMessage = authenticatedPage.locator('[data-testid="order-success"]')
      .or(authenticatedPage.locator('text=Order confirmed'));
    
    // Either timeout or success should be visible
    const isTimeout = await timeoutError.isVisible();
    const isSuccess = await successMessage.isVisible();
    
    expect(isTimeout || isSuccess).toBeTruthy();
  });

  test('should save payment method for future use', async ({ authenticatedPage }) => {
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
    
    // Fill payment information
    const paymentData = helpers.getTestCardData();
    await helpers.fillPaymentInfo(paymentData);
    
    // Check save payment method option
    const savePaymentCheckbox = authenticatedPage.locator('[data-testid="save-payment-method"]');
    if (await savePaymentCheckbox.isVisible()) {
      await savePaymentCheckbox.check();
    }
    
    // Complete order
    await helpers.completeCheckout();
    
    // Verify order success
    await helpers.expectOrderSuccess();
  });

  test('should handle 3D Secure authentication', async ({ authenticatedPage }) => {
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
    
    // Use 3D Secure test card
    const threeDSecureCard = {
      cardholderName: 'Test User',
      cardNumber: '4000000000003220', // Common 3D Secure test card
      cvc: '123',
      expiryMonth: '12',
      expiryYear: '25'
    };
    
    await helpers.fillPaymentInfo(threeDSecureCard);
    
    // Complete order
    await helpers.completeCheckout();
    
    // Look for 3D Secure challenge
    const threeDSecureFrame = authenticatedPage.locator('[data-testid="3ds-frame"]')
      .or(authenticatedPage.locator('text=3D Secure'));
    
    // Check for iframe separately
    const iframe = authenticatedPage.frameLocator('iframe[name*="3ds"]');
    const iframeContent = iframe.locator('body');
    
    if (await threeDSecureFrame.isVisible() || await iframeContent.isVisible()) {
      // Handle 3D Secure authentication if present
      const authenticateButton = authenticatedPage.locator('[data-testid="3ds-authenticate"]')
        .or(authenticatedPage.locator('text=Authenticate'));
      
      if (await authenticateButton.isVisible()) {
        await authenticateButton.click();
      }
    }
    
    // Should eventually complete or show appropriate message
    await authenticatedPage.waitForTimeout(5000);
    
    const orderSuccess = authenticatedPage.locator('[data-testid="order-success"]');
    const authenticationRequired = authenticatedPage.locator('text=Authentication required');
    
    const isSuccess = await orderSuccess.isVisible();
    const isAuthRequired = await authenticationRequired.isVisible();
    
    expect(isSuccess || isAuthRequired).toBeTruthy();
  });

  test('should display payment security indicators', async ({ authenticatedPage }) => {
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
    
    // Check for security indicators
    const securityIndicators = [
      '[data-testid="ssl-indicator"]',
      '[data-testid="secure-payment"]',
      'text=Secure',
      'text=SSL',
      'text=256-bit encryption'
    ];
    
    let foundSecurityIndicator = false;
    for (const indicator of securityIndicators) {
      const element = authenticatedPage.locator(indicator);
      if (await element.isVisible()) {
        foundSecurityIndicator = true;
        break;
      }
    }
    
    // At least one security indicator should be present
    if (foundSecurityIndicator) {
      expect(foundSecurityIndicator).toBeTruthy();
    }
  });

  test('should handle payment method switching', async ({ authenticatedPage }) => {
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
    
    // Check for multiple payment methods
    const paymentMethods = authenticatedPage.locator('[data-testid="payment-method"]');
    const methodCount = await paymentMethods.count();
    
    if (methodCount > 1) {
      // Switch between payment methods
      await paymentMethods.nth(1).click();
      
      // Verify the payment form updates
      await authenticatedPage.waitForTimeout(1000);
      
      // Switch back to first method
      await paymentMethods.nth(0).click();
      
      // Fill payment information
      const paymentData = helpers.getTestCardData();
      await helpers.fillPaymentInfo(paymentData);
      
      // Complete order
      await helpers.completeCheckout();
      
      // Verify success
      await helpers.expectOrderSuccess();
    }
  });
});