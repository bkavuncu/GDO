app.controller('MainController', ['$scope', '$http', '$routeParams', '$timeout', '$interval', 'mriServices',
function($scope, $http, $routeParams, $timeout, $interval, mriServices) {
    $scope.title = 'XNAT Imaging App';
    $scope.patient = {
        name: 'MY_001'
    }
    $scope.baseUri = "https://central.xnat.org";
    $scope.currentImageIndex = 0;
    $scope.imageIds = [];

    $scope.view = {
        zoomLevel: 2.34,
        windowWidth: 394,
        windowCenter: 192
    }

    // on service completion
    mriServices.success(function(data) {
        var filtered = _.filter(data.ResultSet.Result, function(image) {
            return image.collection === "DICOM";
        });
        $scope.imageIds = _.map(filtered, function(image) {
            return "dicomweb:" + $scope.baseUri + image.URI;
        })
        getImages();
    });

    var getImages = function() {
        function compareNumbers(a, b) {
            //1.3.12.2.1107.5.2.36.40436.30000014081908371717200000064-8-41-skte63.dcm
            //index
            var strippedA = a.substr(a.lastIndexOf("/")+1);
            var strippedB = b.substr(b.lastIndexOf("/")+1);
            //console.log(strippedA);

            //8-41-skte63.dcm
            strippedA = strippedA.substring(strippedA.indexOf("-"));
            strippedB = strippedB.substring(strippedB.indexOf("-"));
            //console.log(strippedA);

            //8-41
            strippedA = strippedA.substring(0,strippedA.lastIndexOf("-"));
            strippedB = strippedB.substring(0,strippedB.lastIndexOf("-"));
            //console.log(strippedA);

            //41
            strippedA = strippedA.substring(strippedA.lastIndexOf("-")+1);
            strippedB = strippedB.substring(strippedB.lastIndexOf("-")+1);
            //console.log(strippedA);

            return parseInt(strippedA) - parseInt(strippedB);
        }

        // wait for next call before attempting to load image URLs with cornerstone
        $timeout(function () {
            $scope.imageIds = $scope.imageIds.sort(compareNumbers);
            /*while($scope.imageIds.length<1) {
                console.log($scope.imageIds.length);
            }*/
            getImageStack();
            console.log("got");
        });
    }

    var getImageStack = function() {
        $scope.element = angular.element('#dicomImage').get(0);
        cornerstone.enable($scope.element);

        cornerstoneTools.mouseInput.enable($scope.element);

        // load and display first image
        var imagePromise = updateTheImage(0);
        var numLoadedImages = 1;

        // add handlers for mouse events once the image is loaded.
        imagePromise.then(function() {
            viewport = cornerstone.getViewport($scope.element);


            viewport.voi.windowWidth = 394;
            viewport.voi.windowCenter = 192;

            $scope.view.zoomLevel = viewport.scale.toFixed(2);
            $scope.view.windowWidth = Math.round(viewport.voi.windowWidth);
            $scope.view.windowCenter = Math.round(viewport.voi.windowCenter);
            cornerstone.setViewport($scope.element, viewport);

            //cornerstoneTools.arrowAnnotate.setConfiguration(config);
        });



        for (var i = 1; i < $scope.imageIds.length; i++) {
            // load entire image stack without displaying
            cornerstone.loadAndCacheImage($scope.imageIds[i]).then(function(image) {
                //cornerstone.displayImage($scope.element, image);
                numLoadedImages++;
            });
        }

    }

    var updateTheImage = function(currentImageIndex) {
        $scope.currentImageIndex = currentImageIndex;
        return cornerstone.loadImage($scope.imageIds[currentImageIndex]).then(function (image) {
            var viewport = cornerstone.getViewport($scope.element);
            cornerstone.displayImage($scope.element, image, viewport);
        });
    };

    $scope.navigateUp = function() {
        if ($scope.currentImageIndex < $scope.imageIds.length-1) {
            $scope.currentImageIndex++;
            //console.log($scope.currentImageIndex);
            //console.log($scope.imageIds[$scope.currentImageIndex]);
            updateTheImage($scope.currentImageIndex);
        }
    }

    $scope.navigateDown = function() {
        if ($scope.currentImageIndex > 0) {
            $scope.currentImageIndex--;
            //console.log($scope.currentImageIndex);
            //console.log($scope.imageIds[$scope.currentImageIndex]);
            updateTheImage($scope.currentImageIndex);
        }
    }

    var played = false;
    var promise;
    $scope.playAll = function () {
        var i = $scope.currentImageIndex;
        if (!played) {
            played = true;
            angular.element('#playButton').text("Pause");
            promise = $interval(function() {
                if (i < 160) {
                    updateTheImage(i);
                    i++;
                }
            }, 300);
        } else if (played || i >= 160){
            angular.element('#playButton').text("Play");
            $interval.cancel(promise);
            played = false;
        }
        console.log(played);
    }

    $scope.resetView = function() {
        $interval.cancel(promise);
        played = false;
        angular.element('#playButton').text("Play");

        cornerstoneTools.highlight.disable($scope.element);
        $scope.highlight = false;

        cornerstoneTools.rectangleRoi.disable($scope.element);
        $scope.marker = false;

        var viewport = cornerstone.getViewport($scope.element);
        viewport.voi.windowWidth = 394;
        viewport.voi.windowCenter = 192;
        viewport.scale = 2.34;
        viewport.translation.x = 0;
        viewport.translation.y = 0;
        cornerstone.setViewport($scope.element, viewport);

        $scope.view.windowWidth = viewport.voi.windowWidth;
        $scope.view.windowCenter = viewport.voi.windowCenter;
        $scope.view.zoomLevel = viewport.scale.toFixed(2);
        updateTheImage(0);
    }

    function activate(id)
    {
        $(id).removeClass('btn-primary');
        $(id).addClass('btn-danger');
    }

    function deactivate(id)
    {
        $(id).removeClass('btn-danger');
        $(id).addClass('btn-primary');
    }

    $scope.highlight = false;
    $scope.highlightEnabled = function() {
        //viewport = cornerstone.getViewport($scope.element);
        if ($scope.highlight != true) {
            $scope.highlight = true;
            activate("#highlightButton");
            cornerstoneTools.highlight.activate($scope.element, 1);
        } else if ($scope.highlight == true){
            $scope.highlight = false;
            deactivate("#highlightButton");
            cornerstoneTools.highlight.disable($scope.element);
        }
        console.log($scope.highlight);
    }


    $scope.marker = false;
    // TODO: Enable marker for marking points of interest in image in red
    $scope.markerEnabled = function() {
        //viewport = cornerstone.getViewport($scope.element);
        if ($scope.marker != true) {
            $scope.marker = true;
            console.log($scope.marker);
            activate("#markerButton");
            cornerstoneTools.arrowAnnotate.activate($scope.element, 1);
            cornerstoneTools.arrowAnnotateTouch.activate($scope.element);
        } else if ($scope.marker == true){
            $scope.marker = false;
            deactivate("#markerButton");
            cornerstoneTools.arrowAnnotate.deactivate($scope.element, 1);
            cornerstoneTools.arrowAnnotateTouch.deactivate($scope.element);
        }
    }

    // Load a local json file
    /*$http.get('scans.json')
     .success(function(data) {
     var filtered = _.filter(data.ResultSet.Result, function(image) {
     return image.collection === "DICOM";
     });
     $scope.imageIds = _.map(filtered, function(image) {
     return "wadouri:" + $scope.baseUri + image.URI;
     });

     //console.log($scope.imageIds);
     })
     .error(function(data,status,error,config){
     $scope.imageIds = [{heading:"Error",description:"Could not load json   data"}];
     console.log($scope.imageIds);
     });
     */


    /*$scope.$on('$routeChangeSuccess', function() {
        // $routeParams should be populated here
        console.log($routeParams);
    });*/
    						
}]);