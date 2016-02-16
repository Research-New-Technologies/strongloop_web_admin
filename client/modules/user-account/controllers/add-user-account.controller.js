angular.module('app')
    .controller('AddUserAccountController', function ($scope, $state, $rootScope, $window, $route, $timeout, $modal, User, $base64, Media) {
  
        $scope.profilePicture = null;
        
        //add user - add to web service
        $scope.addUser = function () {
            if ($scope.vm.addedUserForm.$invalid) {
                $scope.vm.addedUserForm.formly_1_input_email_0.$dirty = true;
                $scope.vm.addedUserForm.formly_1_input_username_1.$dirty = true;
                $scope.vm.addedUserForm.formly_1_input_confirmPassword_3.$dirty = true;
                $scope.vm.addedUserForm.formly_1_input_password_2.$dirty = true;
                $scope.message = 'Please fill the required fields';
                $scope.openModal();
            }
            else {
                User.create(vm.addedUser, function (user) {
                    if ($scope.profilePicture != null) {
                        $scope.uploadImage(user);
                    }
                    else {
                        $scope.message = 'New user has been added';
                        $state.go('user-account');
                        $scope.openModal();
                    }

                }, function (response) {
                    $scope.message = response.data.error.message;
                    $scope.openModal();
                });

            }
        }


        $scope.changePicture = function (event) {
            console.log(event.files)
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
                $scope.message = 'New user has been added';
                $scope.openModal();
                $state.go('user-account');
            });
        }
        
        
        //open modal function
        $scope.openModal = function () {
            $scope.modalInstance = $modal.open({
                templateUrl: 'modal.html',
                controller: 'AddUserAccountController',
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
        vm.addedUser = {};
        vm.addedUserFields = [
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
                key: 'password',
                type: 'input',
                templateOptions: {
                    type: 'password',
                    label: 'Password',
                    placeholder: 'Enter password',
                    required: true
                }
            },
            {
                key: 'confirmPassword',
                type: 'input',
                templateOptions: {
                    type: 'password',
                    label: 'Confirm Password',
                    placeholder: 'Enter password again',
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