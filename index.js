require("dotenv").config();
const express = require("express");
const compression = require('compression');
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");
const bodyParser = require('body-parser');
const axios = require('axios');

const gameName = "mario_endless";
const webURL = "https://mario-bot-test.onrender.com";

const server = express();
server.use(compression());
server.use(bodyParser.urlencoded({ extended: true }));
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const port = process.env.PORT || 5000;

const SCORE_TOKEN = process.env.SCORE_TOKEN.split(";").map((t) => BigInt(t));

const queries = {};

function addAllNumbers(number) {
  const strNumber = number.toString();

  if (strNumber.length === 1) return number;

  const numbers = strNumber.split("");
  var sum = 0;
  for (var i = 0; i < numbers.length; i++) {
    sum += parseInt(numbers[i], 10);
  }
  return addAllNumbers(sum);
}

bot.onText(/\/help/, (msg) =>
  bot.sendMessage(
    msg.from.id,
    "This bot implements a simple game. Say /game if you want to play."
  )
);
// bot.onText(/\/start|\/game/, (msg) => bot.sendGame(msg.from.id, gameName));
bot.onText(/\/start|\/game/, (msg) => {
  bot.sendGame(msg.from.id, gameName) // Replace 'spacerunner' with your game's short name
          .then(() => console.log('Game sent!'))
          .catch((err) => console.error('Error sending game:', err));
    // if (msg.text === '/start') {
    //   bot.sendGame(chatId, gameName) // Replace 'spacerunner' with your game's short name
    //       .then(() => console.log('Game sent!'))
    //       .catch((err) => console.error('Error sending game:', err));
    // }
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
    const gameurl = 'https://mario-bot-test.onrender.com';
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

app.post('/scores', async (req, res) => {
  console.log("gettting scores");
  console.log(req.query);
  // req.query.id
  const { playerId, score } = req.body;

  if (!playerName || !score) {
      return res.status(400).send('Missing playerName or score');
  }

  // Send score to Telegram
  const message = `Player: ${playerName}\nScore: ${score}`;
  const telegramUrl = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
  console.log(telegramUrl);

  try {
      await axios.post(telegramUrl, {
          chat_id: playerId,
          text: message,
      });

      console.log('Score sent to Telegram!');
      res.status(200).send('Score received and sent to Telegram!');
  } catch (error) {
      console.error('Failed to send score to Telegram:', error.message);
      res.status(500).send('Failed to send score to Telegram');
  }
});

// server.get("/highscore/:score", function (req, res, next) {
//   console.log("We are getting high score::");
//   console.log(req.query);
//   if (!Object.hasOwnProperty.call(queries, req.query.id)) return next();

//   const token = SCORE_TOKEN[addAllNumbers(BigInt(req.query.id)) - 1];

//   let query = queries[req.query.id];

//   let options;
//   if (query.message) {
//     options = {
//       chat_id: query.message.chat.id,
//       message_id: query.message.message_id,
//     };
//   } else {
//     options = {
//       inline_message_id: query.inline_message_id,
//     };
//   }

//   // ===== Obfuscation decoding starts =====
//   // Change this part if you want to use your own obfuscation method
//   const obfuscatedScore = BigInt(req.params.score);

//   const realScore = Math.round(Number(obfuscatedScore / token));

//   // If the score is valid
//   if (BigInt(realScore) * token == obfuscatedScore) {
//     // ===== Obfuscation decoding ends =====
//     bot
//       .setGameScore(query.from.id, realScore, options)
//       .then((b) => {
//         return res.status(200).send("Score added successfully");
//       })
//       .catch((err) => {
//         if (
//           err.response.body.description ===
//           "Bad Request: BOT_SCORE_NOT_MODIFIED"
//         ) {
//           return res
//             .status(204)
//             .send("New score is inferior to user's previous one");
//         } else {
//           return res.status(500);
//         }
//       });
//     return;
//   } else {
//     return res.status(400).send("Are you cheating ?");
//   }
// });

server.listen(port);
