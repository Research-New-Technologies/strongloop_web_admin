angular.module('app')
    .run(function ($rootScope, WebAppConfig, $state, $q) {
        WebAppConfig.find(function (res) {
            $rootScope.webAppConfig = res[0];  
        })            

        $rootScope.popup = {};
        $rootScope.isAuthenticated = window.localStorage.getItem('IS_AUTHENTICATED');
        $rootScope.user = JSON.parse(window.localStorage.getItem('USER_DETAILS'));
        $rootScope.menu = {};
        if ($rootScope.user != null) {
            if ($rootScope.user.roleName == 'Admin') {
                $rootScope.isAdmin = true;
            }
            else {
                $rootScope.isAdmin = false;
            }
        }
        else {
            $rootScope.isAdmin = false;
        }



    });
    