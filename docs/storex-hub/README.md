# Storex Hub

Everyone has different knowledge workflows, uses different apps and communicates differently.
The systems around us tend to lock us in or are inflexible to adapt to our needs.
Often, the features or integrations we want are not on the developers roadmap.

Storex Hub was built to change that.
With it you can connect any combination of apps, and do custom data processing - without a cloud on your local computer. All processed data is also stored locally, so you have permanent access to it to reuse or innovate.

##### Examples on what you can do with this:

- Download all your Pocket and Memex bookmarks, do a content analysis and then publish those about `COVID-19` to Twitter and IPFS
- Automatically add all the pages, notes or calendar entries tagged with `TODO` to your task management tool.
- Search over all your stored data and find all content with the words `climate change`
- Write a backup application that backs up the data of all your applications at once, instead of each application having its own backup solution.
- Write a task management application where you could link tasks to Tweets, people, e-mails, etc.
- Develop a specialized application for managing tags of different types of content stored by different applications, like web pages stored by Memex, Tweets stored by a Twitter integration, articles coming from your RSS reeds, etc. instead of creating such a tag management UI for each application individually.

## Current state

Currently, Storex Hub is a local server that multiple local and cloud applications can connect to from their using either REST/Websocket and 1) query/manipulate the data of other applications, and 2) process requests by other application to query/manipulate their data. This means that one application can store its data in IndexedDB running on Javacript, while another application could be based on Python and store its data in some service in the cloud, while communicating in a simple and standardized way.

## Feature Roadmap

- Permission model & access control to ensure apps don't have unauthorized access to other apps data
- Offline-first multi-DEVICE sync that Storex Hub plugins can use out of the box
- Offline-first multi-USER sync for sharing & collaboration that Storex Hub plugins can use out of the box

Help us accelerating this roadmap and support us on [OpenCollective](https://opencollective.com/worldbrain).

## Want to get started?

Check out the [getting started guide](/storex-hub/getting-started/?id=getting-started) to start playing around with Storex Hub.

<!--
- A guide on the API enpoints
- Contacts to get in touch
-->
