import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth-options';
import { supabaseServer } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { joinCode, poolId } = await req.json();

    if (!joinCode && !poolId) {
      return NextResponse.json(
        { error: 'Join code or pool ID required' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    let pool;

    if (joinCode) {
      const { data, error } = await supabase
        .from('pools')
        .select('*')
        .eq('join_code', joinCode)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: 'Invalid join code' },
          { status: 400 }
        );
      }
      pool = data;
    } else {
      const { data, error } = await supabase
        .from('pools')
        .select('*')
        .eq('id', poolId)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: 'Pool not found' },
          { status: 404 }
        );
      }
      pool = data;
    }

    // Check if user is already a member
    const { data: existing } = await supabase
      .from('pool_members')
      .select('id')
      .eq('pool_id', pool.id)
      .eq('user_id', session.user.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Already a member of this pool' },
        { status: 400 }
      );
    }

    // Add member
    const { error: insertError } = await supabase
      .from('pool_members')
      .insert([
        {
          pool_id: pool.id,
          user_id: session.user.id,
        },
      ]);

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to join pool' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Joined pool successfully', poolId: pool.id },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
