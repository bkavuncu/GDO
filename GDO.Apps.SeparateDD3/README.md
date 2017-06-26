# Distributed D3.js (DD3):
![NPM version](https://badge.fury.io/js/socket.io.svg)

## Motivation (BAI)
Key to the success of a data driven economy is the sharing of the insight generated from data. At the heart of this is data visualisation. Indeed visualisation and visual analytics remain one of the key tools used to generate insight from data.

However current visualisation techniques like [Data-Driven-Documents (D3.js)](https://d3js.org/) still remain unaffected by the rise of Big Data, most visualisation tools and environments are capable of showing only small datasets and a tiny number of data points. 

Because one key role for universities is to lead the development of tools for better Data Science, at the [Data Science Institute](https://www.imperial.ac.uk/data-science/) we have been developing a Distributed model for data visualisation building upon the D3.js approach. This will enable easy scalability of visualisations to multiple computers, high resolution screens and video walls which are becoming increasingly common. This will enable orders of magnitude more data points to be visualised for greater insight.


## Features
- Distributed Data Visualization: (BAI)

- Nodejs Server Support: (BAI)

- Peerjs Server Support:


## API Reference
A introduction of the dd3 api to do the visualization. It should be like the [API Reference of D3.js](https://github.com/d3/d3/blob/master/API.md)
```js
dd3.svgCanvas
dd3.position()
dd3.defineEase()
...
```


## Specification (BAI)
#### Control ULR: 
- http://127.0.0.1:8080/Web/DD3/Control.html?confId=0&controlId=3&numClients=2
- "confId" in the URL represents application and "controlId" reprenets the instanceId of each application.
#### Client URL: 
- http://localhost:8080/Web/DD3/App.html?confId=0&controlId=3&clientId=2&row=1&column=1&numClients=2
- "clientId" has the same meaning with the GDO client which is the id of each browser.


## Installation (BAI)

```bash
npm install dd3
```

## Launch Example (BAI)
```bash
1. Open console and make sure the direction is in this folder.
2. In console, input "npm install"
3. In console, input "node server.js" to launch nodejs server.
4. In browser, input control URL:http://127.0.0.1:8080/Web/DD3/Control.html?confId=0&controlId=3&numClients=2
5. In browser, input client1 URL:http://localhost:8080/Web/DD3/App.html?confId=0&controlId=3&clientId=1&row=1&column=1&numClients=2
6. In browser, input client2 URL:http://localhost:8080/Web/DD3/App.html?confId=0&controlId=3&clientId=2&row=1&column=1&numClients=2
7. You will find the transition application (confId = 0) will be launched successfully.
```

## License (BAI)

A short snippet describing the license (MIT, Apache, etc.)
