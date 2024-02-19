![github workflow](https://github.com/davidreband/deContact/actions/workflows/playwright.yml/badge.svg)

# deContact
A peer-to-peer address book and protocol built on Libp2p, Helia and OrbitDB
Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Main Use Case
1. My address book on my phone is outdated. We need a way to automatically update contact data as somebody is moving into a new city or country.
2. I don't like to host my data on Google, Amazon or Facebook any longer. 

## Features
1. Alice requests 

## Use Cases
1. Onboarding of a new user and account creation
2. Backup seed on new device (Auto Device Sync)
3. Add my own contact data (private, business, other)
4. Contact List (see my own contact data and others (decentralized and traditional))
5. Search in contact list
6. Request contact data by (scanning a) DID
7. Answer contact data request and write contact data in requesters db
8. Update own contact data and write updates into follower dbs
9. Backup of follower dbs
10. Backup of followed dbs

## Developing
1. Clone this repository
2. npm i 
3. npm run dev

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.


## Tests

npm run test:e2e

To run the Playwright test, use the command npm run test:e2e. This command will execute the BasicAddressExchange.spec.js test with Playwright. Make sure you have Playwright installed in your project 

npx playwright test BasicAddressExchange.spec.js --debug --trace on 

npx playwright test MyDevicesAutoSync.spec.js --debug  --trace on 

npx playwright codegen

The command npx playwright codegen is a helpful tool provided by Playwright to facilitate writing test scripts. It launches a browser and records the user's interactions to generate a Playwright test script.

Here are the steps to use it:

1. Run the command npx playwright codegen in your terminal.
2. A new browser will be launched.
3. Interact with the browser as you would in your test.
4. The actions you perform in the browser will be recorded in the terminal and converted into Playwright code.
5. Copy the generated code into your test file.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

