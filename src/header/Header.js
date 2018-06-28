import React, { Component } from 'react';
import { 
	NavLink,
	BrowserRouter
} from 'react-router-dom';
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import userIcon from '@fortawesome/fontawesome-free-solid/faCaretDown'
import searchIcon from '@fortawesome/fontawesome-free-solid/faSearch'

import './Header.css';
import mainLogo from '../images/logo.svg';
import axios from "axios/index";
import Gravatar from 'react-gravatar'


class Header extends Component {
    constructor(props) {
        super(props);
		
		this.state = {
			name: "",
			avatar: "",
			check: false
		};



        const userURL = "/api/loginName"

        axios.get(userURL)
            .then(response => {
              this.setState({name: response.data.yourName, avatar: response.data.yourEmail})
            });
    }



	render() {
		return (
			<header>
				<Gravatar id={'avatar'} email={this.state.avatar} size={27} />
                {/*<img  id={'avatar'} src={this.state.avatar} alt="avatar"/>*/}
				<div id='topBar'>
                    < DropDown  />

				</div>
                <h4 id="headerName" >{this.state.name}</h4>
                <NavLink to="/" className={'mainLogo'}>
                </NavLink>

				<div>
                    <div id="search">
                        <input id="headerSearch" type={"text"} name={"place"} placeholder={' Restaurants in Amsterdam'}  />
                        <div id="searchIcon">
                            <NavLink to="/search"><FontAwesomeIcon icon={searchIcon} /></NavLink>
                        </div>
                    </div>
				</div>



			</header>
		);
	}
}

class DropDown extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showDropDown: false,
		}
		
		this.toggleMenu = this.toggleMenu.bind(this);
	}

	
	render() {
		return (

			<div id="dropDown">
				<div id="dropDownIcon" onClick={this.toggleMenu}>
					<FontAwesomeIcon icon={userIcon} />
				</div>
				{this.state.showDropDown ? <Menu /> : null}
			</div>
		)
	}
		
	toggleMenu() {
		this.setState({
			showDropDown: !this.state.showDropDown
		}, ()=>this.listen())
	}
	
	listen() {
		if(this.state.showDropDown) {
			document.addEventListener('click', this.toggleMenu);
		}
		else {
			 document.removeEventListener('click', this.toggleMenu);
		}
	}
}

class Menu extends Component {

    state = {
        check: false,
		showLogin: true
    }

    constructor(props) {
        super(props);

        const url = "/api/loginValue"
        axios.get(url)
            .then(response => {
               this.setState({check: response.data.value});
                this.setState({showLogin: !response.data.value});
            });

    }


	render() {
		return (
			<ul id="menu">
				<a onClick={() => this.dispatchNewRoute('/')}><li>Home</li></a>
				<a style={{display: this.state.showLogin ? 'block': 'none' }} onClick={() => this.dispatchNewRoute('/profile')}><li>Profile</li></a>
				{/*<a onClick={() => this.dispatchNewRoute('/profile')}><li>Profile</li></a>*/}
				<a style={{display: this.state.check ? 'block': 'none' }} onClick={() => this.dispatchNewRoute('/addEvent')}><li>Add Event</li></a>
                <a style={{display: this.state.showLogin ? 'block' : 'none' }} onClick={() => this.dispatchNewRoute('/login')}><li>Login</li></a>
                {/*<a style={{display: this.state.check ? 'block' : 'none' }} onClick={() => this.dispatchNewRoute('/friends')}><li>Friends</li></a>*/}
				<a style={{display: this.state.check ? 'block' : 'none' }} onClick={() => this.dispatchNewRoute('/logout')}><li>Logout</li></a>
				{/*<li><NavLink to="/">Home</NavLink></li>
				<li><NavLink to="/login">Login</NavLink></li>
				<li><NavLink to="/profile">Profile</NavLink></li>
				<li><NavLink to="/addEvent">Add Event</NavLink></li>*/}
			</ul>
		);
	}
	
	dispatchNewRoute(route) {
        window.location.href = route
    }
}

export default Header;