# Storex Hub roadmap

The ultimate vision of Storex Hub is that users have access to an easy-to-use ecosystem of connected, privacy-focused apps that allow them to work with their data in multiple ways according to their changing needs. The apps themselves should be easy to develop, allowing developers to focus on providing value to their users, instead of starting from scratch every time.

For this to happen, a lot needs to be done, and we're figuring out in which order to do these things. The current idea is to focus on developers, which will be the first users of Storex Hub, so we can focus on getting the basics right, without having to invest significantly into making this easy to use for non-developers, maening more work into security, app distribution, UX, etc.

## Sub-projects

Making Storex Hub ready for an ecosystem of early developers:

- DONE: Allow different apps to expose their storage to other appss
- DONE: Allow apps to signal changes to their storage to other appss
- A developer-oriented app installation mechanism

Separation of data from appss:

- Storing data inside of Storex Hub to separate data from apps
- Schema migrations to standardize how data changes as its (explicit or implicit) schema evolves using [storex-schema-migrations](/guides/schema-migrations/)
- Backward compatibility for apps written to interact with old data models of other apps

Inter-app connectivity:

- Discovery of data apps Storex Hub different appss can work with (give me everyhing that's tagged, give me all contacts, etc. )
- Inter-app data relations (where any apps can attach different information to a stored web page for example)
- Adapt schema migrations to account for inter-app data relations

Wider interoperability:

- Adaptable import/export mechanism to map internal data structures to and from other data formats (web annotations, csv, etc.)
- Standard mechanisms to work with external APIs and datastores, both centralized (cloud databases) and non-centralized (IPFS, Ethereum, etc.)

Multi-user usage:

- Aggregated identities that allow us to construct a local representation of identities of other users across a variety of protocols and platforms (e-mail, DID, Twitter, etc.)
- Sync-based collaboration protocol for use in small, trusted environments with relatively small data sets
- Federated collaboration protocol for use in untrusted environments with bigger data sets

Distribution to non-developers:

- Easy, cross-platform installation method for Storex Hub
- App distribution and runtime security model
- User-centered data security model explaining in plain terms what different apps might do to your data
- Unified GUI to manage settings and permissions of different apps

Convenience for users:

- Automated backups
- Data history
- Multi-device sync with multiple providers
