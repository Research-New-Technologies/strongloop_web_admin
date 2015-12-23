angular.module('app')
.run(function($http, $rootScope){
    
          $rootScope.is_authenticated = window.localStorage.getItem('IS_AUTHENTICATED');
          $rootScope.username  = window.localStorage.getItem('USER_NAME');
          
});
    