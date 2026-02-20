
const { createClient } = require('@supabase/supabase-js');

// Updated with CORRECT URL
const supabaseUrl = 'https://odcsntscfreytcosxiof.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kY3NudHNvY2ZyZXl0Y29zeGlvZiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM4MjEwMjI0LCJleHAiOjIwNTM3ODYyMjR9.YGHS8G5_2gUvyXr9tJ3Q3bPCDlLB_6rGG67v6MKQuPM';

console.log('Testing connection to:', supabaseUrl);

async function testNetwork() {
    try {
        console.log('1. Testing Supabase Health Endpoint...');
        const healthUrl = `${supabaseUrl}/auth/v1/health`;
        console.log(`   Fetching ${healthUrl}...`);

        const response = await fetch(healthUrl);
        console.log(`   Response Status: ${response.status}`);

        if (response.ok) {
            console.log('   ✅ Supabase Project is REACHABLE!');
            console.log('   🎉 THE TYPO WAS THE ISSUE!');
        } else {
            console.log('   ⚠️ Supabase Project responded with error:', response.status);
        }

    } catch (err) {
        console.error('   ❌ Supabase Network Error:', err.message);
        if (err.cause) console.error('   Cause:', err.cause);
    }
}

testNetwork();
