# Getting started

Storex Hub is an offline-first Zapier-like API platform. With it you can connect any app in custom workflows, by building Wordpress-like plugins.
You can also work with Memex data more efficiently.

# What's your use case?

1. [I want to run Storex Hub & use plugins](/storex-hub/getting-started/?id=_1-i-want-to-run-storex-hub-amp-play-around-with-my-memex-data)
2. [I want to import/export Memex data](/storex-hub/getting-started/?id=_2-i-want-to-importexport-memex-data-in-other-apps)
3. [I want to develop my own plugin](/storex-hub/getting-started/?id=_3-i-want-to-develop-my-own-plugin)
4. [I want to access the Storex Hub / Memex API from an external application](/storex-hub/getting-started/?id=_4-i-want-to-access-the-storex-hub-memex-api-from-an-external-application)

---

### 1. I want to run Storex Hub & play around with my Memex data

Currently, we're figuring out how to make Storex Hub easy to install for end-users, but we're not there yet. In the meanwhile, you're going to need some knowledge of the command line and Git, and [have Node.js/NPM installed](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

1.  On the command line, clone the Storex Hub repository: `git clone https://github.com/WorldBrain/storex-hub.git`
1.  Inside the cloned repository, install the dependencies: `npm install`
1.  Run Storex Hub: `DB_PATH='./dev/db' PLUGINS_DIR='./dev/db/plugins npm start'`
1.  Connect Memex to Storex Hub:
    1.  Open the background console of the Memex extension
        - Firefox: about:devtools-toolbox?type=extension&id=info%40worldbrain.io
        - Chrome: chrome://extensions > enable developer mode > Memex > background page > console
    1.  In the background console, tell Memex to connect to Storex Hub: `await bgModules.storexHub.connect({ development: true })`
1.  Access your Memex data through the CLI:
    1. In the cloned repository, execute `yarn cli operations:execute --remote io.worldbrain.memex '["findObjects", "customLists", {}]'`
    1. For more ways to interact with your data, see [Integrating with Memex](/storex-hub/guides/memex/)

### 2. I want to import/export Memex data in other apps

1. [Follow the plugin development guide](/storex-hub/guides/plugin-dev-guide/)
2. [Understand the Memex API endpoints](/storex-hub/guides/memex/)
3. [Bundle & load it as a Storex Hub plugin](storex-hub/guides/plugin-dev-guide/?id=_4-bundling-and-installing-a-plugin)

### 3. I want to develop my own plugin

[Follow the plugin development guide](/storex-hub/guides/plugin-dev-guide/)

### 4. I want to access the Storex Hub / Memex API from an external application

1. [Understand the Memex API endpoints](/storex-hub/guides/memex/)
2. [Understand the Storex Hub API](/storex-hub/api-reference/)
3. [Understand the plugin boilerplate](https://github.com/WorldBrain/storex-hub-boilerplate)
4. [Read into the Plugin Development Guide](/storex-hub/guides/plugin-dev-guide/)
