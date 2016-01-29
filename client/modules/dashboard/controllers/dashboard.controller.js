angular.module('app')
    .controller('DashboardController', function ($scope, $state, $rootScope, $window, $route, $timeout, $modal, User) {
        $scope.users = {};
        $rootScope.isAdmin = true;
        $scope.limit = 10;
        $scope.skip = 1;
        $scope.key = 'id';
        $scope.SortAsc = true;
        $scope.userCount = 0;
        
        //get users with order by and also "DESC or ASC"
        $scope.getUsersWithSortAndPage = function (orderBy, type) {
            //calculate how many users that will be skiped
            var skip = ($scope.skip - 1) * $scope.limit;
            
            //call Web service to find User with filter parameters
            User.find({ filter: { limit: $scope.limit, skip: skip, order: orderBy + ' ' + type } }, function (response) {
                $scope.users = response;
                
                //get total users in database
                User.count(function (count) {
                    $scope.userCount = count.count;
                    if (count.count <= $scope.limit * $scope.skip) {
                        $scope.lastPage = true;
                    }
                    else {
                        $scope.lastPage = false;
                    }
                })
            }, function (err) {
                alert(JSON.stringify(err))
            })
        }
        
        //run this command when user open dashboard 
        $scope.getUsersWithSortAndPage('roleId', 'ASC');
        
        //delete user - open delete confirmation modal
        $scope.delete = function (user) {
            $scope.selected_user = user;
            $scope.modal_title = "Delete User Confirmation";
            $scope.isDelete = true;
            $scope.openModal();
        }
        
        //edit user - open edit user modal
        $scope.edit = function (user) {
            $scope.selected_user = user;
            $scope.modal_title = "Update User";
            $scope.isDelete = false;
            $scope.isAddUser = false;
            $scope.isUpdateUser = true;
            $scope.openModal();
        }
        
        //add user - open add user modal
        $scope.add = function () {
            $scope.selected_user = {};
            $scope.modal_title = "Add a new User";
            $scope.isDelete = false;
            $scope.isAddUser = true;
            $scope.isUpdateUser = false;
            $scope.openModal();
        }
        
        //add user - add to web service
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
                User.create(user_send_to_server, function (user) {
                    alert("Successfully add a new user");
                    $scope.getAllUsers();
                    $scope.modalInstance.close();
                    $window.location.reload();
                }, function (response) {
                    alert(JSON.stringify(response.data.error.message))
                });

            }
        }
        
        //delete user - delete to web service
        $scope.deleteUser = function (user) {
            User.destroyById({ id: user.id }, function (response) {
                $scope.users = [];
                alert("Successfully delete the user")
                $scope.modalInstance.close();
                $scope.getAllUsers();
                $window.location.reload();
            }, function (response) {
                alert(JSON.stringify(response))
            })
        }
        
        //edit user - update to web service
        $scope.updateUser = function (user) {
            User.prototype$updateAttributes({ id: user.id, email: user.email, username: user.username, first_name: user.first_name, last_name: user.last_name }, function (response) {
                alert("Successfully update the user")
                $scope.modalInstance.close();
                $scope.getAllUsers();
                $window.location.reload();
            },
                function (response) {
                    alert(JSON.stringify(response))
                })
        }
        
        //open modal function
        $scope.openModal = function () {
            $scope.modalInstance = $modal.open({
                templateUrl: 'modal.html',
                controller: 'DashboardController',
                scope: $scope
            })
        }
        
        //when user click close modal button
        $scope.closeModal = function () {
            $scope.modalInstance.close();
        }
        
        //call get users with parameters
        $scope.getAllUsers = function () {
            if ($scope.SortAsc) {
                $scope.getUsersWithSortAndPage($scope.key, 'ASC');
            }
            else {
                $scope.getUsersWithSortAndPage($scope.key, 'DESC');
            }
        }
        
        
        //pagination - go to desired page
        $scope.goToPage = function () {
            if ($scope.skip <= 0) {
                alert("Please input valid page")
            }
            else {
                if ($scope.skip == 1) {
                    $scope.getAllUsers();
                }
                else {
                    if ((($scope.skip - 1) * $scope.limit) < $scope.count) {
                        $scope.getAllUsers();
                    }
                    else {
                        $scope.users = [];
                    }
                }
            }
        }
        
        //pagination - go to previous page
        $scope.goToPrev = function () {
            if ($scope.skip > 1) {
                $scope.skip--;
                $scope.getAllUsers();
            }
        }
        
        //pagination - go to next page
        $scope.goToNext = function () {
            if (!$scope.lastPage) {
                $scope.skip++;
                $scope.getAllUsers();
            }
        }
        
        //sort by User ID
        $scope.sortById = function () {
            if (typeof ($scope.users) != 'undefined') {
                $scope.skip = 1;
                if ($scope.SortByIdAsc) {
                    $scope.SortByIdAsc = false;
                    $scope.getUsersWithSortAndPage('id', 'DESC');
                }
                else {
                    $scope.SortByIdAsc = true;
                    $scope.getUsersWithSortAndPage('id', 'ASC');
                }
            }
        }
        
        //sort by User ID
        $scope.sortBy = function (key) {
            $scope.key = key;
            $scope.skip = 1;
            if ($scope.SortAsc) {
                $scope.SortAsc = false;
                $scope.getUsersWithSortAndPage(key, 'DESC');
            }
            else {
                $scope.SortAsc = true;
                $scope.getUsersWithSortAndPage(key, 'ASC');
            }
        }
    })