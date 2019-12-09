import React from 'react';
import './HomePage.scss';
import PropTypes from 'prop-types';


export default class HomePage extends React.PureComponent {
  render() {
    const { clickUseKeys } = this.props;
    return (
      <>
        <div className="description">
          Generate your Client ID and API key from
          {' '}
          <a href="https://developers.google.com/gmail/api/quickstart/js" rel="noopener noreferrer" target="_blank">this tutorial</a>
          . Do not share these keys!
        </div>
        <input id="clientId" type="text" name="clientId" placeholder="Client ID" />
        <input id="apiKey" type="text" name="apiKey" placeholder="API Key" />
        <button
          type="button"
          onClick={() => {
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

HomePage.propTypes = {
  clickUseKeys: PropTypes.func.isRequired,
};
