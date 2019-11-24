# GraphQL API

Using Storex, you can create a clean interface between your storage logic and the rest of your application, such as your business logic and UI code. As a consequence of this, you can start developing your application entirely client-side and move your entire storage logic server-side when you need it. This was a clear design goal from the beginning for Storex, as in the early stages of a product you should be concentrating on prototyping functionality, not on choosing and managing implementation details like what kind of database your application uses or the layout of your REST/GraphQL API before you even know what your product is about!

## Set up

Remember [storage module method descriptions](/guides/storage-modules/?id=storage-module-methods)? If you don't, do that now. Using those descriptions, Storex has a package that can automatically generate a GraphQL API for you, and a client that mimicks the orginal interface of your storage modules, but uses GraphQL under the hood to communicate with the back-end under the hood. This way, a lot of your application code can stay under the hood. Let's say we're using the `UserAdminModule` described in the guide above. Setting up the GraphQL API using [Apollo Server](https://www.apollographql.com/docs/apollo-server/) might look like this:

```js
import * as graphql from "graphql";
import { ApolloServer } from "apollo-server";
import { createStorexGraphQLSchema } from "@worldbrain/storex-graphql-schema/lib/modules";

import StorageManager from "@worldbrain/storex";
import { DexieStorageBackend } from "@worldbrain/storex-backend-dexie";
import inMemory from "@worldbrain/storex-backend-dexie/lib/in-memory";
import {
  StorageModule,
  registerModuleMapCollections
} from "@worldbrain/storex-pattern-modules/lib";

export function createServer(storageModules: {}): {
  start: () => Promise<void>
} {
  return {
    start: async () => {
      const schema = createStorexGraphQLSchema(application.storage.modules, {
        storageManager: application.storage.manager,
        autoPkType: "int",
        graphql
      });
      const server = new ApolloServer({ schema });
      const { url } = await server.listen();
      console.log("Server is running on ", url);
    }
  };
}

export async function main() {
  const backend = new DexieStorageBackend({
    dbName: "my-app",
    idbImplementation: inMemory()
  });
  const manager = new StorageManager({ backend });
  const storage = {
    manager,
    modules: {
      userAdmin: new UserAdminModule({
        storageManager: manager,
        autoPkType: "int"
      })
    }
  };
  registerModuleMapCollections(storage.manager.registry, storage.modules);
  await storage.manager.finishInitialization();

  await storage.manager.backend.migrate();
  const server = createServer(application);
  await server.start();
}
```

Now, you can access and use the GraphQL API as you normally would, including through the GraphQL playground. But, most GraphQL tutorials recommend you to directly embed the code interacting with GraphQL directly in your UI (React) code, meaning that your UI code would be tangled up with the code responsible for talking with your back-end, which it shouldn't. Instead, use the GraphQL client provided by Storex which lets you code as if Storex and GraphQL didn't even exist:

```js
export async function setup() {
  // We're not actually storing any data on the client-side
  const manager = new StorageManager({ backend: null });
  const storage = {
    manager,
    modules: {
      userAdmin: new UserAdminModule({
        storageManager: manager,
        autoPkType: "int"
      })
    }
  };
  registerModuleMapCollections(storage.manager.registry, storage.modules);
  await storage.manager.finishInitialization();

  const graphQLClient = new StorexGraphQLClient({
    endpoint: options.graphQLEndpoint,
    modules: {
      userAdmin
    },
    storageRegistry
  });
  return {
    sharedSyncLog: graphQLClient.getModule("userAdmin") as UserAdminModule
  };
}

export async function main() {
  // This would be your main application code, which'd normally some layers on
  // top of this before being used in your UI code.
  // Notice nothing inherently Storex or GraphQL here.
  const modules = await setup();
  const user = await modules.userAdmin.byName({ name: "Joe" });
  await modules.userAdmin.setAgeByName({ name: "Joe", age: 30 });
}
```

## State of this functionality

By design, the initial GraphQL functionality doesn't provide the typical GraphQL API where clients can query and manipulate the data in any way they want. This is because you normally want to be able to predict the queries you need to optimize, and you don't want your clients to be tightly coupled to the internals of your database structure. As a matter of fact, some more work needs to be done on the GraphQL API to allow for even further decoupling between how you want your data to be accessed and manipulated, and your internal database structure. However, it would be fairly trivial to implement the Storex equivalent of [Prisma](https://www.prisma.io/), allow your clients to flexibly query/manipulate the database in terms of Storex operations.

Since there were some weird Node.js dependency problems with Apollo, it hasn't been possible to get integration tests with real-world functionality based on the GraphQL functionality to run, like the [multi-device sync](/guide/multi-device-sync/) integration tests which run on different architectures. As such, weird bugs might be present.

Also, no authentication is implemented yet. This could be provided by creating a [storage middleware](/guides/storage-middleware/) enforcing Storex [access rules](/guides/storage-modules/?id=access-rules), or by creating higher-level access rules that work on a method, not operation level.

## What's next?

Congratulations, you've gone through all the basics that make Storex what it is! If you're creating client-side applications like productivity and knowledge management applications that don't require a full-fledged back-end, but need to work across multiple devices by the same user, check out the [multi-device sync guide](/guide/multi-device-sync/). If not, you're all set with the basics you need to start producing some cool stuff :)
