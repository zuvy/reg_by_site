define(function (require) {
	'use strict'
		var module = require('components/eligibility/module');
		var $j = require('jquery');
		module.controller('listAppCtrl',['$scope', '$q', '$http', 'getData', '$attrs', '$filter', function($scope, $q, $http, getData, $attrs, $filter) {
			$scope.message = 'listAppCtrl message.';
			$scope.elemData = [];
			$scope.elDate = $filter('date')(new Date(), "MM/dd/yyyy");
			//console.log("elDate = " + $scope.elDate);
			$scope.elTime = $filter('date')(new Date(), "HH:mm");
			//console.log("elTime = " + $scope.elTime);
			$scope.site = $attrs.ngSite;
			$scope.g_num = $attrs.ngGrade;
			//console.log("site = " + $scope.site + " g_num = " + $scope.g_num)
			
			var sData = {};
			
			var elemData = {
				"method": 'POST',
				"url": `js/elem_reg.json?s_num=${$scope.site}&g_num=${$scope.g_num}`,
				"headers": {
				"Content-Type": "application/json",
				"Accept": "application/json",
				"dataType": "json"
				}
			};
			
			sData = elemData;
			
			let listData = 
			getData.getElemData(sData).then(function(retData) {
				if(!retData) {
					console.log("Demographics data retData not returned.");
				}
				else {
					$scope.listData = (retData);
					$scope.listString = JSON.stringify($scope.listData);
					angular.element('#data_submit').prop('value', $scope.listString);
					angular.element('#el_date').prop('value', $scope.elDate);
					angular.element('#el_time').prop('value', $scope.elTime);
					angular.element('#p_form').prop('action', `eli_process.html?site=${$scope.site}&gl=${$scope.g_num}`)
					console.log("listData");
					//console.log($scope.listString)
					}
				}); // End getHd function