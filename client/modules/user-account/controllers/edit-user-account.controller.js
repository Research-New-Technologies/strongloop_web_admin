angular.module('app')
    .controller('EditUserAccountController', function ($scope, $state, $rootScope, $window, $route, $timeout, $modal, User, $base64, Media, CommonService) {

        if (typeof ($rootScope.editedUser) == 'undefined') {
            $state.go('user-account');
        }
        else {
            $scope.profilePicture = null;
       
            //add user - add to web service
            $scope.editUser = function () {
                if ($scope.vm.editUserForm.$invalid) {
                    CommonService.callPopup('Please fill the required fields').then(function (response) {
                    });
                }
                else {
                    User.prototype$updateAttributes({ id: vm.editedUser.id, email: vm.editedUser.email, username: vm.editedUser.username, firstName: vm.editedUser.firstName, lastName: vm.editedUser.lastName }, function (editedUserResponse) {
                        if ($scope.isProfilePictureEdited) {
                            $scope.uploadImage(editedUserResponse);
                        }
                        else {
                            if (editedUserResponse.id == $rootScope.user.id) {
                                CommonService.setUser(editedUserResponse.id, $rootScope.user.id, editedUserResponse).then(function (response) {
                                    CommonService.callPopup('The user has been updated').then(function (response) {
                                        $state.go('user-account');
                                    });
                                });
                            }
                            else {
                                CommonService.callPopup('The user has been updated').then(function (response) {
                                    $state.go('user-account');
                                });
                            }

                        }
                    },
                        function (response) {
                            CommonService.callPopup(response.data.error.message).then(function (response) {
                            });
                        })
                }
            }

            $scope.cancel = function () {
                $state.go('user-account');
            }


            $scope.changePicture = function (event) {
                var profilePicture = event.files[0];
                var reader = new FileReader();
                reader.onload = function (e) {
                    $scope.profilePicture = e.target.result;
                    $scope.isProfilePictureEdited = true;
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
                    if (user.id == $rootScope.user.id) {
                        User.findById({ id: user.id }, function (userResult) {
                            CommonService.setUser(userResult.id, $rootScope.user.id, userResult).then(function (response) {
                                CommonService.callPopup('The user has been updated').then(function (response) {
                                    $state.go('user-account');
                                });
                            });
                        })

                    }
                    else {
                        CommonService.callPopup('The user has been updated').then(function (response) {
                            $state.go('user-account');
                        });
                    }
                });
            }

            //set the UI form
            var vm = this;
            vm.user = {};

            vm.editedUser = $rootScope.editedUser;
            $scope.profilePicture = $rootScope.editedUser.profilePicture;
            vm.editUserFields = $rootScope.webAppConfig.formDefinition.editUserFields;
        }
    });