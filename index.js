require("dotenv").config();
const express = require("express");
const compression = require('compression');
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");
const bodyParser = require('body-parser');
const axios = require('axios');

const gameName = "hitmesuperm";
const webURL = "https://hitme.fun";

const server = express();
server.use(compression());
server.use(bodyParser.urlencoded({ extended: true }));
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const port = process.env.PORT || 5000;

//const SCORE_TOKEN = process.env.SCORE_TOKEN.split(";").map((t) => BigInt(t));

const queries = {};

bot.onText(/\/help/, (msg) =>
  bot.sendMessage(
    msg.from.id,
    "This bot implements a simple game. Say /game if you want to play."
  )
);
bot.onText(/\/start|\/game/, (msg) => {
  bot.sendGame(msg.from.id, gameName) // Replace 'spacerunner' with your game's short name
          .then(() => console.log('Game sent!'))
          .catch((err) => console.error('Error sending game:', err));
});
bot.on("callback_query", function (query) {
  //console.log(query);
  if (query.game_short_name !== gameName) {
    bot.answerCallbackQuery(
      query.id,
      "Sorry, '" + query.game_short_name + "' is not available."
    );
  } else {
    queries[query.id] = query;
    const gameurl =`${webURL}?chat_id=` + query.from.id;
    console.log("game sent to : " + gameurl);
    bot.answerCallbackQuery(query.id, { url: gameurl });
  }
});
bot.on("inline_query", function (iq) {
  bot.answerInlineQuery(iq.id, [
    { type: "game", id: "0", game_short_name: gameName },
  ]);
});

server.use(express.static(path.join(__dirname, "public"), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.br')) {
        res.setHeader('Content-Encoding', 'br');
        res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

server.get('/', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

server.post('/scores', async (req, res) => {
  console.log("gettting scores");
  // req.query.id
  const { playerId, score } = req.body;

  if (!playerId || !score) {
      return res.status(400).send('Missing playerName or score');
  }

  // Send score to Telegram
  var message = `You Scored ${score} points.\n`;


  if(score >= 20) {
    message += "Congrats! You Have Won a Special \n";
    var persent = 50;
    var pincode = " KSO12A ";
    var addMsg = "You Earned Additional Prize too! \n";
    if(score >= 25 && score < 30) {
      persent = 100; pincode = " GSDK4G ";
    }else if(score >= 30 && score < 35) {
      persent = 150; pincode = " AGSN67 ";
    }else if(score >= 35 && score < 40) {
      persent = 200; pincode = " LABCK2 ";
    }else if(score >= 40 && score < 50) {
      persent = 250; pincode = " UQAKD6 ";
    }else if(score >= 50) {
      persent = 300; pincode = " UOAMD7 ";
    }

    message += `${persent}% Bonus \n`;
    message += `Signup Now and Claim Your Bonus at <a href="https://hitme.bet/?faff=408">Hitme</a> \n`;
    message += `Use Bonus Code ${pincode} to Receive Your Reward! \n`;
    
    if(score >= 21 && score < 25) {
      message += addMsg;
      message += "20 Free Spins Reward : YDSLKU";
    }else if(score >= 31 && score < 35){
      message += addMsg;
      message += "30 Free Spins Reward : QZNSK4";
    }else if(score >= 41 && score < 50){
      message += addMsg;
      message += "40 Free Spins Reward : 63DKLU";
    }

  }


 
  
  const telegramUrl = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
  //console.log(telegramUrl);

  try {
      await axios.post(telegramUrl, {
          chat_id: playerId,
          text: message,
          parse_mode: 'HTML',
      });

      console.log('Score sent to Telegram!');
      res.status(200).send('Score received and sent to Telegram!');
  } catch (error) {
      console.error('Failed to send score to Telegram:', error.message);
      res.status(500).send('Failed to send score to Telegram');
  }
});


server.listen(port);
