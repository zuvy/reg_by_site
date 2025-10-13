'use strict';
define(function(require) {
    // Load the module definition first
    var module = require('components/registration_count/module');
    
    // Load all components - order matters for dependencies
    require('components/registration_count/controllers/index');
    require('components/registration_count/services/index');
    
    // Return the module for PowerSchool's automatic bootstrapping
    return module;
});