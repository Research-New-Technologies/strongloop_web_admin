angular.module('app')
    .controller('AddUserAccountController', function ($scope, $state, $rootScope, $window, $route, $timeout, $modal, User, $base64, Media, CommonService) {

        $scope.profilePicture = null;
        
        //add user - add to web service
        $scope.addUser = function () {
            if ($scope.vm.addUserForm.$invalid) {
                $scope.vm.addUserForm.formly_1_input_email_0.$dirty = true;
                $scope.vm.addUserForm.formly_1_input_username_1.$dirty = true;
                $scope.vm.addUserForm.formly_1_input_confirmPassword_3.$dirty = true;
                $scope.vm.addUserForm.formly_1_input_password_2.$dirty = true;
                $scope.message = 'Please fill the required fields';
                $scope.openModal();
            }
            else {
                User.create(vm.addedUser, function (user) {
                    if ($scope.profilePicture != null) {
                        $scope.uploadImage(user);
                    }
                    else {
                        CommonService.callPopup('New user has been added').then(function (response) {
                            $state.go('user-account');
                        });
                    }

                }, function (response) {
                    CommonService.callPopup(response.data.error.message).then(function (response) {
                    });
                });

            }
        }
        
        $scope.cancel = function(){
            $state.go('user-account');
        }

        $scope.changePicture = function (event) {
            var profilePicture = event.files[0];
            var reader = new FileReader();
            reader.onload = function (e) {
                $scope.profilePicture = e.target.result;
                $scope.$apply();
            };
            reader.readAsDataURL(profilePicture);
        }

        $scope.uploadImage = function (user) {
            var media = {};
            media.isProfilePicture = true;
            media.userId = user.id;
            media.data = $scope.profilePicture;
            Media.create(media, function (mediaResponse) {
                CommonService.callPopup('New user has been added').then(function (response) {
                    $state.go('user-account');
                });
            });
        }

        //set the UI form
        var vm = this;
        vm.user = {};
        vm.addedUser = {};
        vm.addUserFields = $rootScope.webAppConfig.formDefinition.addUserFields;
    });