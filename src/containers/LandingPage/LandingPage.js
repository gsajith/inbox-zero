import React from 'react'; import {
  Link,
} from 'react-router-dom';
import DemoGif from './inbox-zero-demo.gif';
import './LandingPage.scss';
import './devices.min.css';

export default class LandingPage extends React.PureComponent {
  render() {
    return (
      <>
        <div className="container">
          <div className="flex-container">
            <div className="title">
              Inbox
              {' '}
              <span className="title-highlight">Zero</span>
            </div>

            <div className="about-container">
              <div className="about-text">
                Have too many unread emails and don&apos;t know how to tackle them?
                <br />
                <br />
                <b>Inbox Zero</b>
                {' '}
                is an open-source tool which scans your Gmail inbox and tells you
                who sends you the most emails.
                <br />
                <br />
                It provides links to help you easily filter, unsubscribe from, and delete these
                emails. This tool scans your email inbox, but none of your data is stored or
                transferred to anybody. The code is
                {' '}
                <a href="https://github.com/gsajith/inbox-zero" target="_blank" rel="noopener noreferrer">open-sourced here</a>
                .
              </div>
              <div className="about-image">
                <div className="device device-iphone-8 device-gold">
                  <div className="device-frame">
                    <img className="device-content" src={DemoGif} />
                  </div>
                  <div className="device-stripe" />
                  <div className="device-header" />
                  <div className="device-sensors" />
                  <div className="device-btns" />
                  <div className="device-power" />
                </div>
              </div>
            </div>
            <Link to="/start">
              <button type="button">
                Go to App
              </button>
            </Link>
            <div className="about-footer">
              This tool is licensed under the GNU General Public License v3.0.
              <br />
              © 2019 Gautham Sajith All Rights Reserved
            </div>
          </div>
        </div>
      </>
    );
  }
}
