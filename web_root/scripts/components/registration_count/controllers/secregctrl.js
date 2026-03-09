'use strict';
define(function(require) {
	var module = require('components/registration_count/module');

	module.controller('secRegCtrl', ['$scope', '$q', '$http', 'getData', '$filter', function($scope, $q, $http, getData, $filter) {
		console.log('Secondary registration controller loaded');
		$scope.secData = [];
		$scope.loading = true;
		$scope.elDate = $filter('date')(new Date(), 'MM/dd/yyyy');
		$scope.elTime = $filter('date')(new Date(), 'HH:mm');

		// Load secondary registration data
		$scope.loadSecondaryData = function() {
			console.log('Loading secondary registration data...');
			var config = {
				method: 'GET',
				url: 'js/sec_reg.json',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				}
			};

			getData.getElemData(config).then(function(retData) {
				console.log('Raw secondary data response:', retData);

				if (!retData || retData.length === 0) {
					console.log('Secondary registration data not returned.');
					$scope.loading = false;
					return;
				}

				// Transform flat rows into nested school structure
				var schoolsMap = {};

				retData.forEach(function(row) {
					if (!row.school_name) return;

					var id = row.school_id;
					if (!schoolsMap[id]) {
						schoolsMap[id] = {
							school_name: row.school_name,
							school_id:   row.school_id,
							school_type: row.school_type,  // 'HIGH' or 'MID'
							enrollment:  {},               // grade_level (string) -> count
							virtual:     {}                // grade_level (string) -> count
						};
					}

					var school = schoolsMap[id];
					var gl = String(row.grade_level);
					var count = parseInt(row.student_count) || 0;

					if (row.student_type === 'regular') {
						school.enrollment[gl] = count;
					} else if (row.student_type === 'virtual') {
						school.virtual[gl] = count;
					}
				});

				$scope.secData = Object.values(schoolsMap);
				console.log('Secondary registration data loaded:', $scope.secData);
				$scope.loading = false;
			}).catch(function(err) {
				console.error('Error loading secondary data:', err);
				$scope.loading = false;
			});
		};

		// Per-grade helpers
		$scope.getEnrolled = function(school, grade) {
			return school.enrollment[String(grade)] || 0;
		};

		$scope.getVirtual = function(school, grade) {
			return school.virtual[String(grade)] || 0;
		};

		$scope.getTraditional = function(school, grade) {
			return $scope.getEnrolled(school, grade) - $scope.getVirtual(school, grade);
		};

		// School-total helpers (sum over applicable grades only)
		$scope.getTotal = function(school) {
			var grades = school.school_type === 'HIGH' ? [9, 10, 11, 12] : [6, 7, 8];
			return grades.reduce(function(sum, g) {
				return sum + $scope.getEnrolled(school, g);
			}, 0);
		};

		$scope.getTotalVirtual = function(school) {
			var grades = school.school_type === 'HIGH' ? [9, 10, 11, 12] : [6, 7, 8];
			return grades.reduce(function(sum, g) {
				return sum + $scope.getVirtual(school, g);
			}, 0);
		};

		$scope.getTotalTraditional = function(school) {
			return $scope.getTotal(school) - $scope.getTotalVirtual(school);
		};

		// Initialize the controller
		$scope.init = function() {
			$scope.loadSecondaryData();
		};

		$scope.init();
	}]);
});
