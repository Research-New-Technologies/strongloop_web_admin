angular.module('app')
    .controller('UploadFileController', function ($scope, Project, CommonService, $modal, $rootScope) {
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
        
$scope.results = [];
        $scope.upload = function () {
            var file = {};
            file.data = $scope.file;
            Project.export(file, function (uploadResponse) {
                CommonService.callPopup("File has been successfully uploded").then(function (response) {
                    var project = uploadResponse.data;
                    project.forEach(function (element, index, array) {
                        var level = element.level;
                        level.forEach(function (levelElement, index, array) {
                            var zone = levelElement.zone;
                            zone.forEach(function (zoneElement, index, array) {
                               var project = {};
                               project.project = element.project;
                               project.level = levelElement.level;
                               project.zone = zoneElement.zone;
                               
                               $scope.results.push(project);

                            })
                        })
                    })
                    $scope.projects = uploadResponse.data;
                    $("#uploadFile").val('');

                });

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
            $rootScope.popup.instructionLinkText = 'link';
            $rootScope.popup.instructionLink = '/storages/file-uploads/New_project_upload.xlsx';
            $rootScope.popup.instructionMessage = "1. Create a blank spreadsheet.\n" +
            "2. On the blank sheet, fill cell A1 with 'project' ( without quotes) string , fill cell B1 with 'level' string &  fill cell C1 with 'zone' string.\n" +
            "3. Fill cell A1, B1, & C1 on Row 2 with appropriate strings to beyond as you like (e.g. Samsung Warehouse - 1 - 1.01 room name).\n" +
            "4. Save the spreadsheet.\n" +
            "5. Upload the spreadsheet file (.xlsx) through using this upload screen.\nor\n" +
            "Please download sample file from this";
            $scope.openModal();
        }
    });