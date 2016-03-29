angular.module('app', ['service'])
.controller('ctrl', ['serv', '$scope', function(serv, $scope) {
  this.startLat = 0.0;
  this.startLong = 0.0;
  this.stopLat = 0.0;
  this.stopLong = 0.0;

  $scope.route3d = [];

  this.search = function(){
    console.log("Search started");
    serv.update2dRoute(this.startLat, this.startLong, this.stopLat, this.stopLong);
    $scope.route3d = serv.get3dRoute();
  }
}]);
