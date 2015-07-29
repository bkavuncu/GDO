<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Base.aspx.cs" Inherits="GDO.Web.Base" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <style> 

      body {
      background: #000;
      color: #222;
      font-family:helvetica;
      font-size:777;
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
            var gdo = parent.gdo;
            gdo.loadModule("node.base", gdo.MODULE_TYPE.CORE);
        });
    </script>
    <form id="form1" runat="server">
    </form>
        <div id="base_title" style="width:100%;text-align:center"></div>
</body>
</html>
