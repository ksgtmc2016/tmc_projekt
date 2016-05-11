(function(){
  'use strict';

  angular.module('route', ['altitude'])
    .factory('routeService', routeService);

  routeService.$inject = ['$http', 'altitudeService'];
  function routeService($http, altitudeService){
    var route2d;
    var searchData = {};

    function update2dRoute(routeCoords){
      route2d = [];
      route2d.push({lat: searchData.from.lat, long: searchData.from.lng});

      for(var i = 0; i < routeCoords.length; i++){
        route2d.push({lat: routeCoords[i][1], long: routeCoords[i][0]});
      }

      route2d.push({lat: searchData.to.lat, long: searchData.to.lng});

      console.log('Got 2d route:');
      console.log(route2d);
      altitudeService.createProfile(route2d);
    };

    var findRoute = function(){
      var url = "http://cx453.net/tmc/api.php?a=" + searchData.from.lat + "&b=" + searchData.from.lng + "&c=" + searchData.to.lat + "&d=" + searchData.to.lng + "&e=1&f=1";

     
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

		//A very nasty implementation of adding markers here
		vectorSource.clear();
	
        if(data.properties.traveltime != -1){
          //pathServ.update2dRoute($scope.startLat, $scope.startLong, $scope.stopLat, $scope.stopLong, data.coordinates);
          //$scope.route3d = altServ.calculate3dRoute();
          update2dRoute(data.coordinates);
          
          routeCoords = data.coordinates;
          
          var route = new ol.geom.LineString(data.coordinates);

          var routeFeature = new ol.Feature({
            type: 'route',
            geometry: route.transform('EPSG:4326', 'EPSG:3857')
          });

          vectorSource.addFeature( routeFeature );
		  
		var startMarker = new ol.Feature({
           type: 'geoMarker',
           geometry: new ol.geom.Point(ol.proj.transform([data.coordinates[0][0], data.coordinates[0][1]], 'EPSG:4326', 'EPSG:3857'))
           //geometry: new ol.geom.Point(e.coordinate)
        });
        var endMarker = new ol.Feature({
           type: 'geoMarker',
           geometry: new ol.geom.Point(ol.proj.transform([data.coordinates[data.coordinates.length - 1][0], data.coordinates[data.coordinates.length - 1][1]], 'EPSG:4326', 'EPSG:3857'))
           //geometry: new ol.geom.Point(e.coordinate)
        });
		  
		vectorSource.addFeature( startMarker );
		vectorSource.addFeature( endMarker );
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
