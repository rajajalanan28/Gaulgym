const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase.from('expenses').select('id').limit(1);
  if (error) {
    console.log('Error checking expenses:', error.message);
  } else {
    console.log('Expenses table exists!');
  }
  
  const { data: shiftsData, error: shiftsError } = await supabase.from('shifts').select('id').limit(1);
  if (shiftsError) {
    console.log('Error checking shifts:', shiftsError.message);
  } else {
    console.log('Shifts table exists!');
  }
}

check();
