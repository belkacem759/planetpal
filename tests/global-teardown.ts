import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Running global teardown...');
  
  try {
    // Add cleanup tasks here:
    // - Clean up test data
    // - Reset database state
    // - Clear authentication states
    // - Remove temporary files
    
    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw here to avoid masking test failures
  }
}

export default globalTeardown;