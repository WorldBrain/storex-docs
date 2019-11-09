# Storage middleware

Whenever you execute a [storage operation](/guides/storage-operations/), you have the chance to do something with that operation before it arrives at the storage backend which uses the underlying storage technology to execute that operation. This is done through middleware, and it's used by the [multi-device sync](/guides/multi-device-sync/) to log all modification operations in order to replicate them to other devices. Other things you might want to do is to debug all operations done by your application. This is what a storage middleware looks like, and how to use it:

```js
import { StorageMiddleware } from "@worldbrain/storex/lib/types/middleware";

export class LoggingMiddleware implements StorageMiddleware {
  //   public log : Array<{ operation : any, result : any }> = [];

  async process({
    operation,
    next
  }: {
    operation: any[],
    next: { process: Function }
  }) {
    const result = await next.process({ operation });
    this.log.append({ operation, result });
    return result;
  }
}

export async function demo() {
  const loggingMiddleware = new LoggingMiddleware();
  storageManager.setMiddleware([loggingMiddleware]);
  await storageManager.collection("user").createObject({ displayName: "Joe" });
  expect(loggingMiddleware.log).toEqual([
    {
      operation: ["createObject", "user", { displayName: "Joe" }],
      result: { object: { id: expect.any(Number), displayName: "Joe" } }
    }
  ]);
}
```

## What's next?

If you're here for the first time, you're now up to speed on the very basics of Storex. As a next step, check out [storage modules](/guides/storage-modules/) which allows your to organize your storage logic into logical blocks with some extra information attached to them that'll help your application to be more flexible, including generating a GraphQL API with very little extra effort.
