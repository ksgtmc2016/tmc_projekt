angular.module('app', ['altitudeService', 'pathService'])
.controller('ctrl', ['altServ', 'pathServ', '$scope', function(altServ, pathServ, $scope) {
  $scope.startLat = 54.450673;
  $scope.startLong = 18.438442;
  $scope.stopLat = 54.450652;
  $scope.stopLong = 18.433814;

  $scope.route3d = [];

  $scope.search = function(){
    pathServ.update2dRoute($scope.startLat, $scope.startLong, $scope.stopLat, $scope.stopLong);
    $scope.route3d = altServ.get3dRoute();
  }
}]);
