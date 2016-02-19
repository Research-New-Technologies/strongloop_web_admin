angular.module('app')
    .controller('GenerateReportController', function ($scope, Project, $sce, CommonService, $rootScope, $modal, $location) {
        CommonService.setActiveMenu("generate-report").then(function (res) { })
        $scope.generate = function () {
            Project.generate(function (generateResponse) {
                $scope.content = generateResponse.url;
                $scope.isGenerateReport = true;
            }, function (responseError) {

                $rootScope.popup.instructionLinkText = 'page';
                $rootScope.popup.instructionLink = '/#/upload-file';
                $rootScope.popup.instructionMessage = "You don't have any data to be generated.\nTo generate a PDF report on this page, please import the report's data on this";
                $scope.openModal();
            })
        }
    
        //open modal function
        $scope.openModal = function () {
            $rootScope.modalInstance = $modal.open({
                templateUrl: 'popup-instruction-message.html'
            })
        }
    })



    .directive('embedSrc', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var current = element;
                scope.$watch(function () { return attrs.embedSrc; }, function () {
                    var clone = element
                        .clone()
                        .attr('src', attrs.embedSrc);
                    current.replaceWith(clone);
                    current = clone;
                });
            }
        };
    });