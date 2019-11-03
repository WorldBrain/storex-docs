# Storage registry

Data models are deined in Storex through the storage registry, which is automatically constructed for you when you create a storage manager:

```js
import StorageManager from "@worldbrain/storex";
import { DexieStorageBackend } from "@worldbrain-storex-backend-dexie";
import inMemory from "@worldbrain-storex-backend-dexie/lib/in-memory";

export function createStorageManager(): StorageManager {
  const backend = new DexieStorageBackend({
    dbName: "test",
    idbImplementation: inMemory()
  });
  return new StorageManager({ backend });
}

export async function main() {
  const storageManager = createStorageManager();
  storageManager.registry.registerCollections({
    note: {
      version: new Date("2019-11-02"),
      fields: {
        // Fields are required by default, and must be null (not undefined) when not provided.
        title: { type: "text", optional: true }
        body: { type: "text" }
      }
    }
  });
  await storageManager.finishInitialization();
}
```

## Versioning

Since your data models are going to change as your product evolves, every registered collection has a version, and you can register multiple versions of the same model. These versions are application-wide version, described as a `Date` object. As a result, you have access to the version history of all the collections in your applications through either `StorageRegistry.getSchemaHistory()` or `StorageRegistry.getCollectionsByVersion(version: Date)`:

```js
export async function main() {
  const storageManager = createStorageManager();
  storageManager.registry.registerCollections({
    user: {
      version: new Date("2019-11-03"),
      fields: {
        displayName: { type: "text" }
      }
    },
    note: [
      {
        version: new Date("2019-11-02"),
        fields: {
          body: { type: "text" }
        }
      },
      {
        version: new Date("2019-11-03"),
        fields: {
          title: { type: "text" },
          body: { type: "text" }
        }
      }
    ]
  });
  await storageManager.finishInitialization();

  expect(storageManager.registry.getSchemaHistory()).toEqual([
    {
      version: new Date("2019-11-02"),
      collections: {
        note: expect.any(Object) // first version of note
      }
    },
    {
      version: new Date("2019-11-03"),
      collections: {
        user: expect.any(Object), // first version of user
        note: expect.any(Object) // second version of note
      }
    }
  ]);
  expect(
    storageManager.registry.getCollectionsByVersion(new Date("2019-11-03"))
  ).toEqual({
    user: expect.any(Object),
    note: expect.any(Object)
  });
}
```

This information can be used for different purposes. For example the [schema migrations][/guides/schema-migrations/] package can use this info to determine which collections/fields you've removed and generate a migration plan which you can execute in various ways (synchronously, through a Lamda function performing live migrations, etc.)

## Field types

Currently supported field types are `string`, `text`, `json`, `datetime`, `timestamp`, `boolean`, `float`, `int`, `blob` and `binary`.

**`string` and `text` fields** both bold strings, but the `text` field is meant for fields that are meant to be full-text searched. If you place an index on a `text` field, whatever form of full-text support your using will create a full-text index. The Dexie (IndexedDB) back-end has built-in support for this, which is the fastest and most scalable way to provide client-side full-text search using only Web technologies at this moment. Different methods, like SQLite full-text search plugins, ElasticSearch and AWS CloudSearch, are not developed yet, but planned for.

**`json` fields** hold JSON-serializable objects, which will be stored by the back-end in the fastest, and most queryable way possible depending on the storage backend you're using (PostgreSQL has a native JSON field for example, while MongoDB can store and query any JSON-serializable object). Serialization and deserialization happens automatically on store/retrieval if needed.

**`datetime` and `timestamp` fields** both store date-times on which in the future (not yet) you'll be able to perform date-specific operations (like filtering by month.) Although functionally the same, the `timestamp` field type exposes datetimes as milisecond-based floating-point number (Javascript `number` type), while `datetime` works with Javascript `Date` object. These types will probably be unified in the future, but for now you can choose based on your preference.

**`blob` and `binary` fields** both store binary data, but the `blob` type works with Javascript `Blob` objects (thus storing also the mimetype), while the `binary` field works with `ArrayBuffer` objects in browsers and `Buffer` objects in Node.js.

<!--

Change in future:
- full-text methods
- time related operations
- datetime and timestamp unifications

-->

## Indices and primary keys

You can set indices of single fields and combining multiple fields when registering a collection. As always, you should be careful to use the right indices when constructing your data model with the right trade-off between read speed, write speed and space consuption for your application. This will vary a lot depending on what you're trying to build, so it's your job to know your data model and storage technology underlying the storage backend you're using.

```js
export async function main() {
  const storageManager = createStorageManager();
  storageManager.registry.registerCollections({
    note: {
      version: new Date("2019-11-02"),
      fields: {
        createdWhen: { type: "timestamp" },
        title: { type: "text" },
        slug: { type: "string" },
        body: { type: "text" }
      },
      indices: [
        { field: "slug" }, // single-field index
        { field: ["createdWhen", "slug"] } // multi-field index
      ]
    }
  });
  await storageManager.finishInitialization();
}
```

TODO: primary keys

## Relationships
