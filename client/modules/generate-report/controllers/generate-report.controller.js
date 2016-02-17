angular.module('app')
    .controller('GenerateReportController', function ($scope, Location, $sce, CommonService) {
        CommonService.setActiveMenu("generate-report").then(function (res) { })
        $scope.generate = function () {
            Location.generate(function (generateResponse) {
                $scope.content = generateResponse.url;
                $scope.isGenerateReport = true;
            }, function (responseError) {
                CommonService.callPopup(responseError.data.error.message).then(function (response) {
                });
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