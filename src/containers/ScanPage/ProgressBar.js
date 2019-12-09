import React from 'react';
import './ProgressBar.scss';
import PropTypes from 'prop-types';

export default class ProgressBar extends React.PureComponent {
  render() {
    const { numerator, denominator } = this.props;

    const barStyle = {
      width: `${(numerator * 100) / denominator}%`,
    };

    return (
      <div className="progress-bar">
        <div className="progress-bar-fill" style={barStyle}>
          {`${Math.round((numerator * 100) / denominator)}%`}
        </div>
      </div>
    );
  }
}

ProgressBar.propTypes = {
  numerator: PropTypes.number.isRequired,
  denominator: PropTypes.number.isRequired,
};
