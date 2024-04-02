import { test, expect } from '@playwright/test';
import { chromium } from 'playwright';

const browser = await chromium.launch({
	headless: process.env.HEADLESS==="true"?process.env.HEADLES==="true":true
});
test.describe('Simple exchange of address between Alice and Bob', async () => {
	let pageAlice, pageBob;

	test.beforeAll(async ({ browser }) => {
		test.setTimeout(10000);
		pageAlice = await initializeNewPage(browser, users[0]);
		pageBob = await initializeNewPage(browser, users[1]);
	});

	test('Alice and Bob can exchange addresses', async () => {
		test.setTimeout(50000); 

		const connect =  pageAlice.getByRole('img', { name: 'Swarm connected' })
		await expect(connect, 'connection Alice').toBeEnabled({ timeout: 15000 });

		const connect2 =  pageBob.getByRole('img', { name: 'Swarm connected' })
		await expect(connect2, 'connection Bob').toBeEnabled();

		await pageBob.getByRole('tab', { name: 'Contacts' }).click();
		await pageBob.getByRole('textbox', { role: 'scanContact' }).click();
		await pageBob.getByRole('textbox', { role: 'scanContact' }).fill(users[0].did);
		await pageBob.getByRole('button', { name: 'Scan' }).click();


		const button = pageAlice.getByRole('button', { name: 'Send My Contact Data' })
		await expect(button, "Exchange of Alice's contact information was successful").toBeEnabled();
		await button.click();

		const button2 = pageBob.getByRole('button', { name: 'Send My Contact Data' })
		await expect(button2, "Exchange of Bobs's contact information was successful").toBeEnabled();
		await button2.click();


		//await pageAlice.getByRole('button', { name: 'Cancel' }).click();
	});

	test('Bob updates his address and Alice receives the update', async () => {

		await pageBob.getByRole('row', { name: users[1].identity }).locator('label').click();
		await pageBob.getByPlaceholder('Enter lastname...').click();
		await pageBob.getByPlaceholder('Enter lastname...').fill(users[2].lastname);
		await pageBob.getByPlaceholder('Enter street...').click();
		await pageBob.getByPlaceholder('Enter street...').fill(users[2].street);
		await pageBob.getByPlaceholder('Enter zipcode...').click();
		await pageBob.getByPlaceholder('Enter zipcode...').fill(users[2].zipcode);
		await pageBob.getByPlaceholder('Enter city...').click();
		await pageBob.getByPlaceholder('Enter city...').fill(users[2].city);
		await pageBob.getByPlaceholder('Enter country...').fill(users[2].country);
		await pageBob.getByRole('button', { name: 'Update' }).click();
		//await page2.getByRole('row', { name: users[1].identity }).locator('span').click();
		// const lastname = pageAlice.getByRole('row', { name: users[2].lastname }).locator('span')
		//await expect(lastname).toHaveText('Bob update');
})
/*
	test('Alice updates her address and Bob receives the update', async () => {

		await pageAlice.getByRole('tab', { name: 'Contacts' }).click();
		await pageAlice.getByRole('row', { name: users[0].identity }).locator('label').click();
		await pageAlice.getByPlaceholder('Enter lastname...').click();
		await pageAlice.getByPlaceholder('Enter lastname...').fill(users[3].lastname);
		await pageAlice.getByPlaceholder('Enter street...').click();
		await pageAlice.getByPlaceholder('Enter street...').fill(users[3].street);
		await pageAlice.getByPlaceholder('Enter zipcode...').click();
		await pageAlice.getByPlaceholder('Enter zipcode...').fill(users[3].zipcode);
		await pageAlice.getByPlaceholder('Enter city...').click();
		await pageAlice.getByPlaceholder('Enter city...').fill(users[3].city);
		await pageAlice.getByPlaceholder('Enter country...').fill(users[3].country);
		await pageAlice.getByRole('button', { name: 'Update' }).click();
		await pageAlice.getByRole('row', { name: users[0].identity }).locator('span').click();
		
		const lastname2 = page2.getByRole('row', { name: users[3].lastname }).locator('span')
		
		await expect(lastname2, "Alice update").toBeEnabled();
		console.log("Alice update was successful")

	})
*/
	

	test.afterAll(async () => {
		await Promise.all([
			pageAlice.close(),
			pageBob.close()
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
	// await page.locator('label').filter({ hasText: 'our own address' }).click();
}

async function initializeNewPage(browser, user) {
	
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
	
}
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
	},
	{
		identity: 'Alice',
		firstname: 'Alice',
		lastname: 'May',
		street: 'Moosecker str 789',
		zipcode: '84444',
		did: '',
		city: 'Rom',
		country: 'Italy'
	},
];