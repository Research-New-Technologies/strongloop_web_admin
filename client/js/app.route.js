angular.module('app')
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider, $rootScope) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'modules/auth/views/login.html',
        controller: 'LoginController',
        controllerAs: 'vm'
      })
    //   .state('sign-up', {
    //     url: '/sign-up',
    //     templateUrl: 'modules/auth/views/sign-up.html',
    //     controller: 'SignUpController'
    //   })
      .state('forgot-password', {
        url: '/forgot-password',
        templateUrl: 'modules/auth/views/forgot-password.html',
        controller: 'ForgotPassowrdController',
        controllerAs: 'vm'
      })
      .state('reset-password', {
        url: '/reset-password?password&token&email&id',
        templateUrl: 'modules/auth/views/reset-password.html',
        controller: 'ResetPasswordController'
      })
      .state('user-account', {
        url: '/user-account',
        templateUrl: 'modules/user-account/views/user-account.html',
        controller: 'UserAccountController',
        controllerAs: 'vm',
        isAuthenticatedView:true
      })
      .state('edit-user-account', {
        url: '/edit-user-account',
        templateUrl: 'modules/user-account/views/edit-user-account.html',
        controller: 'EditUserAccountController',
        controllerAs: 'vm',
        isAuthenticatedView:true
      })
      .state('add-user-account', {
        url: '/add-user-account',
        templateUrl: 'modules/user-account/views/add-user-account.html',
        controller: 'AddUserAccountController',
        controllerAs: 'vm',
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
      })
       .state('upload-file', {
        url: '/upload-file',
        templateUrl: 'modules/upload-file/views/upload-file.html',
        controller: 'UploadFileController',
        isAuthenticatedView:true
      })
      .state('generate-report', {
        url: '/generate-report',
        templateUrl: 'modules/generate-report/views/generate-report.html',
        controller: 'GenerateReportController',
        isAuthenticatedView:true
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