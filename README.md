![github workflow](https://github.com/davidreband/deContact/actions/workflows/playwright.yml/badge.svg)

# deContact
A peer-to-peer address book and protocol built on Libp2p, Helia and OrbitDB
Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Main Use Case
1. My address book on my phone is outdated. We need a way to automatically update contact data as somebody is moving into a new city or country.
2. I don't like to host my data on Google, Amazon or Facebook any longer. 

## Features
1. onboarding of a new user and account creation
2. backup seed on new device (auto sync my devices)
3. add my own contact data (private, business, other)
4. contact List (see my own contact data and others (decentralized and traditional))
5. search in contact list
6. request contact data by (scanning a) DID
7. answer contact data request and write contact data in requesters db
8. update own contact data and write updates into follower dbs
9. backup of follower dbs
10. backup of followed dbs

## Todo's
- Alice is Onboarding Bob via QR-Code (two different QR-Codes are provided)
  - a) Bob has deContact pwa/app and is scanning a DID
  - b) Bob doesn't have deContact and is scanning a public url 

## Developing
1. Clone this repository
2. ```npm i ```
3. ```npm run dev```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.


## Tests

npm run test:e2e
npx playwright test BasicAddressExchange.spec.js --debug --trace on
npx playwright test MyDevicesAutoSync.spec.js --debug  --trace on
npx playwright codegen - The command npx playwright codegen is a helpful tool provided by Playwright to facilitate writing test scripts. It launches a browser and records the user's interactions to generate a Playwright test script.