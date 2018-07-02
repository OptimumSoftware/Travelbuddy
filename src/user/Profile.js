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
import { Link } from 'react-router-dom'
import Modal   from '../modal/Modal';
import EventModal from '../modal/EventModal';
import Gravatar from 'react-gravatar'

import solidStar from '@fortawesome/fontawesome-free-solid/faStar'
import regularStar from '@fortawesome/fontawesome-free-regular/faStar'
import plusSquare from '@fortawesome/fontawesome-free-regular/faPlusSquare'
import minusSquare from '@fortawesome/fontawesome-free-regular/faMinusSquare'

class Profile extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			email: "",
			country: "",
			userId: null,
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
						country: response.data.yourCountry,
						userId: response.data.yourName
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
	}
	
	render() {	
		return (
			<main>
				<div id="profileWrapper">
            <div id="topRowWrapper">
              <User userId={this.state.userId} email={this.state.email} country={this.state.country} />
            </div>
            <Favorites />
            <Preferences />
			<div id="eventFriendWrapper">
				<div id="userEventsWrapper"><UserEvents /></div>
				<FriendsOverview userId={this.state.userId} loggedIn={this.state.loggedIn} />
			</div>
            <Settings />
				</div>
			</main>
		);
	}
}

class User extends Component {
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
		
		this.state = {
			userEvents: [],
			message: null,
			messageId: null,
		}
		
		axios.get("/api/user/getEvents")
			.then(response => {
				response = response.data;
				this.setState({
					userEvents: response
				});
			})	
		
	}
	
	removeEvent(id, index) {		
		const removeUrl = '/api/event?eventId=' + id;
		axios.delete(removeUrl)
			.then(response => {
				  this.setState({
						message: null,
						messageId: null,
					});			  
					let events = this.state.userEvents;
					events.splice(index, 1);
					this.setState({
						userEvents: events
					})
			  })
			  .catch(error => {
				  this.setState({
						message: error.response.data.message,
						messageId: "messageError",
					});
			  })
	}
	
	render() {
		return(
			<div id="userEvents">
				<h2>Your events</h2>
					{
						this.state.userEvents && this.state.userEvents.length ? (
							<div id="userEventList">
								{this.state.userEvents.map((event, index) => {
									const url = "/editEvent?id=" + event.id
									return (
										<div id="userEvent">
											<a href={url}><FontAwesomeIcon icon={editIcon} id="editIcon"/></a>
											<FontAwesomeIcon icon={deleteIcon} id="removeEventIcon" onClick={() => this.removeEvent(event.id, index)}/>
											<label id="userEventName">{event.name}</label>
										</div>
									)
								})}
								<div className="messageGeneral" id={this.state.messageId}>{this.state.message}</div>
							</div>
						)
						:
						<div class="profileError">
							You have not created events!
						</div>
					}
			</div>
		)
	}
}

class Favorites extends Component {

	constructor(props) {
		super(props)

        this.state = {
			items: [],
			placeDetails: {},
			check: false,
			photos: [],
        }
		
		this.url = "/api/user/favorite";
		this.placeDetailsUrl = "https://maps.googleapis.com/maps/api/place/details/json?placeid=";
		this.proxyUrl = "https://cors-anywhere.herokuapp.com/";
		this.imgUrl = "https://maps.googleapis.com/maps/api/place/photo?maxheight=234&maxwidth=280&photoreference=";
		this.key = "&key=AIzaSyDA8JeZ3hy9n1XHBBuq6ke8M9BfiACME_E";

		this.loadData();
	}
	
	
	componentDidMount() {
        navigator.geolocation.getCurrentPosition((position) => {
            this.setState({
                currentLat: position.coords.latitude,
                currentLng: position.coords.longitude
            })
        })
    }

	loadData() {
		axios.get(this.url)
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
					{
						this.state.items && this.state.items.length ?
							this.state.items.map((item, index) => {
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
													</div>
												</div>
											</div>
											<FontAwesomeIcon className="deleteFavoriteIcon" icon={deleteIcon} onClick={()=>this.removeFavorite(index, item.eventId)}/>
										</div>
									);
								}
							})
						:
						<div class="profileError">
							No favorites!
						</div>
					}
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
		}
		
		this.addPreference = this.addPreference.bind(this);
		this.removePreference = this.removePreference.bind(this);
		this.loadData();
	}

    loadData() {
            const url = "http://localhost:5000/api/user/preferences";
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
			const url = "/api/user/preferences?id=" +  i
			axios.post(url)
			this.setState({
				preferences: pref
			})
			this.props.emptySearch();
		}
	}

    removePreference(index, name, i) {
		const url = "/api/user/preferences?id=" +  i
		axios.delete(url)
		let array = this.state.preferences;
		array.splice(index, 1);
		this.setState({
			preferences: array
		});
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
                        {
							this.state.preferences && this.state.preferences.length ?
							this.state.preferences.map((preference, index) => {return (
								<label className="preference" onClick={() => this.removePreference(index, preference, this.props.object[preference])}>
									{preference.split('_').join(' ')}
									<FontAwesomeIcon className="closeIcon" icon={xIcon} />
								</label>
							);})
							:
							<div class="profileError">
								Try adding your preferences. It will make TravelBuddy even more fun!
							</div>
						}
                    </div>
				</div>
        )
    }
}

