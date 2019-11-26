import React from 'react';
import './AuthorizePage.scss';

export default class AuthorizePage extends React.PureComponent {
  render() {
    const { clickAuthorize } = this.props;
    return (
      <>
        <div className="description">
          A window will pop up asking for permissions to read your emails.
          None of your information is stored or shared.
          <br />
          <br />
          Read the
          {' '}
          <a href={`${process.env.PUBLIC_URL}/privacy-policy.html`} rel="noopener noreferrer" target="_blank">privacy policy</a>
          {' '}
          for more info.
        </div>
        <button onClick={clickAuthorize} type="button">
          Authorize
        </button>
      </>
    );
  }
}
