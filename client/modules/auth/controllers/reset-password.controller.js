angular.module('app')
    .controller('ResetPasswordController', function ($scope, User, $state, $rootScope, LoopBackAuth, $stateParams, $http) {
        $http.defaults.headers.common['access_token'] = $stateParams.token;
        $scope.user = {};

        User.prototype$__get__accessTokens({ "id": $stateParams.id }, function (response) {
            var result = response[0];
            if (result.id == $stateParams.token && result.ttl > 0) {
            }
            else {
                alert("token is invalid, please go to forgot password screen to retrieve a new token")
                $state.go("login")
            }

        })

        $scope.save = function () {

            if ($scope.user.password == $scope.user.confirm_password) {
                User.prototype$updateAttributes({ "id": $stateParams.id, "password": $scope.user.password, "email": $stateParams.email }, function (user) {
                    alert("Password is successfully changed, please login with the new password")
                    $state.go("login")
                }, function (error) {
                })
            }
            else {
                alert("password doesn't match")
            }

        }



    })