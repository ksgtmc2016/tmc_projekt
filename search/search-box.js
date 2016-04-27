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

        searchBoxCtrl = ctrl;

        ctrl.searchData = routeService.searchData;

        ctrl.searchData.from = {};
        ctrl.searchData.to = {};
        ctrl.noDirtRoads = false;
        ctrl.searchData.level = 'medium';

        ctrl.search = function(){
          var addressUrl = 'http://open.mapquestapi.com/nominatim/v1/search.php?key=hGTQxTXPQN8KAXHuS70ehDrzT18Qf0XO&format=json&q=';
          var urlFrom = addressUrl + ctrl.from + '&sensor=false';
          var urlTo = addressUrl + ctrl.to + '&sensor=false';

          $http.get(urlFrom).success(function(data){
            ctrl.searchData.from.lat = data[0].lat;
            ctrl.searchData.from.lng = data[0].lon;
            $http.get(urlTo).success(function(data){
              ctrl.searchData.to.lat = data[0].lat;
              ctrl.searchData.to.lng = data[0].lon;
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
