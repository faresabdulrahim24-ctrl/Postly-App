const SUPABASE_URL = 'https://kxfffaezxlvfbhgampkg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_1_MRbzEkKR_2XadF5xl-Gg_LtuWrSZX';

async function test() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.0c43b251-36aa-4f7e-a4c9-ff7fe1b17b5c`, {
        method: 'PATCH',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: 'test@test.com' })
    });
    const data = await res.json();
    console.log(data);
}
test();
