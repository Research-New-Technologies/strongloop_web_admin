angular.module('app')
.controller('EmployeeController', function($scope, Employee){
   alert();
   $scope.create = function(employee){
       Employee.create(employee);
   }
    //get all data from backend  - no param required    
   $scope.get_all = function(){
     $scope.results = Employee.find(function(list){
         alert(JSON.stringify(list));
     }, function(error){
        alert(error); 
     });
   }; 
   
   //get data from backend - name required
   $scope.find_by_name = function(name){
     $scope.results = Employee.find({filter:{where:{first_name:name}}}, function(list){
         alert(JSON.stringify(list));
     }, function(error){
        alert(error); 
     });
   };
   
   //get data from backend - id required
   $scope.find_by_id = function(id){
     $scope.results = Employee.findById({id:id}, function(list){
         alert(JSON.stringify(list));
     }, function(error){
        alert(error); 
     });
   };  
   
   
    //Update data
    $scope.update = function(employee){
        Employee.prototype$updateAttributes (
            {id: employee.id},
            {first_name:employee.first_name,
             last_name:employee.last_name}
        )    
    }
    
    // Delete data
    $scope.delete = function(employee){
        Employee.deleteById({id:employee.id}).$promise.then(function(){
            console.log('deleted');
        })
    }
         
   
//    $scope.get_all();
$scope.update({id:1, first_name:"update first name", last_name:"update last name"});
$scope.delete({id:1});
$scope.create({employee_id:3, first_name:"create first name", last_name:"create last name", address:"create address", dob:"1990-01-15T00:00:00.000Z", phone_number:"0867581241123"})
});