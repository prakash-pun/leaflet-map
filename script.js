var map = L.map("map", {
  zoomControl: true,
}).setView([28.213248, 83.9876608], 15);

const attribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

L.tileLayer(tileUrl, {
  attribution: attribution,
  detectRetina: true,
}).addTo(map);

lc = L.control
  .locate({
    strings: {
      title: "Show me where I am, yo!",
    },
  })
  .addTo(map);

var searchControl = L.esri.Geocoding.geosearch().addTo(map);

var results = L.layerGroup().addTo(map);
searchControl.on("results", function (data) {
  results.clearLayers();
  for (var i = data.results.length - 1; i >= 0; i--) {
    results.addLayer(L.marker(data.results[i].latlng));
    control.spliceWaypoints(0, 1, data.latlng);
  }
});

function createButton(label, container) {
  var btn = L.DomUtil.create("button", "", container);
  btn.setAttribute("type", "button");
  btn.innerHTML = label;
  return btn;
}

map.on("click", function (e) {
  var container = L.DomUtil.create("div"),
    startBtn = createButton("Start from this location", container),
    endBtn = createButton("Go to this location", container);

  L.popup().setContent(container).setLatLng(e.latlng).openOn(map);
  L.DomEvent.on(startBtn, "click", function () {
    control.spliceWaypoints(0, 1, e.latlng);
    map.closePopup();
  });

  L.DomEvent.on(endBtn, "click", function () {
    control.spliceWaypoints(control.getWaypoints().length - 1, 1, e.latlng);
    map.closePopup();
  });
});

var greenIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

var redIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

var blueIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

var control = L.Routing.control({
  waypoints: [],
  createMarker: function (waypointIndex, waypoint, numberOfWaypoints) {
    if (waypointIndex === 0) {
      return L.marker(waypoint.latLng, {
        draggable: true,
        icon: greenIcon,
      }).bindPopup("Start");
    } else if (waypointIndex === numberOfWaypoints - 1) {
      return L.marker(waypoint.latLng, {
        icon: redIcon,
        draggable: true,
      }).bindPopup("End");
    } else {
      return L.marker(waypoint.latLng, {
        icon: blueIcon,
      });
    }
  },

  routeWhileDragging: true,
  reverseWaypoints: true,
  showAlternatives: true,
  autoRoute: true,
  altLineOptions: {
    styles: [
      {
        color: "black",
        opacity: 0.15,
        weight: 10,
      },
      {
        color: "white",
        opacity: 0.8,
        weight: 7,
      },
      {
        color: "blue",
        opacity: 0.5,
        weight: 3,
      },
    ],
  },

  geocoder: L.Control.Geocoder.nominatim(),
  waypointNameFallback: function (latLng) {
    function zeroPad(n) {
      n = Math.round(n);
      return n < 10 ? "0" + n : n;
    }

    function sexagesimal(p, pos, neg) {
      var n = Math.abs(p),
        degs = Math.floor(n),
        mins = (n - degs) * 60,
        secs = (mins - Math.floor(mins)) * 60,
        frac = Math.round((secs - Math.floor(secs)) * 100);
      return (
        (n >= 0 ? pos : neg) +
        degs +
        "°" +
        zeroPad(mins) +
        "'" +
        zeroPad(secs) +
        "." +
        zeroPad(frac) +
        '"'
      );
    }
    return (
      sexagesimal(latLng.lat, "N", "S") +
      " " +
      sexagesimal(latLng.lng, "E", "W")
    );
  },
}).addTo(map);

control
  .on("routesfound", function (e) {
    var routes = e.routes;
    console.log("Found " + routes.length + " route(s).");
    distance = e.routes[0].summary.totalDistance;
    var routeDistance = Math.round(distance / 100) / 10 + " km";
    time = e.routes[0].summary.totalTime;
    start = e.routes[0].waypoints[0].name;
    end = e.routes[0].waypoints[1].name;

    startpoint = e.routes[0].inputWaypoints[0].latLng;
    var starting = [startpoint.lat, startpoint.lng];
    endpoint = e.routes[0].inputWaypoints[1].latLng;
    var destination = [endpoint.lat, endpoint.lng];

    var distance = document.getElementById("distance");
    var total = routeDistance;
    distance.innerHTML = total;

    var startLoc = document.getElementById("start");
    var loc = start;
    startLoc.innerHTML = loc;

    var startPoint = document.getElementById("startLatlng");
    var startLatLng = starting;
    startPoint.innerHTML = startLatLng;

    var endPoint = document.getElementById("endLatlng");
    var endLatLng = destination;
    endPoint.innerHTML = endLatLng;
  })
  .addTo(map);

control.on("routesfound", function (e) {
  var waypoints = e.waypoints || [];
  var destination = waypoints[waypoints.length - 1];
  var end = destination.name;
  var endLoc = document.getElementById("end");
  var loc = end;
  endLoc.value = loc;
});

L.Routing.errorControl(control).addTo(map);

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(function (position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    console.log(lat, lon);
    var marker = L.marker([lat, lon]).addTo(map);
    L.circle([
      lat,
      lon,
      {
        radius: 1000,
        opacity: 1,
        color: "white",
        weight: 1,
        fillOpacity: 1,
        fillColor: "blue",
      },
    ]).addTo(map);
  });
} else {
  console.log("geolocation not available");
}
