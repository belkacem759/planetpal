import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  // Create browser instance
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the application
    await page.goto(baseURL!);
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Application is accessible at:', baseURL);
    
    // You can add more global setup tasks here:
    // - Create test users
    // - Seed test data
    // - Setup authentication states
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;