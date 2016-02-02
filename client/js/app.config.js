angular.module('app')
    .run(function ($http, $rootScope) {
        $rootScope.isAuthenticated = window.localStorage.getItem('IS_AUTHENTICATED');
        $rootScope.user = JSON.parse(window.localStorage.getItem('USER_DETAILS'));
    });
    