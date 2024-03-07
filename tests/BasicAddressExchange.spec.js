import { test, expect } from '@playwright/test';
import { chromium } from 'playwright';

const browser = await chromium.launch({
	headless: process.env.HEADLESS==="true"?process.env.HEADLES==="true":true
});

//TODO can we put this into fixtures?
const users = [
	{
		identity: 'Alice',
		firstname: 'Alice',
		lastname: 'Maier',
		street: 'Schulgasse 5',
		zipcode: '84444',
		did: '',
		city: 'Berlin',
		country: 'Germany'
	},
	{
		identity: 'Bob',
		firstname: 'Bob',
		lastname: 'Dylan',
		street: 'Schulgasse 55',
		zipcode: '565544',
		did: '',
		city: 'Berlin',
		country: 'Germany'
	},
	{
		identity: 'Bob',
		firstname: 'Bob',
		lastname: 'Fox',
		street: 'Schulgasse 150',
		zipcode: '1111111',
		did: '',
		city: 'Rom',
		country: 'Italy'
	}
];

test.describe('Simple exchange of address between Alice and Bob', () => {
	let page, page2;

	test.beforeAll(async ({ browser }) => {
		test.setTimeout(50000);
		page = await initializeNewPage(browser, users[0]);
		page2 = await initializeNewPage(browser, users[1]);
	});

	test('Alice and Bob can exchange addresses', async () => {
		test.setTimeout(50000);

		await page.getByRole('img', { name: 'Swarm connected' }).click({ timeout: 50000 });
		await page2.getByRole('img', { name: 'Swarm connected' }).click({ timeout: 50000 });
		await page2.getByRole('tab', { name: 'Contacts' }).click({ timeout: 250000 });
		await page2.getByRole('textbox', { role: 'scanContact' }).click();
		await page2.getByRole('textbox', { role: 'scanContact' }).fill(users[0].did);

		await page2.getByRole('textbox').press('Enter');
		//await page2.getByRole('button', { name: 'Scan Contact' }).click({ timeout: 250000 });
		await new Promise(resolve => setTimeout(resolve, 10000)); //TODO is that necessary?
		let i = 0;
		while (i < 100) { //TODO what is that here?
			i++;
			const exchangeButtonCount = await page.getByRole('button', { name: 'Exchange Contact Data' }).count();
			if (exchangeButtonCount == 0) {
				await page2.getByRole('textbox').press('Enter');
			} else {
				break;
			}
			console.log("i", i);
			await new Promise(resolve => setTimeout(resolve, 10000));
		}

		//Exchanging data
		await page.getByRole('button', { name: 'Exchange Contact Data' }).click({ timeout: 50000 });
		await page2.getByRole('button', { name: 'Exchange Contact Data' }).click({ timeout: 50000 });

		//Update Test
		await page2.getByRole('row', { name: users[1].identity }).locator('label').click();
		await page2.getByPlaceholder('Enter lastname...').click();
		await page2.getByPlaceholder('Enter lastname...').fill(users[2].lastname);
		await page2.getByPlaceholder('Enter street...').click();
		await page2.getByPlaceholder('Enter street...').fill(users[2].street);
		await page2.getByPlaceholder('Enter zipcode...').click();
		await page2.getByPlaceholder('Enter zipcode...').fill(users[2].zipcode);
		await page2.getByPlaceholder('Enter city...').click();
		await page2.getByPlaceholder('Enter city...').fill(users[2].city);
		await page2.getByPlaceholder('Enter country...').fill(users[2].country);
		await page2.getByRole('button', { name: 'Update' }).click();

		await page2.getByRole('row', { name: users[1].identity }).locator('span').click();

		await page.getByRole('row', { name: users[2].lastname }).locator('span').click();

	});

	test('Alice updates her address and Bob receives the update', async () => {

	})

	test('Bob updates his address and Alice receives the update', async () => {

	})

	test.afterAll(async () => {
		await Promise.all([
			page.close(),
			page2.close()
		]);
	});
});
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
	await page.getByLabel('Category').click();
	await page.getByText('Private').click();
	await page.locator('label').filter({ hasText: 'our own address' }).click();
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
		await page.getByLabel('DID', { exact: true }).click();
		user.did = await page.getByLabel('DID', { exact: true }).inputValue();
		await page.getByRole('tab', { name: 'My Address' }).click();
		await fillForm(page, user);
		await page.getByRole('button', { name: 'Add' }).click({ timeout: 50000 });
		return page;
	} catch (error) {
		console.error('Error opening new page:', error);
	}
}

