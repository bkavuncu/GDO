﻿<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Control.aspx.cs" Inherits="GDO.Web.Control" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>GDO Control Panel</title>
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
            background-color: #000;
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
            background-color: #000;
            color: #DDD;
            z-index: 10;
            font-size: 140%;
            width: 100%;
        }
        #header-text {
            width: 100%;
            background-color: #222;
            color: #DDD;
            font-size: 140%;
        }             
        #divider {
            border: 2px solid #444;
            background-color: #444;
        }
        #content {
            margin: 15 auto;
            padding: 15;
            border: 0;
            background-color: #000;
            color: #FFF;
            font-family: helvetica;
            font-size: 100%;
            width: 100%;
        }
    </style>
</head>
<body unselectable="on" class="unselectable">
 <script src="../Scripts/jquery-1.11.3.min.js"></script>
            <script src="../Scripts/jquery.signalR-2.2.0.min.js"></script>
            <script type="text/javascript" src="../Scripts/gdo.js"></script>
            <script src="../signalr/hubs"></script>
            <script type="text/javascript" src="../Scripts/peer.js"></script>

            <script>
                $(function () {
                    loadModule('control', MODULE_TYPE.CORE);
                    initGDO(CLIENT_MODE.CONTROL);
                });
                function initApp() {
                    consoleOut('', 1, 'GDO Initialized');
                    drawEmptyNodeTable(gdo.net.cols, gdo.net.rows);
                    drawEmptySectionTable(gdo.net.cols, gdo.net.rows);
                    drawEmptyButtonTable(5, 1);
                    updateSelf();
                }
            </script>
            <div id="header" unselectable="on" class="unselectable">
                <table id="header_table" unselectable="on" class="unselectable" style="width: 100%; "></table>
            </div>
            <div id="divider"></div>
            <div id="content" style="align: center" unselectable="on" class="unselectable">
                <br>
                <table id="selected_node" style="width: 99%">
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

                <table id="node_table" unselectable="on" class="unselectable" style="width: 100%"></table>
                <br>
                <br>
                <table id="section_table" unselectable="on" class="unselectable" style="width: 100%"></table>
                <br>
                <table id="button_table" unselectable="on" class="unselectable" style="width: 100%"></table>
            </div>
    <form id="form1" runat="server">
    <div>
    </div>
    </form>
</body>
</html>
