import React, { Component } from 'react';
import './AddEvent.css';
import axios from 'axios';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import fileIcon from '@fortawesome/fontawesome-free-regular/faFile';
import PlacesAutocomplete from 'react-places-autocomplete';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';

class AddEvent extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			name: "",
			category: 4,
			description: "",
			location: "",
			start_date: "",
			start_time: "",
			end_date: "",
			end_time: "",
			userId: "",
			loggedIn: false,
			jsonCategories: {},
			categories: [],
			loadGoogleLib: false,
			lat: 0,
			lng: 0,
			message: null,
			messageId: null,
		};
		
				
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
			.then(() => {
				axios.get("/api/userList")
					.then(response => {
						response = response.data;
						this.setState({
							jsonCategories: response
						});
						let temp = [];
						for(let key in response) {
							temp.push(key)
						}
						this.setState({
							userList: temp
						});
					})
			});
		
		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleAddressChange = this.handleAddressChange.bind(this);
		this.handleAddressSelect = this.handleAddressSelect.bind(this);
	}
	
	  handleAddressChange(location) {
		this.setState({ location })
	  }

	  handleAddressSelect(location) {
		geocodeByAddress(location)
			.then(results => {
				this.setState({location: results[0]['formatted_address']});
				return getLatLng(results[0])
			})
			.then(({ lat, lng }) => {
				this.setState({
					lat: lat,
					lng: lng,
				});
			})
			.catch(err => console.error(err))
	  }
	  
	  
	  addEvent() {
		  let formData = new FormData();
		  let image = document.getElementById("fileUpload");
		  if(image.value != "") {
			  formData.append("image", image.files[0])
		  }
		  
		  let url = "/api/event";
		  url += "?name=" + this.state.name;
		  url += "&description=" + this.state.description;
		  url += "&location=" + this.state.location;
		  url += "&startDate=" + this.state.start_date;
		  url += "&startTime=" + this.state.start_time;
		  url += "&endDate=" + this.state.end_date;
		  url += "&endTime=" + this.state.end_time;
		  url += "&owner=" + this.state.userId;
		  url += "&lat=" + this.state.lat;
		  url += "&lng=" + this.state.lng;
		  
		  axios.post(url, formData, {
			  headers: {
				  'Content-Type': 'multipart/form-data'
			  }
		  })
		  .then(response => {
			  this.setState({
					message: response.data.message,
					messageId: "messageOk",
				});			  
			  this.emptyForm();
		  })
		  .catch(error => {
			  this.setState({
					message: error.response.data.message,
					messageId: "messageError",
				});
		  })
	  }
	  
	emptyForm() {
		this.setState({
			name: "",
			description: "",
			location: "",
			start_date: "",
			start_time: "",
			end_date: "",
			end_time: "",
			lat: "",
			lng: "",
		});
		document.getElementById("fileUpload").value = "";
	}
	  
	render() {
		let message = this.state.message;
		if(message) {
			message = message.replace(/<br\s*[\/]?>/gi, "\n");
		}
		
		return (
			<main>
				<h1>Add event</h1>
				
				<div id="addEventWrapper">
					<div>
						<div className="addEventRow">
							<div className="addEventItem">
								<label className="addEventLabel">Event name</label>
								<input type="text" name="name" value={this.state.name} onChange={this.handleInputChange} maxlength="128" required />
							</div>
						</div>
						
						<div className="addEventRow">
							<div className="addEventItem">
								<label className="addEventLabel">Short event description</label>
								<textarea name="description" value={this.state.description} onChange={this.handleInputChange} maxlength="250" required />
							</div>
							<div className="addEventItem">
								<label className="addEventLabel">Location</label>
								 
								<PlacesAutocomplete
									value={this.state.location}
									onChange={this.handleAddressChange}
									onSelect={this.handleAddressSelect}
								  >
									{({ getInputProps, suggestions, getSuggestionItemProps }) => (
									  <div>
										<input
										  {...getInputProps({
											placeholder: 'Herestraat 33, Groningen',
											name: 'location'
										  })}
										  maxlength="250" required 
										/>
										<div className="select-place-container">
										  {suggestions.map(item => {
											const className = item.active ? 'place-item-active' : 'place-item-inactive';
											return (
											  <div {...getSuggestionItemProps(item, { className })} id='place-item'>
												<span>{item.description}</span>
											  </div>
											)
										  })}
										</div>
									  </div>
									)}
								  </PlacesAutocomplete>
								
							</div>
						</div>

						<div className="addEventRow">
							<div className="addEventItem">
								<label className="addEventLabel">Start date</label>
								<input type="date" name="start_date" value={this.state.start_date} onChange={this.handleInputChange} required />
							</div>
							
							<div className="addEventItem">
								<label className="addEventLabel">Start time</label>
								<input type="time" name="start_time" value={this.state.start_time} onChange={this.handleInputChange} required />
							</div>
						</div>
						<div className="addEventRow">
							<div className="addEventItem">
								<label className="addEventLabel">End date</label>
								<input type="date" name="end_date" value={this.state.end_date} onChange={this.handleInputChange} required />
							</div>
							
							<div className="addEventItem">
								<label className="addEventLabel">End time</label>
								<input type="time" name="end_time" value={this.state.end_time} onChange={this.handleInputChange} required />
							</div>
						</div>
						
						<div className="addEventRow">
							<label className="addEventLabel" id="addImageLabel">Add an image if you want:</label>
							<label for="fileUpload" id="addImageBtn"><FontAwesomeIcon icon={fileIcon}/> Select</label>
							<input id="fileUpload" type="file" name="image" accept=".png,.jpg,.jpeg,.gif" />
						</div>
						
						<input type="hidden" name="owner" value={this.state.userId} onChange={this.handleInputChange} required />
						<input type="hidden" name="lat" value={this.state.lat} onChange={this.handleInputChange} required />
						<input type="hidden" name="lng" value={this.state.lng} onChange={this.handleInputChange} required />
						
						<div className="addEventRow">
							<button onClick={() => this.addEvent()}>Submit event</button>
						</div>
						
						<div className="messageGeneral" id={this.state.messageId}>{message}</div>
					</div>
				</div>
			</main>
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

export default AddEvent;