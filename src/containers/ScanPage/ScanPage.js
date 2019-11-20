import React from 'react';
import './ScanPage.scss';
import PropTypes from 'prop-types';
import EmailItem from '../EmailItem/EmailItem';

import {
  FETCH_INACTIVE,
  FETCH_IN_PROGRESS,
} from '../../shared/constants';

function numberToCommaString(num) {
  // From https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default class ScanPage extends React.PureComponent {
  constructor(props) {
    super(props);

    this.fetchEmailsClicked = this.fetchEmailsClicked.bind(this);
  }

  fetchEmailsClicked() {
    const { fetchEmails, fetchStatus } = this.props;

    if (fetchStatus !== FETCH_IN_PROGRESS) {
      fetchEmails();
    }
  }

  render() {
    const {
      emails, numEmails, estimate, signOut, fetchEmails, fetchStatus,
    } = this.props;

    return (
      <>
        <div className={
          (emails.length > 0 || fetchStatus === FETCH_IN_PROGRESS)
            ? 'emails-container'
            : 'emails-container hidden'
          }
        >
          {emails.map((email) => (
            <EmailItem
              key={email.senderEmail}
              sender={email.sender}
              senderEmail={email.senderEmail}
              numUnread={email.numUnread}
              lastEmailDate={email.lastEmailDate}
            />
          ))}
        </div>
        {fetchStatus === FETCH_INACTIVE && (
        <label id="filter" className="check-container" htmlFor="unread-filter" tabIndex="0">
          Only scan unread emails
          <input id="unread-filter" type="checkbox" defaultChecked="checked" />
          <span className="checkmark" />
        </label>
        )}
        <div className="description estimate">
          Estimated time:
          {' '}
          {estimate}
        </div>
        <button
          onClick={this.fetchEmailsClicked}
          type="button"
          className={fetchStatus === FETCH_IN_PROGRESS ? 'disabled' : ''}
        >
          {fetchStatus === FETCH_IN_PROGRESS && (
            <>
            Fetching
              {' '}
              {numberToCommaString(emails.length * 1000)}
              {' '}
              /
              {numberToCommaString(numEmails)}
              {' '}
            emails
            </>
          )}
          {fetchStatus === FETCH_INACTIVE && (
            <>
              Fetch
              {' '}
              {numberToCommaString(numEmails)}
              {' '}
              emails
            </>
          )}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </>
    );
  }
}

ScanPage.propTypes = {
  emails: PropTypes.arrayOf(PropTypes.shape({
    sender: PropTypes.string,
    senderEmail: PropTypes.string,
    numUnread: PropTypes.string,
    lastEmailDate: PropTypes.string,
  })),
  numEmails: PropTypes.number.isRequired,
  estimate: PropTypes.string.isRequired,
  signOut: PropTypes.func.isRequired,
  fetchEmails: PropTypes.func.isRequired,
  fetchStatus: PropTypes.string,
};

ScanPage.defaultProps = {
  emails: [/* {
    sender: 'GrubHub',
    senderEmail: '<GrubHub@gmail.com>',
    numUnread: '180',
    lastEmailDate: '07-12-2018',
  } */],
  fetchStatus: FETCH_INACTIVE,
};
