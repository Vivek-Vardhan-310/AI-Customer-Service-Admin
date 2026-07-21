import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function main() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not found in env');
    return;
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  const data: any = await response.json();
  const definitions = data.definitions;
  if (definitions && definitions.user_products) {
    console.log('user_products columns:', Object.keys(definitions.user_products.properties));
    console.log('user_products properties:', JSON.stringify(definitions.user_products.properties, null, 2));
  } else {
    console.log('user_products not found in OpenAPI schema');
    console.log('Available definitions:', Object.keys(definitions || {}));
  }
}

main().catch(console.error);
