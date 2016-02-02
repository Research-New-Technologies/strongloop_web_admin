angular.module('app')
    .controller('MenuController', function ($scope, $state) {
        $scope.goToDashboard = function(){
            $state.go("dashboard");
        }
    });