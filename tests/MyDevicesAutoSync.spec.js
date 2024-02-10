import { test, expect } from '@playwright/test';
import { chromium } from 'playwright';

const browser = await chromium.launch({
		headless: true
});

const users = [
	{
		identity: 'Alice',
		firstname: 'Alice',
		lastname: 'Maier',
		street: 'Schulgasse 5',
		zipcode: '84444',
		did: '',
		seed:'test test test test test test test test test test test test',
		city: 'Berlin',
		country: 'Germany'
	}
];

async function fillInput(page, placeholder, value) {
    await page.click(`[placeholder="${placeholder}"]`);
    await page.fill(`[placeholder="${placeholder}"]`, value);
}

async function fillForm(page, user) {
    await fillInput(page, 'Enter firstname...', user.firstname);
    await fillInput(page, 'Enter lastname...', user.lastname);
		await fillInput(page, 'Enter street...', user.street);
		await fillInput(page, 'Enter zipcode...', user.zipcode);
		await fillInput(page, 'Enter city...', user.city);		
		await fillInput(page, 'Enter country...', user.country);
}

async function initializeNewPage(browser, user) {
	try {
			const context = await browser.newContext();
			const page = await context.newPage();
			const page_url = process.env.PAGE_URL;
			await page.goto(page_url);
			await page.evaluate(() => window.localStorage.clear());
			await page.evaluate(() => window.sessionStorage.clear());
			await page.getByRole('button', { name: 'Continue' }).click();
			await page.getByRole('button', { name: 'Generate New' }).click();
			await page.getByRole('tab', { name: 'Settings' }).click();

			await page.getByLabel('Seed Phrase', { exact: true }).click();	
  		await page.getByLabel('Seed Phrase').fill(user.seed);
			await page.getByRole('tab', { name: 'My Address' }).click();
			await fillForm(page, user);
			await page.getByRole('button', { name: 'Add' }).click({ timeout: 50000 });
			return page;
	} catch (error) {
        console.error('Error opening new page:', error);
  }
}


test.describe('test - device synchronization', () => {
	let page, page2;

	test.beforeEach(async ({ browser }) => {
		test.setTimeout(50000);
		page = await initializeNewPage(browser, users[0]);
		//page2 = await initializeNewPage(browser, users[0]);
	});
	
	test('synchronization', async () => {
		test.setTimeout(60000);

		const context = await browser.newContext();
			page2 = await context.newPage();
			const page_url = process.env.PAGE_URL;
			await page2.goto(page_url);

			await page2.getByRole('button', { name: 'Continue' }).click();
			await page2.getByRole('button', { name: 'Generate New' }).click();
			await page2.getByRole('tab', { name: 'Settings' }).click();

			await page2.getByLabel('Seed Phrase', { exact: true }).click();	
  		await page2.getByLabel('Seed Phrase').fill(users[0].seed);

			await page2.getByRole('tab', { name: 'Contacts' }).click();




		await page2.getByRole('textbox').click({ timeout: 50000 });
		await page2.getByRole('textbox').fill(users[0].did);
		await page2.getByRole('button', { name: 'Scan Contact' }).click();
		
	});

	test.afterEach(async () => {
		await Promise.all([
			page.close(),
			page2.close()
		]);
	});
});
