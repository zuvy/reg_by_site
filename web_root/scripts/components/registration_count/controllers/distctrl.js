'use strict';
define(function(require) {
	var module = require('components/registration_count/module');
	
	module.controller('elemAppCtrl', ['$scope', '$q', '$http', 'getData', '$attrs', '$filter', function($scope, $q, $http, getData, $attrs, $filter) {
		console.log('District registration controller loaded');
		$scope.message = 'District Registration Controller';
		$scope.regData = null;
		$scope.categoryData = [];
		$scope.loading = true;
		$scope.elDate = $filter('date')(new Date(), "MM/dd/yyyy");
		$scope.elTime = $filter('date')(new Date(), "HH:mm");
		$scope.site = $attrs.ngSite;
		$scope.g_num = $attrs.ngGrade;
		
		// Load district registration data
		$scope.loadElementaryData = function() {
			console.log("Loading district registration data...");
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
				console.log("District registration data not returned.");
				$scope.loading = false;
			} else {
				$scope.regData = retData;
				console.log("District registration data loaded:", $scope.regData);
				// Now load category data
				$scope.loadCategoryData();
			}
		}).catch(function(error) {
			console.error("Error loading district data:", error);
			$scope.loading = false;
		});
	};
	
	// Load school category registration data
	$scope.loadCategoryData = function() {
		console.log("Loading school category registration data...");
		var categoryDataRequest = {
			"method": 'GET',
			"url": `js/school_cat_reg.json`,
			"headers": {
				"Content-Type": "application/json",
				"Accept": "application/json"
			}
		};
		
		getData.getElemData(categoryDataRequest).then(function(retData) {
			console.log("Raw category data response:", retData);
			if(!retData) {
				console.log("School category registration data not returned.");
			} else {
				// Filter out empty objects
				$scope.categoryData = retData.filter(function(item) {
					return item.category_name;
				});
				console.log("School category registration data loaded:", $scope.categoryData);
			}
			$scope.loading = false;
		}).catch(function(error) {
			console.error("Error loading school category data:", error);
			$scope.loading = false;
		});
	};		// Format numbers for display
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