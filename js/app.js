// Base map 
var CartoDB_Positron = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';

var tiles = new L.TileLayer(CartoDB_Positron);

// set up the leaflet.js map
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

// add a custom map controller
var mapControl = new L.Control.Zoom({ position: 'topright' }).addTo(map);

// Add base layer to group
map.addLayer(tiles);

/* Initialize the SVG layer */
map._initPathRoot()

// Set up the tooltip div
var div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// add the layerGroup to the map
var allCircles = L.layerGroup().addTo(map);

// Get the svg from the map object and append the d3 group svg element
var svg = d3.select("#map").select("svg"),
  g = svg.append("g");

// import the data
d3.csv("/data/all_schools_list_with_lat_lon_and_fake_distances.csv", function(collection) {
  // Add a LatLng object to each item in the dataset
  collection.forEach(function(d) {
    d.LatLng = new L.LatLng(d.latitude,
      d.longitude)
  })

  // make variables for each type of school by filtering the data
  var primary = collection.filter(function(d){ 
    return (d["Phase of Education"] === "Primary")
  });

  var secondary = collection.filter(function(d){ 
    return (d["Phase of Education"] === "Secondary")
  });

  // put the d3 code in a function
  function updateSchools(newData) {
    // bind data
    school = g.selectAll("circle")
      .data(newData)

    // add new elements
    school.enter().append("circle")

    // update existing elements
    school
      .style("opacity", .7)
      .style("fill", "#333")
      .attr("r", 4)
      .attr("id", function(d) { return 'dfe_' + d['DfE'] } )
      .attr("class", "school")
      .attr("transform",
        function(d) {
          return "translate(" +
            map.latLngToLayerPoint(d.LatLng).x + "," +
            map.latLngToLayerPoint(d.LatLng).y + ")";
        }
      )
      // show the radii and school info on click
      .on("click", function(d) {
        showRadii(d);
        schoolInfo(d);
      })
      // show the school name tooltip on mouseover
      .on("mouseover", function(d) {
        div.transition()
          .duration(200)
          .style("opacity", .9);
        div.html(d["Establishment Name"])
          .style("left", (d3.event.pageX + 15) + "px")
          .style("top", (d3.event.pageY - 0) + "px");
      })
      // hide the school name tooltip on mouseout
      .on("mouseout", function(d) {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      });

      // remove old d3 elements
      school.exit().remove();
    }

    // generate initial schools
    updateSchools(primary);

    // when the map is redrawn (e.g. on zoom, scroll) update the positions of schools
    map.on("viewreset", updateSchoolPositions);
    updateSchoolPositions();
    function updateSchoolPositions() {
      school.attr("transform",
        function(d) {
          return "translate(" +
            map.latLngToLayerPoint(d.LatLng).x + "," +
            map.latLngToLayerPoint(d.LatLng).y + ")";
        }
      )
    }

    // handle select onchange event
    d3.select('#phase')
      .on('change', function() {
        var newData = eval(d3.select(this).property('value'));
        updateSchools(newData);
        allCircles.clearLayers();
        $('#clearMap').css( "display", "none" );
        document.getElementById('schoolInfo').innerHTML = "";
    });

  function showRadii(d) {
    // clear the schools from the map when another is added
    if (!_.isEmpty(allCircles._layers)) {
      allCircles.clearLayers();
    }

    // load each year's cutoff distances into a variable
    var radius1 = (d["Cut off Distances 2017"]);
    var radius2 = (d["Cut off Distance 2016"]);
    var radius3 = (d["Cut off Distance 2015"]);

    // generate a circle for each cutoff distance
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
    // add each circle to the layerGroup
    }).addTo(allCircles);

  };

  // helper to convert meters to km
  function metresToKilometres(distance) {
    return distance / 1000;
  };

  // helper to convert miles to metres (unused, but left for posterity)
  function milesToMeters(miles) {
    return miles * 1069.344;
  };

  // render further info for each school into the sidebar when clicked on the map
  function schoolInfo(d) {
    var clear = $("#clearMap");
    // show the 'clear map' button when school info is displayed
    clear.css( "display", "inline-block" );
    // hide the 'clear map' button once clicked
    clear.click(function() {
      $(this).css( "display", "none" );
    });
    // render the school info to the sidebar
    document.getElementById('schoolInfo').innerHTML = " <h3 class='school-name'>" + 
      d["Establishment Name"] + 
      "</h3>" + 
      "<p>" + d["Street"] + ", " + d["Postcode"] +"</p>" +
      "<h5>" + "Cut-off distances:" + "</h5>" +
      "<h5><span class='radius-icon red'>&#8226;</span>2017: " + 
      metresToKilometres(d["Cut off Distances 2017"]) + 
      "km</h5>" +
      "<h5><span class='radius-icon green'>&#8226;</span>2016: " + 
      metresToKilometres(d["Cut off Distance 2016"]) + 
      "km</h5>" +
      "<h5><span class='radius-icon blue'>&#8226;</span>2015: " + 
      metresToKilometres(d["Cut off Distance 2015"]) + 
      "km</h5>" +
      "<br />"
  };

});

// handle the 'clear map' click event
$("#clearMap").click(function() {
  allCircles.clearLayers();
  document.getElementById('schoolInfo').innerHTML = "";
})

// jQuery Geocodify
var search_marker;
var search_icon = L.AwesomeMarkers.icon({
  icon: 'icon-circle',
  color: 'darkpurple'
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

// place the marker on map
function geocodePlaceMarkersOnMap(location) {
  // centre the map on the result
  map.setView(new L.LatLng(location.lat(), location.lng()), 13);

  // remove marker if one is already on map
  if (search_marker) {
    map.removeLayer(search_marker);
  }

  // Create marker
  search_marker = L.marker([location.lat(), location.lng()], {
    icon: search_icon
  });

  // Add marker to the map
  search_marker.addTo(map);

};




// WIP stuff

// function getUrlParameter(name) {
//   name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
//   var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
//   var results = regex.exec(location.search);
//   return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
// };

// function geocodeFromParams() {
//   postcode = getUrlParameter('postcode');
//   if (postcode) {
//     $('#geocoder-input').val(postcode).submit()
//     setTimeout(function(){ 
//       $('#geocoder-button').click();
//     }, 100);
//   }
// };

// function schoolFromParams(d) {
//   school = getUrlParameter('school');
//   if (school) {
//     console.log(school);
//   }
// };

// $( document ).ready(function() {
//   geocodeFromParams();
//   schoolFromParams();
// });

// function addSchoolToQueryString(d) {
//   console.log(window.location.href)
//   window.history.pushState(null, null, window.location.href + "&school=dfe_" + d["DfE"]);
// }

// window.location = String(window.location).match(/(.*?)\?/)[1];
// window.location.href.replace("postcode="+postcode, "postcode="+"bar");

