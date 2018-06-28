import React, { Component } from 'react';
import './Profile.css';
import logo1 from '../images/4.jpg';
import logo2 from '../images/3.jpg';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import xIcon from '@fortawesome/fontawesome-free-solid/faTimes';
import deleteIcon from '@fortawesome/fontawesome-free-regular/faTimesCircle';
import mailIcon from '@fortawesome/fontawesome-free-regular/faEnvelope';
import markerIcon from '@fortawesome/fontawesome-free-solid/faMapMarker';
import editIcon from '@fortawesome/fontawesome-free-regular/faEdit';
import axios from 'axios';
import Modal   from '../modal/Modal';
import EventModal from '../modal/EventModal';
import Gravatar from 'react-gravatar'

import solidStar from '@fortawesome/fontawesome-free-solid/faStar'
import regularStar from '@fortawesome/fontawesome-free-regular/faStar'

class Profile extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			userId: null,
			loggedIn: false,
			email: "",
			country: "",
			userEvents: []
		}
		
		const url = "/api/loginCheck";	
		axios.get(url)
			.then(response => {
				if(response.data['username']) {
					const usr = response.data['username'];
					this.setState({
						userId: usr,
						loggedIn: true
					});
				}
			})
			
		const grav = "/api/loginName"
        axios.get(grav)
            .then(response => {
				this.setState(
					{
						email: response.data.yourEmail,
						country: response.data.yourCountry
					}
				)
            })
			.then(() => {
				axios.get("/api/countryName?code=" + this.state.country)
					.then(response => {
						this.setState({
							country: response.data.name
						});
					})
			})
			
		axios.get("/api/user/getEvents")
			.then(response => {
				response = response.data;
				this.setState({
					userEvents: response
				});
			});
	}

	
	render() {	
		return (
			<main>
				<div id="profileWrapper">
					<div id="topRowWrapper">
						<User userId={this.state.userId} loggedIn={this.state.loggedIn} email={this.state.email} country={this.state.country} />
					</div>
					<Favorites userId={this.state.userId} loggedIn={this.state.loggedIn} />
					<Preferences userId={this.state.userId} loggedIn={this.state.loggedIn} />
					<UserEvents events={this.state.userEvents} />
					<Settings userId={this.state.userId} loggedIn={this.state.loggedIn} />
				</div>
			</main>
		);
	}
}

class User extends Component {
	constructor(props) {
		super(props)
		
		this.state = {
			userId: "",
			loggedIn: false,
			email: ""
		}
	}
	
	componentDidUpdate() {
		if(this.state.userId !== this.props.userId && this.state.email !== this.props.email) {
			this.setState({
				userId: this.props.userId,
				loggedIn: this.props.loggedIn,
				email: this.props.email
			});
			this.loadData();
		}
	}
	
	loadData() {
		
	}
	
	render() {
		return (
			<div id="userFull">
				<Gravatar email={this.props.email} size={150} id='userGravatar'/>
				<div id="userInfo">
					<h1 id="userName">{this.props.userId}</h1>
					<div id="emailWrapper">
						<FontAwesomeIcon className="mailIcon" icon={mailIcon}/>
						<label id="userEmail">{this.props.email}</label>
					</div>
					<div id="locationWrapper">
						<FontAwesomeIcon className="markerIcon" icon={markerIcon}/>
						<label id="userCountry">{this.props.country}</label>
					</div>
				</div>
			</div>
		);
	}
}

class UserEvents extends Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		return(
			<div id="userEvents">
				<h2>Your events</h2>
				<div id="userEventList">
					{this.props.events.map(event => {
						const url = "/editEvent?id=" + event.id
						return (
							<a href={url}>
								<div id="userEvent">
									<FontAwesomeIcon icon={editIcon} id="editIcon"/>
									 <label id="userEventName">{event.name}</label>
								</div>
							</a>
						)
					})}
				</div>
			</div>
		)
	}
}

class Favorites extends Component {

