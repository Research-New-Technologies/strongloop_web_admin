angular.module('app')
    .controller('SignUpController', function ($scope, User, $state, $rootScope, LoopBackAuth) {
        $scope.user = {};
        $scope.sign_up = function (user) {
            User.create(user, function (user) {
                $state.go('login');
            }, function (error) {
                alert("Email or username has used by other user")
            });
        }
    })