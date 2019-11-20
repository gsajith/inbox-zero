import React from 'react';
import './AuthorizePage.scss';

export default class AuthorizePage extends React.PureComponent {
  render() {
    const {clickAuthorize} = this.props;
    return (
      <>
        <div className="description">
          A window will pop up asking for permissions to read your emails.
          None of this info is stored or shared, since we’re using
          {' '}
          <b>your</b>
          {' '}
          client ID.
        </div>
        <button onClick={clickAuthorize}>
            Authorize
        </button>
      </>
    );
  }
}
