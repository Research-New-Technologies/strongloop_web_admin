angular.module('app')
	.service('Dashboard', function($q, Member){
		/**
		 * Retrieve a collection of User
		 */
		this.getAllUsers = function(skip, limit, search_text){
            var deferred = $q.defer();
             Member.find({ filter: { include: { relation: 'roleMappingMembers', scope: { include: { relation: 'role' } } } } }, function (response) {
               deferred.resolve(response);
            }, function (err) {
                deferred.reject(err);
                // alert("please re-login to view dashboard");
                // Member.logout();
                // window.localStorage.clear();
                // $rootScope.is_authenticated = false;
                // $rootScope.username = "";
                // $state.go("login")
            });
			return deferred.promise;
		}
	});