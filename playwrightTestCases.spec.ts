import { test, expect } from '@playwright/test';

const liveUrl = 'http://localhost/Policy/express.aspx';

// Page Object Model (POM) for the login page
class LoginPage {
  constructor(private page) {}

  async goTo() {
    await this.page.goto(liveUrl);
  }

  async isLoaded() {
    await expect(this.page).toHaveURL(liveUrl);
  }

  async login(username: string, password: string) {
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async isLoggedIn() {
    await expect(this.page.locator('text=Welcome')).toBeVisible();
  }
}

// Page Object Model (POM) for the policy page
class PolicyPage {
  constructor(private page) {}

  async isLoaded() {
    await expect(this.page).toHaveURL(liveUrl);
    await expect(this.page.locator('text=Policy Details')).toBeVisible();
  }

  async fillPolicyForm(policyDetails: { policyNumber: string, policyHolder: string, startDate: string, endDate: string }) {
    await this.page.fill('input[name="policyNumber"]', policyDetails.policyNumber);
    await this.page.fill('input[name="policyHolder"]', policyDetails.policyHolder);
    await this.page.fill('input[name="startDate"]', policyDetails.startDate);
    await this.page.fill('input[name="endDate"]', policyDetails.endDate);
  }

  async submitPolicy() {
    await this.page.click('button[type="submit"]');
  }

  async isPolicySubmitted() {
    await expect(this.page.locator('text=Policy submitted successfully')).toBeVisible();
  }
}

test.describe('Policy Application Tests', () => {
  let loginPage: LoginPage;
  let policyPage: PolicyPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    policyPage = new PolicyPage(page);

    await loginPage.goTo();
    await loginPage.isLoaded();
    await loginPage.login('testuser', 'password123');
    await loginPage.isLoggedIn();
  });

  test('Submit Policy - Positive Scenario', async ({ page }) => {
    await policyPage.isLoaded();
    await policyPage.fillPolicyForm({
      policyNumber: 'POL123456',
      policyHolder: 'John Doe',
      startDate: '2023-01-01',
      endDate: '2023-12-31'
    });
    await policyPage.submitPolicy();
    await policyPage.isPolicySubmitted();
  });

  test('Submit Policy - Negative Scenario', async ({ page }) => {
    await policyPage.isLoaded();
    await policyPage.fillPolicyForm({
      policyNumber: '',
      policyHolder: '',
      startDate: '',
      endDate: ''
    });
    await policyPage.submitPolicy();
    await expect(page.locator('text=Policy submission failed')).toBeVisible();
  });

  test.describe('Data Driven Policy Tests', () => {
    const policyTestData = [
      { policyNumber: 'POL123456', policyHolder: 'John Doe', startDate: '2023-01-01', endDate: '2023-12-31' },
      { policyNumber: 'POL654321', policyHolder: 'Jane Smith', startDate: '2023-02-01', endDate: '2023-11-30' }
    ];

    test.each(policyTestData)('Submit Policy - %o', async ({ policyNumber, policyHolder, startDate, endDate }) => {
      await policyPage.isLoaded();
      await policyPage.fillPolicyForm({ policyNumber, policyHolder, startDate, endDate });
      await policyPage.submitPolicy();
      await policyPage.isPolicySubmitted();
    });
  });
});