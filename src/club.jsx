/* ─── Club-side views ─── */

import { useState, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Icon,
  Pill,
  Btn,
  Card,
  KPI,
  ClubNameCell,
  YN,
  NumSlider,
  Choice,
  MoneyInput,
  CountUp,
  cqiBand,
  scoreCQI,
} from './atoms.jsx';
import {
  DISTRICTS,
  COACHING_LEVELS,
  REQUIRED_DOCS,
  CQI_STRUCTURE,
  HANDS,
  BATTING_TYPES,
  BOWLER_TYPES,
  docCompletion,
  overallProgress,
  fixtureCost,
  isClearanceOverdue,
  clearanceDaysRemaining,
  FACILITY_ASSETS,
  FACILITY_OWNERSHIP,
  ASSET_CATEGORIES,
  conditionWord,
  conditionTone,
  severityTone,
  VENDORS,
  VENDOR_CATEGORIES,
  VENDOR_CATEGORY_GROUPS,
  VENDOR_SERVICES,
  BEE_LEVELS,
  vendorStatusTone,
  CLUB_COST_CATEGORIES,
  CLUB_COST_FREQUENCIES,
  CLUB_INCOME_CATEGORIES,
  CLUB_INCOME_GROUPS,
  CLUB_PRIMARY_INCOME_GROUPS,
  SUBSCRIPTION_DEFAULT_ZAR,
  SAMPLE_PLAYERS,
} from './data.jsx';
import { AssessmentEditor, AddAssetModal, AssetCard, ConditionStars } from './admin.jsx';

