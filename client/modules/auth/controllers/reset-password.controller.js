angular.module('app')
    .controller('ResetPasswordController', function ($scope, User, $state, $rootScope, LoopBackAuth, $stateParams, $http, cfpLoadingBar) {
        $http.defaults.headers.common['access_token'] = $stateParams.token;
        $scope.user = {};
        $rootScope.isAdmin = true; 
        $scope.save = function () {
            cfpLoadingBar.start();

            User.resetPassword({ email: $stateParams.email, password: $scope.user.password, password_confirmation: $scope.user.confirm_password, id: $stateParams.id }, function (response, headers) {
                alert("Password successfully changed, please login with the new password");
                $state.go("login");
                cfpLoadingBar.complete();
            }, function (response) {
                cfpLoadingBar.complete();
                alert(JSON.stringify(response.data.error.message));
            });
        }
    })