# DD3 PeerJS 

## Getting Started

### Quick Setup

1. `npm install` (NodeJS required)

2. `node server.js`

### Click to Play

Control: http://localhost:8080/Web/DD3/Control.html?confId=0&controlId=3&numClients=2 

Client 1: http://localhost:8080/Web/DD3/App.html?confId=0&controlId=3&clientId=1&row=1&column=1&numClients=2 

Client 2: http://localhost:8080/Web/DD3/App.html?confId=0&controlId=3&clientId=2&row=1&column=1&numClients=2

## OData + MongoDB

### Prepare MongoDB

1. Install mongodb (download from [link](https://www.mongodb.com/download-center#community))

2. Import data files (from /odata/data-files)
    
    `mongoimport --db dbName --collection collectionName --file fileName.txt --jsonArray`

### Start OData

1. `node odata-server.js`
