//MapView.jsx
import React, { useState, useEffect } from 'react'
import compose from 'recompose/compose';
import { FeatureGroup, Map, Popup, TileLayer } from 'react-leaflet';
import L from "leaflet";
import Typography from "@material-ui/core/Typography"
import Divider from "@material-ui/core/Divider"
import withStyles from '@material-ui/core/styles/withStyles';
import {LINKS} from "../../_constants/index"

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
        
    },
    locationTitle: {
        paddingTop: "1em",
        marginBottom: "1em",
    }
  };

//display map data, but prevent any interaction.
const MapView = ({classes, record }) => {
    const [popup, setPopup] = useState({active: false, for: ""})
    const [location, setLocation] = useState([])
    const [mapLoading, setMapLoading] = useState(true)
    const [curFeature, setCurFeature] = useState({})
    const [mapRef, setMapRef] = useState(null)

    let _isMounted = true
    useEffect(() => {
        return function cleanup() {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            _isMounted = false
        }
    }, [])

    //this is where we would put info display / editing for features.
    function _onLayerClick(e) {
        if (_isMounted)
        {
            var layer = e.target;
            setLocation([e.latlng.lat, e.latlng.lng])
            setCurFeature(layer.feature)
            setPopup({active: true, for: layer._leaflet_id})
        }
    }

    function _onPopupClose() {
        if (_isMounted){
            setPopup({popup: {active: false, for: ""}})
        }
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
                            //console.log("loading feature layer: ", layer)
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
        if (_isMounted)
        {setMapLoading(false)}
        
    }

    //leaflet maps repeat longitudinally, so they must be normalized
    function normLng(lng){
        //this only works in javascript because it takes modded negative values in a specific way.
        return lng % 180
    }

    function success(pos) {
        //if we have some geometry already, default to the first location given.
        if (mapLoading){
            let latLng = [pos.coords.latitude, pos.coords.longitude]

            if (record.geo && record.geo.geojson && record.geo.geojson.features && record.geo.geojson.features.length > 0) {
                const firstFeature = record.geo.geojson.features[0]

                if (firstFeature.geometry.type === 'Point'){
                    latLng = [firstFeature.geometry.coordinates[1], firstFeature.geometry.coordinates[0]]
                }
                else if (firstFeature.geometry.type === 'LineString'){
                    latLng = [firstFeature.geometry.coordinates[0][1], firstFeature.geometry.coordinates[0][0]]
                }
                else if (firstFeature.geometry.type === 'Polygon'){
                    latLng = [firstFeature.geometry.coordinates[0][0][1], firstFeature.geometry.coordinates[0][0][0]]
                }
                else{
                    console.error("Invalid feature type loaded, defaulting map to user location.  Feature: ", firstFeature)
                }
            }

            latLng[1] = normLng(latLng[1])

            if (_isMounted){
                setLocation(latLng)
                setMapLoading(false)
            }
        }
    }

    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }

    //get the user's current location if they allow us.
    navigator.geolocation.getCurrentPosition(success, error, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
    });

    return(
        <>
            {location && location.length > 0 && (
            <>
                <Typography variant={"h5"} component={"h5"} className={classes.locationTitle}>
                    {`Geolocation Info`}
                </Typography>
                <Map
                ref={(ref) => {
                    if (_isMounted){
                        setMapRef(ref)
                    }
                }}
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
                        url={LINKS.OSMTILEURL}
                        //url="https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}"
                    />

                    <FeatureGroup ref = {(reactFGref) =>{_onFeatureGroupReady(reactFGref);}} />

                    {popup && popup.active &&
                        <Popup className={classes.mapPopup}
                            position = {location}
                            onClose={_onPopupClose}
                        >
                            {curFeature.properties && 
                                <>
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
                                </>
                            }
                        </Popup>
                    }
                </Map>
                </>
            )}
        </>
    )
}
const enhance = compose(withStyles(styles));

export default enhance(MapView);