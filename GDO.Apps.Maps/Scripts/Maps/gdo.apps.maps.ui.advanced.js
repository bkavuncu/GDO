
gdo.updateDisplayCanvas = function () {
    /// <summary>
    /// Updates the gdo canvas.
    /// </summary>
    /// <returns></returns>
    //gdo.consoleOut(".DISPLAY", 2, "At Update Display");
    gdo.net.app["Maps"].drawHeaderTable();
    gdo.net.app["Maps"].drawMapTable();
    gdo.net.app["Maps"].drawInstanceTable();
    gdo.net.app["Maps"].drawLayerTable();
    gdo.net.app["Maps"].drawContentTable();
    gdo.net.app["Maps"].drawPropertyTable();
    gdo.net.app["Maps"].drawStatusTable();
}

//TODO empty tables

//Generic method to read data structure and edit methods

//Layer Table

    //List of layers displayed as id/name/visible/up/down/animate

    //Top of Layers 

    //Plus add layer

//Content Table

    //Automate layer.properties

    //Editables list will give which are editable values

    //Plus add layer will ignore and load all the list

    //Update or Save button will appear on the bottom or top

//Edit Table

    //Only load editable list if existing
    
    //Load full list if new