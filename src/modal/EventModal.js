import React, {Component} from 'react';
import './EventModal.css';
import Map from '../map/Map';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import heartIcon from '@fortawesome/fontawesome-free-solid/faHeart';
import thumbsIcon from '@fortawesome/fontawesome-free-solid/faThumbsUp';
import axios from 'axios';

class EventModal extends Component {

    constructor(props) {
        super(props);
		
		this.state = {
			voteCount: 0,
			voted: false,
			favoriteText: " Login to favorite",
			url: "/api/likes",
			placeId: "?placeId=" + this.props.id,
			userId: "",
			checkUrl: "/api/user/checkLiked",
			loggedIn: false,
			favoriteCheck: false,
		};
		
		this.vote = this.vote.bind(this);
		this.favoriteHandler = this.favoriteHandler.bind(this);
		
		this.checkLogin();
    }

    render() {
        return(
            <div id="myModal" className="modal">
                <div className="modalEventContent">
					<span id={'close'} onClick={this.props.click} className="close">&times;</span>
					<div id="topWrapper">
						<div className={'leftEvent'}>
							<img className={'modalImage'} src={this.props.image} onClick={this.props.click} alt="gfd" />
						</div>
						<div id={'rightEvent'}>
							<div className={'textLocation'}>
								<p id={'nameEvent'}>{this.props.name}</p>
								<p id='eventDesc'>{this.props.description}</p>
								<p>Start: {this.props.startDate} - {this.props.startTime}</p>
								<p>End: {this.props.endDate} - {this.props.endTime}</p>
								<div className="statsLocation">
									<div className="voteLocation" onClick={this.vote}>
										<FontAwesomeIcon icon={thumbsIcon} id="voteIcon" /> {this.state.voteCount}
									</div>
									<div className="favLocation" onClick={this.favoriteHandler}>
										<FontAwesomeIcon icon={heartIcon} id="heartIcon" /> {this.state.favoriteText}
									</div>
								</div>
							</div>
						</div>
					</div>
					<div id="mapContainer">
						<p id="eventAddress">{this.props.address}</p>
						{<Map
							lat = {this.props.lat}
							lng = {this.props.lng}
							currLat = {this.props.currentLat}
							currLng = {this.props.currentLng}
						/>}
					</div>
                </div>

            </div>
        )
    }
	
	vote(event) {
		if(this.state.loggedIn) {
			if(this.state.voted) {
				axios.delete(this.state.url + this.state.placeId)
				.then(response => {
					if(response.data['likes'] == "Error") {
					} else {
						this.setState({
							voteCount: response.data['likes']
						});
						document.getElementById("voteIcon").style.color = "#000";
					}		
				});  
			} 
			else {
				axios.post(this.state.url + this.state.placeId)
				.then(response => {
					if(response.data['likes'] == "Error") {
					} else {
						this.setState({
							voteCount: response.data['likes']
						});
						document.getElementById("voteIcon").style.color = "green";
					}		
				});  
			}
			this.setState({
				voted: !this.state.voted
			});
		}
	}
	
	favoriteHandler() {
		if(this.state.loggedIn) {
			if(this.state.favoriteCheck) {
				const url = "/api/user/favorite" + "?id=" + this.props.id;
				axios.delete(url);
				document.getElementById("heartIcon").style.color = "#000";
				this.setState({
					favoriteText: "Add favorite"
				})
			}
			else {
				const url = "/api/user/favorite" + "?eventId=" + this.props.id + "&type=event";
				axios.post(url);
				document.getElementById("heartIcon").style.color = "red";
				this.setState({
					favoriteText: "Delete favorite"
				})
			}
			this.setState({
				favoriteCheck: !this.state.favoriteCheck
			})
		}
	}
	
	checkFavorite() {
		if(this.state.loggedIn) {
			axios.get("/api/user/checkFavorite" + "?id=" + this.props.id)
				.then(response => {
					document.getElementById("heartIcon").style.color = "#000";
					this.setState({
						favoriteText: "Add favorite"
					})
				})
				.catch(error => {
					document.getElementById("heartIcon").style.color = "red";
					this.setState({
						favoriteCheck: true,
						favoriteText: "Delete favorite"
					})
				})
		}
	}
	
	getLikes() {
		axios.get(this.state.url + this.state.placeId)
			.then(response => {
				this.setState({
					voteCount: response.data['likes']
				});			
			});
			
		if(this.state.loggedIn) {
			const url = this.state.checkUrl + this.state.placeId;
			axios.get(url)
				.then(response => {
					if(response.data == "Error") {
					} 
					else if(response.data['check']) {
						this.setState({
							voted: true
						});
						document.getElementById("voteIcon").style.color = "green";
					}
					else {
						document.getElementById("voteIcon").style.color = "#000";
					}
				});
		}
	}
	
	checkLogin() {
		const url = "/api/loginCheck";
		axios.get(url)
			.then(response => {
				if(response.data['username']) {
					const usr = response.data['username'];
					this.setState({
						loggedIn: true,
						userId: usr
					});
				}
			})
			.then(() => {this.getLikes(); this.checkFavorite();})			
	}
}

export default EventModal;
