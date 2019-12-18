//MapForm.jsx
import React, { Component } from 'react';
import { Map, TileLayer, FeatureGroup, Popup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import DynamicForm from './DynamicForm';
import { compose } from 'recompose';
import { withStyles, Typography } from '@material-ui/core';
import equal from 'fast-deep-equal';
import { getFirstCoordinate } from '../../_tools/funcs';
import * as Constants from '../../_constants/index';

const styles = {
  mapDisplay: {
    height: '600px',
    width: 'auto',
  },
  mapPopup: {
    width: '260px',
  },
  mapTitle: {
    marginTop: '2em',
    marginBottom: '2em',
  },
};
//NOTE: adding returns in the arrow functions somehow breaks the map.  the warnings will persist for now.
//TODO: some duplicate processing occurs here and needs to be refactored.
class MapForm extends Component {
  constructor(props) {
    super(props);
    console.log('imported props from parent in MapForm is: ', this.props);
    this.state = {
      geo: props.recordGeo ? props.recordGeo : {},
      mapRef: null,
      mapLoading: true,
      features: {},
      notDisplayedFeatures: [],
      popup: { active: false, for: '' },
      prevProperties: {},
    };
    this.updateGeo = this.updateGeo.bind(this);
    this._updateFeatures = this._updateFeatures.bind(this);
    this.featuresCallback = this.featuresCallback.bind(this);
    this.success = this.success.bind(this);
    this._onPopupClose = this._onPopupClose.bind(this);
  }

  error(err) {
    console.warn(`Error in loading location: ${err.code}): ${err.message}`);
  }

  //here is where we handle different data management cases for features
  featuresCallback = layer => {
    const { features } = this.state
    if (typeof layer === 'string') {
      const featureList = { ...features };
      delete featureList[layer];
      this._updateFeatures(featureList);
    } else if (typeof layer === 'object') {
      const newFeature = { ...features };
      newFeature[layer.id] = layer;
      this._updateFeatures(newFeature);
    } else {
      console.error('featuresCallback called with unexpected data');
    }
  };

  //given a layer, translate its data into the appropriate data format.
  _generateFeature = layer => {
    //NOTE: valid geojson in leaflet requires coordinates to be in the format of LNG/LAT.
    let coords = [];
    if (layer._latlng) {
      coords = [this._normLng(layer._latlng.lng), layer._latlng.lat];
    }
    //if we have an object on the second layer down, this is a polyline.
    else if (
      layer._latlngs &&
      typeof layer._latlngs[0] === 'object' &&
      layer._latlngs[0].lat
    ) {
      layer._latlngs.map(coord => {
        coords = [...coords, [this._normLng(coord.lng), coord.lat]];
        return coord;
      });
    }
    //if we have an object on the third layer down, it's a polygon.
    //NOTE that this also means there is no current support for polygons within polygons.  This is not a priority for us right now.
    else if (
      layer._latlngs &&
      layer._latlngs[0].length >= 1 &&
      typeof layer._latlngs[0][0] === 'object'
    ) {
      coords.push([]);

      layer._latlngs[0].map(coord => {
        coords = [[...coords[0], [this._normLng(coord.lng), coord.lat]]];
        return coord;
      });

      //if the last point is unequal to the first, we need to correct this to create valid geojson
      if (coords[0][0] !== coords[0][coords[0].length - 1]) {
        coords[0].push(coords[0][0]);
      }
    } else {
      console.error(
        'Layer: ',
        layer,
        'sent to _generateFeature is not a marker, polygon, or polyline.'
      );
      return {};
    }

    console.log('layer in _generateFeature is: ', layer);

    let newFeature = {
      id: layer._leaflet_id, //may have to remove before submission to API
      type: 'Feature',
      geometry: {
        type:
          typeof coords[0] === 'number'
            ? 'Point'
            : typeof coords[0][0] === 'number'
            ? 'LineString'
            : 'Polygon',
        coordinates: coords,
      },
    };
    return newFeature;
  };

  //latitude should never require normalizing, but a bug exists in Leaflet that causes the map to repeat itself longitudinally.
  _normLng(lng) {
    return lng % 180;
  }

  //TODO: there is a bug that will result in multiple edits not updating all item details, as the form only appears once.
  //this can be resolved using a Promise, but it's not a high priority right now and will be shelved.
  //ADM-1496
  setProperties = featureParams => {
    const { features, popup } = this.state
    const featureList = { ...features };
    featureList[popup.for].properties = featureParams;
    this._updateFeatures(featureList);
    this.setState({ prevProperties: {} });
    this.setState({ popup: { active: false, for: '' } });
  };

  success = pos => {
    //if there are no features, default our location to the user's location.
    const {mapLoading, geo } = this.state
    if (mapLoading) {
      let latLng = [pos.coords.latitude, pos.coords.longitude];

      if (
        geo &&
        geo.geojson &&
        geo.geojson.features &&
        geo.geojson.features.length > 0
      ) {
        console.log(
          'geojson before feature parse is: ',
          geo.geojson
        );
        const firstFeature = geo.geojson.features[0];

        if (firstFeature.geometry.type === 'Point') {
          latLng = [
            firstFeature.geometry.coordinates[1],
            firstFeature.geometry.coordinates[0],
          ];
        } else if (
          firstFeature.geometry.type === 'LineString' ||
          firstFeature.geometry.type === 'MultiPoint'
        ) {
          latLng = [
            firstFeature.geometry.coordinates[0][1],
            firstFeature.geometry.coordinates[0][0],
          ];
        } else if (
          firstFeature.geometry.type === 'Polygon' ||
          firstFeature.geometry.type === 'MultiLineString'
        ) {
          latLng = [
            firstFeature.geometry.coordinates[0][0][1],
            firstFeature.geometry.coordinates[0][0][0],
          ];
        } else if (firstFeature.geometry.type === 'MultiPolygon') {
          latLng = [
            firstFeature.geometry.coordinates[0][0][0][1],
            firstFeature.geometry.coordinates[0][0][0][0],
          ];
        } else {
          console.error(
            'Unknown feature type loaded, defaulting map to user location.  Feature: ',
            firstFeature
          );
        }
      }
      //normalize before setting our location - the map coordinate for map location display is [lat, lng], though elsewhere coords are stored [lng, lat].
      latLng[1] = this._normLng(latLng[1]);
      this.setState({ location: latLng });
    }
  };

  _updateFeatures = feature => {
    const { features, notDisplayedFeatures } = this.state
    this.setState({ ...features, features: feature });
    console.log('in _updateFeatures, state is now: ', this.state);
    this.updateGeo();
  };

  updateGeo = () => {
    const {id, content_type, geoDataCallback} = this.props
    const { features, notDisplayedFeatures } = this.state
    //there are values in Geo that we don't care for in the API.

    let featuresList = [];
    Object.keys(features).map(key => {
      featuresList.push(features[key]);
      return key;
    });

    //TODO: case of features that leaflet cannot display (multipolygon, multipoint, multilinestring)
    console.log(
      'in updategeo, notdisplayedfeatures is: ',
      notDisplayedFeatures
    );
    Object.keys(notDisplayedFeatures).map(key => {
      featuresList.push(notDisplayedFeatures[key]);
      return key;
    });

    console.log('full featureslist before push is:', featuresList);
    let localGeo = {};
    if (featuresList.length > 0) {
      localGeo = {
        object_id: id,
        content_type: content_type,
        geojson: {
          type: 'FeatureCollection',
          features: featuresList,
        },
      };
    }
    this.setState({ geo: localGeo });
    geoDataCallback(localGeo);
  };

  _onCreated = e => {
    let layer = e.layer;

    //maybe should change from collecting features to collecting layers instead, but this does in fact work.
    layer.on({
      click: this._onLayerClick.bind(this),
    });
    layer.feature = this._generateFeature(layer);
    this.setState({ location: getFirstCoordinate(layer) }); //TODO: there has to be a way to remove this one as well.
    this.setState({ prevProperties: {} });
    this.setState(
      { popup: { active: true, for: layer.feature.id } },
      this.featuresCallback(layer.feature)
    );
  };

  _onDeleted = e => {
    console.log('ondeleted event e:', e);
    Object.keys(e.layers._layers).map(key => {
      this.featuresCallback(key);
      return key;
    });
  };
  //block / unblock popup display
  _onDeleteStart = e => {
    this.setState({ blockPopup: true });
  };
  _onDeleteStop = e => {
    this.setState({ blockPopup: false });
  };

  //get all edited values and push them up to the update function.
  //this occurs when we hit 'Save' after editing
  _onEdited = e => {
    const { features } = this.state
    Object.keys(e.layers._layers).map(item => {
      let layer = e.layers._layers[item]; //this specific edited item
      //preform a lookup for the previous properties of this object and throw them into state if they exist
      let newFeature = this._generateFeature(layer);
      newFeature.properties = features[item].properties; //carry over old properties
      this.featuresCallback(newFeature);
    });
  };

  //this is where we would put info display / editing for features.
  _onLayerClick = e => {
    const { features, blockPopup } = this.state
    var layer = e.target;
    let prevProperties = features[layer._leaflet_id].properties
      ? features[layer._leaflet_id].properties
      : {};

    console.log('layer clicked with value e: ', e, 'and state: ', this.state);

    if (!blockPopup) {
      this.setState({ location: [e.latlng.lat, e.latlng.lng] });
      this.setState({ prevProperties: prevProperties });
      this.setState({ popup: { active: true, for: layer._leaflet_id } });
    }
  };

  //https://stackoverflow.com/questions/52684688/importing-geojson-to-react-leaflet-draw
  _onFeatureGroupReady = ref => {
    const { mapLoading, geo } = this.state
    if (ref === null || !mapLoading) {
      return;
    }

    if (
      geo &&
      geo.geojson &&
      geo.geojson.features &&
      geo.geojson.features.length > 0
    ) {
      //features must be loaded in one at a time, not in bulk.
      let localFeatures = {};
      let output = {};
      let notDisplayedFeatures = [];

      geo.geojson.features.map(feature => {
        let leafletGeoJSON = new L.GeoJSON(feature);

        leafletGeoJSON.eachLayer(layer => {
          const layerType = layer.feature.geometry.type;

          if (
            layerType === 'LineString' ||
            layerType === 'Polygon' ||
            layerType === 'Point'
          ) {
            //add layer to the map
            output = ref.leafletElement.addLayer(layer);
            layer.on({
              click: this._onLayerClick.bind(this),
            });
          } else {
            //alert(`Map does not support feature type ${layerType} for feature: ${layer.feature.id} in data.  This value will be stored but not displayed on the map.`)
            //multi___ are unsupported by Leaflet.js itself, but maybe we can patch it on top?
            //when a multipoint is created,
            notDisplayedFeatures = [...notDisplayedFeatures, layer.feature];

            //console.log("layer to not be editable is: ", layer)
            //console.log("feature to not display is: ", layer.feature.properties.name)
            //output = ref.leafletElement.addLayer(layer)
            /*
                                layer.on({
                                    click: this._onLayerClick.bind(this)
                                })*/
          }
        });
        return feature;
      });
      //initialize our features
      Object.keys(output._layers).map(key => {
        //the solution for multi_ values is likely here.
        output._layers[key].feature.id = key;
        localFeatures[key] = output._layers[key].feature;
        return key;
      });

      if (notDisplayedFeatures.length > 0) {
        alert(
          "There is at least one Multi feature in your geoJSON dataset This information will not be Editable or Viewable on this Edit page, but may be viewed on this item's Show page."
        );
        console.log('notdisplayedfeatures prompt is: ', notDisplayedFeatures);
        console.log('localfeatures prompt is: ', localFeatures);
      }
      this.setState({ features: localFeatures }, () =>
        this.setState({ notDisplayedFeatures: notDisplayedFeatures })
      );
    }
    this.setState({ mapLoading: false });
  };

  _onPopupClose = () => {
    this.setState({ prevProperties: {} });
    this.setState({ popup: { active: false, for: '' } });
  };

  _setMapRef = ref => {
    this.setState({ mapRef: ref });
    if (ref) {
        console.log('mapref is: ', ref);
        console.log('ref leafletelement is: ', ref.leafletElement);
    }
  };

  render() {

    const {classes} = this.props
    const { location, mapRef, popup, prevProperties } = this.state

    navigator.geolocation.getCurrentPosition(this.success, this.error, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });

    return (
      <React.Fragment>
        {location && location.length > 0 && (
          <React.Fragment>
            <Typography className={classes.mapTitle} component={'p'}>
              {`Geolocation Map Input`}
            </Typography>
            <Map
              ref={ref => {
                if (!mapRef) {
                  this._setMapRef(ref);
                }
              }}
              center={location}
              className={classes.mapDisplay}
              zoom={
                mapRef && mapRef.leafletElement
                  ? mapRef.leafletElement.getZoom()
                  : 7
              }
              minZoom={4}
              maxZoom={13}
              noWrap={true}
            >
              <TileLayer
                attribution={
                  'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC'
                }
                userAgent={navigator.userAgent}
                url={Constants.OSMTILEURL}
              />

              <FeatureGroup
                ref={reactFGref => {
                  this._onFeatureGroupReady(reactFGref);
                }}
              >
                <EditControl
                  position="topleft"
                  onCreated={this._onCreated}
                  onEdited={this._onEdited}
                  onDeleted={this._onDeleted}
                  onDeleteStart={this._onDeleteStart}
                  onDeleteStop={this._onDeleteStop}
                  draw={{
                    rectangle: false,
                    circle: false,
                    circlemarker: false,
                  }}
                />
              </FeatureGroup>

              {popup.active && (
                <Popup
                  className={classes.mapPopup}
                  position={location}
                  onClose={this._onPopupClose}
                >
                  <DynamicForm
                    prevProperties={prevProperties}
                    setProperties={this.setProperties}
                  />
                </Popup>
              )}
            </Map>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

const enhance = compose(withStyles(styles));
export default enhance(MapForm);
