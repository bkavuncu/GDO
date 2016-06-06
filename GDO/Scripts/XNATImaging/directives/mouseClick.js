/**
 * Created by Phil on 18/05/2016.
 */
/*https://github.com/chafey/cornerstone/blob/master/example/scrollzoompanwl/index.html*/

app.directive('mouseClick', function() {

    return {
        link: function (scope, element, attrs) {

            // TODO: does not prevent right click context menu from opening when dragging outside element
            document.oncontextmenu = function (e) {
                if (e.target.hasAttribute('right-click')) {
                    return false;
                }
            };

            element.bind('mousedown', function (e) {

                var lastX = e.pageX;
                var lastY = e.pageY;

                var mouseButton = e.which;

                //console.log(mouseButton + "(" + lastX + ", " + lastY + ")");

                element.on('mousemove', function (e) {
                    var deltaX = e.pageX - lastX,
                        deltaY = e.pageY - lastY;
                    lastX = e.pageX;
                    lastY = e.pageY;
                    if (mouseButton == 1) {
                        var viewport = cornerstone.getViewport(scope.element);
                        viewport.voi.windowWidth += (deltaX / viewport.scale);
                        viewport.voi.windowCenter += (deltaY / viewport.scale);
                        //$('#bottomleft').text("WW/WL:" + Math.round(viewport.voi.windowWidth) + "/" + Math.round(viewport.voi.windowCenter));
                        cornerstone.setViewport(scope.element, viewport);

                        scope.view.windowWidth = Math.round(viewport.voi.windowWidth);
                        scope.view.windowCenter = Math.round(viewport.voi.windowCenter);
                        scope.$apply();
                    }
                    else if (mouseButton == 2) {
                        var viewport = cornerstone.getViewport(scope.element);
                        viewport.translation.x += (deltaX / viewport.scale);
                        viewport.translation.y += (deltaY / viewport.scale);
                        cornerstone.setViewport(scope.element, viewport);

                    } else if (mouseButton == 3) {
                        scope.$apply(function(){

                        });
                        var viewport = cornerstone.getViewport(scope.element);
                        viewport.scale += (deltaY / 100);
                        //$('#mrbottomright').text("Zoom: " + viewport.scale.toFixed(2) + "x");
                        cornerstone.setViewport(scope.element, viewport);
                        scope.view.zoomLevel = viewport.scale.toFixed(2);


                    }
                });
                element.on('mouseup', function (e) {
                    element.unbind('mousemove');
                    element.unbind('mouseup');


                });
            });

        }
    }
});