	constructor(props) {
		super(props)

        this.state = {
            favorites: [
                {name: "Cantina Mexicana",
                    image: logo1,
                    location: "Groningen",
                    rating: 4},
                {name: "Groninger Museum",
                    image: logo2,
                    location: "Groningen",
                    rating: 5},
            ],
			items: [],
			userId: "",
			loggedIn: false,
			placeDetails: {},
			check: false,
			photos: [],
        }
		
		this.url = "/api/user/favorite";
		this.placeDetailsUrl = "https://maps.googleapis.com/maps/api/place/details/json?placeid=";
		this.proxyUrl = "https://cors-anywhere.herokuapp.com/";
		this.imgUrl = "https://maps.googleapis.com/maps/api/place/photo?maxheight=234&maxwidth=280&photoreference=";
		this.key = "&key=AIzaSyDA8JeZ3hy9n1XHBBuq6ke8M9BfiACME_E";
	}
	
	
	componentDidMount() {
        navigator.geolocation.getCurrentPosition((position) => {
            this.setState({
                currentLat: position.coords.latitude,
                currentLng: position.coords.longitude
            })
        })
    }

	
	componentDidUpdate() {
		if(this.state.userId !== this.props.userId) {
			this.setState({
				userId: this.props.userId,
				loggedIn: this.props.loggedIn
			});
			this.loadData();
		}
	}
	
	loadData() {
		if(this.props.loggedIn) {
			axios.get(this.url + "?username=" + this.props.userId)
				.then(response => {
					this.setState({
						items: response.data
					});
					
				})
				.then(() => {
					this.state.items.forEach(favorite => {
						if(favorite.placeId) {
							axios.get(this.proxyUrl + this.placeDetailsUrl + favorite.placeId + this.key)
									.then(response => {
										var temp1 = this.state.placeDetails;
										temp1[favorite.placeId] = response.data;
										this.setState({
											placeDetails: temp1
										});
									})
						}
					})
					
				})
				.then(() => {console.log(this.state.placeDetails)})
		}
	}

    removeFavorite(index, id) {
		axios.delete(this.url + "?id=" + id)
        let array = this.state.items;
        array.splice(index, 1);
        this.setState({
            items: array
        });
    }
	
	modalHandler = (name, image, address, open, lat, lng, id) => {
        this.setState({
            showModal: true,
            modalName: name,
            modalImage: image,
            modalAddress: address,
            modalOpen: open,
            modalLat: lat,
            modalLng: lng,
            modalId: id,
        })
    }
	
	eventModalHandler = (name, image, address, description, startDate, startTime, endDate, endTime, id, lat, lng) => {
		this.setState({
			showEventModal: true,
			modalName: name,
            modalImage: image,
            modalAddress: address,
            modalDesc: description,
			modalStartDate: startDate,
			modalStartTime: startTime,
			modalEndDate: endDate,
			modalEndTime: endTime,
            modalId: id,
			modalLat: lat,
			modalLng: lng
		})
	}
	
	hideModal = () => {
        this.setState({showModal: false, showEventModal: false})
    };

