angular.module('app')
    .controller('ForgotPassowrdController', function ($scope, User, $state, $rootScope, LoopBackAuth, $timeout, cfpLoadingBar) {
        $scope.email = "";
        $rootScope.isAdmin = true;
        $scope.resetPassword = function () {
            cfpLoadingBar.start()
            if (!$scope.forgotPasswordForm.email.$invalid) {
                User.resetPassword({ email: $scope.email }, function (response, headers) {
                    alert("Please check your email address to reset your password");
                    $state.go("login");
                    cfpLoadingBar.complete();
                }, function (response) {
                    cfpLoadingBar.complete();
                    alert(JSON.stringify(response.data.error.message));
                });
            }
            else {
                $scope.forgotPasswordForm.email.$dirty = true;
                cfpLoadingBar.complete();

            }

        }
    })