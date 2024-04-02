![github workflow](https://github.com/silkroadnomad/deContact/actions/workflows/self-hosted-runner.yml/badge.svg)

# deContact
A peer-to-peer address book in Svelte with local first protocol built on libp2p, Helia and OrbitDB

![dcontact-v0.2 (istanbul)](doc/dcontact-v0.2.jpg "dcontact-v0.2")

## Main Use Case
1. My address book on my phone is outdated. I need a way to automatically update contact data as somebody is moving into a new city or country.
2. I don't like to host my data on Google, Amazon or Facebook any longer. 

## Features
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
```bash
npm run test:e2e   #headless
npm run test:e2e:manual 
```
