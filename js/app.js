// Base map
var mapboxLight = 'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2F6YXN0b24iLCJhIjoiY2loa21hNzRoMG50eHQ0bHp2azNpeHhwaiJ9.h81FekBCVUufbqxc9ywySQ';
var mapboxStreets = 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2F6YXN0b24iLCJhIjoiY2loa21hNzRoMG50eHQ0bHp2azNpeHhwaiJ9.h81FekBCVUufbqxc9ywySQ';
var mapboxBrum = 'https://api.mapbox.com/styles/v1/gazaston/cj0trhrvk00jj2rnprxencri0/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2F6YXN0b24iLCJhIjoiY2loa21hNzRoMG50eHQ0bHp2azNpeHhwaiJ9.h81FekBCVUufbqxc9ywySQ';
var CartoDB_Positron = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
var Esri_WorldGrayCanvas = 'http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';

var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var tiles = new L.TileLayer(CartoDB_Positron);

var map = new L.Map('map', {
  center: new L.LatLng(52.485326, -1.895395),
  minZoom: 10,
  maxZoom: 17,
  zoom: 11,
  keyboard: false,
  boxZoom: false,
  doubleClickZoom: true,
  scrollWheelZoom: false,
  zoomControl: false
});

var mapControl = new L.Control.Zoom({ position: 'topright' }).addTo(map);

// Add base layer to group
map.addLayer(tiles);

/* Initialize the SVG layer */
map._initPathRoot()

// Set up the tooltip div
var div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

var allCircles = L.layerGroup().addTo(map);

/* Get the SVG from the map object */
var svg = d3.select("#map").select("svg"),
  g = svg.append("g");

d3.json("/js/secondary_schools_list_with_lat_lon_and_fake_distances.json", function(collection) {
  /* Add a LatLng object to each item in the dataset */
  collection.objects.forEach(function(d) {
    d.LatLng = new L.LatLng(d.latitude,
      d.longitude)
  })

  var school = g.selectAll("circle")
    .data(collection.objects)
    .enter().append("circle")
    .style("opacity", .7)
    .style("fill", "#333")
    .attr("r", 4)
    .attr("id", function(d) { return 'dfe_' + d['DfE'] } )
    .attr("class", "school")
    .on("click", function(d) {
      showRadii(d);
      schoolInfo(d);
      // addSchoolToQueryString(d);
    })
    .on("mouseover", function(d) {
      div.transition()
        .duration(200)
        .style("opacity", .9);
      div.html(d["Establishment Name"])
        .style("left", (d3.event.pageX + 15) + "px")
        .style("top", (d3.event.pageY - 0) + "px");
    })
    .on("mouseout", function(d) {
      div.transition()
        .duration(500)
        .style("opacity", 0);
    });

  map.on("viewreset", updateSchool);

  updateSchool();

  function updateSchool() {
    school.attr("transform",
      function(d) {
        return "translate(" +
          map.latLngToLayerPoint(d.LatLng).x + "," +
          map.latLngToLayerPoint(d.LatLng).y + ")";
      }
    )
  }


  function showRadii(d) {

    if (!_.isEmpty(allCircles._layers)) {
      allCircles.clearLayers();
    }

    // console.log(allCircles);

    var radius1 = (d["Cut off Distances 2017"]);
    var radius2 = (d["Cut off Distance 2016"]);
    var radius3 = (d["Cut off Distance 2015"]);

    circle1 = L.circle(d.LatLng, radius1, {
      stroke: true,
      opacity: 1,
      fillColor: '#8b2388',
      className: "red",
      fillOpacity: 0.1,
      clickable: false,
      weight: 3,
    }).addTo(allCircles);

    circle2 = L.circle(d.LatLng, radius2, {
      stroke: true,
      opacity: 1,
      fillColor: '#8b2388',
      className: "green",
      fillOpacity: 0.1,
      clickable: false,
      weight: 3,
    }).addTo(allCircles);

    circle3 = L.circle(d.LatLng, radius3, {
      stroke: true,
      opacity: 1,
      fillColor: '#8b2388',
      className: "blue",
      fillOpacity: 0.1,
      clickable: false,
      weight: 3,
    }).addTo(allCircles);

  };

  function metresToKilometres(distance) {
    return distance / 1000;
  };

  function schoolInfo(d) {
    console.log(d);
    var clear = $("#clearMap");
    clear.css( "display", "inline-block" );
    clear.click(function() {
      $(this).css( "display", "none" );
    });
    document.getElementById('schoolInfo').innerHTML = " <h2 class='school-name'>" + 
      d["Establishment Name"] + 
      "</h2>" + 
      "<p>" + d["Street"] + ", " + d["Postcode"] +"</p>" +
      "<h4>" + "Cut-off distances:" + "</h4>" +
      "<h4><span class='radius-icon red'>&#8226;</span>2017: " + 
      metresToKilometres(d["Cut off Distances 2017"]) + 
      "km</h4>" +
      "<h4><span class='radius-icon green'>&#8226;</span>2016: " + 
      metresToKilometres(d["Cut off Distance 2016"]) + 
      "km</h4>" +
      "<h4><span class='radius-icon blue'>&#8226;</span>2015: " + 
      metresToKilometres(d["Cut off Distance 2015"]) + 
      "km</h4>" +
      "<br />"
  };

});

$("#clearMap").click(function() {
  allCircles.clearLayers();
  document.getElementById('schoolInfo').innerHTML = "";
})

// jQuery Geocodify

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
  regionBias: "GB"
});

function milesToMeters(miles) {
  return miles * 1069.344;
};



// This places marker, circle on map
function geocodePlaceMarkersOnMap(location) {
  // Center the map on the result
  map.setView(new L.LatLng(location.lat(), location.lng()), 13);

  // Remove marker if one is already on map
  if (search_marker) {
    map.removeLayer(search_marker);
  }

  // Create marker
  search_marker = L.marker([location.lat(), location.lng()], {
    icon: search_icon
  });

  // Add marker to the map
  search_marker.addTo(map);

  // Close geocodePlaceMarkersOnMap
};

function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

function geocodeFromParams() {
  postcode = getUrlParameter('postcode');
  if (postcode) {
    $('#geocoder-input').val(postcode).submit()
    setTimeout(function(){ 
      $('#geocoder-button').click();
    }, 100);
  }
};

function schoolFromParams(d) {
  school = getUrlParameter('school');
  if (school) {
    console.log(school);
  }
};

$( document ).ready(function() {
  geocodeFromParams();
  schoolFromParams();
});

// function addSchoolToQueryString(d) {
//   console.log(window.location.href)
//   window.history.pushState(null, null, window.location.href + "&school=dfe_" + d["DfE"]);
// }

// window.location = String(window.location).match(/(.*?)\?/)[1];
// window.location.href.replace("postcode="+postcode, "postcode="+"bar");

