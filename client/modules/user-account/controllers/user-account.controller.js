angular.module('app')
    .controller('UserAccountController', function ($scope, $state, $rootScope, $window, $route, $timeout, $modal, User, $base64, Media, CommonService) {


        $scope.users = {};
        $rootScope.isAdmin = true;
        $scope.limit = 6;
        $scope.skip = 1;
        $scope.key = 'id';
        $scope.SortAsc = true;
        $scope.userCount = 0;
        $scope.searchText = '';

        CommonService.setActiveMenu("user-account").then(function (res) { })

        //get users with order by and also "DESC or ASC"
        $scope.getUsersWithSortAndPage = function (orderBy, type) {
            //calculate how many users that will be skiped
            var skip = ($scope.skip - 1) * $scope.limit;
            
            //call Web service to find User with filter parameters
            if ($scope.searchText == '') {
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
                }, function (errorResponse) {
                    CommonService.logout().then(function (response) {
                        CommonService.callPopup(errorResponse.data.error.message).then(function (response) {
                        });
                    }, function (params) {
                    })
                })
            }
            else {
                // var where_query =  { username:{like:$scope.searchText} };
                // var where_query = FilterBuilder.build_where_filter({comparer: 'or', model: User});
                // var result_filter = {};
                // var user_properties = Object.keys(User)
                
                User.find({ filter: { where: {
                            or: [
                                {username:{like:$scope.searchText}}, 
                                {email:{like:$scope.searchText}}
                            ] 
                                }
                                }, limit: $scope.limit, skip: skip, order: orderBy + ' ' + type }, function (response) {
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
                }, function (errorResponse) {
                    CommonService.logout().then(function (response) {
                        CommonService.callPopup(errorResponse.data.error.message).then(function (response) {
                        });
                    }, function (params) {
                    })
                })
            }

        }
        
        //run this command when user open dashboard 
        $scope.getUsersWithSortAndPage('Id', 'ASC');
        
        //delete user - open delete confirmation modal
        $scope.delete = function (user) {
            vm.deletedUser = user;
            $scope.openDeleteConfirmationModal();
        }
        
        //edit user - open edit user modal
        $scope.edit = function (user) {
            $rootScope.editedUser = user;
            $state.go('edit-user-account');
        }
        
        //add user - open add user modal
        $scope.add = function () {
            $scope.selectedUser = {};
            $state.go('add-user-account');
        }
        
        //delete user - delete to web service
        $scope.deleteUser = function () {
            User.destroyById({ id: $scope.vm.deletedUser.id }, function (response) {
                CommonService.callPopup("User has been deleted").then(function (response) {
                    $scope.users = [];
                    $window.location.reload();
                });
            }, function (errorResponse) {
                CommonService.callPopup(errorResponse.data.error.message).then(function (response) {
                });
            })
        }

        $scope.openDeleteConfirmationModal = function () {
            $scope.modalInstance = $modal.open({
                templateUrl: 'deleteModal.html',
                controller: 'UserAccountController',
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

        $scope.search = function () {
            console.log($scope.searchText)
            $scope.getUsersWithSortAndPage($scope.key, 'DESC');
        }
        
        //pagination - go to desired page
        $scope.goToPage = function () {
            if ($scope.skip <= 0) {
                CommonService.callPopup('Please input valid page').then(function (response) {
                });
            }
            else {
                if ($scope.skip == 1) {
                    $scope.getUsersWithSortAndPage($scope.key, 'ASC');
                }
                else {
                    if ((($scope.skip - 1) * $scope.limit) < $scope.userCount) {
                        $scope.getUsersWithSortAndPage($scope.key, 'ASC');
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

        //set the UI form
        var vm = this;
        vm.user = {};
        vm.deletedUser = {};
        vm.deleteUserFields = $rootScope.webAppConfig.formDefinition.deleteUserFields;
    });