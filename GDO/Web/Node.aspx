<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Node.aspx.cs" Inherits="GDO.Web.Node" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>GDO Node</title>
    <meta charset="utf-8"/>
    <style> 

      body {
      background: #000;
      color: #FFF;
      font-family:helvetica;
      font-size:70%;
      }
      .unselectable {
            -moz-user-select: -moz-none;
            -khtml-user-select: none;
            -webkit-user-select: none;
            -o-user-select: none;
            user-select: none;
        }
      #app_frame {
           position:fixed;
           top:0; left:0;
           width:100%;
           height:100%;
           border:0 none;
           z-index:9;
      }
      iframe {
           border:0 none;
           width:100%;
           height:100%;
           display:block;
       }
    </style>
</head>
<body unselectable="on" class="unselectable">
    <form id="form1" runat="server">
    <div>
    
    </div>
    </form>
    <script src="../Scripts/jquery-1.11.3.min.js"></script>
    <script src="../Scripts/jquery.signalR-2.2.0.min.js"></script>
    <script type="text/javascript" src="../Scripts/gdo.js"></script>
    <script src="../signalr/hubs"></script>
    <script type="text/javascript" src="../Scripts/peer.js"></script>
    <script>
        $(function () {
            gdo.loadModule('node', gdo.MODULE_TYPE.CORE);
            gdo.loadModule('maintenance',gdo.MODULE_TYPE.CORE);
            gdo.initGDO(gdo.CLIENT_MODE.NODE);
        });
        initApp = function () {
            gdo.consoleOut('', 1, 'GDO Initialized');
            gdo.updateSelf();
        }
    </script>
    <div id="app_frame"><iframe ïd="app_frame_content" name="app_frame_content"></iframe></div>
    <div id="maintenance">
        <div id="maintenance_title" style="text-align:center">Test Node</div>
        <br>
        <table id="maintenance_status_table" unselectable="on" class="unselectable" style="width:100%;text-align:center">
            <tr>
                <td id="maintenance_status_table_col">
                    <table  style="width:100%;text-align:center">
                        <tr>
                            <td><b>Cave Col</b></td>
                        </tr>
                        <tr>
                            <td id="maintenance_status_table_col_content"></td>
                        </tr>
                    </table>
                </td>    
                <td id="maintenance_status_table_row">
                    <table  style="width:100%;text-align:center">
                        <tr>
                            <td><b>Cave Row</b></td>
                        </tr>
                        <tr>
                            <td id="maintenance_status_table_row_content"></td>
                        </tr>
                    </table>
                </td>
                <td id="maintenance_status_table_sid">
                    <table  style="width:100%;text-align:center">
                        <tr>
                            <td><b>Section Id</b></td>
                        </tr>
                        <tr>
                            <td id="maintenance_status_table_sid_content"></td>
                        </tr>
                    </table>
                </td>
                <td id="maintenance_status_table_scol">
                    <table  style="width:100%;text-align:center">
                        <tr>
                            <td><b>Section Col</b></td>
                        </tr>
                        <tr>
                            <td id="maintenance_status_table_scol_content"></td>
                        </tr>
                    </table>
                </td>
                <td id="maintenance_status_table_srow">
                    <table  style="width:100%;text-align:center">
                        <tr>
                            <td><b>Section Row</b></td>
                        </tr>
                        <tr>
                            <td id="maintenance_status_table_srow_content"></td>
                        </tr>
                    </table>
                </td>
                <td id="maintenance_status_table_cid">
                    <table  style="width:100%;text-align:center">
                        <tr>
                            <td><b>Connection Id</b></td>
                        </tr>
                        <tr>
                            <td id="maintenance_status_table_cid_content"></td>
                        </tr>
                    </table>
                </td>
                <td id="maintenance_status_table_pid">
                    <table  style="width:100%;text-align:center">
                        <tr>
                            <td><b>Peer Id</b></td>
                        </tr>
                        <tr>
                            <td id="maintenance_status_table_pid_content"></td>
                        </tr>
                    </table>
                </td>
                <td id="maintenance_status_table_h">
                    <table  style="width:100%;text-align:center">
                        <tr>
                            <td><b>Node Health</b></td>
                        </tr>
                        <tr>
                            <td id="maintenance_status_table_h_content"></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <br>
        <table id="maintenance_node_table" unselectable="on" class="unselectable" style="width:100%"></table>
        <br>
        <br>
        <div id="console_area" style="width: 99.5%; height: 234px; overflow-y:scroll; overflow-y:hidden; border:4px solid #444; background-color: #222; color: #FFF"></div>
    </div> 
</body>
</html>
