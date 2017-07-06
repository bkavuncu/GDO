/**
*   Version: 0.0.1
*   Summary: odata service client module
**/

var odata = {

    // config: {
    //     host: "localhost",
    //     port: 48100,
    //     svcName: "MongoDataService.svc",
    //     dataName: "scatterplot33",
    //     select: ["x", "y"],
    //     orderby: ["x"]
    // },

    config: {
        host: "localhost",
        port: 35555,
        dataName: "scatterplot33",
        select: ["x", "y"],
        orderby: ["x"]
    },

    dims: function (dataId, callback) {
        var queryStr = "http://" + odata.config.host + ":" + odata.config.port + "/" + dataId;

        var oHandler = o(queryStr);
        oHandler.get(function (data) {

            console.log(JSON.stringify(data));

            // logic goes here

            if (data) {

                function getDimensions(key, data){
                    var lowest = Number.POSITIVE_INFINITY;
                    var highest = Number.NEGATIVE_INFINITY;
                    var tmp;
                    for (var i=data.length-1; i>=0; i--) {
                        tmp = parseFloat(data[i][key]);
                        if (tmp < lowest) lowest = tmp;
                        if (tmp > highest) highest = tmp;
                    }
                    var obj = {
                        max: highest,
                        min: lowest,
                        length: data.length
                    };
                    return obj;
                }

                var dimensions = {
                    length: data.length
                };

                var keys = Object.keys(data[0]);
                keys.forEach(function(key) {
                    if (key != "id") {
                        var res = getDimensions(key, data);
                        // console.log(res);
                        dimensions[key] = res;
                    }
                }, this);

                // console.log(JSON.stringify(dimensions));
                callback(dataId, JSON.stringify(dimensions));

            }

        });
    },

    query: function (dataType, dataName, select, orderby, dataFilter, callback) {
        var queryStr = "http://" + odata.config.host + ":" + odata.config.port + "/";

        if (odata.config.svcName) {
            queryStr += odata.config.svcName + "/";
        }

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

    queryWith: function (dataType, dataId, select, orderby, queryFilter, top, skip, addOrder, callback) {
        var queryStr = "http://" + odata.config.host + ":" + odata.config.port + "/";

        if (odata.config.svcName) {
            queryStr += odata.config.svcName + "/";
        }

        queryStr += dataId + "?";

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
            if (addOrder) {
              data.forEach(function(d, i) {
                data[i]['order'] = i + skip;
              });
            }

            console.log(JSON.stringify(data));
            callback(dataType, dataId, data);
        });

    },

};
