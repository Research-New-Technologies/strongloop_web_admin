angular.module('app')
    .controller('MenuController', function ($rootScope, $scope, $state, $modal, CommonService) {
        $scope.goToUserAccount = function () {
            CommonService.setActiveMenu("user-account").then(function (res) { })
            $state.go("user-account");
        }
        $scope.goToUpload = function () {
            CommonService.setActiveMenu("upload-file").then(function (res) { })
            $state.go("upload-file");
        }
        $scope.goToGenerateReport = function () {
            CommonService.setActiveMenu("generate-report").then(function (res) { })
            $state.go("generate-report");
        }
 
        
        //open modal function
        $scope.openModal = function () {
            $rootScope.modalInstance = $modal.open({
                templateUrl: 'popup-message.html'
            })
        }
        
        //when user click close modal button
        $rootScope.closeModal = function () {
            $rootScope.modalInstance.close();
        }

        $rootScope.$watch('popup.isCalled', function (newValue, oldValue) {
            if (typeof (newValue) != 'undefined' && newValue == true) {
                $scope.openModal();
                $rootScope.popup.isCalled = false;
            }
        })


    });