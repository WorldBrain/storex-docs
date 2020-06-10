# Plugin Development Guide

## Setting up the developer environment

Type the following commands in a new Terminal window.

```
$ git clone git@github.com:WorldBrain/storex-hub.git
$ cd storex-hub
$ npm install
$ DB_PATH='./dev/db' PLUGINS_DIR='./dev/db/plugins' npm start
```

With this command Storex Hub runs in development mode on port `50483`. (Production runs on `50842`)

Access the running Storex Hub Interface with
`http://localhost:50483/management`

With these steps, you manually specified another database directory and plugins directory. These things ensure you can safely develop your apps without messing up important data in your main Storex Hub, and can isolate the development environment of different apps you may be writing.

Your DB location on disk in the folder you've specified with DB_PATH. You can use a separate one for each app you're developing, so you have isolated environments. This way your data is preserved between restarts and if you have an external application that stores the access token, you can re-use that access token. If you run Storex Hub in memory, it will forget those access token, so you also need to forget it and recreate your app from your external application. To run Storex Hub in memory, just omit the DB_PATH.

## External applications vs. plugins

You can interact with Storex Hub from external applications, or by writing a plugin.

An external application connects through Storex Hub through the WebSocket or HTTP API, can be written use any programming language, and can be started and stopped independently of Storex Hub. External applications register themselves through the API and get an access token back they can use for subsequent sessions. An example of an external application could be an existing product like Memex (running as a web extension) or Evernote. Also, it is useful to run plugins as external applications during development, so you can restart the plugin quickly when you change it instead of compiling your plugin on every change and reloading Storex Hub.

Plugins on the other hand, are a bundle of packaged code with a manifest telling Storex Hub how to display the plugin to the user and how to run it. They get loaded as soon as Storex Hub starts, and you don't have to manage your own access tokens.

Both external applications and plugins register apps, which have their own ID and can have settings, data and functionality associated with them. This is why an app can run both as an external application and a plugin.

We'll start by running our plugin as an external application, then package it when it's ready.

## Understanding the structure of Storex Hub Plugins

As a starting point, let's clone the [Storex Hub plugin boilerplate](https://github.com/WorldBrain/storex-hub-boilerplate):

```
git clone git@github.com:WorldBrain/storex-hub-boilerplate.git
cd storex-hub-boilerplate
npm install
```

To start using the boilerplate, we'll have to change two things:

- `manifest.json`: the `identifier` field to your own reverse-domain name identifier, like `com.example.test`
- `ts/constants.ts`: change the `APP_NAME` to the same identifier.

For this guide, we'll use the `com.example.guide` identifier.

### The manifest

In the boilerplate, you'll find the `manifest.json` file, describing a few things Storex Hub needs to know about the plugin before running it:

