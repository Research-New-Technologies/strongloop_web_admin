angular.module('app')
    .controller('EditUserAccountController', function ($scope, $state, $rootScope, $window, $route, $timeout, $modal, User, $base64, Media) {
        $scope.profilePicture = null;
        
        //add user - add to web service
        $scope.editUser = function () {
            if ($scope.vm.editedUserForm.$invalid) {
                $scope.message = 'Please fill the required fields';
                $scope.openModal();
            }
            else {
                User.prototype$updateAttributes({ id: vm.editedUser.id, email: vm.editedUser.email, username: vm.editedUser.username, firstName: vm.editedUser.firstName, lastName: vm.editedUser.lastName }, function (response) {
                       if ($scope.isProfilePictureEdited) {
                        $scope.uploadImage(response);
                    }
                    else {
                        $scope.message = 'New user has been added';
                        $state.go('user-account');
                        $scope.openModal();
                    }                     
                        $scope.message = 'User has been edited';
                        $state.go('user-account');
                        $scope.openModal();
                },
                    function (response) {
                        $scope.message = response.data.error.message;
                        $scope.openModal();
                    })
            }
        }


        $scope.changePicture = function (event) {
            console.log(event.files)
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

                $state.go('user-account');
            });
        }
        
        
        //open modal function
        $scope.openModal = function () {
            $scope.modalInstance = $modal.open({
                templateUrl: 'modal.html',
                controller: 'EditUserAccountController',
                scope: $scope
            })
        }
        
        //when user click close modal button
        $scope.closeModal = function () {
            $scope.modalInstance.close();
        }

        //set the UI form
        var vm = this;
        vm.user = {};

        vm.editedUser = $rootScope.editedUser;
        console.log($rootScope.editedUser)
        $scope.profilePicture = $rootScope.editedUser.profilePicture;

        vm.editedUserFields = [
            {
                key: 'email',
                type: 'input',
                templateOptions: {
                    type: 'email',
                    label: 'Email address',
                    placeholder: 'Enter email',
                    required: true
                }
            },
            {
                key: 'username',
                type: 'input',
                templateOptions: {
                    type: 'text',
                    label: 'Username',
                    placeholder: 'Enter username',
                    required: true
                }
            },
            {
                key: 'firstName',
                type: 'input',
                templateOptions: {
                    type: 'text',
                    label: 'First Name',
                    placeholder: 'Enter first name'
                }
            },
            {
                key: 'lastName',
                type: 'input',
                templateOptions: {
                    type: 'text',
                    label: 'last Name',
                    placeholder: 'Enter last name'
                }
            }
        ];
    });