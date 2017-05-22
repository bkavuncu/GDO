1. install nodejs
2. npm install
3. node server.js
4. Control ULR: http://127.0.0.1:8080/Web/DD3/Control.html?confId=0&controlId=3&numClients=2
5. Client URL: http://localhost:8080/Web/DD3/App.html?confId=0&controlId=3&clientId=2&row=1&column=1&numClients=2
6. "confId" in the URL represents application and "controlId" reprenets the instanceId of each application.
7. "clientId" has the same meaning with the GDO client which is the id of each browser.
8. The URL query parameters should be modified according to Xiaoping's design.
9. All the data query function in this version is removed, because they should be replaced by Odata.
10. Only when "confId=0", the application can work good. Because only the application with "confId=0" does not need to query data from the server but all the other applications need to query data from server. After the data query functions are implemented, we could test the other applications one by one.
11. Most of the changes of this version is in the "control.html" and "app.html" as well as their js files. Some changes also happened in the "gdo.apps.dd3.js" file and all these changes are commented by "seperate version changed". The reason is that all these changes are about signalR or GDO framework code. In this seperate version, signalr and GDO are not needed any more.



Test Example:
1. launch nodejs server.
2. input control URL:http://127.0.0.1:8080/Web/DD3/Control.html?confId=0&controlId=3&numClients=2
3. input client1 URL:http://localhost:8080/Web/DD3/App.html?confId=0&controlId=3&clientId=1&row=1&column=1&numClients=2
4. input client2 URL:http://localhost:8080/Web/DD3/App.html?confId=0&controlId=3&clientId=2&row=1&column=1&numClients=2
5. You will find the transition application (confId = 0) will be launched successfully.
