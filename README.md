Title: I sorted through 25,000 emails in under an hour, and you can too!
My road to inbox-zero.

# About

I found myself constantly asking a simple question: "Who sends me the most email?"

Years of unhealthy email habits had led to a stack of 35,000+ unread emails and a (~aversion thing~) to ever glancing at my personal emails. Sorry recruiters, friends, and @Meetup reminders! I was scared to even look at your email.

(this is fine dog)
Me, looking at my growing unread email counter.

Google searches to see if there is any tool to help me answer this question turned up the same answers:

- No. (oof)
- Download all your emails and put it into an data analysis tool like (!BigQuery) or (!GYB). (yikes)
- (!EmailAnalytics) free trail only analyses 30 days of data. Their paid version only analyses 12 months of data. I've been avoiding my emails for much longer than 12 months.

And then I realized: Hey, I can code! And, Gmail has a pretty generous API! It should be pretty easy to pull all my own data and just print out who sends me the most emails!

TODO: Disable EmailAnalytics data gathering

And so I did, and I've open sourced this tool so you can see your data too!

# Setup

This setup assumes you have some experience with running command-line tools, and that you have Git and Python 2.7 set up already on your machine.

Don't know what any of that is, or you're too lazy to run this tool yourself? Scroll on down to the "I'm so lazy" section! Otherwise, read on.

Clone the git repo:
```clone command```

Get your own Gmail API client key and api secret: 
 - Easiest way to do this is through the Gmail Quickstart tutorial (!link) which will create a Google Cloud Platform project for you with the Gmail API enabled, and give you both your client key and API secret.
 - Keep these protected! Sharing these keys with others is very unsafe.

Open up (index.html or script.js) and put your client key and api secret into the placeholder values labeled <CLIENT_KEY> and <API_SECRET>.

Run the app:

```
python -m SimpleHTTPServer 8000
```

Navigate to http://localhost:8000 to see the app running locally! Click the "fetch my emails" button to scan through all your emails. This can take a few seconds to a few minutes depending on how many emails you're scanning.

And... voila! Your results should show up soon, along with links to filter your most pesky email senders and/or unsubscribe and delete their emails.


# I'm so lazy

Don't want to go through the process of copying and running your own version of the app? Send me a tweet @GuamHat and I can think about whitelisting you to use my version that's running at inboxzero.appspot.com!
