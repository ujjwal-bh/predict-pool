'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/app/components/header';
import { MatchPredictionCard } from '@/app/components/match-prediction-card';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Pool {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  join_code: string;
  pool_members: any[];
  creator_id: string;
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  email: string;
  totalPoints: number;
  correctPredictions: number;
  totalPredictions: number;
}

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  stage: string;
  group_name: string | null;
}

interface Prediction {
  id: string;
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_winner: string;
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Barlow+Condensed:wght@700;800;900&display=swap');

  .pd { font-family: 'Inter', sans-serif; background: #F2F4F8; min-height: 100vh; color: #0D0F14; }
  .pd *, .pd *::before, .pd *::after { box-sizing: border-box; }

  /* ── Layout shell ── */
  .pd-wrap { max-width: 1280px; margin: 0 auto; padding: 0 20px 80px; }

  /* ── Back link ── */
  .pd-back {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: 600; color: #5A5F72;
    text-decoration: none; padding: 28px 0 20px; letter-spacing: .02em;
    transition: color .15s;
  }
  .pd-back:hover { color: #2563EB; }
  .pd-back svg { transition: transform .15s; }
  .pd-back:hover svg { transform: translateX(-3px); }

  /* ── Error banner ── */
  .pd-error {
    background: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px;
    padding: 12px 16px; font-size: 13px; font-weight: 500; color: #B91C1C;
    margin-bottom: 16px;
  }

  /* ════════════════════════════════
     HERO CARD
  ════════════════════════════════ */
  .pd-hero {
    background: #0D0F14; border-radius: 20px; padding: 36px 40px;
    margin-bottom: 32px; position: relative; overflow: hidden;
  }
  .pd-hero::after {
    content: ''; position: absolute;
    top: -80px; right: -80px; width: 360px; height: 360px;
    background: radial-gradient(circle, rgba(37,99,235,.3) 0%, transparent 65%);
    pointer-events: none;
  }
  .pd-hero-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
  .pd-hero-eyebrow {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
    color: rgba(255,255,255,.35); margin-bottom: 8px;
  }
  .pd-hero-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(30px, 5vw, 52px); font-weight: 900; line-height: 1;
    color: #fff; letter-spacing: -.5px; margin: 0 0 10px;
  }
  .pd-hero-desc { font-size: 14px; color: rgba(255,255,255,.45); margin: 0; line-height: 1.6; max-width: 480px; }
  .pd-hero-stat { text-align: right; flex-shrink: 0; }
  .pd-hero-num {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(40px, 6vw, 60px); font-weight: 900; line-height: 1; color: #fff;
  }
  .pd-hero-num-label { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.35); margin-top: 4px; }

