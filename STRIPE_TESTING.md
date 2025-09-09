# Stripe Payment Integration Testing Guide

## Test Cards for Development

Use these Stripe test card numbers to test different payment scenarios:

### Successful Payments
- **Visa**: `4242424242424242`
- **Visa (debit)**: `4000056655665556`
- **Mastercard**: `5555555555554444`
- **American Express**: `378282246310005`

### Payment Failures
- **Generic decline**: `4000000000000002`
- **Insufficient funds**: `4000000000009995`
- **Lost card**: `4000000000009987`
- **Stolen card**: `4000000000009979`

### 3D Secure Authentication
- **Requires authentication**: `4000002500003155`
- **Authentication fails**: `4000008400001629`

### Test Details
- **Expiry**: Use any future date (e.g., `12/34`)
- **CVC**: Use any 3-digit number (e.g., `123`)
- **ZIP**: Use any valid ZIP code (e.g., `12345`)

## Testing Checklist

### 1. Environment Setup
- [ ] Verify `.env.local` contains correct Stripe test keys
- [ ] Confirm `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` starts with `pk_test_`
- [ ] Confirm `STRIPE_SECRET_KEY` starts with `sk_test_`
- [ ] Check webhook endpoint is configured in Stripe Dashboard

### 2. Payment Flow Testing
- [ ] Navigate to checkout page
- [ ] Fill in contact information
- [ ] Enter test card details
- [ ] Verify payment status updates appear
- [ ] Test successful payment with `4242424242424242`
- [ ] Test declined payment with `4000000000000002`
- [ ] Test 3D Secure with `4000002500003155`

### 3. Error Handling
- [ ] Test with invalid card number
- [ ] Test with expired card
- [ ] Test with invalid CVC
- [ ] Verify error messages are user-friendly
- [ ] Check payment status shows 'failed' on errors

### 4. Security Verification
- [ ] Confirm HTTPS is enforced
- [ ] Verify security headers are present
- [ ] Check that card data never touches your server
- [ ] Confirm PCI compliance indicators

### 5. Database Integration
- [ ] Verify orders are created with correct status
- [ ] Check Stripe customer IDs are stored
- [ ] Confirm payment intent IDs are recorded
- [ ] Test order status updates on payment completion

### 6. Webhook Testing
- [ ] Use Stripe CLI to forward webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhooks`
- [ ] Test `payment_intent.succeeded` event
- [ ] Test `payment_intent.payment_failed` event
- [ ] Verify order status updates from webhooks

## Common Issues and Solutions

### Payment Intent Creation Fails
- Check API route is accessible
- Verify Stripe secret key is correct
- Ensure amount is in cents (multiply by 100)

### Card Element Not Loading
- Verify publishable key is correct
- Check browser console for errors
- Ensure Stripe.js is loaded properly

### Webhooks Not Working
- Confirm webhook endpoint URL in Stripe Dashboard
- Check webhook signing secret is correct
- Verify webhook events are enabled

### 3D Secure Issues
- Ensure `return_url` is set in payment intent
- Check that authentication flow completes
- Verify proper handling of `requires_action` status

## Monitoring and Logs

### Stripe Dashboard
- Monitor payments in real-time
- Check webhook delivery status
- Review payment intent details

### Application Logs
- Check API route logs for errors
- Monitor webhook processing
- Review payment status updates

### Browser DevTools
- Check network requests to Stripe
- Monitor console for JavaScript errors
- Verify payment status component updates

## Production Readiness

Before going live:
- [ ] Replace test keys with live keys
- [ ] Update webhook endpoints to production URLs
- [ ] Test with real bank cards (small amounts)
- [ ] Verify SSL certificate is valid
- [ ] Confirm all security headers are active
- [ ] Test webhook delivery in production