# Multi device sync

Sometimes you want to keep data client-side, but still want to synchronize data between multiple user device to provide a seamless user experience. The [storex-sync package](https://github.com/WorldBrain/storex-sync/) provides this functionality in a unique, modular and surprisingly easy to understand way. That being said, synchronizing data is a really hard problem, and the default synchronization algorithm might not be for you. As such, you're encouraged to dive and fully understand the source code of this package before integrating it into your own application. For this, you'll need to understand the contents in the [quickstart](/guides/quickstart/), [storage registry](/guides/storage-registry/), [storage operations](/guides/storage-operations/), [storage middleware](/guides/storage-middleware/) and [storage modules](/guides/storage-modules/) guides.

**IMPORTANT:** This functionality is still being developed and the most recent versions are not released yet. Therefore, we'll only explain how it works here and update the documentation as the codebase stabilizes enough (battle-testing it in [Memex](https://worldbrain.io/)) to be properly released.

## What's included?

The Sync functionality was designed with the following requirements in mind:

- It should be database-agnostic. We shouldn't have to switch databases just to have sync functionality. At WorldBrain, we ran our entire application on IndexedDB in a browser extension when we decided to also create a mobile app using SQLite. This should just work, without any major rewrites.
- It should work for exisiting datasets. Since sync is a feature one might add later on in the product (which was the case for Memex), we should have a way to introduce this feature without restructuring the entire data model.
- In the future, **not implemented yet**, it should be generalizable enough to also work for offline-first cloud application. That is, all changes are made locally first, then sent to the cloud if/when there's an internet connection. Wouldn't it be great if all your productivity apps just worked quickly and reliably, whether you're online, offline or have a spotty internet connection?

## How it works

At the highest level, there are two ways of synchronizing databases using `storex-sync`. The first is by logging every change made to the database, sending them to a space shared between multiple devices and processing them on other devices using a reconciliation algorithm, which we call the continuous sync. The second one is to pump all data from one device to another, which we call the initial sync. At WorldBrain, we use the initial sync for users that have an existing data set, after which we switch to the continuous sync.

### Initial sync

The initial sync is simple and brute-force. You first open a channel between two devices, after which the entire database contents are sent from once device to the other, effectively merging the database contents of the first device into the other one (which optionally can be done both ways.) It's set up in such a way, that you can implement the data channel in any way you want. At WorldBrain, we use WebRTC for direct communication between the two devices, with Firebase to negotiate how this connection will be set up. But if you want, you could also let the devices communicate over a WebSocket connection through a proxy.

### Continuous sync

When you set up Storex, you:

- create client sync log, where all the changes to the client database will be written.
- install a [storage middleware](/guides/storage-middleware/) that intercept your operations and both executes and logs them in one automical operation

There's one problem here though. If we just send object around which have sequentially incrementing primary keys, data will end up being overwritten. To prevent this, you can either make sure your data doesn't have these kinds of primary keys (choosing other fields for your primary keys), or generate globally unique UUIDs for objects with automatically generated primary keys. This can be done using the `CustomAutoPkMiddleware` and for example the [uuid/v4](https://www.npmjs.com/package/uuid) package.

After this, you establish a connection with a `SharedSyncLog`, a place where all devices send the changes they made locally and retrieve changes made on other devices. A device sync consists of sending and receiving changes to and from this log and integrating the newly received changes on the device. When and how often you do this, is up to the needs of your application. You could sync on startup and every 10 minutes, or whenever a change is made locally and/or in the `SharedSyncLog` to create a live sync.

## How you can use it

Since this functionality is being finalized while deployed in a real product, documentation will be writtten once the API is fully stabilized. That being said, the code is written to be easy to understand, so you shouldn't have any trouble starting to read through the integration tests which show in detail how you'd use sync. These are the [tests for the initial sync](https://github.com/WorldBrain/storex-sync/blob/develop/ts/fast-sync/index.test.ts), and these are the [tests for the continuous sync](https://github.com/WorldBrain/storex-sync/blob/develop/ts/index.test.ts). Also, there are [convenience classes](https://github.com/WorldBrain/storex-sync/tree/develop/ts/integration) to integrate these in your application the initial sync and the continuous sync.