  /* invite strip */
  .pd-invite {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    flex-wrap: wrap; background: rgba(37,99,235,.14); border: 1px solid rgba(37,99,235,.28);
    border-radius: 12px; padding: 14px 18px; margin-top: 24px;
  }
  .pd-invite-label { font-size: 13px; font-weight: 600; color: rgba(255,255,255,.85); }
  .pd-invite-sub { font-size: 12px; color: rgba(255,255,255,.35); margin-top: 2px; }
  .pd-invite-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: #2563EB; color: #fff; border: none; border-radius: 8px;
    padding: 9px 16px; font-size: 13px; font-weight: 700; letter-spacing: .03em;
    cursor: pointer; transition: background .15s, transform .1s; white-space: nowrap;
  }
  .pd-invite-btn:hover { background: #1D4ED8; transform: translateY(-1px); }
  .pd-invite-btn.ok { background: #10B981; }

  /* hero actions */
  .pd-hero-actions { display: flex; gap: 10px; margin-top: 24px; }
  .pd-hbtn {
    border: none; cursor: pointer; border-radius: 8px; padding: 9px 16px;
    font-size: 13px; font-weight: 600; transition: all .15s;
  }
  .pd-hbtn.del { background: rgba(239,68,68,.12); color: #FC8181; border: 1px solid rgba(239,68,68,.2); }
  .pd-hbtn.del:hover { background: rgba(239,68,68,.22); }
  .pd-hbtn.leave { background: rgba(255,255,255,.08); color: rgba(255,255,255,.6); border: 1px solid rgba(255,255,255,.1); }
  .pd-hbtn.leave:hover { background: rgba(255,255,255,.14); }

  /* ════════════════════════════════
     BODY: matches + sidebar
  ════════════════════════════════ */
  .pd-body { display: flex; gap: 24px; align-items: flex-start; }
  .pd-main { flex: 1; min-width: 0; }
  .pd-aside { width: 300px; flex-shrink: 0; position: sticky; top: 24px; }

  /* ════════════════════════════════
     TABS
  ════════════════════════════════ */
  .pd-tabs {
    display: flex; gap: 2px; background: #E2E5ED;
    border-radius: 12px; padding: 4px; margin-bottom: 24px;
    overflow-x: auto; -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .pd-tabs::-webkit-scrollbar { display: none; }
  .pd-tab {
    flex: 1; min-width: max-content;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    border: none; background: transparent; cursor: pointer;
    border-radius: 9px; padding: 10px 18px;
    font-size: 13px; font-weight: 600; color: #5A5F72;
    transition: all .18s; white-space: nowrap;
  }
  .pd-tab:hover { color: #0D0F14; }
  .pd-tab-pill {
    border-radius: 20px; padding: 2px 8px;
    font-size: 11px; font-weight: 700;
    background: rgba(0,0,0,.08); color: inherit;
  }
  .pd-tab.on { background: #fff; color: #0D0F14; box-shadow: 0 1px 6px rgba(0,0,0,.10); }
  .pd-tab.on.live-t { color: #EF4444; }
  .pd-tab.on.live-t .pd-tab-pill { background: #FEE2E2; color: #EF4444; }
  .pd-tab.on.up-t   { color: #2563EB; }
  .pd-tab.on.up-t   .pd-tab-pill { background: #DBEAFE; color: #2563EB; }
  .pd-tab.on.done-t { color: #10B981; }
  .pd-tab.on.done-t .pd-tab-pill { background: #D1FAE5; color: #10B981; }

  /* ── Tip banner ── */
  .pd-tip {
    display: flex; gap: 10px; align-items: flex-start;
    background: #EFF6FF; border: 1px solid #BFDBFE;
    border-radius: 10px; padding: 12px 14px; margin-bottom: 20px;
    font-size: 13px; color: #1E40AF; line-height: 1.5;
  }

  /* ════════════════════════════════
     MATCH GRID
  ════════════════════════════════ */
  .pd-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }

  /* ── Live card ── */
  .pd-live-card { background: #fff; border-radius: 14px; border: 1.5px solid #FCA5A5; overflow: hidden; box-shadow: 0 0 0 4px rgba(239,68,68,.06); }
  .pd-live-hd { background: #EF4444; padding: 8px 14px; display: flex; align-items: center; gap: 6px; }
  .pd-live-dot { width: 7px; height: 7px; border-radius: 50%; background: #fff; animation: lp 1.2s ease-in-out infinite; }
  @keyframes lp { 0%,100%{opacity:1} 50%{opacity:.35} }
  .pd-live-hd-txt { font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: #fff; }
  .pd-live-body { padding: 18px 16px; }
  .pd-live-row { display: flex; align-items: center; justify-content: space-between; padding: 5px 0; }
  .pd-live-name { font-size: 14px; font-weight: 700; color: #0D0F14; }
  .pd-live-score { font-family: 'Barlow Condensed', sans-serif; font-size: 34px; font-weight: 900; color: #0D0F14; line-height: 1; }
  .pd-live-sep { text-align: center; font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #9297A8; padding: 4px 0; }
  .pd-live-time { text-align: center; font-size: 11px; color: #9297A8; margin-top: 10px; padding-top: 10px; border-top: 1px solid #F0F2F7; }

  /* ── Completed card ── */
  .pd-done-card { background: #fff; border-radius: 14px; border: 1px solid #E8EAF0; overflow: hidden; transition: box-shadow .15s, transform .15s; }
  .pd-done-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.08); transform: translateY(-2px); }
  .pd-done-hd { background: #F0FDF4; padding: 8px 14px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #D1FAE5; }
  .pd-done-stage { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #059669; }
  .pd-done-badge { font-size: 10px; font-weight: 700; background: #10B981; color: #fff; border-radius: 4px; padding: 2px 7px; }
  .pd-done-body { padding: 16px 14px; }
  .pd-done-row { display: flex; align-items: center; justify-content: space-between; }
  .pd-done-name { font-size: 14px; font-weight: 700; color: #0D0F14; }
  .pd-done-score { font-family: 'Barlow Condensed', sans-serif; font-size: 30px; font-weight: 900; color: #0D0F14; line-height: 1; }
  .pd-done-sep { text-align: center; font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #9297A8; padding: 5px 0; }
  .pd-done-ft { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-top: 1px solid #F0F2F7; }
  .pd-done-time { font-size: 11px; color: #9297A8; }
  .pd-pred-pill { background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 6px; padding: 3px 9px; font-size: 11px; font-weight: 700; color: #2563EB; }
  .pd-match-label { text-align: center; font-size: 10px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: #9297A8; margin-top: 7px; }

  /* ════════════════════════════════
     EMPTY STATE
  ════════════════════════════════ */
  .pd-empty { background: #fff; border: 1px solid #E8EAF0; border-radius: 14px; padding: 48px 24px; text-align: center; }
  .pd-empty-ico { font-size: 34px; margin-bottom: 10px; }
  .pd-empty-msg { font-size: 15px; font-weight: 700; color: #0D0F14; margin-bottom: 4px; }
  .pd-empty-sub { font-size: 13px; color: #9297A8; }

  /* ════════════════════════════════
     SPINNER
  ════════════════════════════════ */
  .pd-spin { display: flex; flex-direction: column; align-items: center; padding: 56px 0; gap: 12px; }
  .pd-spin-ring { width: 32px; height: 32px; border: 3px solid #E8EAF0; border-top-color: #2563EB; border-radius: 50%; animation: spin .7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .pd-spin-txt { font-size: 13px; color: #9297A8; font-weight: 500; }

  /* ════════════════════════════════
     LEADERBOARD SIDEBAR
  ════════════════════════════════ */
  .pd-lb-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 22px; font-weight: 900; color: #0D0F14;
    letter-spacing: -.3px; margin-bottom: 14px;
    display: flex; align-items: center; gap: 8px;
  }
  .pd-lb-card { background: #fff; border: 1px solid #E8EAF0; border-radius: 16px; overflow: hidden; }
  .pd-lb-head { background: #0D0F14; padding: 12px 16px; display: grid; grid-template-columns: 40px 1fr 48px; gap: 8px; }
  .pd-lb-hcol { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.35); }
  .pd-lb-hcol.r { text-align: right; }
  .pd-lb-row {
    display: grid; grid-template-columns: 40px 1fr 48px; gap: 8px;
    padding: 11px 16px; border-bottom: 1px solid #F0F2F7;
    align-items: center; transition: background .12s;
  }
  .pd-lb-row:last-child { border-bottom: none; }
  .pd-lb-row:hover { background: #F8F9FC; }
  .pd-lb-row.me { background: #EFF6FF; }
  .pd-lb-row.me:hover { background: #DBEAFE; }
  .pd-lb-rank { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 900; color: #0D0F14; }
  .pd-lb-medal { font-size: 18px; }
  .pd-lb-name { font-size: 13px; font-weight: 700; color: #0D0F14; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pd-lb-you { font-size: 10px; font-weight: 600; color: #2563EB; background: #DBEAFE; border-radius: 4px; padding: 1px 5px; display: inline-block; margin-left: 4px; vertical-align: middle; }
  .pd-lb-email { font-size: 11px; color: #9297A8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pd-lb-pts { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 900; color: #2563EB; text-align: right; }

  /* mobile: leaderboard moves below matches */
  @media (max-width: 900px) {
    .pd-body { flex-direction: column; }
    .pd-aside { width: 100%; position: static; }
    .pd-lb-card-wrap { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0; }
  }

  /* ════════════════════════════════
     MODALS
  ════════════════════════════════ */
  .pd-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.55);
    display: flex; align-items: center; justify-content: center;
    z-index: 50; padding: 16px; backdrop-filter: blur(4px);
  }
  .pd-modal { background: #fff; border-radius: 20px; max-width: 400px; width: 100%; padding: 32px; box-shadow: 0 24px 64px rgba(0,0,0,.18); }
  .pd-modal-ico { font-size: 38px; margin-bottom: 14px; }
  .pd-modal-title { font-size: 21px; font-weight: 800; color: #0D0F14; margin: 0 0 8px; }
  .pd-modal-body { font-size: 14px; color: #5A5F72; line-height: 1.6; margin-bottom: 26px; }
  .pd-modal-row { display: flex; gap: 10px; }
  .pd-mbtn {
    flex: 1; border-radius: 10px; padding: 12px; font-size: 14px;
    font-weight: 700; cursor: pointer; transition: all .15s; border: none;
  }
  .pd-mbtn.cancel { background: #F2F4F8; color: #0D0F14; border: 1.5px solid #E8EAF0; }
  .pd-mbtn.cancel:hover { background: #E8EAF0; }
  .pd-mbtn.red { background: #EF4444; color: #fff; }
  .pd-mbtn.red:hover { background: #DC2626; }
  .pd-mbtn.red:disabled { background: #FCA5A5; cursor: not-allowed; }
  .pd-mbtn.blue { background: #2563EB; color: #fff; }
  .pd-mbtn.blue:hover { background: #1D4ED8; }
  .pd-mbtn.blue:disabled { background: #93C5FD; cursor: not-allowed; }

  @media (max-width: 520px) {
    .pd-hero { padding: 24px 20px; }
    .pd-wrap { padding: 0 14px 60px; }
    .pd-tabs { gap: 1px; }
    .pd-tab { padding: 9px 12px; font-size: 12px; }
  }
`;

export default function PoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [pool, setPool] = useState<Pool | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Map<string, Prediction>>(new Map());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeMatchTab, setActiveMatchTab] = useState<'live' | 'upcoming' | 'completed'>('upcoming');

  useEffect(() => {
    const fetchPool = async () => {
      try {
        const res = await fetch(`/api/pools?id=${params.id}`);
        if (!res.ok) throw new Error('Pool not found');
        setPool(await res.json());
      } catch (err) { setError((err as Error).message); }
      finally { setLoading(false); }
    };
    fetchPool();
  }, [params.id]);

  useEffect(() => {
    const fetchMatches = async () => {
      setMatchesLoading(true);
      try {
        const res = await fetch('/api/matches');
        if (!res.ok) throw new Error('Failed to fetch matches');
        const data = await res.json();
        setMatches(data.sort((a: Match, b: Match) => +new Date(a.match_date) - +new Date(b.match_date)));
      } catch (err) { console.error(err); }
      finally { setMatchesLoading(false); }
    };
    fetchMatches();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchPredictions = async () => {
      try {
        const res = await fetch(`/api/predictions?poolId=${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch predictions');
        const data: Prediction[] = await res.json();
        setPredictions(new Map(data.map((p: any) => [p.match_id, p])));
      } catch (err) { console.error(err); }
    };
    fetchPredictions();
  }, [params.id, session?.user?.id]);

  useEffect(() => {
    if (!params.id) return;
    const fetchLeaderboard = async () => {
      setLeaderboardLoading(true);
      try {
        const res = await fetch(`/api/leaderboard?poolId=${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        setLeaderboard(await res.json());
      } catch (err) { console.error(err); setLeaderboard([]); }
      finally { setLeaderboardLoading(false); }
    };
    fetchLeaderboard();
  }, [params.id]);

  const handleCopyCode = () => {
    if (!pool?.join_code) return;
    navigator.clipboard.writeText(pool.join_code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDeletePool = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/pools/${params.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error);
      router.push('/dashboard');
    } catch (err) { setError((err as Error).message); setShowDeleteModal(false); }
    finally { setActionLoading(false); }
  };

  const handleLeavePool = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/pools/${params.id}/leave`, { method: 'POST' });
      if (!res.ok) throw new Error((await res.json()).error);
      router.push('/dashboard');
    } catch (err) { setError((err as Error).message); setShowLeaveModal(false); }
    finally { setActionLoading(false); }
  };

  const handlePredictionSubmit = async (
    matchId: string,
    prediction: { predicted_home_score: number; predicted_away_score: number; predicted_winner: string }
  ) => {
    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId: params.id, matchId, ...prediction }),
      });
      if (!res.ok) throw new Error('Failed to save prediction');
      const data = await res.json();
      predictions.set(matchId, data);
      setPredictions(new Map(predictions));
    } catch (err) { setError((err as Error).message); }
  };

  const isCreator = session?.user?.id === pool?.creator_id;
  const now = new Date();
  const liveMatches    = matches.filter(m => m.status === 'pending' && new Date(m.match_date) <= now).sort((a,b) => +new Date(a.match_date) - +new Date(b.match_date));
  const upcomingMatches = matches.filter(m => m.status === 'pending' && new Date(m.match_date) > now).sort((a,b) => +new Date(a.match_date) - +new Date(b.match_date));
  const completedMatches = matches.filter(m => m.status === 'completed').sort((a,b) => +new Date(b.match_date) - +new Date(a.match_date));

  const Spinner = ({ label }: { label: string }) => (
    <div className="pd-spin"><div className="pd-spin-ring" /><p className="pd-spin-txt">{label}</p></div>
  );

  if (loading) return (
    <><style>{CSS}</style><Header />
      <div className="pd"><div className="pd-wrap"><Spinner label="Loading pool…" /></div></div>
    </>
  );

  if (error || !pool) return (
    <><style>{CSS}</style><Header />
      <div className="pd"><div className="pd-wrap">
        <Link href="/dashboard" className="pd-back">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Dashboard
        </Link>
        <div className="pd-error">{error || 'Pool not found'}</div>
      </div></div>
    </>
  );

  return (
    <><style>{CSS}</style><Header />
    <div className="pd">
      <div className="pd-wrap">

        {/* ── Back ── */}
        <Link href="/dashboard" className="pd-back">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Dashboard
        </Link>

        {error && <div className="pd-error">{error}</div>}

        {/* ════ HERO ════ */}
        <div className="pd-hero">
          <div className="pd-hero-row">
            <div>
              <p className="pd-hero-eyebrow">Prediction Pool</p>
              <h1 className="pd-hero-title">{pool.name}</h1>
              {pool.description && <p className="pd-hero-desc">{pool.description}</p>}
            </div>
            <div className="pd-hero-stat">
              <div className="pd-hero-num">{pool.pool_members?.length || 0}</div>
              <div className="pd-hero-num-label">Members</div>
            </div>
          </div>

          {!pool.is_public && (
            <div className="pd-invite">
              <div>
                <div className="pd-invite-label">Invite Code</div>
                <div className="pd-invite-sub">Share with friends to join</div>
              </div>
              <button onClick={handleCopyCode} className={`pd-invite-btn${copySuccess ? ' ok' : ''}`}>
                {copySuccess
                  ? <><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg> Copied!</>
                  : <><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> {pool.join_code}</>
                }
              </button>
            </div>
          )}

          <div className="pd-hero-actions">
            {isCreator
              ? <button onClick={() => setShowDeleteModal(true)} className="pd-hbtn del">Delete Pool</button>
              : <button onClick={() => setShowLeaveModal(true)} className="pd-hbtn leave">Leave Pool</button>
            }
          </div>
        </div>

        {/* ════ BODY: matches + sidebar ════ */}
        <div className="pd-body">

          {/* ── MAIN: matches ── */}
          <div className="pd-main">
            {/* Tabs */}
            <div className="pd-tabs">
              {([['live','live-t','Live',liveMatches.length],['upcoming','up-t','Upcoming',upcomingMatches.length],['completed','done-t','Completed',completedMatches.length]] as const).map(([key,cls,label,count]) => (
                <button key={key} onClick={() => setActiveMatchTab(key)} className={`pd-tab ${cls}${activeMatchTab===key?' on':''}`}>
                  {label}<span className="pd-tab-pill">{count}</span>
                </button>
              ))}
            </div>

            {matchesLoading ? <Spinner label="Loading matches…" /> :
              activeMatchTab === 'live' ? (
                liveMatches.length === 0
                  ? <div className="pd-empty"><div className="pd-empty-ico">📡</div><p className="pd-empty-msg">No live matches</p><p className="pd-empty-sub">Check back when a match is in progress</p></div>
                  : <div className="pd-grid">
                      {liveMatches.map((m: any) => (
                        <div key={m.id} className="pd-live-card">
                          <div className="pd-live-hd"><span className="pd-live-dot"/><span className="pd-live-hd-txt">Live Now</span></div>
                          <div className="pd-live-body">
                            <div className="pd-live-row"><span className="pd-live-name">{m.home_team}</span><span className="pd-live-score">{m.home_score ?? '–'}</span></div>
                            <div className="pd-live-sep">vs</div>
                            <div className="pd-live-row"><span className="pd-live-name">{m.away_team}</span><span className="pd-live-score">{m.away_score ?? '–'}</span></div>
                            <div className="pd-live-time">{new Date(m.match_date).toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
              ) : activeMatchTab === 'upcoming' ? (
                upcomingMatches.length === 0
                  ? <div className="pd-empty"><div className="pd-empty-ico">📅</div><p className="pd-empty-msg">No upcoming matches</p><p className="pd-empty-sub">All matches have started or finished</p></div>
                  : <>
                      <div className="pd-tip">
                        <span style={{flexShrink:0,marginTop:'1px'}}>💡</span>
                        <span><strong>How to predict:</strong> Use + / − to set scores and hit Save. Edit any time before kick-off.</span>
                      </div>
                      <div className="pd-grid">
                        {upcomingMatches.map((m: any) => (
                          <div key={m.id}>
                            <MatchPredictionCard
                              match={m}
                              initialPrediction={predictions.get(m.id) as any}
                              onSubmit={(p: any) => handlePredictionSubmit(m.id, p)}
                            />
                            {/* <p className="pd-match-label">{m.group_name || m.stage || 'Other'}</p> */}
                          </div>
                        ))}
                      </div>
                    </>
              ) : (
                completedMatches.length === 0
                  ? <div className="pd-empty"><div className="pd-empty-ico">✅</div><p className="pd-empty-msg">No completed matches</p><p className="pd-empty-sub">Results will show up here as matches finish</p></div>
                  : <div className="pd-grid">
                      {completedMatches.map((m: any) => {
                        const pred = predictions.get(m.id);
                        return (
                          <div key={m.id}>
                            <div className="pd-done-card">
                              <div className="pd-done-hd">
                                <span className="pd-done-stage">{m.group_name || m.stage}</span>
                                <span className="pd-done-badge">Final</span>
                              </div>
                              <div className="pd-done-body">
                                <div className="pd-done-row"><span className="pd-done-name">{m.home_team}</span><span className="pd-done-score">{m.home_score ?? '–'}</span></div>
                                <div className="pd-done-sep">vs</div>
                                <div className="pd-done-row"><span className="pd-done-name">{m.away_team}</span><span className="pd-done-score">{m.away_score ?? '–'}</span></div>
                              </div>
                              <div className="pd-done-ft">
                                <span className="pd-done-time">{new Date(m.match_date).toLocaleDateString()}</span>
                                {pred && <span className="pd-pred-pill">{pred.predicted_home_score}–{pred.predicted_away_score}</span>}
                              </div>
                            </div>
                            <p className="pd-match-label">{m.group_name || m.stage || 'Other'}</p>
                          </div>
                        );
                      })}
                    </div>
              )
            }
          </div>

          {/* ── ASIDE: leaderboard ── */}
          <div className="pd-aside">
            <h2 className="pd-lb-title">🏆 Leaderboard</h2>
            {leaderboardLoading ? <Spinner label="Loading standings…" /> :
              leaderboard.length === 0
                ? <div className="pd-empty"><div className="pd-empty-ico">📊</div><p className="pd-empty-msg">No standings yet</p><p className="pd-empty-sub">Appears once members predict</p></div>
                : <div className="pd-lb-card">
                    <div className="pd-lb-head">
                      <span className="pd-lb-hcol">#</span>
                      <span className="pd-lb-hcol">Player</span>
                      <span className="pd-lb-hcol r">Pts</span>
                    </div>
                    {leaderboard.map((e: any, i: number) => (
                      <div key={e.userId} className={`pd-lb-row${e.userId === session?.user?.id ? ' me' : ''}`}>
                        <span>
                          {i === 0 && <span className="pd-lb-medal">🥇</span>}
                          {i === 1 && <span className="pd-lb-medal">🥈</span>}
                          {i === 2 && <span className="pd-lb-medal">🥉</span>}
                          {i > 2  && <span className="pd-lb-rank">#{i+1}</span>}
                        </span>
                        <div style={{minWidth:0}}>
                          <div className="pd-lb-name">
                            {e.name}
                            {e.userId === session?.user?.id && <span className="pd-lb-you">you</span>}
                          </div>
                          <div className="pd-lb-email">{e.email}</div>
                        </div>
                        <div className="pd-lb-pts">{e.totalPoints}</div>
                      </div>
                    ))}
                  </div>
            }
          </div>
        </div>
      </div>
    </div>

    {/* ── Delete modal ── */}
    {showDeleteModal && (
      <div className="pd-overlay" onClick={() => setShowDeleteModal(false)}>
        <div className="pd-modal" onClick={e => e.stopPropagation()}>
          <div className="pd-modal-ico">🗑️</div>
          <h2 className="pd-modal-title">Delete "{pool.name}"?</h2>
          <p className="pd-modal-body">This permanently removes the pool and every prediction inside it. There's no undo.</p>
          <div className="pd-modal-row">
            <button onClick={() => setShowDeleteModal(false)} disabled={actionLoading} className="pd-mbtn cancel">Cancel</button>
            <button onClick={handleDeletePool} disabled={actionLoading} className="pd-mbtn red">{actionLoading ? 'Deleting…' : 'Delete pool'}</button>
          </div>
        </div>
      </div>
    )}

    {/* ── Leave modal ── */}
    {showLeaveModal && (
      <div className="pd-overlay" onClick={() => setShowLeaveModal(false)}>
        <div className="pd-modal" onClick={e => e.stopPropagation()}>
          <div className="pd-modal-ico">🚪</div>
          <h2 className="pd-modal-title">Leave "{pool.name}"?</h2>
          <p className="pd-modal-body">You'll be removed and your predictions will be deleted.</p>
          <div className="pd-modal-row">
            <button onClick={() => setShowLeaveModal(false)} disabled={actionLoading} className="pd-mbtn cancel">Stay</button>
            <button onClick={handleLeavePool} disabled={actionLoading} className="pd-mbtn blue">{actionLoading ? 'Leaving…' : 'Leave pool'}</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
