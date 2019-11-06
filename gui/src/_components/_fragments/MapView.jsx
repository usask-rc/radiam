//MapView.jsx
import React, { useState, useEffect } from 'react'
import compose from 'recompose/compose';
import { FeatureGroup, Map, Popup, TileLayer } from 'react-leaflet';
import L from "leaflet";
import { Typography, Divider } from '@material-ui/core';
import withStyles from '@material-ui/core/styles/withStyles';
import * as Constants from "../../_constants/index"

const styles = {
    mapDisplay: {
        height: '600px',
        width: 'auto',
    },
    mapPopup: {
        width: '260px',
    },
    mapContainer: {
        width: 'auto',
        height: '600px',
    },
    mapPopupTitle: {
        fontDecoration: 'bold',
    },
    mapPopupDetails: {
        
    }
  };

//display map data, but prevent any interaction.
const MapView = ({ classes, record }) => {
    const [popup, setPopup] = useState({active: false, for: ""})
    const [location, setLocation] = useState([])
    const [mapLoading, setMapLoading] = useState(true)
    const [curFeature, setCurFeature] = useState({})
    const [mapRef, setMapRef] = useState(null)

    useEffect(() => {
        return function cleanup() {
            if (mapRef){
                console.log("mapRef is: ", mapRef)
            }

        }
    }, [])

    //this is where we would put info display / editing for features.
    function _onLayerClick(e) {
        var layer = e.target;

        setLocation([e.latlng.lat, e.latlng.lng])
        setCurFeature(layer.feature)
        setPopup({active: true, for: layer._leaflet_id})
    }

    function _onPopupClose() {
        setPopup({popup: {active: false, for: ""}})
    }

    //https://stackoverflow.com/questions/52684688/importing-geojson-to-react-leaflet-draw
    function _onFeatureGroupReady(ref) {

        if (ref === null || !mapLoading){
            return;
        }
        
        const _editableFG = ref;

            if (record.geo && record.geo.geojson && record.geo.geojson.features && record.geo.geojson.features.length > 0){
                //features must be loaded in one at a time, not in bulk.
                let localFeatures = {}
                let output = {}
                record.geo.geojson.features.map(feature => {
                    let leafletGeoJSON = new L.GeoJSON(feature);
                    let leafletFG = _editableFG.leafletElement
                
                leafletGeoJSON.eachLayer(layer => 
                    {
                        console.log("loading feature layer: ", layer)
                        //add layer to the map
                        output = leafletFG.addLayer(layer)

                        layer.on({
                            click: _onLayerClick.bind(this)
                        })
                        return layer
                    }
                    );
                    return feature
                })
                //initialize our features
                Object.keys(output._layers).map(key => {
                    let feature = output._layers[key].feature
                    feature.id = key
                    localFeatures[key] = feature
                    return key
                })
            }
        setMapLoading(false)
        
    }

    //latitude should never require normalizing, but a bug exists in Leaflet that causes the map to repeat itself longitudinally.
    function normLng(lng){
        //this only works in javascript because it takes modded negative values in a specific way.
        return lng % 180
    }

    function success(pos) {
        //if there are no features, default our location to the user's location.

        if (mapLoading){
            let latLng = [pos.coords.latitude, pos.coords.longitude]

            if (record.geo && record.geo.geojson && record.geo.geojson.features && record.geo.geojson.features.length > 0) {
                const firstFeature = record.geo.geojson.features[0]

                if (firstFeature.geometry.type === 'Point'){
                    latLng = [firstFeature.geometry.coordinates[1], firstFeature.geometry.coordinates[0]]
                }
                else if (firstFeature.geometry.type === 'LineString' || firstFeature.geometry.type === 'MultiPoint'){
                    latLng = [firstFeature.geometry.coordinates[0][1], firstFeature.geometry.coordinates[0][0]]
                }
                else if (firstFeature.geometry.type === 'Polygon' || firstFeature.geometry.type === 'MultiLineString'){
                    latLng = [firstFeature.geometry.coordinates[0][0][1], firstFeature.geometry.coordinates[0][0][0]]
                }
                else if (firstFeature.geometry.type === 'MultiPolygon'){
                    latLng = [firstFeature.geometry.coordinates[0][0][0][1], firstFeature.geometry.coordinates[0][0][0][0]]
                }
                else{
                    console.error("Unknown feature type loaded, defaulting map to user location.  Feature: ", firstFeature)
                }
            }

            //normalize before setting our location - the map coordinate for map location display is [lat, lng], though elsewhere coords are stored [lng, lat].
            latLng[1] = normLng(latLng[1])
            setLocation(latLng)
            setMapLoading(false)
        }

    }

    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }

    navigator.geolocation.getCurrentPosition(success, error, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
    });

    return(
        <React.Fragment>
            {location && location.length > 0 && (
            <React.Fragment>
                <Typography variant={"h5"} component={"h5"}>
                    {`GeoJSON Map Data`}
                </Typography>
                <Map
                ref={(ref) => {setMapRef(ref)}}
                center={location}
                className={classes.mapDisplay}
                zoom={mapRef && mapRef.leafletElement ? mapRef.leafletElement.getZoom() : 7}
                minZoom={4}
                maxZoom={13}
                noWrap={true}
                >
                    <TileLayer
                        attribution={
                        'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC'
                        }
                        url={Constants.OSMTILEURL}
                        //url="https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}"
                    />

                    <FeatureGroup ref = {(reactFGref) =>{_onFeatureGroupReady(reactFGref);}} />

                    {popup && popup.active &&
                    <Popup className={classes.mapPopup}
                    position = {location}
                    onClose={_onPopupClose}
                    >
                    {curFeature.properties && 
                    <React.Fragment>
                        <Typography variant="h5" className={classes.mapPopupTitle}>
                            {`Feature Data:`}
                        </Typography>
                        <Divider/>
                        {Object.keys(curFeature.properties).map(key => {
                            return(
                            <Typography key={`popup-${curFeature.properties[key]}`} className={classes.mapPopupDetails}>
                                {`${key} : ${curFeature.properties[key]}`}
                            </Typography>
                            );
                        })}
                        </React.Fragment>
                    }
                    </Popup>
                    }
                </Map>
                </React.Fragment>
            )}
        </React.Fragment>
    )
}
const enhance = compose(withStyles(styles));

export default enhance(MapView);