import React from 'react';
import './App.scss';
import HomePage from './containers/HomePage/HomePage';
import AuthorizePage from './containers/AuthorizePage/AuthorizePage';
import ScanPage from './containers/ScanPage/ScanPage';
import mountScripts from './api/scripts';
import { signOut, signIn, checkSignInStatus } from './api/authentication';
import { fetchEmailCounts, startFetchEmails, listMessages } from './api/api';
import {
  SIGNED_OUT,
  SIGNED_IN,
  NO_AUTH,
  AUTH_FAIL,
  MILLIS_PER_EMAIL,
  FETCH_INACTIVE,
  FETCH_IN_PROGRESS,
} from './shared/constants';

function millisToMinutes(millis) {
  const minutes = Math.ceil(millis / 60000);
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
}

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      numEmails: 0,
      emails: [],
      signInStatus: NO_AUTH,
      fetchStatus: FETCH_INACTIVE,
      user: null,
    };

    this.init = this.init.bind(this);
    this.initClient = this.initClient.bind(this);
    this.onSignIn = this.onSignIn.bind(this);
    this.onSignInSuccess = this.onSignInSuccess.bind(this);
    this.onSignout = this.onSignout.bind(this);
    this.onSignOutSuccess = this.onSignOutSuccess.bind(this);
    this.fetchEmails = this.fetchEmails.bind(this);
    this.updateFetchedEmails = this.updateFetchedEmails.bind(this);
  }

  componentDidMount() {
    mountScripts().then(this.init);
  }

  // Adapted from https://github.com/elongineer/react-gmail-client
  onSignout() {
    signOut().then(this.onSignOutSuccess).catch((error) => {
      // TODO
      console.error(error);
    });
  }

  // Adapted from https://github.com/elongineer/react-gmail-client
  onSignIn() {
    signIn()
      .then(this.onSignInSuccess)
      .catch((error) => {
      // TODO
        console.error(error);
      });
  }

  // Adapted from https://github.com/elongineer/react-gmail-client
  onSignInSuccess(googleUser) {
    this.setState({
      signInStatus: SIGNED_IN,
      user: googleUser,
    });

    console.log(googleUser);
    // TODO: Show signed in user in top right

    fetchEmailCounts().then((emailResult) => {
      const { totalEmails, unreadEmails } = emailResult;
      // TODO: handle total emails
      this.setState({
        numEmails: unreadEmails,
      });
    }).catch((error) => {
      // TODO
      console.log(error);
    });
  }

  onSignOutSuccess() {
    this.setState({
      signInStatus: SIGNED_OUT,
    });
    console.log('signed out');
  }

  fetchEmails() {
    this.setState({
      fetchStatus: FETCH_IN_PROGRESS,
    });
    console.log('stop trying to make fetch happen');

    startFetchEmails(this.updateFetchedEmails).then(() => {
      this.setState({
        fetchStatus: FETCH_INACTIVE,
        fetchedEmails: 0,
      });
    }).catch((error) => {
      console.log(error);
    });

    listMessages(undefined, 0, (email) => {
      // TODO update fetched emails
      askldfjlksdjf
    }, (responseCount) => {
      console.log('finished: ' + responseCount);
    }).then().catch((error) => {
      console.log(error);
    });
  }

  updateFetchedEmails(email) {
    this.setState({
      emails: [...this.state.emails, email],
    });
  }

  // Adapted from https://github.com/elongineer/react-gmail-client
  initClient(clientId, apiKey) {
    checkSignInStatus(clientId, apiKey)
      .then(this.onSignInSuccess)
      .catch((error) => {
        if (error === SIGNED_OUT) {
          this.setState({
            signInStatus: SIGNED_OUT,
          });
        } else if (error === NO_AUTH) {
          // TODO show required error
          console.log('no auth');
          this.setState({
            signInStatus: NO_AUTH,
          });
        } else {
          // TODO show auth failed error
          console.log(error);
          this.setState({
            signInStatus: AUTH_FAIL,
          });
        }
      });
  }

  // Adapted from https://github.com/elongineer/react-gmail-client
  init() {
    window.gapi.load('client:auth2', this.initClient);
  }

  render() {
    const {
      numEmails, emails, signInStatus, user, fetchStatus,
    } = this.state;
    return (
      <div className="container">
        <div className="title">
          Inbox
          {' '}
          <span className="title-highlight">Zero</span>
        </div>
        { signInStatus === NO_AUTH && <HomePage clickUseKeys={this.initClient} /> }
        {(signInStatus === AUTH_FAIL || signInStatus === SIGNED_OUT)
          && <AuthorizePage clickAuthorize={this.onSignIn} /> }
        {signInStatus === SIGNED_IN
          && (
          <ScanPage
            numEmails={numEmails}
            emails={emails}
            estimate={millisToMinutes(numEmails * MILLIS_PER_EMAIL)}
            signOut={this.onSignout}
            fetchEmails={this.fetchEmails}
            fetchStatus={fetchStatus}
          />
          )}
      </div>
    );
  }
}
