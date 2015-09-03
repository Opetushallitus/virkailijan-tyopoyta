angular.module('loading', [])

    .factory('loadingService', [function() {
        var service = {
            requestCount: 0,
            isLoading: function() {
                return service.requestCount > 0;
            }
        };
        return service;
    }])

    .factory('onCompleteInterceptor', ['loadingService', '$q', function(loadingService, $q) {
        return {
            request: function (config) {
                loadingService.requestCount++;
                return config;
            },
            requestError: function (rejection) {
                return $q.reject(rejection);
            },
            response: function (response) {
                loadingService.requestCount--;
                return response;
            },
            responseError: function (rejection) {
                loadingService.requestCount--;
                return $q.reject(rejection);
            }
        }
    }])

    .config(['$httpProvider', function($httpProvider) {
        $httpProvider.interceptors.push('onCompleteInterceptor');
    }])

    .controller('LoadingCtrl', ['$scope', 'loadingService', function($scope, loadingService) {
        $scope.$watch(function() {
            return loadingService.isLoading();
        }, function(value) {
            $scope.loading = value;
        });
    }]);