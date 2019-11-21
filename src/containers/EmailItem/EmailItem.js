import React from 'react';
import PropTypes from 'prop-types';

import './EmailItem.scss';

export default class EmailItem extends React.PureComponent {
  render() {
    const {
      sender, senderEmail, numUnread, lastEmailDate,
    } = this.props;

    let emailDate = new Date(lastEmailDate);
    let dateString = (emailDate.getMonth() + 1) + '/' + emailDate.getDate() + '/' + (emailDate.getFullYear());

    return (
      <div className="email-item">
        <div className="email-sender">
          {sender}
          {' '}
          <span className="email-sender-email">{senderEmail}</span>
        </div>
        <div className="email-filter-link">
          {numUnread}
          {' '}
          Unread
        </div>
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
