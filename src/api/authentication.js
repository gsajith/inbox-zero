// Adapted from https://github.com/elongineer/react-gmail-client
import {
  SIGNED_OUT,
  NO_AUTH,
} from '../shared/constants';

export const signIn = () => window.gapi.auth2
  .getAuthInstance()
  .signIn();

export const initGmailClient = (clientId, apiKey) => {
  let CLIENT_ID = process.env.REACT_APP_GMAIL_CLIENT_ID;
  let API_KEY = process.env.REACT_APP_GMAIL_API_KEY;

  if (clientId !== undefined && clientId.length > 0) {
    CLIENT_ID = clientId;
  }

  if (apiKey !== undefined && apiKey.length > 0) {
    API_KEY = apiKey;
  }

  // Array of API discovery doc URLs for APIs used by the quickstart
  const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'];

  // Authorization scopes required by the API; multiple scopes can be
  // included, separated by spaces.
  const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

  const { gapi } = window;

  return gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES,
  });
};

// Listener for sign-in state
export const updateSigninStatus = (isSignedIn) => {
  if (!isSignedIn) {
    // TODO: react to logged out status
  }
};

export const checkSignInStatus = (clientId, apiKey) => new Promise((resolve, reject) => {
  initGmailClient(clientId, apiKey).then(() => {
    if ((clientId === undefined || clientId.length === 0)
      && process.env.REACT_APP_GMAIL_CLIENT_ID === undefined) {
      reject(NO_AUTH);
    }
    if ((apiKey === undefined || apiKey.length === 0)
      && process.env.REACT_APP_GMAIL_API_KEY === undefined) {
      reject(NO_AUTH);
    }

    const { gapi } = window;

    const googleAuthInstance = gapi.auth2.getAuthInstance();

    const isSignedIn = googleAuthInstance.isSignedIn.get();

    if (isSignedIn) {
      // Listen for sign-in state changes.
      googleAuthInstance.isSignedIn.listen((signedIn) => {
        updateSigninStatus(signedIn);
      });

      resolve(googleAuthInstance.currentUser.Ab);
    } else {
      reject(SIGNED_OUT);
    }
  })
    .catch((error) => {
      reject(error);
    });
});

export const signOut = () => window.gapi.auth2
  .getAuthInstance()
  .signOut();
