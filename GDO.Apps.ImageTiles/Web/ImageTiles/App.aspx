<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="App.aspx.cs" Inherits="GDO.Apps.ImageTiles.Web.App" %>

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
    #image_tile {
           position:fixed;
           top:0; left:0;
           width:100%;
           height:100%;
           border:0 none;
           z-index:9;
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
            gdo.net.app["ImageTiles"].initClient();
        });
    </script>
    <form id="form1" runat="server">
    </form>
    <div>
        <img id="image_tile"/>
    </div>
</body>
</html>
