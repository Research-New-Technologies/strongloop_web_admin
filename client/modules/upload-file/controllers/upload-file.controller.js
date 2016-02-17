angular.module('app')
    .controller('UploadFileController', function ($scope, Location, CommonService, $modal, $rootScope) {
        CommonService.setActiveMenu("upload-file").then(function (res) { })
        $scope.uploadFile = function (event) {
            var file = event.files[0];
            var reader = new FileReader();
            reader.onload = function (e) {
                $scope.prev_img = e.target.result;
                $scope.file = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        $scope.upload = function () {
            var file = {};
            file.data = $scope.file;
            Location.export(file, function (uploadResponse) {
                CommonService.callPopup("File has been successfully uploded").then(function (response) {
                });
                $scope.locations = uploadResponse.data;
            }, function (errorResponse) {
                CommonService.callPopup(errorResponse.data.error.message).then(function (response) {
                });
            });
        }
        
        //open modal function
        $scope.openModal = function () {
            $rootScope.modalInstance = $modal.open({
                templateUrl: 'popup-instruction-message.html'
            })
        }

        $scope.goToInstruction = function () {
            $rootScope.popup.instructionMessage = "1. Create a blank spreadsheet.\n"+
            "2. On the blank sheet, fill cell A1 with 'location' ( without quotes) string & fill cell A2 with 'project' string.\n"+
            "3. Fill cell A1 & A2 on Row 2 with appropriate strings to beyond as you like (e.g. Brisbane - Samsung's Warehouse).\n"+
            "4. Save the spreadsheet.\n"+
            "5. Upload the spreadsheet file (.xlsx) through using this upload screen.";
            $scope.openModal();
        }
    });