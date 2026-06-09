require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixOwner() {
  const email = 'muhammadimamabdurrahman93@gmail.com';
  
  console.log(`Looking for user with email: ${email}`);
  
  // 1. Get user by email
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email);
    
  if (userError) {
    console.error('Error finding user:', userError);
    return;
  }
  
  if (!users || users.length === 0) {
    console.log('User not found.');
    return;
  }
  
  const user = users[0];
  console.log(`Found user ID: ${user.id}, current role: ${user.role}`);
  
  // 2. Update role to Owner
  const { error: updateError } = await supabase
    .from('users')
    .update({ role: 'Owner' })
    .eq('id', user.id);
    
  if (updateError) {
    console.error('Error updating role:', updateError);
    return;
  }
  console.log('✅ Successfully updated user role to Owner!');
  
  // 3. Delete from members table so they don't show up in member management
  const { error: deleteMemberError } = await supabase
    .from('members')
    .delete()
    .eq('user_id', user.id);
    
  if (deleteMemberError) {
    console.error('Error deleting from members table:', deleteMemberError);
  } else {
    console.log('✅ Successfully removed user from members table!');
  }
}

fixOwner();
