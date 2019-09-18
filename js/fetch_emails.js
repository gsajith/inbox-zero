// TODO: Group by domain vs by sender name
// TODO: Display data as it's being loaded
// TODO: Progress bar
// TODO: Add warning before authorize

let CLIENT_ID = '';
let API_KEY = '';

// Don't change this value, it is tweaked for the Gmail API rate limits
const MAX_RESULTS = 200;
const MILLIS_PER_EMAIL = 7;
// const PAGE_LIMIT = 2;

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

// Get visible elements
const loading = document.getElementById('loading');
const clientKeyExplanation = document.getElementById('client_key_explanation');
const keysForm = document.getElementById('keys_form');
const authorizeButton = document.getElementById('authorize_button');
const signoutButton = document.getElementById('signout_button');
const fetchButton = document.getElementById('fetch_button');
const estimate = document.getElementById('estimate');
const estimateWrapper = document.getElementById('estimate-wrapper');
const filterCheckbox = document.getElementById('filter');
const unreadFilter = document.getElementById('unread_filter');
const about = document.getElementById('about');
about.onclick = handleAboutClick;

var modal = document.getElementById("about_modal");
var close = document.getElementsByClassName("close")[0];

about.onclick = function() {
  modal.style.display = "block";
}
close.onclick = function() {
  modal.style.display = "none";
}
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// Icon to link to external pages later
const EXTERNAL_LINK_ICON = '<span class="icon-external-link"></span>';

// State tracking
let pagesFetched = 0;
let froms = {};
let totalEmails = 0;
let unreadEmails = 0;

/**
 * Fetch user-inputted keys from form, and load Gmail API
 */
function submitKeys(form) {
  CLIENT_ID = form.clientId.value;
  API_KEY = form.apiKey.value;
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES,
  }).then(() => {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Hide keys form
    keysForm.style.display = 'none';
    clientKeyExplanation.style.display = 'none'

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
    fetchButton.onclick = handleFetchClick;
    unreadFilter.addEventListener('change', (event) => {
      if (event.target.checked) {
        fetchButton.innerHTML = `Fetch ${unreadEmails} emails`
        estimate.innerHTML = `Estimated time: ${millisToMinutes(unreadEmails * MILLIS_PER_EMAIL)}`
      } else {
        fetchButton.innerHTML = `Fetch ${totalEmails} emails`
        estimate.innerHTML = `Estimated time: ${millisToMinutes(totalEmails * MILLIS_PER_EMAIL)}`
      }
    })
  }, (error) => {
    var error = document.getElementById('error');
    error.style.display = 'block';
    const errorText = document.createTextNode(`${JSON.stringify(error, null, 2)}\n`);
    error.appendChild(errorText);
    console.log(error);
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    estimate.style.display = 'inline-block';
    estimateWrapper.style.display = 'block';
    fetchButton.style.display = 'block';
    filterCheckbox.style.display = 'block';
    fetchEmailCounts();
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
    fetchButton.style.display = 'none';
    estimate.style.display = 'none';
    estimateWrapper.style.display = 'none';
    filterCheckbox.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';
  title.style.marginTop = '15vh';
}

/**
 * Handle fetching emails upon button click.
 */
function handleFetchClick(event) {
  pagesFetched = 0;
  froms = {};
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';
  fetchEmailCounts();
  listMessages();
  loading.style.display = 'inline-block';
}

/**
 * Handle click on about button.
 */
function handleAboutClick(event) {
  alert('this is the about box');
}

/**
 * Get latest read and unread email counts, and update estimate.
 */
function fetchEmailCounts() {
  gapi.client.gmail.users.labels.get({
    userId: 'me',
    id: 'INBOX'
  }).then(function(response) {
    totalEmails = response.result.messagesTotal;
    unreadEmails = response.result.messagesUnread;
    if (unreadFilter.checked) {
      fetchButton.innerHTML = `Fetch ${unreadEmails} emails`
      estimate.innerHTML = `Estimated time: ${millisToMinutes(unreadEmails * MILLIS_PER_EMAIL)}`
    } else {
      fetchButton.innerHTML = `Fetch ${totalEmails} emails`
      estimate.innerHTML = `Estimated time: ${millisToMinutes(totalEmails * MILLIS_PER_EMAIL)}`
    }
  });
}

/**
 * Fetch the next MAX_RESULTS emails, starting at the page specified by pageToken.
 * @param  {String} pageToken Pagination token to get next page of emails
 */
function listMessages(pageToken) {
  gapi.client.gmail.users.messages.list({
    userId: 'me',
    maxResults: MAX_RESULTS,
    q: 'is:unread',
    pageToken,
  }).then((response) => {
    const {
      messages
    } = response.result;
    const {
      nextPageToken
    } = response.result;

    let responseCount = 0;

    if (unreadFilter.checked) {
      fetchButton.innerText = `Emails loading: ${pagesFetched * MAX_RESULTS}/${unreadEmails}`;
    } else {
      fetchButton.innerText = `Emails loading: ${pagesFetched * MAX_RESULTS}/${totalEmails}`;
    }

    pagesFetched += 1;

    fetchButton.classList.add('disabled');
    fetchButton.onclick = '';
    filterCheckbox.classList.add('disabled');
    unreadFilter.disabled = true;

    if (messages && messages.length > 0) {
      for (i = 0; i < messages.length; i++) {
        const message = messages[i];
        var printTimeout = 0;
        setTimeout((msg) => {
          gapi.client.gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
          }).then((response) => {
            getFrom(response.result);
            responseCount += 1;
            if (responseCount >= MAX_RESULTS && nextPageToken /*&& pagesFetched < PAGE_LIMIT*/ ) {
              listMessages(nextPageToken);
            } else if (!nextPageToken /* || pagesFetched >= PAGE_LIMIT */) {
              clearTimeout(printTimeout);
              printTimeout = setTimeout(() => {
                enableControls();
                printFroms();
              }, 2000);
            }
          }, (error) => {
            printError(error);
          });
        }, i * MILLIS_PER_EMAIL, message);
      }
    }
  }, (error) => {
    printError(error);
  });
}

