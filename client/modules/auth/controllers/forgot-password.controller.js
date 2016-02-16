angular.module('app')
    .controller('ForgotPassowrdController', function ($scope, User, $state, $rootScope, LoopBackAuth, $timeout, cfpLoadingBar, $modal) {
        $scope.email = "";
        $rootScope.isAdmin = true;
        $scope.resetPassword = function () {
            cfpLoadingBar.start()
            if (!$scope.vm.forgotPasswordForm.$invalid) {
                User.resetPassword({ email: $scope.vm.forgotPassword.email }, function (response, headers) {
                    $scope.message = "Please check your email address to reset your password";
                    $scope.openModal();
                    cfpLoadingBar.complete();
                }, function (response) {
                    cfpLoadingBar.complete();
                    $scope.message = response.data.error.message;
                    $scope.openModal();
                });
            }
            else {
                $scope.vm.forgotPasswordForm.formly_1_input_email_0.$dirty = true;
                $scope.message = 'please fill the required field';
                $scope.openModal();
                cfpLoadingBar.complete();
            }
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
        vm.forgotPassword = {};

        vm.forgotPasswordFields = [
            {
                key: 'email',
                type: 'input',
                templateOptions: {
                    type: 'email',
                    label: 'Email address',
                    placeholder: 'Enter email',
                    required: true

                }
            }
        ];
    })