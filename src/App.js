import React from 'react';
import './App.scss';
import HomePage from './containers/HomePage/HomePage';
import LoadingPage from './containers/LoadingPage/LoadingPage';
import AuthorizePage from './containers/AuthorizePage/AuthorizePage';
import UserStatus from './containers/UserStatus/UserStatus';
import ScanPage from './containers/ScanPage/ScanPage';
import mountScripts from './api/scripts';
import { signOut, signIn, checkSignInStatus } from './api/authentication';
import { fetchEmailCounts, listMessages } from './api/api';
import InfoSVG from './info-24px.svg';
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

// TODO: Unread check
// TODO: Export scan results

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
      unreadEmails: 0,
      totalEmails: 0,
      emailsFetched: 0,
      emails: {},
      signInStatus: LOADING,
      fetchStatus: FETCH_INACTIVE,
      user: null,
      showAboutModal: false,
      unreadChecked: true,
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
    this.showAboutModal = this.showAboutModal.bind(this);
    this.hideAboutModal = this.hideAboutModal.bind(this);
    this.toggleUnreadCheck = this.toggleUnreadCheck.bind(this);
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
      unreadEmails: 0,
      totalEmails: 0,
      emailsFetched: 0,
      emails: {},
      fetchStatus: FETCH_INACTIVE,
      unreadChecked: true,
    });

    console.log(googleUser);
    // TODO: Show signed in user in top right

    fetchEmailCounts().then((emailResult) => {
      const { totalEmails, unreadEmails } = emailResult;
      // TODO: handle total emails
      this.setState({
        unreadEmails,
        totalEmails,
      });
    }).catch((error) => {
      // TODO
      console.log(error);
    });
  }

  onSignOutSuccess() {
    this.setState({
      signInStatus: SIGNED_OUT,
      unreadChecked: true,
    });

    clearInterval(updateEmailInterval);
    clearInterval(updateCountInterval);
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
    const { fetchStatus, unreadChecked } = this.state;
    if (fetchStatus !== FETCH_IN_PROGRESS) {
      this.setState({
        fetchStatus: FETCH_IN_PROGRESS,
        emails: {},
        emailsFetched: 0,
      });

      globalEmails = {};
      globalFetchedEmailCount = 0;

      updateEmailInterval = setInterval(this.updateEmails, 1000);

      updateCountInterval = setInterval(this.updateEmailCount, 83);

      listMessages(unreadChecked, undefined, 0, (email) => {
        App.updateFetchedEmails(email);
        globalFetchedEmailCount += 1;
      }, () => {
        clearInterval(updateEmailInterval);
        clearInterval(updateCountInterval);
        this.updateEmails();
        this.updateEmailCount();
        this.setState({
          fetchStatus: FETCH_INACTIVE,
          unreadChecked: true,
        });
      }).then().catch((error) => {
        console.log(error);
      });
    }
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

  showAboutModal(e) {
    this.setState({
      showAboutModal: true,
    });

    e.stopPropagation();
  }

  hideAboutModal(e) {
    console.log('click');
    this.setState({
      showAboutModal: false,
    });

    e.stopPropagation();
  }

  toggleUnreadCheck() {
    this.setState((state) => ({
      unreadChecked: !state.unreadChecked,
    }));
  }

  render() {
    const {
      unreadEmails,
      totalEmails,
      emailsFetched,
      emails,
      signInStatus,
      user,
      fetchStatus,
      showAboutModal,
      unreadChecked,
    } = this.state;

    return (
      <>
        <div className="container">
          {signInStatus === SIGNED_IN && (
            <UserStatus
              user={user}
            />
          )}
          <div className="flex-container">
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
                  numEmails={unreadChecked ? unreadEmails : totalEmails}
                  emailsFetched={emailsFetched}
                  emails={emails}
                  estimate={
                    millisToMinutes((unreadChecked ? unreadEmails : totalEmails) * MILLIS_PER_EMAIL)
                  }
                  signOut={this.onSignout}
                  fetchEmails={this.fetchEmails}
                  fetchStatus={fetchStatus}
                  toggleUnreadCheck={this.toggleUnreadCheck}
                />
              )}
          </div>
          <button className="about-modal-link" type="button" onClick={this.showAboutModal}>
            About Inbox Zero
          </button>
          <button className="about-modal-icon" type="button" onClick={this.showAboutModal}>
            <img src={InfoSVG} alt="More info" />
          </button>
        </div>
        {showAboutModal && (
          <div
            className="about-modal-wrapper"
            onClick={this.hideAboutModal}
            onKeyPress={this.hideAboutModal}
            role="link"
            tabIndex={-1}
          >
            <div
              className="about-modal"
              onClick={this.showAboutModal}
              onKeyPress={this.showAboutModal}
              role="link"
              tabIndex={-1}
            >
              <button className="close-icon" type="button" onClick={this.hideAboutModal}>
                X
              </button>
              <div className="about-text">
                <b>Inbox Zero</b>
                {' '}
                is an open-source tool which scans your Gmail inbox and tells you
                who sends you the most emails.
                <br />
                <br />
                It provides links to help you easily filter, unsubscribe from, and delete these
                emails. This tool scans your email inbox, but none of your data is stored or
                transferred to anybody. If you&apos;d like to check for yourself, the code is
                {' '}
                <a href="https://github.com/gsajith/inbox-zero" target="_blank" rel="noopener noreferrer">open-sourced here</a>
                .
                <br />
                <br />
                <div className="about-footer">
                  This tool is licensed under the GNU General Public License v3.0.
                  <br />
                  © 2019 Gautham Sajith All Rights Reserved
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}
