/**
*   Version: 0.0.1
*   Summary: odata service client module 
**/

var odata = {

    config: {
        host: "localhost",
        port: 48100,
        svcName: "MongoDataService.svc",
        dataName: "scatterplot33",
        select: ["x", "y"],
        orderby: "x"
    },

    query: function (filter) {
        var queryStr = "http://" + odata.config.host + ":" + odata.config.port + "/" + odata.config.svcName + "/";
        queryStr += odata.config.dataName + "?";
        queryStr += "$select=";

        var selectLen = odata.config.select.length;
        $.each(odata.config.select, function(i, val){
          if(i == selectLen - 1){
            queryStr += val;
          }else{
            queryStr += val + ",";
          }
        })

        queryStr += "&$orderby=" + odata.config.orderby;
        queryStr += "&$filter=" + filter;
        console.log(queryStr);

        var oHandler = o(queryStr);
        oHandler.get(function (data) {
           console.log(JSON.stringify(data));
        });

    },

};
