var createGrid = function (instanceId, names, section) {
    var nodes = [];
    var gridData = {};
    gridData.rows = [];
    for(var i = 0; i < section.nodeMap.length; i++)
    {
        nodes = nodes.concat(section.nodeMap[i]);
    }
    nodes.sort(function (a, b) {
        return a - b;
    });
    for (var i = 0; i < nodes.length; i++) {
        gridData.rows.push({ nodeId: nodes[i].toString(), sheet: names[(nodes[i] - 1) % names.length] });
    }
    $.jgrid.defaults.responsive = true;
    $.jgrid.styleUI.Bootstrap.base.rowTable = "table table-bordered table-striped";
    var options = names.map(function (n) { return n + ":" + n; }).join(";");
    var grid = $('iframe').contents().find('#view_model_grid');
    grid.empty().jqGrid({
        datatype: "local",
        data: gridData.rows,
        editurl: "http://146.169.32.111/Operations/ViewSheet?instanceId=" + instanceId,
        sortable: false,
        hidegrid: false,
        colModel: [
            { label: 'nodeId', name: 'nodeId',editable: true, key:true, width: 100, sorttype:'number'},
            {
                label: 'sheet',
                name: 'sheet',
                width: 100,
                editable: true,
                edittype: "select",
                editoptions: {
                    value: options
                }
            }
        ],
        styleUI: "Bootstrap",
        loadonce: true,
        onSelectRow: editRow,
        autowidth: true,
        viewrecords: true,
        caption: "Current Setup of Model",
        pager: "#view_model_pager"
    });

    var lastSelection;

    function editRow(id) {
        if (id && id !== lastSelection) {
            var grid = $('iframe').contents().find('#view_model_grid');
            grid.jqGrid('restoreRow', lastSelection);
            grid.jqGrid('editRow', id, { keys: true, focusField: 4 });
            lastSelection = id;
        }
    }

    /*for (var i = 0; i < nodes.length; i++) {
        grid.addRowData(i, gridData.rows[i]);
    }*/

}

var createSection = function (id, section) {
    $.ajax({
        url: "http://146.169.32.111/Operations/GetSheetNames?instanceId=" + id,
        method: "GET",
        success: function (response) {
            if (response.success) {
                names = response.message;
                $('iframe').contents().find('#view_model_message').html("Successfully obtained data.");
                createGrid(id, names, section);
            } else {
                setTimeout(function () { createSection(id,section) }, 5000);
                $('iframe').contents().find('#view_model_message').html(response.message + ". Trying again.");
            }
        }
    });
}

gdo.net.app["Spreadsheets"].viewModel = function (id, model, section) {
	$.ajax({
	    url: "http://146.169.32.111/Operations/ViewModel",
        method: "POST",
	    data: {instanceId:id, model: model },
	    success: function (response) {
	        if (response.success) {
	            gdo.consoleOut(".Spreadsheets", 1, response.message);
	            createSection(id, section);
	            gdo.consoleOut(".Spreadsheets", 1, "Now to work on manipulating the screens.");
	        } else {
	            $('iframe').contents().find('#view_model_message').html("<p style=\"color:red\">Exception[ViewModel]:" + response.message + "</p>");
                gdo.consoleOut(".Spreadsheets", 1, "Exception[ViewModel]:" + response.message);
            }
	    }
	});

}