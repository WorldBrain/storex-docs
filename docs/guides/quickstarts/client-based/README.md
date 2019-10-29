# Creating a client-side only application

We're going to start here with a single-user application, like a note taking app, or a knowledge management tool, that you'll be able to distribute as a static website (through S3 for example), a Web Extension or a React Native app. We'll start by using an in-memory database, so we can experiment freely without having to create, modify or delete repeatedly while iterating on our code. After that, we'll start using IndexedDB for the browser, and SQLite on React Native, so your data can be stored both in a web browser, and in a mobile app. Finally, we'll point you to some next steps, like adding multi-device Sync, or transforming your application into an offline-first cloud-based application.

## Installation

Start by creating a project in your favorite framework, such as React, Angular or Vue.js. (Storex only provides storage logic, thus being totally UI-framework agnostic.) After that, install the Storex package we're going to use in this guide.

```bash
npm install storex storex-backend-dexie storex-pattern-modules
```

## Set up

Now somewhere in our application, we'll write some code to set up Storex and describe the data we're going to work with.

```js
// storage.ts

import StorageManager, {
  StorageBackend,
  StorageRegistry
} from "@worldbrain/storex";
import { DexieStorageBackend } from "@worldbrain/storex-backend-dexie";
import inMemory from "@worldbrain/storex-backend-dexie/lib/in-memory";

export async function createStorage(options: {
  backend: "in-memory" | "indexeddb"
}) {
  // The StorageBacken is responsible for interacting with the database
  // In this case, it's IndexedDB using the Dexie.libray, but
  // this could also be Firestore or on a server PostgreSQL or MongoDB
  const backend = new DexieStorageBackend({
    dbName: "todo-app",
    idbImplementation: options.backend === "in-memory" ? inMemory() : undefined
  });

  const storageManager = new StorageManager({ backend });
  storageManager.registry.registerCollections({
    user: {
      version: new Date("2019-10-10"),
      fields: {
        displayName: { type: "string" }
      }
    },
    todoList: {
      version: new Date("2019-10-10"),
      fields: {
        title: { type: "string" }
      },
      relationships: [
        { childOf: "user" } // creates one-to-many relationship
      ]
    },
    todoListEntry: {
      version: new Date("2019-10-10"),
      fields: {
        label: { type: "text" },
        done: { type: "boolean" }
      },
      relationships: [{ childOf: "todoList" }]
    }
  });
  await storageManager.finishInitialization();

  return {
    storage: { mananger: storageManager }
  };
}
```

Here, we