class FriendsOverview extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
            jsonCategories: {},
            userList: [],
            results: [],
            searchBar: "failed",
            status: []
        }


        axios.get('/api/userList')
            .then(result => {
                let temp = [];
                console.log(temp)
                this.setState({
                    jsonCategories: result.data.users
                })

                {this.state.jsonCategories.map((values) => {
                    temp.push(values[0])
                })}

                this.setState({
                    userList: temp
                })
                console.log("de userlist" + this.state.userList)
            });


    }



    namechangedhandler = (event) => {
        this.setState(
            {name: event.target.value}
        )

    }

    deleteFriend = (event) => {
        const url = '/api/user/friends/' + this.state.name;
        axios.delete(url).then((result) => {
            this.setState({
                status: result.data.deleteStatus,
                name: ''
            })
            console.log("resultaat van delete " + this.state.status)
        })
    }

    addFriend = (event) => {
        const url = '/api/user/friends?friend=' + this.state.name;
        axios.post(url).then((result) => {
            this.setState({
                status: result.data.addfriend,
                name: ''
            })
            console.log("vriend toevoegen " + this.state.status)
        })
    }

    render() {
        const url = '/api/user/friends';
        return (
            <div className={'friends'}>
                <h2 id={'friendsTag'}>Friends</h2>
                <h4 id={'friendH4'}>Add a friend</h4>
                <h5 id='error' style={{display: this.state.status ? 'none' : 'block'}}>Something went wrong, please check if you used the correct username</h5>
                <div className={'friendsContent'}>
                    <div id={'friendForm'}>
                        <input id="addFriends" type="text" value={this.state.name} onChange={this.namechangedhandler} name="friend"  placeholder={'Username'}  />
                        <button id={'addButton'} onClick={() => this.addFriend()}  ><FontAwesomeIcon id={'plusIcon'}  icon={plusSquare}/></button>
                    </div>
                    <button id={'deleteButton'} onClick={() => this.deleteFriend()}><FontAwesomeIcon id={'minusIcon'} icon={minusSquare}/></button>
                    <Link id={'friendLink'} to="/friends" >View friends</Link>
                </div>
            </div>

        );

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
			countries: [],
			message: null,
			messageId: null,
		}
		
		this.handleInputChange = this.handleInputChange.bind(this);
		this.loadData();
	}
	
	loadData() {
		let url = '/api/user';
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

	savePreferences() {
		let url = '/api/user';
		url += "?firstName=" + this.state.firstName;
		url += "&lastName=" + this.state.lastName;
		url += "&username=" + this.state.username;
		url += "&email=" + this.state.email;
		url += "&password=" + this.state.password;
		url += "&country=" + this.state.country;

		axios.put(url)
			.then(response => {
				if(response.data) {
					this.setState({
						message: response.data.message,
						messageId: "messageOk",
						password: ""
					});
					window.setTimeout(() => this.setState({
						message: null,
						messageId: null
					}), 2000);
				}
			})
			.catch(error => {
				this.setState({
					message: error.response.data.message,
					messageId: "messageError",
				});
			});
	}
	
	render() {
		return (
			<div id="settings">
			<h2>Account settings</h2>
			
			<div>
				<div className="settingsRow">
					<div className="settingsBlock">
						<label>First name</label>
						<input type="text" name="firstName" value={this.state.firstName} onChange={this.handleInputChange} maxLength="64" required />
					</div>
					
					<div className="settingsBlock">
						<label>Last name</label>
						<input type="text" name="lastName" value={this.state.lastName} onChange={this.handleInputChange} maxLength="64" required />
					</div>
				</div>
				
				<div className="settingsRow">
					<div className="settingsBlock">
						<label>Username (Not changable)</label>
						<input type="text" name="username" value={this.state.username} readonly/>
					</div>
				</div>
				<div className="settingsRow">
					<div className="settingsBlock">
						<label>Email address (Not changeable)</label>
						<input type="text" name="email" value={this.state.email} onChange={this.handleInputChange} readonly/>
					</div>
				</div>
				
				<div className="settingsRow">
					<div className="settingsBlock">
						<label>New password</label>
						<input type="password" name="password" value={this.state.password} placeholder="Enter new password" onChange={this.handleInputChange} maxLength="64" />
					</div>
				</div>
				
				<div className="settingsRow">
					<div className="settingsBlock">
						<label>Country</label>
						<select name="country" value={this.state.country} onChange={this.handleInputChange} required>
							{this.state.countries.map((item) => (
								<option value={item.code}>{item.name}</option>
							))}
						</select>
					</div>
				</div>
				<div className="settingsBlock">
					<button onClick={() => this.savePreferences()}>Save settings</button>
				</div>
				<div className="messageGeneral" id={this.state.messageId}>{this.state.message}</div>
			</div>
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