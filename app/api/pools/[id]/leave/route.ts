import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth-options';
import { supabaseServer } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    // Verify user is not the creator
    const { data: pool, error: fetchError } = await supabase
      .from('pools')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (fetchError || !pool) {
      return NextResponse.json(
        { error: 'Pool not found' },
        { status: 404 }
      );
    }

    if ((pool as any).creator_id === session.user.id) {
      return NextResponse.json(
        { error: 'Pool creator cannot leave. Delete the pool instead.' },
        { status: 403 }
      );
    }

    // Remove user from pool members
    const { error: leaveError } = await supabase
      .from('pool_members')
      .delete()
      .eq('pool_id', id)
      .eq('user_id', session.user.id);

    if (leaveError) {
      console.error('Leave pool error:', leaveError);
      return NextResponse.json(
        { error: 'Failed to leave pool' },
        { status: 500 }
      );
    }

    // Delete user's predictions in this pool
    await supabase
      .from('predictions')
      .delete()
      .eq('pool_id', id)
      .eq('user_id', session.user.id);

    return NextResponse.json(
      { message: 'Left pool successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in leave pool:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
