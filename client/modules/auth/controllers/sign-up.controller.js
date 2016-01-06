angular.module('app')
    .controller('SignUpController', function ($scope, Member, $state, $rootScope, LoopBackAuth) {
        $scope.user = {};
        
        
        $scope.sign_up = function (user) {
            if($scope.signUpForm.$invalid || $scope.user.password != $scope.user.password_confirmation){
                $scope.signUpForm.email.$dirty = true;
                $scope.signUpForm.username.$dirty = true;
                $scope.signUpForm.password_confirmation.$dirty = true;
                $scope.signUpForm.password.$dirty = true;
                $scope.signUpForm.username.$dirty = true;
                $scope.signUpForm.first_name.$dirty = true;
            }
            else {
                  Member.create(user, function (user) {
                alert("We've sent an email confirmation to your email. Please check your email to confirm the registration proccess")
            //      Member.login(user, function (response) {
            //     $rootScope.is_authenticated = true;
            //     window.localStorage.setItem('EMAIL', user.email);
            //     window.localStorage.setItem('USER_NAME', user.username);
            //     window.localStorage.setItem('FIRST_NAME', user.first_name);
            //     window.localStorage.setItem('IS_AUTHENTICATED', true);
            //     window.localStorage.setItem('USER_ID', response.userId);
            //     window.localStorage.setItem('TOKEN', response.id);
            //     $state.go('dashboard');
            // })
                $state.go('login');
            }, function (error) {
                alert("Email or username has used by other user")
            });
            } 
        }
    })