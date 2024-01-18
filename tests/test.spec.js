import { test, expect } from '@playwright/test';
import puppeteer from 'puppeteer';
const { chromium } = require('playwright');

/*
test('test chromium', async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
});
*/

test('test', async () => {
  const browser = await chromium.launch({
		headless: false
	});
	const context = await browser.newContext();
	const page = await context.newPage();




	await page.goto('http://localhost:5173/');
	await page.getByRole('tab', { name: 'Settings' }).click();
	await page.getByLabel('My Identity').click();
	await page.getByLabel('My Identity').fill('Alice');
	await page.getByRole('tab', { name: 'My Address' }).click();
	await page.getByPlaceholder('Enter firstname...').click();
	await page.getByPlaceholder('Enter firstname...').fill('Alice');
	await page.getByPlaceholder('Enter lastname...').click();
	await page.getByPlaceholder('Enter lastname...').fill('Maier');
	await page.getByPlaceholder('Enter street...').click();
	await page.getByPlaceholder('Enter street...').fill('Schulgasse 5');
	await page.getByPlaceholder('Enter zipcode...').click();
	await page.getByPlaceholder('Enter zipcode...').fill('84359');
	await page.getByPlaceholder('Enter city...').click();
	await page.getByPlaceholder('Enter city...').fill('Simbach am Inn');
	await page.getByPlaceholder('Enter country...').click();
	await page.getByPlaceholder('Enter country...').fill('German');
	await page.getByRole('button', { name: 'Add' }).click({ timeout: 50000});

  

  const browser2 = await chromium.launch({
    headless: false
  });
  const context2 = await browser2.newContext();
  const page2 = await context2.newPage();
  await page2.goto('http://localhost:5173/');
  await page2.getByRole('tab', { name: 'Settings' }).click({ timeout: 50000});
	await page2.getByLabel('My Identity').click();
	await page2.getByLabel('My Identity').fill('Bob');
	await page2.getByRole('tab', { name: 'My Address' }).click();
	await page2.getByPlaceholder('Enter firstname...').click();
	await page2.getByPlaceholder('Enter firstname...').fill('Bob');
	await page2.getByPlaceholder('Enter lastname...').click();
	await page2.getByPlaceholder('Enter lastname...').fill('Maier2');
	await page2.getByPlaceholder('Enter street...').click();
	await page2.getByPlaceholder('Enter street...').fill('Schulgasse 10');
	await page2.getByPlaceholder('Enter zipcode...').click();
	await page2.getByPlaceholder('Enter zipcode...').fill('84359');
	await page2.getByPlaceholder('Enter city...').click();
	await page2.getByPlaceholder('Enter city...').fill('Simbach am Inn');
	await page2.getByPlaceholder('Enter country...').click();
	await page2.getByPlaceholder('Enter country...').fill('German');
	await page2.getByRole('button', { name: 'Add' }).click();

  await page2.getByRole('textbox').click({ timeout: 50000 });
	await page2.getByRole('textbox').fill('Alice');
	await page2.getByRole('button', { name: 'Scan Contact' }).click(); 
  
  await page2.getByRole('textbox').click({ timeout: 50000 });

	await page.getByRole('button', { name: 'Continue' }).click();
  //await page2.getByRole('textbox').click({ timeout: 50000 });
 
  await page2.getByRole('button', { name: 'Continue' }).click();

  //await page.getByRole('textbox').click();
  //await page.getByRole('textbox').fill('Bob');
  //await page.getByRole('button', { name: 'Scan Contact' }).click(); 

  //await page2.getByRole('tab', { name: 'Settings' }).click();

});
