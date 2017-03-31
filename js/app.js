// Base map
var mapboxLight = 'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2F6YXN0b24iLCJhIjoiY2loa21hNzRoMG50eHQ0bHp2azNpeHhwaiJ9.h81FekBCVUufbqxc9ywySQ';
var mapboxStreets = 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2F6YXN0b24iLCJhIjoiY2loa21hNzRoMG50eHQ0bHp2azNpeHhwaiJ9.h81FekBCVUufbqxc9ywySQ';
var mapboxBrum = 'https://api.mapbox.com/styles/v1/gazaston/cj0trhrvk00jj2rnprxencri0/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2F6YXN0b24iLCJhIjoiY2loa21hNzRoMG50eHQ0bHp2azNpeHhwaiJ9.h81FekBCVUufbqxc9ywySQ';
var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var osm = new L.TileLayer(mapboxBrum);

// var layer = new L.StamenTileLayer('toner-background');
var map = new L.Map('map', {
  center: new L.LatLng(52.485326, -1.895395),
  minZoom: 10,
  maxZoom: 17,
  zoom: 11,
  keyboard: false,
  boxZoom: false,
  doubleClickZoom: false,
  scrollWheelZoom: false,
  // maxBounds: [[33.154799,-116.586914],[50.190089,-77.563477]]
});
// Add base layer to group
map.addLayer(osm);

/* Initialize the SVG layer */
map._initPathRoot()

/* We simply pick up the SVG from the map object */
var svg = d3.select("#map").select("svg"),
  g = svg.append("g");

d3.json("/js/schools.json", function(collection) {
  /* Add a LatLng object to each item in the dataset */
  collection.objects.forEach(function(d) {
    d.LatLng = new L.LatLng(d.latitude,
      d.longitude)
  })

  var feature = g.selectAll("circle")
    .data(collection.objects)
    .enter().append("circle")
    .style("stroke", "black")
    .style("opacity", .6)
    .style("fill", "#8b2388")
    .attr("r", 6);

  map.on("viewreset", update);
  update();

  function update() {
    feature.attr("transform",
      function(d) {
        return "translate(" +
          map.latLngToLayerPoint(d.LatLng).x + "," +
          map.latLngToLayerPoint(d.LatLng).y + ")";
      }
    )
  }
});


// jQuery Geocodify
var maxY = 52.177046;
var minY = 52.746849;
var minX = -2.574778;
var maxX = -1.092997;

var search_marker;
var search_icon = L.AwesomeMarkers.icon({
  icon: 'icon-circle',
  color: 'green'
});

$("#geocoder").geocodify({
  onSelect: function(result) {
    // Extract the location from the geocoder result
    var location = result.geometry.location;
    // Call function and place markers, circle on map
    geocodePlaceMarkersOnMap(location);
  },
});

function milesToMeters(miles) {
  return miles * 1069.344;
};

var circle;

// This places marker, circle on map
function geocodePlaceMarkersOnMap(location) {
  // Center the map on the result
  map.setView(new L.LatLng(location.lat(), location.lng()), 13);

  // Remove circle if one is already on map
  if (circle) {
    map.removeLayer(circle);
  }

  // Create circle around marker with our selected radius
  // circle = L.circle([location.lat(), location.lng()], milesToMeters( $('#radius-selected').val() ), {
  //     color: '#8b2388',
  //     fillColor: '#8b2388',
  //     fillOpacity: 0.2,
  //     stroke: false,
  //     clickable: false
  // }).addTo(map);

  // Remove marker if one is already on map
  if (search_marker) {
    map.removeLayer(search_marker);
  }

  // Create marker
  search_marker = L.marker([location.lat(), location.lng()], {
    // Allow user to drag marker
    draggable: true,
    icon: search_icon
  });

  // Reset map view on marker drag
  search_marker.on('dragend', function(event) {
    map.setView(event.target.getLatLng());
    circle.setLatLng(event.target.getLatLng());

    // This will determine how many markers are within the circle
    // pointsInCircle( circle, milesToMeters( $('#radius-selected').val() ) );

    // Redraw: Leaflet function
    circle.redraw();

    // Clear out address in geocoder
    $('#geocoder-input').val('');
  });

  // This will determine how many markers are within the circle
  // Called when points are initially loaded
  // pointsInCircle( circle, milesToMeters( $('#radius-selected').val() ) );

  // Add marker to the map
  search_marker.addTo(map);

  // Close geocodePlaceMarkersOnMap
}