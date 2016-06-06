/*http://blog.sodhanalibrary.com/2015/04/angularjs-directive-for-mouse-wheel.html#.VzGOwPkrJhF*/

app.directive('mouseWheelUp', function() {
    return function(scope, element, attrs) {
        element.bind("DOMMouseScroll mousewheel onmousewheel", function(event) {

            // cross-browser wheel delta
            if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
                scope.navigateUp();
                scope.$apply()
            }

            // for IE
            event.returnValue = false;
            // for Chrome and Firefox
            if(event.preventDefault) {
                event.preventDefault();
            }
            return false;
        });
    };
});