/**
 * Created by Phil on 07/05/2016.
 */
app.factory('mriServices', ['$http', function($http) {

        // Makes AJAX call to pull DICOM image URIs from XNAT REST API
        $http.config = {
        method: 'GET',
        url: 'https://central.xnat.org/data/experiments/CENTRAL_E07330/scans/7/files?format=json',
        headers: {
            //'Authorization': 'Basic ' + 'uname' + ':' + 'pw',
            //or
            //'Authorization': 'Bearer ' + 'token'
            //
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:63342'
        }
        };
        /*var responsePromise = $http.get("https://central.xnat.org/data/experiments/CENTRAL_E07330/scans/7/files?format=json");

        responsePromise.success(function(data, status, headers, config) {
            var filtered = _.filter(data.ResultSet.Result, function(image) {
                return image.collection === "DICOM";
            });
            $scope.imageIds = _.map(filtered, function(image) {
                return "wadouri:" + $scope.baseUri + image.URI;
            });
            //console.log($scope.imageIds);
        });
        responsePromise.error(function(data, status, headers, config) {
            alert("AJAX failed!");
        });*/

        return $http.get("https://central.xnat.org/data/experiments/CENTRAL_E07330/scans/7/files?format=json")
            .success(function(data) {
                return data;
            })
            .error(function(err) {
                return err;
            });;

}
]);