- create a place to storage the data, the `storageBackend`, in this case in-memory using [Dexie.js](https://dexie.org/).
- register our data model and the relationships between them, which can be one-to-many (`childOf`, like a user having many to do lists), one-to-one (`singleChildOf`, like a user having a single user profile), or many-to-many (`connects`, like a subscription connecting many users to many newletters.) More in the [storage registry guide](/guides/storage-registry/).
- finish initialzing the storage, which allows the storage registry to connect all relationships and the `StorageBackend` to establish any connections or set up any internal models it needs in order to work.

Each collection is versioned with a Date, and you can pass an array of collection definitions for each version, which can be used to generate [schema migrations](/guides/schema-migrations/).

## Manipulating data

Now that we've set up the storage, we can execute basic operations on it:

```js
const storage = await createStorage({ backend: "in-memory" });
const { object: user } = await storage.manager.operation(
  "createObject",
  "user",
  { displayName: "Bob" }
);
const { object: list } = await storage.manager.operation(
  "createObject",
  "list",
  { user: user.id, title: "My todo list" }
);
const { object: list } = await storage.manager.operation(
  "updateObject",
  "list",
  { id: list.id }, // filter
  { tille: "Updated title" } // updates
);
await storage.manager.operation("deleteObject", "list", { id: list.id });
```

For the full list of standard storage operations, see [the storage operations guide](/guides/storage-operations/). To see you can implement custom operations, and how the standardization process work, see [the custom storage operations guide](/advanced-usage/custom-storage-operations/).

## Organizing your application into storage modules

The storage manager provides you with an API to interact with your data and inspects its structure. But a common anti-pattern is weaving frameworks, libraries and other implementation details throughout the entire application. Examples of this is using an ORM directly from UI code, or using a REST/GraphQL API directly from UI code. A best practice we encourage though, is to set things up so the rest of your business logic and UI code knows nothing about Storex, so you can swap it out at any time if desired, and you have a clear separation of concerns.

Storex helps you with this by providing the pattern of [storage modules](/guides/storage-modules/), which serve two purposes:

- They provide you with a clear boundry into your storage logic which the rest of your application can use.
- They allow you to organize information about how your storage logic is laid out, so you can do interesting things like automatically generating GraphQL APIs and managing access control to your data.

```js
import {
  StorageModule,
  StorageModuleConfig,
  StorageModuleConstructorArgs,
  registerModuleMapCollections
} from "@worldbrain/storex-pattern-modules";

import {
  StorageModule,
  StorageModuleConfig
} from "@worldbrain/storex-pattern-modules";

export class TodoListStorage extends StorageModule {
  getConfig(): StorageModuleConfig {
    return {
      collections: {
        todoList: {
          version: new Date("2018-03-04"),
          fields: {
            label: { type: "text" },
            default: { type: "boolean" }
          }
        },
        todoItem: {
          version: new Date("2018-03-03"),
          fields: {
            label: { type: "text" },
            done: { type: "boolean" }
          },
          relationships: [
            { alias: "list", reverseAlias: "items", childOf: "todoList" }
          ]
        }
      },
      operations: {
        createList: {
          operation: "createObject",
          collection: "todoList"
        },
        findAllLists: {
          operation: "findObjects",
          collection: "todoList",
          args: {}
        },
        createItem: {
          operation: "createObject",
          collection: "todoItem"
        },
        findListItems: {
          operation: "findObjects",
          collection: "todoItem",
          args: {
            list: "$list:pk"
          }
        },
      }
    });
  }

  async getOrCreateDefaultList(options: {
    defaultLabel: string
  }): Promise<TodoList> {
    const defaultList = await this.getDefaultList();
    if (defaultList) {
      return defaultList;
    }

    const { object: list }: { object: TodoList } = await this.operation(
      "createList",
      { label: options.defaultLabel, default: true }
    );
    const items: TodoItem[] = [
      await this.addListItem({ label: "Cook spam", done: true }, { list }),
      await this.addListItem({ label: "Buy eggs", done: false }, { list })
    ];
    return { ...list, items };
  }

  async getDefaultList(): Promise<TodoList | null> {
    const allLists = await this.operation("findAllLists", {});
    if (!allLists.length) {
      return null;
    }

    const defaultList = allLists.filter((list: TodoList) => list.default)[0];
    const items = await this.operation("findListItems", {
      list: defaultList.id
    });
    return { ...defaultList, items };
  }

   async addListItem(item : { label: string, done: boolean }, options : { list : TodoList }) {
    return (await this.operation('createItem', { ...item, list: options.list.id })).object;
  }
}

export function createStorageModules(storageManager: StorageManager) {
  const todoLists = new TodoListStorage({ storageManager});
  return { todoLists }
}

```

Now, instead of calling `storageManager.registry.registerCollections()` directly in the `createStorage()` function, you can replace that line with:

```js
const modules = createStorageModules(storageManager);
registerModuleMapCollections(storageRegistry, { todoLists });
```

The rest of your business logic and UI only interacts with the methods you've exposed like `todoLists.getDefaultList()`, which doesn't say anything inherently Storex. Also, because you can inject the storage manager in its constructor, it becomes trivial to unit test these modules using different storage set ups, like an in-memory database, an SQL database, etc.

## What about mobile?

At this point, your application stores data locally in the browser. If you want your application to run on mobile, you have to options.

If you don't need any functionality not provided by [Web APIs](https://developer.mozilla.org/en-US/docs/Web/API) (which are quite a lot including storage, WebRTC, notifications, etc.) the easiest and most user-friendly way is to convert your app into a [Progresive Web App](https://developers.google.com/web/progressive-web-apps), allowing your users to install your website as app with only one click. No app stores, no download time, leading to much higher conversion rates.

But, if you do need access to native APIs, you can choose to create a React Native app using the TypeORM storage backend to store user data in SQLite. Currenlty, there aren't any official boilerplates for this, but you can take a look at a real application [here](https://github.com/WorldBrain/Memex-Mobile), with the storage set up located here [here](https://github.com/WorldBrain/Memex-Mobile/blob/c109a27486505c27296d76989ac5951d8a7d2461/app/src/storage/index.ts).

## Next steps

As a reference, you can find a boilerplate demonstating Storex using React in a few different setups [here](https://github.com/WorldBrain/storex-frontend-boilerplate/).

Now, you might want to do a few things, depending on your use cases. Modern application are expected to automatically sync between multiple devices. If you want to remain offline-first and are buidling a single-user application, but do want to sync between multiple devices, check out the [multi-device sync guide](/guides/multi-device-sync/).

If, however, you're making a platform and thus need multiple users to interact with each other, you'll need a back-end. You can either do this with the [Google Cloud Firestore](https://github.com/WorldBrain/storex-backend-firestore) storage backend, or if you need more control, by moving some of your storage code server-side. Guides still need to be written for the first case, but for now, you can follow the [creating a cloud-based application](/guides/quckstarts/cloud-based/) guide for the second case.
