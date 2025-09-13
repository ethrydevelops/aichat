# gronk-backend
backend server

## setup instructions
### prerequisites

you'll need:
* nodejs
* an SQL database (you can get one for free from [neon](https://neon.com))
* a compatible frontend (if you want to use this to any meaningful capacity)

### instructions

1. clone the repo

2. go into ./server/ and install all the dependencies:
```sh
$ cd server/
$ npm i
```

3. **(recommended)** generate an SSL certificate. you can make free ones with a [letsencrypt acme client](https://letsencrypt.org/docs/client-options/). then, you can move the generated certificate + private key into a chosen directory (preferably `./certs/` since it's easiest)

> [!NOTE]
> while you *could* run the backend server on HTTP, it's not recommended as sensitive information will be passed through the server -> client frequently, otherwise making it vulnerable to MITM

4. run `knex init` and configure your database in `./knexfile.js`

5. run `knex migrate:latest` to automatically create the required tables

6. copy `COPY-TO.env` to `.env` and edit the values.

7. start the server:
```sh
$ node .
```

8. yay! your server is now online! you can now connect to it with a compatible client.