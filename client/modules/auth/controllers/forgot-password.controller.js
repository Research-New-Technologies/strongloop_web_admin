angular.module('app')
    .controller('ForgotPassowrdController', function ($scope, User, $state, $rootScope, LoopBackAuth, $timeout) {
        $scope.user = {};
        $scope.reset_password = function () {
            User.resetPassword({ email: $scope.email }, function (response, headers) {
                alert("Please check your email address to reset your password");
                $state.go("login");
            }, function (error) {
                console.log(error);
            });
        }
    })