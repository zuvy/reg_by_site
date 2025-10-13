'use strict';
define(function(require) {
    var module = require('components/registration_count/module');
    
    // Simple test controller
    module.controller('testCtrl', ['$scope', function($scope) {
        console.log('Test controller loaded successfully!');
        $scope.testMessage = 'Angular is working!';
        $scope.currentTime = new Date().toLocaleString();
    }]);
});