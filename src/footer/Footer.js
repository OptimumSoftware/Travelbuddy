import React, { Component } from 'react';

import './Footer.css';
import facebookIcon from './facebook.svg';
import linkedIcon from './linkedin.svg';
import twitterIcon from './twitter.svg';

class Footer extends Component {
	render() {
		return (
			<footer>
				<a href="https://www.facebook.com">
                <img id="icon" src={facebookIcon} alt="facebookIcon" />
                </a>
                <a href="https://www.twitter.com">
                    <img id="icon" src={twitterIcon} alt="twitterIcon" />
                </a>
                <a href="https://www.linkedin.com">
                    <img id="icon" src={linkedIcon} alt="linkedIcon" />
                </a>
			</footer>
		);
	}
}

export default Footer;