const TelegramBot = require('node-telegram-bot-api');

let bot = null;

const getBot = () => {
  if (!bot && process.env.TELEGRAM_BOT_TOKEN) {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
  }
  return bot;
};

const sendPredictionNotification = async (prediction) => {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId || !process.env.TELEGRAM_BOT_TOKEN) {
    console.log('Telegram not configured, skipping notification');
    return;
  }

  const telegramBot = getBot();
  if (!telegramBot) return;

  const submittedDate = new Date(prediction.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const message = `
⚽ *NEW PREDICTION*

🆔 Prediction ID: \`${prediction.predictionId}\`
👤 Name: ${prediction.name}
📱 Phone: ${prediction.phone}
🏆 Winner: *${prediction.predictedWinner}*
📊 Prediction: *${prediction.yourGoals} - ${prediction.opponentGoals}*
🩸 Blood Donor: ${prediction.isBloodDonor ? 'Yes ✅' : 'No'}
${prediction.isBloodDonor ? `💉 Blood Group: *${prediction.bloodGroup}*` : ''}
📅 Submitted: ${submittedDate}
  `.trim();

  try {
    await telegramBot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('Telegram notification failed:', err.message);
  }
};

const sendResultNotification = async (result) => {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId || !process.env.TELEGRAM_BOT_TOKEN) return;

  const telegramBot = getBot();
  if (!telegramBot) return;

  const message = `
🏆 *OFFICIAL RESULT SAVED*

Winner: *${result.winner}*
Score: *${result.winnerGoals} - ${result.opponentGoals}*
  `.trim();

  try {
    await telegramBot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('Telegram result notification failed:', err.message);
  }
};

module.exports = { sendPredictionNotification, sendResultNotification };