/**
 * Enable buttons after they had been disabled while loading emails.
 */
function enableControls() {
  loading.style.display = 'none';
  fetchButton.innerText = 'Fetch Emails';
  fetchButton.classList.remove('disabled');
  fetchButton.onclick = handleFetchClick;
  filterCheckbox.classList.remove('disabled');
  unreadFilter.disabled = false;
}

/**
 * Attach the error to the error display div.
 * @param  {String} err Error to print.
 */
function printError(err) {
  enableControls();
  const error = document.getElementById('error');
  error.style.display = 'block';
  const errorText = document.createTextNode(`Error code ${err.result.error.code}: ${err.result.error.message}\n`);
  error.appendChild(errorText);
}

/**
 * Fetch the sender of the email in the given result
 * @param  {Result} result Result from Gmail API fetch for one email.
 */
function getFrom(result) {
  let from = null;
  let subject = '';
  for (i = 0; i < result.payload.headers.length; i++) {
    if (result.payload.headers[i].name === 'From') {
      from = result.payload.headers[i].value;
    } else if (result.payload.headers[i].name === 'Subject') {
      subject = result.payload.headers[i].value;
    }
  }

  if (from) {
    if (froms[from]) {
      froms[from].count = froms[from].count + 1;
      froms[from].emails.push({
        snippet: result.snippet,
        date: result.internalDate,
        subject,
      });
    } else {
      froms[from] = {
        count: 1,
        emails: [{
          snippet: result.snippet,
          date: result.internalDate,
          subject,
        }],
      };
    }
  }
}

/**
 * Convert given millis to minutes.
 * @param  {int} millis Milliseconds to convert to minutes
 * @return {String} String of millis converted to minutes
 */
function millisToMinutes(millis) {
  var minutes = Math.ceil(millis / 60000);
  return minutes + " " + (minutes === 1 ? "minute" : "minutes");
}

/**
 * Once all emails have been fetched, append the results to the page.
 */
function printFroms() {
  estimate.style.display = 'none';
  fetchButton.style.display = 'none';
  filterCheckbox.style.display = 'none';
  const resultsDiv = document.getElementById('results');
  resultsDiv.style.display = 'block';
  const title = document.getElementById('title');
  title.style.marginTop = '3vh';

  // Create items array
  const items = Object.keys(froms).map(key => [key, froms[key].count, froms[key].emails]);

  // Sort the array based on the second element
  items.sort((first, second) => second[1] - first[1]);

  for (i = 0; i < items.length; i++) {
    resultsDiv.appendChild(generateEmailList(items[i]));
  }
}

/**
 * Given a sender and all the emails they've sent, generate a panel to append to the page.
 */
function generateEmailList(item) {
  const newDiv = document.createElement('div');
  newDiv.className = 'panel';

  newDiv.innerText = item[0];

  let lastDate = 0;
  for (j = 0; j < item[2].length; j++) {
    if (item[2][j].date > lastDate) {
      lastDate = item[2][j].date;
    }
  }
  const date = new Date(parseInt(lastDate, 10));
  const year = date.getFullYear();
  const month = (`0${date.getMonth() + 1}`).slice(-2);
  const day = (`0${date.getDate()}`).slice(-2);

  let from = '';
  if (item[0].indexOf('>') > 0) {
    from = item[0].substring(item[0].indexOf('<') + 1, item[0].indexOf('>'));
  } else {
    from = item[0];
  }

  newDiv.innerHTML = `${newDiv.innerHTML} <br><span class='unreads'><a href='https://mail.google.com/mail/u/0/#search/is%3Aunread+from%3A${from}' target='_blank'>${item[1]} unread ${EXTERNAL_LINK_ICON}</a></span>`;
  newDiv.innerHTML = `${newDiv.innerHTML}<span class='date-float'> Last email: ${month}-${day}-${year}</span>`;

  return newDiv;
}