angular.module('app')
    .controller('ForgotPassowrdController', function ($scope, User, $state, cfpLoadingBar, CommonService, $rootScope) {
        $scope.resetPassword = function () {
            cfpLoadingBar.start()
            if (!$scope.vm.forgotPasswordForm.$invalid) {
                User.resetPassword({ email: $scope.vm.forgotPassword.email }, function (response, headers) {
                    CommonService.callPopup("Please check your email address to reset your password").then(function (response) {
                        $state.go('login');
                        cfpLoadingBar.complete();
                    });

                }, function (response) {
                    CommonService.callPopup($scope.message = response.data.error.message).then(function (response) {
                        cfpLoadingBar.complete();
                    });
                });
            }
            else {
                CommonService.callPopup("please fill the required field").then(function (response) {
                    cfpLoadingBar.complete();
                });
            }
        }
        
        //set the UI form
        var vm = this;
        vm.forgotPassword = {};
        vm.forgotPasswordFields = $rootScope.webAppConfig.formDefinition.forgotPasswordFields;
    })