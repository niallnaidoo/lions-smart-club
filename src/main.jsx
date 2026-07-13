/* ─── Brand mark: leaping lion silhouette ───
   Stylised stand-in until the user provides the official DP World Lions logo. */
function LionMark() {
  return (
    <svg viewBox="0 0 64 64" fill="currentColor" aria-label="Lions emblem">
      {/* Body: arched leaping lion with curled tail */}
      <path
        d="M5 44
        C 5 26, 22 12, 40 14
        C 48 14.8, 55 16, 60 13
        L 55 24
        C 58 31, 53 41, 41 44
        L 38 38
        C 30 44, 18 45, 9 44
        Z"
      />
      {/* Tail fluke */}
      <path d="M3 46 C 6 47, 10 48, 13 50 L 7 53 C 4 52, 2 49, 3 46 Z" />
      {/* Dorsal fin */}
      <path d="M28 18 L 32 11 L 35 19 Z" />
      {/* Eye */}
      <circle cx="49" cy="22" r="1.6" fill="rgba(255,255,255,0.92)" />
    </svg>
  );
}

/* ─── Profile Select (entry screen) ─── */
function ProfileSelect({ onSelect, clubs }) {
  const stats = cohortStats(clubs);
  const unpaid = clubs.filter((c) => !c.paid).length;

  return (
    <div className="ps-screen">
      <div className="ps-brand">
        <img className="ps-brand-logo" src="lions-logo.svg" alt="DP World Lions" />
        <div
          className="ps-eyebrow"
          style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: 11 }}
        >
          Smart Club Integration · KZNCU &amp; EMCU
        </div>
      </div>

      <div className="ps-intro">
        <div className="ps-eyebrow">KZNCU &amp; EMCU · 2026 / 27 Season</div>
        <h1 className="ps-title">
          Welcome — <em>choose your profile</em>
        </h1>
        <p className="ps-desc">
          Sign in as a Lions administrator to manage all affiliated clubs, or as a club delegate to
          complete your affiliation, compliance and CQI submissions.
        </p>
      </div>

      <div className="ps-cards">
        {/* LIONS ADMIN */}
        <button className="ps-card gold" onClick={() => onSelect('admin')}>
          <div className="ps-card-icon">
            <svg viewBox="0 0 28 28" fill="none">
              <path
                d="M14 3L4 7v6c0 6 4 9.5 10 11 6-1.5 10-5 10-11V7l-10-4z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M9.5 14l3 3 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div className="ps-card-role">Administrator</div>
            <div className="ps-card-title">Lions office</div>
          </div>
          <p className="ps-card-desc">
            Track the cohort, monitor affiliation payments, review compliance documents and CQI
            submissions across every KZNCU &amp; EMCU club.
          </p>
          <div className="ps-card-meta">
            <div className="ps-card-stat">
              <div className="ps-card-stat-n">{stats.total}</div>
              <div className="ps-card-stat-l">Clubs</div>
            </div>
            <div className="ps-card-stat">
              <div className="ps-card-stat-n">{stats.paid}</div>
              <div className="ps-card-stat-l">Affiliated</div>
            </div>
            <div className="ps-card-stat">
              <div className="ps-card-stat-n">{unpaid}</div>
              <div className="ps-card-stat-l">Outstanding</div>
            </div>
          </div>
          <div className="ps-card-cta">
            <span className="ps-card-cta-text">Enter admin console</span>
            <span className="ps-card-cta-arrow">
              <Icon.Arrow />
            </span>
          </div>
        </button>

        {/* CLUB */}
        <button className="ps-card teal" onClick={() => onSelect('club')}>
          <div className="ps-card-icon">
            <svg viewBox="0 0 28 28" fill="none">
              <circle cx="10" cy="11" r="4" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="20" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M2 23c1-3.5 4-5.2 8-5.2s7 1.7 8 5.2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M18 23c.5-2.6 2.6-4 5-4s4.5 1.4 5 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <div className="ps-card-role">Club portal</div>
            <div className="ps-card-title">Chairperson / Delegate</div>
          </div>
          <p className="ps-card-desc">
            Complete your 2026/27 affiliation form, upload compliance documents and submit the Club
            Quality Index self-assessment.
          </p>
          <div className="ps-card-meta">
            <div className="ps-card-stat">
              <div className="ps-card-stat-n">3</div>
              <div className="ps-card-stat-l">Submissions</div>
            </div>
            <div className="ps-card-stat">
              <div className="ps-card-stat-n">R 4,500</div>
              <div className="ps-card-stat-l">Union fee</div>
            </div>
            <div className="ps-card-stat">
              <div className="ps-card-stat-n">22 Jun</div>
              <div className="ps-card-stat-l">Deadline</div>
            </div>
          </div>
          <div className="ps-card-cta">
            <span className="ps-card-cta-text">Enter club portal</span>
            <span className="ps-card-cta-arrow">
              <Icon.Arrow />
            </span>
          </div>
        </button>
      </div>

      <div className="ps-footer">
        <span>v 0.9.0</span>
        <span className="dot" />
        <span>KZNCU &amp; EMCU · 2026/27</span>
        <span className="dot" />
        <span>Powered by Medicoach</span>
      </div>
    </div>
  );
}

/* ─── Main App ─── */

import { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Icon, Pill, Btn, ProgChip, ClubNameCell, affPill, cqiBand, useToast } from './atoms.jsx';
import {
  REQUIRED_DOCS,
  SAMPLE_CLUBS,
  SERIES,
  SAMPLE_PLAYERS,
  SAMPLE_CLEARANCE_REQUESTS,
  cohortStats,
  docCompletion,
  isClearanceOverdue,
  CLUB_COST_SEED,
  CLUB_INCOME_SEED,
  SUBSCRIPTION_DEFAULT_ZAR,
  FACILITY_JOBS,
  PROJECT_SEED,
  SOCIAL_SEED,
} from './data.jsx';
import {
  ClubHome,
  AffiliationForm,
  DocumentsView,
  CQIView,
  ClubFixturesView,
  ClubPlayersView,
  RegisterPlayerForm,
  ClubClearancesView,
  ClubFacilitiesView,
  ClubVendorsView,
  ClubFinancialsView,
  ClubSocialView,
} from './club.jsx';
import {
  AdminDashboard,
  AdminClubsList,
  AdminClubDetail,
  AdminFixtures,
  CreateSeriesForm,
  AdminClearances,
  AdminFacilities,
  AdminVendors,
  AdminProjects,
  AdminFinancials,
  AdminSocial,
} from './admin.jsx';
import { Onboarding } from './onboarding.jsx';

/* ─── TaskModal — wraps the affiliation form & documents view ─── */
function TaskModal({ eyebrow, title, sub, onClose, narrow, children }) {
  return (
    <div className="task-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`task-modal ${narrow ? 'narrow' : ''}`}>
        <div className="task-modal-head">
          <div className="task-modal-head-text">
            {eyebrow && <div className="task-modal-head-eyebrow">{eyebrow}</div>}
            <div className="task-modal-head-title">{title}</div>
            {sub && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  color: 'var(--muted)',
                  fontFamily: "'Montserrat',sans-serif",
                }}
              >
                {sub}
              </div>
            )}
          </div>
          <button
            className="task-modal-close"
            onClick={onClose}
            title="Close (your inputs are saved)"
          >
            <Icon.X />
          </button>
        </div>
        <div className="task-modal-body">{children}</div>
      </div>
    </div>
  );
}

function App() {
  const [profile, setProfile] = useState(null);

  if (profile === null) {
    return <ProfileSelect onSelect={setProfile} clubs={SAMPLE_CLUBS} />;
  }
  return <Shell initialProfile={profile} onSwitchProfile={() => setProfile(null)} />;
}

