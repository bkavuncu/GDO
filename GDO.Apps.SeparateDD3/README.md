# Distributed D3.js (DD3):
![NPM version](https://badge.fury.io/js/socket.io.svg)

## Motivation
Key to the success of a data driven economy is the sharing of the insight generated from data. At the heart of this is data visualisation. Indeed visualisation and visual analytics remain one of the key tools used to generate insight from data.

However current visualisation techniques like [Data-Driven-Documents (D3.js)](https://d3js.org/) still remain unaffected by the rise of Big Data, most visualisation tools and environments are capable of showing only small datasets and a tiny number of data points. 

Because one key role for universities is to lead the development of tools for better Data Science, at the [Data Science Institute](https://www.imperial.ac.uk/data-science/) we have been developing a Distributed model for data visualisation building upon the D3.js approach. This will enable easy scalability of visualisations to multiple computers, high resolution screens and video walls which are becoming increasingly common. This will enable orders of magnitude more data points to be visualised for greater insight.


## Features
- Distributed Data Visualization:

- Nodejs Server Support:

- Peerjs Server Support:


## API Reference

Depending on the size of the project, if it is small and simple enough the reference docs can be added to the README. For medium size to larger projects it is important to at least provide a link to where the API reference docs live.




# Tests:
1. Open console and make sure the direction is in this folder.
2. In console, input "npm install"
3. In console, input "node server.js" to launch nodejs server.
4. In browser, input control URL:http://127.0.0.1:8080/Web/DD3/Control.html?confId=0&controlId=3&numClients=2
5. In browser, input client1 URL:http://localhost:8080/Web/DD3/App.html?confId=0&controlId=3&clientId=1&row=1&column=1&numClients=2
6. In browser, input client2 URL:http://localhost:8080/Web/DD3/App.html?confId=0&controlId=3&clientId=2&row=1&column=1&numClients=2
7. You will find the transition application (confId = 0) will be launched successfully.


# Specification:
1. Install nodejs server via "https://nodejs.org/en/"
2. Control ULR: http://127.0.0.1:8080/Web/DD3/Control.html?confId=0&controlId=3&numClients=2
3. Client URL: http://localhost:8080/Web/DD3/App.html?confId=0&controlId=3&clientId=2&row=1&column=1&numClients=2
4. "confId" in the URL represents application and "controlId" reprenets the instanceId of each application.
5. "clientId" has the same meaning with the GDO client which is the id of each browser.
6. The URL query parameters should be modified according to Xiaoping's design.
7. All the data query function in this version is removed, because they should be replaced by Odata.
8. Only when "confId=0", the application can work good. Because only the application with "confId=0" does not need to query data from the server but all the other applications need to query data from server. After the data query functions are implemented, we could test the other applications one by one.
9. Most of the changes of this version is in the "control.html" and "app.html" as well as their js files. Some changes also happened in the "gdo.apps.dd3.js" file and all these changes are commented by "seperate version changed". The reason is that all these changes are about signalR or GDO framework code. In this seperate version, signalr and GDO are not needed any more.


## Code Example

Show what the library does as concisely as possible, developers should be able to figure out **how** your project solves their problem by looking at the code example. Make sure the API you are showing off is obvious, and that your code is short and concise.


## Installation

```bash
npm install dd3
```


## Contributors

Let people know how they can dive into the project, include important links to things like issue trackers, irc, twitter accounts if applicable.

## License

A short snippet describing the license (MIT, Apache, etc.)
