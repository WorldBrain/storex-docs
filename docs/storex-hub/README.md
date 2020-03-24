# Storex Hub

Storex was built to address the needs of [Memex](https://getmemex.com), a web research tool, to run on multiple platforms with different levels of tooling around data storage. However, the users of Memex, knowledge workers, have specific needs for their research workflows that are not addressable by any single, general tools. Therefore, the goal of Storex Hub is to provide an easy way for multiple offline-first applications to expose and connect data between them. This way, it'd suddenly by possible to:

- Develop a specialized application for managing tags of different types of content stored by different applications, like web pages stored by Memex, Tweets stored by a Twitter integration, articles coming from your RSS reeds, etc. instead of creating such a tag management UI for each application individually.
- Feed notes attached to diffferent kinds of contents into other tools.
- Write a backup application that backs up the data of all your applications at once, instead of each application having its own backup solution.
- Write a task management application where you could link tasks to Tweets, people, e-mails, etc.

## Current state and the near future

Currently, Storex Hub is a local server, started from the command line, that multiple applications can connect to and 1) query/manipulate the data of other applications, and 2) process requests by other application to query/manipulate their data. This means that one application can store it's data in IndexedDB running on Javacript, while another application could be based on Python and store its data in some service in the cloud, while communicating in a simple and standardized way.

Once this functionality is stable, we'd like applications to be able store their data directly in Storex Hub, so we can gradually move toward data being stored independently for their apps (e.g. my contact list instead of the contact list stored in my CRM app, my e-mail client, etc.) This'd require a solid permission model, infrastucture to deal with schema changes, etc.

## Further into the future

Once we have data from multiple applications stored in a single datastore, we can work more on connecting this data and experimenting with models to that. We don't want a user to have multiple separate contact lists for example, but being able to show and manipulate it from any of the installed applications that interact with the user list. This probably includes describing data with standards like RDF, figuring out what the most suitable database engine is to keep things reasonably efficient, etc.

Aside from that, there are many more things that'd be awesome for users and developers to have at their disposal in user-friendly privacy-focused applications. Check out the [roadmap](/storex-hub/roadmap/) for some ideas here.

## What's next?

Check out the [getting started guide](/storex-hub/getting-started/) to start playing around with Storex Hub.

<!--
- A guide on the API enpoints
- Contacts to get in touch
-->
