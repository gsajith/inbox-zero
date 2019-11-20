import React from 'react';
import './HomePage.scss';

export default class HomePage extends React.PureComponent {
  render() {
    const { clickUseKeys } = this.props;
    return (
      <>
        <div className="description">
      Generate your Client ID and API key from
          {' '}
          <b>THIS LINK</b>
      . Do not share these keys!
        </div>
        <input id="clientId" type="text" name="clientId" placeholder="Client ID" />
        <input id="apiKey" type="text" name="apiKey" placeholder="API Key" />
        <button onClick={() => {
          clickUseKeys(
            document.getElementById('clientId').value,
            document.getElementById('apiKey').value,
          );
        }}
        >
      Use Keys
        </button>
      </>
    );
  }
}
