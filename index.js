require("dotenv").config();
const { TwitterApi } = require("twitter-api-v2");
const cron = require("node-cron");

// Use dynamic import for node-fetch
let fetch;

async function loadFetch() {
  if (!fetch) {
    const module = await import("node-fetch");
    fetch = module.default;
  }
}

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_KEY_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// Function to fetch a quote from the external API
async function fetchQuote() {
  try {
    await loadFetch(); // Ensure fetch is loaded
    const response = await fetch("https://api.api-ninjas.com/v1/quotes", {
      headers: {
        "X-Api-Key": process.env.API_NINJAS_KEY,
      },
    });

    const data = await response.json();
    if (data.length > 0) {
      return `${data[0].quote} - ${data[0].author}`;
    } else {
      throw new Error("No quotes found");
    }
  } catch (error) {
    console.error("Failed to fetch quote:", error);
    return null;
  }
}

// Function to post a tweet
async function postTweet(message) {
  try {
    const response = await client.v2.tweet(message);
    console.log(`Tweet posted: ${message}`);
  } catch (error) {
    console.error("Failed to post tweet:", error);
  }
}

// Schedule the tweet to be posted every day at 9 AM
cron.schedule("* * * * *", async () => {
  const quote = await fetchQuote();
  if (quote) {
    await postTweet(quote);
  }
});

console.log("Twitter bot started...");
