angular.module('app')
    .controller('LoginController', function ($scope, User, $state, $rootScope, LoopBackAuth, cfpLoadingBar, $modal) {
        $rootScope.isAdmin = true;
        
        // login with email & password
        $scope.login = function () {
            cfpLoadingBar.start()
            if (!$scope.vm.userForm.$invalid) {
                User.login($scope.vm.user, function (response) {
                    for (var i = 0; i < response.user.roleName.length; i++) {
                        if (response.user.roleName == 'member') {
                            alert("You are not allowed to access this Web, please login using mobile Application")
                            window.localStorage.clear();
                
                        }
                        else if (response.user.roleName == 'admin') {
                            $rootScope.isAuthenticated = true;
                            window.localStorage.setItem('IS_AUTHENTICATED', true);
                            window.localStorage.setItem('USER_ID', response.userId);
                            window.localStorage.setItem('TOKEN', response.id);
                            window.localStorage.setItem('USER_DETAILS', JSON.stringify(response.user));
                            $rootScope.user = response.user;
                            $state.go('user-account');
                            break;
                        }
                    }
                    cfpLoadingBar.complete()
                }, function (response) {
                    $scope.message = response.data.error.message;
                    cfpLoadingBar.complete()
                    $scope.openModal();
                })
            }
            else {
                if (!$scope.vm.userForm.formly_1_input_email_0.$dirty) {
                    $scope.vm.userForm.formly_1_input_email_0.$dirty = true;
                }
                if (!$scope.vm.userForm.formly_1_input_password_1.$dirty) {
                    $scope.vm.userForm.formly_1_input_password_1.$dirty = true;
                }
                $scope.message = "please fill the required fields";
                $scope.openModal();
                cfpLoadingBar.complete()
            }
        }
   
        // signout
        $scope.signOut = function () {
            User.logout();
            window.localStorage.clear();
            $rootScope.isAuthenticated = false;
            $state.go("login")
        }
        
        // go to sign up screen
        $scope.signUp = function () {
            $state.go("sign-up");
        }

        // 
        $scope.forgotPassword = function () {
            $state.go("forgot-password");
        }

        //open modal function
        $scope.openModal = function () {
            $scope.modalInstance = $modal.open({
                templateUrl: 'modal.html',
                controller: 'LoginController',
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
        
        vm.userFields = [
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
                key: 'password',
                type: 'input',
                templateOptions: {
                    type: 'password',
                    label: 'Password',
                    placeholder: 'Password',
                    required: true
                }
            }
        ];
    })