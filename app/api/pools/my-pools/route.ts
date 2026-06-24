import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth-options';
import { supabaseServer } from '@/app/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const supabase = supabaseServer();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Get pools created by user
    const { data: createdPools, error: createdError } = await supabase
      .from('pools')
      .select('*, pool_members(user_id)')
      .eq('creator_id', session.user.id)
      .order('created_at', { ascending: false });

    if (createdError) {
      console.error('Error fetching created pools:', createdError);
      return NextResponse.json(
        { error: 'Failed to fetch created pools' },
        { status: 500 }
      );
    }

    // Get pools user has joined (including created)
    const { data: joinedPoolIds, error: memberError } = await supabase
      .from('pool_members')
      .select('pool_id')
      .eq('user_id', session.user.id);

    if (memberError) {
      console.error('Error fetching pool memberships:', memberError);
      return NextResponse.json(
        { error: 'Failed to fetch pool memberships' },
        { status: 500 }
      );
    }

    const poolIds = (joinedPoolIds || []).map((m: any) => m.pool_id);

    // Get all pools user is member of
    const { data: allJoinedPools, error: joinedError } = await supabase
      .from('pools')
      .select('*, pool_members(user_id)')
      .in('id', poolIds)
      .order('created_at', { ascending: false });

    if (joinedError) {
      console.error('Error fetching joined pools:', joinedError);
      return NextResponse.json(
        { error: 'Failed to fetch joined pools' },
        { status: 500 }
      );
    }

    // Filter to only show joined (not created by user)
    const joinedNotCreated = (allJoinedPools || []).filter(
      (p: any) => p.creator_id !== session.user.id
    );

    return NextResponse.json({
      created: createdPools || [],
      joined: joinedNotCreated || [],
    });
  } catch (error) {
    console.error('Error in my-pools:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
