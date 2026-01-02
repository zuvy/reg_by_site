'use strict';
define(function(require) {
	var module = require('components/registration_count/module');
	
	module.controller('elemAppCtrl', ['$scope', '$q', '$http', 'getData', '$attrs', '$filter', function($scope, $q, $http, getData, $attrs, $filter) {
		console.log('Elementary controller loaded');
		$scope.message = 'Elementary Registration Controller';
		$scope.regData = null;
		$scope.loading = true;
		$scope.elDate = $filter('date')(new Date(), "MM/dd/yyyy");
		$scope.elTime = $filter('date')(new Date(), "HH:mm");
		$scope.site = $attrs.ngSite;
		$scope.g_num = $attrs.ngGrade;
		
		// Load elementary registration data
		$scope.loadElementaryData = function() {
			console.log("Loading elementary registration data...");
			var elemData = {
				"method": 'GET',
				"url": `js/dist_reg.json`,
				"headers": {
					"Content-Type": "application/json",
					"Accept": "application/json"
				}
			};
			
			getData.getElemData(elemData).then(function(retData) {
				console.log("Raw elementary data response:", retData);
				if(!retData) {
					console.log("Elementary registration data not returned.");
					$scope.loading = false;
				} else {
					$scope.regData = retData;
					console.log("Elementary registration data loaded:", $scope.regData);
					$scope.loading = false;
				}
			}).catch(function(error) {
				console.error("Error loading elementary data:", error);
				$scope.loading = false;
			});
		};
		
		// Format numbers for display
		$scope.formatNumber = function(value) {
			return parseInt(value || 0);
		};
		
		// Initialize the controller
		$scope.init = function() {
			$scope.loadElementaryData();
		};
		
		// Start the application
		$scope.init();
	}]);
});