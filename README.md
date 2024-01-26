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
rm -rf .git // Remove the git folder to start a fresh github repo
git init -b main
bun install // or npm / pnpm ect...
```

Make a new D1 Database with wrangler (or the web dashboard). If you haven't done before you will need to login with wrangler, replace YOUR_DB_NAME with a name of your choosing.

```bash
bunx wrangler d1 create YOUR_DB_NAME
```

When you make a new database wrangler will return an ID, update the wrangler.toml file in the root directory with your new database ID and name. Leave the rest of the wrangler.toml unchanged.

Next run the sql file to get the authentication tables set up.
```bash
bunx wrangler d1 execute YOUR_DB_NAME --local --file ./drizzle/0000_sad_star_brand.sql
  
```
Note you will need to run this without the "--local" prior to deploying


You can then run the dev server, this will be the familair defult sveltekit skeleton project with a few additions, the routes "login" and "register".  

Use these routes to confirm everything is working.


## Deploying to Cloudflare



### Set up D1

Use wrangler to set up the database tables like above

```bash
bunx wrangler d1 execute YOUR_DB_NAME --file ./drizzle/0000_sad_star_brand.sql
```

### Compile and deploy worker for password hashing

We need to set up a replacement worker for password hashing, as node isn't available on the cloudflare worker runtime. 

This repository has an example of using a rust wasm Argon2id implementation.   

https://github.com/glotlabs/argon2-cloudflare

We will use this to build a seperate cloudflare worker that we can access via a binding to perform the password hashing and verification. You will need rust installed to compile the wasm.  

You could also use a pre-built wasm binary, there is one available at https://github.com/auth70/argon2-wasi  

However you will need to wrap this in worker code to process the requests


To build the worker, clone the glotlabs argon2-cloudflare repository and compile the worker, (install rust first rust-lang.org). You can follow the instructions in the github repo or follow the instructions below.

```bash
cd .. // Go back a directory
git clone https://github.com/glotlabs/argon2-cloudflare.git
cd argon2-cloudflare
bun install
bunx wrangler deploy

```

This will deploy a worker function to cloudflare with the name argon2.

### Deploy aplication to cloudflare  

Re-enter the main project directory (cd ../CLAST-D1)

Make a new github repo https://github.com/new/

Add you new repo as origin

``` bash
git add .
git commit -m "first commit"
git remote add origin https://github.com/<USERNAME>/<REPONAME>
git push -u origin main

```

Make a new pages project on cloudflare using the dashboard, link you github project to it. Set framework to svelte, change build command as "bun run build" if using bun.

Deploy your project, it should succeed but you won't be able to login. We need to bind our database and the hashing worker, continue to the project configuration and go to settings and then Functions.

Scroll down and at the D1 Databse bidnings, bind the database you made to the variable name'DB'

Then bind the worker function to the variable name 'WASM'







