var MESHCOPIER = function (scene, gdo) {
    this.scene = scene;
    this.gdo = gdo;

    this.meshesToSend = [];
    this.meshesToImport = [];

    BABYLON.SceneLoader._loggingLevel = BABYLON.SceneLoader.DETAILED_LOGGING;

    this.addMeshesToSend = function (meshes) {
        for (var i = 0; i < meshes.length; i++) {
            this.meshesToSend.push(meshes[i]);
        }
    }

    this.addMeshesToImport = function (data) {
        this.meshesToImport.push(data);
    }

    this.numToSend = 20;

    var count = 0;

    this.doWork = function () {
        count++;

        if (count > 3 && this.meshesToSend.length > 0) {
            count = 0;

            var objectToSend = {};
            objectToSend.appName = "WebGL";
            objectToSend.command = "receiveMesh";

            var topOfList = this.meshesToSend.splice(0, this.numToSend);
            objectToSend.data = BABYLON.SceneSerializer.SerializeMesh(topOfList);

            /*
            for (var num = 0; num < this.numToSend; num++) {
                var mesh = this.meshesToSend.pop();

                if (mesh != undefined && mesh.name != "skyBox") {

                    var data = {};
                    data.name = mesh.name;
                    data.materialName = mesh.material.name;
                    data.position = mesh.position;
                    data.rotation = mesh.rotation;
                    data.serializedGeometry = mesh.geometry.serializeVerticeData(); 
                }
            }
            */

            console.log("Sending data");
            console.log(objectToSend);

            var stringifiedDataToSend = JSON.stringify(objectToSend);

            var connectedNodes = this.gdo.net.node[this.gdo.clientId].connectedNodeList;
            for (var i = 0; i < connectedNodes.length; i++) {
                var nodeId = connectedNodes[i];
                var conn = gdo.net.peer.connections[gdo.net.node[nodeId].peerId][0];
                conn.send(stringifiedDataToSend);
            }
        }

        var data = this.meshesToImport.pop();
        if (data == undefined) {
            return;
        }

        console.log(data);

        var dataToLoad = "data:" + JSON.stringify(data);
        dataToLoad = dataToLoad.substring(0, dataToLoad.length - 1);
        dataToLoad += ", \"extension\": \".babylon?\"}";

        BABYLON.SceneLoader.ImportMesh("", "", dataToLoad, this.scene,
            function (meshes) {
                console.log("IMPORTER SUCESS");
            },
            function () { },
            function (scene, error) {
                console.log("IMPORTER ERROR: " + error)
            });

        /*
        data.forEach(function (geo) {
            var mesh = new BABYLON.Mesh(geo.name, this.scene);
            mesh.position.copyFrom(geo.position);
            mesh.rotation.copyFrom(geo.rotation);

            console.log("created mesh");

            var material = this.scene.getMaterialByName(geo.materialName);
            mesh.setMaterialByID(material.id);

            console.log("added mat");
            console.log(material);

            var geometry = BABYLON.Geometry.Parse(geo.serializedGeometry, this.scene, "");
            BABYLON.Geometry.ImportGeometry(geometry, mesh);

            console.log(geometry);

        }.bind(this));
        */
    }
}