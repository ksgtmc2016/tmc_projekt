(function(){
  'use strict';

  angular.module('widget', ['ngAnimate', 'altitude', 'nvd3'])
    .directive('r3mContainer', Container)
    .directive('r3mTabPanel', TabPanel)
    .directive('r3mTab', Tab)
    .directive('r3mChart', Chart);

  Container.$inject = [];
  function Container(){
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'widget/r3m-container.html',
      scope: {
        header: '@',
        collapsable: '='
      },
      bindToController: true,
      controller: function(){
        var ctrl = this;

        var observers = [];
        function notifyObservers(){
          angular.forEach(observers, function(observer){
            observer();
          })
        }
        ctrl.registerOnOpenObserver = function(observer){
          observers.push(observer);
        };

        ctrl.contentOpened = true;
        ctrl.toggleContent = function(){
          if (ctrl.collapsable){
            ctrl.contentOpened = !ctrl.contentOpened;
          }
          if (ctrl.contentOpened){
            notifyObservers();
          }
        };
      },
      controllerAs: 'container'
    }
  }

  TabPanel.$inject = [];
  function TabPanel(){
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'widget/r3m-tab-panel.html',
      scope: {
        notify: '@'
      },
      bindToController: true,
      controller: function(){
        var ctrl = this;

        var observers = [];
        ctrl.registerOnSelectedObserver = function(observer){
          observers.push(observer);
        };
        function notifyObservers(){
          angular.forEach(observers, function(observer){
            observer();
          })
        }

        ctrl.tabs = [];
        ctrl.addTab = function(tab){
          ctrl.tabs.push(tab);
        }
        ctrl.selectTab = function(selectedTab){
          console.log(selectedTab.heading + ' selected');
          console.log(ctrl.notify + ' expected');
          angular.forEach(ctrl.tabs, function(tab){
            if (tab.active){
              tab.active = false;
            }
          });
          selectedTab.active = true;
          if (selectedTab.heading === ctrl.notify){
            console.log('Notifying...');
            notifyObservers();
          }
        }
      },
      controllerAs: 'panel'
    };
  }

  Tab.$inject = [];
  function Tab(){
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'widget/r3m-tab.html',
      scope: {
        heading: '@',
      },
      require: '^^r3mTabPanel',
      link: function(scope, element, attrs, panelCtrl){
        scope.active = false;
        if (attrs.selected){
          attrs.$observe('selected', function(selected){
            scope.active = selected;
          });
        }

        panelCtrl.addTab(scope);
      }
    }
  }

  Chart.$inject = ['altitudeService', '$window', '$timeout'];
  function Chart(altitudeService, $window, $timeout){
    return{
      restrict: 'E',
      templateUrl: 'widget/r3m-chart.html',
      scope: {},
      require: ['^^r3mContainer', '^^r3mTabPanel'],
      link: function(scope, element, attrs, parentCtrls){
        function updateChartData(){
          scope.data[0].values = altitudeService.getProfile();
        }
        function refreshChart(){
          //This is implemented for resolving bug with chart resize
          $timeout(function(){
            var resizeEvent = document.createEvent('Event');
            resizeEvent.initEvent('resize', true, true);
            $window.dispatchEvent(resizeEvent);
          }, 0);
        }

        altitudeService.registerOnProfileReadyObserver(updateChartData);
        parentCtrls[0].registerOnOpenObserver(refreshChart);
        parentCtrls[1].registerOnSelectedObserver(refreshChart);

        scope.options = {
          chart: {
              type: 'lineChart',
              height: null,
              width: null,
              margin : {
                  top: 20,
                  right: 20,
                  bottom: 30,
                  left: 40
              },
              x: function(d){return d[0];},
              y: function(d){return d[1];},
              useInteractiveGuideline: true,
              xAxis: {
                  showMaxMin: false,
                  tickFormat: function(d) {
                      return;
                  }
              },
              yAxis: {
                showMaxMin: false,
                  tickFormat: function(d){
                      return d3.format(',.2f')(d);
                  }
              },
              lines: {
                 dispatch: {
                     elementClick: function(e){
                        if(heightPointMarker != null && heightPointMarker != undefined) {
                           vectorSource.removeFeature( heightPointMarker );
                        }
                        
                        heightPointMarker = new ol.Feature({
                           type: 'pointMarker',
                           geometry: new ol.geom.Point(ol.proj.transform([routeCoords[e[0].pointIndex][0], routeCoords[e[0].pointIndex][1]], 'EPSG:4326', 'EPSG:3857'))
                           //geometry: new ol.geom.Point(e.coordinate)
                        });
                        
                        vectorSource.addFeature( heightPointMarker );
                        
                        console.log(routeCoords[e[0].pointIndex][0] + " " + routeCoords[e[0].pointIndex][1]);
                     }
                 }
             }
          }
        };
        scope.data = [
          {
            "key" : "Wysokość n.p.m" ,
            "values" : [],
            "area" : true
          }];
      }
    }
  }
})()
