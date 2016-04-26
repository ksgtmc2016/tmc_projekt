angular.module('altitude', [])
.factory('altitudeService', [function(){


  var coords = [];
  var route2d = [];
  var route3d = [];
  var profile = [];

  var observers = [];
  var registerOnProfileReadyObserver = function(observer){
    observers.push(observer);
  }

  function notifyObservers(){
    angular.forEach(observers, function(observer){
      observer();
    })
  }

  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'data/gdansk_puwg92.db', true);
  xhr.responseType = 'arraybuffer';

  xhr.onload = function(e) {
    var uInt8Array = new Uint8Array(this.response);
    var db = new SQL.Database(uInt8Array);
    var contents = db.exec("SELECT * FROM coords");
    var dbValues = contents[0].values;
    console.log(dbValues);
    for (var i in dbValues){
      var singleDbValue = dbValues[i];
      coords.push({x: singleDbValue[1], y: singleDbValue[2], z: singleDbValue[3]});
    }
  console.log('DB is ready with ' + coords.length + ' elements.');

  };
  xhr.send();

  function wsg84ToPuw92(lat, long){
    var puw92x, puw92y;

    const e=0.0818191910428;
    const R0=6367449.14577;
    const Snorm=2.0E-6;
    const xo=5760000.0;

    const a0=5765181.11148097;
    const a1=499800.81713800;
    const a2=-63.81145283;
    const a3=0.83537915;
    const a4=0.13046891;
    const a5=-0.00111138;
    const a6=-0.00010504;

    const L0_stopnie=19.0;
    const m0=0.9993;
    const x0=-5300000.0;
    const y0= 500000.0;

    const Bmin=48.0*Math.PI/180.0;
    const Bmax=56.0*Math.PI/180.0;
    const dLmin=-6.0*Math.PI/180.0;
    const dLmax=6.0*Math.PI/180.0;

    const B=lat*Math.PI/180.0;
    const dlong=long-L0_stopnie;
    const dL=dlong*Math.PI/180.0;

    if ((B<Bmin) || (B>Bmax))
          return NULL;

    if ((dL<dLmin) || (dL>dLmax))
          return NULL;

    const U=1.0-e*Math.sin(B);
    const V=1.0+e*Math.sin(B);
    const K=Math.pow((U/V),(e/2.0));
    const C=K*Math.tan(B/2.0+Math.PI/4.0);
    const fi=2.0*Math.atan(C)-Math.PI/2.0;
    const d_lambda=dL;

    const p=Math.sin(fi);
    const q=Math.cos(fi)*Math.cos(d_lambda);
    const r=1.0+Math.cos(fi)*Math.sin(d_lambda);
    const s=1.0-Math.cos(fi)*Math.sin(d_lambda);
    const XMERC=R0*Math.atan(p/q);
    const YMERC=0.5*R0*Math.log(r/s);

    var Z = new Complex((XMERC-xo)*Snorm, YMERC*Snorm);
    var Zgk;

    Zgk = Z.mul(new Complex(a6)).add(new Complex(a5)).mul(Z).add(new Complex(a4))
    .mul(Z).add(new Complex(a3)).mul(Z).add(new Complex(a2)).mul(Z).add(new Complex(a1))
    .mul(Z).add(new Complex(a0));

    const Xgk=Zgk.re;
    const Ygk=Zgk.im;

    puw92x=Math.round(m0*Xgk+x0);
    puw92y=Math.round(m0*Ygk+y0);

    return {
      x: puw92x,
      y: puw92y
    }
  }

  function findClosestArea(x, y){
    var roi;
    //TODO Quadtree search
    return roi;
  }

  function findClosestPointAltitude(x, y){
    //var area = findClosestArea(x, y)
    var closestPointAlt, minDistance = Number.MAX_VALUE;

    for (var i in coords){
      if (calculateDistance(x, coords[i].x, y, coords[i].y) < minDistance){
        minDistance = calculateDistance(x, coords[i].x, y, coords[i].y);
        closestPointAlt = coords[i].z;
        if (minDistance == 0) {
          break;
        }
      }
    }

    return closestPointAlt;
  }

  function calculateDistance (x1, x2, y1, y2){
    var distance = (x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2);
    return distance;
  }

  function findAltitude(lat,long){
    var formattedCoords = wsg84ToPuw92(lat, long);
    x = formattedCoords.x;
    y = formattedCoords.y;
    z = findClosestPointAltitude(x, y);

    return z;
  }

  function formatRoute2d(route2dWsg84) {
    route2d = [];
    angular.forEach(route2dWsg84, function(position){
      route2d.push(wsg84ToPuw92(position.lat, position.long));
    })
  }

  // var calculate3dRoute = function(route2dLatLong){
  //   route3d = [];
  //   angular.forEach(route2dLatLong, function(position){
  //     var alt = findAltitude(position.lat, position.long);
  //     route3d.push({lat: position.lat, long: position.long, alt: alt});
  //   });
  //   createProfile();
  //   return route3d;
  // }

  var createProfile = function(route2dWsg84){
    profile = [];
    formatRoute2d(route2dWsg84);

    var distance = 0;
    var altitude = findClosestPointAltitude(route2d[0].x, route2d[0].y);
    profile.push([distance, altitude]);

    for (var i = 1; i < route2d.length; i++){
      distance += calculateDistance(route2d[i].x, route2d[i-1].x,
                                    route2d[i].y, route2d[i-1].y);
      var altitude = findClosestPointAltitude(route2d[i].x, route2d[i].y);
      profile.push([distance, altitude]);
    }
    console.log('Got profile');
    console.log(profile);
    notifyObservers();
  }

  var getProfile = function(){
    return profile;
  }

  return {
    coords: coords,
    route3d: route3d,
    getProfile: getProfile,
    createProfile: createProfile,
    registerOnProfileReadyObserver: registerOnProfileReadyObserver
  };
}]);
