// test-gemini-fixed.js
const GEMINI_API_KEY = 'AIzaSyAir11-ifoX0dTKSBbK5iUrlR4yxm82zss';
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  console.log('=' .repeat(60));
  console.log('🔍 TESTING GEMINI API AFTER FIX');
  console.log('=' .repeat(60));
  
  console.log('✅ Using API key:', GEMINI_API_KEY.substring(0, 10) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Try the latest stable model
    console.log('\n📤 Testing gemini-1.5-flash...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent('Say "Gemini API is working now!" in 5 words');
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ SUCCESS! ✅');
    console.log('📥 Response:', text);
    console.log('\n✨ Your Gemini API is now properly configured!');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    if (error.message.includes('billing')) {
      console.log('\n💰 Billing issue detected:');
      console.log('1. Go to: https://console.cloud.google.com/billing');
      console.log('2. Make sure billing is enabled for your project');
      console.log('3. Even free tier requires billing setup');
    } else if (error.message.includes('not found')) {
      console.log('\n🔧 API not enabled:');
      console.log('1. Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
      console.log('2. Click "ENABLE" button');
      console.log('3. Wait 2 minutes and try again');
    } else if (error.message.includes('permission')) {
      console.log('\n🔑 Permission issue:');
      console.log('1. Go to: https://console.cloud.google.com/iam-admin/iam');
      console.log('2. Make sure your account has necessary permissions');
    }
  }
}

testGemini();