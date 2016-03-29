angular.module('pathService', [])
.factory('pathServ', function(){
  var route2d = [];
  var update2dRoute = function(startLat, startLong, endLat, endLong){
    console.log('update2dRoute');
      //TODO Implement route search algorithm
      route2d = [];
      route2d.push({lat: startLat, long: startLong});
      route2d.push({lat: endLat, long: endLong});

      console.log(route2d.length);
  }
  var get2dRoute = function(){
    return route2d;
  }

  return {
    get2dRoute: get2dRoute,
    update2dRoute: update2dRoute
  }

})