	render() {
		let viewModal = null;
        if(this.state.showModal){
            viewModal = <Modal
                click={this.hideModal}
                image = {this.state.modalImage}
                name = {this.state.modalName}
                address={this.state.modalAddress}
                open = {this.state.modalOpen}
                lat = {this.state.modalLat}
                lng = {this.state.modalLng}
                photo = {this.state.photos}
                id = {this.state.modalId}
                currentLat = {this.state.currentLat}
                currentLng = {this.state.currentLng}
            />
        }
		else if(this.state.showEventModal) {
			viewModal = <EventModal
                click={this.hideModal}
                image = {this.state.modalImage}
                name = {this.state.modalName}
                address={this.state.modalAddress}
                photo = {this.state.modalImage}
                id = {this.state.modalId}
				lat = {this.state.modalLat}
                lng = {this.state.modalLng}
                description = {this.state.modalDesc}
				startDate = {this.state.modalStartDate}
				startTime = {this.state.modalStartTime}
				endDate = {this.state.modalEndDate}
				endTime = {this.state.modalEndTime}
				currentLat = {this.state.currentLat}
                currentLng = {this.state.currentLng}
            />
		}
		let place = require("../images/placeholder-favorite.png")
		return (
			<div id="favorites">
				<h2>Your favorite places</h2>
				<div id="favoritesWrapper">
					{this.state.items.map((item, index) => {
						let img = place
						if(item.type === "place") {						
							if(item.placeId in this.state.placeDetails) {
								const place = this.state.placeDetails[item.placeId]['result'];
								if('photos' in place) {
									img = this.imgUrl+place['photos'][0]['photo_reference']+this.key;
								}

								return (
									<div class="favorite">
										<div onClick={() => this.modalHandler(
													place.name,
													img,
													place.vicinity,
													place.opening_hours.open_now, 
													place.geometry.location.lat,
													place.geometry.location.lng,
													place.place_id
											)}>
											<div className="favoriteImg">
												<img src={img} alt={item.id} />
											</div>
											<div class="placeInfo">
												<label className="favoriteName">{place['name']}</label>
												<div className="favoriteInfo">
													<label className="favoriteLocation">{place['vicinity'].split(",").pop()}</label>
												</div>
											</div>
										</div>
										<FontAwesomeIcon className="deleteFavoriteIcon" icon={deleteIcon} onClick={()=>this.removeFavorite(index, item.id)}/>
									</div>
								)
							}
						}
						else if(item.type === "event") {
							if('eventImg' in item) {
								if(item.eventImg) {
									img = "/eventImage?img=" + item.eventImg;
								}
							}
							return (
								<div class="favorite">
									<div onClick={() => this.eventModalHandler(
													item.eventName,
													img,
													item.location,
													item.eventDesc,
													item.eventStartDate,
													item.eventStartTime,
													item.eventEndDate,
													item.eventEndTime,
													item.eventId,
													item.eventLat,
													item.eventLng
											)}>
										<div className="favoriteImg">
											<img src={img} alt={item.id} />
										</div>
										<div class="placeInfo">
											<label className="favoriteName">{item.eventName}</label>
											<div className="favoriteInfo">
												<label className="favoriteLocation">{item.city ? item.city : "Location unknown"}</label>
												{/*<div className="favoriteRating">
													{Array.apply(0, Array(Math.floor(4))).map(function(x) {
														return (
															<FontAwesomeIcon icon={solidStar} />
														);
													})}
													{Array.apply(0, Array(5-Math.floor(4))).map(function(x) {
														return (
															<FontAwesomeIcon icon={regularStar} />
														);
													})}
												</div>*/}
											</div>
										</div>
									</div>
									<FontAwesomeIcon className="deleteFavoriteIcon" icon={deleteIcon} onClick={()=>this.removeFavorite(index, item.id)}/>
								</div>
							);
						}
					})}
				</div>
				{viewModal}
			</div>
		);
	}
}

class Preferences extends Component {

	constructor(props) {
		super(props);

		this.state = {
			jsonCategories: {},
			categories: [],
			results: [],
			searchBar: ""
		}
		
		this.emptySearch = this.emptySearch.bind(this);
		this.handleChange = this.handleChange.bind(this);
		
		axios.get('/api/categories')
			.then(result => {
				let temp = [];
				this.setState({
					jsonCategories: result.data
				})
					
				for (var key in this.state.jsonCategories) {
					temp.push(key)
				}
				this.setState({
					categories: temp
				})
			}); 	 
	}

    handleChange(e) {
		const targetField = e.target;
		const value = targetField.value;
		const field = targetField.name;
		this.setState({
			[field]: value
		});
		
		let length = e.target.value.length
		let result = [];
        for (let i = 0; i < this.state.categories.length; i++) {
        	let word = this.state.categories[i];
            if (word.substring(0, length) == e.target.value.toLowerCase()) {
                result.push(word);
            }
		}
		if (e.target.value == "") {
            this.setState({
                results: []
            })
		} else {
            this.setState({
                results: result
            })
		}

    }
	
	emptySearch() {
		this.setState({
			searchBar: "",
			results: []
		})
	}

	render() {
		return (
			<div id="preferences">
				<h2>Preferences</h2>
				Add preferences: 
				<input type="text" name="searchBar" value={this.state.searchBar} placeholder="Museums" onChange={this.handleChange} />
				<ResultList results={this.state.results} object={this.state.jsonCategories} emptySearch={this.emptySearch} userId={this.props.userId} loggedIn={this.props.loggedIn}/>
			</div>
		);
	}
}

class ResultList extends Component {

	constructor(props) {
		super(props);
		
		this.state = {
			preferences: [],
			userId: "",
			loggedIn: false
		}
		
		this.addPreference = this.addPreference.bind(this);
		this.removePreference = this.removePreference.bind(this);
	}
	
	componentDidUpdate() {
		if(this.state.userId !== this.props.userId) {
			this.setState({
				userId: this.props.userId,
				loggedIn: this.props.loggedIn
			});
			this.loadData();
		}
	}
	
	loadData() {
		if(this.props.loggedIn) {
			setTimeout(function() {
				const url = "/api/user/preferences/" + this.props.userId;
				axios.get(url)
					.then(response => {
						let temp = [];
						for (var key in response.data) {
							temp.push(key)
						}
						this.setState({
							preferences: temp
						})
						
					}); 
			}.bind(this), 1000);
		}
	}

