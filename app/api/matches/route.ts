import { NextResponse } from 'next/server';
import { supabaseServer } from '@/app/lib/supabase';

export async function GET() {
  try {
    const supabase = supabaseServer();

    if (!supabase) {
      console.warn('Database connection failed, using fallback');
      return NextResponse.json([]);
    }

    // Fetch matches from database (sorted by date)
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: true });

    if (error) {
      console.warn('Failed to fetch from database:', error);
      return NextResponse.json([]);
    }

    if (matches && matches.length > 0) {
      console.log(`Loaded ${matches.length} matches from database`);
      return NextResponse.json(matches);
    }


    return NextResponse.json([]);
  } catch (error) {
    console.error('Error in matches endpoint:', error);

    return NextResponse.json([]);
  }
}

