var mapboxAccessToken = 'pk.eyJ1IjoiZGF2aWRuaHNoZCIsImEiOiJjajM3Z2pzcWgwMDYzMndwNzN5YWZwbGtkIn0.5G-G4jOqBBujnZiYP1tjVw';


var make_me_a_map = function(selector, labelmaker, colorchooser){

    function style(feature) {
        var color = colorchooser(feature.properties)

        return {
            fillColor: color,
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }

    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
        info.update(layer.feature.properties);

    }

    var map = L.map(selector).setView([52.505, -1.59], 6);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
        id: 'mapbox.light',
        attribution:'Team Cutsarrific 3'
    }).addTo(map);

    var info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed

    info.update = labelmaker
    info.addTo(map);


    var geojson;

    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }


    function resetHighlight(e) {
        geojson.resetStyle(e.target);

        info.update();

    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }

    geojson = L.geoJson(ccgData, {
        style: style,
        onEachFeature: onEachFeature,
    }).addTo(map);

};


var labelmaker = function (props) {
    this._div.innerHTML = '<h4>CCG Population</h4>'
	+  (props ? '<b>Region: ' + props.region + '</b><br />'
	    + '<b>CCG: ' + props.ccg_name + '</b><br />'
            + '<br />' + props.pop_per_surgery.toFixed(2) + ' population per surgery'
            + '<br />' + props.population + ' population total'
            : 'Hover over a CCG');
};

// This is obviously statically defined - you can dynamically set these as
// stages through your data if you know the uppper/lower/median etc
var colorchooser = function(p) {
    var d = p.pop_per_surgery;
        return d > 100000 ? '#800026' :
            d > 50000  ? '#BD0026' :
            d > 10000  ? '#E31A1C' :
            d > 6000  ? '#FC4E2A' :
            d > 5000  ? '#FD8D3C' :
            d > 2000   ? '#FEB24C' :
            d > 1000   ? '#FED976' :
            '#FFEDA0';
    }

// Like this:
//
// - The css selector for the element into which you want to insert a map
// - The fuction that makes the html for the string of html for the overlay.
//   This will get the CCG properties
// = The function to pick the color for this ccg. This will get the CCG properties
//
make_me_a_map('map', labelmaker, colorchooser)


// Example CCG properties:

  // "properties" : {
  //     "ccg_code" : "07L",
  //     "Name" : "07L",
  //     "ccg_name" : "NHS Barking &amp; Dagenham CCG",
  //     "pop_per_surgery" : 4676.190476190476,
  //     "no_of_practices" : 42,
  //     "no_of_lsoas" : 109,
  //     "population" : 196400,
  //     "region" : "London"
  //   },