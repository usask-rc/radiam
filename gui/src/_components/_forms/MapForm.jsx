import React, { Component } from 'react'
import { Map, TileLayer, FeatureGroup, Popup } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw"
import L from "leaflet";
import DynamicForm from './DynamicForm';
import { compose } from 'recompose';
import { withStyles } from '@material-ui/core';
import equal from "fast-deep-equal"

const styles = {
    mapDisplay: {
        height: '600px',
        width: 'auto',
    },
    mapPopup: {
        width: '260px',
    }
  };
//NOTE: adding returns in the arrow functions somehow breaks the map.  the warnings will persist for now.
//TODO: some duplicate processing occurs here and needs to be refactored.
class MapForm extends Component {
    constructor(props){
        super(props);
        console.log("imported props from parent in MapForm is: ", this.props)
        this.state = {geo: props.recordGeo ? props.recordGeo : {}, mapLoading: true, features: {}, popup:{active:false, for:""}, prevProperties: {}}
        this.updateGeo = this.updateGeo.bind(this)
        this._updateFeatures = this._updateFeatures.bind(this)
        this.featuresCallback = this.featuresCallback.bind(this)
        this.success = this.success.bind(this)
        this._onPopupClose = this._onPopupClose.bind(this)
    }

    componentDidUpdate(prevProps, prevState, snapshot){
        if (!equal(prevState.geo, this.state.geo)){
            console.log("geo has updated in mapform.  new state: ", this.state)
        }
    }

    error(err) {
        console.warn(`Error in loading location: ${err.code}): ${err.message}`);
    }

    //here is where we handle different data management cases for features
    featuresCallback = (layer) => {
        console.log("feature sent to featurescallback is: ", layer)
        if (typeof layer === 'string'){
            const featureList = {...this.state.features};
            delete featureList[layer]
            this._updateFeatures(featureList)
        }
        else if (typeof layer === 'object'){
            const newFeature = { ...this.state.features };
            newFeature[layer.id] = layer;
            this._updateFeatures(newFeature)
        }
        else{
            console.error("featuresCallback called with unexpected data")
        }
    }

    //given a layer, translate its data into the appropriate data format.
    _generateFeature = layer => {
        //NOTE: valid geojson in leaflet requires coordinates to be in the format of LNG/LAT.
        let coords = []
        if (layer._latlng){
            coords = [this._normLng(layer._latlng.lng), layer._latlng.lat]
        }
        //if we have an object on the second layer down, this is a polyline.
        else if (layer._latlngs && typeof layer._latlngs[0] === 'object' && layer._latlngs[0].lat){
            layer._latlngs.map(coord => {
                coords = [...coords, [this._normLng(coord.lng), coord.lat]]
            })
        }
        //if we have an object on the third layer down, it's a polygon.
        //NOTE that this also means there is no current support for polygons within polygons.  This is not a priority for us right now.
        else if (layer._latlngs && layer._latlngs[0].length >= 1 && typeof layer._latlngs[0][0] === 'object'){
            coords.push([])

            layer._latlngs[0].map(coord => {
                coords = [[...coords[0], [this._normLng(coord.lng), coord.lat]]]
            })

            //if the last point is unequal to the first, we need to correct this to create valid geojson
            if (coords[0][0] !== coords[0][coords[0].length - 1]){
                coords[0].push(coords[0][0])
            }
        }
        else{
            console.error("Layer: ", layer, "sent to _generateFeature is not a marker, polygon, or polyline.")
            return {}
        }

        let newFeature = {
            id: layer._leaflet_id, //may have to remove before submission to API
            type: 'Feature',
            geometry: {
                type: typeof coords[0] === 'number' ? 'Point' : typeof coords[0][0] === 'number' ? 'LineString' : 'Polygon',
                coordinates: coords
                },
        };
        return newFeature
    }