/* ─── Ground map (Leaflet + OpenStreetMap + Nominatim geocoding) ─── */
function GroundMap({ query, onResolved }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Initialise the map once
  useEffect(() => {
    if (mapRef.current || !elRef.current || !L) return;
    const map = L.map(elRef.current, {
      scrollWheelZoom: false,
      attributionControl: true,
    }).setView([-29.85, 31.02], 11); // Durban default
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);
    mapRef.current = map;
  }, []);

  // Geocode + drop marker whenever the query changes
  useEffect(() => {
    if (!query || !mapRef.current || !L) return;
    const ctrl = new AbortController();
    setLoading(true);
    setNotFound(false);
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      {
        signal: ctrl.signal,
        headers: { 'Accept-Language': 'en' },
      }
    )
      .then((r) => r.json())
      .then((results) => {
        setLoading(false);
        if (!results || !results.length) {
          setCoords(null);
          setNotFound(true);
          return;
        }
        const r = results[0];
        const lat = parseFloat(r.lat),
          lon = parseFloat(r.lon);
        mapRef.current.flyTo([lat, lon], 16, { duration: 0.8 });
        if (markerRef.current) markerRef.current.remove();
        const icon = L.divIcon({
          className: '',
          html: '<div class="ground-marker"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        markerRef.current = L.marker([lat, lon], { icon }).addTo(mapRef.current);
        markerRef.current
          .bindPopup(`<strong>${r.display_name.split(',').slice(0, 2).join(',')}</strong>`)
          .openPopup();
        setNotFound(false);
        setCoords({ lat, lon, name: r.display_name });
        onResolved?.({ lat, lon, name: r.display_name });
      })
      .catch((e) => {
        setLoading(false);
        if (e.name !== 'AbortError') {
          setCoords(null);
          setNotFound(true);
        }
      });
    return () => ctrl.abort();
  }, [query]);

  return (
    <div className="ground-map-frame">
      <div ref={elRef} className="ground-map" />
      {loading && (
        <div className="ground-map-loading">
          <span className="spinner" />
          Finding location…
        </div>
      )}
      {!loading && coords && !notFound && (
        <div className="ground-coords">
          <Icon.Field />
          {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
        </div>
      )}
      {!loading && notFound && (
        <div className="ground-coords" style={{ background: 'var(--ink)' }}>
          <Icon.Alert />
          Address not found — refine your search
        </div>
      )}
    </div>
  );
}

/* ─── Club Home: phase tracker + onboarding next step ─── */
function ClubHome({ club, goto, toast, replayOnboarding }) {
  const dc = docCompletion(club);
  const op = overallProgress(club);
  const band = cqiBand(club.cqi);

  const phases = [
    {
      n: '01',
      t: 'Affiliation',
      key: 'affiliation',
      done: club.paid,
      action: 'Open form',
      target: 'affiliation',
    },
    {
      n: '02',
      t: 'Fixtures',
      key: 'fixtures',
      done: club.affiliation === 'complete',
      action: 'View leagues',
      target: 'fixtures',
      lock: !club.paid,
    },
    {
      n: '03',
      t: 'Compliance & CQI',
      key: 'compliance',
      done: dc === 100 && club.cqi > 0,
      action: 'Continue',
      target: 'documents',
    },
  ];

  // Find next action
  const next = phases.find((p) => !p.done && !p.lock);

  return (
    <div>
      {/* Aspirational hero banner */}
      <div className="hero-banner" style={{ backgroundImage: "url('players/lions-hero.jpg')" }}>
        <div className="hero-content">
          <div className="hero-eyebrow">DP World Lions · 2026/27 Season</div>
          <h2 className="hero-title">
            From your club to the <em>Lions</em>.
          </h2>
          <p className="hero-sub">
            Affiliate, register and integrate — be part of the same ecosystem that powers our
            provincial heroes.
          </p>
        </div>
        <div className="hero-attrib">
          <strong>DP World Lions</strong> · Senior squad
        </div>
      </div>

      <div className="page-head">
        <div className="ph-left">
          <div className="ph-crumb">Club Portal · {club.name}</div>
          <h1 className="ph-title">
            Good morning, <em>{club.chair.split(' ')[0]}</em>
          </h1>
          <p className="ph-desc">
            Your 2026/27 KZNCU &amp; EMCU club integration sits at{' '}
            <strong style={{ color: 'var(--ink)' }}>{op}% complete</strong>.{' '}
            {next
              ? `Next up — ${next.t.toLowerCase()}.`
              : 'All required steps are done — well batted.'}
          </p>
        </div>
        <div className="ph-actions">
          <Btn tone="outline" size="sm" onClick={replayOnboarding}>
            Walkthrough
          </Btn>
          {next && (
            <Btn tone="ink" icon={Icon.Arrow} onClick={() => next.target && goto(next.target)}>
              Continue · {next.t}
            </Btn>
          )}
        </div>
      </div>

      <div className="deadline">
        <div className="deadline-icon">
          <Icon.Clock />
        </div>
        <div className="deadline-text">
          <strong>Submission deadline · 22 June 2026.</strong> All three forms must reach the Union
          office before this date. <span className="days">31 days remaining</span>.
        </div>
      </div>

      {/* Phase tracker — clickable */}
      <Card
        title="Your integration journey"
        sub="Three phases on the Medicoach Smart Club platform"
      >
        <div className="phase-track" style={{ borderRadius: 0, border: 'none' }}>
          {phases.map((p) => (
            <div
              key={p.n}
              className={`phase-step ${p.done ? 'done' : ''} ${next && next.n === p.n ? 'active' : ''}`}
              onClick={() => p.target && goto(p.target)}
              style={{ cursor: p.target ? 'pointer' : 'default', opacity: p.lock ? 0.55 : 1 }}
            >
              <div className="ps-n">PHASE {p.n}</div>
              <div className="ps-t">{p.t}</div>
              <div className="ps-l">
                {p.done ? 'Complete' : p.lock ? 'Locked — finish phase 1 first' : 'Pending'}
              </div>
              {p.done && (
                <div className="ps-tick">
                  <Icon.Check />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginTop: 16 }}>
        <Card title="Outstanding items" sub="Action required before 22 June 2026">
          <div className="stack" style={{ gap: 8 }}>
            <button
              className="row"
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 14px',
                border: '1px solid ' + (club.paid ? 'rgba(15,77,46,0.25)' : 'var(--line)'),
                background: club.paid ? 'var(--green-pale)' : 'var(--white)',
                borderRadius: 8,
                gap: 12,
              }}
              onClick={() => goto('affiliation')}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: club.paid ? 'var(--green)' : 'var(--coral-pale)',
                  color: club.paid ? '#fff' : 'var(--coral)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: club.paid ? '0 3px 10px rgba(15,77,46,0.25)' : 'none',
                }}
              >
                {club.paid ? <Icon.Check /> : <Icon.Form />}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "'Montserrat',sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    color: club.paid ? 'var(--green)' : 'var(--ink)',
                  }}
                >
                  Affiliation Form &amp; payment
                </div>
                <div
                  style={{ fontSize: 11.5, color: club.paid ? 'var(--green-mid)' : 'var(--muted)' }}
                >
                  {club.paid
                    ? 'Submitted &amp; paid · R 4,500 · tap to view'
                    : 'Complete the 2026/27 KZNCU & EMCU affiliation form and pay the union fee.'}
                </div>
              </div>
              {club.paid ? (
                <Pill tone="teal" dot>
                  Completed
                </Pill>
              ) : (
                <Pill tone="coral" dot>
                  Required
                </Pill>
              )}
            </button>
            {dc < 100 && (
              <button
                className="row"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 14px',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  gap: 12,
                }}
                onClick={() => goto('documents')}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(31,170,92,0.18)',
                    color: '#076B36',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon.Upload />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 13, fontWeight: 700 }}
                  >
                    Compliance documents
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                    Upload Constitution, AGM Minutes, Financials and Exco Reps. (
                    {4 - Object.values(club.docs).filter((v) => v).length} remaining)
                  </div>
                </div>
                <Pill tone="gold" dot>
                  In progress
                </Pill>
              </button>
            )}
            {club.cqi === 0 && (
              <button
                className="row"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 14px',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  gap: 12,
                }}
                onClick={() => goto('cqi')}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(10,15,20,0.08)',
                    color: 'var(--navy)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon.Star />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 13, fontWeight: 700 }}
                  >
                    CQI self-assessment
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                    Complete the Club Quality Index questionnaire across 5 categories.
                  </div>
                </div>
                <Pill tone="navy" dot>
                  Pending
                </Pill>
              </button>
            )}
            {club.paid && dc === 100 && club.cqi > 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)' }}>
                Everything submitted. Your club has been forwarded to the Lions administrators for
                review.
              </div>
            )}
          </div>
        </Card>

        <Card title="Your club at a glance">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 18px' }}>
            {[
              ['CQI score', club.cqi > 0 ? club.cqi.toFixed(1) : '—'],
              ['Members', club.players || 0],
              ['Senior teams', club.teams],
              ['Junior teams', club.juniors],
              ['Sub-union', club.sub],
              ['Chair', club.chair.split(' ')[0]],
            ].map(([k, v], i) => (
              <div key={i}>
                <div
                  style={{
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--muted-2)',
                    marginBottom: 3,
                  }}
                >
                  {k}
                </div>
                <div
                  style={{
                    fontFamily: "'Montserrat',sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--ink)',
                  }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>
          <div className="hr" />
          <Btn tone="outline" icon={Icon.Eye} style={{ width: '100%', justifyContent: 'center' }}>
            Visit Athlete Management System
          </Btn>
        </Card>
      </div>
    </div>
  );
}

/* ─── Phase 1 · Affiliation form ─── */
const EMPTY_MEMBER = { name: '', cell: '', email: '', gender: '', race: '' };
const EMPTY_COACH = {
  name: '',
  body: 'CSA',
  level: 'Level 2',
  status: 'Completed',
  cell: '',
  email: '',
  teams: [],
};

function AffiliationForm({ club, goto, toast, onSubmit }) {
  const [data, setData] = useState(() => {
    // Pre-fill exco from club.exco (single source of truth shared with the exco roster doc)
    const ex = club.exco || {};
    const seed = (key, fallback = {}) => ({
      name: ex[key]?.name ?? fallback.name ?? '',
      cell: ex[key]?.cell ?? fallback.cell ?? '',
      email: ex[key]?.email ?? fallback.email ?? '',
      gender: ex[key]?.gender ?? fallback.gender ?? '',
      race: ex[key]?.race ?? fallback.race ?? '',
    });
    const chairSeed = seed('chair', {
      name: club.chair,
      cell: '083 786 4098',
      email: 'chair@' + club.id + '.co.za',
      gender: 'Male',
      race: 'Indian',
    });
    // Additional members are now an array (chair/sec/tre/vc remain fixed required slots)
    const stored = Array.isArray(ex.additionalMembers)
      ? ex.additionalMembers
      : ex.am?.name
        ? [ex.am]
        : [];
    const ground = club.ground || {};
    return {
      clubName: club.name,
      district: 'Ethekwini Metro Cricket Union',
      township: 'no',
      chairName: chairSeed.name,
      chairCell: chairSeed.cell,
      chairEmail: chairSeed.email,
      chairGender: chairSeed.gender,
      chairRace: chairSeed.race,
      secName: seed('sec').name,
      secCell: seed('sec').cell,
      secEmail: seed('sec').email,
      secGender: seed('sec').gender,
      secRace: seed('sec').race,
      treName: seed('tre').name,
      treCell: seed('tre').cell,
      treEmail: seed('tre').email,
      treGender: seed('tre').gender,
      treRace: seed('tre').race,
      vcName: seed('vc').name,
      vcCell: seed('vc').cell,
      vcEmail: seed('vc').email,
      vcGender: seed('vc').gender,
      vcRace: seed('vc').race,
      additionalMembers: stored.length ? stored : [{ ...EMPTY_MEMBER }],
      leagues: {
        premier: true,
        promotion: false,
        premierWomen: false,
        promotionWomen: false,
        veterans: false,
        emcuD1: false,
      },
      coaches:
        club.coaches && club.coaches.length
          ? club.coaches
          : [{ ...EMPTY_COACH, teams: ['premier'] }],
      // Home ground / venue
      groundVenue: ground.venue || '',
      groundAddress: ground.address || '',
      groundMapQuery: ground.mapQuery || 'Durban, KwaZulu-Natal, South Africa',
    };
  });
  const [step, setStep] = useState(1);

  function updateMember(idx, field, val) {
    setData((d) => ({
      ...d,
      additionalMembers: d.additionalMembers.map((m, i) =>
        i === idx ? { ...m, [field]: val } : m
      ),
    }));
  }
  function addMember() {
    setData((d) => ({ ...d, additionalMembers: [...d.additionalMembers, { ...EMPTY_MEMBER }] }));
  }
  function removeMember(idx) {
    setData((d) => ({ ...d, additionalMembers: d.additionalMembers.filter((_, i) => i !== idx) }));
  }

  function updateCoach(idx, field, val) {
    setData((d) => ({
      ...d,
      coaches: d.coaches.map((c, i) => (i === idx ? { ...c, [field]: val } : c)),
    }));
  }
  function toggleCoachTeam(idx, team) {
    setData((d) => ({
      ...d,
      coaches: d.coaches.map((c, i) => {
        if (i !== idx) return c;
        const has = c.teams.includes(team);
        return { ...c, teams: has ? c.teams.filter((t) => t !== team) : [...c.teams, team] };
      }),
    }));
  }
  function addCoach() {
    setData((d) => ({ ...d, coaches: [...d.coaches, { ...EMPTY_COACH }] }));
  }
  function removeCoach(idx) {
    setData((d) => ({ ...d, coaches: d.coaches.filter((_, i) => i !== idx) }));
  }

  function update(k, v) {
    setData((d) => ({ ...d, [k]: v }));
  }
  function updateLeague(k) {
    setData((d) => ({ ...d, leagues: { ...d.leagues, [k]: !d.leagues[k] } }));
  }

  function dropGroundPin() {
    setData((d) => {
      const q = [d.groundVenue, d.groundAddress].filter(Boolean).join(', ');
      return { ...d, groundMapQuery: q || 'Durban, KwaZulu-Natal, South Africa' };
    });
  }

  function getGroundPayload() {
    return {
      venue: data.groundVenue,
      address: data.groundAddress,
      mapQuery: data.groundMapQuery,
    };
  }

  function getExcoPayload() {
    const pick = (p) => ({
      name: data[p + 'Name'],
      cell: data[p + 'Cell'],
      email: data[p + 'Email'],
      gender: data[p + 'Gender'],
      race: data[p + 'Race'],
    });
    return {
      chair: pick('chair'),
      sec: pick('sec'),
      tre: pick('tre'),
      vc: pick('vc'),
      additionalMembers: data.additionalMembers.filter((m) => m.name),
    };
  }
  function getCoachesPayload() {
    return data.coaches.filter((c) => c.name);
  }

  const valid = data.clubName && data.chairName && data.chairCell && data.chairEmail;
  const viewOnly = club.paid; // form locks once payment has been received

  // Live summary values for the sidebar
  const filledBearers = [
    data.chairName,
    data.secName,
    data.treName,
    data.vcName,
    ...data.additionalMembers.map((m) => m.name),
  ].filter(Boolean).length;
  const leaguesCount = Object.values(data.leagues).filter(Boolean).length;
  const coachesCount = data.coaches.filter((c) => c.name).length;
  const stepLabel = ['Club Details', 'Executive Committee', 'Leagues & Coaches', 'Review & Pay'][
    step - 1
  ];

  return (
    <div className={viewOnly ? 'aff-locked' : ''}>
      <div className="page-head">
        <div className="ph-left">
          <div className="ph-crumb">
            <a onClick={() => goto('home')}>Home</a> &nbsp;/&nbsp; Affiliation
          </div>
          <h1 className="ph-title">
            2026/27 <em>Affiliation Form</em>
          </h1>
          <p className="ph-desc">
            KZNCU &amp; EMCU League · Club Registration. All fields marked{' '}
            <span style={{ color: 'var(--coral)' }}>*</span> are required. The digital form mirrors
            the official Excel template — your inputs are saved as you go.
          </p>
        </div>
      </div>

      {viewOnly && (
        <div className="aff-submitted-banner">
          <div className="aff-submitted-icon">
            <Icon.Check />
          </div>
          <div className="aff-submitted-text">
            <div className="aff-submitted-title">Affiliation submitted &amp; paid</div>
            <div className="aff-submitted-sub">
              R 4,500 received · Confirmed by Lions office · This form is locked, contact the Union
              office to request an amendment.
            </div>
          </div>
          <Pill tone="teal" dot>
            Completed
          </Pill>
        </div>
      )}

      <div className="aff-layout">
        <div className="aff-main">
          <fieldset disabled={viewOnly} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
            {/* step strip */}
            <div
              style={{
                display: 'flex',
                gap: 0,
                marginBottom: 18,
                background: 'var(--white)',
                borderRadius: 10,
                border: '1px solid var(--line)',
                overflow: 'hidden',
              }}
            >
              {['Club Details', 'Executive Committee', 'Leagues & Coaches', 'Review & Pay'].map(
                (s, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i + 1)}
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      textAlign: 'left',
                      borderRight: i < 3 ? '1px solid var(--line)' : 'none',
                      background:
                        step === i + 1
                          ? 'var(--ink)'
                          : i + 1 < step
                            ? 'var(--teal-pale)'
                            : 'var(--white)',
                      color:
                        step === i + 1 ? '#fff' : i + 1 < step ? 'var(--teal-deep)' : 'var(--ink)',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Montserrat',sans-serif",
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        opacity: 0.65,
                      }}
                    >
                      STEP {i + 1}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Montserrat',sans-serif",
                        fontSize: 13,
                        fontWeight: 700,
                        marginTop: 2,
                      }}
                    >
                      {s}
                    </div>
                  </button>
                )
              )}
            </div>

            {step === 1 && (
              <Card title="Club Details" sub="Identifies the club and its district affiliation">
                <div className="field">
                  <div className="field-label">
                    Club Name <span className="req">*</span>
                  </div>
                  <input
                    className="field-input"
                    value={data.clubName}
                    onChange={(e) => update('clubName', e.target.value)}
                  />
                </div>
                <div className="field-grid-2">
                  <div className="field">
                    <div className="field-label">
                      Municipal District / Sub-Union <span className="req">*</span>
                    </div>
                    <select
                      className="field-select"
                      value={data.district}
                      onChange={(e) => update('district', e.target.value)}
                    >
                      {DISTRICTS.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <div className="field-label">
                      Located in a township area? <span className="req">*</span>
                    </div>
                    <div style={{ height: 42, display: 'flex', alignItems: 'center' }}>
                      <YN
                        value={data.township === 'yes'}
                        onChange={(v) => update('township', v ? 'yes' : 'no')}
                      />
                    </div>
                  </div>
                </div>

                <div className="hr" />

                {/* ─── Home ground locator ─── */}
                <div className="ground-section">
                  <div className="ground-section-head">
                    <div className="ground-section-title">
                      <Icon.Field /> Home ground
                    </div>
                    <div className="ground-section-sub">
                      Pin your ground location so fixtures, venue allocations and travel times are
                      accurate. Type the venue and address, then drop the pin.
                    </div>
                  </div>

                  <div className="field-grid-2">
                    <div className="field" style={{ marginBottom: 0 }}>
                      <div className="field-label">
                        Venue Name <span className="req">*</span>
                      </div>
                      <input
                        className="field-input"
                        placeholder="e.g. Berea Rovers Oval"
                        value={data.groundVenue}
                        onChange={(e) => update('groundVenue', e.target.value)}
                        onBlur={dropGroundPin}
                      />
                    </div>
                    <div className="field" style={{ marginBottom: 0 }}>
                      <div className="field-label">
                        Address <span className="req">*</span>
                      </div>
                      <input
                        className="field-input"
                        placeholder="Street, suburb, city"
                        value={data.groundAddress}
                        onChange={(e) => update('groundAddress', e.target.value)}
                        onBlur={dropGroundPin}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            dropGroundPin();
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="ground-map-card">
                    <div className="ground-map-head">
                      <div className={`ground-status ${data.groundAddress ? 'confirmed' : ''}`}>
                        <span className="dot" />
                        {data.groundAddress ? 'Pin dropped' : 'Awaiting address'}
                      </div>
                      <div className="ground-meta">
                        {data.groundVenue ||
                          (data.groundAddress ? data.groundAddress : 'Type the venue name above')}
                      </div>
                      <Btn tone="outline" size="sm" icon={Icon.Field} onClick={dropGroundPin}>
                        Drop pin
                      </Btn>
                    </div>
                    <GroundMap
                      query={data.groundMapQuery}
                      onResolved={(c) => update('groundCoords', c)}
                    />
                  </div>
                </div>
              </Card>
            )}

            {step === 2 && (
              <Card
                title="Executive Committee Office Bearers"
                sub="Provide contact, gender &amp; race for each office bearer"
              >
                {[
                  { prefix: 'chair', title: 'Chairperson', req: true },
                  { prefix: 'sec', title: 'Secretary', req: true },
                  { prefix: 'tre', title: 'Treasurer', req: true },
                  { prefix: 'vc', title: 'Vice-Chair', req: false },
                ].map((role) => (
                  <div
                    key={role.prefix}
                    style={{
                      padding: '14px 16px',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      marginBottom: 10,
                      background: 'var(--paper)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Montserrat',sans-serif",
                          fontSize: 13,
                          fontWeight: 700,
                          color: 'var(--ink)',
                        }}
                      >
                        {role.title}
                        {role.req && (
                          <span style={{ color: 'var(--coral)', marginLeft: 4 }}>*</span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 10.5,
                          color: 'var(--muted-2)',
                          fontFamily: "'Montserrat',sans-serif",
                        }}
                      >
                        {role.prefix.toUpperCase()}
                      </div>
                    </div>
                    <div className="field-grid-3">
                      <div className="field" style={{ marginBottom: 8 }}>
                        <div className="field-label">Full Name</div>
                        <input
                          className="field-input"
                          value={data[role.prefix + 'Name'] || ''}
                          onChange={(e) => update(role.prefix + 'Name', e.target.value)}
                          placeholder="Name &amp; surname"
                        />
                      </div>
                      <div className="field" style={{ marginBottom: 8 }}>
                        <div className="field-label">Cell Number</div>
                        <input
                          className="field-input"
                          value={data[role.prefix + 'Cell'] || ''}
                          onChange={(e) => update(role.prefix + 'Cell', e.target.value)}
                          placeholder="0XX XXX XXXX"
                        />
                      </div>
                      <div className="field" style={{ marginBottom: 8 }}>
                        <div className="field-label">Email</div>
                        <input
                          className="field-input"
                          value={data[role.prefix + 'Email'] || ''}
                          onChange={(e) => update(role.prefix + 'Email', e.target.value)}
                          placeholder="name@club.co.za"
                        />
                      </div>
                    </div>
                    <div className="field-grid-2">
                      <div className="field" style={{ marginBottom: 0 }}>
                        <div className="field-label">Gender</div>
                        <select
                          className="field-select"
                          value={data[role.prefix + 'Gender'] || ''}
                          onChange={(e) => update(role.prefix + 'Gender', e.target.value)}
                        >
                          <option value="">Select…</option>
                          <option>Female</option>
                          <option>Male</option>
                          <option>Non-binary</option>
                        </select>
                      </div>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <div className="field-label">Race</div>
                        <select
                          className="field-select"
                          value={data[role.prefix + 'Race'] || ''}
                          onChange={(e) => update(role.prefix + 'Race', e.target.value)}
                        >
                          <option value="">Select…</option>
                          <option>Black African</option>
                          <option>Coloured</option>
                          <option>Indian</option>
                          <option>White</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Additional members — dynamic array */}
                <div
                  style={{
                    marginTop: 18,
                    marginBottom: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "'Montserrat',sans-serif",
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--ink)',
                      }}
                    >
                      Additional Members
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
                      Add any further exco members — office bearers, committee reps, etc.
                    </div>
                  </div>
                  <Btn tone="outline" size="sm" icon={Icon.Plus} onClick={addMember}>
                    Add another member
                  </Btn>
                </div>

                {data.additionalMembers.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '14px 16px',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      marginBottom: 10,
                      background: 'var(--paper)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Montserrat',sans-serif",
                          fontSize: 13,
                          fontWeight: 700,
                          color: 'var(--ink)',
                        }}
                      >
                        Additional Member{' '}
                        <span style={{ color: 'var(--muted-2)', fontWeight: 500 }}>#{idx + 1}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            fontSize: 10.5,
                            color: 'var(--muted-2)',
                            fontFamily: "'Montserrat',sans-serif",
                          }}
                        >
                          AM-{idx + 1}
                        </div>
                        {data.additionalMembers.length > 1 && (
                          <Btn tone="ghost" size="sm" onClick={() => removeMember(idx)}>
                            Remove
                          </Btn>
                        )}
                      </div>
                    </div>
                    <div className="field-grid-3">
                      <div className="field" style={{ marginBottom: 8 }}>
                        <div className="field-label">Full Name</div>
                        <input
                          className="field-input"
                          value={m.name}
                          onChange={(e) => updateMember(idx, 'name', e.target.value)}
                          placeholder="Name &amp; surname"
                        />
                      </div>
                      <div className="field" style={{ marginBottom: 8 }}>
                        <div className="field-label">Cell Number</div>
                        <input
                          className="field-input"
                          value={m.cell}
                          onChange={(e) => updateMember(idx, 'cell', e.target.value)}
                          placeholder="0XX XXX XXXX"
                        />
                      </div>
                      <div className="field" style={{ marginBottom: 8 }}>
                        <div className="field-label">Email</div>
                        <input
                          className="field-input"
                          value={m.email}
                          onChange={(e) => updateMember(idx, 'email', e.target.value)}
                          placeholder="name@club.co.za"
                        />
                      </div>
                    </div>
                    <div className="field-grid-2">
                      <div className="field" style={{ marginBottom: 0 }}>
                        <div className="field-label">Gender</div>
                        <select
                          className="field-select"
                          value={m.gender}
                          onChange={(e) => updateMember(idx, 'gender', e.target.value)}
                        >
                          <option value="">Select…</option>
                          <option>Female</option>
                          <option>Male</option>
                          <option>Non-binary</option>
                        </select>
                      </div>
                      <div className="field" style={{ marginBottom: 0 }}>
                        <div className="field-label">Race</div>
                        <select
                          className="field-select"
                          value={m.race}
                          onChange={(e) => updateMember(idx, 'race', e.target.value)}
                        >
                          <option value="">Select…</option>
                          <option>Black African</option>
                          <option>Coloured</option>
                          <option>Indian</option>
                          <option>White</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </Card>
            )}

            {step === 3 && (
              <Card
                title="Leagues entered &amp; Head Coaches"
                sub="Select leagues your club is entering for 2026/27 — coaches captured per league"
              >
                <div className="field">
                  <div className="field-label">
                    Leagues your club is entering <span className="req">*</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                    {[
                      { k: 'premier', l: 'Premier League' },
                      { k: 'promotion', l: 'Promotion League' },
                      { k: 'premierWomen', l: 'Premier Women' },
                      { k: 'promotionWomen', l: 'Promotion Women' },
                      { k: 'veterans', l: 'Veterans League' },
                      { k: 'emcuD1', l: 'EMCU Division 1' },
                    ].map((L) => (
                      <button
                        key={L.k}
                        className={`check-item ${data.leagues[L.k] ? 'on' : ''}`}
                        onClick={() => updateLeague(L.k)}
                      >
                        <div className="box">{data.leagues[L.k] && <Icon.Check />}</div>
                        {L.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hr" />

                {/* Coaches — dynamic array with team-tag multi-select */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "'Montserrat',sans-serif",
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--ink)',
                      }}
                    >
                      Coaches
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
                      Tag each coach to the teams they manage — one coach can cover multiple.
                    </div>
                  </div>
                  <Btn tone="outline" size="sm" icon={Icon.Plus} onClick={addCoach}>
                    Add another coach
                  </Btn>
                </div>

                {data.coaches.map((c, idx) => {
                  const selectedTeams = Object.entries(data.leagues)
                    .filter(([_, v]) => v)
                    .map(([k]) => k);
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '16px 18px',
                        border: '1px solid var(--line)',
                        borderRadius: 10,
                        marginBottom: 10,
                        background: c.name ? 'rgba(15,143,74,0.04)' : 'var(--paper)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 12,
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Montserrat',sans-serif",
                            fontSize: 13.5,
                            fontWeight: 700,
                            color: 'var(--ink)',
                          }}
                        >
                          Coach{' '}
                          <span style={{ color: 'var(--muted-2)', fontWeight: 500 }}>
                            #{idx + 1}
                          </span>
                          {c.teams.length > 0 && (
                            <span
                              style={{
                                marginLeft: 10,
                                fontSize: 11,
                                fontWeight: 500,
                                color: 'var(--muted)',
                                fontFamily: "'Montserrat',sans-serif",
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                              }}
                            >
                              · {c.teams.length} team{c.teams.length === 1 ? '' : 's'}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {c.name && (
                            <Pill tone="teal" dot>
                              Captured
                            </Pill>
                          )}
                          {data.coaches.length > 1 && (
                            <Btn tone="ghost" size="sm" onClick={() => removeCoach(idx)}>
                              Remove
                            </Btn>
                          )}
                        </div>
                      </div>

                      <div className="field-grid-4">
                        <div className="field" style={{ marginBottom: 8 }}>
                          <div className="field-label">Coach Name</div>
                          <input
                            className="field-input"
                            placeholder="Name &amp; surname"
                            value={c.name}
                            onChange={(e) => updateCoach(idx, 'name', e.target.value)}
                          />
                        </div>
                        <div className="field" style={{ marginBottom: 8 }}>
                          <div className="field-label">Coaching Body</div>
                          <select
                            className="field-select"
                            value={c.body}
                            onChange={(e) => updateCoach(idx, 'body', e.target.value)}
                          >
                            <option>CSA</option>
                            <option>Gary Kirsten</option>
                          </select>
                        </div>
                        <div className="field" style={{ marginBottom: 8 }}>
                          <div className="field-label">Coaching Level</div>
                          <select
                            className="field-select"
                            value={c.level}
                            onChange={(e) => updateCoach(idx, 'level', e.target.value)}
                          >
                            {COACHING_LEVELS.map((l) => (
                              <option key={l}>{l}</option>
                            ))}
                          </select>
                        </div>
                        <div className="field" style={{ marginBottom: 8 }}>
                          <div className="field-label">Status</div>
                          <select
                            className="field-select"
                            value={c.status}
                            onChange={(e) => updateCoach(idx, 'status', e.target.value)}
                          >
                            <option>Completed</option>
                            <option>In progress</option>
                            <option>Not completed</option>
                          </select>
                        </div>
                      </div>
                      <div className="field-grid-2">
                        <div className="field" style={{ marginBottom: 10 }}>
                          <div className="field-label">Contact Number</div>
                          <input
                            className="field-input"
                            placeholder="0XX XXX XXXX"
                            value={c.cell}
                            onChange={(e) => updateCoach(idx, 'cell', e.target.value)}
                          />
                        </div>
                        <div className="field" style={{ marginBottom: 10 }}>
                          <div className="field-label">Email</div>
                          <input
                            className="field-input"
                            placeholder="coach@club.co.za"
                            value={c.email}
                            onChange={(e) => updateCoach(idx, 'email', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* ─── Team-tag multi-select — bold required block ─── */}
                      {selectedTeams.length === 0 ? (
                        <div
                          className="trb"
                          style={{
                            background: 'var(--white)',
                            borderStyle: 'dashed',
                            borderColor: 'var(--paper3)',
                          }}
                        >
                          <div className="trb-head">
                            <span className="trb-label">
                              Teams managed <span className="req">*</span>
                            </span>
                          </div>
                          <div className="trb-empty-state" style={{ color: 'var(--muted)' }}>
                            <Icon.Alert /> Select at least one league above — each one becomes a tag
                            this coach can manage.
                          </div>
                        </div>
                      ) : (
                        <div className="trb" data-empty={c.teams.length === 0}>
                          <div className="trb-head">
                            <span className="trb-label">
                              Teams managed <span className="req">*</span>
                            </span>
                            <span
                              className={`trb-count ${c.teams.length === 0 ? 'empty' : 'filled'}`}
                            >
                              {c.teams.length === 0
                                ? 'Tap a chip to assign →'
                                : `${c.teams.length} of ${selectedTeams.length} selected`}
                            </span>
                          </div>
                          <div className="trb-chips">
                            {[
                              { k: 'premier', l: 'Premier League' },
                              { k: 'promotion', l: 'Promotion League' },
                              { k: 'premierWomen', l: 'Premier Women' },
                              { k: 'promotionWomen', l: 'Promotion Women' },
                              { k: 'veterans', l: 'Veterans League' },
                              { k: 'emcuD1', l: 'EMCU Division 1' },
                            ]
                              .filter((L) => selectedTeams.includes(L.k))
                              .map((L) => {
                                const on = c.teams.includes(L.k);
                                return (
                                  <button
                                    key={L.k}
                                    className={`trb-chip ${on ? 'on' : ''}`}
                                    onClick={() => toggleCoachTeam(idx, L.k)}
                                  >
                                    <span className="trb-chip-tick">
                                      {on ? <Icon.Check /> : null}
                                    </span>
                                    {L.l}
                                  </button>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </Card>
            )}

            {step === 4 && (
              <Card
                title="Review &amp; submit · Affiliation fee"
                sub="Confirm your details and pay the union affiliation fee"
              >
                <div
                  style={{
                    background: 'var(--paper)',
                    borderRadius: 10,
                    padding: '16px 18px',
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 22px' }}
                  >
                    {[
                      ['Club Name', data.clubName],
                      ['District', data.district],
                      ['Township', data.township === 'yes' ? 'Yes' : 'No'],
                      [
                        'Home ground',
                        data.groundVenue
                          ? `${data.groundVenue}${data.groundAddress ? ' · ' + data.groundAddress : ''}`
                          : '—',
                      ],
                      ['Chairperson', data.chairName + ' · ' + data.chairCell],
                      [
                        'Additional members',
                        data.additionalMembers.filter((m) => m.name).length
                          ? data.additionalMembers
                              .filter((m) => m.name)
                              .map((m) => m.name)
                              .join(', ')
                          : '—',
                      ],
                      [
                        'Leagues entered',
                        Object.entries(data.leagues)
                          .filter(([_, v]) => v)
                          .map(([k]) => k)
                          .join(', ') || '—',
                      ],
                      [
                        'Coaches',
                        data.coaches.filter((c) => c.name).length
                          ? data.coaches
                              .filter((c) => c.name)
                              .map((c) => `${c.name} (${c.body} ${c.level})`)
                              .join('; ')
                          : '—',
                      ],
                    ].map(([k, v], i) => (
                      <div key={i}>
                        <div
                          style={{
                            fontSize: 10,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: 'var(--muted-2)',
                            marginBottom: 2,
                          }}
                        >
                          {k}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>
                          {v || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment block */}
                <div className="aff-pay">
                  <div className="aff-pay-icon">
                    <Icon.Money />
                  </div>
                  <div className="aff-pay-text">
                    <div className="aff-pay-eyebrow">Union Affiliation · 2026/27</div>
                    <div className="aff-pay-title">KZNCU &amp; EMCU annual fee</div>
                    <div className="aff-pay-sub">
                      Includes league entry, Medicoach AMS licence and franchise integration.
                    </div>
                  </div>
                  <div className="aff-pay-amount">
                    <div className="aff-pay-amount-n">R 4,500</div>
                    <div className="aff-pay-amount-vat">VAT inclusive</div>
                  </div>
                </div>

                <div className="aff-pay-actions">
                  <Btn tone="outline" onClick={() => setStep(3)}>
                    Back
                  </Btn>
                  <Btn
                    tone="gold"
                    icon={Icon.Money}
                    onClick={() => {
                      onSubmit({
                        exco: getExcoPayload(),
                        coaches: getCoachesPayload(),
                        ground: getGroundPayload(),
                      });
                      toast('Affiliation submitted &amp; paid · R 4,500 · Exco roster captured');
                    }}
                  >
                    Pay &amp; submit affiliation
                  </Btn>
                </div>
              </Card>
            )}

            {step < 4 && (
              <div className="row" style={{ marginTop: 14, justifyContent: 'space-between' }}>
                <Btn
                  tone="ghost"
                  onClick={() => step > 1 && setStep(step - 1)}
                  disabled={step === 1}
                >
                  ← Back
                </Btn>
                <div className="row" style={{ gap: 8 }}>
                  <Btn tone="outline" size="sm">
                    Save draft
                  </Btn>
                  <Btn tone="ink" onClick={() => setStep(step + 1)} disabled={step === 1 && !valid}>
                    Continue →
                  </Btn>
                </div>
              </div>
            )}
          </fieldset>

          {viewOnly && (
            <div className="row" style={{ marginTop: 14, justifyContent: 'space-between', gap: 8 }}>
              <div
                style={{
                  fontSize: 11.5,
                  color: 'var(--muted)',
                  fontFamily: "'Montserrat',sans-serif",
                  fontWeight: 500,
                }}
              >
                Need a change? Contact the Union office to amend.
              </div>
              <div className="row" style={{ gap: 8 }}>
                <Btn tone="outline" icon={Icon.Mail} size="sm">
                  Request amendment
                </Btn>
                <Btn tone="ink" onClick={() => goto('home')}>
                  Close
                </Btn>
              </div>
            </div>
          )}
        </div>

        {/* ─── Right-side sticky hero + live summary ─── */}
        <aside className="aff-side">
          <div
            className="aff-hero-card"
            style={{ backgroundImage: "url('players/lions-hero.jpg')" }}
          >
            <div className="aff-hero-content">
              <div className="aff-hero-badge">
                <span className="dot" />
                Affiliation · Step {step} / 4
              </div>
              <div>
                <div className="aff-hero-title">
                  Your club, <em>on the same platform</em> as our heroes.
                </div>
                <div className="aff-hero-sub">
                  Affiliated clubs join the DP World Lions ecosystem — fixtures, talent ID, clinical
                  data and franchise readiness, all in one place.
                </div>
                <div className="aff-hero-credit">
                  <strong>DP World Lions</strong> · Senior squad
                </div>
              </div>
            </div>
          </div>

          <div className="aff-progress-pill">
            <div className="aff-progress-num">
              {step}
              <span style={{ color: 'var(--muted-3)', fontSize: 13, fontWeight: 500 }}>/4</span>
            </div>
            <div className="aff-progress-info">
              <div className="aff-progress-label">You're on</div>
              <div className="aff-progress-sub">{stepLabel}</div>
            </div>
          </div>

          <div className="aff-summary">
            <div className="aff-summary-head">
              <div className="aff-summary-title">Your application</div>
              <div className="aff-summary-step">Live</div>
            </div>
            <div className="aff-summary-row">
              <div className="aff-summary-label">Club</div>
              <div className={`aff-summary-value ${!data.clubName ? 'muted' : ''}`}>
                {data.clubName || '—'}
              </div>
            </div>
            <div className="aff-summary-row">
              <div className="aff-summary-label">District</div>
              <div className={`aff-summary-value ${!data.district ? 'muted' : ''}`}>
                {data.district || '—'}
              </div>
            </div>
            <div className="aff-summary-row">
              <div className="aff-summary-label">Home ground</div>
              <div className={`aff-summary-value ${!data.groundVenue ? 'muted' : ''}`}>
                {data.groundVenue || '—'}
              </div>
            </div>
            <div className="aff-summary-row">
              <div className="aff-summary-label">Exco bearers</div>
              <div className={`aff-summary-value ${filledBearers === 0 ? 'muted' : ''}`}>
                {filledBearers ? `${filledBearers} captured` : '—'}
              </div>
            </div>
            <div className="aff-summary-row">
              <div className="aff-summary-label">Leagues</div>
              <div className={`aff-summary-value ${leaguesCount === 0 ? 'muted' : ''}`}>
                {leaguesCount ? `${leaguesCount} entered` : '—'}
              </div>
            </div>
            <div className="aff-summary-row">
              <div className="aff-summary-label">Coaches</div>
              <div className={`aff-summary-value ${coachesCount === 0 ? 'muted' : ''}`}>
                {coachesCount ? `${coachesCount} listed` : '—'}
              </div>
            </div>
            <div className="aff-summary-row">
              <div className="aff-summary-label">Union fee</div>
              <div className="aff-summary-value">R 4,500</div>
            </div>
            <div className="aff-summary-foot">
              Submitting to the <strong>Lions office</strong> · KZNCU &amp; EMCU
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ─── Document upload + Exco form ─── */
const FIXED_EXCO_ROLES = [
  { key: 'chair', label: 'Chairperson', required: true },
  { key: 'sec', label: 'Secretary', required: true },
  { key: 'tre', label: 'Treasurer', required: true },
  { key: 'vc', label: 'Vice-Chair', required: false },
];

function ExcoFormModal({ club, onClose, onSave }) {
  const [members, setMembers] = useState(() => {
    // Fixed roles from club.exco
    const init = {};
    const stored = club.exco || {};
    FIXED_EXCO_ROLES.forEach((r) => {
      const s = stored[r.key];
      if (s) {
        init[r.key] = {
          name: s.name || '',
          cell: s.cell || '',
          email: s.email || '',
          gender: s.gender || '',
          race: s.race || '',
        };
      } else {
        init[r.key] = {
          name: r.key === 'chair' ? club.chair : '',
          cell: r.key === 'chair' ? '083 786 4098' : '',
          email: r.key === 'chair' ? 'chair@' + club.id + '.co.za' : '',
          gender: r.key === 'chair' ? 'Male' : '',
          race: r.key === 'chair' ? 'Indian' : '',
        };
      }
    });
    return init;
  });
  // Additional members are a separate array
  const [additionalMembers, setAdditionalMembers] = useState(() => {
    const stored = club.exco?.additionalMembers;
    if (Array.isArray(stored) && stored.length) return stored;
    return [];
  });

  function update(role, field, val) {
    setMembers((m) => ({ ...m, [role]: { ...m[role], [field]: val } }));
  }
  function updateAdditional(idx, field, val) {
    setAdditionalMembers((arr) => arr.map((m, i) => (i === idx ? { ...m, [field]: val } : m)));
  }
  function addAdditional() {
    setAdditionalMembers((arr) => [
      ...arr,
      { name: '', cell: '', email: '', gender: '', race: '' },
    ]);
  }
  function removeAdditional(idx) {
    setAdditionalMembers((arr) => arr.filter((_, i) => i !== idx));
  }

  const requiredFilled = FIXED_EXCO_ROLES.filter((r) => r.required).every(
    (r) => members[r.key].name && members[r.key].cell && members[r.key].email
  );
  const completedCount =
    FIXED_EXCO_ROLES.filter((r) => members[r.key].name).length +
    additionalMembers.filter((m) => m.name).length;

  return (
    <div className="ob-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ob-modal" style={{ width: 880, maxHeight: '92vh' }}>
        <div className="ob-head">
          <div>
            <div
              style={{
                fontFamily: "'Montserrat',sans-serif",
                fontSize: 10.5,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--muted-2)',
              }}
            >
              Compliance Template
            </div>
            <div
              style={{
                fontFamily: "'Montserrat',sans-serif",
                fontSize: 18,
                fontWeight: 700,
                marginTop: 3,
              }}
            >
              Executive Committee Roster
            </div>
          </div>
          <span className="ob-step-label" style={{ marginLeft: 'auto' }}>
            {completedCount} bearer{completedCount === 1 ? '' : 's'} captured
          </span>
          <button className="ob-close" onClick={onClose} title="Close (your draft is preserved)">
            <Icon.X />
          </button>
        </div>

        <div style={{ padding: '20px 26px', overflowY: 'auto' }}>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 18 }}>
            Capture every executive committee bearer with their contact details. This roster is what
            the Union office uses for official correspondence — no PDF upload needed.
          </p>

          {FIXED_EXCO_ROLES.map((role, idx) => (
            <div
              key={role.key}
              style={{
                padding: '16px 18px',
                border: '1px solid var(--line)',
                borderRadius: 10,
                marginBottom: 10,
                background: members[role.key].name ? 'rgba(15,143,74,0.04)' : 'var(--paper)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Montserrat',sans-serif",
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: 'var(--ink)',
                  }}
                >
                  {role.label}
                  {role.required && <span style={{ color: 'var(--coral)', marginLeft: 4 }}>*</span>}
                  {!role.required && (
                    <span
                      style={{
                        fontSize: 10.5,
                        color: 'var(--muted-2)',
                        marginLeft: 8,
                        fontWeight: 500,
                        fontFamily: "'Montserrat',sans-serif",
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Optional
                    </span>
                  )}
                </div>
                {members[role.key].name && (
                  <Pill tone="teal" dot>
                    Captured
                  </Pill>
                )}
              </div>
              <div className="field-grid-3">
                <div className="field" style={{ marginBottom: 8 }}>
                  <div className="field-label">Full Name</div>
                  <input
                    className="field-input"
                    value={members[role.key].name}
                    placeholder="Name &amp; surname"
                    onChange={(e) => update(role.key, 'name', e.target.value)}
                  />
                </div>
                <div className="field" style={{ marginBottom: 8 }}>
                  <div className="field-label">Cell Number</div>
                  <input
                    className="field-input"
                    value={members[role.key].cell}
                    placeholder="0XX XXX XXXX"
                    onChange={(e) => update(role.key, 'cell', e.target.value)}
                  />
                </div>
                <div className="field" style={{ marginBottom: 8 }}>
                  <div className="field-label">Email</div>
                  <input
                    className="field-input"
                    value={members[role.key].email}
                    placeholder="name@club.co.za"
                    onChange={(e) => update(role.key, 'email', e.target.value)}
                  />
                </div>
              </div>
              <div className="field-grid-2">
                <div className="field" style={{ marginBottom: 0 }}>
                  <div className="field-label">Gender</div>
                  <select
                    className="field-select"
                    value={members[role.key].gender}
                    onChange={(e) => update(role.key, 'gender', e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Non-binary</option>
                  </select>
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <div className="field-label">Race</div>
                  <select
                    className="field-select"
                    value={members[role.key].race}
                    onChange={(e) => update(role.key, 'race', e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option>Black African</option>
                    <option>Coloured</option>
                    <option>Indian</option>
                    <option>White</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          {/* Additional members — dynamic list */}
          <div
            style={{
              marginTop: 18,
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Montserrat',sans-serif",
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: 'var(--ink)',
                }}
              >
                Additional Members
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
                Add any further committee reps or office bearers.
              </div>
            </div>
            <Btn tone="outline" size="sm" icon={Icon.Plus} onClick={addAdditional}>
              Add member
            </Btn>
          </div>
          {additionalMembers.length === 0 && (
            <div
              style={{
                padding: '22px',
                border: '1px dashed var(--paper3)',
                borderRadius: 10,
                background: 'var(--paper)',
                color: 'var(--muted)',
                fontSize: 12.5,
                textAlign: 'center',
              }}
            >
              No additional members yet — click "Add member" to capture one.
            </div>
          )}
          {additionalMembers.map((m, idx) => (
            <div
              key={idx}
              style={{
                padding: '16px 18px',
                border: '1px solid var(--line)',
                borderRadius: 10,
                marginBottom: 10,
                background: m.name ? 'rgba(15,143,74,0.04)' : 'var(--paper)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Montserrat',sans-serif",
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: 'var(--ink)',
                  }}
                >
                  Additional Member{' '}
                  <span style={{ color: 'var(--muted-2)', fontWeight: 500 }}>#{idx + 1}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {m.name && (
                    <Pill tone="teal" dot>
                      Captured
                    </Pill>
                  )}
                  <Btn tone="ghost" size="sm" onClick={() => removeAdditional(idx)}>
                    Remove
                  </Btn>
                </div>
              </div>
              <div className="field-grid-3">
                <div className="field" style={{ marginBottom: 8 }}>
                  <div className="field-label">Full Name</div>
                  <input
                    className="field-input"
                    value={m.name}
                    placeholder="Name &amp; surname"
                    onChange={(e) => updateAdditional(idx, 'name', e.target.value)}
                  />
                </div>
                <div className="field" style={{ marginBottom: 8 }}>
                  <div className="field-label">Cell Number</div>
                  <input
                    className="field-input"
                    value={m.cell}
                    placeholder="0XX XXX XXXX"
                    onChange={(e) => updateAdditional(idx, 'cell', e.target.value)}
                  />
                </div>
                <div className="field" style={{ marginBottom: 8 }}>
                  <div className="field-label">Email</div>
                  <input
                    className="field-input"
                    value={m.email}
                    placeholder="name@club.co.za"
                    onChange={(e) => updateAdditional(idx, 'email', e.target.value)}
                  />
                </div>
              </div>
              <div className="field-grid-2">
                <div className="field" style={{ marginBottom: 0 }}>
                  <div className="field-label">Gender</div>
                  <select
                    className="field-select"
                    value={m.gender}
                    onChange={(e) => updateAdditional(idx, 'gender', e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Non-binary</option>
                  </select>
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <div className="field-label">Race</div>
                  <select
                    className="field-select"
                    value={m.race}
                    onChange={(e) => updateAdditional(idx, 'race', e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option>Black African</option>
                    <option>Coloured</option>
                    <option>Indian</option>
                    <option>White</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="ob-foot">
          <div className="ob-foot-hint">
            {requiredFilled
              ? `${completedCount} bearer${completedCount === 1 ? '' : 's'} ready to submit`
              : 'Chair, Secretary & Treasurer are required to submit'}
          </div>
          <div className="ob-foot-buttons">
            <Btn tone="ghost" onClick={onClose}>
              Save draft &amp; close
            </Btn>
            <Btn
              tone="teal"
              icon={Icon.Check}
              disabled={!requiredFilled}
              onClick={() =>
                requiredFilled &&
                onSave({ ...members, additionalMembers: additionalMembers.filter((m) => m.name) })
              }
            >
              Submit roster
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentsView({ club, goto, toast, onUpload, onSaveExco }) {
  const dc = docCompletion(club);
  const [showExcoForm, setShowExcoForm] = useState(false);
  const excoBearerCount = (() => {
    if (!club.exco) return 0;
    const fixed = FIXED_EXCO_ROLES.filter((r) => club.exco[r.key]?.name).length;
    const extra = (club.exco.additionalMembers || []).filter((m) => m.name).length;
    return fixed + extra;
  })();

  return (
    <div>
      <div className="page-head">
        <div className="ph-left">
          <div className="ph-crumb">
            <a onClick={() => goto('home')}>Home</a> &nbsp;/&nbsp; Compliance Documents
          </div>
          <h1 className="ph-title">
            Required <em>compliance documents</em>
          </h1>
          <p className="ph-desc">
            Per the 2026/27 KZNCU Club Requirements, three documents must be uploaded and one roster
            captured directly on the platform. PDFs preferred — max 10 MB per file.
          </p>
        </div>
        <div className="ph-actions">
          <Btn tone="outline" icon={Icon.Download} size="sm">
            Requirements PDF
          </Btn>
        </div>
      </div>

      <div className="kpi-strip" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <KPI
          tone="teal"
          label="Submitted"
          num={Object.values(club.docs).filter((v) => v).length}
          sub="of 4 required"
        />
        <KPI
          tone="coral"
          label="Outstanding"
          num={4 - Object.values(club.docs).filter((v) => v).length}
          sub="needs attention"
        />
        <KPI label="Completion" num={dc + '%'} sub="overall" />
        <KPI tone="gold" label="Deadline" num="22 Jun" sub="31 days remaining" />
      </div>

      <Card
        title="Submit your documents"
        sub="3 file uploads · 1 on-platform form"
        action={
          <Btn tone="outline" size="sm" icon={Icon.Download}>
            Download templates
          </Btn>
        }
      >
        {REQUIRED_DOCS.map((d) => {
          const up = club.docs[d.key];
          const isExco = d.key === 'exco';
          return (
            <div key={d.key} className={`doc-row ${up ? 'uploaded' : ''}`}>
              <div className="doc-icon">{isExco ? <Icon.Form /> : <Icon.Doc />}</div>
              <div className="doc-info">
                <div className="doc-name">
                  {d.name}
                  {isExco && (
                    <span
                      style={{
                        fontSize: 9.5,
                        marginLeft: 8,
                        padding: '2px 7px',
                        borderRadius: 10,
                        background: 'rgba(10,15,20,0.08)',
                        color: 'var(--navy)',
                        fontFamily: "'Montserrat',sans-serif",
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                      }}
                    >
                      On-platform
                    </span>
                  )}
                </div>
                <div className="doc-meta">
                  {up ? (
                    isExco ? (
                      <span>
                        Roster captured · {excoBearerCount} bearer{excoBearerCount === 1 ? '' : 's'}{' '}
                        · synced from your affiliation form ·{' '}
                        <a
                          style={{ color: 'var(--teal-deep)', cursor: 'pointer' }}
                          onClick={() => setShowExcoForm(true)}
                        >
                          Edit
                        </a>
                      </span>
                    ) : (
                      <span>
                        {d.key}_2026.pdf · 1.2 MB · uploaded 14 May 2026 ·{' '}
                        <a style={{ color: 'var(--teal-deep)' }}>Replace</a>
                      </span>
                    )
                  ) : isExco ? (
                    <span>
                      Auto-captured from the affiliation form, or{' '}
                      <a
                        style={{ color: 'var(--teal-deep)', cursor: 'pointer' }}
                        onClick={() => setShowExcoForm(true)}
                      >
                        complete the roster here
                      </a>
                    </span>
                  ) : (
                    d.desc
                  )}
                </div>
              </div>
              {up ? (
                <>
                  <Pill tone="teal" dot>
                    {isExco ? 'Completed' : 'Uploaded'}
                  </Pill>
                  <Btn tone="ghost" size="sm" icon={Icon.Eye} />
                </>
              ) : isExco ? (
                <Btn tone="ink" size="sm" icon={Icon.Form} onClick={() => setShowExcoForm(true)}>
                  Complete form
                </Btn>
              ) : (
                <Btn
                  tone="ink"
                  size="sm"
                  icon={Icon.Upload}
                  onClick={() => {
                    onUpload(d.key);
                    toast(`${d.name} uploaded`);
                  }}
                >
                  Upload
                </Btn>
              )}
            </div>
          );
        })}
      </Card>

      {showExcoForm && (
        <ExcoFormModal
          club={club}
          onClose={() => setShowExcoForm(false)}
          onSave={(members) => {
            onSaveExco(members);
            setShowExcoForm(false);
            const count = Object.values(members).filter((m) => m.name).length;
            toast(
              `Exco roster ${club.docs.exco ? 'updated' : 'submitted'} · ${count} bearer${count === 1 ? '' : 's'}`
            );
          }}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <Card title="What we check">
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <li className="row" style={{ gap: 10, fontSize: 13, color: 'var(--ink3)' }}>
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'var(--teal-pale)',
                  color: 'var(--teal-deep)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon.Check />
              </span>
              Constitution is current (signed within the last 2 years)
            </li>
            <li className="row" style={{ gap: 10, fontSize: 13, color: 'var(--ink3)' }}>
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'var(--teal-pale)',
                  color: 'var(--teal-deep)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon.Check />
              </span>
              AGM Minutes are signed by Chair &amp; Secretary
            </li>
            <li className="row" style={{ gap: 10, fontSize: 13, color: 'var(--ink3)' }}>
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'var(--teal-pale)',
                  color: 'var(--teal-deep)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon.Check />
              </span>
              Financials cover the prior season &amp; show member income
            </li>
            <li className="row" style={{ gap: 10, fontSize: 13, color: 'var(--ink3)' }}>
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'var(--teal-pale)',
                  color: 'var(--teal-deep)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon.Check />
              </span>
              Exco list includes Chair, Secretary, Treasurer + Vice-Chair
            </li>
          </ul>
        </Card>

        <Card title="Need help?">
          <p style={{ fontSize: 13, color: 'var(--ink3)', lineHeight: 1.6 }}>
            If your club is missing one of the required documents, reach out to the Union office at{' '}
            <strong style={{ color: 'var(--navy)' }}>kzncu.office@cricket.co.za</strong>. Sample
            templates are available for AGM Minutes and Constitution.
          </p>
          <div className="row" style={{ marginTop: 12, gap: 8 }}>
            <Btn tone="outline" icon={Icon.Mail} size="sm">
              Contact union
            </Btn>
            <Btn tone="outline" icon={Icon.Download} size="sm">
              Sample templates
            </Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─── CQI Self-Assessment ─── */
function CQIView({ club, goto, toast, onSubmit }) {
  const [answers, setAnswers] = useState(() => {
    // Prefill from existing data shape
    const a = {};
    if (club.cqi > 0) {
      // approximate defaults based on the club's score band
      a.constitution = !!club.docs.constitution;
      a.agm = !!club.docs.agm;
      a.minutes = !!club.docs.agm;
      a.officers = true;
      a.conduct = true;
      a.inventory = true;
      a.playerdb = true;
      a.senior = club.teams;
      a.women = club.women;
      a.juniorB = club.juniors;
      a.juniorG = 0;
      a.premprom = true;
      a.coaches = 5;
      a.certified = 3;
      a.level2 = true;
      a.covers = true;
      a.boundary = true;
      a.scoreboard = true;
      a.ownFacility = false;
      a.fieldsGrass = 2;
      a.fieldsArt = 0;
      a.netsGrass = 4;
      a.netsArt = 2;
      a.pctBA = 30;
      a.pctIN = 40;
      a.pctWH = 20;
      a.pctCO = 10;
    }
    return a;
  });

  function setA(k, v) {
    setAnswers((a) => ({ ...a, [k]: v }));
  }

  const { total, byCat } = useMemo(() => scoreCQI(answers), [answers]);
  const band = cqiBand(total || 0.0001);
  const submitted = club.cqi > 0;

  // Validate representation total
  const repTotal =
    (parseFloat(answers.pctBA) || 0) +
    (parseFloat(answers.pctIN) || 0) +
    (parseFloat(answers.pctCO) || 0) +
    (parseFloat(answers.pctWH) || 0);

  return (
    <div>
      <div className="page-head">
        <div className="ph-left">
          <div className="ph-crumb">
            <a onClick={() => goto('home')}>Home</a> &nbsp;/&nbsp; CQI Self-Assessment
          </div>
          <h1 className="ph-title">
            Club Quality <em>Index</em> · 2026/27
          </h1>
          <p className="ph-desc">
            Score your club across six dimensions of capability. Your responses are scored in real
            time using the official Lions CQI weighting model — administration 20%, teams 20%,
            coaching 20%, facilities 15%, representation 10%, financial sustainability 15%.
          </p>
        </div>
        <div className="ph-actions">
          <Btn tone="outline" size="sm" icon={Icon.Download}>
            Export CQI as PDF
          </Btn>
        </div>
      </div>

      {/* Live total score */}
      <div className="total-score-block">
        <div className="tsb-num">
          <CountUp to={total} decimals={1} duration={600} />
          <span className="of">/100</span>
        </div>
        <div className="tsb-mid">
          <div className="tsb-l">Live CQI score · auto-calculated</div>
          <div className="tsb-title">
            {total >= 80
              ? 'A — Premier-grade club'
              : total >= 65
                ? 'B — Strong club, minor gaps'
                : total >= 50
                  ? 'C — Functional club, several gaps'
                  : total > 0
                    ? 'D — Major gaps to address'
                    : 'Begin your assessment to see your score'}
          </div>
          <div className="tsb-sub">
            Score updates as you answer questions. Submit when you're satisfied — your assessment is
            shared with the Union office for franchise tracking.
          </div>
          <div className="tsb-pbar">
            <div className="tsb-pbar-fill" style={{ width: total + '%' }} />
          </div>
        </div>
      </div>

      {/* Per-category scores */}
      <div className="score-grid">
        {CQI_STRUCTURE.map((cat) => {
          const s = byCat[cat.key];
          return (
            <div
              key={cat.key}
              className="score-card"
              style={{ '--fill': (s.earned / cat.possible) * 100 + '%', '--accent': cat.accent }}
            >
              <div>
                <span className="sc-cat">{cat.title}</span>
                <span className="sc-w">/{cat.weight}</span>
              </div>
              <div className="sc-num">
                {s.earned.toFixed(1)}
                <span className="sc-of">/{cat.weight}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Each category */}
      {CQI_STRUCTURE.map((cat, i) => (
        <div key={cat.key} className="cqi-section">
          <div className="cqi-section-head">
            <div className="cqi-section-num">{i + 1}</div>
            <div>
              <div className="cqi-section-title">{cat.title}</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{cat.desc}</div>
            </div>
            <div className="cqi-section-w">Weight · {cat.weight}%</div>
          </div>

          {cat.questions.map((q) => (
            <div key={q.key} className="cqi-q">
              <div>
                <div className="cqi-q-label">{q.label}</div>
                <div className="cqi-q-hint">
                  {q.kind === 'num'
                    ? `Number · max ${q.max}`
                    : q.kind === 'pct'
                      ? 'Enter percentage 0–100'
                      : q.kind === 'choice'
                        ? 'Select one'
                        : q.kind === 'money'
                          ? 'Currency · amount per member'
                          : 'Yes / No'}
                </div>
              </div>
              {q.kind === 'yn' && <YN value={answers[q.key]} onChange={(v) => setA(q.key, v)} />}
              {q.kind === 'num' && (
                <NumSlider value={answers[q.key]} onChange={(v) => setA(q.key, v)} max={q.max} />
              )}
              {q.kind === 'pct' && (
                <NumSlider
                  value={answers[q.key]}
                  onChange={(v) => setA(q.key, v)}
                  max={100}
                  suffix="%"
                />
              )}
              {q.kind === 'choice' && (
                <Choice
                  value={answers[q.key]}
                  onChange={(v) => setA(q.key, v)}
                  options={q.options}
                />
              )}
              {q.kind === 'money' && (
                <MoneyInput
                  value={answers[q.key]}
                  onChange={(v) => setA(q.key, v)}
                  currency={q.currency || 'R'}
                />
              )}
            </div>
          ))}

          {/* Representation total check */}
          {cat.key === 'representation' && (
            <div
              style={{
                padding: '8px 18px',
                fontSize: 11.5,
                fontFamily: "'Montserrat',sans-serif",
                color: Math.abs(repTotal - 100) < 0.5 ? 'var(--teal-deep)' : 'var(--coral)',
              }}
            >
              Representation total: {repTotal.toFixed(0)}% / 100%{' '}
              {Math.abs(repTotal - 100) < 0.5 ? '✓' : ' · must sum to 100%'}
            </div>
          )}
        </div>
      ))}

      <Card>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 15, fontWeight: 700 }}>
              {submitted ? 'Submitted on 16 May 2026' : 'Ready to submit?'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
              {submitted
                ? 'Your score has been forwarded to the Lions Admin office. You can re-submit any time before 22 June 2026.'
                : 'Your CQI will be visible to the Lions administrators alongside your affiliation and compliance documents.'}
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <Btn tone="outline">Save draft</Btn>
            <Btn
              tone="teal"
              icon={Icon.Check}
              onClick={() => {
                onSubmit(total);
                toast('CQI submitted · ' + total.toFixed(1) + '/100');
              }}
            >
              Submit CQI
            </Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ─── Phase 2 · Club Fixtures (only shown once admin has released) ─── */
function ClubFixturesView({ club, allSeries, clubs, toast }) {
  const clubBy = (id) => clubs.find((c) => c.id === id);

  // Only series this club is in AND that have been released by the Lions office
  const myReleased = (allSeries || []).filter((s) => s.released && s.teams.includes(club.id));

  // No releases yet — elegant placeholder
  if (!myReleased.length) {
    return (
      <div>
        <div className="page-head">
          <div className="ph-left">
            <div className="ph-crumb">Club Portal · {club.name} / Fixtures</div>
            <h1 className="ph-title">
              Your <em>Fixtures</em>
            </h1>
            <p className="ph-desc">
              Your league schedule lands here the moment the Lions office releases it.
            </p>
          </div>
        </div>
        <div className="club-fix-empty">
          <div className="club-fix-empty-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="5"
                width="18"
                height="16"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M3 9h18M8 3v4M16 3v4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="club-fix-empty-title">Awaiting release from the Lions office</div>
          <div className="club-fix-empty-sub">
            Once the union office signs off on the 2026/27 fixture list, every match you're playing
            — round, date, opponent, venue and travel costs — will populate here automatically.
            You'll also receive an email &amp; SMS the moment it goes live.
          </div>
          <div className="club-fix-empty-meta">
            <span className="sdot" /> Status: <strong>Draft · awaiting release</strong>
          </div>
        </div>
      </div>
    );
  }

  // Aggregate totals across all released series this club is in
  let totalMatches = 0,
    homeMatches = 0,
    awayMatches = 0,
    totalKm = 0,
    totalCost = 0;
  let nextFixture = null;
  const todayISO = new Date().toISOString().slice(0, 10);

  myReleased.forEach((s) => {
    s.fixtures.forEach((f) => {
      if (f.home !== club.id && f.away !== club.id) return;
      totalMatches++;
      if (f.home === club.id) homeMatches++;
      else {
        awayMatches++;
        const home = clubBy(f.home);
        if (home && home.ground && club.ground) {
          const c = fixtureCost(home, club, s.costPerKm || 4.5, s.carsPerAwayTrip || 3);
          totalKm += c.roundTripKm;
          totalCost += c.fuelR;
        }
      }
      if (f.date >= todayISO && (!nextFixture || f.date < nextFixture.date)) {
        nextFixture = { ...f, seriesName: s.name };
      }
    });
  });

  const daysToNext = nextFixture
    ? Math.max(0, Math.ceil((new Date(nextFixture.date) - new Date(todayISO)) / 86400000))
    : null;

  return (
    <div>
      <div className="page-head">
        <div className="ph-left">
          <div className="ph-crumb">Club Portal · {club.name} / Fixtures</div>
          <h1 className="ph-title">
            Your <em>Fixtures</em>
          </h1>
          <p className="ph-desc">
            {myReleased.length} {myReleased.length === 1 ? 'series' : 'series'} released by the
            Lions office. {totalMatches} matches across the 2026/27 season — {homeMatches} at home,{' '}
            {awayMatches} on the road.
          </p>
        </div>
        <div className="ph-actions">
          <Btn tone="outline" size="sm" icon={Icon.Download}>
            Export PDF
          </Btn>
          <Btn tone="outline" size="sm" icon={Icon.Mail}>
            Share with players
          </Btn>
        </div>
      </div>

      {/* Hero KPI band */}
      <div className="club-fix-kpis">
        <div className="club-fix-kpi">
          <div className="club-fix-kpi-l">Matches</div>
          <div className="club-fix-kpi-n">{totalMatches}</div>
          <div className="club-fix-kpi-meta">
            {homeMatches} home · {awayMatches} away
          </div>
        </div>
        <div className="club-fix-kpi">
          <div className="club-fix-kpi-l">Series</div>
          <div className="club-fix-kpi-n">{myReleased.length}</div>
          <div className="club-fix-kpi-meta">
            {myReleased.map((s) => s.name.split(' · ')[0]).join(', ')}
          </div>
        </div>
        <div className="club-fix-kpi">
          <div className="club-fix-kpi-l">Travel · away</div>
          <div className="club-fix-kpi-n">
            {Math.round(totalKm).toLocaleString()}{' '}
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>km</span>
          </div>
          <div className="club-fix-kpi-meta">round-trip across all away games</div>
        </div>
        <div className="club-fix-kpi green">
          <div className="club-fix-kpi-l">Season fuel</div>
          <div className="club-fix-kpi-n">R {Math.round(totalCost).toLocaleString()}</div>
          <div className="club-fix-kpi-meta">
            est · {myReleased[0]?.carsPerAwayTrip || 3} cars × R {myReleased[0]?.costPerKm || 4.5}
            /km
          </div>
        </div>
      </div>

      {/* Next match countdown */}
      {nextFixture && (
        <div className="club-fix-next">
          <div className="club-fix-next-eyebrow">⏱ Next match</div>
          <div className="club-fix-next-body">
            <div className="club-fix-next-day">
              <div className="club-fix-next-day-n">{daysToNext}</div>
              <div className="club-fix-next-day-l">{daysToNext === 1 ? 'day' : 'days'}</div>
            </div>
            <div className="club-fix-next-detail">
              <div className="club-fix-next-title">
                {nextFixture.home === club.id ? 'vs' : 'away to'}{' '}
                <strong>
                  {clubBy(nextFixture.home === club.id ? nextFixture.away : nextFixture.home)
                    ?.name || 'TBA'}
                </strong>
              </div>
              <div className="club-fix-next-sub">
                {new Date(nextFixture.date).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}{' '}
                · {nextFixture.seriesName} · Round {nextFixture.round}
              </div>
            </div>
            <div className="club-fix-next-tag">
              {nextFixture.home === club.id ? (
                <Pill tone="teal" dot>
                  Home fixture
                </Pill>
              ) : (
                <Pill tone="gold" dot>
                  Away fixture
                </Pill>
              )}
            </div>
          </div>
        </div>
      )}

      {/* One block per released series */}
      {myReleased.map((s) => {
        const mine = s.fixtures
          .filter((f) => f.home === club.id || f.away === club.id)
          .sort((a, b) => a.date.localeCompare(b.date));

        return (
          <div key={s.id} className="club-fix-series">
            <div className="club-fix-series-head">
              <div>
                <div className="club-fix-series-eyebrow">
                  Released ·{' '}
                  {new Date(s.releasedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
                <div className="club-fix-series-name">{s.name}</div>
                <div className="club-fix-series-meta">
                  {s.teams.length} clubs · {s.maxOvers} overs · {s.seriesType} · {mine.length} of
                  your matches
                </div>
              </div>
              <div className="club-fix-series-tags">
                {(s.tags || []).map((t, i) => (
                  <Pill key={i} tone="muted">
                    {t}
                  </Pill>
                ))}
              </div>
            </div>

            <div className="tbl-w">
              <table className="tbl">
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>Rd</th>
                    <th>Date</th>
                    <th>Opponent</th>
                    <th>H/A</th>
                    <th>Venue</th>
                    <th style={{ textAlign: 'right' }}>Distance</th>
                    <th style={{ textAlign: 'right' }}>Travel cost</th>
                  </tr>
                </thead>
                <tbody>
                  {mine.map((f) => {
                    const isHome = f.home === club.id;
                    const opp = clubBy(isHome ? f.away : f.home);
                    const venueName = isHome
                      ? club.ground?.venue || 'Home ground TBA'
                      : opp?.ground?.venue || 'Opponent ground TBA';
                    let dist = null,
                      cost = null;
                    if (!isHome && opp && opp.ground && club.ground) {
                      const c = fixtureCost(opp, club, s.costPerKm || 4.5, s.carsPerAwayTrip || 3);
                      dist = c.roundTripKm;
                      cost = c.fuelR;
                    }
                    return (
                      <tr key={f.id}>
                        <td>
                          <span
                            style={{
                              fontFamily: "'Montserrat',sans-serif",
                              fontWeight: 700,
                              color: 'var(--muted)',
                            }}
                          >
                            R{f.round}
                          </span>
                        </td>
                        <td>
                          <div
                            style={{
                              fontFamily: "'Montserrat',sans-serif",
                              fontWeight: 700,
                              fontSize: 13,
                              color: 'var(--ink)',
                            }}
                          >
                            {new Date(f.date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </div>
                          <div
                            style={{
                              fontSize: 10.5,
                              color: 'var(--muted)',
                              fontWeight: 500,
                              fontFamily: "'Montserrat',sans-serif",
                            }}
                          >
                            {new Date(f.date).toLocaleDateString('en-GB', { weekday: 'long' })}
                          </div>
                        </td>
                        <td>
                          <ClubNameCell club={opp || { name: 'TBA', short: 'TBA' }} />
                        </td>
                        <td>
                          {isHome ? (
                            <Pill tone="teal" dot>
                              Home
                            </Pill>
                          ) : (
                            <Pill tone="gold" dot>
                              Away
                            </Pill>
                          )}
                        </td>
                        <td>
                          <div
                            style={{
                              fontSize: 12.5,
                              fontFamily: "'Montserrat',sans-serif",
                              fontWeight: 600,
                              color: 'var(--ink)',
                            }}
                          >
                            {venueName}
                          </div>
                          {!isHome && opp?.ground?.suburb && (
                            <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>
                              {opp.ground.suburb}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: "'Montserrat',sans-serif" }}>
                          {dist !== null ? (
                            <span style={{ fontWeight: 700, fontSize: 12.5 }}>
                              {Math.round(dist)} km
                            </span>
                          ) : (
                            <span style={{ color: 'var(--muted-2)' }}>—</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: "'Montserrat',sans-serif" }}>
                          {cost !== null ? (
                            <span style={{ fontWeight: 800, color: 'var(--green)', fontSize: 13 }}>
                              R {Math.round(cost).toLocaleString()}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--muted-2)' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Footnote */}
      <div className="club-fix-foot">
        Travel cost is estimated at R {myReleased[0]?.costPerKm || 4.5}/km ×{' '}
        {myReleased[0]?.carsPerAwayTrip || 3} cars per away trip — published with the fixture
        release. Adjustments to schedule require a Lions office sign-off.
      </div>
    </div>
  );
}

/* ─── Phase 3 · Players (club roster + Register Player form) ─── */
function ClubPlayersView({
  club,
  players,
  clearanceRequests,
  onOpenRegister,
  onRequestClearance,
  clubs,
  subs = {},
  onToggleSubs,
  toast,
}) {
  const mine = players.filter((p) => p.clubId === club.id);
  const myOutgoing = clearanceRequests.filter((r) => r.fromClubId === club.id);

  // Stats
  const byTeam = {};
  mine.forEach((p) => {
    byTeam[p.team] = (byTeam[p.team] || 0) + 1;
  });
  const allRounders = mine.filter((p) => p.isAllRounder).length;
  const wks = mine.filter((p) => p.isWk).length;
  const pendingClearance = mine.filter((p) => p.status === 'clearance-pending').length;
  const subsPaidCount = mine.filter((p) => subs[p.id]?.paid).length;
  const subsTotal = mine.reduce((acc, p) => acc + (subs[p.id]?.paid ? subs[p.id].amount : 0), 0);

  const clubBy = (id) => clubs.find((c) => c.id === id);

  return (
    <div>
      <div className="page-head">
        <div className="ph-left">
          <div className="ph-crumb">Club Portal · {club.name} / Players</div>
          <h1 className="ph-title">
            Player <em>Roster</em>
          </h1>
          <p className="ph-desc">
            Register and maintain {club.name}'s playing members for the 2026/27 KZNCU &amp; EMCU
            season. All registrations sync with the Union office and your fixtures.
          </p>
        </div>
        <div className="ph-actions">
          <Btn tone="outline" size="sm" icon={Icon.Download}>
            Export roster
          </Btn>
          <Btn tone="teal" size="sm" icon={Icon.Plus} onClick={onOpenRegister}>
            Register player
          </Btn>
        </div>
      </div>

      {/* Quick stats strip */}
      <div className="players-stats">
        <div className="players-stat">
          <div className="players-stat-l">Registered</div>
          <div className="players-stat-n">{mine.length}</div>
        </div>
        <div className="players-stat">
          <div className="players-stat-l">All-rounders</div>
          <div className="players-stat-n">{allRounders}</div>
        </div>
        <div className="players-stat">
          <div className="players-stat-l">WK keepers</div>
          <div className="players-stat-n">{wks}</div>
        </div>
        <div className="players-stat">
          <div className="players-stat-l">Awaiting clearance</div>
          <div
            className="players-stat-n"
            style={{ color: pendingClearance ? 'var(--coral)' : 'var(--ink)' }}
          >
            {pendingClearance}
          </div>
        </div>
        <div className="players-stat">
          <div className="players-stat-l">Subs paid</div>
          <div className="players-stat-n" style={{ color: subsPaidCount === mine.length && mine.length ? 'var(--green)' : 'var(--ink)' }}>
            {subsPaidCount}<span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}> / {mine.length}</span>
          </div>
          {subsTotal > 0 && (
            <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 2, fontFamily: "'Montserrat',sans-serif", fontWeight: 600 }}>
              R {subsTotal.toLocaleString()} in
            </div>
          )}
        </div>
      </div>

      <div className="tbl-w" style={{ marginTop: 14 }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Player</th>
              <th>ID number</th>
              <th>Team</th>
              <th>Role</th>
              <th>Bowler type</th>
              <th>ID doc</th>
              <th>Status</th>
              <th style={{ width: 130 }}>Subs</th>
              <th style={{ width: 140 }}></th>
            </tr>
          </thead>
          <tbody>
            {mine.map((p) => {
              const outbound = myOutgoing.find((r) => r.playerId === p.id);
              const roleBits = [
                p.battingHand + ' hand',
                p.battingType,
                p.isAllRounder ? 'All-rounder' : null,
                p.isWk ? 'WK' : null,
              ]
                .filter(Boolean)
                .join(' · ');
              return (
                <tr key={p.id}>
                  <td>
                    <div
                      style={{
                        fontFamily: "'Montserrat',sans-serif",
                        fontWeight: 700,
                        fontSize: 13,
                        color: 'var(--ink)',
                      }}
                    >
                      {p.firstNames} {p.surname}
                    </div>
                    <div
                      style={{
                        fontSize: 10.5,
                        color: 'var(--muted)',
                        fontFamily: "'Montserrat',sans-serif",
                      }}
                    >
                      {p.district} · {p.gender}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: "'Montserrat',sans-serif",
                        fontSize: 12,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {p.idNumber}
                    </span>
                  </td>
                  <td>
                    <Pill tone="navy">{p.team}</Pill>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 11.5,
                        color: 'var(--muted)',
                        fontFamily: "'Montserrat',sans-serif",
                      }}
                    >
                      {roleBits}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 11.5,
                        color: 'var(--muted)',
                        fontFamily: "'Montserrat',sans-serif",
                      }}
                    >
                      {p.bowlerType || '—'}
                    </span>
                  </td>
                  <td>
                    {p.idDocumentUploaded ? (
                      <Pill tone="teal" dot>
                        Uploaded
                      </Pill>
                    ) : (
                      <Pill tone="coral" dot>
                        Missing
                      </Pill>
                    )}
                  </td>
                  <td>
                    {p.status === 'active' ? (
                      <Pill tone="teal" dot>
                        Active
                      </Pill>
                    ) : p.status === 'clearance-pending' ? (
                      <Pill tone="gold" dot>
                        Clearance pending
                      </Pill>
                    ) : (
                      <Pill tone="muted">Inactive</Pill>
                    )}
                  </td>
                  <td>
                    {(() => {
                      const s = subs[p.id];
                      const paid = s?.paid;
                      return (
                        <button
                          className={`subs-pill ${paid ? 'on' : 'off'}`}
                          onClick={() => onToggleSubs?.(p, s?.amount || SUBSCRIPTION_DEFAULT_ZAR)}
                          title={paid ? `Paid R ${s.amount.toLocaleString()} · ${s.date}` : 'Mark subs paid'}
                        >
                          {paid ? (
                            <>
                              <span className="subs-tick">✓</span>
                              R {s.amount.toLocaleString()}
                            </>
                          ) : (
                            <>Mark paid</>
                          )}
                        </button>
                      );
                    })()}
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: 14 }}>
                    {p.status === 'active' && !outbound && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => onRequestClearance(p.id)}
                      >
                        Request clearance
                      </button>
                    )}
                    {outbound && (
                      <span
                        style={{
                          fontSize: 10.5,
                          color: 'var(--muted)',
                          fontFamily: "'Montserrat',sans-serif",
                        }}
                      >
                        → {clubBy(outbound.toClubId)?.short || clubBy(outbound.toClubId)?.name}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {mine.length === 0 && (
              <tr>
                <td
                  colSpan="9"
                  style={{
                    padding: '28px',
                    textAlign: 'center',
                    color: 'var(--muted)',
                    fontSize: 13,
                  }}
                >
                  No players registered yet — click <strong>Register player</strong> to add your
                  first.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const EMPTY_PLAYER = {
  surname: '',
  firstNames: '',
  idNumber: '',
  race: '',
  gender: '',
  postalAddress: '',
  postalCode: '',
  phone: '',
  email: '',
  team: '',
  district: '',
  lastClub: '',
  battingHand: 'Right',
  battingType: 'Mid Order',
  bowlingHand: 'Right',
  isAllRounder: false,
  isWk: false,
  bowlerType: '',
  idDocumentName: '',
  idDocumentUploaded: false,
  consentChecked: false,
};

function RegisterPlayerForm({ club, onSubmit, onCancel, toast }) {
  const [d, setD] = useState({
    ...EMPTY_PLAYER,
    team: club.id === 'ukzn' ? 'Premier Men' : 'Promotion Men',
  });

  function set(k, v) {
    setD((prev) => ({ ...prev, [k]: v }));
  }

  // Derive DOB from SA ID number: YYMMDDXXXXXXX → 19YY-MM-DD (with 2000+ cutoff)
  function deriveDOB(id) {
    if (!/^\d{13}$/.test(id)) return '';
    const yy = parseInt(id.slice(0, 2), 10);
    const mm = id.slice(2, 4);
    const dd = id.slice(4, 6);
    const year = yy <= 25 ? 2000 + yy : 1900 + yy;
    return `${year}-${mm}-${dd}`;
  }
  const dob = deriveDOB(d.idNumber);
  const idValid = /^\d{13}$/.test(d.idNumber);

  const required = [
    'surname',
    'firstNames',
    'idNumber',
    'race',
    'gender',
    'phone',
    'team',
    'district',
  ];
  const missing = required.filter((k) => !d[k]);
  const canSubmit = missing.length === 0 && d.idDocumentUploaded && d.consentChecked && idValid;

  function fakeUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    set('idDocumentName', file.name);
    set('idDocumentUploaded', true);
    toast?.(`ID document attached · ${file.name}`);
  }

  function submit() {
    if (!canSubmit) {
      toast?.('Fill all required fields, upload ID, accept consent');
      return;
    }
    const player = {
      ...d,
      id: 'ply-' + Date.now(),
      clubId: club.id,
      dob,
      registeredAt: new Date().toISOString().slice(0, 10),
      status: 'active',
    };
    onSubmit(player);
  }

  return (
    <div>
      {/* Header eyebrow already in TaskModal */}
      <div className="rp-form">
        {/* SECTION 1 — Club + team */}
        <div className="rp-section">
          <div className="rp-section-head">
            <div className="rp-section-eyebrow">Section 01</div>
            <div className="rp-section-title">Club &amp; Team</div>
          </div>
          <div className="field-grid-2">
            <div>
              <label className="field-label">Club</label>
              <input className="field-input" value={club.name} disabled />
            </div>
            <div>
              <label className="field-label">
                Team <span className="req">*</span>
              </label>
              <select
                className="field-select"
                value={d.team}
                onChange={(e) => set('team', e.target.value)}
              >
                <option value="">Select team</option>
                <option>Premier Men</option>
                <option>Promotion Men</option>
                <option>Premier Women</option>
                <option>Veterans</option>
                <option>EMCU Division 1</option>
                <option>Under-19</option>
                <option>Under-15</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2 — Identity */}
        <div className="rp-section">
          <div className="rp-section-head">
            <div className="rp-section-eyebrow">Section 02</div>
            <div className="rp-section-title">Player identity</div>
          </div>
          <div className="field-grid-2">
            <div>
              <label className="field-label">
                Surname <span className="req">*</span>
              </label>
              <input
                className="field-input"
                value={d.surname}
                onChange={(e) => set('surname', e.target.value)}
                placeholder="e.g. Gangadu"
              />
            </div>
            <div>
              <label className="field-label">
                First name(s) <span className="req">*</span>
              </label>
              <input
                className="field-input"
                value={d.firstNames}
                onChange={(e) => set('firstNames', e.target.value)}
                placeholder="e.g. Wishalen"
              />
            </div>
          </div>
          <div className="field-grid-2" style={{ marginTop: 12 }}>
            <div>
              <label className="field-label">
                ID number <span className="req">*</span>
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 9,
                    fontWeight: 600,
                    color: 'var(--coral)',
                    letterSpacing: '0.12em',
                  }}
                >
                  COMPULSORY
                </span>
              </label>
              <input
                className="field-input"
                value={d.idNumber}
                onChange={(e) => set('idNumber', e.target.value.replace(/\D/g, '').slice(0, 13))}
                placeholder="13-digit RSA ID"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              />
              {d.idNumber && !idValid && (
                <div
                  style={{
                    fontSize: 10.5,
                    color: 'var(--coral)',
                    marginTop: 4,
                    fontFamily: "'Montserrat',sans-serif",
                  }}
                >
                  Must be exactly 13 digits.
                </div>
              )}
              {dob && (
                <div
                  style={{
                    fontSize: 10.5,
                    color: 'var(--muted)',
                    marginTop: 4,
                    fontFamily: "'Montserrat',sans-serif",
                  }}
                >
                  ✓ Date of birth: <strong style={{ color: 'var(--ink)' }}>{dob}</strong>
                </div>
              )}
            </div>
            <div>
              <label className="field-label">
                Race <span className="req">*</span>
              </label>
              <select
                className="field-select"
                value={d.race}
                onChange={(e) => set('race', e.target.value)}
              >
                <option value="">Select</option>
                <option>African</option>
                <option>Indian</option>
                <option>Coloured</option>
                <option>White</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div className="field-grid-2" style={{ marginTop: 12 }}>
            <div>
              <label className="field-label">
                Gender <span className="req">*</span>
              </label>
              <select
                className="field-select"
                value={d.gender}
                onChange={(e) => set('gender', e.target.value)}
              >
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Non-binary</option>
              </select>
            </div>
            <div>
              <label className="field-label">
                Phone <span className="req">*</span>
              </label>
              <input
                className="field-input"
                type="tel"
                value={d.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="065 299 1365"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3 — Address */}
        <div className="rp-section">
          <div className="rp-section-head">
            <div className="rp-section-eyebrow">Section 03</div>
            <div className="rp-section-title">Address &amp; contact</div>
          </div>
          <div>
            <label className="field-label">Postal address</label>
            <input
              className="field-input"
              value={d.postalAddress}
              onChange={(e) => set('postalAddress', e.target.value)}
              placeholder="67 Fiona Street, Mobeni Heights"
            />
          </div>
          <div className="field-grid-2" style={{ marginTop: 12 }}>
            <div>
              <label className="field-label">Postal code</label>
              <input
                className="field-input"
                value={d.postalCode}
                onChange={(e) => set('postalCode', e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="4092"
              />
            </div>
            <div>
              <label className="field-label">Email</label>
              <input
                className="field-input"
                type="email"
                value={d.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="player@example.com"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4 — Cricket profile */}
        <div className="rp-section">
          <div className="rp-section-head">
            <div className="rp-section-eyebrow">Section 04</div>
            <div className="rp-section-title">Playing profile</div>
          </div>
          <div className="field-grid-2">
            <div>
              <label className="field-label">Batting hand</label>
              <div className="seg">
                {HANDS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    className={`seg-btn ${d.battingHand === h ? 'on' : ''}`}
                    onClick={() => set('battingHand', h)}
                  >
                    {h} hander
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="field-label">Bowling hand</label>
              <div className="seg">
                {HANDS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    className={`seg-btn ${d.bowlingHand === h ? 'on' : ''}`}
                    onClick={() => set('bowlingHand', h)}
                  >
                    {h} hander
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="field-grid-2" style={{ marginTop: 12 }}>
            <div>
              <label className="field-label">Batting type</label>
              <select
                className="field-select"
                value={d.battingType}
                onChange={(e) => set('battingType', e.target.value)}
              >
                {BATTING_TYPES.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Bowler type</label>
              <select
                className="field-select"
                value={d.bowlerType}
                onChange={(e) => set('bowlerType', e.target.value)}
              >
                <option value="">— Not a bowler —</option>
                {BOWLER_TYPES.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="row" style={{ marginTop: 12, gap: 14, flexWrap: 'wrap' }}>
            <label className="rp-check">
              <input
                type="checkbox"
                checked={d.isAllRounder}
                onChange={(e) => set('isAllRounder', e.target.checked)}
              />
              <span>All-rounder</span>
            </label>
            <label className="rp-check">
              <input
                type="checkbox"
                checked={d.isWk}
                onChange={(e) => set('isWk', e.target.checked)}
              />
              <span>Wicket-keeper</span>
            </label>
          </div>
        </div>

        {/* SECTION 5 — Registration history */}
        <div className="rp-section">
          <div className="rp-section-head">
            <div className="rp-section-eyebrow">Section 05</div>
            <div className="rp-section-title">Registration history</div>
          </div>
          <div className="field-grid-2">
            <div>
              <label className="field-label">Club for which last registered</label>
              <input
                className="field-input"
                value={d.lastClub}
                onChange={(e) => set('lastClub', e.target.value)}
                placeholder="Previous club, or — if first registration"
              />
            </div>
            <div>
              <label className="field-label">
                District <span className="req">*</span>
              </label>
              <input
                className="field-input"
                value={d.district}
                onChange={(e) => set('district', e.target.value)}
                placeholder="e.g. Chatsworth"
              />
            </div>
          </div>
        </div>

        {/* SECTION 6 — ID upload */}
        <div className="rp-section">
          <div className="rp-section-head">
            <div className="rp-section-eyebrow">Section 06</div>
            <div className="rp-section-title">
              ID document upload{' '}
              <span style={{ color: 'var(--coral)', fontWeight: 700, fontSize: 11, marginLeft: 6 }}>
                REQUIRED
              </span>
            </div>
          </div>
          <div className={`rp-upload ${d.idDocumentUploaded ? 'uploaded' : ''}`}>
            <input
              id="rp-id-file"
              type="file"
              accept="image/*,application/pdf"
              onChange={fakeUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="rp-id-file" className="rp-upload-inner">
              {d.idDocumentUploaded ? (
                <>
                  <div className="rp-upload-icon ok">
                    <Icon.Check />
                  </div>
                  <div>
                    <div className="rp-upload-title">{d.idDocumentName}</div>
                    <div className="rp-upload-sub">
                      Click to replace · The Union office reviews ID documents on submission.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="rp-upload-icon">
                    <Icon.Upload />
                  </div>
                  <div>
                    <div className="rp-upload-title">Tap to attach ID document</div>
                    <div className="rp-upload-sub">
                      SA ID book photo or scan · JPG, PNG or PDF · max ~5MB
                    </div>
                  </div>
                </>
              )}
            </label>
          </div>
        </div>

        {/* CONSENT */}
        <div className="rp-section rp-consent">
          <label className="rp-check">
            <input
              type="checkbox"
              checked={d.consentChecked}
              onChange={(e) => set('consentChecked', e.target.checked)}
            />
            <span>
              I, on behalf of <strong>{club.name}</strong>, request to register the above player
              under the
              <strong> KZNCU &amp; EMCU Rules and Byelaws</strong>. I declare that the player is not
              being paid by the club for their services as a cricketer.
            </span>
          </label>
        </div>

        <div className="rp-actions">
          <Btn tone="outline" onClick={onCancel}>
            Cancel
          </Btn>
          <Btn tone="teal" icon={Icon.Check} onClick={submit} disabled={!canSubmit}>
            Submit registration
          </Btn>
        </div>
        {!canSubmit && (missing.length || !d.idDocumentUploaded || !d.consentChecked) && (
          <div
            style={{
              fontSize: 11,
              color: 'var(--muted)',
              marginTop: 8,
              fontFamily: "'Montserrat',sans-serif",
              textAlign: 'right',
            }}
          >
            {missing.length > 0 && <>Missing: {missing.join(', ')}. </>}
            {!d.idDocumentUploaded && <>Attach ID. </>}
            {!d.consentChecked && <>Consent required.</>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Phase 4 · Clearances (club side) ─── */
function ClubClearancesView({
  club,
  players,
  clearanceRequests,
  clubs,
  onClearFees,
  onClearMisconduct,
  onApproveClearance,
  toast,
}) {
  const playerBy = (id) => players.find((p) => p.id === id);
  const clubBy = (id) => clubs.find((c) => c.id === id);

  const incoming = clearanceRequests.filter((r) => r.fromClubId === club.id);
  const outgoing = clearanceRequests.filter((r) => r.toClubId === club.id);

  const incomingPending = incoming.filter((r) => r.status === 'pending');
  const incomingResolved = incoming.filter((r) => r.status !== 'pending');

  return (
    <div>
      <div className="page-head">
        <div className="ph-left">
          <div className="ph-crumb">Club Portal · {club.name} / Clearances</div>
          <h1 className="ph-title">
            Player <em>Clearance Requests</em>
          </h1>
          <p className="ph-desc">
            Players leaving {club.name} need a clearance certificate. Confirm{' '}
            <strong>fees cleared</strong> and
            <strong> misconduct charges cleared</strong> within <strong>14 days</strong>, or the
            Lions Union office may override and approve on your behalf.
          </p>
        </div>
      </div>

      {/* Incoming — players wanting to LEAVE this club */}
      <Card
        title="Incoming requests"
        sub={`Players asking to leave ${club.name}. You have 14 days to action each one.`}
      >
        {incomingPending.length === 0 && incomingResolved.length === 0 && (
          <div
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              color: 'var(--muted)',
              fontSize: 13,
            }}
          >
            No clearance requests pending. Players will appear here when they apply to move clubs.
          </div>
        )}
        <div className="clr-list">
          {incomingPending.map((req) => {
            const player = playerBy(req.playerId);
            const dest = clubBy(req.toClubId);
            const daysLeft = clearanceDaysRemaining(req);
            const overdue = isClearanceOverdue(req);
            return (
              <div key={req.id} className={`clr-card ${overdue ? 'overdue' : ''}`}>
                <div className="clr-card-head">
                  <div>
                    <div className="clr-eyebrow">
                      {overdue
                        ? '⚠ Overdue · Lions may override'
                        : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} remaining`}
                    </div>
                    <div className="clr-name">
                      {player?.firstNames} {player?.surname}
                    </div>
                    <div className="clr-meta">
                      {player?.team} · ID {player?.idNumber} · Requested{' '}
                      {new Date(req.requestedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                  </div>
                  <div className="clr-route">
                    <div className="clr-route-from">{club.short || club.name}</div>
                    <Icon.Arrow />
                    <div className="clr-route-to">{dest?.short || dest?.name || '—'}</div>
                  </div>
                </div>
                {req.note && <div className="clr-note">"{req.note}"</div>}
                <div className="clr-checklist">
                  <button
                    className={`clr-check ${req.feesCleared ? 'on' : ''}`}
                    onClick={() => onClearFees(req.id)}
                  >
                    <span className="clr-check-box">{req.feesCleared && <Icon.Check />}</span>
                    <span className="clr-check-label">Fees cleared</span>
                    <span className="clr-check-sub">
                      All monies due to {club.name} paid in full
                    </span>
                  </button>
                  <button
                    className={`clr-check ${req.misconductCleared ? 'on' : ''}`}
                    onClick={() => onClearMisconduct(req.id)}
                  >
                    <span className="clr-check-box">{req.misconductCleared && <Icon.Check />}</span>
                    <span className="clr-check-label">Misconduct cleared</span>
                    <span className="clr-check-sub">No outstanding disciplinary charges</span>
                  </button>
                </div>
                {req.feesCleared && req.misconductCleared && req.status === 'pending' && (
                  <div className="clr-ready">
                    <span className="clr-ready-msg">
                      ✓ Both checks complete. Issue clearance certificate.
                    </span>
                    <Btn
                      tone="teal"
                      size="sm"
                      icon={Icon.Arrow}
                      onClick={() => onApproveClearance(req.id)}
                    >
                      Issue clearance to {dest?.short || dest?.name}
                    </Btn>
                  </div>
                )}
              </div>
            );
          })}
          {incomingResolved.map((req) => {
            const player = playerBy(req.playerId);
            const dest = clubBy(req.toClubId);
            return (
              <div key={req.id} className="clr-card resolved">
                <div className="clr-card-head">
                  <div>
                    <div className="clr-eyebrow" style={{ color: 'var(--green)' }}>
                      {req.status === 'admin-override' ? 'Lions override' : 'Issued'} ·{' '}
                      {new Date(req.clubApprovedAt || req.adminOverrideAt).toLocaleDateString(
                        'en-GB',
                        { day: 'numeric', month: 'short' }
                      )}
                    </div>
                    <div className="clr-name">
                      {player?.firstNames} {player?.surname}
                    </div>
                    <div className="clr-meta">
                      {player?.team} · Now at {dest?.name}
                    </div>
                  </div>
                  <Pill tone="teal" dot>
                    {req.status === 'admin-override' ? 'Lions approved' : 'Cleared'}
                  </Pill>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Outgoing — this club is the destination */}
      {outgoing.length > 0 && (
        <Card title="Players moving to your club" sub="Awaiting clearance from their current club">
          <div className="clr-list">
            {outgoing.map((req) => {
              const player = playerBy(req.playerId);
              const src = clubBy(req.fromClubId);
              return (
                <div key={req.id} className="clr-card incoming">
                  <div className="clr-card-head">
                    <div>
                      <div className="clr-eyebrow">
                        Incoming · {req.status === 'pending' ? 'Pending source club' : 'Cleared'}
                      </div>
                      <div className="clr-name">
                        {player?.firstNames} {player?.surname}
                      </div>
                      <div className="clr-meta">
                        From <strong>{src?.name}</strong> · Requested{' '}
                        {new Date(req.requestedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </div>
                    </div>
                    {req.status === 'pending' ? (
                      <Pill tone="gold" dot>
                        Waiting on {src?.short || src?.name}
                      </Pill>
                    ) : (
                      <Pill tone="teal" dot>
                        Cleared
                      </Pill>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

export {
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
};

/* ─── Club-side Facilities · manage venue from the chair's seat ─── */

// Small helper: turn a raw asset object into a card-friendly summary.
function ClubAssetSummary({ assets }) {
  const rows = [
    { l: 'Pitch square', k: 'pitch' },
    { l: 'Covers', k: 'covers' },
    { l: 'Outdoor nets', k: 'nets.outdoor' },
    { l: 'Indoor nets', k: 'nets.indoor' },
    { l: 'Bowling machines', k: 'nets.bowlingMachines' },
  ];
  function getAt(path) {
    return path.split('.').reduce((r, p) => r?.[p], assets) || {};
  }
  return (
    <div className="cf-summary-grid">
      {rows.map((r) => {
        const a = getAt(r.k);
        return (
          <div key={r.k} className="cf-summary-tile">
            <div className="cf-summary-l">{r.l}</div>
            <div className="cf-summary-n">
              {r.k === 'covers' ? (a.has ? a.count : '0') : a.count ?? '—'}
            </div>
            {a.condition > 0 && (
              <ConditionStars score={a.condition} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function AddStaffModal({ club, onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Assistant');
  const [phone, setPhone] = useState('');
  const [years, setYears] = useState(1);

  const canSubmit = name.trim() && phone.trim();

  function submit() {
    if (!canSubmit) return;
    onSubmit({
      id: 'gs-c-' + Date.now(),
      name: name.trim(),
      role,
      phone: phone.trim(),
      years: Number(years) || 0,
    });
  }

  return (
    <div className="fix-confirm" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="fix-confirm-box jobmodal-box">
        <div className="fac-jobmodal-head">
          <div>
            <div className="fac-detail-eyebrow">Groundstaff · {club.name}</div>
            <div className="fac-jobmodal-title">Add a person to your maintenance team</div>
          </div>
          <button className="fac-detail-close" onClick={onCancel}>
            <Icon.X />
          </button>
        </div>
        <div className="fac-jobmodal-body">
          <div className="field-grid-2">
            <div>
              <label className="field-label">Name <span className="req">*</span></label>
              <input
                className="field-input"
                placeholder="e.g. Sipho Dlamini"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Role</label>
              <select className="field-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option>Head Groundsman</option>
                <option>Assistant</option>
                <option>Curator</option>
                <option>Volunteer</option>
                <option>External contractor</option>
              </select>
            </div>
          </div>
          <div className="field-grid-2" style={{ marginTop: 12 }}>
            <div>
              <label className="field-label">Phone <span className="req">*</span></label>
              <input
                className="field-input"
                type="tel"
                placeholder="083 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Years on this ground</label>
              <input
                className="field-input"
                type="number"
                min="0"
                max="60"
                value={years}
                onChange={(e) => setYears(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="jobmodal-footer">
          <div className="jobmodal-footer-summary">
            <strong>{name || 'Unnamed'}</strong> · {role} · {years} yrs
          </div>
          <div className="jobmodal-footer-actions">
            <Btn tone="outline" onClick={onCancel}>Cancel</Btn>
            <Btn tone="teal" icon={Icon.Check} onClick={submit} disabled={!canSubmit}>
              Add to team
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClubFacilitiesView({ club, jobs = [], onLogReport, toast }) {
  // Baseline data from the Lions admin cohort — the club sees the same
  // seed record for their ground and can add / assess on top of it.
  const baseline = FACILITY_ASSETS[club.id] || null;
  const baseOwnership = FACILITY_OWNERSHIP[club.id] || null;

  // Local editable state for what the CLUB owns end-to-end.
  const [managed, setManaged] = useState(baseOwnership?.ownership === 'club' || baseOwnership?.ownership === 'university');
  const [ownerLabel, setOwnerLabel] = useState(baseOwnership?.ownerLabel || `${club.name} Executive`);
  const [staff, setStaff] = useState(() =>
    baseOwnership
      ? [baseOwnership.head, ...baseOwnership.assistants].map((s) => ({ ...s }))
      : []
  );
  const [addingStaff, setAddingStaff] = useState(false);

  // Assessment state — kept locally on the club side; issues carry a
  // reportedBy stamp so admins can see who logged what.
  const [assessments, setAssessments] = useState(baseline || {});
  const [assessing, setAssessing] = useState(null);
  const [customAssets, setCustomAssets] = useState([]);
  const [addingAsset, setAddingAsset] = useState(false);

  // Reported issues log — flatten everything the club has logged so it
  // can be shown as a "recent reports" list at the bottom.
  const allIssues = useMemo(() => {
    const list = [];
    const seenJobIds = new Set();
    function walk(obj, path, sourceLabel) {
      if (!obj || typeof obj !== 'object') return;
      if (Array.isArray(obj.issues)) {
        obj.issues.forEach((iss) => {
          if (typeof iss !== 'string' && iss?.reportedByClub) {
            list.push({ ...iss, sourceLabel: sourceLabel || path });
            if (iss.jobId) seenJobIds.add(iss.jobId);
          }
        });
      }
      if (obj.pitch) walk(obj.pitch, 'pitch', 'Pitch square');
      if (obj.covers) walk(obj.covers, 'covers', 'Covers');
      if (obj.nets) {
        if (obj.nets.outdoor) walk(obj.nets.outdoor, 'nets.outdoor', 'Outdoor nets');
        if (obj.nets.indoor) walk(obj.nets.indoor, 'nets.indoor', 'Indoor nets');
        if (obj.nets.bowlingMachines) walk(obj.nets.bowlingMachines, 'nets.bowlingMachines', 'Bowling machine');
      }
    }
    walk(assessments, '', '');
    customAssets.forEach((ca) => {
      (ca.issues || []).forEach((iss) => {
        if (typeof iss !== 'string' && iss?.reportedByClub) {
          list.push({ ...iss, sourceLabel: `${ca.category}${ca.description ? ' · ' + ca.description : ''}` });
          if (iss.jobId) seenJobIds.add(iss.jobId);
        }
      });
    });
    // Backfill from the shared jobs list — this keeps the reports panel
    // populated even after a role switch resets local assessment state.
    (jobs || []).forEach((j) => {
      if (!j.reportedByClub || j.reportedByClub.clubId !== club.id) return;
      if (seenJobIds.has(j.id)) return;
      const src = j.sourceIssue || {};
      list.push({
        jobId: j.id,
        category: src.category || j.title,
        severity: src.severity || 'moderate',
        location: src.location || '',
        notes: src.note || j.notes || '',
        icon: '⚠',
        reportedByClub: j.reportedByClub,
        reportedAt: j.reportedByClub?.at || j.createdAt,
        sourceLabel: src.assetLabel || j.typeLabel,
      });
    });
    return list.sort((a, b) => (b.reportedAt || '').localeCompare(a.reportedAt || ''));
  }, [assessments, customAssets, jobs, club.id]);

  // Resolve a human label for the asset key being reported on (used in the
  // job card the admin sees). Keeps it in sync with the pretty labels
  // rendered elsewhere in the view.
  function labelForKey(key) {
    if (!key) return 'Asset';
    if (key === 'pitch') return 'Pitch square';
    if (key === 'covers') return 'Covers';
    if (key === 'nets.outdoor') return 'Outdoor nets';
    if (key === 'nets.indoor') return 'Indoor nets';
    if (key === 'nets.bowlingMachines') return 'Bowling machines';
    if (key.startsWith('custom.')) {
      const id = key.slice(7);
      const asset = customAssets.find((a) => a.id === id);
      if (asset) return `${asset.category}${asset.description ? ' · ' + asset.description : ''}`;
    }
    return key;
  }

  // Save an assessment — CRITICAL bit: every issue gets the reportedByClub stamp
  // so admins can see who logged what. Newly-added issues (no jobId yet) also
  // materialise as job-card entries via onLogReport so admins can dispatch.
  function saveAssessment(key, next) {
    const assetLabel = labelForKey(key);
    const today = new Date().toISOString().slice(0, 10);
    const stampedIssues = (next.issues || []).map((iss) => {
      if (typeof iss === 'string') return iss;
      const reportedByClub = iss.reportedByClub || {
        clubId: club.id,
        clubName: club.name,
        chair: club.chair,
        at: today,
      };
      const reportedAt = iss.reportedAt || today;
      // Newly-authored issue with no linked job card yet → raise one.
      let jobId = iss.jobId;
      if (!jobId && onLogReport) {
        jobId = onLogReport(key, assetLabel, {
          category: iss.category,
          severity: iss.severity,
          location: iss.location,
          note: iss.note,
        });
      }
      return { ...iss, reportedByClub, reportedAt, jobId };
    });
    if (key.startsWith('custom.')) {
      const id = key.slice(7);
      setCustomAssets((prev) =>
        prev.map((ca) => (ca.id === id ? { ...ca, ...next, issues: stampedIssues } : ca))
      );
    } else {
      setAssessments((prev) => {
        const parts = key.split('.');
        const parent = { ...prev };
        let ref = parent;
        for (let i = 0; i < parts.length - 1; i++) {
          ref[parts[i]] = { ...ref[parts[i]] };
          ref = ref[parts[i]];
        }
        ref[parts[parts.length - 1]] = { ...ref[parts[parts.length - 1]], ...next, issues: stampedIssues };
        return parent;
      });
    }
    setAssessing(null);
    toast?.('Report submitted to the Lions office');
  }

  function addStaff(s) {
    setStaff((prev) => [...prev, s]);
    setAddingStaff(false);
    toast?.(`${s.name} added to team`);
  }
  function removeStaff(id) {
    setStaff((prev) => prev.filter((s) => s.id !== id));
  }

  function addCustomAsset(asset) {
    setCustomAssets((prev) => [...prev, { ...asset, id: 'cca-' + Date.now() }]);
    setAddingAsset(false);
    toast?.(`${asset.category} added to inventory · Lions office notified`);
  }

  // For the assessment mini-dashboard
  const today = new Date('2026-07-11');
  const inventoryKeys = [
    { key: 'pitch', label: 'Pitch', obj: assessments.pitch },
    { key: 'covers', label: 'Covers', obj: assessments.covers },
    { key: 'nets.outdoor', label: 'Outdoor nets', obj: assessments.nets?.outdoor },
    { key: 'nets.indoor', label: 'Indoor nets', obj: assessments.nets?.indoor },
    { key: 'nets.bowlingMachines', label: 'Bowling machines', obj: assessments.nets?.bowlingMachines },
    ...customAssets.map((ca) => ({
      key: `custom.${ca.id}`,
      label: `${ca.category}${ca.description ? ' · ' + ca.description : ''}`,
      obj: ca,
    })),
  ].filter((i) => i.obj);

  function statusFor(a) {
    if (!a?.lastAssessed) return { label: '⚠ Never assessed', tone: 'coral' };
    const d = Math.round((today - new Date(a.lastAssessed)) / 86400000);
    if (d > 30) return { label: `${d}d ago · overdue`, tone: 'coral' };
    if (d > 14) return { label: `${d}d ago`, tone: 'gold' };
    return { label: `${d}d ago`, tone: 'teal' };
  }
  const inventory = inventoryKeys.map((i) => ({ ...i, status: statusFor(i.obj) }));
  const overdue = inventory.filter((i) => i.status.tone === 'coral').length;
  const dueSoon = inventory.filter((i) => i.status.tone === 'gold').length;
  const current = inventory.filter((i) => i.status.tone === 'teal').length;
  const pct = inventory.length ? Math.round((current / inventory.length) * 100) : 0;

  return (
    <div>
      <div className="page-head">
        <div className="ph-left">
          <div className="ph-crumb">Club Portal · {club.name} / Facilities</div>
          <h1 className="ph-title">
            Facility <em>Reporting</em>
          </h1>
          <p className="ph-desc">
            Log the state of your ground for the Lions office, add the people who look after it,
            and record any issues you find. What you report here lands directly on the Lions admin
            facility dashboard.
          </p>
        </div>
        <div className="ph-actions">
          <Btn tone="outline" size="sm" onClick={() => setAddingStaff(true)} icon={Icon.Plus}>
            Add team member
          </Btn>
          <Btn tone="teal" size="sm" onClick={() => setAddingAsset(true)} icon={Icon.Plus}>
            Add asset
          </Btn>
        </div>
      </div>

      {/* SECTION 1 — VENUE MANAGEMENT DECLARATION */}
      <Card
        title={<>Do you manage this venue?</>}
        sub="Tell the Lions office whether your club runs the ground directly or shares it with another party."
      >
        <div className="cf-manage-row">
          <div className="cf-manage-toggle">
            <button
              className={`cf-manage-btn ${managed ? 'on' : ''}`}
              onClick={() => setManaged(true)}
            >
              <span className="cf-manage-icon">✅</span>
              <div>
                <div className="cf-manage-title">Yes — we manage the venue</div>
                <div className="cf-manage-sub">Our club is responsible for the ground and everything on it</div>
              </div>
            </button>
            <button
              className={`cf-manage-btn ${!managed ? 'on' : ''}`}
              onClick={() => setManaged(false)}
            >
              <span className="cf-manage-icon">🤝</span>
              <div>
                <div className="cf-manage-title">No — managed by another party</div>
                <div className="cf-manage-sub">Municipality, university, or shared arrangement</div>
              </div>
            </button>
          </div>
          <div className="cf-owner-field">
            <label className="field-label">
              {managed ? 'Which club body owns it?' : 'Who manages the venue?'}
            </label>
            <input
              className="field-input"
              value={ownerLabel}
              onChange={(e) => setOwnerLabel(e.target.value)}
              placeholder={managed ? 'e.g. Phoenix CC Executive' : 'e.g. eThekwini Metro · Parks & Rec'}
            />
          </div>
        </div>
      </Card>

      {/* SECTION 2 — GROUNDSTAFF */}
      <Card
        title={<>People running maintenance · {staff.length}</>}
        sub="Everyone on your ground team — the Lions office dispatches job cards to these people."
        actions={
          <Btn tone="outline" size="sm" icon={Icon.Plus} onClick={() => setAddingStaff(true)}>
            Add person
          </Btn>
        }
      >
        {staff.length === 0 ? (
          <div className="cf-empty">
            No one added yet — tap <strong>Add person</strong> to declare who's looking after the ground.
          </div>
        ) : (
          <div className="cf-staff-grid">
            {staff.map((s) => (
              <div key={s.id} className="cf-staff-card">
                <div className="fac-staff-avatar">
                  {s.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                </div>
                <div className="cf-staff-info">
                  <div className="fac-staff-name">{s.name}</div>
                  <div className="fac-staff-role">{s.role} · {s.years} yrs</div>
                  <div className="fac-staff-contact">{s.phone}</div>
                </div>
                <button className="cf-staff-remove" onClick={() => removeStaff(s.id)} title="Remove">
                  <Icon.X />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* SECTION 3 — ASSET INVENTORY + INSPECTION */}
      <Card
        title={<>Asset inventory · {inventory.length}</>}
        sub="What's on the ground and the last time each item was inspected. Tap an asset to log an issue."
        actions={
          <Btn tone="outline" size="sm" icon={Icon.Plus} onClick={() => setAddingAsset(true)}>
            Add asset
          </Btn>
        }
      >
        {/* Assessment status tiles */}
        <div className="fac-assess-dash">
          <div className={`fac-assess-tile ${overdue > 0 ? 'coral' : ''}`}>
            <div className="fac-assess-tile-l">Overdue</div>
            <div className="fac-assess-tile-n">{overdue}</div>
            <div className="fac-assess-tile-meta">
              {overdue > 0 ? 'Never assessed or >30 days' : 'None outstanding'}
            </div>
          </div>
          <div className={`fac-assess-tile ${dueSoon > 0 ? 'gold' : ''}`}>
            <div className="fac-assess-tile-l">Due soon</div>
            <div className="fac-assess-tile-n">{dueSoon}</div>
            <div className="fac-assess-tile-meta">Assessed 14–30 days ago</div>
          </div>
          <div className={`fac-assess-tile ${current > 0 ? 'teal' : ''}`}>
            <div className="fac-assess-tile-l">Current</div>
            <div className="fac-assess-tile-n">{current}</div>
            <div className="fac-assess-tile-meta">Assessed in the last 14 days</div>
          </div>
          <div className="fac-assess-tile progress">
            <div className="fac-assess-tile-l">Coverage</div>
            <div className="fac-assess-tile-n">
              {pct}
              <span>%</span>
            </div>
            <div className="fac-assess-tile-bar">
              <div className="fac-assess-tile-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="fac-assess-tile-meta">
              {current} of {inventory.length}
            </div>
          </div>
        </div>

        {/* Inventory picker + summary tiles */}
        <div className="fac-assets-toolbar" style={{ marginTop: 14 }}>
          <div className="fac-assets-picker">
            <label className="fac-assets-picker-l">
              Pick an asset to report on · {inventory.length}
              {overdue > 0 && (
                <span className="fac-assets-picker-warn"> · {overdue} need attention</span>
              )}
            </label>
            <select
              className="field-select fac-assets-picker-select"
              value=""
              onChange={(e) => e.target.value && setAssessing(e.target.value)}
            >
              <option value="">— Report on an asset —</option>
              {inventory.map((i) => (
                <option key={i.key} value={i.key}>
                  {i.status.tone === 'coral' ? '⚠ ' : i.status.tone === 'gold' ? '⏳ ' : '✓ '}
                  {i.label} · {i.status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {baseline && <ClubAssetSummary assets={assessments} />}

        {/* Custom assets the club has added */}
        {customAssets.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div className="fac-section-title">Assets you've added</div>
            <div className="cf-custom-assets">
              {customAssets.map((ca) => (
                <div key={ca.id} className="cf-custom-asset">
                  <div className="cf-custom-asset-head">
                    <div>
                      <div className="cf-custom-asset-title">
                        {ca.quantity} × {ca.subType || ca.category}
                        {ca.description ? ' · ' + ca.description : ''}
                      </div>
                      <div className="cf-custom-asset-meta">
                        {ca.condition ? `Condition ${ca.condition.toFixed(1)}/5` : 'Not yet assessed'}
                      </div>
                    </div>
                    <button
                      className="fac-asset-assess-btn"
                      onClick={() => setAssessing(`custom.${ca.id}`)}
                    >
                      Report ›
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* SECTION 4 — REPORTED ISSUES LOG */}
      <Card
        title={<>Reports you've submitted · {allIssues.length}</>}
        sub="Everything you've flagged to the Lions office · newest first."
      >
        {allIssues.length === 0 ? (
          <div className="cf-empty">
            You haven't reported any issues yet. Use the picker above to log wear, damage, or safety
            concerns.
          </div>
        ) : (
          <div className="cf-reports-list">
            {allIssues.map((iss, i) => {
              const linkedJob = iss.jobId ? jobs.find((j) => j.id === iss.jobId) : null;
              const jobStatus = linkedJob?.status;
              const statusLabel =
                jobStatus === 'done'
                  ? 'Resolved by admin'
                  : jobStatus === 'in-progress'
                    ? 'Admin working on it'
                    : jobStatus === 'open'
                      ? 'Sent to admin'
                      : 'Sent to admin';
              const statusTone =
                jobStatus === 'done' ? 'teal' : jobStatus === 'in-progress' ? 'gold' : 'muted';
              return (
                <div key={i} className={`assess-issue-card tone-${severityTone(iss.severity)}`}>
                  <div className="assess-issue-top">
                    <div className="assess-issue-cat">
                      <span className="assess-issue-cat-icon">{iss.icon || '⚠'}</span>
                      <div>
                        <div className="assess-issue-cat-l">
                          {iss.category} · <span style={{ fontWeight: 500 }}>{iss.sourceLabel}</span>
                        </div>
                        {iss.location && <div className="assess-issue-loc">📍 {iss.location}</div>}
                        {iss.notes && <div className="assess-issue-loc" style={{ marginTop: 2 }}>{iss.notes}</div>}
                      </div>
                    </div>
                    <div className="cf-report-meta">
                      <Pill tone={severityTone(iss.severity)} dot>
                        {(iss.severity || 'moderate')[0].toUpperCase() + (iss.severity || 'moderate').slice(1)}
                      </Pill>
                      <Pill tone={statusTone} dot>
                        {statusLabel}
                      </Pill>
                      <div className="cf-report-date">
                        {iss.reportedAt
                          ? new Date(iss.reportedAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                            })
                          : ''}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modals — reuse the admin components verbatim */}
      {assessing && ReactDOM.createPortal(
        <AssessmentEditor
          facility={{ clubId: club.id, venue: club.ground?.venue || club.name }}
          assetKey={assessing}
          assets={assessments}
          customAssets={customAssets}
          onSave={(next) => saveAssessment(assessing, next)}
          onCancel={() => setAssessing(null)}
        />,
        document.body
      )}
      {addingAsset && ReactDOM.createPortal(
        <AddAssetModal
          facility={{ clubId: club.id, venue: club.ground?.venue || club.name }}
          onSubmit={addCustomAsset}
          onCancel={() => setAddingAsset(false)}
        />,
        document.body
      )}
      {addingStaff && ReactDOM.createPortal(
        <AddStaffModal
          club={club}
          onSubmit={addStaff}
          onCancel={() => setAddingStaff(false)}
        />,
        document.body
      )}
    </div>
  );
}

/* ─── ClubVendorsView · Catalog + My Vendors ───
   Chairman sees every admin-published vendor (read-only "Catalog") and can
   also add + manage his own club-private vendors ("My vendors"). Anything
   flagged here can then be referenced against a cost entry on the Financials
   tab. */
function ClubVendorsView({ club, toast }) {
  const [tab, setTab] = useState('catalog');
  const [catFilter, setCatFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [addingVendor, setAddingVendor] = useState(false);
  const [myVendors, setMyVendors] = useState([]);

  const publishedCatalog = useMemo(
    () => VENDORS.filter((v) => v.status === 'onboarded' || v.status === 'verified'),
    []
  );

  function addVendor(v) {
    setMyVendors((prev) => [
      ...prev,
      {
        ...v,
        id: 'cv-' + Date.now(),
        clubId: club.id,
        status: 'onboarded',
        rating: 0,
        jobsCompleted: 0,
        onboardedAt: new Date().toISOString().slice(0, 10),
      },
    ]);
    setAddingVendor(false);
    toast?.(`${v.name} added to your vendor list`);
  }

  function removeVendor(id) {
    setMyVendors((prev) => prev.filter((v) => v.id !== id));
    toast?.('Vendor removed');
  }

  const activeList = tab === 'catalog' ? publishedCatalog : myVendors;

  const catCounts = activeList.reduce((acc, v) => {
    acc[v.category] = (acc[v.category] || 0) + 1;
    return acc;
  }, {});

  const filtered = activeList
    .filter((v) => (catFilter === 'all' ? true : v.category === catFilter))
    .filter((v) =>
      !query.trim()
        ? true
        : (v.name + ' ' + v.category + ' ' + v.contactPerson + ' ' + (v.services || []).join(' '))
            .toLowerCase()
            .includes(query.toLowerCase())
    );

  const catalogueGrouped = useMemo(() => {
    const groups = Object.entries(VENDOR_CATEGORY_GROUPS).map(([group, cats]) => ({
      group,
      cats,
      vendors: cats.reduce((acc, c) => {
        acc[c] = publishedCatalog.filter((v) => v.category === c);
        return acc;
      }, {}),
    }));
    return groups.filter((g) =>
      g.cats.some((c) => (g.vendors[c] || []).length > 0)
    );
  }, [publishedCatalog]);

  return (
    <div>
      <div className="page-head">
        <div className="ph-left">
          <div className="ph-crumb">Club Portal · {club.name} / Vendors</div>
          <h1 className="ph-title">
            Your <em>Vendors</em>
          </h1>
          <p className="ph-desc">
            Browse the Lions-approved vendor catalog and keep your own private list of the coaches,
            physios, and suppliers you already work with. Anything on either list can be linked to
            a cost on your Financials tab.
          </p>
        </div>
        <div className="ph-actions">
          <Btn tone="teal" size="sm" icon={Icon.Plus} onClick={() => setAddingVendor(true)}>
            Add my vendor
          </Btn>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="cv-tabs">
        <button
          className={`cv-tab ${tab === 'catalog' ? 'on' : ''}`}
          onClick={() => { setTab('catalog'); setCatFilter('all'); }}
        >
          <span className="cv-tab-l">Lions catalog</span>
          <span className="cv-tab-n">{publishedCatalog.length}</span>
        </button>
        <button
          className={`cv-tab ${tab === 'mine' ? 'on' : ''}`}
          onClick={() => { setTab('mine'); setCatFilter('all'); }}
        >
          <span className="cv-tab-l">My vendors</span>
          <span className="cv-tab-n">{myVendors.length}</span>
        </button>
      </div>

      {/* Filter row */}
      <div className="filter-row vendor-cat-row" style={{ marginTop: 14 }}>
        <span className="vendor-cat-label">Category</span>
        <button
          className={`filter-pill ${catFilter === 'all' ? 'active' : ''}`}
          onClick={() => setCatFilter('all')}
        >
          All <span style={{ opacity: 0.7, marginLeft: 4 }}>{activeList.length}</span>
        </button>
        {VENDOR_CATEGORIES.filter((c) => catCounts[c]).map((c) => (
          <button
            key={c}
            className={`filter-pill ${catFilter === c ? 'active' : ''}`}
            onClick={() => setCatFilter(c)}
          >
            {c} <span style={{ opacity: 0.7, marginLeft: 4 }}>{catCounts[c]}</span>
          </button>
        ))}
        <input
          className="field-input"
          style={{ maxWidth: 240, marginLeft: 'auto', height: 34 }}
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Catalog view: grouped by service area */}
      {tab === 'catalog' && catFilter === 'all' && !query.trim() && (
        <div className="cv-catalog">
          {catalogueGrouped.map((g) => (
            <div key={g.group} className="cv-group">
              <div className="cv-group-head">
                <span className="cv-group-title">{g.group}</span>
                <span className="cv-group-count">
                  {g.cats.reduce((n, c) => n + (g.vendors[c] || []).length, 0)} vendors
                </span>
              </div>
              <div className="cv-group-grid">
                {g.cats.map((c) => (g.vendors[c] || []).map((v) => (
                  <ClubVendorCard key={v.id} v={v} />
                )))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filtered / My vendors view: single grid */}
      {(tab === 'mine' || catFilter !== 'all' || query.trim()) && (
        <div className="cv-single-grid">
          {filtered.length === 0 && (
            <div className="cv-empty">
              {tab === 'mine'
                ? 'You haven\'t added any vendors yet. Add coaches, physios, or suppliers you already work with.'
                : 'No vendors match this filter.'}
            </div>
          )}
          {filtered.map((v) => (
            <ClubVendorCard
              key={v.id}
              v={v}
              own={tab === 'mine'}
              onRemove={tab === 'mine' ? () => removeVendor(v.id) : undefined}
            />
          ))}
        </div>
      )}

      {addingVendor && ReactDOM.createPortal(
        <AddClubVendorModal
          onSubmit={addVendor}
          onCancel={() => setAddingVendor(false)}
        />,
        document.body
      )}
    </div>
  );
}

function ClubVendorCard({ v, own, onRemove }) {
  return (
    <div className="cv-card">
      <div className="cv-card-head">
        <div>
          <div className="cv-card-name">{v.name}</div>
          <div className="cv-card-cat">{v.category}</div>
        </div>
        {v.rating > 0 && (
          <div className="cv-card-rating">
            ⭐ {v.rating.toFixed(1)}
            <div className="cv-card-jobs">{v.jobsCompleted} jobs</div>
          </div>
        )}
      </div>

      <div className="cv-card-contact">
        <div className="cv-card-person">{v.contactPerson}</div>
        <div className="cv-card-phone">{v.phone} · {v.email}</div>
      </div>

      {(v.services || []).length > 0 && (
        <div className="cv-card-services">
          {v.services.slice(0, 5).map((s) => (
            <span key={s} className="cv-card-service">{s}</span>
          ))}
          {v.services.length > 5 && (
            <span className="cv-card-service more">+{v.services.length - 5}</span>
          )}
        </div>
      )}

      {v.notes && (
        <div className="cv-card-notes">{v.notes}</div>
      )}

      {own && (
        <div className="cv-card-foot">
          <button className="cv-card-remove" onClick={onRemove}>
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── AddClubVendorModal · lightweight club-side vendor add ─── */
function AddClubVendorModal({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(VENDOR_CATEGORIES[0]);
  const [categoryOther, setCategoryOther] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [services, setServices] = useState([]);
  const [customService, setCustomService] = useState('');
  const [notes, setNotes] = useState('');

  const effectiveCategory = category === 'Other' ? (categoryOther.trim() || 'Other') : category;
  const canSubmit = name.trim() && contactPerson.trim() && phone.trim();

  function toggleService(s) {
    setServices((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }
  function addCustomService() {
    const s = customService.trim();
    if (!s) return;
    if (!services.includes(s)) setServices((prev) => [...prev, s]);
    setCustomService('');
  }

  function submit() {
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      category: effectiveCategory,
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      services,
      notes: notes.trim(),
    });
  }

  return (
    <div className="fix-confirm" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="fix-confirm-box jobmodal-box">
        <div className="fac-jobmodal-head">
          <div>
            <div className="fac-detail-eyebrow">Add my vendor</div>
            <div className="fac-jobmodal-title">Vendor details</div>
          </div>
          <button className="fac-detail-close" onClick={onCancel}>
            <Icon.X />
          </button>
        </div>

        <div className="fac-jobmodal-body">
          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Who</div>
            <div className="field-grid-2">
              <div>
                <label className="field-label">Business / person <span className="req">*</span></label>
                <input
                  className="field-input"
                  placeholder="e.g. Sanele Cele Cricket Academy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">Category <span className="req">*</span></label>
                <select
                  className="field-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {VENDOR_CATEGORIES.map((c) => (<option key={c}>{c}</option>))}
                </select>
                {category === 'Other' && (
                  <input
                    className="field-input"
                    style={{ marginTop: 8 }}
                    placeholder="Specify category…"
                    value={categoryOther}
                    onChange={(e) => setCategoryOther(e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Contact</div>
            <div className="field-grid-2">
              <div>
                <label className="field-label">Contact person <span className="req">*</span></label>
                <input
                  className="field-input"
                  placeholder="Name"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">Phone <span className="req">*</span></label>
                <input
                  className="field-input"
                  placeholder="083 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="field-label">Email</label>
              <input
                className="field-input"
                type="email"
                placeholder="them@vendor.co.za"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Services offered</div>
            <div className="vendor-services-grid">
              {VENDOR_SERVICES.map((s) => (
                <label key={s} className={`vendor-service ${services.includes(s) ? 'on' : ''}`}>
                  <input
                    type="checkbox"
                    checked={services.includes(s)}
                    onChange={() => toggleService(s)}
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <input
                className="field-input"
                style={{ flex: 1 }}
                placeholder="Add another service (e.g. Junior fielding clinics)…"
                value={customService}
                onChange={(e) => setCustomService(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomService())}
              />
              <Btn tone="outline" size="sm" onClick={addCustomService}>
                Add
              </Btn>
            </div>
            {services.filter((s) => !VENDOR_SERVICES.includes(s)).length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {services.filter((s) => !VENDOR_SERVICES.includes(s)).map((s) => (
                  <span key={s} className="cv-card-service">{s}</span>
                ))}
              </div>
            )}
          </div>

          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Notes</div>
            <textarea
              className="field-textarea"
              rows={3}
              placeholder="Rates, availability, who introduced them, anything worth remembering…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="jobmodal-footer">
          <div className="jobmodal-footer-summary">
            <strong>{name || 'Unnamed vendor'}</strong> · {effectiveCategory} ·{' '}
            <strong>{services.length}</strong> service{services.length === 1 ? '' : 's'}
          </div>
          <div className="jobmodal-footer-actions">
            <Btn tone="outline" onClick={onCancel}>Cancel</Btn>
            <Btn tone="teal" icon={Icon.Check} onClick={submit} disabled={!canSubmit}>
              Save vendor
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ClubFinancialsView · ledger + running totals + export ───
   Every rand the club spends — coach payroll, clinical bills, facility jobs,
   utilities, admin — is captured here. The chairman gets:
     · Running totals by group (Coaching / Player welfare / Facility / Admin)
     · Filterable ledger table with paid/unpaid state
     · Add entry modal (link to a vendor or free-text payee)
     · Export CSV button to hand straight to the accountant */
function ClubFinancialsView({ club, entries = [], onAddEntry, onUpdateEntry, onRemoveEntry, toast }) {
  const [filterDir, setFilterDir] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterPaid, setFilterPaid] = useState('all');
  const [adding, setAdding] = useState(null); // null | 'expense' | 'income' | 'sponsorship'

  const catMap = useMemo(() => {
    const m = {};
    CLUB_COST_CATEGORIES.forEach((c) => (m[c.key] = { ...c, direction: 'out' }));
    CLUB_INCOME_CATEGORIES.forEach((c) => (m[c.key] = { ...c, direction: 'in' }));
    return m;
  }, []);

  function addEntry(e) {
    onAddEntry?.(e);
    setAdding(null);
    const dirLabel = e.direction === 'in' ? 'in' : 'out';
    toast?.(`R ${e.amount.toLocaleString()} ${dirLabel} · ${catMap[e.category]?.label || e.category}`);
  }
  function togglePaid(id) {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    onUpdateEntry?.(id, { paid: !entry.paid });
  }
  function removeEntry(id) {
    onRemoveEntry?.(id);
    toast?.('Entry removed');
  }

  const filtered = entries
    .filter((e) => filterDir === 'all' ? true : (e.direction || 'out') === filterDir)
    .filter((e) => filterGroup === 'all' ? true : (catMap[e.category]?.group === filterGroup))
    .filter((e) => filterPaid === 'all' ? true : (filterPaid === 'paid' ? e.paid : !e.paid))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const totals = entries.reduce((acc, e) => {
    const dir = e.direction || 'out';
    const g = catMap[e.category]?.group || 'Other';
    const bucket = dir === 'in' ? '_in' : '_out';
    acc[bucket] = (acc[bucket] || 0) + e.amount;
    acc[`${dir}:${g}`] = (acc[`${dir}:${g}`] || 0) + e.amount;
    acc[`${dir}:_paid`] = (acc[`${dir}:_paid`] || 0) + (e.paid ? e.amount : 0);
    acc[`${dir}:_unpaid`] = (acc[`${dir}:_unpaid`] || 0) + (e.paid ? 0 : e.amount);
    return acc;
  }, {});
  totals._net = (totals._in || 0) - (totals._out || 0);

  const outGroups = ['Coaching', 'Player welfare', 'Facility', 'Administration'];
  const inGroups = CLUB_INCOME_GROUPS;
  const activeGroupList = filterDir === 'in' ? inGroups : filterDir === 'out' ? outGroups : [...inGroups, ...outGroups];

  function exportCSV() {
    const headers = ['Date', 'Direction', 'Category', 'Group', 'Payee', 'Description', 'Amount (ZAR)', 'Frequency', 'Invoice', 'Paid'];
    const rows = filtered.map((e) => {
      const dir = (e.direction || 'out') === 'in' ? 'IN' : 'OUT';
      return [
        e.date,
        dir,
        catMap[e.category]?.label || e.category,
        catMap[e.category]?.group || '',
        e.payee || '',
        (e.desc || '').replace(/\n/g, ' '),
        e.amount,
        e.frequency || '',
        e.invoice || '',
        e.paid ? 'Paid' : 'Unpaid',
      ];
    });
    const summary = [
      ['', '', '', '', '', 'TOTAL IN', totals._in || 0, '', '', ''],
      ['', '', '', '', '', 'TOTAL OUT', totals._out || 0, '', '', ''],
      ['', '', '', '', '', 'NET', totals._net || 0, '', '', ''],
    ];
    const csv = [headers, ...rows, ...summary]
      .map((r) => r.map((c) => {
        const s = String(c ?? '');
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${club.name.replace(/\s+/g, '_')}_financials_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast?.('Financial statement exported');
  }

  return (
    <div>
      <div className="page-head">
        <div className="ph-left">
          <div className="ph-crumb">Club Portal · {club.name} / Financials</div>
          <h1 className="ph-title">
            Financial <em>Ledger</em>
          </h1>
          <p className="ph-desc">
            Every rand the club spends — coach payroll, clinical bills, facility costs, admin —
            captured against a vendor or a free-text payee. Export as a CSV statement to hand
            straight to your accountant.
          </p>
        </div>
        <div className="ph-actions">
          <Btn tone="outline" size="sm" icon={Icon.Download} onClick={exportCSV}>
            Export statement
          </Btn>
          <Btn tone="outline" size="sm" icon={Icon.Plus} onClick={() => setAdding('sponsorship')}>
            Log sponsorship
          </Btn>
          <Btn tone="outline" size="sm" icon={Icon.Plus} onClick={() => setAdding('donation')}>
            Log donation
          </Btn>
          <Btn tone="outline" size="sm" icon={Icon.Plus} onClick={() => setAdding('income')}>
            Log income
          </Btn>
          <Btn tone="teal" size="sm" icon={Icon.Plus} onClick={() => setAdding('expense')}>
            Log a cost
          </Btn>
        </div>
      </div>

      {/* Direction KPI strip — IN / OUT / NET */}
      <div className="fin-flow-strip">
        <div className="fin-flow fin-flow-net" data-pos={totals._net >= 0 ? 'y' : 'n'}>
          <div className="fin-flow-l">Net position</div>
          <div className="fin-flow-n">
            {totals._net >= 0 ? '+' : '−'} R {Math.abs(totals._net).toLocaleString()}
          </div>
          <div className="fin-flow-sub">
            {totals._net >= 0
              ? 'Club is in surplus this season'
              : 'Club is running a deficit'}
          </div>
        </div>
        <div className="fin-flow fin-flow-in">
          <div className="fin-flow-l">↓ Money in</div>
          <div className="fin-flow-n">R {(totals._in || 0).toLocaleString()}</div>
          <div className="fin-flow-sub">
            {entries.filter((e) => (e.direction || 'out') === 'in').length} entries ·{' '}
            R {(totals['in:_paid'] || 0).toLocaleString()} received
          </div>
        </div>
        <div className="fin-flow fin-flow-out">
          <div className="fin-flow-l">↑ Money out</div>
          <div className="fin-flow-n">R {(totals._out || 0).toLocaleString()}</div>
          <div className="fin-flow-sub">
            {entries.filter((e) => (e.direction || 'out') === 'out').length} entries ·{' '}
            R {(totals['out:_unpaid'] || 0).toLocaleString()} outstanding
          </div>
        </div>
      </div>

      {/* Primary income streams — subs / sponsorships / donations */}
      <div className="fin-streams">
        <div className="fin-streams-head">
          <span className="fin-streams-title">Income streams</span>
          <span className="fin-streams-sub">
            R {((totals['in:Subscriptions'] || 0) + (totals['in:Sponsorships'] || 0) + (totals['in:Donations'] || 0)).toLocaleString()} across the three primary streams
          </span>
        </div>
        <div className="fin-streams-grid">
          {CLUB_PRIMARY_INCOME_GROUPS.map((g) => {
            const total = totals[`in:${g}`] || 0;
            const count = entries.filter((e) => (e.direction || 'out') === 'in' && catMap[e.category]?.group === g).length;
            const share = (totals._in || 0) > 0 ? (total / totals._in) * 100 : 0;
            return (
              <div key={g} className={`fin-stream fin-stream-${g.toLowerCase()}`}>
                <div className="fin-stream-l">{g}</div>
                <div className="fin-stream-n">R {total.toLocaleString()}</div>
                <div className="fin-stream-sub">
                  {count} entr{count === 1 ? 'y' : 'ies'}
                  {share > 0 && ` · ${share.toFixed(0)}% of income`}
                </div>
                <div className="fin-stream-bar">
                  <div className="fin-stream-bar-fill" style={{ width: `${Math.min(100, share)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-group breakdown row */}
      <div className="fin-groups">
        {inGroups.map((g) => (
          <div key={'in-' + g} className="fin-group fin-group-in">
            <div className="fin-group-l">{g}</div>
            <div className="fin-group-n">R {(totals[`in:${g}`] || 0).toLocaleString()}</div>
          </div>
        ))}
        {outGroups.map((g) => (
          <div key={'out-' + g} className="fin-group fin-group-out">
            <div className="fin-group-l">{g}</div>
            <div className="fin-group-n">R {(totals[`out:${g}`] || 0).toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Filter row */}
      <div className="filter-row" style={{ marginTop: 16 }}>
        {[
          { k: 'all', l: 'All flows' },
          { k: 'in', l: '↓ In only' },
          { k: 'out', l: '↑ Out only' },
        ].map((b) => (
          <button
            key={b.k}
            className={`filter-pill ${filterDir === b.k ? 'active' : ''}`}
            onClick={() => { setFilterDir(b.k); setFilterGroup('all'); }}
          >
            {b.l}
          </button>
        ))}
        <span style={{ width: 1, height: 22, background: 'var(--line)', margin: '0 8px' }} />
        {['all', ...activeGroupList].map((g) => (
          <button
            key={g}
            className={`filter-pill ${filterGroup === g ? 'active' : ''}`}
            onClick={() => setFilterGroup(g)}
          >
            {g === 'all' ? 'All groups' : g}
          </button>
        ))}
        <span style={{ marginLeft: 12, display: 'inline-flex', gap: 6 }}>
          {[
            { k: 'all', l: 'Any' },
            { k: 'paid', l: 'Cleared' },
            { k: 'unpaid', l: 'Outstanding' },
          ].map((b) => (
            <button
              key={b.k}
              className={`filter-pill ${filterPaid === b.k ? 'active' : ''}`}
              onClick={() => setFilterPaid(b.k)}
            >
              {b.l}
            </button>
          ))}
        </span>
      </div>

      {/* Ledger table */}
      <div className="tbl-w" style={{ marginTop: 14 }}>
        <table className="tbl fin-tbl">
          <thead>
            <tr>
              <th style={{ width: 100 }}>Date</th>
              <th>Category</th>
              <th>Payee</th>
              <th>Description</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th style={{ width: 110 }}>Status</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => {
              const c = catMap[e.category] || { label: e.category, group: 'Other', tone: 'muted' };
              const dir = e.direction || 'out';
              return (
                <tr key={e.id}>
                  <td style={{ fontSize: 12, color: 'var(--muted)', fontFamily: "'Montserrat',sans-serif" }}>
                    {new Date(e.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span className={`fin-dir-tag fin-dir-${dir}`}>{dir === 'in' ? 'IN' : 'OUT'}</span>
                      <Pill tone={c.tone}>{c.label}</Pill>
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 3 }}>{c.group}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12.5, fontFamily: "'Montserrat',sans-serif", fontWeight: 600 }}>
                      {e.payee}
                    </div>
                    {e.invoice && (
                      <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>{e.invoice}</div>
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--ink)', maxWidth: 280 }}>{e.desc}</td>
                  <td style={{
                    textAlign: 'right',
                    fontFamily: "'Montserrat',sans-serif",
                    fontWeight: 800,
                    fontSize: 14,
                    color: dir === 'in' ? 'var(--green)' : 'var(--ink)',
                  }}>
                    {dir === 'in' ? '+' : '−'} R {e.amount.toLocaleString()}
                    <div style={{ fontSize: 10.5, color: 'var(--muted)', fontWeight: 500 }}>
                      {e.frequency}
                    </div>
                  </td>
                  <td>
                    <button
                      className={`fin-paid-toggle ${e.paid ? 'paid' : 'unpaid'}`}
                      onClick={() => togglePaid(e.id)}
                    >
                      {e.paid ? (dir === 'in' ? 'Received' : 'Paid') : 'Outstanding'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: 10 }}>
                    <button className="fin-row-remove" onClick={() => removeEntry(e.id)} title="Remove">
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: 28, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                  No cost entries match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {adding === 'expense' && ReactDOM.createPortal(
        <AddLedgerEntryModal
          direction="out"
          club={club}
          onSubmit={addEntry}
          onCancel={() => setAdding(null)}
        />,
        document.body
      )}
      {adding === 'income' && ReactDOM.createPortal(
        <AddLedgerEntryModal
          direction="in"
          club={club}
          onSubmit={addEntry}
          onCancel={() => setAdding(null)}
        />,
        document.body
      )}
      {adding === 'donation' && ReactDOM.createPortal(
        <AddLedgerEntryModal
          direction="in"
          presetCategory="donation"
          eyebrowOverride="Donation"
          titleOverride="Log a donation"
          submitLabelOverride="Log donation"
          payeeLabelOverride="Donor"
          payeePlaceholderOverride="e.g. Local business, alumnus, community member"
          descPlaceholderOverride="e.g. Junior kit fund · Old Boys Trust"
          club={club}
          onSubmit={addEntry}
          onCancel={() => setAdding(null)}
        />,
        document.body
      )}
      {adding === 'sponsorship' && ReactDOM.createPortal(
        <AddSponsorshipModal
          club={club}
          onSubmit={addEntry}
          onCancel={() => setAdding(null)}
        />,
        document.body
      )}
    </div>
  );
}

function AddLedgerEntryModal({
  direction = 'out',
  club,
  onSubmit,
  onCancel,
  presetCategory,
  eyebrowOverride,
  titleOverride,
  submitLabelOverride,
  payeeLabelOverride,
  payeePlaceholderOverride,
  descPlaceholderOverride,
}) {
  const isIn = direction === 'in';
  const CATS = isIn ? CLUB_INCOME_CATEGORIES : CLUB_COST_CATEGORIES;
  const GROUPS = isIn ? CLUB_INCOME_GROUPS : ['Coaching', 'Player welfare', 'Facility', 'Administration'];
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [category, setCategory] = useState(presetCategory || CATS[0].key);
  const [vendorId, setVendorId] = useState('');
  const [payee, setPayee] = useState('');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('One-off');
  const [invoice, setInvoice] = useState('');
  const [paid, setPaid] = useState(false);

  const vendorOptions = useMemo(
    () => VENDORS.filter((v) => v.status === 'onboarded' || v.status === 'verified'),
    []
  );

  const cat = CATS.find((c) => c.key === category);
  const parsedAmount = Number(String(amount).replace(/[^\d.]/g, '')) || 0;
  const canSubmit = payee.trim() && parsedAmount > 0 && category;

  function pickVendor(id) {
    setVendorId(id);
    const v = VENDORS.find((x) => x.id === id);
    if (v) setPayee(v.name);
  }

  function submit() {
    if (!canSubmit) return;
    onSubmit({
      direction,
      date,
      category,
      vendorId: vendorId || null,
      payee: payee.trim(),
      desc: desc.trim(),
      amount: parsedAmount,
      frequency,
      invoice: invoice.trim(),
      paid,
    });
  }

  const eyebrow = eyebrowOverride || (isIn ? 'Log income' : 'Log a cost');
  const title = titleOverride || (isIn ? 'New income entry' : 'New cost entry');
  const whoLabel = isIn ? 'Who paid the club?' : 'Who was paid?';
  const submitLabel = submitLabelOverride || (isIn ? 'Log income' : 'Log cost');
  const paidLabel = isIn ? 'Already received' : 'Already paid';
  const payeePlaceholder = payeePlaceholderOverride || (isIn
    ? 'e.g. Coastal Insurance Brokers'
    : 'e.g. Sanele Cele Cricket Academy');
  const descPlaceholder = descPlaceholderOverride || (isIn
    ? 'e.g. Half-season boundary board · vs Berea Rovers gate'
    : 'e.g. Head coach retainer · July · pace-clinic Sat');
  const payeeLabel = payeeLabelOverride || (isIn ? 'Source / payer' : 'Payee');

  return (
    <div className="fix-confirm" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="fix-confirm-box jobmodal-box" style={{ maxWidth: 640 }}>
        <div className="fac-jobmodal-head">
          <div>
            <div className="fac-detail-eyebrow">{eyebrow}</div>
            <div className="fac-jobmodal-title">{title}</div>
          </div>
          <button className="fac-detail-close" onClick={onCancel}>
            <Icon.X />
          </button>
        </div>

        <div className="fac-jobmodal-body">
          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">What was this?</div>
            <div className="field-grid-2">
              <div>
                <label className="field-label">Category <span className="req">*</span></label>
                <select
                  className="field-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {GROUPS.map((g) => (
                    <optgroup key={g} label={g}>
                      {CATS.filter((c) => c.group === g).map((c) => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {cat && (
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                    Group: <strong>{cat.group}</strong>
                  </div>
                )}
              </div>
              <div>
                <label className="field-label">Date</label>
                <input
                  className="field-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">{whoLabel}</div>
            {!isIn && (
              <div>
                <label className="field-label">Link to a vendor (optional)</label>
                <select
                  className="field-select"
                  value={vendorId}
                  onChange={(e) => pickVendor(e.target.value)}
                >
                  <option value="">— No vendor / free-text payee —</option>
                  {VENDOR_CATEGORIES.filter((c) => vendorOptions.some((v) => v.category === c)).map((c) => (
                    <optgroup key={c} label={c}>
                      {vendorOptions.filter((v) => v.category === c).map((v) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}
            <div style={{ marginTop: isIn ? 0 : 12 }}>
              <label className="field-label">{payeeLabel} <span className="req">*</span></label>
              <input
                className="field-input"
                placeholder={payeePlaceholder}
                value={payee}
                onChange={(e) => setPayee(e.target.value)}
              />
            </div>
          </div>

          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Amount</div>
            <div className="field-grid-2">
              <div>
                <label className="field-label">Amount (ZAR) <span className="req">*</span></label>
                <input
                  className="field-input"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">Frequency</label>
                <select
                  className="field-select"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  {CLUB_COST_FREQUENCIES.map((f) => (<option key={f}>{f}</option>))}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="field-label">Description / reference</label>
              <input
                className="field-input"
                placeholder={descPlaceholder}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
            <div className="field-grid-2" style={{ marginTop: 12 }}>
              <div>
                <label className="field-label">Invoice / reference #</label>
                <input
                  className="field-input"
                  placeholder="INV-000"
                  value={invoice}
                  onChange={(e) => setInvoice(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label className="fin-paid-check">
                  <input
                    type="checkbox"
                    checked={paid}
                    onChange={(e) => setPaid(e.target.checked)}
                  />
                  <span>{paidLabel}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="jobmodal-footer">
          <div className="jobmodal-footer-summary">
            <strong>{isIn ? '+' : '−'} R {parsedAmount.toLocaleString()}</strong> · {cat?.label || category} ·{' '}
            <strong>{payee || (isIn ? 'unnamed source' : 'unnamed payee')}</strong>
          </div>
          <div className="jobmodal-footer-actions">
            <Btn tone="outline" onClick={onCancel}>Cancel</Btn>
            <Btn tone="teal" icon={Icon.Check} onClick={submit} disabled={!canSubmit}>
              {submitLabel}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── AddSponsorshipModal · dedicated sponsorship logger ───
   Sponsorship has extra fields the chair cares about — tier (Gold/Silver/
   Bronze/Boundary board/In-kind), period covered, sponsor asset (kit,
   scoreboard, tour, junior programme). Emits a standard 'in' ledger entry
   with category=sponsorship. */
function AddSponsorshipModal({ club, onSubmit, onCancel }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [sponsor, setSponsor] = useState('');
  const [tier, setTier] = useState('Gold');
  const [asset, setAsset] = useState('Shirt sponsor');
  const [period, setPeriod] = useState('Season');
  const [amount, setAmount] = useState('');
  const [invoice, setInvoice] = useState('');
  const [notes, setNotes] = useState('');
  const [received, setReceived] = useState(true);

  const parsedAmount = Number(String(amount).replace(/[^\d.]/g, '')) || 0;
  const canSubmit = sponsor.trim() && parsedAmount > 0;

  const TIERS = ['Gold', 'Silver', 'Bronze', 'Boundary board', 'In-kind / product', 'Junior programme', 'Other'];
  const ASSETS = [
    'Shirt sponsor',
    'Cap / helmet',
    'Boundary board',
    'Scoreboard',
    'Match ball',
    'Tour / event',
    'Junior programme',
    'Kit / apparel',
    'Naming rights',
    'Other',
  ];

  function submit() {
    if (!canSubmit) return;
    onSubmit({
      direction: 'in',
      date,
      category: 'sponsorship',
      sponsorTier: tier,
      sponsorAsset: asset,
      payee: sponsor.trim(),
      desc: [asset, period, notes.trim()].filter(Boolean).join(' · '),
      amount: parsedAmount,
      frequency: period,
      invoice: invoice.trim(),
      paid: received,
    });
  }

  return (
    <div className="fix-confirm" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="fix-confirm-box jobmodal-box" style={{ maxWidth: 620 }}>
        <div className="fac-jobmodal-head">
          <div>
            <div className="fac-detail-eyebrow">Sponsorship</div>
            <div className="fac-jobmodal-title">Log a sponsorship</div>
          </div>
          <button className="fac-detail-close" onClick={onCancel}>
            <Icon.X />
          </button>
        </div>

        <div className="fac-jobmodal-body">
          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Sponsor</div>
            <div>
              <label className="field-label">Sponsor name <span className="req">*</span></label>
              <input
                className="field-input"
                placeholder="e.g. Coastal Insurance Brokers"
                value={sponsor}
                onChange={(e) => setSponsor(e.target.value)}
              />
            </div>
            <div className="field-grid-2" style={{ marginTop: 12 }}>
              <div>
                <label className="field-label">Tier</label>
                <select className="field-select" value={tier} onChange={(e) => setTier(e.target.value)}>
                  {TIERS.map((t) => (<option key={t}>{t}</option>))}
                </select>
              </div>
              <div>
                <label className="field-label">Asset sponsored</label>
                <select className="field-select" value={asset} onChange={(e) => setAsset(e.target.value)}>
                  {ASSETS.map((a) => (<option key={a}>{a}</option>))}
                </select>
              </div>
            </div>
          </div>

          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Value</div>
            <div className="field-grid-2">
              <div>
                <label className="field-label">Amount (ZAR) <span className="req">*</span></label>
                <input
                  className="field-input"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">Period</label>
                <select className="field-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
                  {CLUB_COST_FREQUENCIES.map((f) => (<option key={f}>{f}</option>))}
                </select>
              </div>
            </div>
            <div className="field-grid-2" style={{ marginTop: 12 }}>
              <div>
                <label className="field-label">Date signed</label>
                <input
                  className="field-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">Invoice / reference #</label>
                <input
                  className="field-input"
                  placeholder="SP-2027-01"
                  value={invoice}
                  onChange={(e) => setInvoice(e.target.value)}
                />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="field-label">Notes</label>
              <textarea
                className="field-textarea"
                rows={2}
                placeholder="Deliverables, contact person, deliverable dates…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="fin-paid-check">
                <input
                  type="checkbox"
                  checked={received}
                  onChange={(e) => setReceived(e.target.checked)}
                />
                <span>Funds already received</span>
              </label>
            </div>
          </div>
        </div>

        <div className="jobmodal-footer">
          <div className="jobmodal-footer-summary">
            <strong>+ R {parsedAmount.toLocaleString()}</strong> · {tier} · {asset} ·{' '}
            <strong>{sponsor || 'unnamed sponsor'}</strong>
          </div>
          <div className="jobmodal-footer-actions">
            <Btn tone="outline" onClick={onCancel}>Cancel</Btn>
            <Btn tone="teal" icon={Icon.Check} onClick={submit} disabled={!canSubmit}>
              Log sponsorship
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ClubSocialView · Match Day gallery ───
   The chairman uploads match-day photos, tags players in each, and links
   the scorecard. Uploads are downscaled client-side to keep them light.
   Everything posted here is visible to the Lions office. */
function ClubSocialView({ club, posts = [], onAddPost, onRemovePost, toast }) {
  const [composing, setComposing] = useState(false);

  const myPlayers = useMemo(
    () => SAMPLE_PLAYERS.filter((p) => p.clubId === club.id),
    [club.id]
  );
  const playerName = (id) => {
    const p = myPlayers.find((x) => x.id === id);
    return p ? `${p.firstNames} ${p.surname}` : 'Player';
  };

  const totalPhotos = posts.reduce((s, p) => s + (p.photos || []).length, 0);
  const totalTags = posts.reduce(
    (s, p) => s + (p.photos || []).reduce((ss, ph) => ss + (ph.taggedPlayerIds || []).length, 0),
    0
  );

  return (
    <div>
      <div className="page-head">
        <div className="ph-left">
          <div className="ph-crumb">Club Portal · {club.name} / Match Day</div>
          <h1 className="ph-title">
            Match <em>Day</em>
          </h1>
          <p className="ph-desc">
            Upload photos from the game, tag the players in each shot, and link the scorecard.
            Everything you post here is shared with the Lions office.
          </p>
        </div>
        <div className="ph-actions">
          <Btn tone="teal" size="sm" icon={Icon.Plus} onClick={() => setComposing(true)}>
            New match post
          </Btn>
        </div>
      </div>

      {/* KPI strip */}
      <div className="players-stats">
        <div className="players-stat">
          <div className="players-stat-l">Match posts</div>
          <div className="players-stat-n">{posts.length}</div>
        </div>
        <div className="players-stat">
          <div className="players-stat-l">Photos</div>
          <div className="players-stat-n">{totalPhotos}</div>
        </div>
        <div className="players-stat">
          <div className="players-stat-l">Player tags</div>
          <div className="players-stat-n">{totalTags}</div>
        </div>
        <div className="players-stat">
          <div className="players-stat-l">Scorecards</div>
          <div className="players-stat-n">{posts.filter((p) => p.scorecardUrl).length}</div>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="cf-empty" style={{ marginTop: 16 }}>
          No match posts yet. Click <strong>New match post</strong> to upload photos from your
          last game, tag your players, and drop in the scorecard link.
        </div>
      ) : (
        <div className="sc-feed">
          {posts.map((post) => (
            <SocialPostCard
              key={post.id}
              post={post}
              playerName={playerName}
              onRemove={() => onRemovePost?.(post.id)}
            />
          ))}
        </div>
      )}

      {composing && ReactDOM.createPortal(
        <NewMatchPostModal
          club={club}
          players={myPlayers}
          onSubmit={(post) => {
            onAddPost?.(post);
            setComposing(false);
            toast?.('Match post shared with the Lions office');
          }}
          onCancel={() => setComposing(false)}
        />,
        document.body
      )}
    </div>
  );
}

/* One match post card — shared between the club feed and the admin gallery.
   `onRemove` is only passed on the club side; `clubLabel` only on admin. */
function SocialPostCard({ post, playerName, onRemove, clubLabel }) {
  return (
    <div className="sc-card">
      <div className="sc-card-head">
        <div>
          {clubLabel && <div className="sc-card-club">{clubLabel}</div>}
          <div className="sc-card-title">{post.title}</div>
          <div className="sc-card-meta">
            {post.matchDate
              ? new Date(post.matchDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : ''}
            {post.chair && ` · 🎽 ${post.chair}`}
            {(post.photos || []).length > 0 && ` · ${post.photos.length} photo${post.photos.length === 1 ? '' : 's'}`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {post.scorecardUrl && (
            <a className="sc-scorecard" href={post.scorecardUrl} target="_blank" rel="noopener noreferrer">
              📊 Scorecard
            </a>
          )}
          {onRemove && (
            <button className="sc-remove" onClick={onRemove} title="Delete post">×</button>
          )}
        </div>
      </div>

      {post.caption && <div className="sc-caption">{post.caption}</div>}

      <div className="sc-grid">
        {(post.photos || []).map((ph) => (
          <div key={ph.id} className="sc-photo">
            <img src={ph.dataUrl} alt={post.title} loading="lazy" />
            {(ph.taggedPlayerIds || []).length > 0 && (
              <div className="sc-tags">
                {ph.taggedPlayerIds.map((pid) => (
                  <span key={pid} className="sc-tag">👤 {playerName(pid)}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── NewMatchPostModal · upload + tag + scorecard ─── */
function NewMatchPostModal({ club, players, onSubmit, onCancel }) {
  const today = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState('');
  const [matchDate, setMatchDate] = useState(today);
  const [scorecardUrl, setScorecardUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [photos, setPhotos] = useState([]); // {id, dataUrl, taggedPlayerIds}
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  // Downscale each image to max 1000px wide and export as JPEG so uploaded
  // phone photos don't balloon the in-memory state.
  function downscale(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const max = 1000;
          const scale = Math.min(1, max / img.width);
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => resolve(reader.result); // fall back to raw
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function onFiles(e) {
    const files = [...(e.target.files || [])];
    if (!files.length) return;
    setBusy(true);
    const added = [];
    for (const f of files) {
      if (!f.type.startsWith('image/')) continue;
      const dataUrl = await downscale(f);
      added.push({ id: 'ph-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6), dataUrl, taggedPlayerIds: [] });
    }
    setPhotos((prev) => [...prev, ...added]);
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  function toggleTag(photoId, playerId) {
    setPhotos((prev) =>
      prev.map((ph) =>
        ph.id === photoId
          ? {
              ...ph,
              taggedPlayerIds: ph.taggedPlayerIds.includes(playerId)
                ? ph.taggedPlayerIds.filter((x) => x !== playerId)
                : [...ph.taggedPlayerIds, playerId],
            }
          : ph
      )
    );
  }
  function removePhoto(photoId) {
    setPhotos((prev) => prev.filter((ph) => ph.id !== photoId));
  }

  const canSubmit = title.trim() && photos.length > 0;

  function submit() {
    if (!canSubmit) return;
    onSubmit({
      id: 'post-' + Date.now(),
      clubId: club.id,
      title: title.trim(),
      matchDate: matchDate || null,
      postedAt: new Date().toISOString().slice(0, 10),
      chair: club.chair,
      scorecardUrl: scorecardUrl.trim(),
      caption: caption.trim(),
      photos,
    });
  }

  return (
    <div className="fix-confirm" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="fix-confirm-box jobmodal-box" style={{ maxWidth: 680 }}>
        <div className="fac-jobmodal-head">
          <div>
            <div className="fac-detail-eyebrow">Match Day</div>
            <div className="fac-jobmodal-title">New match post</div>
          </div>
          <button className="fac-detail-close" onClick={onCancel}><Icon.X /></button>
        </div>

        <div className="fac-jobmodal-body">
          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">The match</div>
            <div className="field-grid-2">
              <div>
                <label className="field-label">Match title <span className="req">*</span></label>
                <input
                  className="field-input"
                  placeholder="e.g. vs Umlazi CC · Premier League"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">Match date</label>
                <input className="field-input" type="date" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="field-label">Scorecard link</label>
              <input
                className="field-input"
                placeholder="Paste the scorecard URL (e.g. cricclubs / play-cricket)"
                value={scorecardUrl}
                onChange={(e) => setScorecardUrl(e.target.value)}
              />
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="field-label">Caption</label>
              <input
                className="field-input"
                placeholder="A line about the game…"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
          </div>

          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Photos {photos.length > 0 && `· ${photos.length}`}</div>
            <label className="sc-upload">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={onFiles}
                style={{ display: 'none' }}
              />
              <span className="sc-upload-ic">📷</span>
              <span className="sc-upload-t">{busy ? 'Processing photos…' : 'Tap to upload match photos'}</span>
              <span className="sc-upload-s">JPG / PNG · multiple at once</span>
            </label>

            {photos.length > 0 && (
              <div className="sc-edit-grid">
                {photos.map((ph) => (
                  <div key={ph.id} className="sc-edit-photo">
                    <div className="sc-edit-imgwrap">
                      <img src={ph.dataUrl} alt="" />
                      <button className="sc-edit-remove" onClick={() => removePhoto(ph.id)} title="Remove">×</button>
                    </div>
                    <div className="sc-edit-tagline">
                      Tag players {ph.taggedPlayerIds.length > 0 && `(${ph.taggedPlayerIds.length})`}
                    </div>
                    <div className="sc-edit-tags">
                      {players.length === 0 && (
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>Register players first to tag them.</span>
                      )}
                      {players.map((p) => {
                        const on = ph.taggedPlayerIds.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            className={`sc-tag-chip ${on ? 'on' : ''}`}
                            onClick={() => toggleTag(ph.id, p.id)}
                          >
                            {on ? '✓ ' : ''}{p.firstNames} {p.surname}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="jobmodal-footer">
          <div className="jobmodal-footer-summary">
            <strong>{photos.length}</strong> photo{photos.length === 1 ? '' : 's'} ·{' '}
            <strong>{photos.reduce((s, ph) => s + ph.taggedPlayerIds.length, 0)}</strong> tags
            {scorecardUrl.trim() && ' · scorecard linked'}
          </div>
          <div className="jobmodal-footer-actions">
            <Btn tone="outline" onClick={onCancel}>Cancel</Btn>
            <Btn tone="teal" icon={Icon.Check} onClick={submit} disabled={!canSubmit}>Share post</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
