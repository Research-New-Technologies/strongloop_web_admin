angular.module('app')
    .controller('ResetPasswordController', function ($scope, User, $state, $stateParams, $http, cfpLoadingBar, CommonService, $rootScope) {
        $http.defaults.headers.common['accessToken'] = $stateParams.token;
        $scope.save = function () {
            cfpLoadingBar.start();
            if ($scope.vm.resetPasswordForm.$valid) {
                User.resetPassword({ email: $stateParams.email, password: $scope.vm.resetPassword.password, password_confirmation: $scope.vm.resetPassword.confirmPassword, id: $stateParams.id }, function (response, headers) {
                    CommonService.callPopup("Password successfully changed, please login with the new password").then(function (response) {
                        $state.go("login");
                        cfpLoadingBar.complete();
                    });
                }, function (response) {
                    CommonService.callPopup(response.data).then(function (response) {
                        cfpLoadingBar.complete();
                    });
                });
            }
            else {
                if ($scope.vm.resetPassword.password != $scope.vm.resetPassword.confirmPassword) {
                    CommonService.callPopup("password doesn't match").then(function (response) {
                        cfpLoadingBar.complete();
                    });
                }
                else {
                    CommonService.callPopup("please fill the required fields").then(function (response) {
                        cfpLoadingBar.complete();
                    });
                }
            }
        }
        
        //set the UI form
        var vm = this;
        vm.resetPassword = {};
        vm.resetPasswordFields = $rootScope.webAppConfig.formDefinition.resetPasswordFields;
    })