function Shell({ initialProfile, onSwitchProfile }) {
  const [role, setRole] = useState(initialProfile); // "admin" | "club"
  const [view, setView] = useState(initialProfile === 'admin' ? 'dashboard' : 'home');
  const [clubId, setClubId] = useState('phoenix'); // active club ID
  const [clubs, setClubs] = useState(SAMPLE_CLUBS);
  const [onboarded, setOnboarded] = useState({});
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCreateSeries, setShowCreateSeries] = useState(false);
  const [allSeries, setAllSeries] = useState(SERIES);
  const [players, setPlayers] = useState(SAMPLE_PLAYERS);
  const [clearanceRequests, setClearanceRequests] = useState(SAMPLE_CLEARANCE_REQUESTS);
  const [showRegisterPlayer, setShowRegisterPlayer] = useState(false);
  const [toastShow, toastNode] = useToast();

  // Financial ledger — union of income + expense entries. Keyed by clubId so each
  // club sees only its own numbers. UKZN is pre-seeded with the full sample set;
  // a handful of other clubs get a lighter seed so the admin cohort view has
  // enough variety to be interesting.
  const [ledgerByClub, setLedgerByClub] = useState(() => {
    const derive = (clubId, mult) => {
      const scale = (list) => list.map((e) => ({
        ...e,
        id: `${e.id}-${clubId}`,
        amount: Math.round(e.amount * mult),
        payee: e.payee,
      }));
      return [
        ...scale(CLUB_COST_SEED.slice(0, 5)),
        ...scale(CLUB_INCOME_SEED.slice(0, 3)),
      ];
    };
    return {
      ukzn: [...CLUB_COST_SEED, ...CLUB_INCOME_SEED],
      harlequins: derive('harlequins', 1.35),
      crusaders: derive('crusaders', 1.1),
      berea: derive('berea', 0.9),
      chatsworth: derive('chatsworth', 0.65),
      rhythm: derive('rhythm', 0.55),
      warriors: derive('warriors', 0.45),
      umlazi: derive('umlazi', 0.6),
      spartan: derive('spartan', 0.72),
    };
  });
  // Subs paid state: { [clubId]: { [playerId]: { paid, amount, date, entryId } } }
  const [playerSubs, setPlayerSubs] = useState({});

  // Facility job cards — hoisted so club-side reports auto-materialise as job
  // cards on the admin side, and admin status changes flow back to the club's
  // Reports panel.
  const [jobs, setJobs] = useState(FACILITY_JOBS);

  // Admin project portfolio state
  const [projects, setProjects] = useState(PROJECT_SEED);

  // Match Day social posts — keyed by clubId so each chair sees only their own
  // uploads, while the admin gallery rolls up every club's posts.
  const [socialPostsByClub, setSocialPostsByClub] = useState(SOCIAL_SEED);

  function addSocialPost(cid, post) {
    setSocialPostsByClub((prev) => ({
      ...prev,
      [cid]: [post, ...(prev[cid] || [])],
    }));
  }
  function removeSocialPost(cid, postId) {
    setSocialPostsByClub((prev) => ({
      ...prev,
      [cid]: (prev[cid] || []).filter((p) => p.id !== postId),
    }));
    toastShow('Match post removed');
  }

  function severityToJobPriority(sev) {
    if (!sev) return 'medium';
    const s = String(sev).toLowerCase();
    if (s.includes('major') || s.includes('urgent') || s.includes('critical') || s.includes('severe')) return 'high';
    if (s.includes('minor') || s.includes('cosmetic') || s.includes('low')) return 'low';
    return 'medium';
  }

  function logClubReport(club, assetKey, assetLabel, issue) {
    const today = new Date().toISOString().slice(0, 10);
    const due = new Date();
    due.setDate(due.getDate() + 7);
    const jobId = `club-job-${club.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const job = {
      id: jobId,
      facilityId: club.id,
      type: 'reactive',
      typeLabel: `Reactive · ${assetLabel}`,
      title: [assetLabel, issue.category, issue.location].filter(Boolean).join(' · ') || `${assetLabel} · issue reported`,
      status: 'open',
      priority: severityToJobPriority(issue.severity),
      assigneeId: null,
      assigneeName: 'Awaiting dispatch',
      dueDate: due.toISOString().slice(0, 10),
      createdAt: today,
      checklist: [],
      notes: issue.note || '',
      reportedByClub: {
        clubId: club.id,
        clubName: club.name,
        chair: club.chair,
        at: today,
      },
      sourceIssue: {
        assetKey,
        assetLabel,
        category: issue.category,
        severity: issue.severity,
        location: issue.location,
        note: issue.note,
      },
    };
    setJobs((prev) => [job, ...prev]);
    toastShow(`Job card raised for ${club.short || club.name} · ${assetLabel}`);
    return jobId;
  }

  function ledgerFor(cid) {
    return ledgerByClub[cid] || [];
  }
  function addLedgerEntry(cid, entry) {
    const withId = { ...entry, id: (entry.direction === 'in' ? 'i-' : 'c-') + Date.now() };
    setLedgerByClub((prev) => ({
      ...prev,
      [cid]: [withId, ...(prev[cid] || [])],
    }));
    return withId.id;
  }
  function updateLedgerEntry(cid, entryId, patch) {
    setLedgerByClub((prev) => ({
      ...prev,
      [cid]: (prev[cid] || []).map((e) => (e.id === entryId ? { ...e, ...patch } : e)),
    }));
  }
  function removeLedgerEntry(cid, entryId) {
    setLedgerByClub((prev) => ({
      ...prev,
      [cid]: (prev[cid] || []).filter((e) => e.id !== entryId),
    }));
  }
  function togglePlayerSubs(cid, player, amount = SUBSCRIPTION_DEFAULT_ZAR) {
    const prev = playerSubs[cid]?.[player.id];
    if (prev?.paid) {
      // Undo — unmark + remove the ledger entry it created
      if (prev.entryId) removeLedgerEntry(cid, prev.entryId);
      setPlayerSubs((s) => ({
        ...s,
        [cid]: { ...(s[cid] || {}), [player.id]: undefined },
      }));
      toastShow(`${player.firstNames} ${player.surname} · subs unmarked`);
    } else {
      const today = new Date().toISOString().slice(0, 10);
      const entryId = addLedgerEntry(cid, {
        direction: 'in',
        date: today,
        category: 'subscription',
        payee: `${player.firstNames} ${player.surname}`,
        playerId: player.id,
        desc: `Player subs · ${player.team || 'roster'}`,
        amount,
        frequency: 'Season',
        invoice: '',
        paid: true,
      });
      setPlayerSubs((s) => ({
        ...s,
        [cid]: {
          ...(s[cid] || {}),
          [player.id]: { paid: true, amount, date: today, entryId },
        },
      }));
      toastShow(`Subs paid · ${player.firstNames} ${player.surname} · R ${amount.toLocaleString()}`);
    }
  }

  const activeClub = useMemo(() => clubs.find((c) => c.id === clubId), [clubs, clubId]);

  // Auto-open onboarding the first time a club portal is entered for an unaffiliated club
  useEffect(() => {
    if (initialProfile === 'club' && !activeClub.paid && !onboarded[clubId]) {
      const t = setTimeout(() => setShowOnboarding(true), 350);
      return () => clearTimeout(t);
    }
  }, []);

  function switchProfile() {
    setShowOnboarding(false);
    onSwitchProfile();
  }

  function setActiveClub(id) {
    setClubId(id);
    setView(role === 'admin' ? 'club_detail' : 'home');
  }

  function changeRole(r) {
    setRole(r);
    setView(r === 'admin' ? 'dashboard' : 'home');
    // First-time onboarding for clubs that aren't yet affiliated
    if (r === 'club' && !onboarded[clubId] && !activeClub.paid) {
      setTimeout(() => setShowOnboarding(true), 250);
    }
  }

  function changeClub(id) {
    setClubId(id);
    const c = clubs.find((x) => x.id === id);
    if (role === 'club' && !onboarded[id] && c && !c.paid) {
      setTimeout(() => setShowOnboarding(true), 250);
    }
  }

  // Club mutations (when club submits forms / uploads docs)
  function updateClub(updates) {
    setClubs((cs) => cs.map((c) => (c.id === clubId ? { ...c, ...updates } : c)));
  }
  function uploadDoc(key) {
    setClubs((cs) =>
      cs.map((c) => (c.id === clubId ? { ...c, docs: { ...c.docs, [key]: true } } : c))
    );
  }
  function saveExco(members) {
    // Save exco roster + mark the exco compliance doc as captured
    setClubs((cs) =>
      cs.map((c) =>
        c.id === clubId ? { ...c, exco: members, docs: { ...c.docs, exco: true } } : c
      )
    );
  }

  // ── Series / fixture editing handlers (admin) ──
  function updateSeries(seriesId, updater) {
    setAllSeries((prev) => prev.map((s) => (s.id === seriesId ? updater(s) : s)));
  }
  function deleteSeries(seriesId) {
    setAllSeries((prev) => prev.filter((s) => s.id !== seriesId));
  }
  function duplicateSeries(seriesId) {
    setAllSeries((prev) => {
      const orig = prev.find((s) => s.id === seriesId);
      if (!orig) return prev;
      const copy = {
        ...orig,
        id: 's-' + Date.now(),
        name: orig.name + ' · Copy',
        released: false,
        releasedAt: null,
        fixtures: orig.fixtures.map((f, i) => ({ ...f, id: 'fc' + Date.now() + '_' + i })),
      };
      return [...prev, copy];
    });
  }
  function setReleased(seriesId, value) {
    setAllSeries((prev) =>
      prev.map((s) =>
        s.id === seriesId
          ? { ...s, released: value, releasedAt: value ? new Date().toISOString() : null }
          : s
      )
    );
  }

  // ── Player / clearance handlers ──
  function registerPlayer(player) {
    setPlayers((prev) => [...prev, player]);
    setShowRegisterPlayer(false);
    toastShow(`${player.firstNames} ${player.surname} registered · ID ${player.idNumber}`);
  }

  // Source-club confirms one of the two boxes for an incoming clearance
  function clearFees(reqId) {
    setClearanceRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, feesCleared: !r.feesCleared } : r))
    );
  }
  function clearMisconduct(reqId) {
    setClearanceRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, misconductCleared: !r.misconductCleared } : r))
    );
  }

  // Source club issues clearance once both boxes ticked
  function approveClearance(reqId) {
    const nowIso = new Date().toISOString();
    let movedPlayerId = null,
      newClubId = null;
    setClearanceRequests((prev) =>
      prev.map((r) => {
        if (r.id !== reqId) return r;
        movedPlayerId = r.playerId;
        newClubId = r.toClubId;
        return {
          ...r,
          status: 'approved',
          clubApprovedAt: nowIso,
          feesCleared: true,
          misconductCleared: true,
        };
      })
    );
    if (movedPlayerId && newClubId) {
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === movedPlayerId ? { ...p, clubId: newClubId, status: 'active' } : p
        )
      );
    }
    toastShow('Clearance issued');
  }

  // Lions admin override after 14-day window
  function adminOverrideClearance(reqId) {
    const nowIso = new Date().toISOString();
    let movedPlayerId = null,
      newClubId = null;
    setClearanceRequests((prev) =>
      prev.map((r) => {
        if (r.id !== reqId) return r;
        movedPlayerId = r.playerId;
        newClubId = r.toClubId;
        return { ...r, status: 'admin-override', adminOverrideAt: nowIso };
      })
    );
    if (movedPlayerId && newClubId) {
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === movedPlayerId ? { ...p, clubId: newClubId, status: 'active' } : p
        )
      );
    }
  }

  // Club requests a clearance for one of its players (stub — destination picker not yet)
  function requestClearance(playerId, toClubId = 'berea') {
    const newReq = {
      id: 'clr-' + Date.now(),
      playerId,
      fromClubId: clubId,
      toClubId,
      requestedAt: new Date().toISOString().slice(0, 10),
      feesCleared: false,
      misconductCleared: false,
      clubApprovedAt: null,
      adminOverrideAt: null,
      status: 'pending',
      note: 'Player-initiated clearance request.',
    };
    setClearanceRequests((prev) => [...prev, newReq]);
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, status: 'clearance-pending' } : p))
    );
    toastShow('Clearance request opened');
  }

  // — NAV definition —
  const overdueClearances = clearanceRequests.filter((r) => isClearanceOverdue(r)).length;
  const pendingClearances = clearanceRequests.filter((r) => r.status === 'pending').length;

  const adminNav = [
    { v: 'dashboard', label: 'Cohort Dashboard', icon: Icon.Dashboard },
    { v: 'clubs_list', label: 'All Clubs', icon: Icon.Clubs, num: clubs.length },
    {
      v: 'affiliations',
      label: 'Affiliations',
      icon: Icon.Form,
      num: clubs.filter((c) => c.paid).length + '/' + clubs.length,
      dot: clubs.filter((c) => !c.paid).length ? 'gold' : 'teal',
    },
    {
      v: 'documents',
      label: 'Compliance Docs',
      icon: Icon.Upload,
      num: clubs.filter((c) => Object.values(c.docs).every((v) => v)).length + '/' + clubs.length,
      dot: 'gold',
    },
    {
      v: 'cqi_admin',
      label: 'CQI Submissions',
      icon: Icon.Star,
      num: clubs.filter((c) => c.cqi > 0).length + '/' + clubs.length,
      dot: 'gold',
    },
    { v: 'fixtures', label: 'Fixtures & Venues', icon: Icon.Field, dot: 'teal' },
    { v: 'facilities', label: 'Facilities', icon: Icon.Eye, dot: 'teal' },
    { v: 'vendors', label: 'Vendors', icon: Icon.Doc, dot: 'teal' },
    { v: 'projects', label: 'Projects', icon: Icon.Star, dot: 'teal' },
    { v: 'financials', label: 'Financials', icon: Icon.Doc, dot: 'teal' },
    { v: 'social', label: 'Match Day', icon: Icon.Field, dot: 'teal' },
    {
      v: 'clearances',
      label: 'Clearances',
      icon: Icon.Shield,
      num: overdueClearances ? overdueClearances : pendingClearances,
      dot: overdueClearances ? 'coral' : pendingClearances ? 'gold' : 'teal',
    },
  ];

  // Has any released series that includes this club?
  const releasedForMe = allSeries.filter((s) => s.released && s.teams.includes(clubId));
  const hasReleased = releasedForMe.length > 0;

  // Clearance counts relevant to active club
  const myPendingClearances = clearanceRequests.filter(
    (r) => r.fromClubId === clubId && r.status === 'pending'
  ).length;
  const myOverdueClearances = clearanceRequests.filter(
    (r) => r.fromClubId === clubId && isClearanceOverdue(r)
  ).length;
  const myPlayerCount = players.filter((p) => p.clubId === clubId).length;

  const clubNav = [
    { v: 'home', label: 'Home', icon: Icon.Dashboard },
    {
      v: 'affiliation',
      label: 'Affiliation',
      icon: Icon.Form,
      dot: activeClub.paid ? 'teal' : 'coral',
    },
    {
      v: 'documents',
      label: 'Documents',
      icon: Icon.Upload,
      dot: docCompletion(activeClub) === 100 ? 'teal' : 'gold',
    },
    { v: 'cqi', label: 'CQI', icon: Icon.Star, dot: activeClub.cqi > 0 ? 'teal' : 'muted' },
    {
      v: 'players',
      label: 'Players',
      icon: Icon.Clubs,
      num: activeClub.paid ? myPlayerCount : undefined,
      dot: activeClub.paid ? 'teal' : 'muted',
    },
    {
      v: 'clearances',
      label: 'Clearances',
      icon: Icon.Shield,
      num: myPendingClearances || undefined,
      dot: myOverdueClearances ? 'coral' : myPendingClearances ? 'gold' : 'muted',
    },
    {
      v: 'fixtures',
      label: 'Fixtures',
      icon: Icon.Field,
      dot: hasReleased ? 'teal' : activeClub.paid ? 'gold' : 'muted',
      num: hasReleased ? 'NEW' : undefined,
    },
    { v: 'facilities', label: 'Facilities', icon: Icon.Eye, dot: 'teal' },
    { v: 'vendors', label: 'Vendors', icon: Icon.Doc, dot: 'teal' },
    { v: 'financials', label: 'Financials', icon: Icon.Star, dot: 'teal' },
    { v: 'social', label: 'Match Day', icon: Icon.Field, dot: 'teal' },
  ];

  const nav = role === 'admin' ? adminNav : clubNav;

  // — render main pane —
  function renderMain() {
    if (role === 'admin') {
      if (view === 'dashboard')
        return (
          <AdminDashboard
            clubs={clubs}
            gotoClub={setActiveClub}
            gotoList={() => setView('clubs_list')}
          />
        );
      if (view === 'clubs_list') return <AdminClubsList clubs={clubs} gotoClub={setActiveClub} />;
      if (view === 'club_detail')
        return <AdminClubDetail club={activeClub} gotoList={() => setView('clubs_list')} />;
      if (view === 'affiliations')
        return <AdminFiltered clubs={clubs} kind="affiliation" gotoClub={setActiveClub} />;
      if (view === 'documents')
        return <AdminFiltered clubs={clubs} kind="docs" gotoClub={setActiveClub} />;
      if (view === 'cqi_admin')
        return <AdminFiltered clubs={clubs} kind="cqi" gotoClub={setActiveClub} />;
      if (view === 'fixtures')
        return (
          <AdminFixtures
            clubs={clubs}
            allSeries={allSeries}
            onCreateSeries={() => setShowCreateSeries(true)}
            onUpdateSeries={updateSeries}
            onDeleteSeries={deleteSeries}
            onDuplicateSeries={duplicateSeries}
            onSetReleased={setReleased}
            toast={toastShow}
          />
        );
      if (view === 'clearances')
        return (
          <AdminClearances
            clubs={clubs}
            players={players}
            clearanceRequests={clearanceRequests}
            onAdminOverride={adminOverrideClearance}
            toast={toastShow}
          />
        );
      if (view === 'facilities')
        return (
          <AdminFacilities
            jobs={jobs}
            setJobs={setJobs}
            clubs={clubs}
            toast={toastShow}
          />
        );
      if (view === 'vendors') return <AdminVendors toast={toastShow} />;
      if (view === 'projects')
        return (
          <AdminProjects projects={projects} setProjects={setProjects} toast={toastShow} />
        );
      if (view === 'financials')
        return (
          <AdminFinancials
            ledgerByClub={ledgerByClub}
            projects={projects}
            clubs={clubs}
            toast={toastShow}
          />
        );
      if (view === 'social')
        return (
          <AdminSocial postsByClub={socialPostsByClub} clubs={clubs} toast={toastShow} />
        );
    } else {
      const goto = (v) => setView(v);
      // Affiliation + Documents render in modals layered on top of Home (handled below).
      // The base content stays Home while those are open.
      if (view === 'home' || view === 'affiliation' || view === 'documents')
        return (
          <ClubHome
            club={activeClub}
            goto={goto}
            toast={toastShow}
            replayOnboarding={() => setShowOnboarding(true)}
          />
        );
      if (view === 'cqi')
        return (
          <CQIView
            club={activeClub}
            goto={goto}
            toast={toastShow}
            onSubmit={(score) => {
              updateClub({ cqi: score });
              setView('home');
            }}
          />
        );
      if (view === 'fixtures') {
        // Locked until affiliation is paid
        if (!activeClub.paid)
          return (
            <ComingSoon title="Fixtures & Venues" phase="02" unlocked={false} eta="Aug 2026" />
          );
        return (
          <ClubFixturesView
            club={activeClub}
            allSeries={allSeries}
            clubs={clubs}
            toast={toastShow}
          />
        );
      }
      if (view === 'players') {
        if (!activeClub.paid)
          return (
            <ComingSoon title="Player Registration" phase="03" unlocked={false} eta="Aug 2026" />
          );
        return (
          <ClubPlayersView
            club={activeClub}
            players={players}
            clearanceRequests={clearanceRequests}
            clubs={clubs}
            onOpenRegister={() => setShowRegisterPlayer(true)}
            onRequestClearance={(pid) => requestClearance(pid)}
            subs={playerSubs[clubId] || {}}
            onToggleSubs={(player, amount) => togglePlayerSubs(clubId, player, amount)}
            toast={toastShow}
          />
        );
      }
      if (view === 'clearances') {
        if (!activeClub.paid)
          return (
            <ComingSoon title="Player Clearances" phase="03" unlocked={false} eta="Aug 2026" />
          );
        return (
          <ClubClearancesView
            club={activeClub}
            players={players}
            clearanceRequests={clearanceRequests}
            clubs={clubs}
            onClearFees={clearFees}
            onClearMisconduct={clearMisconduct}
            onApproveClearance={approveClearance}
            toast={toastShow}
          />
        );
      }
      if (view === 'facilities') {
        return (
          <ClubFacilitiesView
            club={activeClub}
            jobs={jobs.filter((j) => j.facilityId === clubId)}
            onLogReport={(assetKey, assetLabel, issue) =>
              logClubReport(activeClub, assetKey, assetLabel, issue)
            }
            toast={toastShow}
          />
        );
      }
      if (view === 'vendors') {
        return <ClubVendorsView club={activeClub} toast={toastShow} />;
      }
      if (view === 'financials') {
        return (
          <ClubFinancialsView
            club={activeClub}
            entries={ledgerFor(clubId)}
            onAddEntry={(entry) => addLedgerEntry(clubId, entry)}
            onUpdateEntry={(id, patch) => updateLedgerEntry(clubId, id, patch)}
            onRemoveEntry={(id) => removeLedgerEntry(clubId, id)}
            toast={toastShow}
          />
        );
      }
      if (view === 'social') {
        return (
          <ClubSocialView
            club={activeClub}
            posts={socialPostsByClub[clubId] || []}
            onAddPost={(post) => addSocialPost(clubId, post)}
            onRemovePost={(postId) => removeSocialPost(clubId, postId)}
            toast={toastShow}
          />
        );
      }
    }
    return null;
  }

  return (
    <div data-screen-label={role === 'admin' ? 'Admin · ' + view : 'Club · ' + view}>
      {/* ─── Top header ─── */}
      <header className="app-header">
        <div className="h-logo">
          <img className="h-logo-img" src="lions-logo.svg" alt="DP World Lions" />
        </div>
        <div className="h-divider" />
        <span className="h-sub">Smart Club Integration · KZNCU &amp; EMCU</span>

        <div className="h-spacer" />

        {/* Role switch */}
        <div className="role-switch" title="Switch perspective">
          <button
            className={`role-btn ${role === 'admin' ? 'active' : ''}`}
            onClick={() => changeRole('admin')}
          >
            Admin · Lions
          </button>
          <button
            className={`role-btn club ${role === 'club' ? 'active' : ''}`}
            onClick={() => changeRole('club')}
          >
            Club
          </button>
        </div>

        {/* Club selector for club role */}
        {role === 'club' && (
          <select
            className="field-select"
            style={{
              height: 34,
              width: 'auto',
              minWidth: 180,
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.08)',
              paddingRight: 30,
              fontSize: 12.5,
            }}
            value={clubId}
            onChange={(e) => changeClub(e.target.value)}
          >
            {clubs.map((c) => (
              <option key={c.id} value={c.id} style={{ background: '#fff', color: '#000' }}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        <button
          className="h-switch"
          onClick={switchProfile}
          title="Log out and return to the login page"
        >
          <svg viewBox="0 0 16 16" fill="none">
            <path
              d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11 5l3 3-3 3M7 8h7"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Log out
        </button>

        <button className="h-bell">
          <Icon.Bell />
          <span className="h-bell-dot" />
        </button>

        <div className="h-user">
          <div
            className="h-avatar"
            style={{
              background: role === 'admin' ? 'var(--gold)' : 'var(--teal)',
              color: role === 'admin' ? 'var(--ink)' : '#fff',
            }}
          >
            {role === 'admin'
              ? 'NN'
              : activeClub.chair
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')}
          </div>
          <div>
            <div className="h-user-name">
              {role === 'admin' ? 'Niall Naidoo' : activeClub.chair}
            </div>
            <div className="h-user-role">
              {role === 'admin' ? 'Lions · Admin' : activeClub.name + ' · Chair'}
            </div>
          </div>
        </div>
      </header>

      {/* ─── Shell ─── */}
      <div className="shell">
        {/* Left nav */}
        <aside className="nav">
          <div className="nav-section">{role === 'admin' ? 'Cohort' : 'Integration journey'}</div>
          {nav.map((n) => (
            <button
              key={n.v}
              className={`nav-item ${view === n.v ? 'active' : ''}`}
              onClick={() => setView(n.v)}
            >
              <span className="ni-icon">
                <n.icon />
              </span>
              <span className="ni-label">{n.label}</span>
              {n.num && <span className={`ni-num ${n.num === 'NEW' ? 'new' : ''}`}>{n.num}</span>}
              {!n.num && n.dot && <span className={`ni-dot ${n.dot}`} />}
            </button>
          ))}

          {role === 'admin' && (
            <>
              <div className="nav-section" style={{ marginTop: 18 }}>
                Workspace
              </div>
              {[
                { v: '_settings', label: 'Settings', icon: Icon.Shield },
                { v: '_help', label: 'Help & support', icon: Icon.Mail },
              ].map((n) => (
                <button key={n.v} className="nav-item" onClick={() => {}}>
                  <span className="ni-icon">
                    <n.icon />
                  </span>
                  <span className="ni-label">{n.label}</span>
                </button>
              ))}
            </>
          )}

          <div className="nav-footer">
            <strong>Lions</strong> · Smart Club Integration
            <br />
            v 0.9.0 · KZNCU &amp; EMCU · 2026/27
            <br />
            <span style={{ color: 'var(--muted-3)' }}>Powered by Medicoach</span>
          </div>
        </aside>

        {/* Main content */}
        <main className={`main ${view === 'fixtures' ? 'fullbleed' : ''}`}>{renderMain()}</main>
      </div>

      {toastNode}

      {showOnboarding && role === 'club' && (
        <Onboarding
          club={activeClub}
          onClose={() => setShowOnboarding(false)}
          onComplete={() => {
            setOnboarded((o) => ({ ...o, [clubId]: true }));
            setShowOnboarding(false);
            toastShow('Welcome, ' + activeClub.chair.split(' ')[0] + " · let's get started");
          }}
          onStart={() => setView('affiliation')}
        />
      )}

      {/* ─── Task modals: Affiliation form & Compliance documents ─── */}
      {role === 'club' && view === 'affiliation' && (
        <TaskModal
          eyebrow={`Phase 01 · ${activeClub.name}`}
          title={
            <>
              2026/27 <em>Affiliation Form</em>
            </>
          }
          onClose={() => setView('home')}
        >
          <AffiliationForm
            club={activeClub}
            goto={(v) => setView(v)}
            toast={toastShow}
            onSubmit={(payload) => {
              updateClub({
                affiliation: 'complete',
                paid: true,
                exco: payload.exco,
                coaches: payload.coaches || [],
                ground: payload.ground || null,
                docs: { ...activeClub.docs, exco: true },
              });
              setView('home');
            }}
          />
        </TaskModal>
      )}

      {role === 'club' && view === 'documents' && (
        <TaskModal
          narrow
          eyebrow={`Compliance · ${activeClub.name}`}
          title={
            <>
              Required <em>compliance documents</em>
            </>
          }
          onClose={() => setView('home')}
        >
          <DocumentsView
            club={activeClub}
            goto={(v) => setView(v)}
            toast={toastShow}
            onUpload={uploadDoc}
            onSaveExco={saveExco}
          />
        </TaskModal>
      )}

      {role === 'admin' && showCreateSeries && (
        <TaskModal
          eyebrow="Fixtures · KZNCU & EMCU"
          title={
            <>
              Create a new <em>series</em>
            </>
          }
          onClose={() => setShowCreateSeries(false)}
        >
          <CreateSeriesForm
            clubs={clubs}
            onCreate={(s) => {
              setAllSeries((prev) => [...prev, s]);
              toastShow(`${s.name} created · ${s.fixtures.length} fixtures generated`);
            }}
            onClose={() => setShowCreateSeries(false)}
          />
        </TaskModal>
      )}

      {role === 'club' && showRegisterPlayer && (
        <TaskModal
          eyebrow={`Phase 03 · ${activeClub.name}`}
          title={
            <>
              Register a new <em>player</em>
            </>
          }
          sub="KZNCU & EMCU 2026/27 — fields mirror the official Union registration form."
          onClose={() => setShowRegisterPlayer(false)}
        >
          <RegisterPlayerForm
            club={activeClub}
            toast={toastShow}
            onCancel={() => setShowRegisterPlayer(false)}
            onSubmit={registerPlayer}
          />
        </TaskModal>
      )}
    </div>
  );
}

/* ─── Filtered admin views (Affiliation / Docs / CQI) ─── */
function AdminFiltered({ clubs, kind, gotoClub }) {
  const titles = {
    affiliation: {
      t: 'Affiliation tracker',
      crumb: 'Affiliations',
      desc: 'Track which clubs have completed and paid the 2026/27 union affiliation form.',
    },
    docs: {
      t: 'Compliance docs tracker',
      crumb: 'Compliance Docs',
      desc: 'Monitor uploads of Constitution, AGM Minutes, Financial Statements and Exco Reps Listed.',
    },
    cqi: {
      t: 'CQI submission tracker',
      crumb: 'CQI Submissions',
      desc: 'Real-time view of CQI self-assessments returned by clubs across all five categories.',
    },
  }[kind];

  return (
    <div>
      <div className="page-head">
        <div className="ph-left">
          <div className="ph-crumb">Lions · Admin Console / {titles.crumb}</div>
          <h1 className="ph-title">{titles.t}</h1>
          <p className="ph-desc">{titles.desc}</p>
        </div>
        <div className="ph-actions">
          <Btn tone="outline" size="sm" icon={Icon.Mail}>
            Send reminder to outstanding
          </Btn>
          <Btn tone="ink" size="sm" icon={Icon.Download}>
            Export
          </Btn>
        </div>
      </div>

      <div className="tbl-w">
        <table className="tbl">
          <thead>
            <tr>
              <th>Club</th>
              <th>Chair</th>
              {kind === 'affiliation' && (
                <>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Submitted</th>
                </>
              )}
              {kind === 'docs' && (
                <>
                  <th>Constitution</th>
                  <th>AGM Minutes</th>
                  <th>Financials</th>
                  <th>Exco Reps</th>
                  <th>Progress</th>
                </>
              )}
              {kind === 'cqi' && (
                <>
                  <th>Score</th>
                  <th>Band</th>
                  <th>Submitted</th>
                  <th>Players</th>
                </>
              )}
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {clubs.map((c) => {
              return (
                <tr key={c.id} className="clickable" onClick={() => gotoClub(c.id)}>
                  <td>
                    <ClubNameCell club={c} />
                  </td>
                  <td>
                    <span style={{ fontSize: 12.5 }}>{c.chair}</span>
                  </td>

                  {kind === 'affiliation' && (
                    <>
                      <td>{affPill(c.affiliation)}</td>
                      <td>
                        {c.paid ? (
                          <Pill tone="teal" dot>
                            Paid · R 4,500
                          </Pill>
                        ) : (
                          <Pill tone="coral" dot>
                            Outstanding
                          </Pill>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: 11.5,
                            color: 'var(--muted)',
                            fontFamily: "'Montserrat',sans-serif",
                          }}
                        >
                          {c.paid
                            ? '12 May 2026'
                            : c.affiliation === 'in_progress'
                              ? 'Draft saved'
                              : '—'}
                        </span>
                      </td>
                    </>
                  )}

                  {kind === 'docs' && (
                    <>
                      {REQUIRED_DOCS.map((d) => (
                        <td key={d.key}>
                          {c.docs[d.key] ? (
                            <Pill tone="teal" dot>
                              Uploaded
                            </Pill>
                          ) : (
                            <Pill tone="coral" dot>
                              Missing
                            </Pill>
                          )}
                        </td>
                      ))}
                      <td>
                        <ProgChip
                          value={docCompletion(c)}
                          tone={
                            docCompletion(c) === 100
                              ? 'teal'
                              : docCompletion(c) > 0
                                ? 'gold'
                                : 'coral'
                          }
                        />
                      </td>
                    </>
                  )}

                  {kind === 'cqi' && (
                    <>
                      <td>
                        <span
                          style={{
                            fontFamily: "'Montserrat',sans-serif",
                            fontSize: 15,
                            fontWeight: 800,
                            color:
                              c.cqi >= 80
                                ? 'var(--teal-deep)'
                                : c.cqi >= 65
                                  ? 'var(--ink)'
                                  : c.cqi > 0
                                    ? '#076B36'
                                    : 'var(--muted-2)',
                          }}
                        >
                          {c.cqi > 0 ? c.cqi.toFixed(1) : '—'}
                        </span>
                      </td>
                      <td>
                        <Pill tone={cqiBand(c.cqi).tone}>{cqiBand(c.cqi).label}</Pill>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: 11.5,
                            color: 'var(--muted)',
                            fontFamily: "'Montserrat',sans-serif",
                          }}
                        >
                          {c.cqi > 0 ? '16 May 2026' : '—'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 12 }}>
                          {c.players || '—'}
                        </span>
                      </td>
                    </>
                  )}

                  <td style={{ textAlign: 'right', paddingRight: 18 }}>
                    <Icon.Arrow />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Coming soon placeholder for non-MVP phase modules ─── */
function ComingSoon({ title, phase, unlocked, eta }) {
  const headline = unlocked ? 'Coming soon' : 'This phase unlocks after affiliation';
  const detailDesc = unlocked
    ? `Phase ${phase} of the Smart Club Integration journey. Your affiliation is in — this module is in final development and will arrive shortly.`
    : `Phase ${phase} of the Smart Club Integration journey. Activates automatically once your club has completed affiliation and uploaded compliance documents.`;
  const detailBody = unlocked
    ? "We're putting the finishing touches on this module. You'll be notified by email and on your home page the moment it's ready — no action needed from your side."
    : 'Once your club has been confirmed by the Union office, this module activates with live data — fixtures, player registration, scoring, and clinical management — all sourced from the Medicoach platform.';
  const ring = unlocked ? 'var(--teal)' : 'var(--paper3)';
  const ringBg = unlocked ? 'var(--teal-pale)' : 'var(--paper)';
  const ringFg = unlocked ? 'var(--teal-deep)' : 'var(--muted-2)';

  return (
    <div>
      <div className="page-head">
        <div className="ph-left">
          <div className="ph-crumb">
            Phase {phase}{' '}
            {unlocked && (
              <>
                · <span style={{ color: 'var(--teal-deep)' }}>Unlocked</span>
              </>
            )}
          </div>
          <h1 className="ph-title">{title}</h1>
          <p className="ph-desc">{detailDesc}</p>
        </div>
        {unlocked && (
          <div className="ph-actions">
            <span className="pill pill-teal" style={{ padding: '5px 12px' }}>
              <span className="sdot teal" />
              Available {eta || 'Q3 2026'}
            </span>
          </div>
        )}
      </div>

      <div
        style={{
          background: 'var(--white)',
          border: '1px solid var(--line)',
          borderRadius: 14,
          padding: '60px 40px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            margin: '0 auto 20px',
            borderRadius: '50%',
            background: ringBg,
            border: `2px ${unlocked ? 'solid' : 'dashed'} ${ring}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: ringFg,
          }}
        >
          {unlocked ? (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M12 7v5l3 2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M12 7v6M12 16v.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
        <div
          style={{
            fontFamily: "'Montserrat',sans-serif",
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            fontSize: 13,
            color: 'var(--muted)',
            maxWidth: 460,
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          {detailBody}
        </div>
        {unlocked && (
          <div style={{ marginTop: 22, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Btn tone="outline" size="sm" icon={Icon.Bell}>
              Notify me when ready
            </Btn>
            <Btn tone="ghost" size="sm" icon={Icon.Mail}>
              Talk to the union office
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Embedded Fixture Automation Engine ─── */
function FixtureEngineEmbed({ role, club }) {
  const [filter, setFilter] = useState('all'); // for admin: filter dropdown
  return (
    <>
      <div className="embed-bar">
        <span
          style={{
            fontFamily: "'Montserrat',sans-serif",
            fontSize: 10,
            fontWeight: 700,
            color: '#fff',
            background: 'var(--ink)',
            padding: '3px 9px',
            borderRadius: 10,
            letterSpacing: '0.1em',
          }}
        >
          PHASE 02
        </span>
        <div>
          <div className="crumb">
            {role === 'admin'
              ? 'Lions · Admin Console / Fixtures & Venues'
              : `Club Portal · ${club.name} / Fixtures`}
          </div>
          <div className="title">
            {role === 'admin'
              ? 'Provincial fixture automation & venue allocation'
              : 'Your league fixtures & venue bookings'}
          </div>
        </div>
        <div className="spacer" />
        {role === 'admin' && (
          <select
            className="field-select"
            style={{ height: 30, width: 180, fontSize: 12 }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All leagues</option>
            <option value="prem">Premier League</option>
            <option value="prom">Promotion League</option>
            <option value="women">Premier Women</option>
            <option value="vets">Veterans League</option>
          </select>
        )}
        <Btn tone="outline" size="sm" icon={Icon.Download}>
          Export schedule
        </Btn>
        <Btn
          tone="ink"
          size="sm"
          icon={Icon.Arrow}
          onClick={() => window.open('fixture-automation-engine.html', '_blank')}
        >
          Open full engine
        </Btn>
      </div>
      <iframe
        className="embed-frame"
        src="fixture-automation-engine.html"
        title="Medicoach Fixture Automation Engine"
        onLoad={(e) => {
          try {
            const doc = e.target.contentDocument;
            const css = doc.createElement('style');
            css.textContent = `
              .header{display:none !important}
              .shell{min-height:100vh !important}
              .panel{top:0 !important;height:100vh !important}
            `;
            doc.head.appendChild(css);
          } catch (err) {
            /* cross-origin or other */
          }
        }}
      />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
