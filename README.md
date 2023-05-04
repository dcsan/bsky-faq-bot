# bsky-faq-bot
bluesky faq bot

This is a simple FAQ bot to reply to common questions.

Just mention the bot with `faq <topic>`

like this example:
- [web/staging](https://staging.bsky.app/profile/yafes.bsky.social/post/3juoniphefd2x)
- [psky](https://psky.app/profile/yafes.bsky.social/post/3juoniphefd2x)
- [bsky](https://bsky.app/profile/yafes.bsky.social/post/3juoniphefd2x)

<img src='docs/did-example.png' width='400'>


Currently we just search for the keyword matches in [src/store/faqData.ts](./src/store/faqData.ts)

In future we can add more fuzzy matching and NLP classifiers, as well as adding new topics by users.

## setup

`cp .env.example .env` and fill out the values.

You can get an app password from inside the bluesky app to not expose your main login creds.

```
BOT_HANDLE=example.bot.handle.com
BOT_PASSWORD=12345
```

## install

Using this awesome bot SDK from @tautologer

https://github.com/tautologer/easy-bsky-bot-sdk

For development I use a local linked version:

eg check it out from it's own repo one level up from this bot.
you'll find in the package.json

`"easy-bsky-bot-sdk": "file:../easy-bsky-bot-sdk"`

for production you probably want to replace it with a published version:

npm install --save easy-bsky-bot-sdk


## TODO
- fuzzy matching on questions
- search for best keyword hits in a question
- NLP classifier matching
- /learn command to add new questions and answers


