angular.module('app')
    .controller('MenuController', function ($scope, $state) {
        $scope.goToUserAccount = function(){
            $state.go("user-account");
        }
        $scope.goToUpload = function(){
            $state.go("upload-file");
        }
        $scope.goToGenerateReport = function(){
            $state.go("generate-report");
        }
        
        
        
    });