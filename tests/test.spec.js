import { test, expect } from '@playwright/test';
import { chromium } from 'playwright';

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
		identity: 'Alice',
		firstname: 'Alice',
		lastname: 'Fox',
		street: 'Schulgasse 150',
		zipcode: '1111111',
		did: '',
		city: 'Rom',
		country: 'Italy'
	}
];

async function OpenNewBrowser(user) {
	const browser = await chromium.launch({
		headless: true
	});

	const context = await browser.newContext();
	const page = await context.newPage();
	const page_url = process.env.PAGE_URL;

	await page.goto(page_url);

	await page.evaluate(() => window.localStorage.clear());
	await page.evaluate(() => window.sessionStorage.clear());
	/*
	const dbs = await page.evaluate(() => {
		return  window.indexedDB.databases()
	});
	console.log("___",dbs)
	dbs.forEach(async (db) => {
		console.log("__aaa_",db.name)
		//await page.evaluate( () =>  window.indexedDB.deleteDatabase(db.name) );
	});

	await page.evaluate(
		() => {
			const dbs = await window.indexedDB.databases();
			dbs.forEach(db => {
				console.log("___",db.name)
				window.indexedDB.deleteDatabase(db.name)
			});
		}
	);
*/


	//await page.goto(page_url);
	//await page.goto('http://www.decontact.xyz/');
	//await page.goto('https://davidreband.github.io/deContact/');

	await page.getByRole('button', { name: 'Continue' }).click();
	await page.getByRole('button', { name: 'Generate New' }).click();
	//await page.getByLabel('My Handle').click();
	//await page.getByLabel('My Handle').fill(user.identity);
	await page.getByRole('tab', { name: 'Settings' }).click();
	await page.getByLabel('DID', { exact: true }).click();
	user.did = await page.getByLabel('DID', { exact: true }).inputValue();


	await page.getByRole('tab', { name: 'My Address' }).click();

	//await page.getByRole('tab', { name: 'Settings' }).click();
	//await page.getByLabel('My Identity').click();
	//await page.getByLabel('My Identity').fill(user.identity);
	await page.getByRole('tab', { name: 'My Address' }).click();
	await page.getByPlaceholder('Enter firstname...').click();
	await page.getByPlaceholder('Enter firstname...').fill(user.firstname);
	await page.getByPlaceholder('Enter lastname...').click();
	await page.getByPlaceholder('Enter lastname...').fill(user.lastname);
	await page.getByPlaceholder('Enter street...').click();
	await page.getByPlaceholder('Enter street...').fill(user.street);
	await page.getByPlaceholder('Enter zipcode...').click();
	await page.getByPlaceholder('Enter zipcode...').fill(user.zipcode);
	await page.getByPlaceholder('Enter city...').click();
	await page.getByPlaceholder('Enter city...').fill(user.city);
	await page.getByPlaceholder('Enter country...').click();
	await page.getByPlaceholder('Enter country...').fill(user.country );
	await page.getByRole('button', { name: 'Add' }).click({ timeout: 50000 });
	return page;
}

test.beforeAll(async () => {

});


test.describe('simple exchange of adress between Alice and Bob', () => {
	test('test', async () => {
		test.setTimeout(60000);

		const page = await OpenNewBrowser(users[0]);
		const page2 = await OpenNewBrowser(users[1]);

		await page2.getByRole('textbox').click({ timeout: 50000 });
		await page2.getByRole('textbox').fill(users[0].did);
		await page2.getByRole('button', { name: 'Scan Contact' }).click();
		await page.getByRole('button', { name: 'Continue' }).click();
		await page2.getByRole('button', { name: 'Continue' }).click();
		await page.getByRole('textbox').click({ timeout: 50000 });
		await page.getByRole('textbox').fill(users[1].did);
		await page.getByRole('button', { name: 'Scan Contact' }).click();
		await page2.getByRole('button', { name: 'Continue' }).click();
		await page.getByRole('button', { name: 'Continue' }).click();
		await page.getByRole('row', { name: users[0].identity }).locator('label').click();

		await page.getByPlaceholder('Enter lastname...').click();
		await page.getByPlaceholder('Enter lastname...').fill(users[2].lastname);

		await page.getByPlaceholder('Enter street...').click();
		await page.getByPlaceholder('Enter street...').fill(users[2].street);

		await page.getByPlaceholder('Enter zipcode...').click();
		await page.getByPlaceholder('Enter zipcode...').fill(users[2].zipcode);

		await page.getByPlaceholder('Enter city...').click();
		await page.getByPlaceholder('Enter city...').fill(users[2].city);

		await page.getByPlaceholder('Enter country...').fill(users[2].country);
		await page.getByRole('button', { name: 'Update' }).click();

		await page2.getByRole('button', { name: 'Continue' }).click();

		//await page2.getByRole('textbox').click({ timeout: 50000 });

		await page2.getByRole('row', { name: users[0].identity }).locator('label').click();

		//await page.getByRole('tab', { name: 'Settings' }).click({ timeout: 50000 });
		//await page.getByLabel('DID').click({ timeout: 50000 });

		// await expect(page2.getByRole('row', { name: users[0].identity })).toContainText(users[2].street);

		//console.log ("____", await page2.getByText(users[0].street, { exact: true }))



		//await expect(page2.getByPlaceholder('Enter street...')).toHaveText(users[2].street);

		await page.getByRole('tab', { name: 'Settings' }).click({ timeout: 50000 });
		// await page.getByLabel('DID').click({ timeout: 50000 });

		await page.close();
		await page2.close();
	});
});

test.afterAll(async () => {
	//await page.close();
	//await page2.close();
});