angular.module('app')
    .controller('UploadFileController', function ($scope, Location, $sce) {

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
            console.log($scope.file)
            Location.export(file, function (uploadResponse) {
                alert("File has been successfully uploded");
                $scope.locations = uploadResponse.data;
            });
        }
    });