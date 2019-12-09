import React from 'react';
import PropTypes from 'prop-types';

import './EmailItem.scss';

export default class EmailItem extends React.PureComponent {
  render() {
    const {
      sender, senderEmail, numUnread, lastEmailDate,
    } = this.props;

    const emailDate = new Date(lastEmailDate);
    const dateString = `${emailDate.getMonth() + 1}/${emailDate.getDate()}/${emailDate.getFullYear()}`;

    return (
      <div className="email-item">
        <div className="email-sender">
          {sender}
          {' '}
          <span className="email-sender-email">{senderEmail}</span>
        </div>
        <a href={(`https://mail.google.com/mail/u/0/#search/from%3A${senderEmail.replace('<', '').replace('>', '').replace('@', '%40')}`)} target="_blank" rel="noopener noreferrer" className="email-filter-link">
          <span className="tooltiptext">Note: Gmail filter links may take up to 30 seconds to load.</span>
          {numUnread}
          {' '}
          Unread
        </a>
        <div className="email-last-date">
          Last email:
          {' '}
          {dateString}
        </div>
      </div>
    );
  }
}

EmailItem.propTypes = {
  sender: PropTypes.string,
  senderEmail: PropTypes.string.isRequired,
  numUnread: PropTypes.number.isRequired,
  lastEmailDate: PropTypes.number.isRequired,
};

EmailItem.defaultProps = {
  sender: '',
};
