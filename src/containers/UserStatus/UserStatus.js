import React from 'react';
import './UserStatus.scss';
import PropTypes from 'prop-types';

export default class UserStatus extends React.PureComponent {
  render() {
    const { user } = this.props;
    return (
      <div className="user-status">
        {user !== null && (
          <>
            <span className="user-name">
              {user.w3.ig}
            </span>
            <div className="profile-image-wrapper">
              <img src={user.w3.Paa} alt="Profile" />
            </div>
          </>
        )}
        {user === null && (
          <span className="user-name">
            Not signed in
          </span>
        )}

      </div>
    );
  }
}

UserStatus.propTypes = {
  user: PropTypes.shape(),
};

UserStatus.defaultProps = {
  user: {
    w3: {
      ig: '',
      Paa: '',
    },
  },
};
