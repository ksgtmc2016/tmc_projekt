angular.module('app', ['altitudeService', 'pathService'])
.controller('ctrl', ['altServ', 'pathServ', '$scope', '$http', function(altServ, pathServ, $scope, $http) {
  $scope.startLat = 54.450673;
  $scope.startLong = 18.438442;
  $scope.stopLat = 54.450652;
  $scope.stopLong = 18.433814;

  $scope.route3d = [];

  $scope.search = function(){
     var url = "http://cx453.net/tmc/api.php?a=" + $scope.startLat + "&b=" + $scope.startLong + "&c=" + $scope.stopLat + "&d=" + $scope.stopLong + "&e=1&f=1";
     
    $http({method: 'GET', url: url}).success(function(data, status, headers, config) {
 /****************************************************************************************
  *  data                                                                                *
  *   |--- type        - Dunno                                                           *
  *   |--- properties                                                                    *
  *   |       |--- description - Route description                                       *
  *   |       |--- distance    - Travel distance in kilometers                           *
  *   |       |--- traveltime  - Travel time in I have no idea                           *
  *   |--- crs         - dunno                                                           *
  *   |--- coordinates - array of coords - contains two item arrays of coords [lat, lon] *
  ****************************************************************************************/
      
      if(data.properties.traveltime != -1){
         pathServ.update2dRoute($scope.startLat, $scope.startLong, $scope.stopLat, $scope.stopLong, data.coordinates);
         $scope.route3d = altServ.get3dRoute();
      }
      else {
         alert('Error!');
      }
    });
  }
}]);
