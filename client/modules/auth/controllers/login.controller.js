angular.module('app')
    .controller('LoginController', function ($scope, User, $state, cfpLoadingBar, CommonService, $rootScope, $route) { 
        // login with email & password
        $scope.login = function () {

            if (!$scope.vm.loginForm.$invalid) {
                User.login($scope.vm.login, function (response) {
                    for (var i = 0; i < response.user.roleName.length; i++) {
                        if (response.user.roleName == 'member') {
                            CommonService.logout().then(function (response) {
                                User.logout();
                                CommonService.callPopup("You are not allowed to access this Web, please login using mobile Application").then(function (response) {
                                    cfpLoadingBar.complete()
                                });
                            })
                        }
                        else if (response.user.roleName == 'admin') {
                            CommonService.setUser(response.userId, response.id, response.user).then(function (response) {
                                $state.go('user-account');
                                cfpLoadingBar.complete()
                            });
                            break;
                        }
                    }
                }, function (response) {
                    CommonService.callPopup(response.data.error.message).then(function (response) {
                        cfpLoadingBar.complete();
                    });
                })
            }
            else {
                if (!$scope.vm.loginForm.formly_1_input_email_0.$dirty) {
                    $scope.vm.loginForm.formly_1_input_email_0.$dirty = true;
                }
                if (!$scope.vm.loginForm.formly_1_input_password_1.$dirty) {
                    $scope.vm.loginForm.formly_1_input_password_1.$dirty = true;
                }
                CommonService.callPopup("please fill the required fields").then(function (response) {
                    cfpLoadingBar.complete();
                });
            }
        }
   
        // signout
        $scope.signOut = function () {
            CommonService.logout().then(function (response) {
                User.logout();
            })
        }
        
        // go to sign up screen
        $scope.signUp = function () {
            $state.go("sign-up");
        }

        // 
        $scope.forgotPassword = function () {
            $state.go("forgot-password");
        }

        //set the UI form
        var vm = this;
        vm.login = {};
        if (typeof ($rootScope.webAppConfig) != 'undefined') {
            vm.loginFields = $rootScope.webAppConfig.formDefinition.loginFields;
        }
    })