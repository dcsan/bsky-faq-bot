# bsky-faq-bot
bluesky faq bot

## setup

`cp .env.example .env` and fill out the values.
don't forget you can get a risk free app password from inside the bluesky app.

```
BOT_HANDLE=example.bot.handle.com
BOT_PASSWORD=12345
```

## install
For development I use a linked version of the easy-bsky-bot-sdk

eg check it out from it's own repo one level up from this bot.
you'll find in the package.json

`"easy-bsky-bot-sdk": "file:../easy-bsky-bot-sdk"`

for production you probably want to replace it with a published version:

npm install --save easy-bsky-bot-sdk

