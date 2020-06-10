# Storex Hub Status & Roadmap

The vision of Storex Hub is a software ecosystem where users have full data ownership, experience no vendor lock-ins and can adapt knowledge tools to their ever changing workflow needs.
For example by providing plugins that import/export data in custom data formats, use novel transport & storage protocols (like IPFS) or connect applications with each other, like with Zapier, or build many different apps that work with the same core data.

For this to happen, a lot needs to be done, and we're still figuring out in which order to do these things.
As a first step we want to provide the ability for developers to work with their Memex data.
This way we can focus on getting the basics right, without having to invest significantly into making this easy to use for non-developers, maening more work into security, app distribution, UX, etc.

## Status

Currently Storex Hub has 3 functionalities:

1. Register a new remote application (with no persistent storage)
2. Listen to Memex data changes
3. Query Memex database
4. Write to Memex database

This enables use cases like:

- Post all urls tagged with a specific tag as a Gist [See demo](https://twitter.com/worldbrain/status/1235279061624250369?s=20)
- Import/export data between other services (& Memex), like Hypothes.is.

## Potential Roadmap Projects

#### Making Storex Hub ready for an ecosystem of early developers

- DONE: Allow different apps to expose their storage to other apps.
- DONE: Allow apps to signal changes to their storage to other apps.
- DONE: Plugin packaging and installation mechanism

#### Separation of data from apps

- DONE: Storing data inside of Storex Hub to separate data from apps
- Schema migrations to standardize how data changes as its (explicit or implicit) schema evolves using [storex-schema-migrations](/guides/schema-migrations/)
- Backward compatibility for apps written to interact with old data models of other apps
- Media storage

#### Inter-app connectivity

- Discovery of data apps Storex Hub different apps can work with (give me everyhing that's tagged, give me all contacts, etc. )
- Inter-app data relations (where any apps can attach different information to a stored web page for example)
- Adapt schema migrations to account for inter-app data relations

#### Wider interoperability

- Adaptable import/export mechanism to map internal data structures to and from other data formats (web annotations, csv, etc.)
- Standard mechanisms to work with external APIs and datastores, both centralized (cloud databases) and non-centralized (IPFS, Ethereum, etc.)

#### Multi-device usage

- Real-time communication between multiple devices
- Message bus for asynchronous communication between multiple devices
- Media storage for usage across devices

#### Multi-user usage

- Aggregated identities that allow us to construct a local representation of identities of other users across a variety of protocols and platforms (e-mail, DID, Twitter, etc.)
- Sync-based collaboration protocol for use in small, trusted environments with relatively small data sets
- File-sharing for trusted environments
- Federated collaboration protocol for use in untrusted environments with bigger data sets
- File-sharing for untrusted, larger environments
- Real-time messaging between users

#### Distribution to non-developers

- DONE: Easy, cross-platform installation method for Storex Hub
- App distribution and runtime security model
- User-centered data security model explaining in plain terms what different apps might do to your data
- Unified GUI to manage settings and permissions of different apps (DONE: settings)

#### Notifications

- A user-centered notification system allowing people to interact with notification in a non-intrusive way
- A mobile client to receive user-centered notifications

#### Convenience for users

- Automated backups
- Data history
- Multi-device sync with multiple providers

## Interested in collaborating?

There's many ways to help the development of Storex Hub. [Here](/storex-hub/contact/) you can discover what you could do and how to get in touch with us.
