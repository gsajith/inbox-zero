import React from 'react';
import './App.scss';
import HomePage from './containers/HomePage/HomePage';
import LoadingPage from './containers/LoadingPage/LoadingPage';
import AuthorizePage from './containers/AuthorizePage/AuthorizePage';
import ScanPage from './containers/ScanPage/ScanPage';
import mountScripts from './api/scripts';
import { signOut, signIn, checkSignInStatus } from './api/authentication';
import { fetchEmailCounts, listMessages } from './api/api';
import {
  SIGNED_OUT,
  SIGNED_IN,
  NO_AUTH,
  AUTH_FAIL,
  LOADING,
  MILLIS_PER_EMAIL,
  FETCH_INACTIVE,
  FETCH_IN_PROGRESS,
} from './shared/constants';

let globalEmails = {};
let globalFetchedEmailCount = 0;
let updateEmailInterval = 0;
let updateCountInterval = 0;

function millisToMinutes(millis) {
  const minutes = Math.ceil(millis / 60000);
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
}

function filterDomain(emailFrom) {
  if (!emailFrom.includes('<')) {
    return emailFrom;
  }
  return emailFrom.substring(emailFrom.lastIndexOf('<'), emailFrom.lastIndexOf('>') + 1);
}

function filterSender(emailFrom) {
  return emailFrom.substring(0, emailFrom.indexOf('<'));
}

export default class App extends React.Component {
  static updateFetchedEmails(email) {
    const from = email.payload.headers.filter((header) => header.name.toLowerCase() === 'from');

    const date = email.payload.headers.filter((header) => header.name.toLowerCase() === 'date');

    if (date[0] === undefined) {
      return;
    }

    if (from.length === 0) {
      console.error(email);
    }
    const emailDomain = filterDomain(from[0].value);

    if (emailDomain.length === 0) {
      console.error(email);
    }

    let emailObject = {};
    if (globalEmails[emailDomain] === undefined) {
      const emailSender = filterSender(from[0].value);
      emailObject = {
        sender: emailSender,
        senderEmail: emailDomain,
        numUnread: 1,
        lastEmailDate: new Date(date[0].value).getTime(),
      };
    } else {
      emailObject = globalEmails[emailDomain];
      emailObject.numUnread += 1;
      if (new Date(date[0].value).getTime() > emailObject.lastEmailDate) {
        emailObject.lastEmailDate = new Date(date[0].value).getTime();
      }
    }

    globalEmails[emailDomain] = emailObject;
  }

  constructor(props) {
    super(props);

    this.state = {
      numEmails: 0,
      emailsFetched: 0,
      emails: {},
      signInStatus: LOADING,
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
    this.updateEmails = this.updateEmails.bind(this);
    this.updateEmailCount = this.updateEmailCount.bind(this);
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

  updateEmails() {
    this.setState({
      emails: JSON.parse(JSON.stringify(globalEmails)),
    });
  }

  updateEmailCount() {
    this.setState({
      emailsFetched: globalFetchedEmailCount,
    });
  }

  fetchEmails() {
    this.setState({
      fetchStatus: FETCH_IN_PROGRESS,
      emails: {},
      emailsFetched: 0,
    });

    globalEmails = {};
    globalFetchedEmailCount = 0;

    updateEmailInterval = setInterval(this.updateEmails, 1000);

    updateCountInterval = setInterval(this.updateEmailCount, 83);

    listMessages(undefined, 0, (email) => {
      App.updateFetchedEmails(email);
      globalFetchedEmailCount += 1;
    }, () => {
      clearInterval(updateEmailInterval);
      clearInterval(updateCountInterval);
      this.updateEmails();
      this.updateEmailCount();
      this.setState({
        fetchStatus: FETCH_INACTIVE,
      });
    }).then().catch((error) => {
      console.log(error);
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
      numEmails, emailsFetched, emails, signInStatus, user, fetchStatus,
    } = this.state;

    return (
      <div className="container">
        <div className="title">
          Inbox
          {' '}
          <span className="title-highlight">Zero</span>
        </div>
        {signInStatus === LOADING && <LoadingPage />}
        {signInStatus === NO_AUTH && <HomePage clickUseKeys={this.initClient} />}
        {(signInStatus === AUTH_FAIL || signInStatus === SIGNED_OUT)
          && <AuthorizePage clickAuthorize={this.onSignIn} />}
        {signInStatus === SIGNED_IN
          && (
            <ScanPage
              numEmails={numEmails}
              emailsFetched={emailsFetched}
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
