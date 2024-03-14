// Node js code
const express = require("express");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const cors = require("cors");
const app = express();
app.use(cors());
const port = process.env.PORT || 3000;
const filePath1 = path.join(process.cwd(), "output.mp3");
const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

const chatWithGPT = async (prompt) => {
  try {
    const response = await openai.chat.completions.create({
      // model: "gpt-3.5-turbo",
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      
    });
      // Split the response into sentences and take the first two sentences
    // const message = response.choices[0].message.content;
    // return message;
    const message = response.choices[0].message.content.split(".");
    const truncatedResponse = message.slice(0, 2).join(".");
  
    return truncatedResponse;
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
};

async function generateAudioFile(response) {
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: response,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    const filePath = "output.mp3";
    await fs.writeFile(filePath, buffer);
    return filePath;
  } catch (error) {
    console.error("Error generating audio file:", error);
    throw error;
  }
}

app.use(bodyParser.json());
app.use(express.json());
// chat text-to-text
app.post("/chat", async (req, res) => {
  const userInput = req.body.userInput;

  if (
    userInput.toLowerCase() === "bye" ||
    userInput.toLowerCase() === "exit" ||
    userInput.toLowerCase() === "quit"
  ) {
    res.json({ response: "Goodbye!" });
    return;
  }

  const inputText =
    `I want you to act like Kavin hart from the Jumanji you are selling Gran Coramino Cristalino tequila to everyone. I want you to respond and answer be the kavin hart himself. Do not write any explanations and only answer like the character would. You must know all of the knowledge of the kavin hart and your answer should be in only 2 small sentences not more then 2 sentences and dont tell me shhh you are a bot. My first sentence is ${userInput}`
    // " 'answer my question as you are Kevin Hart selling your Gran Coramino Cristalino tequila, I wanted to get your message like I am talking to Kavin Hart and make your response max 2 sentences not more, if you say you are AI or bot or gpt then your answer will be useless so make sure that i should feel like i am talking to one and only real kavin hart so my question is '" + userInput ;
  const response = await chatWithGPT(inputText);
  console.log("response---->", response);
  res.json({ response: response });
});

// chat text-to-speech
app.post("/speech", async (req, res) => {
  const userInput = req.body.userInput;
  async function main() {
    const inputText =        
    " 'answer as you are Kevin Hart selling your Gran Coramino Cristalino tequila, I wanted to get your message like I am talking to Kavin Hart and make your response max 2 sentences not more, if you say you are AI or bot or gpt then your answer will be useless so make sure that i should feel like i am talking to one and only real kavin hart so my question is '" + userInput ;
    const response = await chatWithGPT(inputText);
    console.log("Myresponse---->", response);

    // Audio Generator
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: response,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    const filePath = "output.mp3";
    await fs.promises.writeFile(filePath, buffer);
    // Send the file as a response
  }
  main();
  setTimeout(() => {
    res.sendFile(
      filePath1,
      { headers: { "Content-Type": "audio/mp3" } },
      (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).send("Internal Server Error");
        } else {
          console.log("File sent successfully", filePath1);
          // Optionally, you can delete the file after sending it
          fs.promises.unlink(filePath1);
        }
      }
    );
  }, 12000);
});

app.get("/", (req, res) => {
  res.status(200).json("Welcome, your app is working well");
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
