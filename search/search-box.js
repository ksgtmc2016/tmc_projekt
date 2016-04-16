(function(){
  'use strict';

  angular.module('search', ['ui.bootstrap', 'route'])
    .directive('searchBox', searchBox);

  searchBox.$inject = ['routeService'];
  function searchBox(routeService){
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
          routeService.findRoute();
          console.log(ctrl.searchData);
        }

        ctrl.reverseDirection = function(){
          var temp = ctrl.from;

          ctrl.from = ctrl.to;
          ctrl.to = temp;
        }

      },
      controllerAs: 'ctrl',
      link: function(scope, element, attrs, ctrl){
        scope.$watch('ctrl.from', function(newValue){
          parseLocationInput(ctrl.searchData.from, newValue);
        });

        scope.$watch('ctrl.to', function(newValue){
          parseLocationInput(ctrl.searchData.to, newValue);
        });

        function parseLocationInput(locationObject, unparsedLocation){
          //TODO Add parsing from human readable values such as streets etc.
          if (unparsedLocation === undefined){
            return;
          }

          var locations = unparsedLocation.split(';');

          if (locations.length === 2){
            locationObject.lat = parseFloat(locations[0]);
            locationObject.long = parseFloat(locations[1]);
          }
        };
      }
    }
  }
})()
