// testModels.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listAllModels() {
  try {
    // Directly use your API key here
    const genAI = new GoogleGenerativeAI("AIzaSyAjlVX4P0ceWHQy24sb8OlKtsuEifXn5Ao");
    const result = await genAI.listModels();

    console.log("✅ Available Gemini Models:");
    result.models.forEach((m) => {
      console.log(`- ${m.name} | Input: ${m.input_token_limit} | Output: ${m.output_token_limit}`);
    });
  } catch (err) {
    console.error("❌ Error fetching models:", err);
  }
}

async function testModel(modelName) {
  try {
    const genAI = new GoogleGenerativeAI("AIzaSyAjlVX4P0ceWHQy24sb8OlKtsuEifXn5Ao");
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent("Say hello from " + modelName);
    const text = (await result.response).text();
    console.log(`✅ Model "${modelName}" works! Response:`);
    console.log(text);
  } catch (err) {
    console.error(`❌ Error with model "${modelName}":`, err.message);
  }
}

listAllModels();
testModel("gemini-pro");
