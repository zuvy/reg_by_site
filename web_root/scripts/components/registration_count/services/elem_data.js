'use strict';
define(function(require) {
    var module = require('components/registration_count/module');
    
    // Data service for elementary registration  
    module.factory('getData', ['$http', function($http) {
        return {
            getElemData: function(datasource) {
                console.log("getData service called with:", datasource);
                return $http(datasource).then(function successCallback(response) {
                    console.log("getData service response:", response);
                    return response.data;
                },
                function errorCallback(response) {
                    console.log("getData service error:", response);
                    throw response;
                });
            }
        };
    }]);
});