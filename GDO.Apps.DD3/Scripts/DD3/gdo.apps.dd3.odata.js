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
        orderby: ["x"]
    },

    query: function (dataType, dataName, select, orderby, dataFilter, callback) {
        var queryStr = "http://" + odata.config.host + ":" + odata.config.port + "/" + odata.config.svcName + "/";

        queryStr += dataName + "?";

        queryStr += "$select=";
        var selectLen = select.length;
        $.each(select, function (i, val) {
            if (i == selectLen - 1) {
                queryStr += val;
            } else {
                queryStr += val + ",";
            }
        });

        queryStr += "&$orderby=";
        var orderLen = orderby.length;
        $.each(orderby, function (i, val) {
            if (i == orderLen - 1) {
                queryStr += val;
            } else {
                queryStr += val + ",";
            }
        });

        queryStr += "&$filter=" + dataFilter;
        console.log(queryStr);

        var oHandler = o(queryStr);
        oHandler.get(function (data) {
            //console.log(JSON.stringify(data));
            callback(dataType, dataName, data);
        });

    },

    queryWith: function (dataType, dataName, select, orderby, queryFilter, top, skip, callback) {
        var queryStr = "http://" + odata.config.host + ":" + odata.config.port + "/" + odata.config.svcName + "/";

        queryStr += dataName + "?";

        queryStr += "$select=";
        var selectLen = select.length;
        $.each(select, function (i, val) {
            if (i == selectLen - 1) {
                queryStr += val;
            } else {
                queryStr += val + ",";
            }
        });

        queryStr += "&$orderby=";
        var orderLen = orderby.length;
        $.each(orderby, function (i, val) {
            if (i == orderLen - 1) {
                queryStr += val;
            } else {
                queryStr += val + ",";
            }
        });
        
        queryStr += "&$filter=" + queryFilter;
        queryStr += "&$top=" + top;
        queryStr += "&$skip=" + skip;
        console.log(queryStr);

        var oHandler = o(queryStr);
        oHandler.get(function (data) {
            //console.log(JSON.stringify(data));
            callback(dataType, dataName, data);
        });

    },

};
