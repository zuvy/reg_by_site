# PowerSchool Plugin Development Guide

This is a **PowerSchool plugin** for Tulsa Public Schools' registration management system. The plugin extends PowerSchool's SIS platform with custom registration reporting functionality.

## Architecture Overview

### PowerSchool Plugin Structure
- `plugin.xml` - Core plugin manifest defining metadata and installation settings
- `web_root/` - Contains all web-accessible files served by PowerSchool
- Plugin follows PowerSchool's specific conventions for admin pages and custom modules

### Frontend Architecture (AMD + AngularJS 1.x)
Uses **AMD module system** with RequireJS for dependency management. PowerSchool provides the `powerSchoolModule` as a base dependency:
```javascript
// Standard PowerSchool module pattern
require(['angular','components/shared/index'], function (angular) {
    let myApp = angular.module('demoApp', ['powerSchoolModule']);
    myApp.controller('demoAppCtrl', function($scope) {
        // Application logic here
    });
});
```

### HTML Bootstrap Pattern
Pages use `data-` attributes to wire Angular applications:
```html
<div data-require-path="components/shared/index"
     data-module-name="myApp" 
     data-bootstrap-local="true"
     ng-controller="demoAppCtrl">
```

### Component Organization
```
scripts/components/registration_count/
├── index.js           # Main module entry point
├── module.js          # Angular module definition
├── controllers/       # Angular controllers
│   ├── index.js       # Controller aggregator
│   └── elemctrl.js    # Elementary registration controller
└── directives/        # Services and factories
    ├── index.js       # Directive aggregator
    └── elem_data.js   # Data service factory
```

## PowerSchool-Specific Patterns

### Template Integration
HTML files use PowerSchool template syntax:
- `~[wc:commonscripts]` - Includes PowerSchool common scripts
- `~[wc:admin_header_css]` - Admin interface styling
- `~(gpv.site)` and `~(gpv.gl)` - PowerSchool global variables for site/grade level

### PSHTML Template System
PowerSchool uses PSHTML (PowerSchool HTML) for server-side processing. PSHTML tags use `~` with parentheses `~(tag)` or brackets `~[tag]`.

**Core PSHTML Tags**
```html
<!-- Context Variables -->
~(curstudid)     <!-- Current Student ID -->
~(curschoolid)   <!-- Current School ID -->
~(schoolname)    <!-- School Name -->
~(curyearid)     <!-- Current Year ID -->
~(curtermid)     <!-- Current Term ID -->

<!-- Date/Time -->
~[time]          <!-- Current Time: 12:02 PM -->
~[short.date]    <!-- Current Date: 10/12/2025 -->

<!-- User Information -->
~[x:username]    <!-- Current User: LASTNAME, FIRSTNAME -->
~[x:userid]      <!-- Current User ID -->

<!-- Parameters & Data -->
~(gpv.parameter) <!-- Get URL/POST parameter -->
~(frn)          <!-- Current record identifier -->
~(rn)           <!-- Current record dcid -->
```

**Parameter Access (GPV)**
```html
<!-- URL: mypage.html?grade=12&gender=F -->
~(gpv.grade)    <!-- Returns: 12 -->
~(gpv.gender)   <!-- Returns: F -->
```

**Template List SQL (tlist_sql)**
Three-part structure: tags, query, and row template:
```html
~[tlist_sql;
    SELECT name, school_number, principal 
    FROM schools 
    WHERE grade_level = ~(gpv.grade)
    ORDER BY name;]
    <tr>
        <td>~(name)</td>
        <td>~(school_number)</td>
        <td>~(principal)</td>
    </tr>
[/tlist_sql]
```

**Conditional Logic (IF tags)**
```html
~[if.~(gpv.gender)=M]
    Male Student Report
[else]
    Female Student Report
[/if]

~[if#nested.district.office]
    District Level Content
[else#nested]
    School Level Content
[/if#nested]
```

**Wildcards & Includes**
```html
~[wc:commonscripts]        <!-- Include wildcard file -->
~[x:insertfile;file.html]  <!-- Insert external file -->
~[text:string_key_name]    <!-- Localization text -->
```

### Data Access Patterns

**1. AJAX calls to PSHTML templates**
```javascript
$http({
    "url": "studentCount.html",
    "method": "GET", 
    "params": {"grade": $scope.grade_level}
}).then(function(response) {
    $scope.gradeCount = response.data;
});
```

**2. PowerQuery Web Services** 
```javascript
// Using pqService for PowerQuery execution
pqService.getPQResults('queryName', {param1: value}).then(function(data) {
    $scope.results = data;
});
```

### Navigation Integration
`pagecataloging/reg_nav.json` registers pages in PowerSchool's admin navigation menu.

## Development Patterns

