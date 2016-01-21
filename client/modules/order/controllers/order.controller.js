angular.module('app')
    .controller('OrderController', function ($scope, Order, Member, $rootScope, $state, $window, $modal) {
        $rootScope.isAdmin = true;
        $scope.orders = {};
        $scope.popupDate = {};
        $scope.format = 'dd-MM-yyyy';
        $scope.altInputFormats = ['dd-MM-yyyy'];
        $scope.limit = 10;
        $scope.skip = 1;
        $scope.isFirstPage = true;
        //get all orders function. 
        $scope.getOrderByPage = function (or) {
            var skip =  ($scope.skip-1) * $scope.limit;
            Order.find( {filter:{limit: $scope.limit, skip: skip}},function (response) {
                $scope.orders = response;
            }, function (response) {
                if(response.data.error.status == 401){
                    alert("please re-login to view dashboard");
                    Member.logout();
                    window.localStorage.clear();
                    $rootScope.is_authenticated = false;
                    $rootScope.username = "";
                    $state.go("login")
                }
                console.log(JSON.stringify(response.data.error.status));
            });
        }
        
        $scope.getAllOrdersLength = function(){
            Order.count(function(response){
               $scope.totalOrders = response.count;
            }, function(err){
                console.log(err)
            })
        }
        
        $scope.getAllOrdersLength();
        $scope.getOrderByPage();

        //open delete confirmation modal dialog
        $scope.delete = function (order) {
            $scope.selected_order = order;
            $scope.modal_title = "Delete Order Confirmation";
            $scope.isDelete = true;
            $scope.openModal();
        }
        
        //open edit order modal
        $scope.edit = function (order) {
            $scope.selected_order = order;
            $scope.modal_title = "Update Order";
            $scope.isDelete = false;
            $scope.isAddOrder = false;
            $scope.isUpdateOrder = true;
            $scope.openModal();
        }
        
        //open add a new order modal
        $scope.add = function () {
            $scope.selected_order = {};
            $scope.selected_order.orderDate = new Date();
            $scope.modal_title = "Add a new Order";
            $scope.isDelete = false;
            $scope.isAddOrder = true;
            $scope.isUpdateOrder = false;
            $scope.openModal();
        }
        
        //add a new order. 
        $scope.addOrder = function (order) {
            //if inputs are invalid
            if ($scope.addUpdateForm.$invalid) {
                $scope.addUpdateForm.orderDate.$dirty = true;
                $scope.addUpdateForm.memberId.$dirty = true;
                $scope.addUpdateForm.status.$dirty = true;
            }
            else {
                //call Order create web service
                Order.create(order, function (response) {
                    alert("Successfully add a new Order");
                    $scope.getOrderByPage();
                    $scope.modalInstance.close();
                    $window.location.reload();
                }, function (response) {
                    alert(JSON.stringify(response.data.error.message))
                });

            }
        }
        
        //delete selected order
        $scope.deleteOrder = function (order) {
            //call Order delete by id  web service
            Order.destroyById({ id: order.id }, function (response) {
                alert("Successfully delete the order")
                $scope.modalInstance.close();
                $scope.getOrderByPage();
                $window.location.reload();
            }, function (response) {
                alert(JSON.stringify(response))
            })
        }
        
        //update selected order
        $scope.updateOrder = function (order) {
            //call Order update attributes web service
            Order.prototype$updateAttributes({ id: order.id, memberId: order.memberId, orderDate: order.orderDate, status: order.status }, function (response) {
                alert("Successfully update the order")
                $scope.modalInstance.close();
                $scope.getOrderByPage();
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
                controller: 'OrderController',
                scope: $scope
            })
        }
        
        //close modal function
        $scope.closeModal = function () {
            $scope.modalInstance.close();
        }

        //open date picker function
        $scope.openDate = function () {
            $scope.popupDate.opened = true;
        };
        
        
        //pagination - go to desired page
        $scope.goToPage = function (){
            if($scope.limit <= 0){
                alert("Please input valid page")
            }
            else {
                $scope.getOrderByPage();
            } 
        }
        
        //pagination - go to previous page
        $scope.goToPrev = function(){
            if($scope.skip > 1){
                $scope.skip--;
                $scope.getOrderByPage();
            }
        }
        
        //pagination - go to next page
        $scope.goToNext = function(){
            $scope.skip++;
            $scope.getOrderByPage();
        }
        
        //sort by Order ID
        $scope.sortByOrderId = function(){
            if($scope.sortByOrderIdAsc){
                $scope.sortByOrderIdAsc = false;
                $scope.skip = 1;
                weapons.find({
 order: 'id DESC',
 limit: 3 });
            }
            else {
                $scope.sortByOrderIdAsc = true;
            }
        }
        
        //sort by Order Date
        $scope.sortByOrderDate = function(){
            
        }
        
        //sort by Member ID
        $scope.sortByMemberId = function(){
            
        }
        
        //sort by Status
        $scope.sortByStatus = function(){
            
        }
        
        $scope.myPagingFunction = function(){
            console.log("asdasdadasdasd");
        }
                          
    });