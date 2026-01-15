'use strict';
define(function(require) {
	var module = require('components/registration_count/module');
	
	module.controller('elemRegCtrl', ['$scope', '$q', '$http', 'getData', '$attrs', '$filter', function($scope, $q, $http, getData, $attrs, $filter) {
		console.log('Elementary registration controller loaded');
		$scope.message = 'Elementary Registration Controller';
		$scope.elemData = [];
		$scope.loading = true;
		$scope.elDate = $filter('date')(new Date(), "MM/dd/yyyy");
		$scope.elTime = $filter('date')(new Date(), "HH:mm");
		$scope.site = $attrs.ngSite;
		$scope.g_num = $attrs.ngGrade;
		
		// Student to teacher ratios by grade level
		$scope.studentTeacherRatios = {
			'-2': 23,  // PreK-2
			'-1': 23,  // PreK
			'0': 24,   // Kindergarten
			'1': 24,   // 1st grade
			'2': 24,   // 2nd grade
			'3': 24,   // 3rd grade
			'4': 27,   // 4th grade
			'5': 27    // 5th grade
		};
		
		// Calculate capacity status for a grade
		$scope.calculateGradeStatus = function(enrolled, virtual, teachers, gradeLevel) {
			var numTeachers = parseInt(teachers) || 0;
			var numStudents = parseInt(enrolled) || 0;
			var numVirtual = parseInt(virtual) || 0;
			var ratio = $scope.studentTeacherRatios[gradeLevel] || 24;
			var maxStudents = numTeachers * ratio;
			var available = maxStudents - numStudents;
			
			var status = {
				enrolled: numStudents,
				virtual: numVirtual,
				available: available,
				max: maxStudents,
				color: 'green',  // green, yellow, red, or none
				overflow: false
			};
			
			// Determine color coding
			if (gradeLevel <= -1) {
				// PreK grades don't get color coding
				status.color = 'none';
			} else if (maxStudents <= numStudents) {
				status.color = 'red';
				status.overflow = true;
			} else if (numStudents > maxStudents - (maxStudents * 0.10)) {
				status.color = 'yellow';
			} else {
				status.color = 'green';
			}
			
			return status;
		};
		
		// Process school data with capacity calculations
		$scope.processSchoolData = function(school) {
			school.grades = {
				'-2': $scope.calculateGradeStatus(school.enrollment.prek2, school.virtual.prek2, school.teachers.prek2, '-2'),
				'-1': $scope.calculateGradeStatus(school.enrollment.prek, school.virtual.prek, school.teachers.prek, '-1'),
				'0': $scope.calculateGradeStatus(school.enrollment.k, school.virtual.k, school.teachers.k, '0'),
				'1': $scope.calculateGradeStatus(school.enrollment.grade_1, school.virtual.grade_1, school.teachers.grade_1, '1'),
				'2': $scope.calculateGradeStatus(school.enrollment.grade_2, school.virtual.grade_2, school.teachers.grade_2, '2'),
				'3': $scope.calculateGradeStatus(school.enrollment.grade_3, school.virtual.grade_3, school.teachers.grade_3, '3'),
				'4': $scope.calculateGradeStatus(school.enrollment.grade_4, school.virtual.grade_4, school.teachers.grade_4, '4'),
				'5': $scope.calculateGradeStatus(school.enrollment.grade_5, school.virtual.grade_5, school.teachers.grade_5, '5')
			};
			return school;
		};
		
		// Load elementary registration data
		$scope.loadElementaryData = function() {
			console.log("Loading elementary registration data...");
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
				
				if(!retData || retData.length === 0) {
					console.log("Elementary registration data not returned.");
					$scope.loading = false;
					return;
				}
				
				// Transform flat row data into nested school structure
				var schoolsMap = {};
				
				retData.forEach(function(row) {
					if (!row.school_name) return;
					
					var schoolId = row.school_id;
					if (!schoolsMap[schoolId]) {
						schoolsMap[schoolId] = {
							school_name: row.school_name,
							school_id: row.school_id,
							enrollment: { prek: 0, k: 0, grade_1: 0, grade_2: 0, grade_3: 0, grade_4: 0, grade_5: 0 },
							virtual: { prek: 0, k: 0, grade_1: 0, grade_2: 0, grade_3: 0, grade_4: 0, grade_5: 0 },
							teachers: { prek: 0, k: 0, grade_1: 0, grade_2: 0, grade_3: 0, grade_4: 0, grade_5: 0 }
						};
					}
					
					var school = schoolsMap[schoolId];
					var gradeKey = {
						'-1': 'prek',
						'0': 'k',
						'1': 'grade_1',
						'2': 'grade_2',
						'3': 'grade_3',
						'4': 'grade_4',
						'5': 'grade_5'
					}[row.grade_level];
					
					if (gradeKey) {
						if (row.student_type === 'regular') {
							school.enrollment[gradeKey] = row.student_count || 0;
						} else if (row.student_type === 'virtual') {
							school.virtual[gradeKey] = row.student_count || 0;
						}
						school.teachers[gradeKey] = row.teacher_count || 0;
					}
				});
				
				// Convert map to array and process
				$scope.elemData = Object.values(schoolsMap).map(function(school) {
					return $scope.processSchoolData(school);
				});
				
				console.log("Elementary registration data loaded:", $scope.elemData);
				$scope.loading = false;
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
