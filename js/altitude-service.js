angular.module('altitudeService', ['pathService'])
.factory('altServ', ['pathServ', function(pathServ){

  // var db = openDatabase('geodb', '1.0', 'Test DB', 2 * 1024 * 1024);
  // db.transaction(function(tx){
  //   tx.executeSql('CREATE TABLE IF NOT EXIST coords(_id INTEGER PRIMARY KEY AUTOINCREMENT, x INTEGER NOT NULL, y INTEGER NOT NULL, z const NOT NULL)');
  // });
  //
  // const coords = [
  //   {x: 463300, y: 732000, z: 173.23},
  //   {x: 463400, y: 732000, z: 173.39},
  //   {x: 463500, y: 732000, z: 176.22},
  //   {x: 463600, y: 732000, z: 181.76}
  // ];
  //
  // for (var i in coords){
  //   db.transaction(function(tx){
  //     tx.executeSql('INSERT INTO coords (_id, x, y, z) VALUES (?, ?, ?)', [coords[i].x, coords[i].y, coords[i].z]);
  //     console.log('Data inserted');
  //   });
  // }
  //
  // db.transaction(function(tx){
  //   console.log('Trying to read data...');
  //   tx.executeSql('SELECT * FROM coords', [], function(tx, results){
  //     for (var i = 0; i < 4; i++){
  //       console.log(results.rows.item[i]);
  //     }
  //   });
  // });

  const coords = [
    {x: 732000, y: 463300, z: 173.23},
    {x: 732000, y: 463400, z: 173.39},
    {x: 732000, y: 463500, z: 176.22},
    {x: 732000, y: 463600, z: 181.76}
  ];

var db = openDatabase('geodb', '1.0', 'Test DB', 2 * 1024 * 1024);
var msg;

db.transaction(function (tx) {
   tx.executeSql('CREATE TABLE IF NOT EXISTS COORDS (id unique, x, y, z)');

   for (var i in coords){
     tx.executeSql('INSERT INTO COORDS (id, x, y, z) VALUES (?, ?, ?, ?)', [i + 1, coords[i].x, coords[i].y, coords[i].z]);
     msg = 'Math.log message created and row inserted.';
     console.log(msg);
   }
   //document.querySelector('#status').innerHTML =  msg;
});
//
// db.transaction(function (tx) {
//    tx.executeSql('SELECT z FROM COORDS', [], function (tx, results) {
//       var len = results.rows.length, i;
//       msg = "Found rows: " + len;
//       console.log(msg);
//       //document.querySelector('#status').innerHTML +=  msg;
//
//       for (i = 0; i < len; i++){
//          msg = results.rows.item(i);
//          console.log(msg);
//          //document.querySelector('#status').innerHTML +=  msg;
//       }
//    }, null);
// });

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

    console.log(lat + " " + long + " -> " + puw92x + " " + puw92y);

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
    //TODO Database query
    // db.transaction(function (tx){
    //   tx.executeSql('SELECT * FROM COORDS', [], function(tx, results){
    //     var len = results.rows.length, i, minDistance = 99999999999;
    //     for (i = 0; i < len; i++){
    //       var row = results.rows.item(i);
    //       if (calculateDistance(x, row.x, y, row.y) < minDistance){
    //         minDistance = calculateDistance(x, row.x, y, row.y);
    //         closestPointAlt = row.z;
    //       }
    //     }
    //     //console.log('Closest point altitude: ' + closestPointAlt);
    //   });
    // });

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
    console.log("(" + x1 + " - " + x2 + ")^2 + (" + y1 + " - " + y2 + ")^2 = " + distance);
    return distance;
  }

  function findAltitude(lat,long){
    var formattedCoords = wsg84ToPuw92(lat, long);
    x = formattedCoords.x;
    y = formattedCoords.y;
    z = findClosestPointAltitude(x, y);

    return z;
  }

  var get3dRoute = function(){
    var route3d = [];
    angular.forEach(pathServ.get2dRoute(), function(position){
      var alt = findAltitude(position.lat, position.long);
      route3d.push({lat: position.lat, long: position.long, alt: alt});
    });
    return route3d;
  }

  return {
    get3dRoute: get3dRoute
  }
}]);
