var map;
var mercator    = new OpenLayers.Projection("EPSG:900913");
var geographic  = new OpenLayers.Projection("EPSG:4326");
var directionsService;
var markers;
var fromAddress;
var toAddress;
var numClicks=0;
var VectorLayerRoutes = new OpenLayers.Layer.Vector("Routes");

var line_style = {
   strokeColor:    "#0000EE",
   strokeOpacity:  0.7,
   strokeWidth:    4,
   pointRadius:    6,
   pointerEvents:  "visiblePainted"
};

function addMarker(markerSet, position, title) {
   /*addMarker(
     new OpenLayers.LonLat(20, 50).transform(geographic, mercator),
     "Jestem Markerem."
   );//*/
   var feature = new OpenLayers.Feature(markerSet, position);
   feature.closeBox = true;
   feature.popupClass = OpenLayers.Popup.FramedCloud;
   feature.data.popupContentHTML = title;
   feature.data.overflow = "auto";

   var marker = feature.createMarker();

   var markerClick = function (evt) {
      if (this.popup == null) {
         his.popup = this.createPopup(this.closeBox);
         map.addPopup(this.popup);
         this.popup.show();
      } else {
         this.popup.toggle();
      }
      currentPopup = this.popup;
      OpenLayers.Event.stop(evt);
   };
   marker.events.register("mousedown", feature, markerClick);

   markerSet.addMarker(marker);
};

function init() {
    var options = {
        projection:         mercator,
        displayProjection:  geographic,
        units:              "m",
        maxResolution:      156543.0339,
        maxExtent: new OpenLayers.Bounds(
            -20037508.34,
            -20037508.34,
            20037508.34,
            20037508.34
        )
    };
    map         = new OpenLayers.Map('map', options);
    var osm     = new OpenLayers.Layer.OSM(); 
    var gmap    = new OpenLayers.Layer.Google("Google", {sphericalMercator:true});
    markers     = new OpenLayers.Layer.Markers("points");

    map.addLayers([osm, gmap]);

    map.addLayer(VectorLayerRoutes);
    map.addLayer(markers);

    directionsService = new google.maps.DirectionsService();

    map.addControl(new OpenLayers.Control.LayerSwitcher());
    map.addControl(new OpenLayers.Control.MousePosition());

    map.setCenter(new OpenLayers.LonLat(10.2, 48.9).transform(
                geographic, mercator), 5);

    var click = new OpenLayers.Control.Click();
    map.addControl(click);
    click.activate();
}
OpenLayers.Control.Click = OpenLayers.Class(
    OpenLayers.Control, {                
        defaultHandlerOptions: {
            'single'        : true,
            'double'        : false,
            'pixelTolerance': 0,
            'stopSingle'    : false,
            'stopDouble'    : false
        },
        initialize: function(options) {
            this.handlerOptions = OpenLayers.Util.extend(
                {},
                this.defaultHandlerOptions
            );
            OpenLayers.Control.prototype.initialize.apply(
                this,
                arguments
            ); 
            this.handler = new OpenLayers.Handler.Click(
                this, 
                { 'click': this.trigger },
                this.handlerOptions
            );
        }, 
        trigger: function(e) {
            numClicks++;
            var lonlat  = map.getLonLatFromViewPortPx(e.xy);
            var glonlat = lonlat.transform(
                mercator,
                geographic
            );
            var geoLoc = getLocationData(glonlat.lon, glonlat.lat);
            //alert("Klikn¹³eœ "+glonlat+" a w G: "/*+geoLoc.results[0].formatted_address*/);
        }
    }
);
function getLocationData(glon, glat) {            
    geocoder    = new google.maps.Geocoder();
    latlng      = new google.maps.LatLng(glat, glon, true);
    geocoder.geocode(
        {'latLng': latlng},
        function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                addMarker(
                    markers,
                    new OpenLayers.LonLat(glon, glat).transform(
                        geographic,
                        mercator
                    ),
                    "Punkt "
                        +numClicks
                        +":\n"+results[0].formatted_address
                );
                
                if (numClicks==1) {
                    /* Marker startowy */
                    markers.clearMarkers();
                    map.getLayersByName("Routes")[0].removeAllFeatures();
                    fromAddress = results[0].formatted_address;
                    addMarker(
                        markers,
                        new OpenLayers.LonLat(glon, glat).transform(
                            geographic,
                            mercator
                        ),
                        "Marker startowy: " + results[0].formatted_address
                    );
                } else if (numClicks==2) {
                    /* Marker koñcowy */
                    numClicks=0;
                    toAddress = results[0].formatted_address;
                    addMarker(
                        markers,
                        new OpenLayers.LonLat(glon, glat).transform(
                            geographic,
                            mercator
                        ),
                        "Marker koncowy: " + results[0].formatted_address
                    );
                    var request = {
                        origin: fromAddress,
                        destination: toAddress,
                        travelMode: google.maps.TravelMode.DRIVING
                    };
                    directionsService.route(request, function(res, status) {
                        if(status == google.maps.DirectionsStatus.OK){
                            getRoutePolyline(res);
                        }
                    });
                } else {
                    numClicks=0;
                }
                
            }
            else  {
                alert('Geocode failure because of ' + status);
            }
        }
    );
}
function getRoutePolyline(result) {
    var pointList = [];
    var vectorLayer = map.getLayersByName("Routes")[0];
    vectorLayer.removeAllFeatures();
    /* Konstrukcja polilinii */
    var stepy = result.routes[0].legs[0].steps;
    for(var i=0; i < stepy.length; i++)
    {
        var endpoint = stepy[i].end_point;
        var point = new OpenLayers.Geometry.Point(
            endpoint.lng(),
            endpoint.lat()).transform(
                geographic,
                mercator
            );
        //console.log(point);
        pointList.push(point);
    }
   
    lineFeature = new OpenLayers.Feature.Vector(
        new OpenLayers.Geometry.LineString(pointList),
        null,
        line_style
    );
    vectorLayer.addFeatures(lineFeature);
}