### Module Structure
- Main module: `regAppModule` depends on `customizationModule` 
- Use `powerSchoolModule` as base dependency for PowerSchool integration
- **Note**: Current codebase has inconsistency - `elemctrl.js` references `components/eligibility/module` instead of local module

### Controller Pattern
```javascript
// Standard PowerSchool controller with dependency injection
myApp.controller('demoAppCtrl', function($scope, $http, customService) {
    $scope.property = 'value';
    
    $scope.method = function() {
        // Controller logic
    };
});
```

### Service Creation
```javascript
// Custom service pattern
define(['angular'], function(angular) {
    let myApp = angular.module('serviceModule', []);
    myApp.service('customService', function() {
        this.method = function(param) {
            // Service logic
        };
    });
});
```

## Key Integration Points

### PowerSchool Context Variables
- Access current school site via `ng-site="~(gpv.site)"`
- Grade level context via `ng-gl="~(gpv.gl)"`
- Form actions dynamically set: `eli_process.html?site=${$scope.site}&gl=${$scope.g_num}`

### Data Binding and Directives
Standard AngularJS directives work within PowerSchool:
- `ng-model` - Two-way data binding with form inputs
- `ng-repeat` - Loop through arrays/objects
- `ng-show/ng-hide/ng-if` - Conditional display
- `ng-click/ng-change` - Event handlers
- `{{expression}}` or `ng-bind` - Display data

### Multi-Level Navigation
Three-tier structure: Elementary → Secondary → Alternative school registration reports, each with consistent tab-based navigation.

## Common Development Tasks

### Adding New Registration Types
1. Create controller in `controllers/` following `elemctrl.js` pattern
2. Add data service in `directives/` following `elem_data.js` pattern  
3. Create HTML report in `admin/reports/registration/`
4. Wire components in respective `index.js` files

### Working with PowerSchool Data

**PSHTML Development Patterns**
- Develop SQL in external tools (SQL Developer) first, then paste into PSHTML
- Use `~[tlist_sql;...]` for repeating data (tables, select options, etc.)
- Column references `~(column_name)` must match query column order exactly
- Current student selection: `WHERE dcid IN (SELECT dcid FROM ~[temp.table.current.selection:students])`
- **FRN Navigation**: Links use `frn` for record context: `page.html?frn=001332` (table 001, dcid 332)

**Data File Patterns**
- `.json` files contain PSHTML with tlist_sql generating JSON arrays
- `.html` files contain PSHTML returning raw data or HTML fragments  
- PowerQuery endpoint: `/ws/schema/query/` for complex operations
- Grade levels: -1=PreK, 0=K, 1-12=Grades 1-12

**PSHTML Security & Limitations**
- **Security**: Field-level security NOT enforced - restrict page permissions for sensitive data
- **Recommended**: Use PowerQuery instead of tlist_sql when possible
- IF tags don't work within tlist_sql results
- No error messages for bad SQL - check System Logs for tlist_sql errors
- Debug tip: Add `.htmlr` extension to view unprocessed PSHTML

### HTTP Service Pattern
```javascript
// Standard PowerSchool AJAX pattern
$http({
    "url": "dataEndpoint.json",
    "method": "GET|POST", 
    "params": {param1: value},  // GET parameters
    "data": {data1: value}      // POST data
}).then(function(response) {
    $scope.data = response.data;
});
```

### Filters and Data Transformation  
Use AngularJS filters for data display:
- `{{value | currency}}` - Format as currency
- `{{value | date:'MM/dd/yyyy'}}` - Format dates
- `{{array | orderBy:'field'}}` - Sort arrays
- `{{array | filter:searchTerm}}` - Filter arrays

### PSHTML Examples from This Codebase

**JSON Data Generation (`elem_reg.json`)**
```json
[
    ~[tlist_sql;
        SELECT 
            CASE WHEN GROUPING(sch.School_Number)=1 THEN 'ALL SCHOOLS' ELSE sch.Name END AS school_name,
            COUNT(DISTINCT s.ID) AS total_students
        FROM CC JOIN Students s ON s.ID = cc.StudentID
        WHERE cc.TermId = 3500 AND s.Enroll_Status = 0
        GROUP BY GROUPING SETS ( (sch.School_Number, sch.Name), () );]
    {
        "school_name": "~(school_name)",
        "total_students": "~(total_students)"
    },
[/tlist_sql]
{}]
```

**Template Integration (`elem_reg.html`)**
- Uses `ng-site="~(gpv.site)"` to pass PowerSchool context to Angular
- Breadcrumb navigation with PowerSchool template structure
- Tab-based navigation linking to `sec_reg.html`, `alt_reg.html`

### Module References
**Current Issue**: `elemctrl.js` references `components/eligibility/module` instead of `components/registration_count/module` - this should be fixed for consistency.