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

test.describe('Simple exchange of address between Alice and Bob', () => {
	let page, page2;

	test.beforeAll(async ({ browser }) => {
		test.setTimeout(10000);
		page = await initializeNewPage(browser, users[0]);
		page2 = await initializeNewPage(browser, users[1]);
	});

	test('Alice and Bob can exchange addresses', async () => {
		test.setTimeout(50000);

		try { 
			await page.getByRole('img', { name: 'Swarm connected' }).click({ timeout: 50000 });
		} catch(error){
			console.log("no connection Alice")
		}

		try { 
			await page2.getByRole('img', { name: 'Swarm connected' }).click({ timeout: 50000 });
		} catch(error){
			console.log("no connection Bob")
		}

		await page2.getByRole('tab', { name: 'Contacts' }).click();
		await page2.getByRole('textbox', { role: 'scanContact' }).click();
		await page2.getByRole('textbox', { role: 'scanContact' }).fill(users[0].did);
		
	
		await page.waitForTimeout(15000);
		await page2.getByRole('button', { name: 'Scan' }).click();
		
   	//await Promise.all([
   	// page.waitForEvent('addressExchange')  		
  	//]);	
		
			
		//Exchanging data	
		try { 
			await page.getByRole('button', { name: 'Send My Contact Data' }).click();
		} catch(error){
			throw new Error("Exchange of Alice's contact information was not successful")		
		}

		

		try { 
			await page2.getByRole('button', { name: 'Send My Contact Data' }).click();
		} catch(error){
			throw new Error("Exchange of Bob's contact information was not successful")	
		}

		//await page.getByRole('button', { name: 'Cancel' }).click();
	});

	test('Bob updates his address and Alice receives the update', async () => {

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
		//await page2.getByRole('row', { name: users[1].identity }).locator('span').click();		

		try { 
			await page.getByRole('row', { name: users[2].lastname }).locator('span').click();
			console.log("Bob update was successful")
		} catch(error){
			throw new Error("Update was not successful")	
		}

	})

	test('Alice updates her address and Bob receives the update', async () => {

		await page.getByRole('tab', { name: 'Contacts' }).click();
		await page.getByRole('row', { name: users[0].identity }).locator('label').click();
		await page.getByPlaceholder('Enter lastname...').click();
		await page.getByPlaceholder('Enter lastname...').fill(users[3].lastname);
		await page.getByPlaceholder('Enter street...').click();
		await page.getByPlaceholder('Enter street...').fill(users[3].street);
		await page.getByPlaceholder('Enter zipcode...').click();
		await page.getByPlaceholder('Enter zipcode...').fill(users[3].zipcode);
		await page.getByPlaceholder('Enter city...').click();
		await page.getByPlaceholder('Enter city...').fill(users[3].city);
		await page.getByPlaceholder('Enter country...').fill(users[3].country);
		await page.getByRole('button', { name: 'Update' }).click();
		await page.getByRole('row', { name: users[0].identity }).locator('span').click();		

		try { 
			await page2.getByRole('row', { name: users[3].lastname }).locator('span').click();
			console.log("Alice update was successful")
		} catch(error){
			throw new Error("Update was not successful")	
		}

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
