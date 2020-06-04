# Getting started with Storex Hub

Storex Hub is a Node.js server meant to run on the device(s) of its users, providing a REST/Socket.io API for other applications to connect to. As such, first we'll download and run Storex Hub, after which we'll write and run separate apps connecting to it.

## Install and run

First, clone the Storex Hub repository, install the dependencies with `npm install`, then run this (on Linux or Mac):

```
DB_PATH=./db.sqlite3 yarn start
```

This will run Storex Hub and store all its data in the database file you specified. If you'd rather experiment without any data being persisted, you can omit the DB_PATH and it'll run entirely from memory.

## Connecting an app

Storex Hub mediates between different apps which expose their data and allow you to interact with it. We differentiate between normal apps and remote apps, with remote apps running in a different process, storing their data themselves instead of letting Storex Hub take care of its storage. This allows you to store the data wherever you want and allow access to it by other apps however you want.

Since only remote apps are supported for now, we'll start by creating one of those. Storex Hub is designed so you can connect to it in different ways, but for now only REST and Socket.io are supported. In Typescript/Javascript, there are convenience classes that wrap the Storex Hub API, while not tying you down to a specific protocol, so either:

1. In the Storex Hub repo you just cloned, just copy the `/demos/gist-sharer` directory to something like `/demo/getting-started`, modify the in `main.ts` and run it with `yarn ts-node demos/getting-started/main.ts`.
2. Set up your own Node.js project and install the `@worldbrain/storex-hub` and `socket.io-client` dependencies. The `@worldbrain/storex-hub` package contains both the entire Storex Hub application (which we won't at the start) and the client, which gives you a convenient wrapper around the API and will in the future be available as a separate package.

Now, it's time to connect to Storex Hub and register our new app:

```js
import io from "socket.io-client";
import { StorexHubApi_v0 } from "@worldbrain/storex-hub/lib/public-api";
import { createStorexHubSocketClient } from "@worldbrain/storex-hub/lib/client";

const APP_NAME = "getting-started";

interface Application {
  // All the stuff making up our application, to be filled out later
}

async function setupApplication(): Promise<Application> {
  // We'll fill this in later to set up our own database
  return {};
}

async function setupClientCallbacks(
  application: Application
): Promise<StorexHubCallbacks_v0> {
  // We'll fill this in later to allow Storex Hub to interact with our application
  return {};
}

async function setupClient(application: Application) {
  // Storex Hub run on port 50483 in development, and 50482 when
  // started with NODE_ENV=production
  const socket = io(`http://localhost:50483`);
  const client = await createStorexHubSocketClient(io, {
    callbacks: await setupClientCallbacks(application)
  });
  // At this point, the connection is ready to be used
  return client;
}

async function subscribeToEvents(client: StorexHubApi_v0) {
  // We'll fill this in later
}

async function register(client: StorexHubApi_v0) {
  const registrationResult = await client.registerApp({
    name: APP_NAME,
    remote: true, // we're a remote app
    identify: true // not only register, but also identify in one go
  });
  if (!registrationResult.status !== "success") {
    throw new Error(
      `Couldn't register app '${APP_NAME}'": ${registrationResult.errorText}`
    );
  }

  // Save this access token somewhere so you can use it later to identify
  return registrationResult.accessToken;
}

async function identify(client: StorexHubApi_v0, accessToken: string) {
  // This is how you identify on next startup
  const identificationResult = await client.identifyApp({
    name: APP_NAME,
    accessToken
  });
  if (identificationResult.status !== "success") {
    throw new Error(
      `Couldn't identify app '${APP_NAME}': ${identificationResult.status}`
    );
  }
}

async function doStuff(client: StorexHubApi_v0) {
  // We'll show how to execute remote operations here later
}

async function main() {
  const application = await setupApplication();
  const client = await setupClient(application);
  const accessToken = await register(client);
  await subscribeToEvents(client);
  await doStuff(client);
}
```

## Accepting remote operations from other applications

At this point, you can start doing useful things with the `client`. One of them, since we've told Storex Hub we're a remote application, is to accept remote operations. Normally, remote operations are standard [Storex operations](/guides/storage-operations/) like `createObject`, `findObjects`, etc. that you can directly feed into your own Storex storage set up (like an SQLite or Firestore database), but really you could implement whatever operations you see fit. This is an example with an in-memory Dexie database, for which we'll change a few things:

```js
import StorageManager, {
  StorageBackend,
  StorageRegistry
} from "@worldbrain/storex";
import { DexieStorageBackend } from "@worldbrain/storex-backend-dexie";
import inMemory from "@worldbrain/storex-backend-dexie/lib/in-memory";

interface Application {
  storageManager: StorageManager;
}

async function createStorage() {
  const backend = new DexieStorageBackend({
    dbName: APP_NAME,
    idbImplementation: inMemory()
  });

  const storageManager = new StorageManager({ backend });
  storageManager.registry.registerCollections({
    todoItem: {
      version: new Date("2020-03-03"),
      fields: {
        label: { type: "text" },
        done: { type: "boolean" }
      }
    }
  });
  await storageManager.finishInitialization();

  return storageManager;
}

async function setupApplication() {
  return {
    storageManager: await createStorage()
  };
}

