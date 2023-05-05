# bsky-faq-bot
The bluesky faq bot

From TPOT to Skeet, you can ask the bot about bluesky crazy lore, acronymys, happenings, tools, tech stuff and more.

## How to use

This is a simple FAQ bot to reply to common questions.

Visit me at [@faqbot.bsky.social](https://staging.bsky.app/profile/faqbot.bsky.social)

[psky link](https://psky.app/profile/faqbot.bsky.social)

or by permanent DID address here:
https://staging.bsky.app/profile/did:plc:dy5c7snfz6vgniijd73a6d7z


`@faqbot.bsky.social <question>`

<image width='500' src='docs/faq-example.png' />

We use some keyword terms and also fuzzy matching to find the best answer.

## Questions Data

The content for the FAQs is currently stored in this google sheet.

[FAQ Database sheet](https://docs.google.com/spreadsheets/d/1RZ7ZDRXiZhu4fI65955gIAAuHNTf9__7ntHb2R65w3Q/edit#gid=0)

You can edit the data here. There's also a command to fetch the latest from here.

`ts-node src/cli.ts faqs-fetch`


## Setup

`cp .env.example .env` and fill out the values.

You can get an app password from inside the bluesky app to not expose your main login creds.

```
BOT_HANDLE=example.bot.handle.com
BOT_PASSWORD=12345
```

Using this awesome bot SDK from @tautologer

https://github.com/tautologer/easy-bsky-bot-sdk

For development I use a local linked version:

to do that you should check it out from it's own repo one level up from this bot's code. You'll find in the package.json a [local path](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#local-paths) to the SDK:

`"easy-bsky-bot-sdk": "file:../easy-bsky-bot-sdk"`

For production, depending on how you deploy, you probably want to replace it with a published version:

npm install --save easy-bsky-bot-sdk


## just file
There's a justfile with some other useful commands. Install [just](https://github.com/casey/just) to use these.

```
$ just
Available recipes:
    build
    clean        # remove build artifacts
    cls
    default      # list all recipes
    dev-prepare  # update bot module assuming path is ../easy-bsky-bot-sdk
    docker-build
    faqs-fetch   # fetch from google sheet
    faqs-show    # show for previewing
    prod-prepare # remove local bot module
    run
    show-invited
    start
    test
    test-sheet
```

## deployment
Trying out fly.io

you might have to edit the fly.toml file to change the app for your own account

`fly launch # first time`

then `fly deploy`

to update.


## TODO

[My list](./docs/todo.todo)

or feel free to [request a feature](https://github.com/dcsan/bsky-faq-bot/issues)