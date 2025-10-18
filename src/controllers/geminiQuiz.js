// src/controllers/geminiQuiz.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * POST /api/quiz/generate
 * Generates 20 multilingual political knowledge questions
 */
const generateQuiz = async (req, res) => {
  try {
    const { language = "English" } = req.body;

    const prompt = `
You are a civic education AI assistant. Create exactly 5 questions in ${language} about
Sri Lankan political knowledge and leadership understanding.
Include a mix of:
- Multiple Choice Questions (MCQ)
- True/False
- Long Typing Questions

Topics:
1. Test understanding of key political issues
2. Decision Making
3. Evaluate leadership skills
4. Governance Insight
5. Understand public administration

Return a JSON array with the structure:
[
  {
    "id": 1,
    "type": "MCQ" | "TRUE_FALSE" | "TYPING",
    "question": "string",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."], // only for MCQ
    "correctAnswer": "string"
  }
]
No extra explanation text. Only valid JSON array.
`;

    const result = await model.generateContent(prompt);
    const text = (await result.response).text();

    // extract JSON safely
    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]");
    const quizData = JSON.parse(text.slice(jsonStart, jsonEnd + 1));

    res.status(200).json({
      success: true,
      language,
      totalQuestions: quizData.length,
      quiz: quizData,
    });
  } catch (err) {
    console.error("Error generating quiz:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/quiz/analyze
 * Analyze user's answers and return a score %
 */
const analyzeQuiz = async (req, res) => {
  try {
    const { userAnswers, language = "English" } = req.body;

    // Calculate how many questions were actually answered
    const answeredQuestions = userAnswers.filter(a => 
      a.userAnswer !== null && a.userAnswer !== ''
    ).length;

    try {
      // First try the AI-powered analysis
      const prompt = `
You are an expert political knowledge assessor. 
Analyze the following user answers (in ${language}) to a political quiz about Sri Lanka.
Each object contains: {question, correctAnswer, userAnswer}.

The user answered ${answeredQuestions} questions in total.

For multiple choice and true/false questions, check for exact matches.
For typing/long-form answers, evaluate based on key concepts, not exact wording.
Look for partial understanding even if the answer isn't perfectly correct.

Calculate a fair percentage score (0-100%) based on your evaluation.

Return JSON only in this format:
{
  "score": <number>,
  "feedback": "detailed feedback (2-3 sentences) on the user's political understanding"
}

User answers to analyze:
${JSON.stringify(userAnswers, null, 2)}
`;

      const result = await model.generateContent(prompt);
      const text = (await result.response).text();

      // Extract JSON response
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      const analysis = JSON.parse(text.slice(jsonStart, jsonEnd + 1));

      res.status(200).json({ 
        success: true, 
        score: analysis.score,
        feedback: analysis.feedback,
        aiAnalyzed: true
      });
    } catch (aiError) {
      console.error("Error with AI analysis:", aiError);
      console.log("Falling back to basic scoring method...");
      
      // FALLBACK: Calculate basic score based on exact matches for MCQ/True-False questions
      const calculatedScore = calculateBasicScore(userAnswers);
      
      res.status(200).json({
        success: true,
        score: calculatedScore.score,
        feedback: calculatedScore.feedback,
        aiAnalyzed: false,
        message: "AI analysis unavailable, using basic scoring"
      });
    }
  } catch (err) {
    console.error("Error analyzing quiz:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Calculate a basic score when AI is unavailable
 * @param {Array} userAnswers - Array of question/answer objects
 * @returns {Object} Score and feedback
 */
const calculateBasicScore = (userAnswers) => {
  // Count answered questions and correct answers
  let answeredCount = 0;
  let correctCount = 0;
  let mcqCorrect = 0;
  let mcqTotal = 0;
  
  userAnswers.forEach(answer => {
    if (answer.userAnswer !== null && answer.userAnswer !== '') {
      answeredCount++;
      
      // Check exact match - works well for MCQs and true/false
      const isTypeQuestion = answer.question.toLowerCase().includes('explain') || 
                            answer.question.toLowerCase().includes('describe') ||
                            answer.correctAnswer.length > 15;
      
      if (!isTypeQuestion) {
        mcqTotal++;
        if (answer.userAnswer.trim().toLowerCase() === answer.correctAnswer.trim().toLowerCase()) {
          correctCount++;
          mcqCorrect++;
        }
      }
    }
  });
  
  // Calculate percentage score
  const score = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const mcqAccuracy = mcqTotal > 0 ? Math.round((mcqCorrect / mcqTotal) * 100) : 0;
  
  // Generate appropriate feedback based on score
  let feedback = '';
  if (score >= 90) {
    feedback = "Outstanding political knowledge! You demonstrate excellent understanding of Sri Lankan politics and governance systems.";
  } else if (score >= 75) {
    feedback = "Strong political knowledge. You have a good grasp of Sri Lankan political concepts and current affairs.";
  } else if (score >= 60) {
    feedback = "Solid understanding of basic political concepts. Continue expanding your knowledge of Sri Lankan politics.";
  } else if (score >= 40) {
    feedback = "Developing political awareness. Consider learning more about Sri Lankan governance and political processes.";
  } else {
    feedback = "Foundational political knowledge. Focus on building basic understanding of Sri Lankan political structures and current affairs.";
  }
  
  return {
    score,
    feedback,
    mcqAccuracy
  };
};

module.exports = {
  generateQuiz,
  analyzeQuiz,
};
