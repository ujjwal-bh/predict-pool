import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth-options';
import { supabaseServer } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { name, description, isPublic, maxMembers } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Pool name is required' },
        { status: 400 }
      );
    }

    const joinCode = isPublic ? null : crypto.randomBytes(5).toString('hex').toUpperCase();

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('pools')
      .insert([
        {
          name,
          description,
          is_public: isPublic,
          join_code: joinCode,
          creator_id: session.user.id,
          max_members: maxMembers,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create pool' },
        { status: 500 }
      );
    }

    // Add creator as pool member
    await supabase.from('pool_members').insert([
      {
        pool_id: data.id,
        user_id: session.user.id,
      },
    ]);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const supabase = supabaseServer();
    const { searchParams } = new URL(req.url);
    const poolId = searchParams.get('id');

    if (poolId) {
      const { data, error } = await supabase
        .from('pools')
        .select('*, pool_members(user_id)')
        .eq('id', poolId)
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Pool not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(data);
    }

    const { data, error } = await supabase
      .from('pools')
      .select('*, pool_members(user_id)')
      .or(`is_public.eq.true,creator_id.eq.${session.user.id}`);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch pools' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