/*

import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Generate New' }).click();
  await page.getByRole('tab', { name: 'My Address' }).click();
  await page.getByPlaceholder('Enter firstname...').click();
  await page.getByPlaceholder('Enter firstname...').fill('David');
  await page.getByPlaceholder('Enter firstname...').press('Tab');
  await page.getByPlaceholder('Enter lastname...').fill('reb');
  await page.getByPlaceholder('Enter lastname...').press('Tab');
  await page.getByPlaceholder('Enter street...').fill('Hhhh');
  await page.getByPlaceholder('Enter street...').press('Tab');
  await page.getByPlaceholder('Enter zipcode...').fill('7575');
  await page.getByPlaceholder('Enter zipcode...').press('Tab');
  await page.getByPlaceholder('Enter city...').fill('Ghjghj');
  await page.locator('label').filter({ hasText: 'our own address' }).click();
  await page.getByRole('button', { name: 'Add' }).click();
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill('did:key:z6MkwLMucNJ6ueHwoWY4ShMT8ZzFfsrmwS8gGv3CuLxsZRZx');
  await page.getByRole('textbox').press('Enter');
  await page.getByRole('button', { name: 'Exchange Contact Data' }).click();
  await page.getByRole('row', { name: 'Expand current row reb David' }).locator('span').click();
  await page.getByPlaceholder('Enter street...').click();
  await page.getByPlaceholder('Enter street...').fill('Hhhh 1000');
  await page.getByRole('button', { name: 'Update' }).click();

	await page.getByRole('button', { name: 'Expand current row' }).click();
});





import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Generate New' }).click();
  await page.getByRole('tab', { name: 'My Address' }).click();
  await page.getByPlaceholder('Enter firstname...').click();
  await page.getByPlaceholder('Enter firstname...').fill('Dodo');
  await page.getByPlaceholder('Enter firstname...').press('Tab');
  await page.getByPlaceholder('Enter lastname...').fill('Reee');
  await page.getByPlaceholder('Enter lastname...').press('Tab');
  await page.getByPlaceholder('Enter street...').fill('Zuzt');
  await page.getByPlaceholder('Enter street...').press('Tab');
  await page.getByPlaceholder('Enter zipcode...').fill('765676');
  await page.locator('label').filter({ hasText: 'our own address' }).click();
  await page.getByRole('button', { name: 'Add' }).click();
  await page.getByRole('tab', { name: 'Settings' }).click();
  await page.getByLabel('DID', { exact: true }).click({
    clickCount: 3
  });
  await page.getByLabel('DID', { exact: true }).press('Control+c');
  await page.getByRole('button', { name: 'Exchange Contact Data' }).click();
  await page.getByRole('tab', { name: 'Contacts' }).click();
  await page.getByRole('row', { name: 'Expand current row Reee Dodo' }).locator('span').click();
  await page.getByRole('tab', { name: 'Contacts' }).click();
  await page.getByRole('row', { name: 'Expand current row reb David' }).locator('span').click();
  await page.getByRole('tab', { name: 'Contacts' }).click();
});


await page.getByRole('button', { name: 'Exchange Contact Data' }).click();
  await page.getByRole('row', { name: 'Expand current row Baa Reef' }).getByLabel('Expand current row').click();
  await page.getByLabel('Expand current row').click();
  await page.getByRole('row', { name: 'Collapse current row Baa Reef' }).locator('span').click();
  await page.getByPlaceholder('Enter street...').click();
  await page.getByPlaceholder('Enter street...').fill('asfda 77777');
  await page.getByRole('button', { name: 'Update' }).click();
  await page.getByText('{ "id": "2cd58ca3d5df16603c45c58fac41958e2546973987a696576a05553c4b223302", "').click();
  await page.getByText('{ "id": "2cd58ca3d5df16603c45c58fac41958e2546973987a696576a05553c4b223302", "').dblclick();

*/