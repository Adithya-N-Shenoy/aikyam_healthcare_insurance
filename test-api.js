// test-api.js
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  console.log('=' .repeat(50));
  console.log('🔍 GEMINI API TEST with .env.local');
  console.log('=' .repeat(50));
  
  // Try to get API key from environment
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBrAxXGKK1WvFLylD9QO6ExBQoyXTh_4N4';
  
  console.log('✅ Using API key:', apiKey.substring(0, 10) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Test with gemini-1.5-flash
    console.log('\n📤 Testing gemini-1.5-flash model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    console.log('📤 Sending test prompt...');
    const result = await model.generateContent('Say "Hello from Aikyam!" in 3 words');
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ SUCCESS!');
    console.log('📥 Response:', text);
    console.log('\n✨ Your Gemini API is working perfectly!');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n🔑 API key issue. Your key might be invalid or expired.');
    } else if (error.message.includes('model')) {
      console.log('\n🤖 Model issue. Trying with gemini-pro...');
      
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const altModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const altResult = await altModel.generateContent('Say hello');
        console.log('✅ gemini-pro works! Use this model instead.');
      } catch (altError) {
        console.error('❌ Alternative also failed:', altError.message);
      }
    }
  }
}

// Install dotenv if needed
try {
  require.resolve('dotenv');
} catch (e) {
  console.log('📦 Installing dotenv...');
  require('child_process').execSync('npm install dotenv', { stdio: 'inherit' });
}

testGemini();