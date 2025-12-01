const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// GEMINI CONFIGURATION - ADD YOUR API KEY HERE
// ============================================
const GEMINI_API_KEY = 'AIzaSyAjrQXOe1LcXZpR-7y472ccCRXjireDKWY'; // 👈 PUT YOUR API KEY HERE
const MODEL_NAME = 'gemini-1.5-flash'; // or 'gemini-1.5-flash', 'gemini-1.5-pro'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'No message provided' });
    }
    
    // Build the prompt with context
    let prompt = '';
    if (context && context.trim()) {
      prompt = `You are participating in a WhatsApp conversation. Here's the conversation history:

${context}

Now respond to this message naturally and conversationally: ${message}

Keep your response casual and chat-like, as if you're texting a friend.`;
    } else {
      prompt = `Respond to this WhatsApp message naturally and conversationally: ${message}`;
    }
    
    // Generate response
    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();
    
    res.json({ 
      response: aiResponse,
      provider: 'gemini',
      model: MODEL_NAME,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
    
    // Detailed error handling
    if (error.message.includes('API_KEY_INVALID')) {
      return res.status(401).json({ 
        error: 'Invalid API Key',
        details: 'Please check your Gemini API key in ai_api.js'
      });
    }
    
    if (error.message.includes('RATE_LIMIT')) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        details: 'Too many requests. Please wait a moment.'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'ai-chat-api',
    provider: 'Google Gemini',
    model: MODEL_NAME,
    timestamp: new Date().toISOString()
  });
});

// Test endpoint to verify API key
app.get('/test', async (req, res) => {
  try {
    const result = await model.generateContent('Say "API is working!" in one sentence.');
    res.json({ 
      success: true, 
      response: result.response.text(),
      message: '✅ Gemini API is configured correctly!'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: '❌ Gemini API configuration failed. Check your API key.'
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log('\n🤖 ================================');
  console.log('   WhatsApp Chat Mimic - AI API');
  console.log('   ================================');
  console.log(`   🌐 Server: http://localhost:${PORT}`);
  console.log(`   🧠 Provider: Google Gemini`);
  console.log(`   📦 Model: ${MODEL_NAME}`);
  console.log('   ================================\n');
  console.log('   Test the API: http://localhost:3000/test');
  console.log('   Health check: http://localhost:3000/health\n');
});