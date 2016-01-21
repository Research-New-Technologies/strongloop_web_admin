angular.module('app')
    .controller('SignUpController', function ($scope, Member, $state, $rootScope, LoopBackAuth) {
        $scope.user = {};
        $rootScope.isAdmin = true;
        
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
                var user_send_to_server = {};
                angular.copy(user, user_send_to_server)
                delete user_send_to_server.password_confirmation;
                  Member.create(user_send_to_server, function (user) {
                alert("We've sent an email confirmation to your email. Please check your email to confirm the registration proccess")
                
                $state.go('login');
            }, function (error) {
                alert("Email or username has used by other user"+JSON.stringify(error))
            });
            } 
        }
    })