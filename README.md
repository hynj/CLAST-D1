# CLAST "stack..."


C - Cloudflare  
L - Lucia auth  
S - Svelte / Shadcn-svelte  
T - Tailwind  
D1 - Cloudflare D1 and Drizzle  

## Why?
Getting Sveltekit / Lucia on Cloudflare using D1 as the database isn't that straightforward. 

1. Lucia uses Argon2id for password hashing in node environments, the CF worker/pages function don't have access to the node runtime. Lucia provides a javascript implementation of Scrypt, however this is really variably performant. With logins taking between 700ms - 5seconds to execute...
2. The method CF suggests to set up a local dev environment is fustratingly slow.
3. Reduced boilerplate, most of the login / logout functionality is copy paste... 

## What this repo is  

Fixes the issues above by  
1. Uses a seperate worker function that runs a rust Argon2id implementation which reduces login times.
2. Sets up miniflare for straightforward local dev

## Getting started

I'm using Bun via WSL, it works great and its much quicker. Start by cloning the repository.
```bash
# Clone this respository
git clone https://github.com/hynj/CLAST-D1.git
cd CLAST-D1
bun install // or npm / pnpm ect...
```

Make a new D1 Database with wrangler (or the web dashboard) and run the execute the sql file to get the authentication tables set up. If you haven't done before you will need to login with wrangler

```bash
bunx wrangler d1 create YOUR_DB_NAME
bunx wrangler d1 execute YOUR_DB_NAME --local --file ./drizzle/0000_sad_star_brand.sql  
```
Note you will need to run this without the "--local" prior to deploying

When you make a new database wrangler will return an ID, update the wrangler.toml file in the root directory with your new database ID, leave the rest of the wrangler.toml unchanged.

You can then run the dev server


## Developing



```bash
bun run dev
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
