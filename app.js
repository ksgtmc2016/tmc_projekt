angular.module('app', ['ui.bootstrap', 'altitude', 'route', 'search'])
.controller('ctrl', ['altitudeService', 'routeService', '$scope', '$http', function(altServ, pathServ, $scope, $http) {
  $scope.startLat = 54.450673;
  $scope.startLong = 18.438442;
  $scope.stopLat = 54.450652;
  $scope.stopLong = 18.433814;

  $scope.searchCollapsed;

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

  $scope.$on('screenModeEvent', function(event, data){
    //$scope.searchCollapsed = data.xsMode;
    console.log('ctrl: xs mode? ' + data.xsMode);
  });

}])
.directive('collapseXs', ['$window', function($window){
  return {
    link: function(scope, el, attrs){
      var XS_BOUND = 768;
      var isXs = false;
      var lastWidth = $window.innerWidth;

      scope.$broadcast('screenModeEvent', {
        xsMode: lastWidth < XS_BOUND
      })

      angular.element($window).on('resize', function(event){
        var newWidth = $window.innerWidth;

        if (newWidth < XS_BOUND && lastWidth >= XS_BOUND){
          scope.$apply(function(){
            scope.searchCollapsed = true;
          });
        }
        if (newWidth >= XS_BOUND && lastWidth < XS_BOUND){
          scope.$apply(function(){
            scope.searchCollapsed = false;
          });
        }

        lastWidth = newWidth;
      });
    }
  }
}]);
