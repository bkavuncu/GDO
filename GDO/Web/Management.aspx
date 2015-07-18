﻿<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Management.aspx.cs" Inherits="GDO.Web.Management" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>GDO Management</title>
     <style>
        #page td {
           padding:0; margin:0;
        }

        #page {
           border-collapse: collapse;
        }
        body {
            margin: 0 auto;
            padding: 0;
            border: 0;
            background-color: #555;
            color: #222;
            font-family: helvetica;
            font-size: 100%;
            width: 100%;
        }

        .unselectable {
            -moz-user-select: -moz-none;
            -khtml-user-select: none;
            -webkit-user-select: none;
            -o-user-select: none;
            user-select: none;
        }
        .cell{
            margin:10;
        }
        #header {
            margin: 0;
            padding: 0;
            border: 0;
            width: 100%;
            background-color: #555;
            color: #AAA;
            z-index: 10;
            font-size: 140%;
            height: 43px;
            width: 100%;
        }
        #title-text {
            margin: 25;
            padding: 0;
            border: 0;
            width: 100%;
            background-color: #555;
            color: #AAA;
            z-index: 10;
            font-size: 140%;
            height: 43px;
            width: 100%;
        }
        #content {
            margin: 15 auto;
            padding: 15;
            border: 0;
            background-color: #999;
            color: #333;
            font-family: helvetica;
            font-size: 100%;
            width: 100%;
        }
    </style>
</head>
<body>
 <script src="../../Scripts/jquery-1.11.3.min.js"></script>
            <script src="../../Scripts/jquery.signalR-2.2.0.min.js"></script>
            <script type="text/javascript" src="../../Scripts/gdo.js"></script>
            <script src="../../signalr/hubs"></script>
            <script type="text/javascript" src="../../Scripts/peer.js"></script>

            <script>
                $(function () {
                    loadModule('management', MODULE_TYPE.CORE);
                    initGDO(CLIENT_MODE.CONTROL);
                });
                function initApp() {
                    consoleOut('', 1, 'GDO Initialized');
                    drawEmptyNodeTable(gdo.net.cols, gdo.net.rows);
                    drawEmptySectionTable(gdo.net.cols, gdo.net.rows);
                    drawEmptyButtonTable(4, 1);
                    updateSelf();
                }
                //TESTS
                //------------
                //connect
                //init js tests
                //section live tests
                //create a section
                //deploy test app in different p2p modes
                //test app will test data sharing
                //give some time for tests to complete or check through a boolean
                //close app test
                //redeploy live test?
            </script>
            <div id="header">
                <div id="title-text">
                    GDO Management
                </div>
            </div>
            <div id="content" style="align: center">
                <table id="selected_node" style="width: 97%">
                    <tr>
                        <td id="selected_node_id"><b>Node Id:</b></td>
                        <td id="selected_node_col"><b>Col:</b></td>
                        <td id="selected_node_row"><b>Row:</b></td>
                        <td id="selected_node_sid"><b>Section Id:</b></td>
                        <td id="selected_node_scol"><b>Section Col:</b></td>
                        <td id="selected_node_srow"><b>Section Row:</b></td>
                        <td id="selected_node_cid"><b>Connection Id:</b></td>
                        <td id="selected_node_pid"><b>Peer Id:</b></td>
                        <td id="selected_node_h"><b>Node Health:</b></td>
                    </tr>
                </table>
                <table id="node_table" unselectable="on" class="unselectable" style="width: 97%"></table>
                <br>
                <b>Section Table:</b>
                <table id="section_table" unselectable="on" class="unselectable" style="width: 97%"></table>
                <br>
                <table id="button_table" unselectable="on" class="unselectable" style="width: 97%"></table>
            </div>
    <form id="form1" runat="server">
    <div>
            <asp:ScriptManager ID="ScriptManager1" runat="server">
                 <scripts>
                    <asp:scriptreference assembly="GDO.Apps.ImageTiles" name="GDO.Apps.ImageTiles.Scripts.gdo.apps.imagetiles.js" />
                </scripts>
            </asp:ScriptManager>
    </div>
    </form>
</body>
</html>
