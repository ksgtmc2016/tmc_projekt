(function(){
  'use strict';

  angular.module('route', ['altitude'])
    .factory('routeService', routeService);

  routeService.$inject = ['$http', 'altitudeService'];
  function routeService($http, altitudeService){
    var route2d = [];
    var searchData = {};

    function update2dRoute(routeCoords){
      route2d = [];
      route2d.push({lat: searchData.from.lat, long: searchData.from.long});

      for(var i = 0; i < routeCoords.length; i++){
        route2d.push({lat: routeCoords[i][1], long: routeCoords[i][0]});
      }

      route2d.push({lat: searchData.to.lat, long: searchData.to.long});
      console.log(route2d);

      //altitudeService.get3dRoute();
    };

    var findRoute = function(){
      var url = "http://cx453.net/tmc/api.php?a=" + searchData.from.lat + "&b=" + searchData.from.long + "&c=" + searchData.to.lat + "&d=" + searchData.to.long + "&e=1&f=1";

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
          //pathServ.update2dRoute($scope.startLat, $scope.startLong, $scope.stopLat, $scope.stopLong, data.coordinates);
          //$scope.route3d = altServ.get3dRoute();
          update2dRoute(data.coordinates);
        }
        else {
          alert('Error!');
        }
      });
    };

    return {
      searchData: searchData,
      findRoute: findRoute
    };
  }

})();
