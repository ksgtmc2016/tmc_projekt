angular.module('app', ['altitudeService', 'pathService'])
.controller('ctrl', ['altServ', 'pathServ', '$scope', function(altServ, pathServ, $scope) {
  $scope.startLat = 0.0;
  $scope.startLong = 0.0;
  $scope.stopLat = 0.0;
  $scope.stopLong = 0.0;

  $scope.route3d = [];

  $scope.search = function(){
    console.log("Search started");
    pathServ.update2dRoute($scope.startLat, $scope.startLong, $scope.stopLat, $scope.stopLong);
    $scope.route3d = altServ.get3dRoute();
  }
}]);
