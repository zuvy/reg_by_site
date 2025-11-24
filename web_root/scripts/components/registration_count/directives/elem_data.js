define(function(require) {
    'use strict';
    var module = require('components/registration_count/module');
 
 // Get home page data / variables
	module.factory('getData', function ($http) {
	    return {
    	    getElemData: function(datasource) {
    	       console.log("datasource");
    	       console.log(datasource);
    	        return $http(datasource).then(function successCallback(response) {
    	           console.log("response");
								console.log(response.data);
    	            return response.data;
    	        },
    	        function errorCallback(response) {
                console.log("datasource no data");
								console.log(response);
    	        });
    	    }
	    }
	}); // End Factory
});