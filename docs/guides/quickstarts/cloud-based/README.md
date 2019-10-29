# Creating a cloud-based application

Storex can store data both [client-side](/guides/quickstart/client-base) and server-side. In this guide, we'll start by creating an application that runs entirely client-side for testing purpose, and then move our entire storage logic server-side into an SQL/MongoDB datase, putting an automatically generated GraphQL API as a communication layer between client and server. This approach allows you to not worry about setting up databases until you're sure enough what kind of product you're building, and can improve your day to day development workflow a lot.
