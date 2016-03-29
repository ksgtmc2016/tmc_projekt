angular.module('altitudeService', ['pathService'])
.factory('altServ', ['pathServ', function(pathServ){
  console.log("Service launched!");

  // var db = openDatabase('geodb', '1.0', 'Test DB', 2 * 1024 * 1024);
  // db.transaction(function(tx){
  //   tx.executeSql('CREATE TABLE IF NOT EXIST coords(_id INTEGER PRIMARY KEY AUTOINCREMENT, x INTEGER NOT NULL, y INTEGER NOT NULL, z DOUBLE NOT NULL)');
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
    {x: 463300, y: 732000, z: 173.23},
    {x: 463400, y: 732000, z: 173.39},
    {x: 463500, y: 732000, z: 176.22},
    {x: 463600, y: 732000, z: 181.76}
  ];

var db = openDatabase('geodb', '1.0', 'Test DB', 2 * 1024 * 1024);
var msg;

db.transaction(function (tx) {
   tx.executeSql('CREATE TABLE IF NOT EXISTS COORDS (id unique, x, y, z)');

   for (var i in coords){
     tx.executeSql('INSERT INTO COORDS (id, x, y, z) VALUES (?, ?, ?, ?)', [i + 1, coords[i].x, coords[i].y, coords[i].z]);
     msg = 'Log message created and row inserted.';
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
    console.log('wsg84ToPuw92');
    //TODO conversion implementation
    var puw92x = 463600;
    var puw92y = 732000;
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
    console.log('findClosestPointAltitude');
    //var area = findClosestArea(x, y)
    var closestPointAlt, minDistance = 9999999;
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

    angular.forEach(coords, function(position){
      if (calculateDistance(x, position.x, y, position.y) < minDistance){
        minDistance = calculateDistance(x, position.x, y, position.y) < minDistance;
        closestPointAlt = position.z;
      }
    });
    return closestPointAlt;
  }

  function calculateDistance (x1, x2, y1, y2){
    console.log("calculateDistance");
    return (x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2);
  }

  function findAltitude(lat,long){
    console.log('findAltitude');
    var formattedCoords = wsg84ToPuw92(lat, long);
    x = formattedCoords.x;
    y = formattedCoords.y;
    z = findClosestPointAltitude(x, y);

    return z;
  }

  var get3dRoute = function(){
    console.log('get3dRoute');
    var route3d = [];
    angular.forEach(pathServ.get2dRoute(), function(position){
      var alt = findAltitude(position.lat, position.long);
      route3d.push({lat: position.lat, long: position.long, alt: alt});
      //console.log('Pushing lat:' + position.lat +  ", long: " + position.long + ", alt:" + alt);
    });
    return route3d;
  }

  return {
    get3dRoute: get3dRoute
  }
}]);
