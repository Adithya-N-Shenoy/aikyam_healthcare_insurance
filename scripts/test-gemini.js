// test-quick.js
// Replace with your actual API key below
const GEMINI_API_KEY = 'AIzaSyBrAxXGKK1WvFLylD9QO6ExBQoyXTh_4N4'; // <-- PUT YOUR ACTUAL GEMINI API KEY HERE

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  console.log('=' .repeat(50));
  console.log('🔍 GEMINI API TEST');
  console.log('=' .repeat(50));
  
  // Check if API key is provided
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('your-key')) {
    console.error('❌ ERROR: Please add your Gemini API key to the file first!');
    console.log('\n📌 Steps to fix:');
    console.log('1. Get your API key from: https://makersuite.google.com/app/apikey');
    console.log('2. Open test-quick.js in your editor');
    console.log('3. Replace "AIzaSyB...your-key-here..." with your actual API key');
    console.log('4. Save the file and run this command again');
    return;
  }

  console.log('✅ API key found (first 5 chars):', GEMINI_API_KEY.substring(0, 5) + '...');
  
  try {
    // Initialize Gemini
    console.log('\n📤 Initializing Gemini...');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Try with gemini-1.5-flash model
    console.log('📤 Testing gemini-1.5-flash model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    console.log('📤 Sending test prompt...');
    const result = await model.generateContent('Say "Hello, Aikyam Healthcare Platform is working!" in exactly 5 words');
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ SUCCESS! Gemini API is working!');
    console.log('📥 Response:', text);
    console.log('\n✨ You can now use Gemini in your application!');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('API key')) {
      console.log('\n🔑 Your API key seems invalid. Please:');
      console.log('1. Go to https://makersuite.google.com/app/apikey');
      console.log('2. Create a new API key or check your existing one');
      console.log('3. Copy the new key and update test-quick.js');
    }
    else if (error.message.includes('quota') || error.message.includes('rate')) {
      console.log('\n💰 You have exceeded your API quota. Please:');
      console.log('1. Check your billing status at Google Cloud Console');
      console.log('2. Wait for quota to reset (usually hourly)');
      console.log('3. Consider upgrading your plan if needed');
    }
    else if (error.message.includes('model')) {
      console.log('\n🤖 Model access issue. Trying with gemini-pro...');
      
      // Try with alternative model
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const altModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const altResult = await altModel.generateContent('Say hello');
        console.log('✅ gemini-pro model works! Update your code to use gemini-pro');
      } catch (altError) {
        console.error('❌ Alternative model also failed:', altError.message);
      }
    }
    else if (error.message.includes('fetch') || error.message.includes('network')) {
      console.log('\n🌐 Network error. Please check:');
      console.log('1. Your internet connection');
      console.log('2. Firewall settings');
      console.log('3. Proxy settings (if any)');
    }
  }
  
  console.log('\n' + '=' .repeat(50));
}

// Run the test
testGemini();