import React, { Component } from 'react';
import './Friends.css';
import axios from "axios/index";

class Friends  extends Component {

    constructor(props) {
        super(props)

        this.state = {
            friendsList: []
        }

        const url = "/api/user/friends"
        axios.get(url)
            .then(response => {
                this.setState({
                    friendsList: response.data.friends
                })
                console.log(this.state.friendsList)
            });
    }

    createContent = () => {
        for(let index = 0; index < this.state.friendsList.length;index++){
            return this.state.friendsList[index]
        }

    }
        render() {
            return (
                <div>
                    <ul id="friendListResult">
                        {this.state.friendsList.map((values,i) => {
                            return <Friend
                            firstname={values[0]}
                            lastname={values[1]}
                            country={values[2]}
                            username={values[3]}
                            />
                        })}
                    </ul>
                </div>


            );
    }
}

class Friend extends Component {

    constructor(props) {
        super(props);

    }

    render() {
        return (
          <div className={'friend'}>
              <h4 id={'name'}>{this.props.firstname + " " + this.props.lastname}</h4>
              <h5 id={'name'}>{this.props.username}</h5>
              <h5 id={'name'}>{this.props.country}</h5>
              <button id={'messageButton'}>Message</button>
              < hr id={'hr'}/>
          </div>

        );

    }
}

export default Friends;