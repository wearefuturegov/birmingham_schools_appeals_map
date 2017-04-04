# Birmingham School Admissions

## A data-driven javascript app that:

* displays a map of the Birmingham area
* plots school locations on the map
* shows the school name on hover
* shows the acceptance distances for the previous three years as radii on the map
* shows the school info plus acceptance distances numerically 
* allows the user to enter a postcode to centre upon their own address to show acceptance distances that overlap

## How it works:

* map tiles are from [CartoDB](https://carto.com/location-data-services/basemaps/)
* locations are plotted using [leaflet.js](http://leafletjs.com/)
* data is parsed and manipulated using [d3.js](https://d3js.org/)
* geocoding is handled by [jQuery-geocodify](https://github.com/datadesk/jquery-geocodify)

## To-dos:

* the app currently uses fake data from `/data/all_schools_list_with_lat_lon_and_fake_distances.csv`
* the council should add its own google maps API key to the `<head>` of `index.html` 

## Possible improvements:

* `app.js` could probably be cleaned up and more stuff abstracted into functions
* have a way to display a location and a highlighted school from a query string, to make such combinations more shareable
* move cdn-linked files to locally referenced