import { supabaseServer } from '@/app/lib/supabase';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, name, password } = await req.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    if (!supabase) {
      console.error('Supabase not initialized - missing environment variables');
      return NextResponse.json(
        { error: 'Database connection failed. Please check SUPABASE_SERVICE_ROLE_KEY in .env.local' },
        { status: 500 }
      );
    }

    const existingUser = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser.data) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          name,
          password_hash: passwordHash,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      return NextResponse.json(
        { error: `Failed to create user: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'User created successfully', user: { id: data.id, email: data.email, name: data.name } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
