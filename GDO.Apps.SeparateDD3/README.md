# DD3 PeerJS 

## Getting Started

#### Quick Setup

1. `npm install` (NodeJS required)

2. `node server.js`

#### Click to Play

Control: http://localhost:8080/Web/DD3/Control.html?confId=0&controlId=3&numClients=2 

Client 1: http://localhost:8080/Web/DD3/App.html?confId=0&controlId=3&clientId=1&row=1&column=1&numClients=2 

Client 2: http://localhost:8080/Web/DD3/App.html?confId=0&controlId=3&clientId=2&row=1&column=1&numClients=2

#### Test on GDO

Control: http://146.169.32.196:8080/Web/DD3/Control.html?confId=0&controlId=3&numClients=2 

Client 1: http://146.169.32.196:8080/Web/DD3/App.html?confId=0&controlId=3&clientId=1&row=1&column=1&numClients=2 

Client 2: http://146.169.32.196:8080/Web/DD3/App.html?confId=0&controlId=3&clientId=2&row=1&column=1&numClients=2

Control: http://146.169.32.196:8080/Web/DD3/Control.html?confId=0&controlId=1&numClients=2 

Client 1: http://146.169.32.196:8080/Web/DD3/App.html?confId=0&controlId=1&clientId=1&row=1&column=1&numClients=2 

Client 2: http://146.169.32.196:8080/Web/DD3/App.html?confId=0&controlId=1&clientId=2&row=1&column=1&numClients=2

## Setup OData

#### Prepare MongoDB

1. Install mongodb (download from [link](https://www.mongodb.com/download-center#community))

2. Import data files (from /odata/data-files)
    
    `mongoimport --db dd3 --collection barData --file barData.txt --jsonArray`

### Start OData

1. `node odata-server.js`

