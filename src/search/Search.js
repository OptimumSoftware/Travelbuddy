import React, {Component} from "react";
import './Search.css';
import loader from '../images/loader.gif';
import axios from "axios/index";
import ResultList from './ResultList.js';
import CategoryList from './CategoryList.js';
import RadiusFilter from './RadiusFilter.js';
import Modal   from '../modal/Modal';
import PlacesAutocomplete from 'react-places-autocomplete';
import { geocodeByAddress, geocodeByPlaceId, getLatLng } from 'react-places-autocomplete';

class Search extends Component {
    constructor(props) {
        super(props);

        this.state = {
            results: [],
            categories: [],
			input: "",
            type: "",
            radius: "",
            language: "",
            openNow: false,
            locationLng: "",
            locationLat: "",
            loading: "",
            searchType: "city",
            show: false,
            prevPage: "",
            nextPage: "",
            middlePage: "",
            firstPage: false,
            savedQuery: "",
            checkPage: 0,
            loadGoogleLib: false
        };

        this.getCategories()
        this.handleAddressChange = this.handleAddressChange.bind(this);
        this.handleAddressSelect = this.handleAddressSelect.bind(this);
    }

    apikey = "&key=AIzaSyDA8JeZ3hy9n1XHBBuq6ke8M9BfiACME_E";
    proxy ="https://cors-anywhere.herokuapp.com/";

    componentDidMount() {
        navigator.geolocation.getCurrentPosition((position) => {
            this.setState({
                currentLat: position.coords.latitude,
                currentLng: position.coords.longitude
            })
        })
		this.redirectedSearch();
    }

	redirectedSearch() {
        let sq = window.location.search;
        sq = sq.substring(3)
        if (sq.length > 0) {
			this.setState({
				input: sq,
				searchType: "keyword"
			})
			document.getElementById("typeSearch").value = "keyword";

			{/*this.searchByKeyword()*/}
        }else {
            console.log("lege qs")
        }
    }

	handleChange = (e) => {
        this.setState({
            input: e.target.value,
        })
    }


    handleClick = () => {
        this.setState({
            show: !this.state.show
        });
    };


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

    hideModal = () => {
        this.setState({showModal: false})
    };

    getCategories() {
        axios.get('/api/categories')
            .then(result => {
                let temp = []
                this.setState({
                    jsonCategories: result.data
                })
                for (let key in this.state.jsonCategories) {
                    temp.push(key)
                }
                this.setState({
                    categories: temp
                })
            });

    }

    searchByKeyword = (e) => {
        let keyword = this.state.input.split(' ').join('+');
        let url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + keyword +
            this.apikey;
        fetch(this.proxy + url)
            .then(response => response.json())
            .then(result => {
                this.setState({
                    results: result.results,
                    nextPage: result.next_page_token,
                    middlePage: result.next_page_token,
                    savedQuery: url
                });
                console.log(this.state.results)
            });
    }

    getPrevPage = (e) => {
        this.setState({
            checkPage: this.state.checkPage - 1
        })
        let url;
        if (this.state.firstPage) {
            url = this.state.savedQuery;
        } else {
            url = this.state.savedQuery + "&pagetoken=" + this.state.middlePage;
        }
        fetch(this.proxy + url)
            .then(response => response.json())
            .then(result => {
                this.setState({
                    results: result.results,
                    nextPage: result.next_page_token,
                    firstPage: true,
                });
                console.log(this.state.results)
            });
    }

    getNextPage = (e) => {
        if (this.state.checkPage <= 0) {
            this.setState({
                firstPage: true,
                checkPage: 1
            })
        } else {
            this.setState({
                firstPage: false,
                checkPage: 2
            })
        }
        this.setState({
            prevPage: this.state.nextPage,
        })
        let url = this.state.savedQuery + "&pagetoken=" + this.state.nextPage;
        fetch(this.proxy + url)
            .then(response => response.json())
            .then(result => {
                this.setState({
                    results: result.results,
                    nextPage: result.next_page_token,
                });
                console.log(this.state.results)
            });
    }

    searchByPlace = (e) => {
        let keyword = this.state.input.split(' ').join('+');
        let location = "https://maps.googleapis.com/maps/api/geocode/json?address=" + keyword + this.apikey;
        let distance = "&radius=" + this.state.radius;
        let open = "&opennow=" + this.state.openNow;
        let type = "&type=" + this.state.type;
        this.setState({
            loading: "loading",
            results: []
        })
        fetch(location)
            .then(response => response.json())
            .then(result => {
                this.setState({
                    locationLng: result.results[0].geometry.location.lng,
                    locationLat: result.results[0].geometry.location.lat
                })
                let specLocation = this.state.locationLat + "," + this.state.locationLng
                let url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + specLocation
                    + distance + type + open + "&key=AIzaSyDA8JeZ3hy9n1XHBBuq6ke8M9BfiACME_E";
                fetch(this.proxy + url)
                    .then(response => response.json())
                    .then(result => {
                        this.setState({
                            loading: ""
                        })
                        this.setState({
                            results: result.results,
                            nextPage: result.next_page_token,
                            middlePage: result.next_page_token,
                            savedQuery: url
                        });
                        console.log(this.state.results)
                    });
            });


    }

