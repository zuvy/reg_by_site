'use strict';
define(function(require) {
	var module = require('components/registration_count/module');
	
	module.controller('elemAppCtrl', ['$scope', '$q', '$http', 'getData', '$attrs', '$filter', function($scope, $q, $http, getData, $attrs, $filter) {
		console.log('Elementary controller loaded');
		$scope.message = 'Elementary Registration Controller';
		$scope.elemData = [];
		$scope.loading = true;
		$scope.elDate = $filter('date')(new Date(), "MM/dd/yyyy");
		$scope.elTime = $filter('date')(new Date(), "HH:mm");
		$scope.site = $attrs.ngSite;
		$scope.g_num = $attrs.ngGrade;
		
		// Grade level labels for display
		$scope.gradeLabels = {
			'prek': 'PreK',
			'k': 'K',
			'grade_1': '1st',
			'grade_2': '2nd',
			'grade_3': '3rd',
			'grade_4': '4th',
			'grade_5': '5th'
		};
		
		// Load elementary registration data
		$scope.loadElementaryData = function() {
			console.log("Loading elementary data...");
			var elemData = {
				"method": 'GET',
				"url": `js/elem_reg.json`,
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
					// Filter out empty objects and process data
					$scope.elemData = retData.filter(function(item) {
						return item.school_id;
          });
          console.log("elementary data");
          console.log($scope.elemData);
					
					// Just process the enrollment data - no capacity calculations needed
					console.log("Processed elementary data:", $scope.elemData);
					
					$scope.loading = false;
					console.log("Elementary registration data loaded:", $scope.elemData);
				}
			}).catch(function(error) {
				console.error("Error loading elementary data:", error);
				$scope.loading = false;
			});
		};
		
		// Get status class for utilization display
		$scope.getUtilizationClass = function(utilization) {
			if (utilization >= 95) return 'over-capacity';
			if (utilization >= 85) return 'near-capacity';
			if (utilization >= 70) return 'good-capacity';
			return 'under-capacity';
		};
		
		// Get status text
		$scope.getStatusText = function(enrolled, capacity) {
			if (capacity == 0) return 'No Teachers';
			var utilization = Math.round((enrolled / capacity) * 100);
			if (utilization >= 95) return 'Over Capacity';
			if (utilization >= 85) return 'Near Capacity';
			if (utilization >= 70) return 'Good';
			return 'Available';
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