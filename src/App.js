import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import './App.scss';
import LandingPage from './containers/LandingPage/LandingPage';
import StartPage from './containers/StartPage/StartPage';

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route exact path="/">
            <LandingPage />
          </Route>
          <Route path="/start">
            <StartPage />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
