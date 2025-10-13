'use strict';
define(function(require) {
	var module = require('components/registration_count/module');
	
	module.controller('settingsAppCtrl', ['$scope', '$http', '$filter', function($scope, $http, $filter) {
		console.log('Settings controller loaded');
		$scope.message = 'Registration Settings Controller';
		$scope.schools = [];
		$scope.teacherCapacity = [];
		$scope.loading = true;
		
		// Load teacher data
		$scope.loadTeacherData = function() {
			console.log("Loading teacher data...");
			$http({
				"url": "../reports/registration/js/num_teachers.json",
				"method": "GET",
				"headers": {
					"Content-Type": "application/json",
					"Accept": "application/json"
				}
			}).then(function(response) {
				console.log("Raw teacher data response:", response);
				console.log("Response data:", response.data);
				$scope.schools = response.data.filter(function(item) {
					return item && item.school_id; // Filter out empty objects
				});
				$scope.loading = false;
				console.log("Filtered teacher data:", $scope.schools);
			}, function(error) {
				console.error("Error loading teacher data:", error);
				console.error("Error details:", error);
				$scope.loading = false;
			});
		};
		
		// Get current teacher count from preferences
		$scope.getTeacherCount = function(schoolId, grade) {
			// This will be populated by the form values or preferences
			return 0;
		};
		
		// Save teacher preferences (inline save instead of separate page)
		$scope.saveTeacherCounts = function() {
			$scope.saving = true;
			// The form will handle the actual saving via standard POST
			console.log("Saving teacher counts...");
		};
		
		// Initialize the controller
		$scope.init = function() {
			$scope.loadTeacherData();
		};
		
		// Start the application
		$scope.init();
	}]);
});