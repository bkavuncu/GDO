var app = angular.module("xnatApp", ['ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider

        .when('/:cat/:id', {
            controller: 'MainController',
            templateUrl: 'views/detailPane.html'
        })
        .otherwise({
            redirectTo: '/'
        });
});