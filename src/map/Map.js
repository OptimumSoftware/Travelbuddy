import React, { Component } from 'react';
import './Map.css';
import marker from '../images/purple.png';
import drivingIcon from './car.svg';
import bicycleIcon from './bicycle.svg';
import walkingIcon from './walking.svg';
import transitIcon from './bus.svg';

/*global google*/

import {
    withScriptjs,
    withGoogleMap,
    GoogleMap,
    DirectionsRenderer,
} from 'react-google-maps';

import  {
    compose,
    withProps,
    lifecycle
} from 'recompose';


class Map extends Component {
    constructor(props) {
        super(props);
        this.state ={
            travel: google.maps.TravelMode.DRIVING,

        }

    }
    bicyclingHandler = () => {
        this.setState({travel: google.maps.TravelMode.BICYCLING})
    };
    walkingHandler = () => {
        this.setState({travel: google.maps.TravelMode.WALKING})
    };
    drivingHandler = () => {
        this.setState({travel: google.maps.TravelMode.DRIVING})
    };
    transitHandler = () => {
        this.setState({travel: google.maps.TravelMode.TRANSIT})
    };


    render() {

        const { StandaloneSearchBox } = require("react-google-maps/lib/components/places/StandaloneSearchBox");

        const AnyReactComponent = ({ pin }) => <img src={marker} alt={"marker"} />;

        const MapWithADirectionsRenderer = compose (

            withProps({
                googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyDA8JeZ3hy9n1XHBBuq6ke8M9BfiACME_E&v=3.exp&libraries=geometry,drawing,places",
                loadingElement: <div style={{ height: `100%` }} />,
                containerElement: <div style={{ height: `300px` }} />,
                mapElement: <div style={{ height: `100%` }} />,
            }),
            withScriptjs,
            withGoogleMap,
            lifecycle({
                componentDidMount() {

                    const refs = {};

                    this.setState({
                        places: [],
                        onSearchBoxMounted: ref => {
                            refs.searchBox = ref;
                        },
                        onPlacesChanged: () => {
                            const places = refs.searchBox.getPlaces();

                            this.setState({
                                places,
                            });
                        },
                    });

                    let latDes = this.props.latDes;
                    let lngDes = this.props.lngDes;
                    const DirectionsService = new google.maps.DirectionsService();
                    DirectionsService.route({
                        origin: new google.maps.LatLng(this.props.latCurr, this.props.lngCurr),
                        destination: new google.maps.LatLng(this.props.latDes, this.props.lngDes),
                        travelMode: this.props.travel,
                    }, (result, status) => {
                        let route = result.routes[0];
                        let distanceValue = route.legs[0].distance.value;
                        let distanceText = route.legs[0].distance.text;

                        document.getElementById("distance").innerHTML = 'Distance: ' + distanceText;
                        if (status === google.maps.DirectionsStatus.OK) {
                            this.setState({
                                directions: result,
                            });

                        } else {

                        }

                    });
                }
            })

        )(props =>

            <GoogleMap
                defaultZoom={7}
            >

                {props.directions && <DirectionsRenderer directions={props.directions} />}
            </GoogleMap>

        );

        return (
            <div>

                <img onClick={this.drivingHandler} id="mapIcon" src={drivingIcon} alt="drivingIcon" />
                <img onClick={this.bicyclingHandler} id="mapIcon" src={bicycleIcon} alt="bicycleIcon" />
                <img onClick={this.walkingHandler} id="mapIcon" src={walkingIcon} alt="walkingIcon" />
                <img onClick={this.transitHandler} id="mapIcon" src={transitIcon} alt="transitIcon" />
                <p id={'distance'}></p>
                <MapWithADirectionsRenderer latDes={this.props.lat}
                                             lngDes={this.props.lng}
                                             latCurr={this.props.currLat}
                                             lngCurr={this.props.currLng}
                                             travel={this.state.travel}

                />


            </div>

        );
    }
}

export default Map;