# Distributed D3.js (DD3):
[![NPM version](https://badge.fury.io/js/socket.io.svg)](https://www.npmjs.com/package/dd3)

## Motivation (BAI)
Key to the success of a data driven economy is the sharing of the insight generated from data. At the heart of this is data visualisation. Indeed visualisation and visual analytics remain one of the key tools used to generate insight from data.

However current visualisation techniques like [Data-Driven-Documents (D3.js)](https://d3js.org/) still remain unaffected by the rise of Big Data, most visualisation tools and environments are capable of showing only small datasets and a tiny number of data points. 

Because one key role for universities is to lead the development of tools for better Data Science, at the [Data Science Institute](https://www.imperial.ac.uk/data-science/) we have been developing a Distributed model for data visualisation building upon the D3.js approach. This will enable easy scalability of visualisations to multiple computers, high resolution screens and video walls which are becoming increasingly common. This will enable orders of magnitude more data points to be visualised for greater insight.


## Features
#### Distributed Data Visualization: (BAI)
- Each browser only holds part of the whole data which it needs to visualize.
- If some data in the current browser need to be visualized in the other browsers dynamically, these data will be transferred from the current browser to the other browser via [Peerjs](http://peerjs.com/). The browsers will create new dom elements according to the received data (position, radius, transition, tween...).
- This design can avoid to save all the visualized data in a centralized server (single machine and single threaded model) and dynamically reduce the limitation of showing only small datasets and a tiny number of data points under the centralized model.
- As more visualized data can be supported in DD3 framework, tt could help practitioners gain a complete view of the data with the rise of Big Data.

#### Nodejs Server Support: (BAI)
- The nodejs server utilize the [room](https://socket.io/docs/rooms-and-namespaces/) concept: each application in one room, each instance of any application in one room.
- All the clients in the same room can be regarded as a group of visulation browsers which will show one application.
- Nodejs server which works as a HTTP server only provides simple functions: 1) Response the HTML page loading request. 2) Room management for each joined client. 3) Decide if all the required clients joined according to the qurey parameters in URL and broadcast launch app command.
- We will make the nodejs server more simple via the Peerjs server in the next version. The nodejs server only plays a role of a HTTP server. All the other funtions are implemented by the Peerjs server.

#### Peerjs Server Support: (XIAO)

#### Odata Support: (XIAO)

## API Reference (Evann)
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
- ```confId``` in the URL represents application 
- ```controlId``` reprenets the instanceId of each application.
- ```numClients``` indicates that how many browsers you wanna use to visualize data.
#### Client URL: 
- http://localhost:8080/Web/DD3/App.html?confId=0&controlId=3&clientId=2&row=1&column=1&numClients=2
- ```confId``` in the URL represents application which is should be the same with the Control URL above.
- ```clientId``` has the same meaning with the GDO client which is the id of each browser.
- ```row``` indicate the row index of the browser.
- ```column``` indicate the column index of the browser.
- ```numClients``` indicates that how many browsers you wanna use to visualize data and it should be the same with the Control URL above.

## Installation (BAI)


1. Clone this project.
2. Find and get into the project directory via the console.
3. Input ```npm install``` in the console.


## Launch Example (BAI)

1. Open console and make sure the direction is in this folder.
2. In console, input "npm install"
3. In console, input "node server.js" to launch nodejs server.
4. In browser, input control URL:http://127.0.0.1:8080/Web/DD3/Control.html?confId=0&controlId=3&numClients=2
5. In browser, input client1 URL:http://localhost:8080/Web/DD3/App.html?confId=0&controlId=3&clientId=1&row=1&column=1&numClients=2
6. In browser, input client2 URL:http://localhost:8080/Web/DD3/App.html?confId=0&controlId=3&clientId=2&row=1&column=1&numClients=2
7. You will find the transition application (confId = 0) will be launched successfully.

## Set up nodejs server in VM
1. Connect to the VM.
2. Install the nodejs via https://nodejs.org/en/download/.
3. Install the mongodb via https://www.mongodb.com/download-center#community. (Xiaoping will be in charge of setting up the MongoDB service.)
4. Download the project in Github (The project only needs the folder "GDO.Apps.SeparateDD3" in the "separate-dd3" branch). Find "gdo.apps.dd3.socketio.js" file and change socket server IP "http://localhost:8080" to "http://serverpublicIPofVM:8080"; Find "controlInit.js" file and change socket server IP "http://localhost:8080" to "http://serverpublicIPofVM:8080".
5. Upload the edited project into the VM.
6. Find the project directory and input ```npm install``` in the console.
7. Lauch the nodejs server via ```node server.js```.
8. Open the control Pannel via http://serverpublicIPofVM:8080/Web/DD3/Control.html?confId=0&controlId=3&numClients=2
9. Open client one via http://serverpublicIPofVM:8080/Web/DD3/App.html?confId=0&controlId=3&clientId=1&row=1&column=1&numClients=2
10. Open client two via http://serverpublicIPofVM:8080/Web/DD3/App.html?confId=0&controlId=3&clientId=2&row=1&column=1&numClients=2
11. You will find the transition application (confId = 0) will be launched successfully.

## GOD Performance Test
1. Login http://dsimanagement.doc.ic.ac.uk. (If you have no access to this service, please ask David for help.)
2. Click "Cluster Commands" in the nav bar on the top.
3. Find the DD3 demo command in the command list. The demo command has the specific items below:
- ```Project name:``` DD3 
- ```Owner:``` Bai
- ```Name:``` Launch Test
- ```Description:``` dd3 test
4. Click the ```Edit``` button on the rightmost side of this page.
5. Copy all the content in the ```Commands``` textarea.
6. Go back to the command list page and click the ```Create New``` button on the top part of the page.
7. Edit the corresponding items ```Project name```, ```Owner```, ```Name```, ```Description``` and paste the commands you have already copied in the demo command into this new ```Commands``` textarea.
8. In the ```Commands``` textarea, replace the ```serverpublicIPofVM``` part of the URL with the server public IP of the VM.
9. Click the ```Save``` button to save this new command.
10. Open the control Pannel via http://serverpublicIPofVM:8080/Web/DD3/Control.html?confId=0&controlId=3&numClients=64. (Replace the ```serverpublicIPofVM``` part of the URL with the server public IP of the VM. This control pannel could be open in your own PC as it is easy to control the applications on GDO.)
11. Go back to the command list page and find the new added command. Click the ```Execute``` button on the rightmost side of the page.
12. You will find the transition application with 64 browsers (clients) will be launched in GDO as well as the control panel in you own PC. After running the application, click ```Save FPS``` button in the control panel to save the CSV file to local. Then the analysis could be done based on all the performance results.
13. In order to test different numbers of the clients. You could add different commands by repeating ```Step 7 to Step 9```. The difference for the ```Commands``` textarea is to set different numbers for the ```numClients=``` item. The ```numClients=``` item in the control panel URL should be the same with the ```Commands``` textarea.
