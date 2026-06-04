import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key'
);

const PLACEHOLDER_PRODUCTS = [
  { name: 'Air Mineral 600ml', price: 5000, stock: 50 },
  { name: 'Pocari Sweat 500ml', price: 10000, stock: 30 },
  { name: 'Susu Protein Shake', price: 25000, stock: 20 },
  { name: 'Energy Bar', price: 15000, stock: 25 },
  { name: 'BCAA Drink', price: 20000, stock: 15 },
  { name: 'Handuk Kecil', price: 35000, stock: 10 },
  { name: 'Sarung Tangan Gym', price: 50000, stock: 8 },
  { name: 'Kaos Gaul Gym', price: 120000, stock: 5 },
];

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'Owner') {
      return NextResponse.json({ error: 'Forbidden: Owner only' }, { status: 403 });
    }

    const { gymId } = await request.json();

    if (!gymId) {
      return NextResponse.json(
        { error: 'gymId is required' },
        { status: 400 }
      );
    }

    // H-17: Validate that the requesting owner actually owns the target gym
    const { data: ownedGym } = await supabaseAdmin
      .from('gyms')
      .select('id')
      .eq('id', gymId)
      .eq('owner_id', user.id)
      .single();

    if (!ownedGym) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this gym' },
        { status: 403 }
      );
    }

    // Check if the gym already has products
    const { data: existingProducts, error: checkError } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('gym_id', gymId)
      .limit(1);

    if (checkError) {
      return NextResponse.json(
        { error: checkError.message },
        { status: 500 }
      );
    }

    if (existingProducts && existingProducts.length > 0) {
      return NextResponse.json({ message: 'Products already exist' });
    }

    // Insert placeholder products
    const productsToInsert = PLACEHOLDER_PRODUCTS.map((product) => ({
      gym_id: gymId,
      name: product.name,
      price: product.price,
      stock: product.stock,
      image_url: null,
      is_active: true,
    }));

    const { data, error: insertError } = await supabaseAdmin
      .from('products')
      .insert(productsToInsert)
      .select();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Products seeded successfully',
      count: data.length,
      products: data,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
