![Inbox Zero header image](https://i.imgur.com/r2O8l3T.png "Inbox Zero header image")

# About

I found myself constantly asking a simple question: "Who sends me the most email?"

Google searches to see if there is any tool to help me answer this question turned up the same answers:

- No. (oof)
- Download all your emails and put it into a data analysis tool like BigQuery or GYB. (yikes)

None of these options seemed good, so I've open sourced this tool to let you see who sends you the most emails and quickly filter/delete those senders.

# Setup

### Clone the git repo:
```git clone https://github.com/gsajith/inbox-zero.git```

### Get your own Gmail client ID and API key:
- Easiest way to do this is through the [Gmail Quickstart tutorial](https://developers.google.com/gmail/api/quickstart/js) which will create a Google Cloud Platform project for you with the Gmail API enabled, and give you both your client ID and API key.
- Alternatively, you can create a new project and enable the Gmail API yourself via the [Google Cloud Platform dashboard](https://console.cloud.google.com/home/dashboard).
- Don't share these keys publicly.

### Create `.env` to add your own keys:
Copy `.env.example` into a new file called `.env` and put your client ID and API key into the placeholder fields labeled "`xxxxxxxxxxx`".

### Run the app:
`cd inbox-zero` (or whatever else you called the directory you cloned into)
`npm install`
`npm start`

### Navigate to https://localhost:3000 to see the app running locally!

### Authorize your app with the Gmail account you want to scan:
- Click the "Authorize" button
- Navigate past the "This app isn't verified" screen, if shown, by clicking "Advanced" and "Go to app name"
- Grant the required permissions to read your email

### Fetch your emails:
- Click the "Fetch emails" button
- Wait for your emails to be scanned. This can take a few seconds to a few minutes depending on how many emails you're scanning.

![Inbox Zero app screenshot](https://i.imgur.com/jZwCnEp.png)

And… voila! Your results should show up once they've all been fetched, along with links to filter your most pesky email senders and/or unsubscribe and delete their emails.


# Don't want to go through the process of cloning and running your own version of the app?

Send me a tweet [@GuamHat](https://twitter.com/GuamHat) and we can talk about whitelisting you to use my version that's running at [https://inbox-zero-app.appspot.com/](https://inbox-zero-app.appspot.com/)!
