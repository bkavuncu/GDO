$(function () {
	var gdo = parent.gdo;
	// Image control
	$("#img_control").click(function () {
		if (gdo.net.app["PresentationTool"].isPlaying === 0) return;
		if (gdo.net.app["PresentationTool"].img_control_enable === 0) return;
		gdo.net.app["PresentationTool"].img_control_status = 1 - gdo.net.app["PresentationTool"].img_control_status;

		if (gdo.net.app["PresentationTool"].img_control_status === 0) {
			$('#img_preview > img').cropper('destroy');
			$(this).removeClass("btn-primary").removeClass("btn-success").addClass("btn-primary");
			return;
		}
		$(this).removeClass("btn-primary").removeClass("btn-success").addClass("btn-success");

		var left = 0.00;
		var top = 0.00;
		$('#img_preview > img').cropper({
			autoCrop: false,
			strict: false,
			guides: false,
			highlight: false,
			dragCrop: false,
			cropBoxMovable: false,
			cropBoxResizable: false,
			dragMode: 'move',
			built: function () {
				$(this).cropper('clear');
				left = $(this).cropper('getCanvasData').left;
				top = $(this).cropper('getCanvasData').top;
			}
		});

		$('#img_preview > img').on('cropmove.cropper', function (e) {
			var instanceId = gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].appInstanceId;
			var realInstanceId = gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].realInstanceId;
			if (instanceId !== null && instanceId > 0 && gdo.net.instance[instanceId].appName === "Images") {
				gdo.net.app["Images"].server.requestMoveImage(realInstanceId, $(this).cropper('getCanvasData').left - left, $(this).cropper('getCanvasData').top - top);
				left = $(this).cropper('getCanvasData').left;
				top = $(this).cropper('getCanvasData').top;
			}
		});

		$('#img_preview > img').on('zoom.cropper', function (e) {
			var instanceId = gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].appInstanceId;
			var realInstanceId = gdo.net.app["PresentationTool"].section[gdo.net.app["PresentationTool"].selectedSection].realInstanceId;
			if (instanceId !== null && instanceId > 0 && gdo.net.instance[instanceId].appName === "Images") {
				if (e.ratio > e.oldRatio) {
					gdo.net.app["Images"].server.requestZoomImage(realInstanceId, 0.05);
					left = $(this).cropper('getCanvasData').left;
					top = $(this).cropper('getCanvasData').top;
				} else {
					gdo.net.app["Images"].server.requestZoomImage(realInstanceId, -0.05);
					left = $(this).cropper('getCanvasData').left;
					top = $(this).cropper('getCanvasData').top;
				}
			}
		});
	});
})