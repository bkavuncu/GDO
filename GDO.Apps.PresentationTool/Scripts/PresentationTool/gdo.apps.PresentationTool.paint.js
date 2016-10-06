$(function () {
	var gdo = parent.gdo;
	$("#img_paint").click(function (e) {
		if (gdo.net.app["PresentationTool"].isPlaying === 0 || gdo.net.app["PresentationTool"].img_control_enable === 0) {
			e.preventDefault();
			return false;
		} else {
			$("#paint_img").attr('src', gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].src);
			var newHeight = $("#paint_bg").width() / (gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].width / gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].height);
			$("#paint_bg").height(newHeight);


			var cropboxDataWidth = $("#paint_bg").width();
			var cropboxDataHeight = $("#paint_bg").height();

			var canvasDataWidth = document.getElementById("paint_img").naturalWidth;
			var canvasDataHeight = document.getElementById("paint_img").naturalHeight;

			var scalewidth = cropboxDataWidth / canvasDataWidth;
			var scaleheight = cropboxDataHeight / canvasDataHeight;

			if (scalewidth < scaleheight) {
				$("#paint_img").width(cropboxDataWidth);
				$("#paint_img").height(cropboxDataWidth / (canvasDataWidth / canvasDataHeight));
			} else {
				$("#paint_img").height(cropboxDataHeight);
				$("#paint_img").width(cropboxDataHeight * (canvasDataWidth / canvasDataHeight));
			}
			$('#wPaint').empty().remove();
			$("#paint_modal_body")
				.append("<div id='wPaint' style='position:relative; width:640px; height:" + newHeight + "px; margin: 50px 0px 0px 0px'></div>");
			$('#wPaint').wPaint({
				path: '/../Scripts/PresentationTool/wPaint/',
				menuOffsetLeft: -35,
				menuOffsetTop: -50,
				onShapeDown: createCallback('onShapeDown'),
				onShapeUp: createCallback('onShapeUp'),
				onShapeMove: createCallback('onShapeDMove')
			});
			function createCallback(cbName) {
				return function () {
					if (cbName === 'onShapeDMove' || cbName === 'onShapeUp') {
						var instanceId = gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].appInstanceId;
						var realInstanceId = gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].realInstanceId;
						var canvasData = $("#wPaint").wPaint("image");
						var serializeCanvasData = JSON.stringify(canvasData);
						gdo.net.app["Images"].server.receiveCanvasData(realInstanceId, serializeCanvasData);
					}
				}
			}

			$.fn.wPaint.extend({
				undo: function () {
					if (this.undoArray[this.undoCurrent - 1]) {
						this._setUndo(--this.undoCurrent);
					}
					this._undoToggleIcons();
					var instanceId = gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].appInstanceId;
					var realInstanceId = gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].realInstanceId;
					var canvasData = $("#wPaint").wPaint("image");
					var serializeCanvasData = JSON.stringify(canvasData);
					gdo.net.app["Images"].server.receiveCanvasData(realInstanceId, serializeCanvasData);
				},
				clear: function () {
					var instanceId = gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].appInstanceId;
					var realInstanceId = gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].realInstanceId;
					var canvasData = $("#wPaint").wPaint("image");
					var serializeCanvasData = JSON.stringify(canvasData);
					gdo.net.app["Images"].server.receiveCanvasData(realInstanceId, serializeCanvasData);
				},
			});
			$(".wPaint-menu").width("auto").css({ "left": "0px" });
			$(".wPaint-menu-select").css({ "overflow-y": "scroll" });
		}
	});
})