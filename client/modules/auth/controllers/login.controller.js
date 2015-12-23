angular.module('app')
    .controller('LoginController', function ($scope, User, $state, $rootScope, LoopBackAuth) {

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
        $scope.login = function (user) {
            User.login(user, function (response) {
                console.log(response)
                $rootScope.is_authenticated = true;
                window.localStorage.setItem('IS_AUTHENTICATED', true);
                window.localStorage.setItem('USER_ID', response.userId);
                window.localStorage.setItem('TOKEN', response.id);
                $scope.find_by_id(response.userId);
            })
        }

        // signout
        $scope.sign_out = function () {
            console.log(LoopBackAuth)
            var test = User.logout();
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