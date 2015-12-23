angular.module('app')
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('employee', {
        url: '/employee',
        templateUrl: 'modules/employee/views/employee.html',
        controller: 'EmployeeController'
      })
      .state('login', {
        url: '/login',
        templateUrl: 'modules/auth/views/login.html',
        controller: 'LoginController'
      })
      .state('sign-up', {
        url: '/sign-up',
        templateUrl: 'modules/auth/views/sign-up.html',
        controller: 'SignUpController'
      })
      .state('forgot-password', {
        url: '/forgot-password',
        templateUrl: 'modules/auth/views/forgot-password.html',
        controller: 'ForgotPassowrdController'
      })
      .state('reset-password', {
        url: '/reset-password?password&token&email&id',
        templateUrl: 'modules/auth/views/reset-password.html',
        controller: 'ResetPasswordController'
      })
      .state('dashboard', {
        url: '/dashboard',
        templateUrl: 'modules/dashboard/views/dashboard.html',
        controller: 'DashboardController'
      });

    $urlRouterProvider.otherwise('login');
  }]);