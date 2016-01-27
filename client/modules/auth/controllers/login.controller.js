angular.module('app')
    .controller('LoginController', function ($scope, User, $state, $rootScope, LoopBackAuth, cfpLoadingBar) {
        $scope.user = {};
        $rootScope.isAdmin = true;
        // find by id
        $scope.find_by_id = function (id) {
            User.findById({ id: id }, function (user) {
                window.localStorage.setItem('EMAIL', user.email);
                window.localStorage.setItem('USER_NAME', user.username);
                window.localStorage.setItem('FIRST_NAME', user.first_name);
                $rootScope.username = window.localStorage.getItem('USER_NAME');
                $state.go('dashboard');
            }, function (error) {
            });
        }
        
        // login with email & password
        $scope.login = function () {
            cfpLoadingBar.start()
            if (!$scope.loginForm.email.$invalid && !$scope.loginForm.password.$invalid) {
                User.login($scope.user, function (response) {
                    if(response.role_name == 'member'){
                        alert("You are not allowed to access this Web, please login using mobile Application")
                        window.localStorage.clear();
                    }
                    else {
                        $rootScope.is_authenticated = true;
                        window.localStorage.setItem('IS_AUTHENTICATED', true);
                        window.localStorage.setItem('USER_ID', response.userId);
                        window.localStorage.setItem('TOKEN', response.id);
                        $scope.find_by_id(response.userId); 
                    }
                    cfpLoadingBar.complete()
                    
                }, function (response) {
                    cfpLoadingBar.complete()
                    alert(response.data.error.message)
                })
            }
            else {
                if (!$scope.loginForm.email.$dirty) {
                    $scope.loginForm.email.$dirty = true;
                }
                if (!$scope.loginForm.password.$dirty) {
                    $scope.loginForm.password.$dirty = true;
                }
                cfpLoadingBar.complete()
            }
        }

        // signout
        $scope.sign_out = function () {
            User.logout();
            window.localStorage.clear();
            $rootScope.is_authenticated = false;
            $rootScope.username = "";
            $state.go("login")
        }
        
        // go to sign up screen
        $scope.sign_up = function () {
            $state.go("sign-up");
        }

        // 
        $scope.forgot_password = function () {
            $state.go("forgot-password");
        }
    })