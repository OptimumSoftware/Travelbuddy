import React, { Component } from 'react';
import './EditEvent.css';
import axios from 'axios';
import URL from 'url-parse';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import fileIcon from '@fortawesome/fontawesome-free-regular/faFile';
import PlacesAutocomplete from 'react-places-autocomplete';
import { geocodeByAddress, geocodeByPlaceId, getLatLng } from 'react-places-autocomplete';

class EditEvent extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			eventId: "",
			name: "",
			category: "",
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
			lng: 0
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
			.then(() => {
				var currentUrl = new URL(window.location.href, true)
				if(currentUrl.query.id) {
					this.setState({
						eventId: currentUrl.query.id
					});
				}
				else {
					window.location.href = "/";
				}
			})
			.then(() => {
				axios.get("/api/user/editEvent?id=" + this.state.eventId)
					.then(response => {
						response = response.data;
						this.setState({
							name: response.name,
							category: response.category,
							description: response.description,
							location: response.location,
							start_date: response.startDate,
							start_time: response.startTime,
							end_date: response.endDate,
							end_time: response.endTime,
							lat: response.lat,
							lng: response.lng
						});
					})
			})
			.then(() => {
				axios.get("/api/categories")
					.then(response => {
						response = response.data;
						this.setState({
							jsonCategories: response
						});
						let temp = [];
						for(var key in response) {
							temp.push(key)
						}
						this.setState({
							categories: temp
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
				this.setState({location: results[0]['formatted_address']})
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
	  
	
	render() {
		return (
			<main>
				<h1>Edit event</h1>
				
				<div id="editEventWrapper">
					<form action="/api/user/editEvent" method="POST" enctype="multipart/form-data">
						<div className="editEventRow">
							<div className="editEventItem">
								<label className="editEventLabel">Event name</label>
								<input type="text" name="name" value={this.state.name} onChange={this.handleInputChange} />
							</div>

							<div className="editEventItem">
								<label className="editEventLabel">Category</label>
								<select name="category" value={this.state.category} onChange={this.handleInputChange} >
									{this.state.categories.map((item) => (
										<option value={this.state.jsonCategories[item]}>{item.split('_').join(' ')}</option>
									))}
								</select>
							</div>
						</div>
						
						<div className="editEventRow">
							<div className="editEventItem">
								<label className="editEventLabel">Short event description</label>
								<textarea name="description" value={this.state.description} onChange={this.handleInputChange} />
							</div>
							<div className="editEventItem">
								<label className="editEventLabel">Location</label>
								 
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

						<div className="editEventRow">
							<div className="editEventItem">
								<label className="editEventLabel">Start date</label>
								<input type="date" name="start_date" value={this.state.start_date} onChange={this.handleInputChange} />
							</div>
							
							<div className="editEventItem">
								<label className="editEventLabel">Start time</label>
								<input type="time" name="start_time" value={this.state.start_time} onChange={this.handleInputChange} />
							</div>
						</div>
						<div className="editEventRow">
							<div className="editEventItem">
								<label className="editEventLabel">End date</label>
								<input type="date" name="end_date" value={this.state.end_date} onChange={this.handleInputChange} />
							</div>
							
							<div className="editEventItem">
								<label className="editEventLabel">End time</label>
								<input type="time" name="end_time" value={this.state.end_time} onChange={this.handleInputChange} />
							</div>
						</div>
						
						<div className="editEventRow">
							<label className="editEventLabel" id="addImageLabel">Add an image if you want:</label>
							<label for="fileUpload" id="addImageBtn"><FontAwesomeIcon icon={fileIcon}/> Select</label>
							<input id="fileUpload" type="file" name="image" />
						</div>
						
						<input type="hidden" name="lat" value={this.state.lat} onChange={this.handleInputChange} />
						<input type="hidden" name="lng" value={this.state.lng} onChange={this.handleInputChange} />
						<input type="hidden" name="owner" value={this.state.userId} onChange={this.handleInputChange}/>
						<input type="hidden" name="eventId" value={this.state.eventId} onChange={this.handleInputChange}/>
						
						<div className="editEventRow">
							<button type="submit">Save</button>
						</div>
					</form>
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

export default EditEvent;