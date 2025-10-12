define(function(require)
{'use strict';
    var angular = require('angular');
    require('components/customization/customizationModule')
    return angular.module('regAppModule', ['customizationModule']);
});