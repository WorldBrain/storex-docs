# Storage operations

If you've read the [quickstart guide](/guides/quickstart/), you've seen that data is queried and manipulated with operations, either directly though the `StorageManager.operation()` method, or through [storage modules](/guides/storage-modules/). There is a set of standard operations that is universal enough to work across every kind storage backend (CRUD and batch operations), but every storage technology has its own characteristics and capabilities. The goal of Storex is not to make these storage technologies invisible, but rather provide a common toolchain that gives you easy ways to do the boring stuff, and ways of cleanly interacting with and inspecting the underlying storage technology.

## Standard operations

Whatever storage backend you'll be working with, you'll be creating, updating, deleting and querying data. Respectively, these are the `createObject`, `updateObjects`, `deleteObjects` and `findObjects` operations. You'll find examples of how to use these in the [quickstart guide](/guides/quickstart/). What isn't shown there however, is how the filters used by the update, delete and find operations work. These filters are inspired by MongoDB filters, with the following supported operators:

```js
// builds on quickstart setup

export async function demo() {
  const storage = await createStorage({ backend: "in-memory" });
  await storage.manager.operation("findObjects", "user", { age: 30 });
  await storage.manager.operation("findObjects", "user", { age: { $gt: 30 } });
  await storage.manager.operation("findObjects", "user", { age: { $ge: 30 } });
  await storage.manager.operation("findObjects", "user", { age: { $lt: 30 } });
  await storage.manager.operation("findObjects", "user", { age: { $le: 30 } });
}
```

## Feature detection

Not all storage technologies have the same features, and if you want your code to work on multiple storage technologies, or assert the features of a new storage technology if you're switching, you'll have to be able to detect in your code whether the storage technology you're using supports certain standardized features. This is done by using the `StorageBackend.supports(feature: string): boolean` method:

```js
export async function demo() {
  const storage = await createStorage({ backend: "in-memory" });
  expect(storage.manager.backend.supports("executeBatch")).toEqual(true);
}
```

Since the beginning of Storex until now, the number of features a storage backend support has been growing. Therefore, this API will be changed in the future to allow for more fine-grained feature detection in a cleaner way, before documenting more detectable features.

### Feature: `executeBatch` operation

Since you'll want certain operations to happen atomically, `executeBatch` allows you to execute `createObject`, `updateObjects` and `deleteObjects` operations together as an alternative to transaction, which are not as easy to implement in a consistent way across different technologies. As of now, this operation is supported for IndexedDB through the Dexie backend, MySQL, PostgreSQL and SQLite through the TypeORM backend, and Firestore.

```js
export async function demo() {
  const storage = await createStorage({ backend: "in-memory" });
  expect(storage.manager.backend.supports("executeBatch")).toEqual(true);
  await storage.manager.operation("executeBatch", [
      {
          operation: 'createObject',
          collection: 'todoList',
          placeholder: 'myList'
          object: {
              title: 'my todo list'
          }
      },
      {
          operation: 'createObject',
          collection: 'todoListEntry',
          object: {
              title: 'write document'
          },

          // Here we insert the ID of the created list
          // into the `list` property of the create list entry
          replace: [{
              path: 'list',
              placeholder: 'myList',
          }]
      },
  ])
}

```

## Custom operations

As you're developing a real-world application, there will come a time the standard operations don't cut it. Therefore, Storex allows you to register custom operations on a storage backend, so that you can directly use the underlying storage technology, while still having that operation run through Storex, so you can do things with them in [storage middleware](/guides/storage-middleware/) (like logging or timing the operations you're executing) and use them in [storage modules](/guides/storage-modules/).

```js
export async function demo() {
  const storage = await createStorage({ backend: "in-memory" });
  storage.manager.backend.registerOperation("my-app:fetchSuggestions", async (options: {
      collection: string,
      field: string,
      prefix: string
  }) => {
      const dexieInstance = (storage.manager.backend as DexieStorageBackend).dexieInstance
      const table = dexieInstance.table(options.collection)
      return table.where(options.field).startsWith(options.prefix).toArray()
  })
  const objects = await storageManager.operation("my-app:fetchSuggestions", {
      collection: 'todoList',
      field: 'title',
      prefix: 'te'
  })
}
```

In order to prevent operation naming conflicts, operations have a standard format. If you're registering an operation that is part of your application or a package not part of the storage backend, you must use the `:` character to namespace your operation, e.g. `todo-list:fetchOverview` or `suggestion-package:fetchSuggestions`. Aside from that, storage backends may ship with custom, storage backend specific operations, using the `.` character to namespace the operations, like (a hypothethical example) `dexie.bulkPut`.

## What's next?

If you're checking out Storex for the first time, check out the [storage middleware guide](/guides/storage-middleware/) which will complete your grasp of the most fundamental principles of Storex, before moving on to higher-level concepts such as [storage modules](/guides/storage-modules/) or [schema migrations](/guides/schema-migrations/).
