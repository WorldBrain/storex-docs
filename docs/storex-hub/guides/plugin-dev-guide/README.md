# Plugin Development Guide

## 1. Setting up the developer environment

Type the following commands in a new Terminal window.

```
$ git clone git@github.com:WorldBrain/§ storex-hub.git
$ cd storex-hub
$ npm install
$ DB_PATH='./dev/db' PLUGINS_DIR='./dev/db/plugins'
$ npm run start
```

With this command StorexHub runs in development mode on port`50483`. (Production runs on `50842`)

Access the running StorexHub Interface with
`http://localhost:50483/management`

With these steps, you manually specified another database directory and plugins directory. These things ensure you can safely develop your apps without messing up important data in your main StorexHub, and can isolate the development environment of different apps you may be writing.

Your DB location on disk in StorexHub's folder. You can use a separate one for each app you're developing, so you have isolated environments. This way your data is preserved between restarts and if you have an external application that stores the access token, you can re-use that access token. If you run Storex Hub in memory, it will forget those access token, so you also need to forget it and recreate your app from your external application. To run Storex Hub in memory, just omit the DB_PATH.

## 2. Understanding the structure of StorexHub Plugins

### 1. The manifest

As a central document, the manifest contains all important information about the plugin.

| Key           | Description                                                         | Expected Value                                                                                                                                                                                                                                                                                                                                         |
| ------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| identifer     | ID of your application.                                             | Reverse domain name convention with the reversed domain name of your organization, followed the plugin name, like `io.worldbrain.twitter` for a Twitter integration written by WorldBrain. The boilerplate comes with a default app identifier, so change the `APP_NAME` in `ts/constant.ts` to something like: `const APP_NAME = "com.test.example";` |
| version       | Version Number of your application                                  | Follow the [SemVer](https://semver.org/) convention.                                                                                                                                                                                                                                                                                                   |
| siteUrl       | Url to docs or website your plugin links in the StorexHub dashboard | Any URL you want                                                                                                                                                                                                                                                                                                                                       |
| mainPath      | Path relative to the plugin root contain the plugin code            | A relative path, like plugin.js                                                                                                                                                                                                                                                                                                                        |
| entryFunction | Which function in the main JS file to call to initialize the plugin | A function name, like `main`                                                                                                                                                                                                                                                                                                                           |

### 2. Using the boilerplate

We've provided a [boilerplate for a StorexHub plugin](https://github.com/WorldBrain/storex-hub-boilerplate) for you to understand better how to write other plugins.

Quick install guide:

```
git clone git@github.com:WorldBrain/storex-hub-boilerplate.git
cd storex-hub-boilerplate
npm install
yarn build:dev or yarn build:prod
cd <storex-hub-dir>
yarn cli plugins:install <this-repo>/build
```

### 3. External application or StorexHub plugins

You can connect an external application or a StorexHub plugin to StorexHub. StorexHub plugins can both run internally or as external applications too.
An external app runs outside of Storex Hub, connects to it through the HTTP or WebSocket API and identifies itself with an access token which every app is responsible for itself to store.
Running the app as an external app allows us to test faster during development because we don't have to bundle the code into a plugin and restart Storex Hub every time we make a change. To try this out with the StorexHub plugin boilerplate, open up another terminal and run:

```
git clone git@github.com:WorldBrain/storex-hub-boilerplate.git
cd storex-hub-boilerplate
npm install
npm run start
```

#### Registering a remote call

As a simple example, we'll expose functionality for other apps to get some details about a GitHub organization. We do this through remote calls, which are function calls that StorexHub routes to the specified app.

Registering a call. Examples: - https://github.com/WorldBrain/Memex/blob/9d745f7fa82e751929519183c5bf366cc42ea81d/src/storex-hub/background/index.ts#L67 - https://github.com/WorldBrain/Memex/blob/9d745f7fa82e751929519183c5bf366cc42ea81d/src/storex-hub/background/index.ts#L97 - Note: The client here implements the API
Consuming a call. Examples: - In code: https://github.com/WorldBrain/storex-hub/blob/develop/ts/tests/api/remote-apps.test.ts#L261 - Note: Here we get an API in another way, but it's still the same API - From the CLI: `yarn cli calls:execute io.worldbrain.memex indexPage '{"url": "http://www.thomasthwaites.com/the-toaster-project/", "bookmark": true, "tags": ["tag-one", "tag-two"]}'`

## 4. Bundling and installing a plugin

After you finished a release use these commands to bundle your plugins:

```
yarn build:prod
cd <storex-hub-dir>
yarn cli plugins:install <this-repo>/build
```

Then your app is ready to be put into the `/plugins` folder and installed.

## 4. Development tips

TODO!
