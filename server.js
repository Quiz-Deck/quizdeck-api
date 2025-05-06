const express = require("express");
const multer = require("multer");
const fs = require("fs");
const pdf = require("pdf-parse");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const appstorage = require("./utils/nodepersist");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

let mongoose = require("mongoose"); // for working w/ our database
let config = require("./config");

mongoose.Promise = global.Promise;
mongoose.connect(config.database);

if (!appstorage.get("blacklist")) {
  //for setting the stage for storing expired tokens.
  appstorage.set("blacklist", []);
}

const userRoutes = require("./routes/UserRoutes");
const deckRoutes = require("./routes/DeckRoutes");
const questionRoutes = require("./routes/QuestionRoutes");
const categoryRoutes = require("./routes/CategoryRoutes");

// Configure multer to handle file uploads
const upload = multer({ dest: "uploads/" }); // Files will be saved in the 'uploads/' directory

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/xml",
};

async function run(filePath, filename, mimeType) {
  const extractTextFromPDF = async (filePath) => {
    const pdfBuffer = fs.readFileSync(filePath); // Read the PDF as a buffer
    const data = await pdf(pdfBuffer); // Extract text from the PDF
    return data.text; // Returns the text content of the PDF
  };

  const pdfText = await extractTextFromPDF(filePath);

  try {
    const prompt = `Summarize the following PDF content in xml format: `;
    const result = await model.generateContent(
      [prompt, pdfText],
      generationConfig
    );
    console.log("result.response.text()", result.response.text());
    return result.response.text();
  } catch (error) {
    console.error("Error in model.generateContent:", error);
  }
}

// configure our app to handle CORS requests
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "x-access-token,X-Requested-With,Content-Type,Authorization"
  );
  res.setHeader("X-Powered-By", "Lucky Lucciano");
  next();
});

app.use(function (req, res, next) {
  next();
});

app.use("/", userRoutes);
app.use("/deck", deckRoutes);
app.use("/question", questionRoutes);
app.use("/category", categoryRoutes);

app.post("/gemini", upload.single("pdf"), async (req, res) => {
  try {
    const file = req.file; // Access the uploaded file from multer

    if (!file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    if (file.mimetype !== "application/pdf") {
      // Delete the uploaded file if it's not a PDF
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: "Only PDF files are allowed." });
    }

    // Upload file to Gemini
    try {
      const geminiFile = await run(file.path, file.originalname, file.mimetype);
      res.status(200).json({
        message: "File uploaded successfully.",
        geminiFile,
      });
    } catch (error) {
      console.error("Error in model.generateContent:", error);
      res.status(500).json({ message: "Error in model.generateContent" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error with post" });
  }
});

app.use(function (req, res) {
  return res
    .status(404)
    .send({ message: "The url you visited does not exist" });
});

app.listen(config.port, () => {
  console.log(`Example app listening at http://localhost:${config.port}`);
});
