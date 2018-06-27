import React, { Component } from 'react';
import './Login.css';
import axios from 'axios';

class Login extends Component {
	render() {
		return (
			<main>
				<div id="signIn">
					<h1 id="signInTitle">Sign in with TravelBuddy</h1>
					
					<RegisterForm />
					<LoginForm />
				</div>
			</main>
		);
	}
}

class LoginForm extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			email: "",
			password: "",
		}
		
		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}
	
	render() {

        const isEnabled =
            this.state.email.length > 0 &&
            this.state.password.length > 0;

		return (
			<div id="loginForm">
				<h3>Already a member?</h3>
				<form onSubmit={this.handleSubmit} action='/login' method='POST'>
					<label>Email address</label>
					<input type="text" name="email" id={'email'} value={this.state.email} onChange={this.handleInputChange} placeholder="eg., johndoe@gmail.com"/>
					
					<label>Password</label>
					<input type="password" name="password" value={this.state.password} onChange={this.handleInputChange} placeholder="eg., •••••••"/>
					
					<label id="forgotPassword"><a href="">Forgot password</a></label>
					
					<button type="submit" name="submit" value='login' disabled={!isEnabled}>Login</button>
				</form>
			</div>
		);
	}
	
	handleInputChange(event) {
		const targetField = event.target;
		const value = targetField.value;
		const field = targetField.name;
		this.setState({
			[field]: value,
		});
	}
	
	handleSubmit(event) {
		// alert("Logged in! " + this.state.email + ": " + this.state.password);
	}
}

class RegisterForm extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			username: "",
			firstname: "",
			lastname: "",
			email: "",
			password: "",
			country: "",
			countries: []
		}
		
		axios.get("/api/countries")
				.then(response => {
					this.setState({countries: response.data});
				})
		
		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}


	render() {
        const isEnabled =
        this.state.username.length > 0 &&
        this.state.email.length > 0 &&
        this.state.firstname.length > 0 &&
        this.state.lastname.length > 0 &&
        this.state.password.length > 0 &&
        this.state.country.length > 0;

		return (
			<div id="registerForm" >
						<h3>Register</h3>
						<form onSubmit={this.handleSubmit} action='/register' method='POST'>

                            <label>Username</label>
                            <input type="text" name="username" value={this.state.username} onChange={this.handleInputChange} placeholder="eg., johndoe54"/>

                            <label>Email address</label>
							<input type="text" name="email" value={this.state.email} onChange={this.handleInputChange} placeholder="eg., johndoe@gmail.com"/>

							<label>First Name</label>
							<input type="text" name="firstname" value={this.state.firstname} onChange={this.handleInputChange} placeholder="eg., John"/>

							<label>Last Name</label>
							<input type="text" name="lastname" value={this.state.lastname} onChange={this.handleInputChange} placeholder="eg., Doe"/>

							<label>Password</label>
                            <input type="password" name="password" value={this.state.password} onChange={this.handleInputChange} placeholder="eg., •••••••"/>

                            <label>Country</label>
                            <select name="country" value={this.state.country} onChange={this.handleInputChange}>
								{this.state.countries.map((item) => (
									<option value={item.code}>{item.name}</option>
								))}
							</select>

							<button type="submit" name="submit" disabled={!isEnabled} value='register' className='registerBtn'>Register</button>
						</form>
					</div>
		);
	}

    handleClick = () => {
        this.setState({
            show: !this.state.show
        });
    }



	handleInputChange(event) {
		const targetField = event.target;
		const value = targetField.value;
		const field = targetField.name;
		this.setState({
			[field]: value
		});
	}
	
	handleSubmit(event) {
		alert("Register successful! " + this.state.email + ": " + this.state.password);
	}
}

export default Login;