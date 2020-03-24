# Storex Hub API reference

For now, we don't have the resources to develop well-polished documentation. This, combined with the fact that we're still fleshing out the APIs, means that the best compromise for now is to have up-to-date API tests and examples that accurately show how to use Storex Hub. If you didn't read the [quickstart](/guides/storex-hub/quickstart) yet, that's the best place to start. After that, these are some useful resources:

- The Socket.io wrapper gives you back the Storex API, handling all the websocket stuff under the hood. That API is the `StorexHubApi_v0` type defined [here](https://github.com/WorldBrain/storex-hub/blob/master/ts/public-api/server.ts).
- The callacks you can register are defined as the `StorexHubCallbacks_v0` type [here](https://github.com/WorldBrain/storex-hub/blob/master/ts/public-api/client.ts).
- There's also a REST-like API expose, where each method is assigned a URL, takes its argument as a JSON object in a POST body, and returns the result as a JSON object. The URL for each method can be found as the `STOREX_HUB_API_v0` constant [here](https://github.com/WorldBrain/storex-hub/blob/master/ts/public-api/server.ts).
- All demos maintained as part of Storex Hub are [here](https://github.com/WorldBrain/storex-hub/tree/master/demos)