    setSearch = (e) => {
        this.setState({
            searchType: e.target.value
        })
    }


    checkSearch = (e) => {
        if (this.state.searchType == "city") {
            this.searchByPlace(e)
        } else {
            this.searchByKeyword(e)
        }
    }

    changeType = (e) => {
        this.setState({
            type: e.target.value
        })
    }

    changeOpen = (e) => {
        if (this.state.openNow == false) {
            this.setState({
                openNow: true,
                open: "Open now"
            })
        } else {
            this.setState({
                openNow: false,
                open: ""
            })
        }
    }

    changeRadius = (e) => {
        this.setState({
            radius: e.target.value
        })
    }

    handleAddressChange(input) {
        this.setState({ input })
    }

    handleAddressSelect(input) {
        geocodeByAddress(input)
            .then(results => {
                this.setState({input: results[0]['formatted_address']})
            })
            .catch(err => console.error(err))
    }


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
                id = {this.state.modalId}
                currentLat = {this.state.currentLat}
                currentLng = {this.state.currentLng}
            />
        }


        return (
            <div className={"data"}>
                <div className={"searchHeader"}>
                    <div className={"col-12 search"}>
                        <h3>Search TravelBuddy {this.state.input}</h3>
                        <select onChange={this.setSearch} className='search-select' id='typeSearch'>
                            <option value="city" >City search</option>
                            <option value="keyword" >Keyword search</option>
                        </select>
                        {this.state.searchType == "city" ?
                            <PlacesAutocomplete
                                value={this.state.input}
                                onChange={this.handleAddressChange}
                                onSelect={this.handleAddressSelect}
                            >
                                {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                                    <div id="autoSearch">
                                        <input
                                            {...getInputProps({
                                                placeholder: 'Groningen',
                                                name: 'place'
                                            })}
                                            id="autoSearchBar"
                                        />
                                        <div className="search-suggest-select-container">
                                            {suggestions.map(item => {
                                                const className = item.active ? 'search-suggest-item-active' : 'search-suggest-item-inactive';
                                                return (
                                                    <div {...getSuggestionItemProps(item, { className })} id='search-suggest-item'>
                                                        <span>{item.description}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </PlacesAutocomplete>
                            :
                            <input type={"text"} name={"place"} value={this.state.input} onChange={this.handleChange}/>
                        }
                        <button type={"submit"} name={"submit"} onClick={this.checkSearch}>Zoek</button>
                    </div>
                </div>
                <div className={"col-12"}>
                    <div className={"searchContainer"}>
                        {this.state.searchType == "city" &&
                        <div className={"filter"}>
                            <div className={"selection"}>
                                <div>
                                    <p>Your selection</p>
                                    <ul className={"yourSelection"}>
                                        {this.state.type != "" &&
                                        <li><label
                                            className={"preference"}>{this.state.type.split('_').join(' ')}</label>
                                        </li>}
                                        {this.state.openNow != false &&
                                        <li><label className={"preference"}>{this.state.open}</label></li>}
                                        {this.state.radius != "" &&
                                        <li><label className={"preference"}>
                                            {this.state.radius.substring(0, this.state.radius.length - 3)} km</label>
                                        </li>}
                                    </ul>
                                </div>
                                <div>
                                    <p>Type of result</p>
                                    <CategoryList categories={this.state.categories} click={this.changeType}/>
                                </div>
                                <div>
                                    <p>Opened</p>
                                    <ul>
                                        <li>
                                            <input type="checkbox" onClick={this.changeOpen}
                                                   checked={this.state.openNow}/>
                                            <span>Is open</span>
                                        </li>
                                    </ul>
                                </div>
                                <RadiusFilter handler={this.changeRadius} />
                            </div>
                        </div>
                        }
                        <div className={"allResults"}>
                            {this.state.loading &&
                            <div>
                                <img src={loader} />
                                <h2>Please wait, we will load your preferences</h2>
                            </div>
                            }
                            <ResultList results={this.state.results} results={this.state.results} handlerss={this.modalHandler}/>
                            <div className={"pagination"}>
                                {this.state.prevPage &&
                                <p onClick={this.getPrevPage} className={"prev"} >Show previous results</p>
                                }
                                {this.state.nextPage &&
                                <p onClick={this.getNextPage} className={"next"} >Show next results</p>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                {viewModal}
            </div>
        )
    }
}


export default Search;