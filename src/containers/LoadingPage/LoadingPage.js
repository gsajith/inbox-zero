import React from 'react';
import './LoadingPage.scss';

export default class LoadingPage extends React.PureComponent {
  render() {
    return (
      <>
        <div className="description">
          <div className="lds-ring">
            <div />
            <div />
            <div />
            <div />
          </div>
          Loading...
        </div>
      </>
    );
  }
}
