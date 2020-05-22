# Getting started

- Short intro what Storex Hub does
- What we are going to do

  - Download the boilerplate
  - Start the development version of Storex Hub
  - Write an external application, so you can quickly start and restart it
  - Experiment with some endpoint (exposing a GitHub related call?)
  - Package it as a plugin?

## Installation

```
git clone git@github.com:WorldBrain/storex-hub.git
cd storex-hub
npm install
DB_PATH='./dev/db' PLUGINS_DIR='./dev/db/plugins' npm run start
```

Here we download Storex Hub and ran it in development mode, which runs on port `50483`, whereas the production version users install run on port `50842`. Also, we manually specify anoter database directory and plugins directory. These things ensure you can safely develop your apps without messing up important data in your main Storex Hub, and can isolate the development environment of different apps you may be writing.

## Running the boilerplate as an external app

Now, we'll clone and run the boilerplate as an _external app_, as opposed to a _plugin_ (which we'll learn about later). An external app runs outside of Storex Hub, connects to it through the HTTP or WebSocket API and identifies itself with an [access token](/storex-hub/guides/access-tokens/) (which its responsible for itself to store it). Running the app as an external app allows us to test faster during development because we don't have to bundle the code into a plugin and restart Storex Hub every time we make a change. Open up another terminal and run:

```
git clone git@github.com:WorldBrain/storex-hub-boilerplate.git
cd storex-hub-boilerplate
npm install
npm run start
```

## Identifiers

Every app needs to have a unique identifier. Using this identifier, other apps can refer to the data, settings and functionality you expose from your app. Identifiers follow the reverse domain name convention with the reversed domain name of your organization, followed the plugin name, like `io.worldbrain.twitter` for a Twitter integration written by WorldBrain. The boilerplate comes with a default app identifier, so change the `APP_NAME` in `ts/constant.ts` to something like:

```js
const APP_NAME = "com.test.example";
```

## Registering a remote call

As a simple example, we'll expose functionality for other apps to get some details about a GitHub organization. We do this through remote calls, which are function calls that Storex Hub routes the right app (with a permission layer in the future).

- Implementing the remote call
  - https://api.github.com/orgs/WorldBrain
- Packaging it as a plugin
  - The execution model of plugins
  - You build a plugin with Webpack
  - You either place it in the plugin dir next to the Storex Hub binary, or install it with the CLI
- The manifest: `identifer`, `version`, `siteUrl`, `entryFunction`
- Links to [Guides](/storex-hub/guides/) showing the different things you can do with the API:
  - [Store your own data](/storex-hub/guides/storing-data/)
  - [Interacting with other external applications](/storex-hub/guides/remote-apps/)
  - [Storing your user-configurable settings](/storex-hub/guides/settings/)
  - [Integrating with Memex](/storex-hub/guides/memex/)
