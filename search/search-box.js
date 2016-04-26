(function(){
  'use strict';

  angular.module('search', ['route'])
    .directive('searchBox', searchBox);

  searchBox.$inject = ['routeService', '$http'];
  function searchBox(routeService, $http){
    return {
      restrict: 'E',
      templateUrl: 'search/search-box.html',
      controller: function(){
        var ctrl = this;

        ctrl.searchData = routeService.searchData

        ctrl.searchData.from = {};
        ctrl.searchData.to = {};
        ctrl.noDirtRoads = false;
        ctrl.searchData.level = 'medium';

        ctrl.search = function(){
          var urlFrom = 'http://maps.google.com/maps/api/geocode/json?address=' +
                    ctrl.from + '%2CGda%C5%84sk&sensor=false';
          var urlTo = 'http://maps.google.com/maps/api/geocode/json?address=' +
                    ctrl.to + '%2CGda%C5%84sk&sensor=false';

          $http.get(urlFrom).success(function(data){
            ctrl.searchData.from = data.results[0].geometry.location;
            $http.get(urlTo).success(function(data){
              ctrl.searchData.to = data.results[0].geometry.location;
              console.log('Searching route with data:');
              console.log(ctrl.searchData);
              routeService.findRoute();
            });
          });
        }

        ctrl.reverseDirection = function(){
          var temp = ctrl.from;

          ctrl.from = ctrl.to;
          ctrl.to = temp;
        }
      },
      controllerAs: 'ctrl',
      }
    }
})()