async function setupClientCallbacks(
  application: Application
): Promise<StorexHubCallbacks_v0> {
  return {
    handleRemoteOperation: async event => {
      // event.operation will be an operation array, like:
      // ['createObject', 'todoItem', { label: 'Test', done: false }]
      // or
      // ['findObjects', 'todoItem', { done: false }]

      // Normally you'd do some kind of validation or access control here
      return {
        result: await this.dependencies.storageManager.operation(
          event.operation[0],
          ...event.operation.slice(1)
        )
      };
    }
  };
}
```

Now, other applications can query your in-memory database! Normally, you'd plug in a real database here, probably SQLite for local storage. As mentioned, you can handle storage operations however you want, so one might imagine a graph storage app for example that can handle SPARQL queries. Just remember to properly namespace your non-standard operations to prevent confusion, like `my-app:specialQuery`.

## Interacting with other remote applications

Once you have other applications identified with Storex Hub, you can interact with their data:

```js
async function doStuff(client: StorexHubApi_v0) {
  // Get everything from Memex tagged with 'share-example'
  const tagsResponse = await options.client.executeRemoteOperation({
    app: "memex",
    operation: ["findObjects", "tags", { name: "share-example" }]
  });
  if (tagsResponse.status !== "success") {
    throw new Error(`Error while fetching URLs for tag '${SHARE_TAG_NAME}'`);
  }
  const pageUrls = (tagsResponse.result as Array<{ url: string }>).map(
    tag => tag.url
  );
  // do something with pageUrls
}
```

Also, since not every application will be running all the time, you can listen for availibility changes:

```js
async function subscribeToEvents(client: StorexHubApi_v0) {
  await client.subscribeToEvent({
    request: {
      type: "app-availability-changed"
    }
  });
}

async function setupClientCallbacks(
  application: Application
): Promise<StorexHubCallbacks_v0> {
  return {
    handleEvent: async ({ event }) => {
      if (event.type === "storage-change" && event.app === "memex") {
        handleMemexStorageChange(event.info, {
          client: client,
          settings: {
            githubToken
          }
        });
      } else if (
        event.type === "app-availability-changed" &&
        event.app === "memex"
      ) {
        const message =
          "Changed Memex availability: " + (event.availability ? "up" : "down");
      }
    }
  };
}
```

## Listening for storage changes

We can also signal changes to our storage, and listen for changes in the storage of other applications. This is useful for example to share pages tagged with a certain tag from Memex right when a user tags the page.

This is how we can signal changes:

```js
import { StorageOperationEvent } from "@worldbrain/storex-middleware-change-watcher/lib/types";

async function doStuff(client: StorexHubApi_v0) {
  // See https://github.com/WorldBrain/storex-middleware-change-watcher/blob/master/ts/index.test.ts to see what these changes can look like
  await client.emitEvent({
    event: {
      type: "storage-change",
      info: {
        originalOperation: [
          "createObject",
          "todoListItem",
          { label: "Test", done: false }
        ],
        info: {
          changes: [
            {
              type: "create",
              collection: "user",
              pk: 1,
              values: { label: "Test", done: false }
            }
          ]
        }
      }
    }
  });
}

async function setupClientCallbacks(
  application: Application
): Promise<StorexHubCallbacks_v0> {
  let subscriptionCount = 0;
  return {
    handleSubscription: async ({ request }) => {
      // request.collection is which collection to subscribe to

      // You can use this returned ID to handle unsubscriptions
      return { subscriptionId: (++subscriptionCount).toString() };
    },
    handleUnsubscription: async ({ subscriptionId }) => {}
  };
}
```

This is how we can listen for changes:

```js
async function subscribeToEvents(client: StorexHubApi_v0) {
  const subscriptionResult = await client.subscribeToEvent({
    request: {
      type: "storage-change",
      app: "memex",
      collections: ["tags"]
    }
  });
  if (subscriptionResult.status === "success") {
    console.log("Successfuly subscribed to Memex storage changes");
  } else {
    console.log(
      "Could not subscribe to Memex storage changes (yet?):",
      subscriptionResult.status
    );
  }
}

async function setupClientCallbacks(
  application: Application
): Promise<StorexHubCallbacks_v0> {
  return {
    handleEvent: async ({ event }) => {
      if (event.type === "storage-change" && event.app === "memex") {
        // do something with event.info
      }
    }
  };
}
```

## Testing Storex Hub integrations

Remember how we've said earlier that the `@worldbrain/storex-hub` package contains the entire Storex Hub application which you can run from memory? You can use this to easily integration test your applications with Storex Hub. Using Mocha/Jest:

```ts
import { createMultiApiTestSuite } from "@worldbrain/storex-hub/lib/tests/api/index.tests";

// Creates a test suite that tests both in-memory IndexedDB database and
// with an on-disk SQLite database
createMultiApiTestSuite("Integration Memex + Backup", ({ it }) => {
  it("should work", async ({ createSession }) => {
    const memex = await createSession({
      type: "websocket",
      callbacks: {}
    });
    await memex.registerApp({ name: "memex", identify: true });
    // ... do things here

    const backup = await createSession({
      type: "websocket",
      callbacks: {}
    });
    await backup.registerApp({ name: "backup", identify: true });
    // ... do things here
  });
});
```

## Next steps

Check out the [demos](https://github.com/WorldBrain/storex-hub/tree/master/demos) for more full-fledged example combining the steps above. Also, the full Storex Hub and callback APIs have type definitions [here](https://github.com/WorldBrain/storex-hub/tree/master/ts/public-api). Finally, the [API tests](https://github.com/WorldBrain/storex-hub/tree/master/ts/tests/api) are the best way for now to see up-to-date usage examples of Storex Hub. Gradually, as the API becomes more stable, everything will be documented in a nicer way,
