import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth-options';
import { supabaseServer } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
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

    // Verify user is the creator
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

    if ((pool as any).creator_id !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete pools you created' },
        { status: 403 }
      );
    }

    // Delete the pool (cascade will handle pool_members and predictions)
    const { error: deleteError } = await supabase
      .from('pools')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete pool error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete pool' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Pool deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in delete pool:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
