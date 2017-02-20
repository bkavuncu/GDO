//template for xiaoping

var dd3Net = {
    
    peer: {
        configPeer: {
            host:,
            port:,
            id: null,
            peers: [],
            connections: [],
            buffers: []
        },
        configCentral: {
        
        },

        init: function(type) {
            switch (type) {
                case 'peer':

                    break;
                case 'central':
                    break;
            }
        },
        //Add data to database
        connect: function (collection, data) { },
        //Delete data in the database
        flush: function (collection, data) { },
        //Update new data to the database
        send: function (collection, query, data) { },
        // find a data from database.
        find: function (collection, query) { }



    },

    signalr: {},
    nodejs: {
        
    }
};



