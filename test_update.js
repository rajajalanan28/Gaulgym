const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if(key) acc[key.trim().replace('\r', '')] = val.join('=').trim().replace(/['"\r]/g, '');
  return acc;
}, {});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data: members, error } = await supabase.from('members').select('id, name').limit(1);
  if (error) {
    console.error('Fetch error:', error);
    return;
  }
  const { error: updateError } = await supabase
    .from('members')
    .update({ photo_url: 'https://example.com/test.jpg' })
    .eq('id', members[0].id);
  
  if (updateError) {
    console.error('Update error:', updateError);
  } else {
    console.log('Update success!');
  }
}
test();
