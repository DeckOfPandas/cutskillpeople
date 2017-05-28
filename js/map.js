var mapboxAccessToken = 'pk.eyJ1IjoiZGF2aWRuaHNoZCIsImEiOiJjajM3Z2pzcWgwMDYzMndwNzN5YWZwbGtkIn0.5G-G4jOqBBujnZiYP1tjVw';

var areaContent = document.getElementById('area-content');
var areaContentTitle = areaContent.querySelector('.js-area-title');
var areaContentText = areaContent.querySelector('.js-area-content');

var filters = document.getElementById('filters');

function init() {

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


  // Like this:
  //
  // - The css selector for the element into which you want to insert a map
  // - The fuction that makes the html for the string of html for the overlay.
  //   This will get the CCG properties
  // = The function to pick the color for this ccg. This will get the CCG properties
  //
  var splashMessage = document.querySelector('.splash-container');
  var splashCloser = splashMessage.querySelector('.js-close-splash');
  splashCloser.addEventListener('click', function(event) {
    event.preventDefault();
    splashMessage.className = "splash-container";
    filters.className = "loaded"
  });

  var byCCG = {}
  for (var ccg of rateData) {
    byCCG[ccg.CCG_Code] = ccg;
  }
  for (var ccgLayer of ccgData.features) {
    ccgLayer.properties.data = byCCG[ccgLayer.properties.ccg_code];
  }

  var theMap = new CCGMap('map-container', labelmaker);
}

class CCGMap {

  constructor(selector, labelmaker) {
    this.selectedArea = null;
    this.selectedYear = 2013;
    this.mapContainer = selector;
    this.initMap();
    this.initInfoBox();
    this.initFilters();
    this.layers = L.geoJson(ccgData, {
        style: this.style.bind(this),
        onEachFeature: this.onEachFeature.bind(this),
    }).addTo(this.map);
  }

  initMap() {
    this.map = L.map(this.mapContainer).setView([52.505, -1.59], 6);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
        id: 'mapbox.light',
        attribution:'Team Cutsarrific 3'
    }).addTo(this.map);
  }

  initInfoBox() {
    areaContent.querySelector('.close').addEventListener('click', function(e) {
      e.preventDefault();
      areaContent.className = '';
    });
  }

  initFilters() {
    var yearToggles = filters.querySelectorAll('.selector-option');
    for(var year of yearToggles) {
      year.addEventListener('click', function(e) {
        e.preventDefault();
        for(var toggle of yearToggles) {
          toggle.className = "selector-option";
        }
        this.selectedYear = e.target.dataset.year;
        e.target.className = "selector-option selected";
        this.redraw();
      }.bind(this));
    };
  }

  style(feature) {
      var color = this.colorChooser(feature.properties)
      return {
          fillColor: color,
          weight: 2,
          opacity: 1,
          color: 'white',
          fillOpacity: 0.7
      };
  }

  showDetails(e) {
    areaContentTitle.innerHTML = e.target.feature.properties.ccg_name;
    areaContent.className = "loaded";
  }

  highlightFeature(e) {
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

  resetHighlight(e) {
      this.geojson.resetStyle(e.target);
      info.update();
  }

  onEachFeature(feature, layer) {
      layer.on({
          click: this.showDetails.bind(this)
      });
  }

  colorChooser(props) {
      if(this.selectedYear == 2013) {
          try {
            var d = props.data["Rate_Apr13"];
          } catch(e) {
            var d = null;
          }

      } else {
        try {
          var d = props.data["Rate_Mar17"];
        } catch(e) {
          var d = null;
        }

      }
      return d >= 0.92 ? '#66BC29' : d < 0.92 ? '#A01010' : '#D8DFD8';
  }

  redraw() {
    this.layers.eachLayer(function(layer) {
      layer.setStyle(this.style(layer.feature));
    }.bind(this));
  }

}

var labelmaker = function (props) {
    this._div.innerHTML = '<h4>CCG Population</h4>'
	+  (props ? '<b>Region: ' + props.region + '</b><br />'
	    + '<b>CCG: ' + props.ccg_name + '</b><br />'
            + '<br />' + props.pop_per_surgery.toFixed(2) + ' population per surgery'
            + '<br />' + props.population + ' population total'
            : 'Hover over a CCG');
};

init();
