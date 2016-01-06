angular.module('app')
    .controller('ForgotPassowrdController', function ($scope, Member, $state, $rootScope, LoopBackAuth, $timeout, cfpLoadingBar) {
        $scope.email = "";
        $scope.reset_password = function () {
            cfpLoadingBar.start()
            if (!$scope.forgotPasswordForm.email.$invalid) {

                Member.resetPassword({ email: $scope.email }, function (response, headers) {
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