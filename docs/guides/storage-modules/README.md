# Storage modules

As seen in the [quickstart](/guides/quickstart/), storage modules provide a standard pattern to group your storage logic into logical chunks and provide some extra information about them. Using this kinds of organization, you can do things like automatically [generating GraphQL APIs](/guides/graphql-api/) or scan your program automatically for optimization opertunities such as expensive operations you're executing without having the right indices in place to make them fastter.

Summerized, storage modules provide:

- a standard place to put your [collection definitions](/guides/storage-registry/) and organize their previous versions.
- a standard place to expose which [storage operations](/guides/storage-operations/) you're using inside your higher-level methods, so they can be introspected by other tools.
- a standard way to expose higher-level methods that operate on your your data (like fetching suggesting, inserting something into a list, etc.), and exposing meta-data about those methods. This way, the rest of your application only interacts with these methods, without caring about the fact you're using Storex underneath, nor implementation details like whether you're using REST or GraphQL to move data around.
- a standard place to expose operation-level access rules, which can be enforced in different ways, like compiling them to Firestore security rules, or enforcing them manually server-side.

## Basic usage

The `@worldbrain/storex-pattern-modules` package provides the `StorageModule` abstract base class, which requires you to implement the `getConfig()` method on which you use to expose info about your storage modules. Aside from that, this base class does nothing more than provide you with an internal convenience method to execute operations (more about that later.)

```js
import {
  StorageModule,
  StorageModuleConfig,
  registerModuleMapCollections
} from "@worldbrain/storex-pattern-modules";

class TodoListStorage extends StorageModule {
  getConfig(): StorageModuleConfig {
    return {
      // What you'd pass to StorageRegistry.registerCollections(), but with a bit more info
      collections: {
          todoList:  { ... }
      },

      // Templates of operations passed to StorageManager.operation()
      operations: {
          createList: { ... },
      },

      // Info about exposed methods, which you can use to generate REST/GraphQL endpoints for example
      methods: {
          createTodoList: { ... },
      },

      // Access and valdation rules determining who can execute what operations on what data
      accessRules: { ... }
    };
  }

  async createTodoList(list: { name: string }) {
      return (await this.operation('createList', list)).object
  }
}
```

## Defining collections

As seen above, you return your collection definitions in the `StorageModuleConfig.collections` property which you return in your `getConfig()` implementation. The only difference is that in the collections you return, instead of including previous versions of your collections in the same place, you may choose to include them in the `history` property of your collection definitions. This way, you have programmatic access to how your data schema evolved over time (so you can generate [schema migrations](/guides/schema-migrations/)), while keeping your current code readable and clean with only the current version of your data schema in your sight.

```js
import {
  StorageModule,
  StorageModuleConfig,
  registerModuleMapCollections
} from "@worldbrain/storex-pattern-modules";

class TodoListStorage extends StorageModule {
  getConfig(): StorageModuleConfig {
    return {
      collections: {
        todoList: {
          history: [
            // this would normally live in a separate file
            {
              version: new Date("2019-10-10"),
              fields: {
                title: { type: "text" }
              }
            }
          ],
          version: new Date("2019-10-11"),
          fields: {
            title: { type: "text" },
            category: { type: "string" }
          }
        }
      }
    };
  }
}
```

Additionally, the `@worldbrain/storex-pattern-modules` package provides a `withHistory()` helper function, that you can use to separate your entire schema history in a more convenient way. See [this](https://github.com/WorldBrain/storex-frontend-boilerplate/blob/2bf0ca5ecdcfdae3abbe2e2ded619a6f4f109a30/src/storage/modules/todo-list.ts) and [this](https://github.com/WorldBrain/storex-frontend-boilerplate/blob/2bf0ca5ecdcfdae3abbe2e2ded619a6f4f109a30/src/storage/modules/todo-list.history.ts) file of the [Storex front-end boilerplate](https://github.com/WorldBrain/storex-frontend-boilerplate) for example usage.

Collection versioning works by versioning your collection with the schema version of you application. When you have two collection with version `2019-10-10`, and you add a third one with version `2019-10-20`, you'll have two application schema versions: 1) `2019-10-10` containing two collections, and 2) `2019-10-20` containing three collections. But when want to package storage modules for inclusion in other applcations, the collections in that package will have their independent versioning. For this, there's the `mapCollectionVersions()` helper function, which can map module collection versions to versions of the application that uses them. See [here](https://github.com/WorldBrain/Memex/blob/dd66472feb73af86e2952d343937988f9b25771a/src/sync/background/storage.ts) for an example of Memex using this function to integrate [multi-device sync](/guides/multi-device-sync/).

## Executing operations

Storage modules allow you to specify which operations your storage methods are using in a discoverable way. This allows you for example to write an automatic tool that scans your entire program for inefficient access patterns, or diagrams about where you're interacting with your data in which ways.

```js
import {
  StorageModule,
  StorageModuleConfig,
  registerModuleMapCollections
} from "@worldbrain/storex-pattern-modules";

class TodoListStorage extends StorageModule {
  getConfig(): StorageModuleConfig {
    return {
      collections: {
        todoList: {
          version: new Date("2019-10-11"),
          fields: {
            title: { type: "text" }
          }
        }
      },
      operations: {
        findListById: {
          operation: "findObject",
          collection: "todoList",

          // The rest of the arguments passed to the StorageManager.operation()
          // String starting with $ represent placeholders filled in when
          // executing the operation.
          args: [{ id: "$id" }]
        },
        createList: {
          // Since createObject always takes the same, predictable `args`,
          // they are filled in automatically
          operation: "createObject",
          collection: "todoList"
        }
      }
    };
  }

  async getList(id: string | number) {
    // The second argument to `this.operation()` are the substitutions
    // that'll be used to fill in the placeholder defined above in `args`
    return this.operation("findListById", { id });
  }

  async createList(list: { title: string }) {
    return this.operation("createList", list);
  }
}
```

One other advantage of this thin abstraction is that you can specify how the operations are executed for each storage module. [This](https://github.com/WorldBrain/storex-pattern-modules/blob/877909b37c81e59b7743b0ee3c3160dfa5fe69dd/ts/index.ts#L83) is the implementation of the default `operationExecutor`, but you can pass in a custom one in [the constructor](https://github.com/WorldBrain/storex-pattern-modules/blob/877909b37c81e59b7743b0ee3c3160dfa5fe69dd/ts/index.ts#L23) of a storage module. One application of this would be to detect slow operation executions and logging them, knowing which storage module executed it and what the operation name was. Also, there is an experimental [module spy](https://github.com/WorldBrain/storex-pattern-modules/blob/877909b37c81e59b7743b0ee3c3160dfa5fe69dd/ts/spy.test.ts) that allows the `storageExecutor` to detect from which method the operation was executed. (NOTE: the module spy class is not stable yet, so feel free to contribute to it for that to happen.)

## Storage module methods

## Access rules