    _getFirstCoordinate = layer => {
        if (layer.feature){
            const layerGeo = layer.feature.geometry
            switch (layerGeo.type){
                case "Point":
                    return [layerGeo.coordinates[1], layerGeo.coordinates[0]]
                case "LineString":
                        return [layerGeo.coordinates[0][1], layerGeo.coordinates[0][0]]
                case "Polygon":
                        return [layerGeo.coordinates[0][0][1], layerGeo.coordinates[0][0][0]]
                default:
                    console.error("invalid feature type sent to _getFirstCoordinate, setting to [0, 0]")
                    return [0, 0]
            }
        }
    }

    //latitude should never require normalizing, but a bug exists in Leaflet that causes the map to repeat itself longitudinally.
    _normLng(lng){
        return lng % 180
    }

    //TODO: there is a bug that will result in multiple edits not updating all item details, as the form only appears once.
    //this can be resolved using a Promise, but it's not a high priority right now and will be shelved.
    //ADM-1496
    setProperties = (featureParams) => {
        const featureList = {...this.state.features};
        featureList[this.state.popup.for].properties = featureParams
        this._updateFeatures(featureList)
        this.setState({prevProperties: {}})
        this.setState({popup:{active: false, for: ""}})
    }

    success = pos => {
        //if there are no features, default our location to the user's location.

        if (this.state.mapLoading){
            let latLng = [pos.coords.latitude, pos.coords.longitude]

            if (this.state.geo && this.state.geo.geojson && this.state.geo.geojson.features && this.state.geo.geojson.features.length > 0) {
                const firstFeature = this.state.geo.geojson.features[0]

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
                    console.error("Unknown feature type loaded, defaulting map to user location")
                }
            }
            //normalize before setting our location - the map coordinate for map location display is [lat, lng], though elsewhere coords are stored [lng, lat].
            latLng[1] = this._normLng(latLng[1])
            this.setState({location: latLng});
        }
    }

    _updateFeatures = (feature) => {
        this.setState({...this.state.features, features: feature})
        console.log("in _updateFeatures, state is now: ", this.state)
        this.updateGeo()
    }

    updateGeo = () => {
        //there are values in Geo that we don't care for in the API.

        let featuresList = []
        Object.keys(this.state.features).map(key => {
            featuresList.push(this.state.features[key])
        })
        let localGeo = {}
        if (featuresList.length > 0){
            localGeo = {
                object_id: this.props.id,
                content_type: this.props.content_type,
                    geojson: {
                        type: "FeatureCollection",
                        features: featuresList
                    }
            }
        }
        this.setState({geo: localGeo})
        this.props.geoDataCallback(localGeo)
    }

    _onCreated = e => {
        let layer = e.layer

        //maybe should change from collecting features to collecting layers instead, but this does in fact work.
        layer.on({
            click: this._onLayerClick.bind(this)
        })
        layer.feature = this._generateFeature(layer)
        this.setState({location: this._getFirstCoordinate(layer)})
        this.setState({prevProperties: {}})
        this.setState({popup:{active: true, for:layer.feature.id}}, this.featuresCallback(layer.feature))
    };

    _onDeleted = e => {
        Object.keys(e.layers._layers).map(key => {
            this.featuresCallback(key)
        })
    };
    //block / unblock popup display
    _onDeleteStart = e => {
        this.setState({blockPopup: true})
    }
    _onDeleteStop = e => {
        this.setState({blockPopup: false})
    }

    //get all edited values and push them up to the update function.
    _onEdited = e => {

        Object.keys(e.layers._layers).map(item => {
            let layer = e.layers._layers[item] //this specific edited item
            //preform a lookup for the previous properties of this object and throw them into state if they exist
            let newFeature = this._generateFeature(layer)

            //TODO: at some point, this callback will need to happen for each edited object to update their descriptions
            this.setState({location: this._getFirstCoordinate(layer)})
            this.setState({prevProperties: this.state.features[item].properties ? this.state.features[item].properties : {}})
            this.setState({popup:{active: true, for:newFeature.id}}, this.featuresCallback(newFeature))
        })
    };

    //this is where we would put info display / editing for features.
    _onLayerClick = e => {
        var layer = e.target;
        let prevProperties = this.state.features[layer._leaflet_id].properties ? this.state.features[layer._leaflet_id].properties : {}

        if (!this.state.blockPopup){
            this.setState({location: this._getFirstCoordinate(layer)})
            this.setState({prevProperties: prevProperties})
            this.setState({popup: {active: true, for: layer._leaflet_id}})
        }
    }

    //https://stackoverflow.com/questions/52684688/importing-geojson-to-react-leaflet-draw
    _onFeatureGroupReady = (ref) => {

        if (ref === null || !this.state.mapLoading){
            return;
        }
        
            if (this.state.geo && this.state.geo.geojson && this.state.geo.geojson.features && this.state.geo.geojson.features.length > 0){

                //features must be loaded in one at a time, not in bulk.
                let localFeatures = {}
                let output = {}
                let notDisplayedFeatures = []

                this.state.geo.geojson.features.map(feature => {
                    let leafletGeoJSON = new L.GeoJSON(feature);
                
                    leafletGeoJSON.eachLayer(layer => 
                        {
                            const layerType = layer.feature.geometry.type
                console.log("value of notdisplayedfeatures is: ", notDisplayedFeatures)

                            if (layerType === "LineString" || layerType === "Polygon" || layerType === "Point")
                            {
                                //add layer to the map
                                output = ref.leafletElement.addLayer(layer)
                                layer.on({
                                    click: this._onLayerClick.bind(this)
                                })
                            }
                            else{
                                //alert(`Map does not support feature type ${layerType} for feature: ${layer.feature.id} in data.  This value will be stored but not displayed on the map.`)
                                notDisplayedFeatures = [...notDisplayedFeatures, layer.feature.properties.name ? layer.feature.properties.name : layer.feature.geometry.type]
                                console.log("feature to not display is: ", layer.feature.properties.name)
                                output = ref.leafletElement.addLayer(layer)
                                layer.on({
                                    click: this._onLayerClick.bind(this)
                                })
                            }
                        }
                        );
                    })
                //initialize our features
                Object.keys(output._layers).map(key => {
                    output._layers[key].feature.id = key
                    localFeatures[key] = output._layers[key].feature
                })


                if (notDisplayedFeatures.length > 0){
                    alert(`Some geoJSON features exist in geoJSON that cannot be modified via the map.  They are of type 'Multi'.  The Property Names (should they exist) / Types in question are: \n${notDisplayedFeatures} \nand may be modified in the textArea beneath the map.`)
                }
                this.setState({features: localFeatures}, () =>
                console.log("value of notdisplayedfeatures is: ", notDisplayedFeatures)
                )                
            }
        this.setState({mapLoading: false})
        
    }

    _onPopupClose = () => {
        this.setState({prevProperties: {}})
        this.setState({popup: {active: false, for: ""}})
    }

    render() { 
        navigator.geolocation.getCurrentPosition(this.success, this.error, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        });

        return(
            <React.Fragment>
            {this.state.location && this.state.location.length > 0 && (
            <Map
            center={this.state.location}
            className={this.props.classes.mapDisplay}
            zoom={10}
            minZoom={4}
            maxZoom={16}
            noWrap={true}
            >
                <TileLayer
                    attribution={
                    'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC'
                    }
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}"
                />

                <FeatureGroup ref = {(reactFGref) =>{this._onFeatureGroupReady(reactFGref);}} >
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

                {this.state.popup.active && 
                <Popup className={this.props.classes.mapPopup}
                    position={this.state.location}
                    onClose={this._onPopupClose}
                    >
                    <DynamicForm prevProperties={this.state.prevProperties} setProperties={this.setProperties} />
                </Popup>
                }
            </Map>
            )}
            </React.Fragment>
        )
    }
}

const enhance = compose(withStyles(styles));
export default enhance(MapForm);