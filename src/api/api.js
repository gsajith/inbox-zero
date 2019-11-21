import {
  MILLIS_PER_EMAIL,
  MAX_RESULTS,
  PAGE_LIMIT,
} from '../shared/constants';

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

export const
  listMessages = (pageToken, pages, fetchedEmail, finishFetch) => new Promise((resolve, reject) => {
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
        const promises = messages.map((msg, index) => new Promise((finish) => {
          setTimeout(() => {
            window.gapi.client.gmail.users.messages.get({
              userId: 'me',
              id: msg.id,
            }).then((res) => {
              fetchedEmail(res.result);
              if ((!nextPageToken || pagesFetched >= PAGE_LIMIT)) {
                finish();
              }
            }, (error) => {
              reject(error);
            });
            if (nextPageToken && pagesFetched < PAGE_LIMIT) {
              finish();
            }
          }, (index + 1) * MILLIS_PER_EMAIL);
        }));

        Promise.all(promises).then(() => {
          if (nextPageToken && pagesFetched < PAGE_LIMIT) {
            listMessages(nextPageToken, pagesFetched, fetchedEmail, finishFetch);
          } else {
            finishFetch();
          }
        });
      }
    }, (error) => {
      reject(error);
    });
  });
