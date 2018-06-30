import React, { Component } from 'react';
import './Places.css';
import places from '../images/placeholder.gif';

class Places extends Component {
    constructor(props) {
        super(props);
        this.state = {
            results: [],
            radiusResult: [],
			rangeOld: "5000"
        }
    }

    baseUrl = "https://maps.googleapis.com/maps/api/place/photo?maxheight=234&maxwidth=280&photoreference=";
    apikey = "&key=AIzaSyDA8JeZ3hy9n1XHBBuq6ke8M9BfiACME_E";
    radius = '&radius=';
    type = '&type=';
	
    componentDidMount() {
		this.newQuery()
    }
	
	componentDidUpdate() {
		if (this.state.rangeOld !== this.props.range) {
			this.newQuery();
			this.setState({
				rangeOld: this.props.range
			});
		}
	}
	
	newQuery() {
		let proxy = "https://cors-anywhere.herokuapp.com/";
        let cat = this.props.categories;
        let url = this.props.query + this.radius + this.props.range + this.type + cat + this.apikey;
        fetch(proxy + url)
            .then(response => response.json())
            .then(resultPlaces => {
                console.log(resultPlaces);
                this.setState({
                    results: resultPlaces.results
                })
            })
	}


    createContent = () => {
        let content = [];
        
        for (let index = 0; index < this.state.results.length; index++) {
			let image;
            if (this.state.results[index].photos == undefined) {
                image = places;
            } else {
                image = this.baseUrl + this.state.results[index].photos[0].photo_reference + this.apikey;
            }
			
			let opening;
			if('opening_hours' in this.state.results[index] && 'open_now' in this.state.results[index].opening_hours) {
				opening = this.state.results[index].opening_hours.open_now;
			}
			else {
				opening = null;
			}

            content.push(<div className={"singleResult"} onClick={() => this.props.handlerssss(
                this.state.results[index].name,
                image,
                this.state.results[index].vicinity,
                opening,
                this.state.results[index].geometry.location.lat,
                this.state.results[index].geometry.location.lng,
                this.state.results[index].place_id,
            )}>
                <div className={"nameBox"}>
                    <p>{this.state.results[index].name}</p>
                </div>
                <div className={"rating"}>{this.state.results[index].rating ? this.state.results[index].rating : "N/A"}</div>
                <img src={image} alt={""}/>
            </div>)
        }
        return content
    }

    render() {
        return (
            this.state.results.length > 1 &&
            <div className={'places'}>
                <h3 className={'placesText'} >{this.props.categories.split('_').join(' ')}</h3>
                <div className={'placesRow'}>
                {this.createContent()}
                </div>
            </div>
        )
    }

}


export default Places;