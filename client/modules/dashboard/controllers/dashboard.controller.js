angular.module('app')
    .controller('DashboardController', function ($scope, $state, $rootScope,$window, $route,Dashboard, $timeout, $modal, Member, Role) {
        $scope.users = {};
        $rootScope.isAdmin = true;
        $scope.getAllUser = function () {
            Dashboard.getAllUsers().then(function(response){
                $scope.users = response;
                   
            },function(response){
                console.log(response)
            })
            // $scope.users = [];
            // Member.find({ filter: { include: { relation: 'roleMappingMembers', scope: { include: { relation: 'role' } } } } }, function (response) {
            //     $scope.users = response;
            // }, function (err) {
            //     alert("please re-login to view dashboard");
            //     Member.logout();
            //     window.localStorage.clear();
            //     $rootScope.is_authenticated = false;
            //     $rootScope.username = "";
            //     $state.go("login")
            // });


        }
        $scope.getAllUser();

        $scope.delete = function (user) {
            $scope.selected_user = user;
            $scope.modal_title = "Delete User Confirmation";
            $scope.isDelete = true;

            $scope.openModal();
        }

        $scope.edit = function (user) {
            $scope.selected_user = user;
            $scope.modal_title = "Update User";
            $scope.isDelete = false;
            $scope.isAddUser = false;
            $scope.isUpdateUser = true;
            $scope.openModal();
        }

        $scope.add = function () {
            $scope.selected_user = {};
            $scope.modal_title = "Add a new User";
            $scope.isDelete = false;
            $scope.isAddUser = true;
            $scope.isUpdateUser = false;
            $scope.openModal();
        }

        $scope.addUser = function (user) {
            if ($scope.addUpdateForm.$invalid || user.password != user.password_confirmation) {
                $scope.addUpdateForm.email.$dirty = true;
                $scope.addUpdateForm.username.$dirty = true;
                $scope.addUpdateForm.password_confirmation.$dirty = true;
                $scope.addUpdateForm.password.$dirty = true;
                $scope.addUpdateForm.username.$dirty = true;
                $scope.addUpdateForm.first_name.$dirty = true;
            }
            else {
                var user_send_to_server = {};
                angular.copy(user, user_send_to_server)
                delete user_send_to_server.password_confirmation;
                Member.create(user_send_to_server, function (user) {
                    alert("Successfully add a new user");
                    $scope.getAllUser();
                    $scope.modalInstance.close();
                     $window.location.reload();
                }, function (response) {
                    alert(JSON.stringify(response.data.error.message))
                });
           
            }
        }

        $scope.deleteUser = function (user) {
            Member.destroyById({ id: user.id }, function (response) {
                $scope.users = [];
                alert("Successfully delete the user")
                $scope.modalInstance.close();
             
                $scope.getAllUser();
                $window.location.reload();
            }, function (response) {
                alert(JSON.stringify(response))
            })
        }

        $scope.updateUser = function (user) {
            Member.prototype$updateAttributes({ id: user.id, email: user.email, username: user.username, first_name: user.first_name, last_name: user.last_name }, function (response) {
                alert("Successfully update the user")
                $scope.modalInstance.close();
                $scope.getAllUser();
                $window.location.reload();
            },
                function (response) {
                    alert(JSON.stringify(response))
                })
        }

        $scope.openModal = function () {
            $scope.modalInstance = $modal.open({
                templateUrl: 'modal.html',
                controller: 'DashboardController',
                scope: $scope
            })
        }

        $scope.closeModal = function () {
            $scope.modalInstance.close();
        }


    })