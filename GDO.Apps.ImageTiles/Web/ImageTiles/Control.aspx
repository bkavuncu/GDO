<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Control.aspx.cs" Inherits="GDO.Apps.ImageTiles.Web.Control" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
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
        .thumb {
            height: 75px;
            border: 1px solid #000;
            margin: 10px 5px 0 0;
          }
    </style>
</head>
<body>
    <script src="../../Scripts/jquery-1.11.3.min.js"></script>
    <script src="../../Scripts/jquery.signalR-2.2.0.min.js"></script>
    <script>
        $(function () {
            var gdo = parent.gdo;
            gdo.loadModule('imageTiles', gdo.MODULE_TYPE.APP);
            gdo.net.app["ImageTiles"].initControl();
        });
    </script>
    <form id="form1" runat="server">
    </form>

    <div>
        <table id="select_table" unselectable="on" class="unselectable" style="width:100%;text-align:center">
            <tr>
                <!--<td colspan="2"> <h1>ImageTiles App Control</h1></td>-->
                <td> <h1>ImageTiles App Control</h1></td>
            </tr>
            <tr>
                <td><h3>Select Files</h3></td>
                <!--<td><h3>or Drop Files</h3></td>-->
            </tr>
            <tr>
                <td>
                    <input type="file" id="files" name="files[]" multiple />
                </td>
                <!--<td>
                    <div id="drop_zone">Drop files here</div>
                </td>-->
            </tr>
            <tr>
                <!--<td colspan="2">-->
                <td>
                    <output id="list"></output>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
