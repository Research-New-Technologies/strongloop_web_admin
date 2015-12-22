angular.module('app')
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('employee', {
        url: '',
        templateUrl: 'modules/employee/views/employee.html',
        controller: 'EmployeeController'
      });

    $urlRouterProvider.otherwise('employee');
  }]);