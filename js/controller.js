angular.module('app', ['service'])
.controller('ctrl', ['serv', '$scope', function(serv, $scope) {
  $scope.startLat = 0.0;
  $scope.startLong = 0.0;
  $scope.stopLat = 0.0;
  $scope.stopLong = 0.0;

  $scope.route3d = [];

  $scope.search = function(){
    console.log("Search started");
    serv.update2dRoute($scope.startLat, $scope.startLong, $scope.stopLat, $scope.stopLong);
    $scope.route3d = serv.get3dRoute();
  }
}]);
