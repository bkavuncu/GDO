/*http://blog.sodhanalibrary.com/2015/04/angularjs-directive-for-mouse-wheel.html#.VzGOwPkrJhF*/

app.directive('mouseWheelDown', function() {
    return function(scope, element, attrs) {
        element.bind("DOMMouseScroll mousewheel onmousewheel", function(event) {

            // cross-browser wheel delta

            // Firefox e.originalEvent.detail > 0 scroll back, < 0 scroll forward
            // chrome/safari e.originalEvent.wheelDelta < 0 scroll back, > 0 scroll forward
            if (event.originalEvent.wheelDelta < 0 || event.originalEvent.detail > 0) {
                scope.navigateDown();
                scope.$apply();
            }

            //prevent page fom scrolling
            // for IE
            event.returnValue = false;
            // for Chrome and Firefox
            if(event.preventDefault)  {
                event.preventDefault();
            }
            return false;

        });
    };
});