    addPreference(i, result) {
		let pref = []
		let check = 0;
		for (let index = 0; index < this.state.preferences.length; index++) {
			pref.push(this.state.preferences[index])
			if (this.state.preferences[index] == result) {
				check++;
			}
		}
		pref.push(result)
		if (check == 0) {
			if(this.props.loggedIn) {
				const url = "/api/user/preferences/" + this.props.userId + "/" + i
				axios.post(url)
				this.setState({
					preferences: pref
				})
				this.props.emptySearch();
			}
		}
	}

    removePreference(index, name, i) {
		if(this.props.loggedIn) {
			const url = "/api/user/preferences/" + this.props.userId + "/" + i
			axios.delete(url)
			let array = this.state.preferences;
			array.splice(index, 1);
			this.setState({
				preferences: array
			});
		}
    }

    render() {
        return (
				<div>
					<div id={"suggested"}>
						<ul className={"suggestCategories"}>
						{this.props.results.map((result) => (
							<li value={this.props.object[result]} name={result} onClick={this.addPreference.bind(this, this.props.object[result], result)}>{result.split('_').join(' ')}</li>
						))}
						</ul>
					</div>
					<div id="preferenceList">
                        {this.state.preferences.map((preference, index) => {return (
                            <label className="preference" onClick={() => this.removePreference(index, preference, this.props.object[preference])}>
                                {preference.split('_').join(' ')}
                                <FontAwesomeIcon className="closeIcon" icon={xIcon} />
                            </label>
                        );})}
                    </div>
				</div>
        )
    }

}

class Settings extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			firstName: "",
			lastName: "",
			username: "",
			email: "",
			country: "",
			password: "",
			userId: "",
			loggedIn: false,
			countries: []
		}
		
		this.handleInputChange = this.handleInputChange.bind(this);
	}
	
	componentDidUpdate() {
		if(this.state.userId !== this.props.userId) {
			this.setState({
				userId: this.props.userId,
				loggedIn: this.props.loggedIn
			});
			this.loadData();
		}
	}
	
	loadData() {
		if(this.props.loggedIn) {
			let url = '/api/user/' + this.props.userId;
			axios.get(url)
				.then(result => {
					result = result.data;
					this.setState({
						firstName: result.firstName,
						lastName: result.lastName,
						username: result.username,
						email: result.email,
						country: result.country,
					});
				});
			axios.get("/api/countries")
				.then(response => {
					this.setState({countries: response.data});
				})
		}
	}
	
	render() {
		const url = '/api/user/'+this.props.userId;
		return (
			<div id="settings">
			<h2>Account settings</h2>
			
			<form action={url} method='POST'>
				<div className="settingsRow">
					<div className="settingsBlock">
						<label>First name</label>
						<input type="text" name="firstName" value={this.state.firstName} onChange={this.handleInputChange}/>
					</div>
					
					<div className="settingsBlock">
						<label>Last name</label>
						<input type="text" name="lastName" value={this.state.lastName} onChange={this.handleInputChange}/>
					</div>
				</div>
				
				<div className="settingsRow">
					<div className="settingsBlock">
						<label>Username</label>
						<input type="text" name="username" value={this.state.username} readonly/>
					</div>
				</div>
				<div className="settingsRow">
					<div className="settingsBlock">
						<label>Email address</label>
						<input type="text" name="email" value={this.state.email} onChange={this.handleInputChange}/>
					</div>
				</div>
				
				<div className="settingsRow">
					<div className="settingsBlock">
						<label>New password</label>
						<input type="password" name="password" value={this.state.password} placeholder="password" onChange={this.handleInputChange}/>
					</div>
				</div>
				
				<div className="settingsRow">
					<div className="settingsBlock">
						<label>Country</label>
						<select name="country" value={this.state.country} onChange={this.handleInputChange}>
							{this.state.countries.map((item) => (
								<option value={item.code}>{item.name}</option>
							))}
						</select>
					</div>
				</div>
				
				<div className="settingsBlock">
					<button type="submit">Save settings</button>
				</div>
			</form>
		</div>
		);
	}
	
	handleInputChange(event) {
		const targetField = event.target;
		const value = targetField.value;
		const field = targetField.name;
		this.setState({
			[field]: value
		});
	}
}

export default Profile;