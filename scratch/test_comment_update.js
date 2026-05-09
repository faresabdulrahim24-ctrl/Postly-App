const axios = require('axios');

const SUPABASE_URL = 'https://kxfffaezxlvfbhgampkg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_1_MRbzEkKR_2XadF5xl-Gg_LtuWrSZX';

async function testUpdate() {
    try {
        // First get a comment to test
        const res = await axios.get(`${SUPABASE_URL}/rest/v1/comments?select=id,author_id,body&limit=1`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        const comment = res.data[0];
        console.log("Testing with comment:", comment);

        if (!comment) {
            console.log("No comments found.");
            return;
        }

        // Try to update it using standard GET to see if RLS allows it (we don't have token, but let's just see)
        // Without auth token, we can't update. But I want to see if the user has RLS policies.
        const policyRes = await axios.get(`${SUPABASE_URL}/rest/v1/comments?select=id`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=representation'
            }
        });
        console.log("Comments readable:", policyRes.data.length > 0);
    } catch (e) {
        console.error("Error:", e.response ? e.response.data : e.message);
    }
}

testUpdate();
