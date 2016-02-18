angular.module('app')
    .service('CommonService', function ($q, $rootScope, $state) {
        this.logout = function () {
            var deferred = $q.defer();
            window.localStorage.clear();
            $rootScope.isAuthenticated = false;
            $rootScope.user = undefined;
            deferred.resolve(true);
            $state.go("login");

            return deferred.promise;
        }

        this.setActiveMenu = function (menu) {
            if (menu == 'user-account') {
                $rootScope.menu.isUserAccount = true;
                $rootScope.menu.isUploadFile = false;
                $rootScope.menu.isGenerateReport = false;
            }
            else if (menu == 'generate-report') {
                $rootScope.menu.isUserAccount = false;
                $rootScope.menu.isUploadFile = false;
                $rootScope.menu.isGenerateReport = true;
            }
            else if (menu == 'upload-file') {
                $rootScope.menu.isUserAccount = false;
                $rootScope.menu.isUploadFile = true;
                $rootScope.menu.isGenerateReport = false;
            }

            var deferred = $q.defer();
            deferred.resolve(true);
            return deferred.promise;
        }

        this.callPopup = function (message) {
            var deferred = $q.defer();
            $rootScope.popup.message = message;
            $rootScope.popup.isCalled = true;
            deferred.resolve(true);
            return deferred.promise;
        }
        

        this.setUser = function (userId, token, userInfo) {
            var deferred = $q.defer();
            $rootScope.isAuthenticated = true;
            window.localStorage.setItem('IS_AUTHENTICATED', true);
            window.localStorage.setItem('USER_ID', userId);
            window.localStorage.setItem('TOKEN', token);
            window.localStorage.setItem('USER_DETAILS', JSON.stringify(userInfo));
            $rootScope.user = userInfo;
            deferred.resolve(true);
            return deferred.promise;
        }
    });