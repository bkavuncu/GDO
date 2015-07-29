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
    </style>
</head>
<body>
    <script src="../../Scripts/jquery-1.11.3.min.js"></script>
    <script src="../../Scripts/jquery.signalR-2.2.0.min.js"></script>
    <script>
        $(function () {
            var test3 = "test3";
        });
    </script>
    <form id="form1" runat="server">
    </form>

        <div>
    <h1>This is Image Tiles Control</h1>
    </div>
</body>
</html>
