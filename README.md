# Unity Telegram Game - Backend

> For complete overview of the project, please visit the [Unity package GitHub repository](https://github.com/asynkr/unity-telegram-game).

This is a Node.js app that serves two purposes:
1. Run a Telegram bot
2. Serve a game (actually, an `index.html` file)

## Create a Telegram bot

## Installation

* Deploy a Node.js app. This documentation will not cover this part (this is because it is out of the scope of the project, not at all because I already forgot how I did it). However, here are some steps to deploy it on a VPS (something like [that](https://blog.tericcabrel.com/deploy-a-node-js-application-with-pm2-and-nginx/)) :
  * Install Node and yarn
  * Install pm2 and use it to start the Node app
  * Configure a nginx server (pay attention to how you're declaring the `public` folder in the config)
  * Pay attention to which ports are used and need to be opened: don't forget you have two services running, the express server and the telegram bot.
  * Add a SSL certificate

* Upload your WebGL game in the `public` folder
* Add a `.env` file with the following content:
  ```
  BOT_TOKEN=<your-telegram-bot-token>

## Change index.js
  * chainge webURL variable to your backend URL.
  * change gift code on the line 86 to 109

* You're good to go.
