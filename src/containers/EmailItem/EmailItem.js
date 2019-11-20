import React from 'react';
import PropTypes from 'prop-types';

import './EmailItem.scss';

export default class EmailItem extends React.PureComponent {
  render() {
    const {
      sender, senderEmail, numUnread, lastEmailDate,
    } = this.props;
    return (
      <div className="email-item">
        <div className="email-sender">
          {sender}
          {' '}
          {senderEmail}
        </div>
        <div className="email-filter-link">
          {numUnread}
          {' '}
          Unread
        </div>
        <div className="email-last-date">
          Last email:
          {' '}
          {lastEmailDate}
        </div>
      </div>
    );
  }
}

EmailItem.propTypes = {
  sender: PropTypes.string,
  senderEmail: PropTypes.string.isRequired,
  numUnread: PropTypes.string.isRequired,
  lastEmailDate: PropTypes.string.isRequired,
};

EmailItem.defaultProps = {
  sender: '',
};
