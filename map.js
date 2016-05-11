Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}

var processing = false;

var styles = {
  'route': new ol.style.Style({
    stroke: new ol.style.Stroke({
      width: 6, color: [237, 212, 0, 0.8]
    })
  }),
  'icon': new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: 'data/icon.png'
    })
  }),
  'geoMarker': new ol.style.Style({
    image: new ol.style.Circle({
      radius: 7,
      snapToPixel: false,
      fill: new ol.style.Fill({color: 'black'}),
      stroke: new ol.style.Stroke({
        color: 'white', width: 2
      })
    })
  }),
  'pointMarker': new ol.style.Style({
    image: new ol.style.Circle({
      radius: 7,
      snapToPixel: false,
      fill: new ol.style.Fill({color: 'green'}),
      /*stroke: new ol.style.Stroke({
        color: 'white', width: 2
      })*/
    })
  })
};

var vectorSource = new ol.source.Vector({
   features: []
});

var vectorLayer = new ol.layer.Vector({
   source: vectorSource,
   style: function(feature) {
      return styles[feature.get('type')];
   }
});

var map;

var markersCount = 0;
var startCoords;
var endCoords;
var routeCoords;
var heightPointMarker;
var searchBoxCtrl;

function mapInit() {
   map = new ol.Map({
      units: "m",
      layers: [
         new ol.layer.Tile({
            source: new ol.source.OSM()
         }),
         vectorLayer
      ],
      target: 'map',
      controls: [],
      view: new ol.View({
         center: ol.proj.transform([18.6174352, 54.4366541], 'EPSG:4326', 'EPSG:3857'),
         zoom: 12
      })
   });

   map.on("click", function(e) {
      if(processing)
         return;

      var featureExistsAtPixel = false;
      map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
         featureExistsAtPixel = true;
         vectorSource.removeFeature( feature );
      });

      if(!featureExistsAtPixel){
         var geoMarker = new ol.Feature({
            type: 'geoMarker',
            //geometry: new ol.geom.Point(ol.proj.transform([18.6174352, 54.4366541], 'EPSG:4326', 'EPSG:3857'))
            geometry: new ol.geom.Point(e.coordinate)
         });

         vectorSource.addFeature( geoMarker );

         if(markersCount == 0)
         {
            startCoords = ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326');
            searchBoxCtrl.from = startCoords[1] + "," + startCoords[0];
         }
         else if(markersCount == 1)
         {
            endCoords = ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326');
            searchBoxCtrl.to = endCoords[1] + "," + endCoords[0];
         }

         markersCount++;
      }

      if(markersCount == 2)
      {
         searchBoxCtrl.search();
         
         /*
         var url = "http://cx453.net/tmc/api.php?a=" + startCoords[1] + "&b=" + startCoords[0] + "&c=" + endCoords[1] + "&d=" + endCoords[0] + "&e=1&f=1";

         processing = true;
         
         $.get( url, function( data ) {
            processing = false;

            
            var result = JSON.parse(data);
            if(result.properties.traveltime != -1){
               for(var i = 0; i < result.coordinates.length; i++) {
                  var routeMarker = new ol.Feature({
                     type: 'geoMarker',
                     geometry: new ol.geom.Point(ol.proj.transform(result.coordinates[i], 'EPSG:4326', 'EPSG:3857'))
                     //geometry: new ol.geom.Point(e.coordinate)
                  });

                  vectorSource.addFeature( routeMarker );

                  multipoint.appendPoint(new ol.geom.Point(ol.proj.transform(result.coordinates[i], 'EPSG:4326', 'EPSG:3857')));
               }

               var route = new ol.geom.LineString(result.coordinates);

               var routeFeature = new ol.Feature({
                 type: 'route',
                 geometry: route.transform('EPSG:4326', 'EPSG:3857')
               });

               vectorSource.addFeature( routeFeature );

               //alert("Found route!");
               //pathServ.update2dRoute($scope.startLat, $scope.startLong, $scope.stopLat, $scope.stopLong, data.coordinates);
               //$scope.route3d = altServ.get3dRoute();
            }
            else {
               alert('Error!');
            }
         });*/
      }

      if(markersCount == 3)
      {
         vectorSource.clear();
         markersCount = 0;
      }
   });
}
