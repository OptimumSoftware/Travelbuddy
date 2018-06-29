import React, { Component } from 'react';
import './Places.css';
import places from '../images/placeholder.png';

class Events extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
	
    createContent = () => {
		let content = [];

		{this.props.events.map(event => {
			let image;
			if(event.image) {
				image = "/eventImage?img=" + event.image
			}
			else {
				image = places
			}
			
			content.push(
				<div className={"singleResult"} onClick={() => {
						this.props.handler(
							event.name,
							image,
							event.location,
							event.description,
							event.startDate,
							event.startTime,
							event.endDate,
							event.endTime,
							event.id,
							event.lat,
							event.lng
						);
					}
				}>
					<div className={"nameBox"} id="eventBox">
						<p>{event.name}</p>
					</div>
					<img src={image} alt={""}/>
				</div>
			);
		})}
		
		
        return content
    }

    render() {
        return (
            <div className={'places'}>
                <h3 className={'placesText'} >Events {this.props.place}</h3>
                <div className={'placesRow'}>
                {this.createContent()}
                </div>
            </div>
        )
    }

}


export default Events;