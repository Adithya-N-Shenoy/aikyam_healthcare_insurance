// test-supabase.js
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testSupabase() {
  console.log('=' .repeat(60));
  console.log('🔍 TESTING SUPABASE CONNECTION');
  console.log('=' .repeat(60));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key:', supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'Not set');

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.log('\nPlease add these to your .env.local:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection by trying to list buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('❌ Connection failed:', error.message);
      
      if (error.message.includes('Invalid API key')) {
        console.log('\n🔑 Your API key is invalid. Please check:');
        console.log('1. Go to Supabase Dashboard → Project Settings → API');
        console.log('2. Copy the correct anon/public key');
      }
    } else {
      console.log('✅ Successfully connected to Supabase!');
      console.log('Available buckets:', buckets.map(b => b.name).join(', '));
      
      // Check if required buckets exist
      const requiredBuckets = ['medical-bills', 'room-photos'];
      const missingBuckets = requiredBuckets.filter(
        b => !buckets.some(bucket => bucket.name === b)
      );
      
      if (missingBuckets.length > 0) {
        console.log('\n⚠️ Missing required buckets:', missingBuckets.join(', '));
        console.log('Please create these buckets in your Supabase dashboard:');
        console.log('1. Go to Storage → Create bucket');
        console.log('2. Create "medical-bills" bucket (public)');
        console.log('3. Create "room-photos" bucket (public)');
      } else {
        console.log('✅ All required buckets exist!');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSupabase();