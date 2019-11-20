import {
  MILLIS_PER_EMAIL,
  MAX_RESULTS,
  PAGE_LIMIT,
} from '../shared/constants';

/**
 * Fetch the sender of the email in the given result
 * @param  {Result} result Result from Gmail API fetch for one email.
 */
// const _getFrom = (result) => {
//   let from = null;
//   let subject = '';
//   let i = 0;
//   for (i = 0; i < result.payload.headers.length; i += 1) {
//     if (result.payload.headers[i].name === 'From') {
//       from = result.payload.headers[i].value;
//     } else if (result.payload.headers[i].name === 'Subject') {
//       subject = result.payload.headers[i].value;
//     }
//   }
//
//   if (from) {
//     if (froms[from]) {
//       froms[from].count = froms[from].count + 1;
//       froms[from].emails.push({
//         snippet: result.snippet,
//         date: result.internalDate,
//         subject,
//       });
//     } else {
//       froms[from] = {
//         count: 1,
//         emails: [{
//           snippet: result.snippet,
//           date: result.internalDate,
//           subject,
//         }],
//       };
//     }
//   }
// }

export const fetchEmailCounts = () => new Promise((resolve, reject) => {
  window.gapi.client.gmail.users.labels.get({
    userId: 'me',
    id: 'INBOX',
  }).then((response) => {
    const totalEmails = response.result.messagesTotal;
    const unreadEmails = response.result.messagesUnread;
    resolve({ totalEmails, unreadEmails });
  }).catch((error) => {
    reject(error);
  });
});

export const startFetchEmails = (updateFetchedEmails) => new Promise((resolve, reject) => {
  // const interval = setInterval(() => {
  //   updateFetchedEmails({
  //     sender: 'GrubHub',
  //     senderEmail: '<GrubHub@gmail.com>',
  //     numUnread: '180',
  //     lastEmailDate: '07-12-2018',
  //   });
  // }, 1000);

  // setTimeout(() => {
  //   clearInterval(interval);
  //   resolve();
  // }, 12000);
  resolve();
});

export const listMessages = (pageToken, pages, fetchedEmail, finishFetch) => new Promise((resolve, reject) => {
  let i = 0;
  let responseCount = 0;

  window.gapi.client.gmail.users.messages.list({
    userId: 'me',
    maxResults: MAX_RESULTS,
    q: 'is:unread',
    pageToken,
  }).then((response) => {
    const {
      messages,
    } = response.result;
    const {
      nextPageToken,
    } = response.result;

    const pagesFetched = pages + 1;

    if (messages && messages.length > 0) {
      for (i = 0; i < messages.length; i += 1) {
        const message = messages[i];
        setTimeout((msg) => {
          window.gapi.client.gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
          }).then((res) => {
            fetchedEmail(res.result);
            responseCount += 1;
            if (responseCount >= MAX_RESULTS && nextPageToken && pagesFetched < PAGE_LIMIT) {
              listMessages(nextPageToken, pagesFetched, fetchedEmail, finishFetch);
            } else if (!nextPageToken || pagesFetched >= PAGE_LIMIT) {
              finishFetch(responseCount);
            }
          }, (error) => {
            reject(error);
          });
        }, i * MILLIS_PER_EMAIL, message);
      }
    }
  }, (error) => {
    reject(error);
  });
});
