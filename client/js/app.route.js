angular.module('app')
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider, $rootScope) {
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
    //   .state('sign-up', {
    //     url: '/sign-up',
    //     templateUrl: 'modules/auth/views/sign-up.html',
    //     controller: 'SignUpController'
    //   })
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
        controller: 'DashboardController',
        isAuthenticatedView:true
      })
      .state('order', {
        url: '/order',
        templateUrl: 'modules/order/views/order.html',
        controller: 'OrderController',
        isAuthenticatedView:true
      })
      .state('confirmation', {
        url: '/confirmation',
        templateUrl: 'modules/auth/views/confirmation.html',
        controller: 'ConfirmationController'
      })
      .state('member-confirm-error', {
        url: '/member-confirm-error',
        templateUrl: 'modules/auth/views/member-confirm-error.html',
        controller: 'ConfirmationController'
      })
      .state('member-confirm-email-verified', {
        url: '/member-confirm-email-verified',
        templateUrl: 'modules/auth/views/member-confirm-email-verified.html',
        controller: 'ConfirmationController'
      });

    $urlRouterProvider.otherwise('login');
  
    
  }])
  .run(function($rootScope, $state){
         
    $rootScope.$on("$stateChangeStart", function (event, next, next_state, prev, prev_state) {
        if(next.isAuthenticatedView){
            var token  = window.localStorage.getItem('TOKEN');
            if (!token){
                event.preventDefault();
                $state.go('login');
            }
        }
        else {
             window.localStorage.clear();
        }
    });
  });