| Key           | Description                                                          | Expected Value                                                                                                                                                                                                                                                                                                                                         |
| ------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| identifer     | ID of your application.                                              | Reverse domain name convention with the reversed domain name of your organization, followed the plugin name, like `io.worldbrain.twitter` for a Twitter integration written by WorldBrain. The boilerplate comes with a default app identifier, so change the `APP_NAME` in `ts/constant.ts` to something like: `const APP_NAME = "com.test.example";` |
| version       | Version Number of your application                                   | Follow the [SemVer](https://semver.org/) convention.                                                                                                                                                                                                                                                                                                   |
| siteUrl       | Url to docs or website your plugin links in the Storex Hub dashboard | Any URL you want                                                                                                                                                                                                                                                                                                                                       |
| mainPath      | Path relative to the plugin root contain the plugin code             | A relative path, like plugin.js                                                                                                                                                                                                                                                                                                                        |
| entryFunction | Which function in the main JS file to call to initialize the plugin  | A function name, like `main`                                                                                                                                                                                                                                                                                                                           |

### The scaffolding

Since we have two ways of running the code (as an external application, or a plugin), we also have two different entry points into our program in the boilerplate:

- `ts/main.ts`: the entry point when running the plugin as an external application. In here, we have to manually take care of establishing the connection to Storex Hub, registering or identifying our app, and storing its access token. The standard Storex Hub client (found in `@worldbrain/storex-hub/lib/client) exposes the standard Storex Hub API while hiding the Websocket or HTTP API details.
- `ts/plugin.ts`: the entry point when Storex Hub loads the code as a plugin (as defined in `mainPath` of the `manifest.json`), which should contain a function with the name you specified in `entryFunction` of the `manifest.json` (`main` in the case of the boilerplate. This function gets called with a single parameter containing a `getApi(options)` function which gives you direct access to the standard Storex Hub API.

### The actual functionality of the plugin

Shared between `ts/main.ts` and `ts/plugin.ts` is `ts/application.ts` which contains a class in which we can do things like listening for storage changes in other apps, define our own data schema and store data in it, and expose and consume functionality to and from other apps.

The communication between your application happens in two directions:

- Your code calls Storex Hub, for example to store data/settings, call functionality exposed by other apps, subscribe to events, etc.
- Storex Hub calls into your code through callbacks, for example to deliver an event you registered to, to use consume a call you've exposed, etc.

Callbacks are passed in when you get access to the API, whether that's through the [WebSocket/HTTP client](https://github.com/WorldBrain/storex-hub-boilerplate/blob/7f5f0d7b86d144e85a59e0f1c57ab27d9214a54e/ts/main.ts#L14), or [using the `getApi(options)` function](https://github.com/WorldBrain/storex-hub-boilerplate/blob/7f5f0d7b86d144e85a59e0f1c57ab27d9214a54e/ts/plugin.ts#L6) you get passed into your plugin entry function.

As an example, we'll expose a remote call to be used by other applications or integration recipes. There will be guides how to use other functionality exposed by Storex Hub.

## Exposing a remote call

As a simple example, we'll a remote call that you can pass in a name, and returns `Hello <name>!` back. In a real app, this could be retrieving something from Twitter, sending an e-mail, storing something on IPFS, etc. You can see that in `application.ts`, in the `getCallbacks()` method, we already have some callbacks:

```js
return {
  handleEvent: async ({ event }) => {
    if (event.type === "storage-change" && event.app === "memex") {
      this.handleMemexStorageChange(event.info);
    } else if (
      event.type === "app-availability-changed" &&
      event.app === "memex"
    ) {
      this.logger(
        "Changed Memex availability:",
        event.availability ? "up" : "down"
      );
      if (event.availability) {
        this.tryToSubscribeToMemex();
      }
    }
  },
};
```

Change that to this:

```js
return {
  handleRemoteCall: async ({ call, args }) => {
    if (call === "sayHello") {
      return { status: "success", result: `Hello ${args.name}!` };
    } else {
      return { status: "call-not-found" };
    }
  },
};
```

Start your app by executing this in the plugin boilerplate:

```
$ yarn start
```

Now, there's two ways of consuming your call. The first is through the CLI, which you can access by running this in the Storex Hub repository you cloned before. We're using the `com.example.guide` identifier here, but be sure to use the one you configured earlier in this guide:

```
$ yarn cli calls:execute com.example.guide sayHello '{"name": "Vincenzo"}'
```

Other apps can also consume calls through the API:

```js
const callResult = await pocket.executeRemoteCall({
  app: "com.example.guide",
  call: "sayHello",
  args: {
    name: "Vincenzo",
  },
});
expect(callResult).toEqual({
  status: "success",
  result: "Hello Vincenzo!",
});
```

You'll notice a pattern here of every call returning a single object with a status of `success`, or an error. Every call, both into Storex Hub and callbacks, implement this pattern

## Bundling and installing the app as a plugin

Now that our app is working, we can bundle it as a plugin to distribute it to users (although we're still working on making it accessible to non-technical users.)

In the boilerplate, run this command, which generates the bundle plugin in the `build/` directory:

```
yarn build:prod
```

Then, you can install the plugin in two ways. The first is through the CLI, again in the Storex Hub repository

```
cd <storex-hub-dir>
yarn cli plugins:install <boilerplate-repo>/build
```

Or, you can put the `build/` directory in the plugins directory you selected in the beginning with `PLUGINS_DIR`, renaming it to `com.example.guide` and install it through the management interface found at:

```
http://localhost:50483/management/
```

## Next steps

Now you know the basics of interacting with Storex Hub, you can dive into specific functionality you need. Unfortunately, we don't have the resources yet to make nice guides for those, but you can refer to the [API integration tests](https://github.com/WorldBrain/storex-hub/tree/master/ts/tests/api) in the meanwhile.
