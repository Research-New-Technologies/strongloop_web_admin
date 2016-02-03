angular.module('app')
    .controller('LoginController', function ($scope, User, $state, $rootScope, LoopBackAuth, cfpLoadingBar) {
        $scope.user = {};
        $rootScope.isAdmin = true;
        
        // login with email & password
        $scope.login = function () {
            cfpLoadingBar.start()
            if (!$scope.loginForm.email.$invalid && !$scope.loginForm.password.$invalid) {
                User.login($scope.user, function (response) {
                    for (var i = 0; i < response.user.roleName.length; i++) {
                        if (response.user.roleName[i].role.name == 'member') {
                            alert("You are not allowed to access this Web, please login using mobile Application")
                            window.localStorage.clear();
                            break;
                        }
                        else if (response.user.roleName[i].role.name == 'admin') {
                            $rootScope.isAuthenticated = true;
                            window.localStorage.setItem('IS_AUTHENTICATED', true);
                            window.localStorage.setItem('USER_ID', response.userId);
                            window.localStorage.setItem('TOKEN', response.id);
                            window.localStorage.setItem('USER_DETAILS', JSON.stringify(response.user));

                            $rootScope.user = response.user;
                            $state.go('dashboard');
                            break;
                        }
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
    })