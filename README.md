# gronk
frontend for gronk (my submission for the 2025 t3.chat cloneathon)

> You'll need a [compatible backend server repo](https://github.com/ethrydevelops/gronk-backend)

## what is gronk?
gronk is a basic(?) frontend for your chosen llms, kinda like chatgpt but worse.

with gronk, you can use your own self-hosted (via [ollama](https://github.com/ollama/ollama)) or hosted (with something like [openrouter](https://openrouter.ai/)), or probably anything that's compatible with openai's chat completions api.

gronk is [licensed under MIT](./LICENSE), so you can do basically anything with it really.

## gronk's features
* support for multiple models
* you're not locked into a single api or provider
* fully synced, real-time chats with sockets
* syntax highlighting and markdown support
* fully in-browser
* i think it looks pretty nice (for the most part)
* and more

## setup instructions
### prerequisites
to run this app, you must have:
* nodejs (either lts or latest)
* a chosen, trusted backend server (you can also <ins>host your own</ins>: [software is available here](https://github.com/ethrydevelops/gronk-backend))

### instructions

1. clone this repo:
```sh
$ git clone https://github.com/ethrydevelops/gronk
```

2. install everything:
```sh
$ npm i
```

3. run it:
```sh
# you can run a development server with vite:
$ npm run dev

# OR you can build it and serve it with some sort of server:
$ npm run build

# ...
```

4. **it's now running, congrats!** you can create an account on a chosen instance on the newly hosted site and get started. once you've created your account, you can add your chosen models by clicking "Settings" (top-right) -> "Models".

## hosted instance

unfortunately, a hosted instance isn't published yet.