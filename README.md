![example workflow](https://github.com/davidreband/deContact/actions/workflows/playwright.yml/badge.svg)

# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

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

