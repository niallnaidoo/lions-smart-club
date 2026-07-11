/* ─── Admin views ─── */

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
  ProgressBar,
  ProgChip,
  ClubAvatar,
  ClubNameCell,
  YN,
  Choice,
  CountUp,
  statusFor,
  affPill,
  cqiBand,
} from './atoms.jsx';
import {
  REQUIRED_DOCS,
  CQI_STRUCTURE,
  cohortStats,
  docCompletion,
  overallProgress,
  fixtureCost,
  generateRoundRobin,
  isClearanceOverdue,
  clearanceDaysElapsed,
  clearanceDaysRemaining,
  FACILITIES,
  LIONS_HQ,
  JOB_TYPES,
  GROUNDSTAFF,
  FACILITY_OWNERSHIP,
  FACILITY_LOAD,
  FACILITY_JOBS,
  jobStatusTone,
  jobPriorityTone,
  loadTone,
  FACILITY_ASSETS,
  FACILITY_CAPEX,
  FACILITY_MAINTENANCE_SCHEDULE,
  FACILITY_SPEND,
  FACILITY_OPTIONS,
  VENDORS,
  VENDOR_CATEGORIES,
  VENDOR_STATUSES,
  VENDOR_SERVICES,
  BEE_LEVELS,
  vendorStatusTone,
  LIONS_OFFICE_STAFF,
  PROJECT_TYPES,
  PROJECT_STATUSES,
  TASK_STATUSES,
  PROJECT_SEED,
  computeProjectSpend,
  projectStatusTone,
  projectTypeMeta,
  taskStatusTone,
  ISSUE_SEVERITIES,
  issueCategoriesFor,
  issueLocationsFor,
  severityTone,
  ASSET_CATEGORIES,
  conditionWord,
  conditionTone,
  capexStatusTone,
  capexPriorityTone,
  annualisedMaintCost,
  capexTotal,
} from './data.jsx';

/* ─── AdminFixtures — series cards + drilldown fixture table with distance + travel-cost ─── */
function AdminFixtures({
  clubs,
  allSeries,
  onCreateSeries,
  onUpdateSeries,
  onDeleteSeries,
  onDuplicateSeries,
  onSetReleased,
  toast,
}) {
  const [activeId, setActiveId] = useState(allSeries[0]?.id);
  const active = allSeries.find((s) => s.id === activeId) || allSeries[0];
  const [confirm, setConfirm] = useState(null); // shared confirmation modal state
  const clubBy = (id) => clubs.find((c) => c.id === id);

  // Aggregate distance + fuel per series
  const seriesAgg = (s) => {
    let totalKm = 0,
      totalCost = 0;
    s.fixtures.forEach((f) => {
      const home = clubBy(f.home),
        away = clubBy(f.away);
      if (!home || !away) return;
      const c = fixtureCost(home, away, s.costPerKm, s.carsPerAwayTrip);
      totalKm += c.roundTripKm;
      totalCost += c.fuelR;
    });
    return { totalKm, totalCost };
  };

  // Shared release/recall confirmation builders — used by header, card, and bottom bar
  function askRelease(s) {
    setConfirm({
      title: `Release ${s.fixtures.length} fixtures to the league?`,
      body: `This publishes the full ${s.name} schedule to all ${s.teams.length} affiliated clubs. They'll see it in their portals immediately and receive email + SMS notifications.`,
      onYes: () => {
        onSetReleased(s.id, true);
        setConfirm(null);
        toast?.(s.name + ' · released to ' + s.teams.length + ' clubs');
      },
    });
  }
  function askRecall(s) {
    setConfirm({
      title: 'Recall this release?',
      body: "All clubs will be notified that the schedule has been pulled back to draft. They won't see updates until you release again.",
      danger: true,
      onYes: () => {
        onSetReleased(s.id, false);
        setConfirm(null);
        toast?.(s.name + ' · recalled to draft');
      },
    });
  }

  return (
    <div>
      <div className="page-head">
        <div className="ph-left">
          <div className="ph-crumb">Lions · Admin Console / Fixtures &amp; Venues</div>
          <h1 className="ph-title">
            Fixtures &amp; <em>Venues</em>
          </h1>
          <p className="ph-desc">
            Auto-generated round-robin schedules across each KZNCU &amp; EMCU series. Home venues
            flow from the affiliation form. Travel distance and fuel cost are calculated for every
            away fixture.
          </p>
        </div>
        <div className="ph-actions">
          <Btn tone="outline" icon={Icon.Download} size="sm">
            Export schedule
          </Btn>
          <Btn tone="outline" icon={Icon.Plus} size="sm" onClick={onCreateSeries}>
            Create series
          </Btn>
          {/* Primary CTA — always visible. State reflects the active series. */}
          {active &&
            (active.released ? (
              <Btn tone="outline" size="sm" onClick={() => askRecall(active)}>
                Recall release
              </Btn>
            ) : (
              <Btn tone="teal" size="sm" icon={Icon.Arrow} onClick={() => askRelease(active)}>
                Release to clubs
              </Btn>
            ))}
        </div>
      </div>

      {/* Series cards strip — each card has its own quick release/recall button */}
      <div className="series-strip">
        {allSeries.map((s) => {
          const agg = seriesAgg(s);
          return (
            <div
              key={s.id}
              className={`series-card ${s.id === activeId ? 'active' : ''}`}
              onClick={() => setActiveId(s.id)}
              role="button"
              tabIndex={0}
            >
              <div className="series-card-head">
                <div className="series-card-name">{s.name}</div>
                {s.released ? (
                  <div className="series-card-released">Released</div>
                ) : (
                  <div className="series-card-draft">Draft</div>
                )}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--muted)',
                  fontWeight: 500,
                  fontFamily: "'Montserrat',sans-serif",
                }}
              >
                {s.teams.length} teams · {s.fixtures.length} fixtures · {s.maxOvers} ov · start{' '}
                {new Date(s.startDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })}
              </div>
              <div className="series-card-meta">
                <div className="series-card-stat">
                  <div className="series-card-stat-l">Total km</div>
                  <div className="series-card-stat-n">
                    {Math.round(agg.totalKm).toLocaleString()}
                  </div>
                </div>
                <div className="series-card-stat">
                  <div className="series-card-stat-l">Travel</div>
                  <div className="series-card-stat-n" style={{ color: 'var(--green)' }}>
                    R {Math.round(agg.totalCost).toLocaleString()}
                  </div>
                </div>
              </div>
              {/* Quick action — stops card click so it doesn't also switch tab */}
              <div className="series-card-cta" onClick={(e) => e.stopPropagation()}>
                {s.released ? (
                  <button className="series-card-btn recall" onClick={() => askRecall(s)}>
                    ↺ Recall draft
                  </button>
                ) : (
                  <button className="series-card-btn release" onClick={() => askRelease(s)}>
                    Release to clubs →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active series drill-down */}
      {active && (
        <FixtureTable
          series={active}
          clubs={clubs}
          onUpdateSeries={onUpdateSeries}
          onDeleteSeries={onDeleteSeries}
          onDuplicateSeries={onDuplicateSeries}
          onSetReleased={onSetReleased}
          onAskRelease={askRelease}
          onAskRecall={askRecall}
          toast={toast}
        />
      )}

      {/* Shared confirmation modal — portaled to document.body so it escapes the
          .main containing block (which has a residual transform from .main > *
          fadeUp animation that otherwise breaks position:fixed centering). */}
      {confirm &&
        ReactDOM.createPortal(
          <div
            className="fix-confirm"
            onClick={(e) => e.target === e.currentTarget && setConfirm(null)}
          >
            <div className="fix-confirm-box">
              <div className={`fix-confirm-icon ${confirm.danger ? 'danger' : 'go'}`}>
                {confirm.danger ? (
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L22 21H2L12 2z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 9v5M12 17v.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 12l5 5L20 6"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <div className="fix-confirm-title">{confirm.title}</div>
              <div className="fix-confirm-body">{confirm.body}</div>
              <div className="fix-confirm-actions">
                <Btn tone="outline" onClick={() => setConfirm(null)}>
                  Cancel
                </Btn>
                <Btn
                  tone={confirm.danger ? 'ink' : 'teal'}
                  icon={confirm.danger ? undefined : Icon.Arrow}
                  onClick={confirm.onYes}
                >
                  {confirm.danger ? 'Yes, recall' : 'Release to clubs'}
                </Btn>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

/* ─── FixtureTable with full human-in-the-loop editing ─── */
function FixtureTable({
  series,
  clubs,
  onUpdateSeries,
  onDeleteSeries,
  onDuplicateSeries,
  onSetReleased,
  onAskRelease,
  onAskRecall,
  toast,
}) {
  const clubBy = (id) => clubs.find((c) => c.id === id);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [confirm, setConfirm] = useState(null); // {title, body, onYes} — for delete/regen only; release uses parent's modal

  // Helpers — operate on series.fixtures via onUpdateSeries
  function updateFixture(fixtureId, updates) {
    onUpdateSeries(series.id, (s) => ({
      ...s,
      fixtures: s.fixtures.map((f) => (f.id === fixtureId ? { ...f, ...updates } : f)),
    }));
  }
  function deleteFixture(fixtureId) {
    onUpdateSeries(series.id, (s) => ({
      ...s,
      fixtures: s.fixtures.filter((f) => f.id !== fixtureId),
    }));
  }
  function addFixture() {
    const newId = 'f' + Date.now();
    const last = series.fixtures[series.fixtures.length - 1];
    const nextRound = last ? last.round + 1 : 1;
    const baseDate = last ? new Date(last.date) : new Date(series.startDate);
    baseDate.setDate(baseDate.getDate() + 7);
    const newFix = {
      id: newId,
      round: nextRound,
      date: baseDate.toISOString().slice(0, 10),
      home: series.teams[0],
      away: series.teams[1] || series.teams[0],
      status: 'scheduled',
    };
    onUpdateSeries(series.id, (s) => ({ ...s, fixtures: [...s.fixtures, newFix] }));
    setEditingId(newId);
    toast?.('Fixture added — edit details');
  }
  function regenerate() {
    onUpdateSeries(series.id, (s) => ({
      ...s,
      fixtures: generateRoundRobin(s.teams, s.startDate),
    }));
    setConfirm(null);
    toast?.(`${series.name} · fixtures regenerated`);
  }

  // Build rows with computed cost
  const allRows = series.fixtures.map((f) => {
    const home = clubBy(f.home),
      away = clubBy(f.away);
    const c = fixtureCost(home, away, series.costPerKm, series.carsPerAwayTrip);
    return { f, home, away, c };
  });
  let totalKm = 0,
    totalCost = 0;
  allRows.forEach((r) => {
    totalKm += r.c.roundTripKm;
    totalCost += r.c.fuelR;
  });
  const rows =
    filter === 'all' ? allRows : allRows.filter((r) => (r.f.status || 'scheduled') === filter);

  const statusCounts = {
    all: allRows.length,
    scheduled: allRows.filter((r) => (r.f.status || 'scheduled') === 'scheduled').length,
    completed: allRows.filter((r) => r.f.status === 'completed').length,
    postponed: allRows.filter((r) => r.f.status === 'postponed').length,
    cancelled: allRows.filter((r) => r.f.status === 'cancelled').length,
  };

  return (
    <div>
      {/* Hero header */}
      <div className="fix-header">
        <div>
          <div className="fix-header-title">{series.name}</div>
          <div className="fix-header-sub">
            {series.seriesType} · {series.teams.length} teams · {series.fixtures.length} fixtures ·{' '}
            {series.maxOvers} overs · {series.category}
          </div>
        </div>
        <div className="fix-header-aggs">
          <div className="fix-header-agg">
            <div className="fix-header-agg-l">Season distance</div>
            <div className="fix-header-agg-n">
              <CountUp to={Math.round(totalKm)} />
              <span className="unit">km</span>
            </div>
          </div>
          <div className="fix-header-agg">
            <div className="fix-header-agg-l">Travel cost</div>
            <div className="fix-header-agg-n">
              R <CountUp to={Math.round(totalCost)} />
            </div>
          </div>
          <div className="fix-header-agg">
            <div className="fix-header-agg-l">@ R / km</div>
            <div className="fix-header-agg-n">
              R {series.costPerKm.toFixed(2)}
              <span className="unit">× {series.carsPerAwayTrip} cars</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar — filter + actions */}
      <div className="fix-toolbar">
        <div className="fix-toolbar-left">
          {[
            { k: 'all', label: 'All' },
            { k: 'scheduled', label: 'Scheduled' },
            { k: 'completed', label: 'Completed' },
            { k: 'postponed', label: 'Postponed' },
            { k: 'cancelled', label: 'Cancelled' },
          ].map((f) => (
            <button
              key={f.k}
              className={`filter-pill ${filter === f.k ? 'active' : ''}`}
              onClick={() => setFilter(f.k)}
            >
              {f.label}
              <span className="count">{statusCounts[f.k]}</span>
            </button>
          ))}
        </div>
        <div className="fix-toolbar-right">
          <Btn tone="outline" size="sm" icon={Icon.Plus} onClick={addFixture}>
            Add fixture
          </Btn>
          <Btn
            tone="outline"
            size="sm"
            onClick={() =>
              setConfirm({
                title: 'Regenerate all fixtures?',
                body: 'This will replace every fixture in this series with a fresh round-robin based on the current teams + start date. All manual edits, dates, and status changes will be lost. This cannot be undone.',
                onYes: regenerate,
                danger: true,
              })
            }
          >
            ↻ Regenerate
          </Btn>
          <Btn
            tone="outline"
            size="sm"
            onClick={() => {
              onDuplicateSeries(series.id);
              toast?.('Series duplicated');
            }}
          >
            Duplicate
          </Btn>
          <Btn
            tone="ghost"
            size="sm"
            onClick={() =>
              setConfirm({
                title: 'Delete this series?',
                body: `Permanently remove "${series.name}" along with all ${series.fixtures.length} fixtures. The Lions office cannot undo this.`,
                onYes: () => {
                  onDeleteSeries(series.id);
                  setConfirm(null);
                  toast?.('Series deleted');
                },
                danger: true,
              })
            }
          >
            Delete series
          </Btn>
        </div>
      </div>

      {/* Table */}
      <div className="fix-table-wrap">
        <table className="fix-table">
          <thead>
            <tr>
              <th style={{ width: 50 }}>Rd</th>
              <th style={{ width: 120 }}>Date</th>
              <th>Home (host)</th>
              <th>Venue · Suburb</th>
              <th>Away (visitors)</th>
              <th style={{ width: 90, textAlign: 'right' }}>Distance</th>
              <th style={{ width: 110, textAlign: 'right' }}>Travel</th>
              <th style={{ width: 110 }}>Status</th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ f, home, away, c }) => {
              if (editingId === f.id) {
                return (
                  <EditFixtureRow
                    key={f.id}
                    fixture={f}
                    teams={series.teams.map(clubBy).filter(Boolean)}
                    onSave={(updates) => {
                      updateFixture(f.id, updates);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                );
              }
              const status = f.status || 'scheduled';
              return (
                <tr
                  key={f.id}
                  className={
                    status === 'cancelled' || status === 'postponed' ? 'fix-muted-row' : ''
                  }
                >
                  <td>
                    <span className="fix-row-rd">R{f.round}</span>
                  </td>
                  <td>
                    <span className="fix-row-date">
                      {new Date(f.date).toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </td>
                  <td>
                    <div className="fix-row-team">
                      {home && <ClubAvatar club={home} size={26} />}
                      <div>
                        <div className="fix-row-team-name">{home?.name || 'TBD'}</div>
                        <div className="fix-row-team-sub">{home?.sub}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="fix-row-venue">
                      <div className="fix-row-venue-name">
                        {f.venueOverride || home?.ground?.venue || '—'}
                      </div>
                      <div className="fix-row-venue-suburb">{home?.ground?.suburb || ''}</div>
                    </div>
                  </td>
                  <td>
                    <div className="fix-row-team">
                      {away && <ClubAvatar club={away} size={26} />}
                      <div>
                        <div className="fix-row-team-name">{away?.name || 'TBD'}</div>
                        <div className="fix-row-team-sub">{away?.sub}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="fix-row-dist">
                      {c.distanceKm.toFixed(1)}
                      <span className="unit">km</span>
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="fix-row-cost">
                      <span className="cur">R</span>
                      {Math.round(c.fuelR).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span className={`fix-status ${status}`}>{status}</span>
                  </td>
                  <td>
                    <div className="fix-row-actions">
                      <button
                        className="fix-action-btn"
                        title="Edit fixture"
                        onClick={() => setEditingId(f.id)}
                      >
                        <svg viewBox="0 0 16 16" fill="none">
                          <path
                            d="M11 2l3 3-7.5 7.5L3 13l.5-3.5L11 2z"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        className="fix-action-btn danger"
                        title="Delete fixture"
                        onClick={() => deleteFixture(f.id)}
                      >
                        <svg viewBox="0 0 16 16" fill="none">
                          <path
                            d="M3 4h10M5 4l1-2h4l1 2M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
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
                  No fixtures match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="fix-totals">
          <div className="fix-totals-item">
            <div className="fix-totals-l">Fixtures</div>
            <div className="fix-totals-n">{series.fixtures.length}</div>
          </div>
          <div className="fix-totals-item">
            <div className="fix-totals-l">Total km (round-trip)</div>
            <div className="fix-totals-n">{Math.round(totalKm).toLocaleString()} km</div>
          </div>
          <div className="fix-totals-item">
            <div className="fix-totals-l">Season fuel total</div>
            <div className="fix-totals-n green">R {Math.round(totalCost).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Release bar — bottom-right CTA to publish the fixtures to clubs */}
      <div className={`fix-release-bar ${series.released ? 'released' : ''}`}>
        <div className="fix-release-text">
          {series.released ? (
            <>
              <div className="fix-release-eyebrow">✓ Live to clubs</div>
              <div className="fix-release-text-title">
                Fixtures released to all {series.teams.length} clubs
              </div>
              <div className="fix-release-text-sub">
                Published{' '}
                {new Date(series.releasedAt).toLocaleString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                · every club portal now shows their schedule + travel costs · email + SMS
                notifications sent
              </div>
            </>
          ) : (
            <>
              <div className="fix-release-eyebrow">Draft mode</div>
              <div className="fix-release-text-title">Visible only to the Lions office</div>
              <div className="fix-release-text-sub">
                Once released, every fixture goes live in every club portal, the Athlete Management
                System is notified, and email/SMS reminders go out to chairs &amp; captains.
              </div>
            </>
          )}
        </div>
        <div className="fix-release-actions">
          {series.released ? (
            <Btn tone="outline" onClick={() => onAskRecall?.(series)}>
              Recall draft
            </Btn>
          ) : (
            <Btn tone="teal" icon={Icon.Arrow} onClick={() => onAskRelease?.(series)}>
              Release to clubs →
            </Btn>
          )}
        </div>
      </div>

      {/* Confirmation modal */}
      {confirm && (
        <div
          className="fix-confirm"
          onClick={(e) => e.target === e.currentTarget && setConfirm(null)}
        >
          <div className="fix-confirm-box">
            <div className="fix-confirm-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L22 21H2L12 2z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 9v5M12 17v.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="fix-confirm-title">{confirm.title}</div>
            <div className="fix-confirm-body">{confirm.body}</div>
            <div className="fix-confirm-actions">
              <Btn tone="outline" onClick={() => setConfirm(null)}>
                Cancel
              </Btn>
              <Btn tone="ink" onClick={confirm.onYes}>
                Yes, continue
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Inline edit row */
function EditFixtureRow({ fixture, teams, onSave, onCancel }) {
  const [draft, setDraft] = useState({
    round: fixture.round,
    date: fixture.date,
    home: fixture.home,
    away: fixture.away,
    venueOverride: fixture.venueOverride || '',
    status: fixture.status || 'scheduled',
  });
  function u(k, v) {
    setDraft((prev) => ({ ...prev, [k]: v }));
  }
  return (
    <tr className="fix-edit-tr">
      <td colSpan="9">
        <div className="fix-edit-grid">
          <div className="fix-edit-field">
            <label>Round</label>
            <input
              type="number"
              min="1"
              value={draft.round}
              onChange={(e) => u('round', parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="fix-edit-field">
            <label>Date</label>
            <input type="date" value={draft.date} onChange={(e) => u('date', e.target.value)} />
          </div>
          <div className="fix-edit-field">
            <label>Home (host)</label>
            <select value={draft.home} onChange={(e) => u('home', e.target.value)}>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="fix-edit-field">
            <label>Away (visitors)</label>
            <select value={draft.away} onChange={(e) => u('away', e.target.value)}>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="fix-edit-field" style={{ gridColumn: 'span 2' }}>
            <label>Venue override</label>
            <input
              type="text"
              placeholder="(use home club's ground)"
              value={draft.venueOverride}
              onChange={(e) => u('venueOverride', e.target.value)}
            />
          </div>
          <div className="fix-edit-field">
            <label>Status</label>
            <select value={draft.status} onChange={(e) => u('status', e.target.value)}>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="postponed">Postponed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div
            className="fix-edit-actions"
            style={{ gridColumn: 'span 6', justifyContent: 'flex-end', marginTop: 8 }}
          >
            <Btn tone="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Btn>
            <Btn tone="ink" size="sm" icon={Icon.Check} onClick={() => onSave(draft)}>
              Save changes
            </Btn>
          </div>
        </div>
      </td>
    </tr>
  );
}

/* ─── CreateSeriesForm — long form mirroring the cricclubs structure ─── */
function CreateSeriesForm({ clubs, onCreate, onClose }) {
  const [d, setD] = useState({
    name: '',
    startDate: '',
    divisions: false,
    groups: 1,
    maxOvers: 20,
    maxPlayers: 11,
    rosterLimit: 'No Limit',
    ballType: 'Hard Tennis Ball',
    seriesType: 'Twenty20 (16-25 overs)',
    powerPlay: false,
    category: 'Men',
    level: 'Club',
    winPoints: 2,
    bonusPoints: 0,
    lossPoints: 0,
    tiePoints: 1,
    abandonedPoints: 1,
    ballsPerOver: 0,
    maxBallsPerOver: 0,
    minLeagueMatches: 0,
    configureExtras: false,
    lockAfterLive: false,
    lockAfterManual: false,
    preventTeamSwitch: false,
    umpireReportsMandatory: false,
    captainReportsMandatory: false,
    sendReportEmails: false,
    rankCalculator: 'New',
    hideSeriesDetails: false,
    allowLockedRegistration: false,
    pointsTableOrder: ['Most Points', 'NRR', 'Head To Head', 'Number of Wins', 'Win Percentage'],
    tags: '',
    teams: [],
    costPerKm: 4.5,
    carsPerAwayTrip: 3,
  });
  function u(k, v) {
    setD((prev) => ({ ...prev, [k]: v }));
  }
  function toggleTeam(id) {
    setD((prev) => ({
      ...prev,
      teams: prev.teams.includes(id) ? prev.teams.filter((t) => t !== id) : [...prev.teams, id],
    }));
  }
  function moveOrder(idx, dir) {
    setD((prev) => {
      const arr = [...prev.pointsTableOrder];
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return prev;
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
      return { ...prev, pointsTableOrder: arr };
    });
  }

  const eligibleTeams = clubs.filter((c) => c.paid);
  const canCreate = d.name && d.startDate && d.teams.length >= 2;

  function submit() {
    if (!canCreate) return;
    const series = {
      id: 's-' + Date.now(),
      ...d,
      tags: d.tags
        ? d.tags
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      fixtures: generateRoundRobin(d.teams, d.startDate),
    };
    onCreate(series);
    onClose();
  }

  return (
    <div className="cs-form">
      {/* Basic info */}
      <div className="cs-row">
        <div className="cs-row-label">
          Series Name<span className="req">*</span>
        </div>
        <div className="cs-row-input">
          <input
            className="field-input"
            placeholder="e.g. Premier League T20 · 2026/27"
            value={d.name}
            onChange={(e) => u('name', e.target.value)}
          />
        </div>
      </div>
      <div className="cs-row">
        <div className="cs-row-label">
          Start Date<span className="req">*</span>
        </div>
        <div className="cs-row-input">
          <input type="date" value={d.startDate} onChange={(e) => u('startDate', e.target.value)} />
        </div>
      </div>
      <div className="cs-row">
        <div className="cs-row-label">Series has Divisions?</div>
        <div className="cs-row-input">
          <YN value={d.divisions} onChange={(v) => u('divisions', v)} />
        </div>
      </div>
      <div className="cs-row">
        <div className="cs-row-label">Groups</div>
        <div className="cs-row-input">
          <input
            className="field-input"
            type="number"
            min="1"
            max="8"
            value={d.groups}
            onChange={(e) => u('groups', parseInt(e.target.value) || 1)}
            style={{ width: 90 }}
          />
        </div>
      </div>
      <div className="cs-row">
        <div className="cs-row-label">Maximum Overs</div>
        <div className="cs-row-input">
          <select
            className="field-select"
            value={d.maxOvers}
            onChange={(e) => u('maxOvers', parseInt(e.target.value))}
            style={{ width: 120 }}
          >
            {[10, 15, 20, 25, 30, 40, 45, 50].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="cs-row">
        <div className="cs-row-label">Max Players per Team in a Match</div>
        <div className="cs-row-input">
          <select
            className="field-select"
            value={d.maxPlayers}
            onChange={(e) => u('maxPlayers', parseInt(e.target.value))}
            style={{ width: 90 }}
          >
            {[7, 8, 9, 10, 11, 12, 13].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="cs-row">
        <div className="cs-row-label">Max Player Limit for Roster</div>
        <div className="cs-row-input">
          <select
            className="field-select"
            value={d.rosterLimit}
            onChange={(e) => u('rosterLimit', e.target.value)}
            style={{ width: 130 }}
          >
            <option>No Limit</option>
            <option>15</option>
            <option>18</option>
            <option>20</option>
            <option>25</option>
          </select>
        </div>
      </div>
      <div className="cs-row">
        <div className="cs-row-label">Ball Type</div>
        <div className="cs-row-input">
          <select
            className="field-select"
            value={d.ballType}
            onChange={(e) => u('ballType', e.target.value)}
            style={{ width: 200 }}
          >
            <option>Cricket Ball</option>
            <option>Hard Tennis Ball</option>
            <option>Tape Ball</option>
          </select>
        </div>
      </div>
      <div className="cs-row">
        <div className="cs-row-label">Series Type</div>
        <div className="cs-row-input">
          <select
            className="field-select"
            value={d.seriesType}
            onChange={(e) => u('seriesType', e.target.value)}
            style={{ width: 220 }}
          >
            <option>Twenty20 (16-25 overs)</option>
            <option>One-Day (40-50 overs)</option>
            <option>Multi-Day</option>
            <option>The Hundred</option>
          </select>
        </div>
      </div>
      <div className="cs-row">
        <div className="cs-row-label">Power Play Applicable?</div>
        <div className="cs-row-input">
          <YN value={d.powerPlay} onChange={(v) => u('powerPlay', v)} />
        </div>
      </div>
      <div className="cs-row">
        <div className="cs-row-label">Category</div>
        <div className="cs-row-input">
          <select
            className="field-select"
            value={d.category}
            onChange={(e) => u('category', e.target.value)}
            style={{ width: 120 }}
          >
            <option>Men</option>
            <option>Women</option>
            <option>Mixed</option>
            <option>U19</option>
          </select>
        </div>
      </div>
      <div className="cs-row">
        <div className="cs-row-label">Level</div>
        <div className="cs-row-input">
          <select
            className="field-select"
            value={d.level}
            onChange={(e) => u('level', e.target.value)}
            style={{ width: 140 }}
          >
            <option>Club</option>
            <option>School</option>
            <option>Veterans</option>
          </select>
        </div>
      </div>

      {/* Points */}
      <div className="cs-section">
        <div className="cs-section-title">— Points Awards</div>
      </div>
      <div className="cs-row">
        <div className="cs-row-label">
          Match outcomes<span className="req">*</span>
        </div>
        <div className="cs-row-input cs-row-multi">
          <div className="cs-row-multi-item">
            <label>Win</label>
            <input
              type="number"
              value={d.winPoints}
              onChange={(e) => u('winPoints', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="cs-row-multi-item">
            <label>Bonus</label>
            <input
              type="number"
              value={d.bonusPoints}
              onChange={(e) => u('bonusPoints', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="cs-row-multi-item">
            <label>Loss</label>
            <input
              type="number"
              value={d.lossPoints}
              onChange={(e) => u('lossPoints', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="cs-row-multi-item">
            <label>Tie</label>
            <input
              type="number"
              value={d.tiePoints}
              onChange={(e) => u('tiePoints', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="cs-row-multi-item">
            <label>Abandoned</label>
            <input
              type="number"
              value={d.abandonedPoints}
              onChange={(e) => u('abandonedPoints', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>
      <div className="cs-row">
        <div className="cs-row-label">Balls per over / Max</div>
        <div className="cs-row-input cs-row-multi">
          <div className="cs-row-multi-item">
            <label>Standard</label>
            <input
              type="number"
              value={d.ballsPerOver}
              onChange={(e) => u('ballsPerOver', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="cs-row-multi-item">
            <label>Max</label>
            <input
              type="number"
              value={d.maxBallsPerOver}
              onChange={(e) => u('maxBallsPerOver', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>
      <div className="cs-row">
        <div className="cs-row-label">Minimum league matches (player playoff eligibility)</div>
        <div className="cs-row-input">
          <input
            className="field-input"
            type="number"
            value={d.minLeagueMatches}
            onChange={(e) => u('minLeagueMatches', parseInt(e.target.value) || 0)}
            style={{ width: 90 }}
          />
        </div>
      </div>

      {/* Yes / No config */}
      <div className="cs-section">
        <div className="cs-section-title">— Match &amp; Scorecard Configuration</div>
      </div>
      {[
        ['configureExtras', 'Configure extras as good balls?'],
        ['lockAfterLive', 'Lock scorecard after live scoring?'],
        ['lockAfterManual', 'Lock scorecard after manual update?'],
        ['preventTeamSwitch', 'Prevent players switching teams after playing?'],
        ['umpireReportsMandatory', 'Umpire reports mandatory?'],
        ['captainReportsMandatory', 'Captain reports mandatory?'],
        ['sendReportEmails', 'Email captain/umpires for end-of-match reports?'],
        ['hideSeriesDetails', 'Hide series details?'],
        ['allowLockedRegistration', 'Allow player registration when team is locked?'],
      ].map(([key, label]) => (
        <div key={key} className="cs-row">
          <div className="cs-row-label">{label}</div>
          <div className="cs-row-input">
            <YN value={d[key]} onChange={(v) => u(key, v)} />
          </div>
        </div>
      ))}
      <div className="cs-row">
        <div className="cs-row-label">Rank Calculator</div>
        <div className="cs-row-input">
          <Choice
            value={d.rankCalculator}
            onChange={(v) => u('rankCalculator', v)}
            options={['Old', 'New']}
          />
        </div>
      </div>

      {/* Travel cost defaults */}
      <div className="cs-section">
        <div className="cs-section-title">— Travel &amp; Logistics</div>
      </div>
      <div className="cs-row">
        <div className="cs-row-label">Default cost per km / Cars per away trip</div>
        <div className="cs-row-input cs-row-multi">
          <div className="cs-row-multi-item">
            <label>R / km</label>
            <input
              type="number"
              step="0.10"
              value={d.costPerKm}
              onChange={(e) => u('costPerKm', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="cs-row-multi-item">
            <label>Cars</label>
            <input
              type="number"
              value={d.carsPerAwayTrip}
              onChange={(e) => u('carsPerAwayTrip', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
      </div>

      {/* Points Table Order */}
      <div className="cs-section">
        <div className="cs-section-title">— Points Table Order</div>
      </div>
      <div className="cs-row">
        <div className="cs-row-label">Tie-break sequence (top wins first)</div>
        <div className="cs-row-input">
          <div className="cs-points-list">
            {d.pointsTableOrder.map((rule, idx) => (
              <div key={rule} className="cs-points-row">
                <span className="order-num">{idx + 1}</span>
                {rule}
                <span className="cs-points-grip" style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => moveOrder(idx, -1)}
                    disabled={idx === 0}
                    style={{
                      background: 'transparent',
                      border: 0,
                      color: 'var(--muted)',
                      cursor: idx === 0 ? 'not-allowed' : 'pointer',
                      padding: 2,
                    }}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveOrder(idx, 1)}
                    disabled={idx === d.pointsTableOrder.length - 1}
                    style={{
                      background: 'transparent',
                      border: 0,
                      color: 'var(--muted)',
                      cursor: idx === d.pointsTableOrder.length - 1 ? 'not-allowed' : 'pointer',
                      padding: 2,
                    }}
                  >
                    ↓
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Teams */}
      <div className="cs-section">
        <div className="cs-section-title">— Teams Entered ({d.teams.length} selected)</div>
      </div>
      <div className="cs-row">
        <div className="cs-row-label">Pick affiliated clubs (paid only)</div>
        <div className="cs-row-input">
          <div className="cs-teams-grid">
            {eligibleTeams.map((c) => {
              const on = d.teams.includes(c.id);
              return (
                <button
                  key={c.id}
                  className={`cs-team-chip ${on ? 'on' : ''}`}
                  onClick={() => toggleTeam(c.id)}
                >
                  {on && <Icon.Check />}
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="cs-row">
        <div className="cs-row-label">
          Tags{' '}
          <span style={{ color: 'var(--muted)', fontSize: 11, marginLeft: 4 }}>
            (comma-separated)
          </span>
        </div>
        <div className="cs-row-input">
          <input
            className="field-input"
            placeholder="Premier, Men, Round-robin"
            value={d.tags}
            onChange={(e) => u('tags', e.target.value)}
          />
        </div>
      </div>

      <div
        className="row"
        style={{ marginTop: 22, justifyContent: 'space-between', gap: 10, padding: '12px 0' }}
      >
        <div
          style={{
            fontSize: 11.5,
            color: 'var(--muted)',
            fontFamily: "'Montserrat',sans-serif",
            fontWeight: 500,
          }}
        >
          {canCreate
            ? `Ready · will generate ${(d.teams.length * (d.teams.length - 1)) / 2} round-robin fixtures from ${d.startDate}`
            : 'Series name, start date and at least 2 teams are required'}
        </div>
        <div className="row" style={{ gap: 8 }}>
          <Btn tone="outline" onClick={onClose}>
            Cancel
          </Btn>
          <Btn tone="teal" icon={Icon.Check} disabled={!canCreate} onClick={submit}>
            Create series
          </Btn>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ clubs, gotoClub, gotoList }) {
  const stats = cohortStats(clubs);
  const pct = (n, d) => Math.round((n / d) * 100);

  // Sort by progress descending for "at risk" / "leaders"
  const ranked = [...clubs]
    .map((c) => ({ ...c, prog: overallProgress(c) }))
    .sort((a, b) => b.prog - a.prog);
  const leaders = ranked.slice(0, 5);
  const atRisk = [...ranked].sort((a, b) => a.prog - b.prog).slice(0, 5);

  // Phase completion roll-up
  const phases = [
    { num: '01', label: 'Affiliation', tone: 'navy', done: clubs.filter((c) => c.paid).length },
    {
      num: '02',
      label: 'League / Fixtures',
      tone: 'teal',
      done: clubs.filter((c) => c.affiliation === 'complete').length,
    },
    {
      num: '03',
      label: 'Player Registration',
      tone: 'navy',
      done: clubs.filter((c) => c.players >= 30).length,
    },
    { num: '04', label: 'Live Scoring / Talent ID', tone: 'teal', done: 0 },
    {
      num: '05',
      label: 'Compliance Docs',
      tone: 'gold',
      done: clubs.filter((c) => Object.values(c.docs).every((v) => v)).length,
    },
  ];

  return (
    <div>
      {/* Aspirational hero banner */}
      <div
        className="hero-banner"
        style={{ backgroundImage: "url('players/lions-hero.jpg')", height: 170 }}
      >
        <div className="hero-content">
          <div className="hero-eyebrow">DP World Lions · KZNCU &amp; EMCU</div>
          <h2 className="hero-title">
            Building the next <em>generation</em>.
          </h2>
          <p className="hero-sub">
            Every club below is a feeder for our provincial squad. Track readiness, lift standards,
            identify talent.
          </p>
        </div>
        <div className="hero-attrib">
          <strong>DP World Lions</strong> · Senior squad
        </div>
      </div>

      <div className="page-head">
        <div className="ph-left">
          <div className="ph-crumb">Lions · Admin Console</div>
          <h1 className="ph-title">
            Club Integration <em>Cohort</em>
          </h1>
          <p className="ph-desc">
            86 affiliated clubs across KZNCU &amp; EMCU. Track affiliation, document compliance, CQI
            scoring and franchise readiness for the 2026/27 season.
          </p>
        </div>
        <div className="ph-actions">
          <Btn tone="outline" icon={Icon.Download} size="sm">
            Export cohort report
          </Btn>
          <Btn tone="ink" icon={Icon.Mail} size="sm">
            Send bulk reminder
          </Btn>
        </div>
      </div>

      {/* Deadline banner */}
      <div className="deadline">
        <div className="deadline-icon">
          <Icon.Clock />
        </div>
        <div className="deadline-text">
          <strong>Submission deadline · 22 June 2026.</strong> Clubs must complete affiliation,
          upload required compliance documents, and submit the CQI form.{' '}
          <span className="days">31 days remaining</span>.
        </div>
        <div className="deadline-cta">
          <Btn tone="outline" size="sm">
            Edit deadline
          </Btn>
        </div>
      </div>

      <div className="kpi-strip">
        <KPI label="Total clubs" num={<CountUp to={stats.total} />} sub="2026/27 season" />
        <KPI
          tone={statusFor(pct(stats.paid, stats.total))}
          label="Affiliated &amp; paid"
          num={<CountUp to={stats.paid} />}
          sub={`${pct(stats.paid, stats.total)}% of cohort`}
        />
        <KPI
          tone={statusFor(pct(stats.docsComplete, stats.total))}
          label="Docs compliant"
          num={<CountUp to={stats.docsComplete} />}
          sub={`${pct(stats.docsComplete, stats.total)}% complete`}
        />
        <KPI
          tone={statusFor(pct(stats.cqiSubmitted, stats.total))}
          label="CQI submitted"
          num={<CountUp to={stats.cqiSubmitted} />}
          sub={`${pct(stats.cqiSubmitted, stats.total)}% submitted`}
        />
        <KPI
          tone={statusFor(stats.avgCqi, 75, 60)}
          label="Avg CQI score"
          num={<CountUp to={stats.avgCqi} decimals={1} />}
          sub="of 100"
        />
      </div>

      {/* Phase roll-up */}
      <Card
        title="Integration phase roll-up"
        sub="Cohort progress through the 5-phase smart integration journey"
      >
        <div className="phase-track" style={{ borderRadius: 0, border: 'none' }}>
          {phases.map((p, i) => (
            <div
              key={i}
              className="phase-step"
              style={{
                padding: '14px 18px',
                borderRight: i < phases.length - 1 ? '1px solid var(--line)' : 'none',
              }}
            >
              <div className="ps-n">PHASE {p.num}</div>
              <div className="ps-t">{p.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                <div style={{ flex: 1 }}>
                  <ProgressBar value={pct(p.done, stats.total)} tone={p.tone} />
                </div>
                <div
                  style={{
                    fontFamily: "'Montserrat',sans-serif",
                    fontSize: 11,
                    color: 'var(--muted)',
                  }}
                >
                  {p.done}/{stats.total}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginTop: 16 }}>
        <Card title="Recent activity" sub="Last 7 days · all districts">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { who: 'Clares CC', what: 'submitted CQI form', when: '2h ago', tone: 'teal' },
              { who: 'Harlequins CC', what: 'uploaded AGM Minutes', when: '5h ago', tone: 'teal' },
              {
                who: 'UKZN CC',
                what: 'completed affiliation payment · R 4,500',
                when: '1d ago',
                tone: 'navy',
              },
              {
                who: 'Phoenix CC',
                what: 'viewed affiliation form but has not submitted',
                when: '2d ago',
                tone: 'gold',
              },
              {
                who: 'Berea Rovers CC',
                what: 'affiliation form started, payment pending',
                when: '3d ago',
                tone: 'gold',
              },
              {
                who: 'Tongaat CC',
                what: 'has not started — 2 reminders sent',
                when: '6d ago',
                tone: 'coral',
              },
            ].map((a, i) => (
              <div
                key={i}
                className="row"
                style={{
                  padding: '8px 10px',
                  borderRadius: 6,
                  background: i % 2 ? 'var(--paper)' : 'transparent',
                }}
              >
                <span className={`sdot ${a.tone}`} />
                <span style={{ fontWeight: 500, color: 'var(--ink)', fontSize: 13 }}>{a.who}</span>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--muted)' }}>{a.what}</span>
                <span
                  style={{
                    fontFamily: "'Montserrat',sans-serif",
                    fontSize: 10.5,
                    color: 'var(--muted-2)',
                  }}
                >
                  {a.when}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Leaderboard"
          sub="Highest overall integration progress"
          action={
            <button className="btn btn-ghost btn-sm" onClick={gotoList}>
              View all <Icon.Arrow />
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {leaders.map((c, i) => (
              <button
                key={c.id}
                className="row"
                style={{ padding: '6px 4px', width: '100%', textAlign: 'left' }}
                onClick={() => gotoClub(c.id)}
              >
                <span
                  style={{
                    fontFamily: "'Montserrat',sans-serif",
                    fontSize: 11,
                    fontWeight: 800,
                    color: i === 0 ? '#076B36' : i < 3 ? 'var(--ink)' : 'var(--muted-2)',
                    width: 20,
                    textAlign: 'center',
                  }}
                >
                  0{i + 1}
                </span>
                <ClubAvatar club={c} size={26} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                <ProgChip
                  value={c.prog}
                  tone={c.prog >= 80 ? 'teal' : c.prog >= 60 ? 'gold' : 'coral'}
                />
              </button>
            ))}
          </div>
          <div className="hr" />
          <div
            style={{
              fontFamily: "'Montserrat',sans-serif",
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--coral)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            At risk · needs intervention
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {atRisk.map((c) => (
              <button
                key={c.id}
                className="row"
                style={{ padding: '6px 4px', width: '100%', textAlign: 'left' }}
                onClick={() => gotoClub(c.id)}
              >
                <ClubAvatar club={c} size={26} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                <ProgChip value={c.prog} tone="coral" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─── Cohort insights — visualises CQI bands, doc compliance, outstanding resources ─── */
function ClubInsights({ clubs }) {
  // CQI bands
  const bandTone = (key) =>
    key === 'C' ? 'warn' : key === 'D' ? 'danger' : key === 'P' ? 'pending' : '';
  const bands = [
    { key: 'A', label: 'A · 80+', count: clubs.filter((c) => c.cqi >= 80).length },
    { key: 'B', label: 'B · 65–80', count: clubs.filter((c) => c.cqi >= 65 && c.cqi < 80).length },
    { key: 'C', label: 'C · 50–65', count: clubs.filter((c) => c.cqi >= 50 && c.cqi < 65).length },
    { key: 'D', label: 'D · <50', count: clubs.filter((c) => c.cqi > 0 && c.cqi < 50).length },
    { key: 'P', label: 'Pending', count: clubs.filter((c) => c.cqi === 0).length },
  ];
  const maxBand = Math.max(...bands.map((b) => b.count), 1);
  const submitted = clubs.filter((c) => c.cqi > 0);
  const avgCqi = submitted.length ? submitted.reduce((s, c) => s + c.cqi, 0) / submitted.length : 0;

  // Doc compliance per required doc
  const docStats = REQUIRED_DOCS.map((d) => {
    const uploaded = clubs.filter((c) => c.docs[d.key]).length;
    const pct = clubs.length ? Math.round((uploaded / clubs.length) * 100) : 0;
    return { key: d.key, name: d.name, count: uploaded, total: clubs.length, pct };
  });
  const mostMissing = [...docStats].sort((a, b) => a.count - b.count)[0];
  const docTone = (pct) => (pct >= 70 ? '' : pct >= 40 ? 'warn' : 'danger');

  // Resources required
  const unpaid = clubs.filter((c) => !c.paid).length;
  const incompleteDocs = clubs.filter((c) => !Object.values(c.docs).every((v) => v)).length;
  const noCqi = clubs.filter((c) => c.cqi === 0).length;
  const totalReminders = unpaid + noCqi;

  return (
    <div className="insights-panel">
      {/* ─── CQI Score Distribution ─── */}
      <div className="insights-card">
        <div className="insights-card-head">
          <div className="insights-card-title">CQI Score Distribution</div>
          <div className="insights-card-meta">
            Avg <CountUp to={avgCqi} decimals={1} />
          </div>
        </div>
        {bands.map((b) => (
          <div key={b.key} className="insights-bar-row">
            <div className="insights-bar-label">{b.label}</div>
            <div className="insights-bar-track">
              <div
                className={`insights-bar-fill ${bandTone(b.key)}`}
                style={{ width: (b.count / maxBand) * 100 + '%' }}
              />
            </div>
            <div className="insights-bar-num">{b.count}</div>
          </div>
        ))}
        <div className="insights-callout good">
          <strong>{submitted.length}</strong> of {clubs.length} clubs submitted CQI · spread across{' '}
          {bands.filter((b) => b.count > 0 && b.key !== 'P').length} performance band
          {bands.filter((b) => b.count > 0 && b.key !== 'P').length === 1 ? '' : 's'}
        </div>
      </div>

      {/* ─── Document Compliance ─── */}
      <div className="insights-card">
        <div className="insights-card-head">
          <div className="insights-card-title">Document Compliance</div>
          <div className="insights-card-meta">of {clubs.length} clubs</div>
        </div>
        {docStats.map((d) => (
          <div key={d.key} className="insights-bar-row wide-label">
            <div className="insights-bar-label" title={d.name}>
              {d.name}
            </div>
            <div className="insights-bar-track">
              <div
                className={`insights-bar-fill ${docTone(d.pct)}`}
                style={{ width: d.pct + '%' }}
              />
            </div>
            <div className="insights-bar-num">
              {d.count}/{d.total}
            </div>
          </div>
        ))}
        <div className={`insights-callout ${mostMissing.pct < 40 ? 'alert' : 'warn'}`}>
          Most missing: <strong>{mostMissing.name}</strong> — only{' '}
          <strong>{mostMissing.count}</strong> of {mostMissing.total} clubs uploaded
        </div>
      </div>

      {/* ─── Resources Required ─── */}
      <div className="insights-card">
        <div className="insights-card-head">
          <div className="insights-card-title">Resources Required</div>
          <div className="insights-card-meta">22 Jun deadline</div>
        </div>
        <div className="resource-list">
          <div className="resource-row">
            <span
              className={`resource-num ${unpaid > clubs.length * 0.3 ? 'danger' : unpaid > 0 ? 'warn' : 'good'}`}
            >
              <CountUp to={unpaid} />
            </span>
            <span className="resource-text">
              <strong>{unpaid === 1 ? 'club' : 'clubs'}</strong> haven't paid affiliation · R 4,500
              each
            </span>
          </div>
          <div className="resource-row">
            <span
              className={`resource-num ${incompleteDocs > clubs.length * 0.3 ? 'danger' : incompleteDocs > 0 ? 'warn' : 'good'}`}
            >
              <CountUp to={incompleteDocs} />
            </span>
            <span className="resource-text">
              <strong>{incompleteDocs === 1 ? 'club' : 'clubs'}</strong> missing one or more
              compliance docs
            </span>
          </div>
          <div className="resource-row">
            <span
              className={`resource-num ${noCqi > clubs.length * 0.3 ? 'danger' : noCqi > 0 ? 'warn' : 'good'}`}
            >
              <CountUp to={noCqi} />
            </span>
            <span className="resource-text">
              <strong>{noCqi === 1 ? 'club' : 'clubs'}</strong> haven't submitted their CQI form
            </span>
          </div>
        </div>
        <div className="insights-callout alert">
          Send <strong>{totalReminders}</strong> reminder{totalReminders === 1 ? '' : 's'} before{' '}
          <strong>22 June</strong> — target the at-risk clubs first.
        </div>
      </div>
    </div>
  );
}

function AdminClubsList({ clubs, gotoClub }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    let cs = clubs;
    if (q)
      cs = cs.filter(
        (c) =>
          c.name.toLowerCase().includes(q.toLowerCase()) ||
          c.chair.toLowerCase().includes(q.toLowerCase())
      );
    if (filter === 'complete')
      cs = cs.filter(
        (c) => c.affiliation === 'complete' && Object.values(c.docs).every((v) => v) && c.cqi > 0
      );
    if (filter === 'incomplete')
      cs = cs.filter(
        (c) => !(c.affiliation === 'complete' && Object.values(c.docs).every((v) => v) && c.cqi > 0)
      );
    if (filter === 'not_paid') cs = cs.filter((c) => !c.paid);
    if (filter === 'no_cqi') cs = cs.filter((c) => c.cqi === 0);
    return cs;
  }, [clubs, q, filter]);

  const counts = useMemo(
    () => ({
      all: clubs.length,
      complete: clubs.filter(
        (c) => c.affiliation === 'complete' && Object.values(c.docs).every((v) => v) && c.cqi > 0
      ).length,
      incomplete: clubs.filter(
        (c) => !(c.affiliation === 'complete' && Object.values(c.docs).every((v) => v) && c.cqi > 0)
      ).length,
      not_paid: clubs.filter((c) => !c.paid).length,
      no_cqi: clubs.filter((c) => c.cqi === 0).length,
    }),
    [clubs]
  );

  return (
    <div>
      <div className="page-head">
        <div className="ph-left">
          <div className="ph-crumb">Lions · Admin Console / Clubs</div>
          <h1 className="ph-title">
            Club <em>directory</em>
          </h1>
          <p className="ph-desc">
            Filter, sort and drill into each affiliated club's submission status across all five
            phases of the smart integration programme.
          </p>
        </div>
        <div className="ph-actions">
          <Btn tone="outline" icon={Icon.Download} size="sm">
            Export CSV
          </Btn>
          <Btn tone="ink" icon={Icon.Plus} size="sm">
            Onboard new club
          </Btn>
        </div>
      </div>

      {/* Cohort insights panel — CQI distribution, document compliance, resources required */}
      <ClubInsights clubs={clubs} />

      <div className="filter-row">
        <input
          className="search-box"
          placeholder="Search by club name or chairperson…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {[
          { k: 'all', label: 'All clubs' },
          { k: 'complete', label: 'Fully integrated' },
          { k: 'incomplete', label: 'Incomplete' },
          { k: 'not_paid', label: 'Affiliation unpaid' },
          { k: 'no_cqi', label: 'CQI not submitted' },
        ].map((f) => (
          <button
            key={f.k}
            className={`filter-pill ${filter === f.k ? 'active' : ''}`}
            onClick={() => setFilter(f.k)}
          >
            {f.label}
            <span className="count">{counts[f.k]}</span>
          </button>
        ))}
      </div>

      <div className="tbl-w">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: '24%' }}>Club</th>
              <th>Chairperson</th>
              <th>Affiliation</th>
              <th>Docs</th>
              <th>CQI</th>
              <th>Overall</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const dc = docCompletion(c);
              const op = overallProgress(c);
              const band = cqiBand(c.cqi);
              return (
                <tr key={c.id} className="clickable" onClick={() => gotoClub(c.id)}>
                  <td>
                    <ClubNameCell club={c} />
                  </td>
                  <td>
                    <div style={{ fontSize: 12.5 }}>{c.chair}</div>
                    <div
                      style={{
                        fontSize: 10.5,
                        color: 'var(--muted-2)',
                        fontFamily: "'Montserrat',sans-serif",
                      }}
                    >
                      {c.sub}
                    </div>
                  </td>
                  <td>
                    {affPill(c.affiliation)}{' '}
                    {c.paid && (
                      <span
                        style={{
                          fontFamily: "'Montserrat',sans-serif",
                          fontSize: 10,
                          color: 'var(--teal-deep)',
                          marginLeft: 6,
                        }}
                      >
                        · PAID
                      </span>
                    )}
                  </td>
                  <td>
                    <ProgChip value={dc} tone={dc === 100 ? 'teal' : dc >= 50 ? 'gold' : 'coral'} />
                  </td>
                  <td>
                    <Pill tone={band.tone}>{band.label}</Pill>
                  </td>
                  <td>
                    <ProgChip value={op} tone={op >= 80 ? 'teal' : op >= 50 ? 'gold' : 'coral'} />
                  </td>
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

function AdminClubDetail({ club, gotoList }) {
  if (!club) return null;
  const dc = docCompletion(club);
  const op = overallProgress(club);
  const band = cqiBand(club.cqi);

  const phases = [
    {
      n: '01',
      t: 'Affiliation',
      done: club.paid,
      val: club.paid ? 100 : club.affiliation === 'in_progress' ? 40 : 0,
      detail: club.paid ? 'Paid R 4,500 · 12 May 2026' : 'Awaiting payment',
    },
    {
      n: '02',
      t: 'League & Fixtures',
      done: club.affiliation === 'complete',
      val: club.affiliation === 'complete' ? 100 : 0,
      detail:
        club.affiliation === 'complete'
          ? `Allocated to ${club.sub === 'EMCU' ? 'EMCU Premier' : 'Provincial Promotion'}`
          : 'Pending affiliation',
    },
    {
      n: '03',
      t: 'Player Registration',
      done: club.players >= 30,
      val: Math.min(100, ((club.players || 0) / 60) * 100),
      detail: `${club.players || 0} players registered`,
    },
    {
      n: '04',
      t: 'Live Scoring',
      done: false,
      val: club.cqi > 0 ? 25 : 0,
      detail: 'Begins round 1 · 02 Aug 2026',
    },
    {
      n: '05',
      t: 'Compliance',
      done: dc === 100,
      val: dc,
      detail: `${Object.values(club.docs).filter((v) => v).length} of 4 docs uploaded`,
    },
  ];

  return (
    <div>
      <div className="page-head">
        <div className="ph-left">
          <div className="ph-crumb">
            <a onClick={gotoList}>Clubs</a> &nbsp;/&nbsp; {club.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4 }}>
            <ClubAvatar club={club} size={44} />
            <div>
              <h1 className="ph-title" style={{ margin: 0 }}>
                {club.name}
              </h1>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--muted)',
                  fontFamily: "'Montserrat',sans-serif",
                  marginTop: 4,
                }}
              >
                {club.district} · {club.sub} · {club.chair}
              </div>
            </div>
          </div>
        </div>
        <div className="ph-actions">
          <Btn tone="outline" icon={Icon.Mail} size="sm">
            Email chairperson
          </Btn>
          <Btn tone="ink" icon={Icon.Eye} size="sm">
            View as club
          </Btn>
        </div>
      </div>

      <div className="kpi-strip">
        <KPI tone="navy" label="Overall progress" num={op + '%'} sub="all phases" />
        <KPI
          tone="teal"
          label="Affiliation"
          num={club.paid ? 'Paid' : 'Pending'}
          sub={club.paid ? 'R 4,500' : 'R 0 · awaiting'}
        />
        <KPI
          tone="gold"
          label="Documents"
          num={`${Object.values(club.docs).filter((v) => v).length}/4`}
          sub="compliance docs"
        />
        <KPI
          tone={band.tone === 'coral' ? 'coral' : ''}
          label="CQI score"
          num={club.cqi.toFixed(1)}
          sub={band.label}
        />
        <KPI
          label="Players"
          num={club.players}
          sub={`${club.teams} teams · ${club.juniors} junior`}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <div className="stack">
          <Card title="Phase status" sub="Smart Club Integration · 5-phase journey">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {phases.map((p) => (
                <div
                  key={p.n}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '48px 1fr 180px 90px',
                    gap: 14,
                    alignItems: 'center',
                    padding: '10px 12px',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    background: p.done ? 'rgba(15,143,74,0.03)' : 'var(--white)',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: p.done ? 'var(--teal)' : 'var(--paper2)',
                      color: p.done ? '#fff' : 'var(--muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Montserrat',sans-serif",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {p.done ? <Icon.Check /> : p.n}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Montserrat',sans-serif",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {p.t}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--muted)',
                        fontFamily: "'Montserrat',sans-serif",
                        marginTop: 2,
                      }}
                    >
                      {p.detail}
                    </div>
                  </div>
                  <ProgressBar value={p.val} tone={p.done ? 'teal' : 'gold'} />
                  <div
                    style={{
                      textAlign: 'right',
                      fontFamily: "'Montserrat',sans-serif",
                      fontSize: 12,
                      color: 'var(--ink)',
                      fontWeight: 500,
                    }}
                  >
                    {Math.round(p.val)}%
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card
            title="Compliance documents"
            sub="KZNCU 2026/27 club requirements upload"
            action={
              <Btn tone="outline" size="sm" icon={Icon.Download}>
                Download bundle
              </Btn>
            }
          >
            {REQUIRED_DOCS.map((d) => {
              const up = club.docs[d.key];
              return (
                <div key={d.key} className={`doc-row ${up ? 'uploaded' : ''}`}>
                  <div className="doc-icon">
                    <Icon.Doc />
                  </div>
                  <div className="doc-info">
                    <div className="doc-name">
                      {d.name}
                      {!up && <span className="doc-required-tag">Required</span>}
                    </div>
                    <div className="doc-meta">
                      {up
                        ? `${d.key}_2026.pdf · uploaded 14 May 2026 · 1.2 MB`
                        : 'Not yet uploaded · awaiting club'}
                    </div>
                  </div>
                  {up ? (
                    <Pill tone="teal" dot>
                      Approved
                    </Pill>
                  ) : (
                    <Pill tone="coral" dot>
                      Missing
                    </Pill>
                  )}
                </div>
              );
            })}
          </Card>

          <Card title="CQI breakdown" sub="Per-category contribution to overall score">
            {club.cqi === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '28px 0',
                  color: 'var(--muted)',
                  fontSize: 13,
                }}
              >
                CQI form not yet submitted by this club.
              </div>
            ) : (
              <div className="score-grid" style={{ marginBottom: 0 }}>
                {CQI_STRUCTURE.map((cat) => {
                  // Approximate per-cat score from the overall score
                  const ratio = Math.min(1, club.cqi / 100);
                  const wiggle =
                    {
                      admin: 1.05,
                      teams: 0.95,
                      coaching: 1.0,
                      facilities: 0.85,
                      representation: 1.0,
                    }[cat.key] || 1;
                  const score = Math.min(cat.weight, cat.weight * ratio * wiggle);
                  return (
                    <div
                      key={cat.key}
                      className="score-card"
                      style={{ '--fill': (score / cat.weight) * 100 + '%', '--accent': cat.accent }}
                    >
                      <div>
                        <span className="sc-cat">{cat.title}</span>
                        <span className="sc-w">/{cat.weight}</span>
                      </div>
                      <div className="sc-num">
                        {score.toFixed(1)}
                        <span className="sc-of">/{cat.weight}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="stack">
          <Card title="Club details">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 18px' }}>
              {[
                ['District', club.district],
                ['Sub-union', club.sub],
                ['Chairperson', club.chair],
                ['Status', club.paid ? 'Active member' : 'Pending'],
                ['Senior teams', club.teams],
                ["Women's teams", club.women],
                ['Junior teams', club.juniors],
                ['Players', club.players],
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
                  <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Communication log">
            <div className="stack" style={{ gap: 8 }}>
              {[
                { tone: 'teal', t: 'Affiliation invitation sent', d: '03 May 2026 · auto-system' },
                { tone: 'navy', t: 'Login link emailed to chair', d: '05 May 2026' },
                { tone: 'gold', t: 'Reminder — CQI form pending', d: '15 May 2026' },
                {
                  tone: 'teal',
                  t: 'AGM document uploaded',
                  d: '18 May 2026 · by chair',
                  off: !club.docs.agm,
                },
              ]
                .filter((x) => !x.off)
                .map((m, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'start',
                      gap: 10,
                      padding: '8px 0',
                      borderBottom: '1px solid var(--line2)',
                    }}
                  >
                    <span className={`sdot ${m.tone}`} style={{ marginTop: 6 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, color: 'var(--ink)' }}>{m.t}</div>
                      <div
                        style={{
                          fontSize: 10.5,
                          color: 'var(--muted-2)',
                          fontFamily: "'Montserrat',sans-serif",
                          marginTop: 2,
                        }}
                      >
                        {m.d}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <Btn
              tone="outline"
              size="sm"
              icon={Icon.Plus}
              style={{ width: '100%', marginTop: 10, justifyContent: 'center' }}
            >
              New note / reminder
            </Btn>
          </Card>

          <Card title="Quick actions">
            <div className="stack" style={{ gap: 6 }}>
              <Btn tone="ink" icon={Icon.Mail}>
                Send reminder
              </Btn>
              <Btn tone="outline" icon={Icon.Eye}>
                View submitted CQI form
              </Btn>
              <Btn tone="outline" icon={Icon.Download}>
                Download affiliation form
              </Btn>
              <Btn tone="outline" icon={Icon.Shield}>
                Mark as compliant
              </Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ─── AdminClearances — oversight of every clearance across the cohort ─── */
function AdminClearances({ clubs, players, clearanceRequests, onAdminOverride, toast }) {
  const [confirm, setConfirm] = useState(null);
  const [filter, setFilter] = useState('all');

  const playerBy = (id) => players.find((p) => p.id === id);
  const clubBy = (id) => clubs.find((c) => c.id === id);

  // Bucket
  const overdue = clearanceRequests.filter((r) => isClearanceOverdue(r));
  const pending = clearanceRequests.filter((r) => r.status === 'pending' && !isClearanceOverdue(r));
  const resolved = clearanceRequests.filter((r) => r.status !== 'pending');

  const list =
    filter === 'overdue'
      ? overdue
      : filter === 'pending'
        ? pending
        : filter === 'resolved'
          ? resolved
          : clearanceRequests;

  return (
    <div>
      <div className="page-head">
        <div className="ph-left">
          <div className="ph-crumb">Lions · Admin Console / Clearances</div>
          <h1 className="ph-title">
            Player <em>Clearances</em>
          </h1>
          <p className="ph-desc">
            Every clearance request across the cohort. Source clubs have 14 days to confirm fees +
            misconduct. After that window, the Lions office can override and approve on the source
            club's behalf.
          </p>
        </div>
        <div className="ph-actions">
          <Btn tone="outline" size="sm" icon={Icon.Download}>
            Export
          </Btn>
          <Btn tone="outline" size="sm" icon={Icon.Mail}>
            Remind overdue clubs
          </Btn>
        </div>
      </div>

      {/* KPI strip */}
      <div className="players-stats">
        <div className="players-stat">
          <div className="players-stat-l">All requests</div>
          <div className="players-stat-n">{clearanceRequests.length}</div>
        </div>
        <div className="players-stat">
          <div className="players-stat-l">Pending</div>
          <div className="players-stat-n" style={{ color: 'var(--gold)' }}>
            {pending.length}
          </div>
        </div>
        <div className="players-stat">
          <div className="players-stat-l">Overdue (&gt; 14 days)</div>
          <div className="players-stat-n" style={{ color: 'var(--coral)' }}>
            {overdue.length}
          </div>
        </div>
        <div className="players-stat">
          <div className="players-stat-l">Resolved</div>
          <div className="players-stat-n" style={{ color: 'var(--green)' }}>
            {resolved.length}
          </div>
        </div>
      </div>

      {/* Filter row */}
      <div className="filter-row" style={{ marginTop: 14 }}>
        {[
          { k: 'all', l: 'All', n: clearanceRequests.length },
          { k: 'overdue', l: 'Overdue', n: overdue.length },
          { k: 'pending', l: 'Pending', n: pending.length },
          { k: 'resolved', l: 'Resolved', n: resolved.length },
        ].map((b) => (
          <button
            key={b.k}
            className={`filter-pill ${filter === b.k ? 'active' : ''}`}
            onClick={() => setFilter(b.k)}
          >
            {b.l} <span style={{ opacity: 0.7, marginLeft: 4 }}>{b.n}</span>
          </button>
        ))}
      </div>

      {/* Request list */}
      <div className="clr-list" style={{ marginTop: 14 }}>
        {list.length === 0 && (
          <div
            style={{
              padding: '40px 16px',
              textAlign: 'center',
              color: 'var(--muted)',
              fontSize: 13,
              background: 'var(--white)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            No clearance requests match this filter.
          </div>
        )}
        {list.map((req) => {
          const player = playerBy(req.playerId);
          const fromClub = clubBy(req.fromClubId);
          const toClub = clubBy(req.toClubId);
          const overdueReq = isClearanceOverdue(req);
          const elapsed = clearanceDaysElapsed(req);
          const daysLeft = clearanceDaysRemaining(req);

          return (
            <div
              key={req.id}
              className={`clr-card admin ${overdueReq ? 'overdue' : ''} ${req.status !== 'pending' ? 'resolved' : ''}`}
            >
              <div className="clr-card-head">
                <div>
                  <div className="clr-eyebrow">
                    {req.status === 'admin-override'
                      ? '✓ Lions override'
                      : req.status === 'approved'
                        ? `✓ Cleared by ${fromClub?.short || fromClub?.name}`
                        : overdueReq
                          ? `⚠ Overdue · ${elapsed} days`
                          : `Pending · ${daysLeft} days remaining`}
                  </div>
                  <div className="clr-name">
                    {player?.firstNames} {player?.surname}
                  </div>
                  <div className="clr-meta">
                    ID {player?.idNumber} · {player?.team} · Requested{' '}
                    {new Date(req.requestedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                </div>
                <div className="clr-route">
                  <div className="clr-route-from">{fromClub?.short || fromClub?.name}</div>
                  <Icon.Arrow />
                  <div className="clr-route-to">{toClub?.short || toClub?.name}</div>
                </div>
              </div>

              {req.note && <div className="clr-note">"{req.note}"</div>}

              {/* Source-club check status — read-only on admin side */}
              <div className="clr-status-strip">
                <div className={`clr-status ${req.feesCleared ? 'on' : ''}`}>
                  <span className="clr-status-dot" />
                  Fees {req.feesCleared ? 'cleared' : 'pending'}
                </div>
                <div className={`clr-status ${req.misconductCleared ? 'on' : ''}`}>
                  <span className="clr-status-dot" />
                  Misconduct {req.misconductCleared ? 'cleared' : 'pending'}
                </div>
              </div>

              {/* Admin override CTA on overdue */}
              {overdueReq && req.status === 'pending' && (
                <div className="clr-override">
                  <div className="clr-override-text">
                    <div className="clr-override-title">
                      {fromClub?.name} hasn't actioned this in {elapsed} days.
                    </div>
                    <div className="clr-override-sub">
                      The Lions office can override the source club's approval and issue the
                      clearance directly to {toClub?.name}.
                    </div>
                  </div>
                  <Btn
                    tone="teal"
                    icon={Icon.Arrow}
                    onClick={() =>
                      setConfirm({
                        title: `Override and approve clearance?`,
                        body: `This will issue ${player?.firstNames} ${player?.surname}'s clearance to ${toClub?.name} on the Lions Union's authority, bypassing ${fromClub?.name}. Both clubs will be notified.`,
                        onYes: () => {
                          onAdminOverride(req.id);
                          setConfirm(null);
                          toast?.(
                            `${player?.firstNames} ${player?.surname} cleared to ${toClub?.short || toClub?.name} · Lions override`
                          );
                        },
                      })
                    }
                  >
                    Override &amp; approve
                  </Btn>
                </div>
              )}

              {/* Resolved badge */}
              {req.status !== 'pending' && (
                <div className="clr-resolved-bar">
                  <Pill tone="teal" dot>
                    {req.status === 'admin-override' ? 'Lions override' : 'Cleared by source club'}
                  </Pill>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--muted)',
                      fontFamily: "'Montserrat',sans-serif",
                    }}
                  >
                    {new Date(req.clubApprovedAt || req.adminOverrideAt).toLocaleDateString(
                      'en-GB',
                      {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      }
                    )}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Shared confirm modal — portaled, like fixtures */}
      {confirm &&
        ReactDOM.createPortal(
          <div
            className="fix-confirm"
            onClick={(e) => e.target === e.currentTarget && setConfirm(null)}
          >
            <div className="fix-confirm-box">
              <div className="fix-confirm-icon go">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 12l5 5L20 6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="fix-confirm-title">{confirm.title}</div>
              <div className="fix-confirm-body">{confirm.body}</div>
              <div className="fix-confirm-actions">
                <Btn tone="outline" onClick={() => setConfirm(null)}>
                  Cancel
                </Btn>
                <Btn tone="teal" icon={Icon.Arrow} onClick={confirm.onYes}>
                  Yes, override
                </Btn>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

/* ─── AdminFacilities · cohort satellite view of every ground ───
   Two modes:
     "table"     — dense sortable table (default)
     "satellite" — Groundskeeper-style tile grid + compare panel
   Data source: FACILITIES from data.jsx (one entry per club ground). */

function toneForScore(score) {
  if (score >= 75) return 'teal';
  if (score >= 60) return 'gold';
  if (score >= 45) return 'gold';
  return 'coral';
}
function trendGlyph(t) {
  if (t > 0.4) return '▲';
  if (t < -0.4) return '▼';
  return '▬';
}
function trendClass(t) {
  if (t > 0.4) return 'up';
  if (t < -0.4) return 'down';
  return 'flat';
}

/* Small SVG bar sparkline for VINIS score history */
function VinisSpark({ series }) {
  const w = 96,
    h = 26;
  const max = 100,
    min = 20;
  const step = w / (series.length - 1);
  const pts = series.map((p, i) => {
    const x = i * step;
    const y = h - ((p.score - min) / (max - min)) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const last = series[series.length - 1].score;
  const stroke = last >= 60 ? 'var(--green)' : last >= 45 ? '#B79420' : '#C33';
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={w} cy={h - ((last - min) / (max - min)) * h} r="2.6" fill={stroke} />
    </svg>
  );
}

/* Compliance band → pill tone */
function compTone(band) {
  return band === 'Compliant'
    ? 'teal'
    : band === 'Partial'
      ? 'gold'
      : band === 'At risk'
        ? 'gold'
        : 'coral';
}

function AdminFacilities({ jobs: jobsProp, setJobs: setJobsProp, clubs: clubsProp, toast }) {
  const [mode, setMode] = useState('table'); // "table" | "satellite"
  const [sort, setSort] = useState({ k: 'compliance', dir: 'desc' });
  const [scoreMin, setScoreMin] = useState(0);
  const [trendFilter, setTrendFilter] = useState('all'); // all | up | down
  const [typeFilter, setTypeFilter] = useState(null);
  const [selected, setSelected] = useState([]); // ground clubIds pinned for compare
  const [detail, setDetail] = useState(null); // clubId whose satellite floating card is showing
  const [openGround, setOpenGround] = useState(null); // clubId of full drilldown
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [jobCardType, setJobCardType] = useState(null); // pre-select a type when opened from an asset
  const [jobCardPrefill, setJobCardPrefill] = useState(null); // when opened from a club report
  // Jobs are hoisted to the shell so club-side reports sync in. Fall back to
  // local state if the shell hasn't supplied them (backwards compat).
  const [localJobs, setLocalJobs] = useState(FACILITY_JOBS);
  const jobs = jobsProp || localJobs;
  const setJobs = setJobsProp || setLocalJobs;
  // Editable asset assessments live at the parent so edits persist across tab switches.
  const [assessments, setAssessments] = useState(FACILITY_ASSETS);
  const [assessing, setAssessing] = useState(null); // {clubId, key} — which asset section is being edited
  // Custom assets added by the admin — keyed by clubId → array of asset objects.
  const [customAssets, setCustomAssets] = useState({});
  const [addingAsset, setAddingAsset] = useState(null); // clubId — when non-null, Add-asset modal is open
  // Capex plan lives here so admins can add / discard items.
  const [capex, setCapex] = useState(FACILITY_CAPEX);
  const [addingCapex, setAddingCapex] = useState(null); // clubId — Add capex modal open
  // Editable job-type recipes. Admin can tweak the master checklist per type.
  const [jobTypes, setJobTypes] = useState(JOB_TYPES);
  // Vendors for the "External vendor" option on Create job card.
  const [vendors] = useState(VENDORS);

  function addJob(job) {
    setJobs((prev) => [...prev, job]);
    setShowCreateJob(false);
    setJobCardType(null);
    toast?.(`Job card dispatched · ${job.assigneeName}`);
  }

  function openCreateJobForType(t) {
    setJobCardType(t);
    setShowCreateJob(true);
  }
  function addCustomAsset(clubId, asset) {
    setCustomAssets((prev) => ({
      ...prev,
      [clubId]: [...(prev[clubId] || []), { ...asset, id: 'ca-' + Date.now() }],
    }));
    setAddingAsset(null);
    toast?.(`Added to ${FACILITIES.find((f) => f.clubId === clubId)?.venue} · ${asset.category}`);
  }
  function discardCustomAsset(clubId, assetId) {
    setCustomAssets((prev) => ({
      ...prev,
      [clubId]: (prev[clubId] || []).filter((a) => a.id !== assetId),
    }));
    toast?.('Asset removed from inventory');
  }
  function addCapex(clubId, item) {
    setCapex((prev) => ({
      ...prev,
      [clubId]: [...(prev[clubId] || []), { ...item, id: 'cap-' + Date.now() }],
    }));
    setAddingCapex(null);
    toast?.(`Capex item added · R ${item.cost?.toLocaleString?.() || item.cost}`);
  }
  function discardCapex(clubId, itemId) {
    setCapex((prev) => ({
      ...prev,
      [clubId]: (prev[clubId] || []).filter((c) => c.id !== itemId),
    }));
    toast?.('Capex item removed');
  }
  // Job type template editor — writes back to jobTypes state, reset restores default.
  function updateJobType(key, next) {
    setJobTypes((prev) => prev.map((t) => (t.key === key ? { ...t, ...next } : t)));
    toast?.('Job card template updated');
  }
  function resetJobType(key) {
    const original = JOB_TYPES.find((t) => t.key === key);
    if (!original) return;
    setJobTypes((prev) => prev.map((t) => (t.key === key ? original : t)));
    toast?.('Template reset to default');
  }
  function saveAssessment(clubId, key, next) {
    if (key?.startsWith('custom.')) {
      // Update the specific custom asset record.
      const id = key.slice(7);
      setCustomAssets((prev) => ({
        ...prev,
        [clubId]: (prev[clubId] || []).map((c) => (c.id === id ? { ...c, ...next } : c)),
      }));
    } else {
      setAssessments((prev) => {
        const cur = prev[clubId];
        // key is a dot-path: e.g. "pitch" or "nets.outdoor"
        const parts = key.split('.');
        const parent = { ...cur };
        let ref = parent;
        for (let i = 0; i < parts.length - 1; i++) {
          ref[parts[i]] = { ...ref[parts[i]] };
          ref = ref[parts[i]];
        }
        ref[parts[parts.length - 1]] = { ...ref[parts[parts.length - 1]], ...next };
        return { ...prev, [clubId]: parent };
      });
    }
    setAssessing(null);
    toast?.('Assessment saved · ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
  }
  function toggleChecklistItem(jobId, idx) {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              checklist: j.checklist.map((c, i) => (i === idx ? { ...c, done: !c.done } : c)),
            }
          : j
      )
    );
  }
  function markJobStatus(jobId, status) {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status } : j)));
  }

  // Full-page drilldown takes over the pane
  if (openGround) {
    const facility = FACILITIES.find((f) => f.clubId === openGround);
    if (!facility) {
      setOpenGround(null);
      return null;
    }
    const facilityAssets = assessments[facility.clubId] || FACILITY_ASSETS[facility.clubId];
    const facilityCustomAssets = customAssets[facility.clubId] || [];
    const facilityCapex = capex[facility.clubId] || [];
    return (
      <>
        <AdminFacilityDetail
          facility={facility}
          assets={facilityAssets}
          customAssets={facilityCustomAssets}
          capex={facilityCapex}
          jobs={jobs.filter((j) => j.facilityId === facility.clubId)}
          onBack={() => setOpenGround(null)}
          onOpenCreateJob={openCreateJobForType}
          onToggleChecklistItem={toggleChecklistItem}
          onMarkJobStatus={markJobStatus}
          onOpenAssess={(key) => setAssessing({ clubId: facility.clubId, key })}
          onOpenAddAsset={() => setAddingAsset(facility.clubId)}
          onDiscardAsset={(assetId) => discardCustomAsset(facility.clubId, assetId)}
          onOpenAddCapex={() => setAddingCapex(facility.clubId)}
          onDiscardCapex={(itemId) => discardCapex(facility.clubId, itemId)}
          onGotoSatellite={() => {
            setSelected((s) => (s.includes(facility.clubId) ? s : [...s, facility.clubId]));
            setMode('satellite');
            setDetail(facility.clubId);
            setOpenGround(null);
          }}
          toast={toast}
        />
        {showCreateJob &&
          ReactDOM.createPortal(
            <CreateJobCard
              facility={facility}
              initialType={jobCardType}
              jobTypes={jobTypes}
              vendors={vendors}
              onUpdateJobType={updateJobType}
              onResetJobType={resetJobType}
              onSubmit={addJob}
              onCancel={() => {
                setShowCreateJob(false);
                setJobCardType(null);
              }}
            />,
            document.body
          )}
        {assessing &&
          ReactDOM.createPortal(
            <AssessmentEditor
              facility={facility}
              assetKey={assessing.key}
              assets={facilityAssets}
              customAssets={facilityCustomAssets}
              onSave={(next) => saveAssessment(facility.clubId, assessing.key, next)}
              onCancel={() => setAssessing(null)}
            />,
            document.body
          )}
        {addingAsset === facility.clubId &&
          ReactDOM.createPortal(
            <AddAssetModal
              facility={facility}
              onSubmit={(asset) => addCustomAsset(facility.clubId, asset)}
              onCancel={() => setAddingAsset(null)}
            />,
            document.body
          )}
        {addingCapex === facility.clubId &&
          ReactDOM.createPortal(
            <AddCapexModal
              facility={facility}
              onSubmit={(item) => addCapex(facility.clubId, item)}
              onCancel={() => setAddingCapex(null)}
            />,
            document.body
          )}
      </>
    );
  }


  const filtered = FACILITIES.filter(
    (f) =>
      f.score >= scoreMin &&
      (trendFilter === 'all' ||
        (trendFilter === 'up' && f.trendPerYear > 0) ||
        (trendFilter === 'down' && f.trendPerYear < 0)) &&
      (!typeFilter || f.type === typeFilter)
  );

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sort.k],
      bv = b[sort.k];
    if (typeof av === 'string') return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    return sort.dir === 'asc' ? av - bv : bv - av;
  });

  const clickSort = (k) => setSort((s) => ({ k, dir: s.k === k && s.dir === 'desc' ? 'asc' : 'desc' }));
  const sortArrow = (k) => (sort.k !== k ? '' : sort.dir === 'desc' ? ' ▼' : ' ▲');

  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 4 ? prev : [...prev, id]
    );

  // Aggregate KPIs
  const avgCompliance = Math.round(FACILITIES.reduce((s, f) => s + f.compliance, 0) / FACILITIES.length);
  const avgHealth = Math.round(FACILITIES.reduce((s, f) => s + f.score, 0) / FACILITIES.length);
  const critical = FACILITIES.filter((f) => f.complianceBand === 'Non-compliant' || f.score < 40).length;
  const closestKm = Math.round(Math.min(...FACILITIES.map((f) => f.distanceKm)));

  return (
    <div>
      <div className="page-head">
        <div className="ph-left">
          <div className="ph-crumb">Lions · Admin Console / Facilities</div>
          <h1 className="ph-title">
            Facilities &amp; <em>Field Intelligence</em>
          </h1>
          <p className="ph-desc">
            Cohort-wide view of every affiliated ground — compliance status, VINIS satellite-derived turf
            health, and travel distance from Wanderers Stadium. Click any ground to compare in the satellite
            view.
          </p>
        </div>
        <div className="ph-actions">
          <Btn tone="outline" size="sm" icon={Icon.Download}>
            Export
          </Btn>
          {/* Table ↔ Satellite toggle — same visual language as our role-switch */}
          <div className="fac-mode-switch" role="tablist">
            <button
              role="tab"
              className={`fac-mode-btn ${mode === 'table' ? 'active' : ''}`}
              onClick={() => setMode('table')}
            >
              <svg viewBox="0 0 16 16" fill="none">
                <rect x="2" y="3" width="12" height="10" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
                <path d="M2 6.5h12M2 9.5h12M5.5 6.5v6.5" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              Table
            </button>
            <button
              role="tab"
              className={`fac-mode-btn ${mode === 'satellite' ? 'active' : ''}`}
              onClick={() => setMode('satellite')}
            >
              <svg viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
                <path d="M2 8h12M8 2c2.5 3 2.5 9 0 12M8 2c-2.5 3-2.5 9 0 12" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              Satellite
            </button>
          </div>
        </div>
      </div>

      {/* KPI strip — cohort-level facilities snapshot */}
      <div className="players-stats">
        <div className="players-stat">
          <div className="players-stat-l">Grounds</div>
          <div className="players-stat-n">{FACILITIES.length}</div>
        </div>
        <div className="players-stat">
          <div className="players-stat-l">Avg compliance</div>
          <div
            className="players-stat-n"
            style={{ color: avgCompliance >= 75 ? 'var(--green)' : 'var(--ink)' }}
          >
            {avgCompliance}
          </div>
        </div>
        <div className="players-stat">
          <div className="players-stat-l">Avg VINIS health</div>
          <div
            className="players-stat-n"
            style={{ color: avgHealth >= 60 ? 'var(--green)' : 'var(--gold)' }}
          >
            {avgHealth}
          </div>
        </div>
        <div className="players-stat">
          <div className="players-stat-l">Critical</div>
          <div className="players-stat-n" style={{ color: critical ? 'var(--coral)' : 'var(--ink)' }}>
            {critical}
          </div>
        </div>
        <div className="players-stat">
          <div className="players-stat-l">Club reports (open)</div>
          <div
            className="players-stat-n"
            style={{ color: jobs.filter((j) => j.reportedByClub && j.status !== 'done').length ? 'var(--coral)' : 'var(--ink)' }}
          >
            {jobs.filter((j) => j.reportedByClub && j.status !== 'done').length}
          </div>
        </div>
      </div>

      {/* Club Reports Inbox — the mirror of the club-side Facility Reporting flow.
         Everything a chair logs on their facility page lands here as a draft job
         card, waiting for the admin to dispatch, mark in-progress, or resolve. */}
      <ClubReportsInbox
        jobs={jobs}
        clubs={clubsProp}
        onOpenGround={setOpenGround}
        onOpenCreateJob={(facility, job) => {
          setOpenGround(facility.clubId);
          setJobCardPrefill(job);
          setJobCardType('reactive');
          setShowCreateJob(true);
        }}
        onMarkStatus={(jobId, status) => {
          setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status } : j)));
          toast?.(`Report ${status === 'in-progress' ? 'started' : status}`);
        }}
      />

      {mode === 'table' ? (
        <FacilitiesTable
          rows={sorted}
          onSelect={toggleSelect}
          onRowOpen={setOpenGround}
          selected={selected}
          clickSort={clickSort}
          sortArrow={sortArrow}
        />
      ) : (
        <FacilitiesSatellite
          filtered={filtered}
          selected={selected}
          setSelected={setSelected}
          toggleSelect={toggleSelect}
          detail={detail}
          setDetail={setDetail}
          scoreMin={scoreMin}
          setScoreMin={setScoreMin}
          trendFilter={trendFilter}
          setTrendFilter={setTrendFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
        />
      )}

      {/* Selection strip — Groundskeeper-style: chips at the bottom */}
      {selected.length > 0 && (
        <div className="fac-selection-strip">
          <span className="fac-selection-count">
            {selected.length} of 4 selected
          </span>
          <div className="fac-selection-chips">
            {selected.map((id) => {
              const f = FACILITIES.find((x) => x.clubId === id);
              return (
                <div key={id} className="fac-chip">
                  <span>{f?.venue}</span>
                  <button onClick={() => toggleSelect(id)} title="Remove">
                    <Icon.X />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="fac-selection-actions">
            <Btn tone="outline" size="sm" onClick={() => setSelected([])}>
              Clear
            </Btn>
            {mode === 'table' && (
              <Btn tone="teal" size="sm" icon={Icon.Arrow} onClick={() => setMode('satellite')}>
                Open Compare
              </Btn>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Table view ─── */
function FacilitiesTable({ rows, onSelect, onRowOpen, selected, clickSort, sortArrow }) {
  return (
    <div className="tbl-w" style={{ marginTop: 14 }}>
      <table className="tbl">
        <thead>
          <tr>
            <th style={{ width: 42 }}></th>
            <th onClick={() => clickSort('venue')} style={{ cursor: 'pointer' }}>
              Ground{sortArrow('venue')}
            </th>
            <th>Home club</th>
            <th onClick={() => clickSort('compliance')} style={{ cursor: 'pointer' }}>
              Compliance{sortArrow('compliance')}
            </th>
            <th onClick={() => clickSort('score')} style={{ cursor: 'pointer', width: 220 }}>
              VINIS field health{sortArrow('score')}
            </th>
            <th
              onClick={() => clickSort('distanceKm')}
              style={{ cursor: 'pointer', textAlign: 'right' }}
            >
              Distance from Wanderers{sortArrow('distanceKm')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((f) => {
            const isSel = selected.includes(f.clubId);
            return (
              <tr
                key={f.clubId}
                className={`clickable ${isSel ? 'row-selected' : ''}`}
                onClick={() => onRowOpen(f.clubId)}
              >
                <td onClick={(e) => e.stopPropagation()}>
                  <label className="fac-check">
                    <input
                      type="checkbox"
                      checked={isSel}
                      onChange={() => onSelect(f.clubId)}
                    />
                  </label>
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
                    {f.venue}
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: 'var(--muted)',
                      fontFamily: "'Montserrat',sans-serif",
                    }}
                  >
                    {f.suburb} · {f.type}
                  </div>
                </td>
                <td>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: 'var(--ink)',
                      fontFamily: "'Montserrat',sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    {f.clubName}
                  </div>
                </td>
                <td>
                  <div className="fac-compliance-cell">
                    <div className="fac-compliance-num">{f.compliance}</div>
                    <Pill tone={compTone(f.complianceBand)} dot>
                      {f.complianceBand}
                    </Pill>
                  </div>
                </td>
                <td>
                  <div className="fac-vinis-cell">
                    <div className="fac-vinis-left">
                      <div className={`fac-vinis-score ${trendClass(f.trendPerYear)}`}>
                        {f.score.toFixed(1)}
                        <span className="fac-vinis-trend">
                          {trendGlyph(f.trendPerYear)}{' '}
                          {Math.abs(f.trendPerYear).toFixed(2)}/yr
                        </span>
                      </div>
                      <div className="fac-vinis-word">{f.condition}</div>
                    </div>
                    <VinisSpark series={f.years5} />
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontFamily: "'Montserrat',sans-serif",
                      fontWeight: 700,
                      fontSize: 13,
                      color: 'var(--ink)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {Math.round(f.distanceKm).toLocaleString()} km
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: 'var(--muted)',
                      fontFamily: "'Montserrat',sans-serif",
                    }}
                  >
                    {(f.distanceKm / 100).toFixed(1)}h drive
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Satellite view — Groundskeeper-style ─── */
function FacilitiesSatellite({
  filtered,
  selected,
  toggleSelect,
  detail,
  setDetail,
  scoreMin,
  setScoreMin,
  trendFilter,
  setTrendFilter,
  typeFilter,
  setTypeFilter,
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // Build the Leaflet map (satellite tiles via Esri World Imagery, free/public).
  useEffect(() => {
    if (!mapRef.current || mapInstance.current || !L) return;
    const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false }).setView(
      [-29.85, 30.9],
      10
    );
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    ).addTo(map);
    // Faint labels overlay so we can still read place names on satellite
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, opacity: 0.85 }
    ).addTo(map);
    mapInstance.current = map;
  }, []);

  // (Re)draw markers whenever the filtered set changes
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !L) return;
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];
    const bounds = [];
    filtered.forEach((f) => {
      const tone =
        f.score >= 60 ? '#1FAA5C' : f.score >= 45 ? '#C8A84B' : '#B44';
      const icon = L.divIcon({
        className: 'fac-marker',
        html: `<div class="fac-marker-dot" style="background:${tone};"><span>${Math.round(f.score)}</span></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      const m = L.marker([f.lat, f.lon], { icon })
        .addTo(map)
        .on('click', () => setDetail(f.clubId));
      markersRef.current.push(m);
      bounds.push([f.lat, f.lon]);
    });
    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [filtered, setDetail]);

  const detailFacility = detail ? FACILITIES.find((f) => f.clubId === detail) : null;
  const compareRows = selected.map((id) => FACILITIES.find((f) => f.clubId === id)).filter(Boolean);

  const types = [...new Set(FACILITIES.map((f) => f.type))];

  return (
    <div className="fac-sat-layout">
      {/* Left filter rail — mirrors Groundskeeper */}
      <aside className="fac-sat-filters">
        <div className="fac-filter-section">
          <div className="fac-filter-label">Type</div>
          <div className="fac-filter-chips">
            {types.map((t) => (
              <button
                key={t}
                className={`fac-filter-chip ${typeFilter === t ? 'active' : ''}`}
                onClick={() => setTypeFilter(typeFilter === t ? null : t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="fac-filter-section">
          <div className="fac-filter-label">
            Score <span className="fac-filter-value">{scoreMin} +</span>
          </div>
          <input
            className="fac-range"
            type="range"
            min="0"
            max="100"
            value={scoreMin}
            onChange={(e) => setScoreMin(parseInt(e.target.value, 10))}
          />
        </div>

        <div className="fac-filter-section">
          <div className="fac-filter-label">Trend</div>
          <div className="fac-filter-chips">
            {[
              { k: 'all', l: 'Any' },
              { k: 'up', l: '▲ Improving' },
              { k: 'down', l: '▼ Declining' },
            ].map((t) => (
              <button
                key={t.k}
                className={`fac-filter-chip ${trendFilter === t.k ? 'active' : ''}`}
                onClick={() => setTrendFilter(t.k)}
              >
                {t.l}
              </button>
            ))}
          </div>
        </div>

        <div className="fac-filter-section">
          <div className="fac-filter-label">Context</div>
          <div className="fac-filter-chips">
            <button className="fac-filter-chip" disabled>Wanderers ≤ 500 km</button>
            <button className="fac-filter-chip" disabled>Built-up</button>
          </div>
          <div className="fac-filter-hint">
            Wanderers HQ · {LIONS_HQ.city} · used as travel origin
          </div>
        </div>

        <div className="fac-filter-count">
          {filtered.length} of {FACILITIES.length} grounds
        </div>
      </aside>

      {/* Main pane — satellite map + detail card + compare panel */}
      <section className="fac-sat-main">
        <div className="fac-map" ref={mapRef} />

        {/* Sliding detail card when a marker is clicked */}
        {detailFacility && (
          <div className="fac-detail">
            <div className="fac-detail-head">
              <div>
                <div className="fac-detail-eyebrow">{detailFacility.type}</div>
                <div className="fac-detail-title">{detailFacility.venue}</div>
                <div className="fac-detail-sub">
                  {detailFacility.clubName} · {detailFacility.suburb}
                </div>
              </div>
              <button className="fac-detail-close" onClick={() => setDetail(null)}>
                <Icon.X />
              </button>
            </div>
            <div className="fac-detail-body">
              <div className="fac-detail-hero">
                <div className={`fac-detail-score ${trendClass(detailFacility.trendPerYear)}`}>
                  {detailFacility.score.toFixed(1)}
                </div>
                <div className="fac-detail-condition">{detailFacility.condition}</div>
                <div className="fac-detail-meta">
                  Observed {new Date(detailFacility.lastObserved).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} ·{' '}
                  {detailFacility.daysAgo}d ago
                </div>
              </div>
              <div className="fac-detail-grid">
                <div>
                  <div className="fac-detail-l">5-y mean</div>
                  <div className="fac-detail-v">{detailFacility.mean5y.toFixed(2)}</div>
                </div>
                <div>
                  <div className="fac-detail-l">Trend</div>
                  <div className={`fac-detail-v ${trendClass(detailFacility.trendPerYear)}`}>
                    {trendGlyph(detailFacility.trendPerYear)} {Math.abs(detailFacility.trendPerYear).toFixed(2)}/yr
                  </div>
                </div>
                <div>
                  <div className="fac-detail-l">Area</div>
                  <div className="fac-detail-v">{detailFacility.areaHa.toFixed(2)} ha</div>
                </div>
                <div>
                  <div className="fac-detail-l">Compliance</div>
                  <div className="fac-detail-v">{detailFacility.compliance}</div>
                </div>
              </div>
              <Btn
                tone={selected.includes(detailFacility.clubId) ? 'outline' : 'teal'}
                size="sm"
                icon={Icon.Check}
                onClick={() => toggleSelect(detailFacility.clubId)}
                style={{ width: '100%', justifyContent: 'center', marginTop: 14 }}
              >
                {selected.includes(detailFacility.clubId) ? 'Remove from compare' : 'Add to compare'}
              </Btn>
            </div>
          </div>
        )}

        {/* Compare panel — shown below the map when >= 2 selected */}
        {compareRows.length >= 2 && (
          <div className="fac-compare">
            <div className="fac-compare-head">
              <div>
                <div className="fac-detail-eyebrow">Compare</div>
                <h2 className="fac-compare-title">Shortlisted grounds</h2>
              </div>
              <span className="fac-compare-count">{compareRows.length} of 4 selected</span>
            </div>

            <div className="fac-compare-grid" style={{ gridTemplateColumns: `repeat(${compareRows.length}, 1fr)` }}>
              {compareRows.map((f) => (
                <div key={f.clubId} className="fac-compare-card">
                  <div className="fac-detail-eyebrow">{f.type}</div>
                  <h3 className="fac-compare-name">{f.venue}</h3>
                  <div className={`fac-compare-score ${trendClass(f.trendPerYear)}`}>{f.score.toFixed(1)}</div>
                  <div className="fac-compare-condition">{f.condition}</div>
                  <div className="fac-detail-grid" style={{ marginTop: 12 }}>
                    <div>
                      <div className="fac-detail-l">5-y mean</div>
                      <div className="fac-detail-v">{f.mean5y.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="fac-detail-l">Trend</div>
                      <div className={`fac-detail-v ${trendClass(f.trendPerYear)}`}>
                        {trendGlyph(f.trendPerYear)} {Math.abs(f.trendPerYear).toFixed(2)}/yr
                      </div>
                    </div>
                    <div>
                      <div className="fac-detail-l">Area</div>
                      <div className="fac-detail-v">{f.areaHa.toFixed(2)} ha</div>
                    </div>
                    <div>
                      <div className="fac-detail-l">Compliance</div>
                      <div className="fac-detail-v">{f.compliance}</div>
                    </div>
                  </div>
                  <button
                    className="fac-compare-remove"
                    onClick={() => toggleSelect(f.clubId)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* "Where they sit in the city" — same section as Groundskeeper */}
            <div className="fac-compare-section">
              <h3 className="fac-compare-sub">Where they sit in the region</h3>
              <div className="fac-city-sub">
                Distances from Wanderers, nearest hospital, nearest major road, and built-up character.
              </div>
              <div className="tbl-w" style={{ marginTop: 8 }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Ground</th>
                      <th style={{ textAlign: 'right' }}>Wanderers</th>
                      <th style={{ textAlign: 'right' }}>Hospital</th>
                      <th style={{ textAlign: 'right' }}>Mall</th>
                      <th style={{ textAlign: 'right' }}>Major road</th>
                      <th>Built-up</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareRows.map((f) => (
                      <tr key={f.clubId}>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 12.5 }}>{f.venue}</div>
                          <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>{f.suburb}</div>
                        </td>
                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                          {Math.round(f.distanceKm).toLocaleString()} km
                        </td>
                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                          {f.nearHospitalKm} km
                        </td>
                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                          {f.nearMallKm} km
                        </td>
                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                          {f.nearMajorRoadKm} km
                        </td>
                        <td>{f.builtUp ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

/* ─── AdminFacilityDetail · full-page drilldown for one ground ───
   Left: Maintenance & Jobs / Load & Wear / Team & Ownership tabs.
   Right: satellite thumbnail + VINIS snapshot (sticky). */

function AdminFacilityDetail({
  facility,
  assets,
  customAssets,
  capex,
  jobs,
  onBack,
  onOpenCreateJob,
  onToggleChecklistItem,
  onMarkJobStatus,
  onOpenAssess,
  onOpenAddAsset,
  onDiscardAsset,
  onOpenAddCapex,
  onDiscardCapex,
  onGotoSatellite,
  toast,
}) {
  const [tab, setTab] = useState('maintenance'); // maintenance | load | team
  const load = FACILITY_LOAD[facility.clubId];
  const ownership = FACILITY_OWNERSHIP[facility.clubId];
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const openJobs = jobs.filter((j) => j.status !== 'done');
  const doneJobs = jobs.filter((j) => j.status === 'done');
  const highPriority = openJobs.filter((j) => j.priority === 'high').length;

  // Sticky satellite thumbnail — Esri World Imagery, no controls, zoomed tight.
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current, {
      zoomControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      attributionControl: false,
    }).setView([facility.lat, facility.lon], 16);
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    ).addTo(map);
    const icon = L.divIcon({
      className: 'fac-marker',
      html: `<div class="fac-marker-dot" style="background:var(--green);"><span>${Math.round(
        facility.score
      )}</span></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
    L.marker([facility.lat, facility.lon], { icon }).addTo(map);
    mapInstance.current = map;
  }, [facility.lat, facility.lon, facility.score]);

  return (
    <div>
      {/* Header */}
      <div className="page-head">
        <div className="ph-left">
          <div className="ph-crumb">
            <button className="fac-back" onClick={onBack}>
              ← Facilities
            </button>{' '}
            / {facility.venue}
          </div>
          <h1 className="ph-title">
            {facility.venue}
            <span className="fac-detail-eyebrow" style={{ marginLeft: 12, display: 'inline' }}>
              {facility.type}
            </span>
          </h1>
          <p className="ph-desc">
            <strong>{facility.clubName}</strong> · {facility.suburb} · {ownership.ownerLabel} ·{' '}
            {Math.round(facility.distanceKm).toLocaleString()} km from Wanderers
          </p>
        </div>
        <div className="ph-actions">
          <Btn tone="outline" size="sm" icon={Icon.Download}>
            Export report
          </Btn>
          <Btn tone="outline" size="sm" onClick={onGotoSatellite}>
            View in satellite mode
          </Btn>
          <Btn tone="teal" size="sm" icon={Icon.Plus} onClick={() => onOpenCreateJob?.()}>
            Create job card
          </Btn>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="fac-detail-layout">
        {/* LEFT — the workflow surface */}
        <section className="fac-detail-left">
          <div className="fac-tabs" role="tablist">
            {[
              {
                k: 'maintenance',
                l: 'Job cards',
                n: openJobs.length,
                warn: highPriority,
              },
              { k: 'assets', l: 'Asset assessment', n: null },
              { k: 'investment', l: 'Facility costing', n: null },
              { k: 'load', l: 'Load & wear', n: load.fixturesPlayed },
              { k: 'team', l: 'Team & ownership', n: null },
            ].map((t) => (
              <button
                key={t.k}
                role="tab"
                className={`fac-tab ${tab === t.k ? 'active' : ''}`}
                onClick={() => setTab(t.k)}
              >
                <span>{t.l}</span>
                {t.n != null && (
                  <span className={`fac-tab-num ${t.warn ? 'warn' : ''}`}>{t.n}</span>
                )}
              </button>
            ))}
          </div>

          {tab === 'maintenance' && (
            <div className="fac-tab-body">
              {/* Objective banner — clarifies the primary use of this screen */}
              <div className="fac-objective">
                <div className="fac-objective-eyebrow">Primary objective</div>
                <div className="fac-objective-text">
                  Dispatch and track pitch-maintenance work at{' '}
                  <strong>{facility.venue}</strong>. Every job card lands with a specific
                  groundstaff member and a checklist so nothing gets missed.
                </div>
              </div>

              {/* Open jobs */}
              <div className="fac-section-head">
                <div>
                  <div className="fac-section-title">Open job cards · {openJobs.length}</div>
                  <div className="fac-section-sub">Dispatched but not yet completed</div>
                </div>
                <Btn tone="teal" size="sm" icon={Icon.Plus} onClick={() => onOpenCreateJob?.()}>
                  Create job card
                </Btn>
              </div>

              <div className="fac-jobs-list">
                {openJobs.length === 0 && (
                  <div className="fac-empty">All caught up — no open maintenance jobs.</div>
                )}
                {openJobs.map((j) => {
                  const doneCount = j.checklist.filter((c) => c.done).length;
                  const total = j.checklist.length;
                  const pct = total ? Math.round((doneCount / total) * 100) : 0;
                  const due = new Date(j.dueDate);
                  const today = new Date('2026-06-05');
                  const daysDue = Math.round((due - today) / 86400000);
                  const overdue = daysDue < 0;
                  return (
                    <div key={j.id} className="fac-job">
                      <div className="fac-job-head">
                        <div>
                          <div className="fac-job-eyebrow">
                            <span className={`fac-priority ${j.priority}`}>
                              {j.priority === 'high' ? '⚑ HIGH' : j.priority === 'medium' ? 'MED' : 'LOW'}
                            </span>
                            <span className="fac-job-type">{j.typeLabel}</span>
                          </div>
                          <div className="fac-job-title">{j.title}</div>
                          <div className="fac-job-meta">
                            <span>
                              {j.isVendor && <span className="fac-vendor-badge">🏢 Vendor</span>}
                              <strong>{j.assigneeName}</strong>
                            </span>
                            <span className={overdue ? 'fac-due-overdue' : ''}>
                              {overdue
                                ? `⚠ ${Math.abs(daysDue)}d overdue`
                                : `Due ${new Date(j.dueDate).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                  })} · ${daysDue}d`}
                            </span>
                          </div>
                        </div>
                        <div className="fac-job-actions">
                          {j.status === 'open' ? (
                            <button
                              className="fac-job-btn"
                              onClick={() => onMarkJobStatus(j.id, 'in-progress')}
                            >
                              Start
                            </button>
                          ) : (
                            <button
                              className="fac-job-btn primary"
                              onClick={() => onMarkJobStatus(j.id, 'done')}
                            >
                              Mark done
                            </button>
                          )}
                        </div>
                      </div>

                      {total > 0 && (
                        <>
                          <div className="fac-job-progress">
                            <div className="fac-job-progress-bar">
                              <div
                                className="fac-job-progress-fill"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <div className="fac-job-progress-txt">
                              {doneCount}/{total}
                            </div>
                          </div>
                          <ul className="fac-checklist">
                            {j.checklist.map((c, i) => (
                              <li key={i} className={c.done ? 'done' : ''}>
                                <button
                                  className={`fac-checklist-box ${c.done ? 'on' : ''}`}
                                  onClick={() => onToggleChecklistItem(j.id, i)}
                                >
                                  {c.done && <Icon.Check />}
                                </button>
                                <span>{c.text}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Recent completions */}
              {doneJobs.length > 0 && (
                <>
                  <div className="fac-section-head" style={{ marginTop: 22 }}>
                    <div>
                      <div className="fac-section-title">Recent completions</div>
                      <div className="fac-section-sub">Last 30 days</div>
                    </div>
                  </div>
                  <div className="fac-jobs-list">
                    {doneJobs.map((j) => (
                      <div key={j.id} className="fac-job done">
                        <div className="fac-job-head">
                          <div>
                            <div className="fac-job-eyebrow">
                              <span className="fac-priority done">✓ DONE</span>
                              <span className="fac-job-type">{j.typeLabel}</span>
                            </div>
                            <div className="fac-job-title">{j.title}</div>
                            <div className="fac-job-meta">
                              <span>
                                <strong>{j.assigneeName}</strong>
                              </span>
                              <span>
                                Completed {new Date(j.dueDate).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {tab === 'load' && (
            <div className="fac-tab-body">
              <div className="fac-objective">
                <div className="fac-objective-eyebrow">Objective</div>
                <div className="fac-objective-text">
                  Track how hard the ground is being worked. Load index reflects fixture density
                  and balls bowled — high numbers mean more turf renewal is due.
                </div>
              </div>

              <div className="fac-load-kpis">
                <div className="fac-load-kpi">
                  <div className="fac-load-l">Fixtures played</div>
                  <div className="fac-load-n">
                    {load.fixturesPlayed}
                    <span className="fac-load-of">/ {load.fixturesPlanned}</span>
                  </div>
                  <div className="fac-load-meta">
                    Last: {new Date(load.lastMatchDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                </div>
                <div className="fac-load-kpi">
                  <div className="fac-load-l">Total overs</div>
                  <div className="fac-load-n">{load.totalOvers.toLocaleString()}</div>
                  <div className="fac-load-meta">Bowled on this square</div>
                </div>
                <div className="fac-load-kpi">
                  <div className="fac-load-l">Total balls</div>
                  <div className="fac-load-n">{load.totalBalls.toLocaleString()}</div>
                  <div className="fac-load-meta">Point of turf contact</div>
                </div>
                <div className={`fac-load-kpi tone-${loadTone(load.loadIndex)}`}>
                  <div className="fac-load-l">Load index</div>
                  <div className="fac-load-n">{load.loadIndex}</div>
                  <div className="fac-load-meta">
                    {load.loadIndex >= 80 ? 'High wear' : load.loadIndex >= 55 ? 'Moderate' : 'Comfortable'}
                  </div>
                </div>
              </div>

              {/* Matches played on this ground */}
              <div className="fac-section-head" style={{ marginTop: 22 }}>
                <div>
                  <div className="fac-section-title">
                    Matches played on this ground · {load.matches?.length || 0}
                  </div>
                  <div className="fac-section-sub">
                    Fixture-by-fixture log of every match staged on the {facility.venue} square
                  </div>
                </div>
              </div>
              <div className="tbl-w" style={{ marginTop: 8 }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Series</th>
                      <th>Opponent</th>
                      <th>H/A</th>
                      <th>Result</th>
                      <th style={{ textAlign: 'right' }}>Score</th>
                      <th style={{ textAlign: 'right' }}>Overs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(load.matches || []).map((m) => (
                      <tr key={m.id}>
                        <td>
                          <div style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 12.5 }}>
                            {new Date(m.date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </div>
                          <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>
                            {new Date(m.date).toLocaleDateString('en-GB', { weekday: 'short' })}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: 11.5, fontFamily: "'Montserrat',sans-serif", color: 'var(--muted)' }}>
                            {m.series}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: 12.5, fontFamily: "'Montserrat',sans-serif", fontWeight: 600, color: 'var(--ink)' }}>
                            {m.opponent}
                          </div>
                        </td>
                        <td>
                          <Pill tone="teal" dot>
                            Home
                          </Pill>
                        </td>
                        <td>
                          <Pill tone={m.result === 'Won' ? 'teal' : m.result === 'Tied' ? 'gold' : 'coral'}>
                            {m.result}
                          </Pill>
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontFamily: "'Montserrat',sans-serif",
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: 12.5 }}>
                            {m.scoreFor}
                            <span style={{ color: 'var(--muted-2)', margin: '0 4px' }}>vs</span>
                            {m.scoreAgainst}
                          </div>
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontFamily: "'Montserrat',sans-serif",
                            fontVariantNumeric: 'tabular-nums',
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          {m.overs}
                        </td>
                      </tr>
                    ))}
                    {(!load.matches || load.matches.length === 0) && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>
                          No matches played on this ground yet this season.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="fac-section-head" style={{ marginTop: 22 }}>
                <div>
                  <div className="fac-section-title">Scoring events on this ground</div>
                  <div className="fac-section-sub">
                    Batting outcomes distributed across {load.totalBalls.toLocaleString()} legal deliveries
                  </div>
                </div>
              </div>

              <div className="fac-events">
                {[
                  { l: 'Dot balls', v: load.dotBalls, color: 'var(--muted-2)' },
                  { l: 'Singles', v: load.singles, color: 'var(--green)' },
                  { l: 'Twos', v: load.twos, color: '#6BAD82' },
                  { l: 'Threes', v: load.threes, color: '#3E7D5A' },
                  { l: 'Fours', v: load.fours, color: '#B79420' },
                  { l: 'Sixes', v: load.sixes, color: '#B44' },
                ].map((e) => {
                  const pct = (e.v / load.totalBalls) * 100;
                  return (
                    <div key={e.l} className="fac-event">
                      <div className="fac-event-head">
                        <span className="fac-event-l">{e.l}</span>
                        <span className="fac-event-v">
                          {e.v.toLocaleString()} <span className="fac-event-pct">{pct.toFixed(1)}%</span>
                        </span>
                      </div>
                      <div className="fac-event-bar">
                        <div
                          className="fac-event-bar-fill"
                          style={{ width: `${pct}%`, background: e.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="fac-load-note">
                Boundaries + sixes concentrated in a small area of the outfield accelerate wear on
                boundary rope pegs and long-on/long-off turf. Consider scheduling a{' '}
                <strong>top-soil</strong> job card if fours/sixes exceed 8% for consecutive rounds.
              </div>
            </div>
          )}

          {tab === 'team' && (
            <div className="fac-tab-body">
              <div className="fac-objective">
                <div className="fac-objective-eyebrow">Objective</div>
                <div className="fac-objective-text">
                  Who's responsible for this ground — ownership, groundstaff on the ground, and
                  the teams that call it home. This is the escalation path when a job card stalls.
                </div>
              </div>

              <div className="fac-section-head">
                <div>
                  <div className="fac-section-title">Ownership &amp; management</div>
                </div>
              </div>
              <div className="fac-own-card">
                <div className="fac-own-badge">
                  {ownership.ownership === 'club'
                    ? '⌂ Club-maintained'
                    : ownership.ownership === 'municipality'
                      ? '🏛 Municipality'
                      : ownership.ownership === 'university'
                        ? '🎓 University'
                        : '↔ Shared arrangement'}
                </div>
                <div className="fac-own-owner">{ownership.ownerLabel}</div>
                <div className="fac-own-meta">
                  <span>Contract renews {new Date(ownership.contractRenews).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>Annual budget · R {ownership.budgetAnnual.toLocaleString()}</span>
                </div>
              </div>

              <div className="fac-section-head" style={{ marginTop: 22 }}>
                <div>
                  <div className="fac-section-title">Groundstaff on site</div>
                  <div className="fac-section-sub">Dispatch job cards to one of these people</div>
                </div>
              </div>
              <div className="fac-staff-grid">
                {[ownership.head, ...ownership.assistants].map((s) => (
                  <div key={s.id} className={`fac-staff-card ${s.id === ownership.head.id ? 'head' : ''}`}>
                    <div className="fac-staff-avatar">
                      {s.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                    </div>
                    <div className="fac-staff-info">
                      <div className="fac-staff-name">{s.name}</div>
                      <div className="fac-staff-role">
                        {s.role} · {s.years} yrs
                      </div>
                      <div className="fac-staff-contact">{s.phone}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="fac-section-head" style={{ marginTop: 22 }}>
                <div>
                  <div className="fac-section-title">Teams using this ground</div>
                </div>
              </div>
              <div className="fac-teams-list">
                {ownership.teamsUsing.map((t) => (
                  <Pill key={t} tone="navy">
                    {t}
                  </Pill>
                ))}
              </div>
            </div>
          )}

          {tab === 'assets' && (
            <FacilityAssetsTab
              facility={facility}
              assets={assets}
              customAssets={customAssets || []}
              onCreateJob={onOpenCreateJob}
              onAssess={onOpenAssess}
              onAddAsset={onOpenAddAsset}
              onDiscardAsset={onDiscardAsset}
            />
          )}

          {tab === 'investment' && (
            <FacilityInvestmentTab
              facility={facility}
              capex={capex || []}
              onCreateJob={onOpenCreateJob}
              onAddCapex={onOpenAddCapex}
              onDiscardCapex={onDiscardCapex}
            />
          )}
        </section>

        {/* RIGHT — sticky satellite snapshot */}
        <aside className="fac-detail-right">
          <div className="fac-thumb-wrap">
            <div className="fac-thumb" ref={mapRef} />
            <button className="fac-thumb-fullscreen" onClick={onGotoSatellite}>
              ⤢ Full satellite view
            </button>
          </div>

          <div className="fac-side-card">
            <div className="fac-side-eyebrow">Groundskeeper snapshot</div>
            <div className={`fac-side-score ${facility.trendPerYear > 0 ? 'up' : facility.trendPerYear < 0 ? 'down' : ''}`}>
              {facility.score.toFixed(1)}
            </div>
            <div className="fac-side-condition">{facility.condition} turf</div>
            <div className="fac-side-obs">
              Observed{' '}
              {new Date(facility.lastObserved).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} ·{' '}
              {facility.daysAgo}d ago
            </div>

            <div className="fac-side-grid">
              <div>
                <div className="fac-detail-l">5-y mean</div>
                <div className="fac-detail-v">{facility.mean5y.toFixed(2)}</div>
              </div>
              <div>
                <div className="fac-detail-l">Trend</div>
                <div
                  className={`fac-detail-v ${facility.trendPerYear > 0 ? 'up' : facility.trendPerYear < 0 ? 'down' : ''}`}
                >
                  {facility.trendPerYear > 0 ? '▲' : facility.trendPerYear < 0 ? '▼' : '▬'}{' '}
                  {Math.abs(facility.trendPerYear).toFixed(2)}/yr
                </div>
              </div>
              <div>
                <div className="fac-detail-l">Area</div>
                <div className="fac-detail-v">{facility.areaHa.toFixed(2)} ha</div>
              </div>
              <div>
                <div className="fac-detail-l">Compliance</div>
                <div className="fac-detail-v">{facility.compliance}</div>
              </div>
            </div>
          </div>

          <div className="fac-side-card compact">
            <div className="fac-side-eyebrow">This ground · load</div>
            <div className="fac-side-load-row">
              <span>Load index</span>
              <span className={`fac-side-load-n tone-${loadTone(load.loadIndex)}`}>{load.loadIndex}</span>
            </div>
            <div className="fac-side-load-row">
              <span>Fixtures played</span>
              <span>
                {load.fixturesPlayed} of {load.fixturesPlanned}
              </span>
            </div>
            <div className="fac-side-load-row">
              <span>Open jobs</span>
              <span className={openJobs.length ? 'fac-side-load-warn' : ''}>{openJobs.length}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ─── CreateJobCard · dispatch a new maintenance job ─── */
function CreateJobCard({
  facility,
  onSubmit,
  onCancel,
  initialType,
  jobTypes: jobTypesProp,
  vendors = [],
  onUpdateJobType,
  onResetJobType,
}) {
  const ownership = FACILITY_OWNERSHIP[facility.clubId];
  const staff = [ownership.head, ...ownership.assistants];
  // Only onboarded vendors are dispatchable.
  const dispatchableVendors = vendors.filter((v) => v.status === 'onboarded');

  const activeJobTypes = jobTypesProp || JOB_TYPES;

  // Guard: only accept initialType if it matches a known job-type key.
  const safeInitialType =
    initialType && activeJobTypes.some((t) => t.key === initialType)
      ? initialType
      : activeJobTypes[0].key;
  const [type, setType] = useState(safeInitialType);
  const typeObj = activeJobTypes.find((t) => t.key === type) || activeJobTypes[0];

  // Template edit mode + working buffer.
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [templateDraft, setTemplateDraft] = useState(typeObj.checklist);

  function beginEdit() {
    setTemplateDraft(typeObj.checklist);
    setEditingTemplate(true);
  }
  function saveTemplate() {
    onUpdateJobType?.(type, { checklist: templateDraft.filter((s) => s.trim()) });
    setEditingTemplate(false);
    setChecklistExcluded([]);
  }
  function resetTemplate() {
    onResetJobType?.(type);
    const orig = JOB_TYPES.find((t) => t.key === type);
    if (orig) setTemplateDraft(orig.checklist);
    setEditingTemplate(false);
    setChecklistExcluded([]);
  }

  // Auto-suggest title when the type changes (user can edit).
  function suggestTitle(t) {
    const obj = activeJobTypes.find((x) => x.key === t);
    return `${obj?.label || ''} · ${facility.venue}`;
  }
  const [title, setTitle] = useState(suggestTitle(safeInitialType));
  const [titleTouched, setTitleTouched] = useState(false);

  const [assigneeKind, setAssigneeKind] = useState('internal'); // internal | vendor
  const [assigneeId, setAssigneeId] = useState(ownership.head.id);
  const [vendorId, setVendorId] = useState(dispatchableVendors[0]?.id || '');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date('2026-06-05');
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [notes, setNotes] = useState('');
  const [checklistCustom, setChecklistCustom] = useState([]);
  const [checklistExcluded, setChecklistExcluded] = useState([]); // preset indices to skip

  function changeType(next) {
    setType(next);
    if (!titleTouched) setTitle(suggestTitle(next));
    setChecklistExcluded([]);
    setEditingTemplate(false);
    const obj = activeJobTypes.find((t) => t.key === next);
    if (obj) setTemplateDraft(obj.checklist);
  }

  const effectiveChecklist = [
    ...typeObj.checklist.filter((_, i) => !checklistExcluded.includes(i)),
    ...checklistCustom.filter(Boolean),
  ];

  const canSubmit =
    title.trim().length > 0 &&
    dueDate &&
    (assigneeKind === 'internal' ? !!assigneeId : !!vendorId);

  function submit() {
    if (!canSubmit) return;
    const vendor = dispatchableVendors.find((v) => v.id === vendorId);
    const staffer =
      staff.find((s) => s.id === assigneeId) || GROUNDSTAFF.find((s) => s.id === assigneeId);
    const isVendor = assigneeKind === 'vendor';
    const job = {
      id: 'job-' + Date.now(),
      facilityId: facility.clubId,
      type,
      typeLabel: typeObj.label,
      title: title.trim(),
      status: 'open',
      priority,
      // Backwards-compatible fields: existing UI reads assigneeName. Under
      // the hood, isVendor + vendorId flag external dispatches.
      assigneeId: isVendor ? null : assigneeId,
      assigneeName: isVendor ? vendor?.name : staffer?.name || 'Unassigned',
      vendorId: isVendor ? vendorId : null,
      vendorContact: isVendor ? vendor?.contactPerson : null,
      isVendor,
      dueDate,
      createdAt: new Date().toISOString().slice(0, 10),
      checklist: effectiveChecklist.map((text) => ({ done: false, text })),
      notes: notes.trim(),
    };
    onSubmit(job);
  }

  return (
    <div className="fix-confirm" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="fix-confirm-box jobmodal-box">
        <div className="fac-jobmodal-head">
          <div>
            <div className="fac-detail-eyebrow">Dispatch to groundstaff</div>
            <div className="fac-jobmodal-title">Create job card · {facility.venue}</div>
          </div>
          <button className="fac-detail-close" onClick={onCancel}>
            <Icon.X />
          </button>
        </div>

        <div className="fac-jobmodal-body">
          {/* STEP 1 — pick the type of work. This drives the whole card. */}
          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Step 1 · What kind of work?</div>
            <div className="jobmodal-type-grid">
              {activeJobTypes.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={`jobmodal-type ${type === t.key ? 'on' : ''}`}
                  onClick={() => changeType(t.key)}
                  title={t.checklist.length ? `${t.checklist.length} preset steps` : 'No preset checklist'}
                >
                  <span className="jobmodal-type-icon">{t.icon}</span>
                  <span className="jobmodal-type-label">{t.label}</span>
                  {t.checklist.length > 0 && (
                    <span className="jobmodal-type-badge">{t.checklist.length} steps</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2 — prefilled steps for this type. Big, obvious, dismissable, EDITABLE. */}
          {(typeObj.checklist.length > 0 || editingTemplate) && (
            <div className="jobmodal-prefill">
              <div className="jobmodal-prefill-head">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div className="jobmodal-prefill-eyebrow">
                      ⚡ Auto-filled from <strong>{typeObj.label}</strong>
                    </div>
                    {editingTemplate ? (
                      <>
                        <div className="jobmodal-prefill-title">
                          ✏️ Editing the master recipe for {typeObj.label}
                        </div>
                        <div className="jobmodal-prefill-sub">
                          Changes here become the default for <strong>every future</strong> dispatch of this
                          job type across every ground. This is the admin recipe.
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="jobmodal-prefill-title">
                          {effectiveChecklist.filter((s) => typeObj.checklist.includes(s)).length} of{' '}
                          {typeObj.checklist.length} preset steps will land on this card
                        </div>
                        <div className="jobmodal-prefill-sub">
                          Uncheck any that don't apply, or edit the master recipe to change the default
                          for future dispatches.
                        </div>
                      </>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {editingTemplate ? (
                      <>
                        <button className="jobmodal-tmpl-btn" onClick={resetTemplate}>
                          ↺ Reset
                        </button>
                        <button className="jobmodal-tmpl-btn primary" onClick={saveTemplate}>
                          ✓ Save recipe
                        </button>
                      </>
                    ) : (
                      <button className="jobmodal-tmpl-btn" onClick={beginEdit}>
                        ✏️ Edit template
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {editingTemplate ? (
                <div className="jobmodal-prefill-list edit">
                  {templateDraft.map((step, i) => (
                    <div key={i} className="jobmodal-tmpl-row">
                      <span className="jobmodal-tmpl-num">{i + 1}</span>
                      <input
                        className="field-input"
                        value={step}
                        onChange={(e) =>
                          setTemplateDraft((prev) => prev.map((s, x) => (x === i ? e.target.value : s)))
                        }
                      />
                      <button
                        className="jobmodal-tmpl-remove"
                        onClick={() =>
                          setTemplateDraft((prev) => prev.filter((_, x) => x !== i))
                        }
                        title="Remove step"
                      >
                        <Icon.X />
                      </button>
                    </div>
                  ))}
                  <button
                    className="jobmodal-tmpl-add"
                    onClick={() => setTemplateDraft((prev) => [...prev, ''])}
                  >
                    + Add step to master recipe
                  </button>
                </div>
              ) : (
                <ul className="jobmodal-prefill-list">
                  {typeObj.checklist.map((c, i) => {
                    const on = !checklistExcluded.includes(i);
                    return (
                      <li key={i} className={on ? 'on' : 'off'}>
                        <button
                          type="button"
                          className={`jobmodal-prefill-box ${on ? 'on' : ''}`}
                          onClick={() =>
                            setChecklistExcluded((prev) =>
                              on ? [...prev, i] : prev.filter((x) => x !== i)
                            )
                          }
                        >
                          {on && <Icon.Check />}
                        </button>
                        <span>{c}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* STEP 3 — the rest of the job details. */}
          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Step 2 · Job details</div>

            <div className="fac-jobmodal-row">
              <label className="field-label">
                Job title <span className="req">*</span>{' '}
                <span className="jobmodal-title-hint">
                  auto-suggested from {typeObj.label}
                </span>
              </label>
              <input
                className="field-input"
                placeholder="e.g. Prep pitch for Sat premier fixture"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTitleTouched(true);
                }}
              />
            </div>

            {/* Who's doing the work — internal groundstaff OR external vendor */}
            <div style={{ marginTop: 12 }}>
              <label className="field-label">
                Who's doing the work? <span className="req">*</span>
              </label>
              <div className="seg">
                <button
                  type="button"
                  className={`seg-btn ${assigneeKind === 'internal' ? 'on' : ''}`}
                  onClick={() => setAssigneeKind('internal')}
                >
                  🧑‍🌾 Internal · groundstaff
                </button>
                <button
                  type="button"
                  className={`seg-btn ${assigneeKind === 'vendor' ? 'on' : ''}`}
                  onClick={() => setAssigneeKind('vendor')}
                  disabled={dispatchableVendors.length === 0}
                  title={
                    dispatchableVendors.length === 0
                      ? 'No onboarded vendors yet — head to the Vendors tab'
                      : ''
                  }
                >
                  🏢 External · vendor
                </button>
              </div>
            </div>

            <div className="field-grid-2" style={{ marginTop: 12 }}>
              <div>
                {assigneeKind === 'internal' ? (
                  <>
                    <label className="field-label">
                      Staff member <span className="req">*</span>
                    </label>
                    <select
                      className="field-select"
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                    >
                      {staff.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} · {s.role}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                    <label className="field-label">
                      Vendor <span className="req">*</span>
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 10,
                          fontWeight: 700,
                          color: 'var(--green)',
                        }}
                      >
                        · {dispatchableVendors.length} onboarded
                      </span>
                    </label>
                    <select
                      className="field-select"
                      value={vendorId}
                      onChange={(e) => setVendorId(e.target.value)}
                    >
                      {dispatchableVendors.length === 0 && (
                        <option value="">No onboarded vendors — visit Vendors tab</option>
                      )}
                      {dispatchableVendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} · {v.category}
                          {v.rating > 0 ? ` · ⭐ ${v.rating.toFixed(1)}` : ''}
                        </option>
                      ))}
                    </select>
                    {vendorId && (
                      <div className="jobmodal-vendor-hint">
                        {(() => {
                          const v = dispatchableVendors.find((x) => x.id === vendorId);
                          if (!v) return null;
                          return (
                            <>
                              📞 {v.contactPerson} · {v.phone}
                              {v.services?.length > 0 && (
                                <span style={{ color: 'var(--muted-2)' }}> · {v.services.slice(0, 2).join(', ')}</span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div>
                <label className="field-label">
                  Due date <span className="req">*</span>
                </label>
                <input
                  type="date"
                  className="field-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label className="field-label">Priority</label>
              <div className="seg">
                {['low', 'medium', 'high'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`seg-btn ${priority === p ? 'on' : ''}`}
                    onClick={() => setPriority(p)}
                  >
                    {p === 'high' ? '⚑ ' : ''}
                    {p[0].toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom checklist items — additive on top of the preset */}
            <div style={{ marginTop: 12 }}>
              <label className="field-label">Extra steps (optional)</label>
              {checklistCustom.map((c, i) => (
                <div key={i} className="fac-jobmodal-item">
                  <input
                    className="field-input"
                    placeholder="Add a step…"
                    value={c}
                    onChange={(e) =>
                      setChecklistCustom((prev) => prev.map((x, xi) => (xi === i ? e.target.value : x)))
                    }
                  />
                  <button
                    className="fac-jobmodal-remove"
                    onClick={() =>
                      setChecklistCustom((prev) => prev.filter((_, xi) => xi !== i))
                    }
                  >
                    <Icon.X />
                  </button>
                </div>
              ))}
              <button
                className="fac-jobmodal-add"
                onClick={() => setChecklistCustom((prev) => [...prev, ''])}
              >
                + Add custom step
              </button>
            </div>

            <div style={{ marginTop: 12 }}>
              <label className="field-label">Notes</label>
              <textarea
                className="field-textarea"
                placeholder="Anything the groundstaff should know before starting…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="jobmodal-footer">
          <div className="jobmodal-footer-summary">
            <strong>{effectiveChecklist.length}</strong> steps · assigned to{' '}
            <strong>{staff.find((s) => s.id === assigneeId)?.name}</strong> · due{' '}
            <strong>
              {new Date(dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </strong>
          </div>
          <div className="jobmodal-footer-actions">
            <Btn tone="outline" onClick={onCancel}>
              Cancel
            </Btn>
            <Btn tone="teal" icon={Icon.Arrow} onClick={submit} disabled={!canSubmit}>
              Dispatch job card
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Assets tab · pitch / covers / nets — sourced from CQI ─── */

// Star row for /5 condition scores
function ConditionStars({ score }) {
  const rounded = Math.round(score * 2) / 2; // 0.5 steps
  const full = Math.floor(rounded);
  const half = rounded - full === 0.5;
  return (
    <span className="fac-stars" title={`${score.toFixed(1)} / 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={`fac-star ${i < full ? 'on' : i === full && half ? 'half' : ''}`}>
          ★
        </span>
      ))}
      <span className="fac-star-n">{score.toFixed(1)}</span>
    </span>
  );
}

function CQIRef({ label }) {
  return (
    <span className="fac-cqi-ref" title="Sourced from the club's CQI submission">
      From CQI · {label}
    </span>
  );
}

function AssetCard({ title, cqiRefLabel, badge, badgeTone, lastAssessed, onAssess, children, cta }) {
  const clickable = !!onAssess;
  return (
    <div
      className={`fac-asset ${clickable ? 'clickable' : ''}`}
      onClick={clickable ? onAssess : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div className="fac-asset-head">
        <div>
          <div className="fac-asset-title">
            {title}
            {clickable && <span className="fac-asset-hint">Tap to assess</span>}
          </div>
          {cqiRefLabel && <CQIRef label={cqiRefLabel} />}
          {lastAssessed && (
            <div className="fac-asset-assessed">
              Last assessed{' '}
              {new Date(lastAssessed).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          )}
        </div>
        <div className="fac-asset-head-right">
          {badge && (
            <Pill tone={badgeTone || 'muted'} dot>
              {badge}
            </Pill>
          )}
          {clickable && (
            <button
              className="fac-asset-assess-btn"
              onClick={(e) => {
                e.stopPropagation();
                onAssess();
              }}
            >
              Assess ›
            </button>
          )}
        </div>
      </div>
      <div className="fac-asset-body" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
      {cta && (
        <div className="fac-asset-cta" onClick={(e) => e.stopPropagation()}>
          {cta}
        </div>
      )}
    </div>
  );
}

function FacilityAssetsTab({
  facility,
  assets: assetsProp,
  customAssets = [],
  onCreateJob,
  onAssess,
  onAddAsset,
  onDiscardAsset,
}) {
  const assets = assetsProp || FACILITY_ASSETS[facility.clubId];
  const pitch = assets.pitch;
  const covers = assets.covers;
  const outdoor = assets.nets.outdoor;
  const indoor = assets.nets.indoor;
  const bm = assets.nets.bowlingMachines;
  const sup = assets.support;

  // "Today" so overdue calc is stable across the prototype.
  const today = new Date('2026-07-11');
  function daysSince(iso) {
    if (!iso) return null;
    return Math.round((today - new Date(iso)) / 86400000);
  }
  function statusFor(a) {
    const d = daysSince(a?.lastAssessed);
    if (d === null) return { label: '⚠ Never assessed', tone: 'coral' };
    if (d > 30) return { label: `${d}d ago · overdue`, tone: 'coral' };
    if (d > 14) return { label: `${d}d ago`, tone: 'gold' };
    return { label: `${d}d ago`, tone: 'teal' };
  }

  // The full inventory for the dropdown selector.
  const inventory = [
    { key: 'pitch', label: 'Pitch square', status: statusFor(pitch) },
    { key: 'covers', label: covers.has ? 'Covers' : 'Covers (missing)', status: statusFor(covers) },
    { key: 'nets.outdoor', label: 'Outdoor practice nets', status: statusFor(outdoor) },
    {
      key: 'nets.indoor',
      label: indoor.count > 0 ? 'Indoor practice nets' : 'Indoor nets (missing)',
      status: statusFor(indoor),
    },
    {
      key: 'nets.bowlingMachines',
      label: bm.count > 0 ? 'Bowling machine(s)' : 'Bowling machine (missing)',
      status: statusFor(bm),
    },
    { key: 'support', label: 'Support kit (sightscreens, boundary, scoreboard)', status: statusFor(sup) },
    // Custom assets show up alongside the standard ones so the selector is complete.
    ...customAssets.map((ca) => ({
      key: `custom.${ca.id}`,
      label: `${ca.category} · ${ca.description || 'custom'}`,
      status: statusFor(ca),
      custom: true,
    })),
  ];
  const needAssessing = inventory.filter((i) => i.status.tone !== 'teal').length;

  return (
    <div className="fac-tab-body">
      <div className="fac-objective">
        <div className="fac-objective-eyebrow">Objective</div>
        <div className="fac-objective-text">
          The management team's <strong>physical inspection worksheet</strong> for{' '}
          <strong>{facility.venue}</strong>. Every section is <strong>clickable</strong> —
          tap "Assess" to record a new condition score, log issues found on site, and
          set the next inspection date. Data flows into the Job cards + Facility costing
          tabs.
        </div>
      </div>

      {/* Assessment status dashboard — 3 tiles at a glance */}
      {(() => {
        const overdue = inventory.filter((i) => i.status.tone === 'coral').length;
        const dueSoon = inventory.filter((i) => i.status.tone === 'gold').length;
        const current = inventory.filter((i) => i.status.tone === 'teal').length;
        const pct = inventory.length ? Math.round((current / inventory.length) * 100) : 0;
        return (
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
              <div className="fac-assess-tile-l">Assessment coverage</div>
              <div className="fac-assess-tile-n">
                {pct}
                <span>%</span>
              </div>
              <div className="fac-assess-tile-bar">
                <div className="fac-assess-tile-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="fac-assess-tile-meta">
                {current} of {inventory.length} assets current
              </div>
            </div>
          </div>
        );
      })()}

      {/* Top-of-tab: pick an asset to assess + add asset */}
      <div className="fac-assets-toolbar">
        <div className="fac-assets-picker">
          <label className="fac-assets-picker-l">
            Assets on this facility · {inventory.length}
            {needAssessing > 0 && (
              <span className="fac-assets-picker-warn"> · {needAssessing} need attention</span>
            )}
          </label>
          <select
            className="field-select fac-assets-picker-select"
            value=""
            onChange={(e) => e.target.value && onAssess?.(e.target.value)}
          >
            <option value="">— Assess an asset —</option>
            {inventory.map((i) => (
              <option key={i.key} value={i.key}>
                {i.status.tone === 'coral'
                  ? '⚠ '
                  : i.status.tone === 'gold'
                    ? '⏳ '
                    : '✓ '}
                {i.label} · {i.status.label}
              </option>
            ))}
          </select>
        </div>
        <Btn tone="teal" size="sm" icon={Icon.Plus} onClick={onAddAsset}>
          Add asset to facility
        </Btn>
      </div>

      {/* PITCH */}
      <div className="fac-section-head">
        <div>
          <div className="fac-section-title">Pitch square</div>
          <div className="fac-section-sub">
            Match wickets, soil profile, drainage, current condition
          </div>
        </div>
      </div>
      <AssetCard
        title={`${pitch.count} × ${pitch.type} pitch${pitch.count > 1 ? 'es' : ''}`}
        cqiRefLabel="Grass / Artificial fields"
        badge={conditionWord(pitch.condition)}
        badgeTone={conditionTone(pitch.condition)}
        lastAssessed={pitch.lastAssessed}
        onAssess={() => onAssess?.('pitch')}
        cta={
          <Btn tone="outline" size="sm" icon={Icon.Plus} onClick={() => onCreateJob?.('pitch-prep')}>
            Dispatch pitch job
          </Btn>
        }
      >
        <div className="fac-asset-grid">
          <div>
            <div className="fac-detail-l">Square size</div>
            <div className="fac-detail-v">{pitch.squareSize}</div>
          </div>
          <div>
            <div className="fac-detail-l">Wicket strips</div>
            <div className="fac-detail-v">{pitch.squareStrips}</div>
          </div>
          <div>
            <div className="fac-detail-l">Soil profile</div>
            <div className="fac-detail-v" style={{ fontSize: 13 }}>{pitch.soilProfile}</div>
          </div>
          <div>
            <div className="fac-detail-l">Drainage</div>
            <div className="fac-detail-v" style={{ fontSize: 13 }}>{pitch.drainageRating}</div>
          </div>
          <div>
            <div className="fac-detail-l">Last relaid</div>
            <div className="fac-detail-v" style={{ fontSize: 13 }}>
              {new Date(pitch.lastRelaid).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
            </div>
          </div>
          <div>
            <div className="fac-detail-l">Condition</div>
            <div className="fac-detail-v"><ConditionStars score={pitch.condition} /></div>
          </div>
        </div>
        {pitch.issues.length > 0 && (
          <div className="fac-issues">
            <div className="fac-issues-l">Known issues · {pitch.issues.length}</div>
            {pitch.issues.map((i, x) => (
              <div key={x} className={`fac-issue tone-${severityTone(i?.severity)}`}>
                {i?.icon || '⚠'}{' '}
                {typeof i === 'string' ? i : (
                  <>
                    <strong>{i.category}</strong>
                    {i.location && <span className="fac-issue-loc"> · 📍 {i.location}</span>}
                    {i.notes && <span className="fac-issue-notes"> · {i.notes}</span>}
                    {i.reportedByClub && (
                      <span className="fac-issue-reported"> · 🎽 Reported by {i.reportedByClub.chair || i.reportedByClub.clubName}</span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </AssetCard>

      {/* COVERS */}
      <div className="fac-section-head" style={{ marginTop: 22 }}>
        <div>
          <div className="fac-section-title">Covers</div>
          <div className="fac-section-sub">Rain protection for the match square</div>
        </div>
      </div>
      {covers.has ? (
        <AssetCard
          title={`${covers.count} × ${covers.type}`}
          cqiRefLabel="Square covers available (Yes)"
          badge={conditionWord(covers.condition)}
          badgeTone={conditionTone(covers.condition)}
          lastAssessed={covers.lastAssessed}
          onAssess={() => onAssess?.('covers')}
          cta={
            <Btn tone="outline" size="sm" icon={Icon.Plus} onClick={() => onCreateJob?.('boundary-rope')}>
              Dispatch covers job
            </Btn>
          }
        >
          <div className="fac-asset-grid">
            <div>
              <div className="fac-detail-l">Age</div>
              <div className="fac-detail-v">{covers.age} yrs</div>
            </div>
            <div>
              <div className="fac-detail-l">Replacement cost</div>
              <div className="fac-detail-v">R {covers.replacementCost.toLocaleString()}</div>
            </div>
            <div>
              <div className="fac-detail-l">Condition</div>
              <div className="fac-detail-v"><ConditionStars score={covers.condition} /></div>
            </div>
          </div>
          {covers.issues.length > 0 && (
            <div className="fac-issues">
              <div className="fac-issues-l">Known issues · {covers.issues.length}</div>
              {covers.issues.map((i, x) => (
                <div key={x} className={`fac-issue tone-${severityTone(i?.severity)}`}>
                {i?.icon || '⚠'}{' '}
                {typeof i === 'string' ? i : (
                  <>
                    <strong>{i.category}</strong>
                    {i.location && <span className="fac-issue-loc"> · 📍 {i.location}</span>}
                    {i.notes && <span className="fac-issue-notes"> · {i.notes}</span>}
                    {i.reportedByClub && (
                      <span className="fac-issue-reported"> · 🎽 Reported by {i.reportedByClub.chair || i.reportedByClub.clubName}</span>
                    )}
                  </>
                )}
              </div>
              ))}
            </div>
          )}
        </AssetCard>
      ) : (
        <AssetCard
          title="No covers on inventory"
          cqiRefLabel="Square covers available (No)"
          badge="Gap"
          badgeTone="coral"
          onAssess={() => onAssess?.('covers')}
          cta={
            <Btn tone="outline" size="sm">
              Add to capex plan
            </Btn>
          }
        >
          <div className="fac-asset-empty">
            The club has not declared covers in its CQI submission. Match-day rain exposes the pitch
            square directly — recommended to add a capex item for at least mobile flat covers.
          </div>
        </AssetCard>
      )}

      {/* NETS */}
      <div className="fac-section-head" style={{ marginTop: 22 }}>
        <div>
          <div className="fac-section-title">Practice nets</div>
          <div className="fac-section-sub">Outdoor, indoor, and bowling-machine inventory</div>
        </div>
      </div>
      <AssetCard
        title={`${outdoor.count} × outdoor net${outdoor.count === 1 ? '' : 's'} · ${outdoor.surface}`}
        cqiRefLabel="Grass + Artificial nets"
        badge={conditionWord(outdoor.condition)}
        badgeTone={conditionTone(outdoor.condition)}
        lastAssessed={outdoor.lastAssessed}
        onAssess={() => onAssess?.('nets.outdoor')}
        cta={
          <Btn tone="outline" size="sm" icon={Icon.Plus} onClick={() => onCreateJob?.('nets')}>
            Dispatch nets job
          </Btn>
        }
      >
        <div className="fac-asset-grid">
          <div>
            <div className="fac-detail-l">Grass nets</div>
            <div className="fac-detail-v">{outdoor.grass}</div>
          </div>
          <div>
            <div className="fac-detail-l">Artificial nets</div>
            <div className="fac-detail-v">{outdoor.artificial}</div>
          </div>
          <div>
            <div className="fac-detail-l">Last resurfaced</div>
            <div className="fac-detail-v" style={{ fontSize: 13 }}>
              {new Date(outdoor.lastResurfaced).toLocaleDateString('en-GB', {
                month: 'short',
                year: 'numeric',
              })}
            </div>
          </div>
          <div>
            <div className="fac-detail-l">Condition</div>
            <div className="fac-detail-v"><ConditionStars score={outdoor.condition} /></div>
          </div>
        </div>
        {outdoor.issues.length > 0 && (
          <div className="fac-issues">
            <div className="fac-issues-l">Known issues · {outdoor.issues.length}</div>
            {outdoor.issues.map((i, x) => (
              <div key={x} className={`fac-issue tone-${severityTone(i?.severity)}`}>
                {i?.icon || '⚠'}{' '}
                {typeof i === 'string' ? i : (
                  <>
                    <strong>{i.category}</strong>
                    {i.location && <span className="fac-issue-loc"> · 📍 {i.location}</span>}
                    {i.notes && <span className="fac-issue-notes"> · {i.notes}</span>}
                    {i.reportedByClub && (
                      <span className="fac-issue-reported"> · 🎽 Reported by {i.reportedByClub.chair || i.reportedByClub.clubName}</span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </AssetCard>

      {indoor.count > 0 ? (
        <AssetCard
          title={`${indoor.count} × indoor net${indoor.count === 1 ? '' : 's'}`}
          cqiRefLabel="Indoor nets"
          badge={conditionWord(indoor.condition)}
          badgeTone={conditionTone(indoor.condition)}
          onAssess={() => onAssess?.('nets.indoor')}
        >
          <div className="fac-asset-grid">
            <div>
              <div className="fac-detail-l">Condition</div>
              <div className="fac-detail-v"><ConditionStars score={indoor.condition} /></div>
            </div>
          </div>
        </AssetCard>
      ) : (
        <AssetCard
          title="No indoor practice facility"
          cqiRefLabel="Indoor nets (0)"
          badge="Gap"
          badgeTone="muted"
          onAssess={() => onAssess?.('nets.indoor')}
        >
          <div className="fac-asset-empty">
            No all-weather practice option. Winter drop-off in player attendance is typically 40%+ —
            consider a capex bid for at least one indoor net.
          </div>
        </AssetCard>
      )}

      {bm.count > 0 ? (
        <AssetCard
          title={`${bm.count} × bowling machine${bm.count === 1 ? '' : 's'} · ${bm.model}`}
          cqiRefLabel="Bowling machines"
          badge={bm.condition}
          badgeTone="teal"
          onAssess={() => onAssess?.('nets.bowlingMachines')}
        >
          <div className="fac-asset-grid">
            <div>
              <div className="fac-detail-l">Last service</div>
              <div className="fac-detail-v" style={{ fontSize: 13 }}>
                {new Date(bm.lastService).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
            </div>
            <div>
              <div className="fac-detail-l">Status</div>
              <div className="fac-detail-v" style={{ fontSize: 13 }}>{bm.condition}</div>
            </div>
          </div>
          {bm.issues.length > 0 && (
            <div className="fac-issues">
              <div className="fac-issues-l">Known issues</div>
              {bm.issues.map((i, x) => (
                <div key={x} className={`fac-issue tone-${severityTone(i?.severity)}`}>
                {i?.icon || '⚠'}{' '}
                {typeof i === 'string' ? i : (
                  <>
                    <strong>{i.category}</strong>
                    {i.location && <span className="fac-issue-loc"> · 📍 {i.location}</span>}
                    {i.notes && <span className="fac-issue-notes"> · {i.notes}</span>}
                    {i.reportedByClub && (
                      <span className="fac-issue-reported"> · 🎽 Reported by {i.reportedByClub.chair || i.reportedByClub.clubName}</span>
                    )}
                  </>
                )}
              </div>
              ))}
            </div>
          )}
        </AssetCard>
      ) : (
        <AssetCard
          title="No bowling machine"
          cqiRefLabel="Bowling machines (0)"
          badge="Gap"
          badgeTone="muted"
          onAssess={() => onAssess?.('nets.bowlingMachines')}
        >
          <div className="fac-asset-empty">
            No bowling machine on inventory. Coaches typically hire from a neighbouring club at
            R 400/session. Consider capex bid — payback usually 18-24 months.
          </div>
        </AssetCard>
      )}

      {/* SUPPORT KIT */}
      <div className="fac-section-head" style={{ marginTop: 22 }}>
        <div>
          <div className="fac-section-title">Support kit</div>
          <div className="fac-section-sub">Sightscreens, boundary rope, scoreboards</div>
        </div>
      </div>
      <div className="fac-support-grid">
        {[
          { label: 'Sightscreens both ends', on: sup.sightscreensBothEnds, cqi: 'sightscreens' },
          { label: 'Boundary rope in good order', on: sup.boundaryRope, cqi: 'boundary' },
          { label: 'Scoreboard operational', on: sup.scoreboard, cqi: 'scoreboard' },
        ].map((s) => (
          <div key={s.label} className={`fac-support-item ${s.on ? 'on' : 'off'}`}>
            <div className="fac-support-icon">{s.on ? '✓' : '⚠'}</div>
            <div>
              <div className="fac-support-title">{s.label}</div>
              <div className="fac-cqi-ref" style={{ marginTop: 2 }}>
                From CQI · {s.cqi}
              </div>
            </div>
            <Pill tone={s.on ? 'teal' : 'coral'} dot>
              {s.on ? 'In place' : 'Missing'}
            </Pill>
          </div>
        ))}
      </div>

      {/* Custom assets added by the admin */}
      {customAssets.length > 0 && (
        <>
          <div className="fac-section-head" style={{ marginTop: 22 }}>
            <div>
              <div className="fac-section-title">Added by the admin · {customAssets.length}</div>
              <div className="fac-section-sub">
                Items outside the standard CQI inventory — assessed and budgeted the same way
              </div>
            </div>
          </div>
          {customAssets.map((ca) => (
            <AssetCard
              key={ca.id}
              title={`${ca.quantity} × ${ca.subType || ca.category}${ca.description ? ' · ' + ca.description : ''}`}
              cqiRefLabel="Custom entry (not on CQI)"
              badge={conditionWord(ca.condition || 3)}
              badgeTone={conditionTone(ca.condition || 3)}
              lastAssessed={ca.lastAssessed}
              onAssess={() => onAssess?.(`custom.${ca.id}`)}
              cta={
                <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'space-between' }}>
                  <button
                    className="fac-discard-btn"
                    onClick={() => {
                      if (window.confirm('Remove this asset from the facility inventory?')) {
                        onDiscardAsset?.(ca.id);
                      }
                    }}
                  >
                    🗑 Discard asset
                  </button>
                  <Btn tone="outline" size="sm" icon={Icon.Plus} onClick={() => onCreateJob?.()}>
                    Dispatch job for this asset
                  </Btn>
                </div>
              }
            >
              <div className="fac-asset-grid">
                {ca.quantity != null && (
                  <div>
                    <div className="fac-detail-l">Quantity</div>
                    <div className="fac-detail-v">{ca.quantity}</div>
                  </div>
                )}
                {ca.subType && (
                  <div>
                    <div className="fac-detail-l">Sub-type</div>
                    <div className="fac-detail-v" style={{ fontSize: 13 }}>{ca.subType}</div>
                  </div>
                )}
                {ca.supplier && (
                  <div>
                    <div className="fac-detail-l">Supplier</div>
                    <div className="fac-detail-v" style={{ fontSize: 13 }}>{ca.supplier}</div>
                  </div>
                )}
                {ca.purchaseCost > 0 && (
                  <div>
                    <div className="fac-detail-l">Purchase cost</div>
                    <div className="fac-detail-v">R {ca.purchaseCost.toLocaleString()}</div>
                  </div>
                )}
                {ca.warranty && (
                  <div>
                    <div className="fac-detail-l">Warranty</div>
                    <div className="fac-detail-v" style={{ fontSize: 13 }}>{ca.warranty}</div>
                  </div>
                )}
                {ca.purchaseDate && (
                  <div>
                    <div className="fac-detail-l">Acquired</div>
                    <div className="fac-detail-v" style={{ fontSize: 13 }}>
                      {new Date(ca.purchaseDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                )}
              </div>
              {ca.notes && (
                <div className="fac-issues" style={{ borderLeftColor: 'var(--green)' }}>
                  <div className="fac-issues-l">Admin note</div>
                  <div className="fac-issue">{ca.notes}</div>
                </div>
              )}
            </AssetCard>
          ))}
        </>
      )}
    </div>
  );
}

/* ─── AddAssetModal · admin adds a new asset to the facility inventory ─── */

function AddAssetModal({ facility, onSubmit, onCancel }) {
  const [category, setCategory] = useState(ASSET_CATEGORIES[0].key);
  const [categoryOther, setCategoryOther] = useState('');
  const [subType, setSubType] = useState('');
  const [subTypeOther, setSubTypeOther] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState(4);
  const [purchaseCost, setPurchaseCost] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [supplier, setSupplier] = useState('');
  const [supplierOther, setSupplierOther] = useState('');
  const [warranty, setWarranty] = useState('');
  const [notes, setNotes] = useState('');

  const catObj = ASSET_CATEGORIES.find((c) => c.key === category) || ASSET_CATEGORIES[0];
  const subTypeOptions = FACILITY_OPTIONS.assetSubType[category] || [];
  // Effective values honour "Other" free-text overrides.
  const effectiveCategory = category === 'Other' ? categoryOther.trim() || 'Other' : category;
  const effectiveSubType = subType === 'Other' ? subTypeOther.trim() : subType;
  const effectiveSupplier = supplier?.startsWith('Other')
    ? supplierOther.trim() || supplier
    : supplier;
  const canSubmit =
    category &&
    quantity > 0 &&
    (category !== 'Other' || categoryOther.trim().length > 0);

  // Reset subType when category changes so we don't hold a stale value.
  function changeCategory(k) {
    setCategory(k);
    setSubType('');
    setSubTypeOther('');
    if (k !== 'Other') setCategoryOther('');
  }

  function submit() {
    if (!canSubmit) return;
    onSubmit({
      category: effectiveCategory,
      subType: effectiveSubType || null,
      description: description.trim(),
      quantity: Number(quantity),
      condition: Number(condition),
      purchaseCost: purchaseCost ? Number(purchaseCost) : 0,
      purchaseDate: purchaseDate || null,
      supplier: effectiveSupplier || null,
      warranty: warranty || null,
      notes: notes.trim(),
      lastAssessed: null,
      issues: [],
    });
  }

  return (
    <div className="fix-confirm" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="fix-confirm-box jobmodal-box">
        <div className="fac-jobmodal-head">
          <div>
            <div className="fac-detail-eyebrow">Facility inventory · {facility.venue}</div>
            <div className="fac-jobmodal-title">Add asset · {facility.venue}</div>
          </div>
          <button className="fac-detail-close" onClick={onCancel}>
            <Icon.X />
          </button>
        </div>

        <div className="fac-jobmodal-body">
          {/* STEP 1 — asset type tile grid */}
          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Step 1 · What kind of asset?</div>
            <div className="jobmodal-type-grid">
              {ASSET_CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className={`jobmodal-type ${category === c.key ? 'on' : ''}`}
                  onClick={() => changeCategory(c.key)}
                >
                  <span className="jobmodal-type-icon">{c.icon}</span>
                  <span className="jobmodal-type-label">{c.key}</span>
                </button>
              ))}
            </div>
            {category === 'Other' && (
              <div style={{ marginTop: 10 }}>
                <label className="field-label">
                  Specify asset type <span className="req">*</span>
                </label>
                <input
                  className="field-input"
                  placeholder="e.g. Weather station · Vehicle · Storage container"
                  value={categoryOther}
                  onChange={(e) => setCategoryOther(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* STEP 2 — details */}
          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Step 2 · Asset details</div>

            {subTypeOptions.length > 0 && (
              <div>
                <label className="field-label">Sub-type / spec</label>
                <select
                  className="field-select"
                  value={subType}
                  onChange={(e) => setSubType(e.target.value)}
                >
                  <option value="">Select a sub-type…</option>
                  {subTypeOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                  <option value="Other">Other…</option>
                </select>
                {subType === 'Other' && (
                  <input
                    className="field-input"
                    style={{ marginTop: 8 }}
                    placeholder="Specify sub-type…"
                    value={subTypeOther}
                    onChange={(e) => setSubTypeOther(e.target.value)}
                  />
                )}
              </div>
            )}

            <div className="field-grid-2" style={{ marginTop: subTypeOptions.length ? 12 : 0 }}>
              <div>
                <label className="field-label">{catObj.quantityL}</label>
                <input
                  className="field-input"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">Description / extra spec</label>
                <input
                  className="field-input"
                  placeholder="e.g. 24m wide · covers full square"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="field-grid-2" style={{ marginTop: 12 }}>
              <div>
                <label className="field-label">Supplier</label>
                <select
                  className="field-select"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                >
                  <option value="">Select supplier…</option>
                  {FACILITY_OPTIONS.supplier.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                {supplier?.startsWith('Other') && (
                  <input
                    className="field-input"
                    style={{ marginTop: 8 }}
                    placeholder="Specify supplier…"
                    value={supplierOther}
                    onChange={(e) => setSupplierOther(e.target.value)}
                  />
                )}
              </div>
              <div>
                <label className="field-label">Warranty</label>
                <select
                  className="field-select"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                >
                  <option value="">Select warranty…</option>
                  {FACILITY_OPTIONS.warranty.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label className="field-label">
                Initial condition <span style={{ color: 'var(--muted)' }}>· {condition.toFixed?.(1) || condition}/5</span>
              </label>
              <input
                type="range"
                className="fac-range"
                min="0"
                max="5"
                step="0.1"
                value={condition}
                onChange={(e) => setCondition(parseFloat(e.target.value))}
              />
              <div className="assess-condition-scale" style={{ color: 'var(--muted-2)' }}>
                <span>Critical</span>
                <span>Poor</span>
                <span>Fair</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </div>

            <div className="field-grid-2" style={{ marginTop: 12 }}>
              <div>
                <label className="field-label">Purchase cost (optional)</label>
                <input
                  className="field-input"
                  type="number"
                  min="0"
                  placeholder="R 0"
                  value={purchaseCost}
                  onChange={(e) => setPurchaseCost(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">Acquired / installed (optional)</label>
                <input
                  className="field-input"
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label className="field-label">Notes</label>
              <textarea
                className="field-textarea"
                rows={3}
                placeholder="Anything the admin should remember about this asset — supplier, warranty, model number…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="jobmodal-footer">
          <div className="jobmodal-footer-summary">
            <strong>{quantity}</strong> × <strong>{category}</strong> · initial condition{' '}
            <strong>{condition.toFixed ? condition.toFixed(1) : condition}/5</strong>
          </div>
          <div className="jobmodal-footer-actions">
            <Btn tone="outline" onClick={onCancel}>
              Cancel
            </Btn>
            <Btn tone="teal" icon={Icon.Check} onClick={submit} disabled={!canSubmit}>
              Add to facility
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── AssessmentEditor · portaled modal for a single asset section ─── */

// Titles per asset dot-path
const ASSET_TITLES = {
  pitch: 'Pitch square',
  covers: 'Covers',
  'nets.outdoor': 'Outdoor practice nets',
  'nets.indoor': 'Indoor practice nets',
  'nets.bowlingMachines': 'Bowling machine(s)',
  support: 'Support kit',
};

function getAssetAt(assets, path) {
  const parts = path.split('.');
  let ref = assets;
  for (const p of parts) ref = ref?.[p];
  return ref || {};
}

/* ─── AddCapexModal · propose a capex item for the financial year ─── */
function AddCapexModal({ facility, onSubmit, onCancel }) {
  const [asset, setAsset] = useState(FACILITY_OPTIONS.assetCategory[0]);
  const [assetOther, setAssetOther] = useState('');
  const [title, setTitle] = useState('');
  const [justify, setJustify] = useState('');
  const [cost, setCost] = useState('');
  const [priority, setPriority] = useState('medium');
  const [targetYear, setTargetYear] = useState(FACILITY_OPTIONS.targetYear[0]);
  const [funder, setFunder] = useState(FACILITY_OPTIONS.funder[0]);
  const [funderOther, setFunderOther] = useState('');
  const [status, setStatus] = useState('draft');

  // Free-text "Other" overrides for asset + funder.
  const effectiveAsset = asset === 'Other' ? assetOther.trim() || 'Other' : asset;
  const effectiveFunder = funder === 'Other' ? funderOther.trim() || 'Other' : funder;

  const canSubmit =
    title.trim() &&
    justify.trim() &&
    Number(cost) > 0 &&
    (asset !== 'Other' || assetOther.trim().length > 0) &&
    (funder !== 'Other' || funderOther.trim().length > 0);

  function submit() {
    if (!canSubmit) return;
    onSubmit({
      asset: effectiveAsset,
      title: title.trim(),
      justify: justify.trim(),
      cost: Number(cost),
      priority,
      targetYear,
      funder: effectiveFunder,
      status,
    });
  }

  return (
    <div className="fix-confirm" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="fix-confirm-box jobmodal-box">
        <div className="fac-jobmodal-head">
          <div>
            <div className="fac-detail-eyebrow">Facility costing · {facility.venue}</div>
            <div className="fac-jobmodal-title">Add capex item · {facility.venue}</div>
          </div>
          <button className="fac-detail-close" onClick={onCancel}>
            <Icon.X />
          </button>
        </div>

        <div className="fac-jobmodal-body">
          {/* Which asset does this pay for? */}
          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Step 1 · What are you paying for?</div>
            <div>
              <label className="field-label">Asset category</label>
              <select className="field-select" value={asset} onChange={(e) => setAsset(e.target.value)}>
                {FACILITY_OPTIONS.assetCategory.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              {asset === 'Other' && (
                <input
                  className="field-input"
                  style={{ marginTop: 8 }}
                  placeholder="Specify asset category…"
                  value={assetOther}
                  onChange={(e) => setAssetOther(e.target.value)}
                />
              )}
            </div>
          </div>

          {/* Title + justification */}
          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Step 2 · Item details</div>
            <div>
              <label className="field-label">Capex item title <span className="req">*</span></label>
              <input
                className="field-input"
                placeholder="e.g. Upgrade to permanent roll-on rainer covers"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="field-label">Justification <span className="req">*</span></label>
              <textarea
                className="field-textarea"
                rows={3}
                placeholder="Why is this needed? What's the business impact if not funded?"
                value={justify}
                onChange={(e) => setJustify(e.target.value)}
              />
            </div>
          </div>

          {/* Money + timing */}
          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Step 3 · Money + timing</div>
            <div className="field-grid-2">
              <div>
                <label className="field-label">Estimated cost (R) <span className="req">*</span></label>
                <input
                  className="field-input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">Target financial year</label>
                <select
                  className="field-select"
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                >
                  {FACILITY_OPTIONS.targetYear.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field-grid-2" style={{ marginTop: 12 }}>
              <div>
                <label className="field-label">Priority</label>
                <div className="seg">
                  {FACILITY_OPTIONS.priority.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`seg-btn ${priority === p ? 'on' : ''}`}
                      onClick={() => setPriority(p)}
                    >
                      {p === 'high' ? '⚑ ' : ''}
                      {p[0].toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="field-label">Current status</label>
                <select
                  className="field-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {FACILITY_OPTIONS.capexStatus.map((s) => (
                    <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label className="field-label">Funder</label>
              <select className="field-select" value={funder} onChange={(e) => setFunder(e.target.value)}>
                {FACILITY_OPTIONS.funder.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              {funder === 'Other' && (
                <input
                  className="field-input"
                  style={{ marginTop: 8 }}
                  placeholder="Specify funder…"
                  value={funderOther}
                  onChange={(e) => setFunderOther(e.target.value)}
                />
              )}
            </div>
          </div>
        </div>

        <div className="jobmodal-footer">
          <div className="jobmodal-footer-summary">
            <strong>{effectiveAsset}</strong> · target{' '}
            <strong>{targetYear}</strong> · <strong>R {(Number(cost) || 0).toLocaleString()}</strong>
          </div>
          <div className="jobmodal-footer-actions">
            <Btn tone="outline" onClick={onCancel}>Cancel</Btn>
            <Btn tone="teal" icon={Icon.Check} onClick={submit} disabled={!canSubmit}>
              Add capex item
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssessmentEditor({ facility, assetKey, assets, customAssets = [], onSave, onCancel }) {
  // Support "custom.<id>" keys — look up in the customAssets array.
  let initial;
  let title;
  if (assetKey?.startsWith('custom.')) {
    const id = assetKey.slice(7);
    const found = customAssets.find((c) => c.id === id);
    initial = found || {};
    title = found ? `${found.category}${found.description ? ' · ' + found.description : ''}` : 'Custom asset';
  } else {
    initial = getAssetAt(assets, assetKey);
    title = ASSET_TITLES[assetKey] || assetKey;
  }
  const [condition, setCondition] = useState(initial.condition || 0);
  // Normalize any legacy string issues into the structured shape so the
  // UI can render them without special-casing further down.
  const [issues, setIssues] = useState(() =>
    (initial.issues || []).map((i) =>
      typeof i === 'string'
        ? {
            category: 'Other',
            categoryKey: 'other',
            severity: 'moderate',
            location: '',
            notes: i,
            icon: '⚠',
          }
        : i
    )
  );
  const [notes, setNotes] = useState(initial.assessmentNotes || '');
  const [assessedBy, setAssessedBy] = useState(
    initial.assessedBy || FACILITY_OWNERSHIP[facility.clubId].head.name
  );
  const staff = [
    FACILITY_OWNERSHIP[facility.clubId].head,
    ...FACILITY_OWNERSHIP[facility.clubId].assistants,
  ];

  const categories = issueCategoriesFor(assetKey);
  const locations = issueLocationsFor(assetKey);

  // Add-issue state — a tiny inline form that appears when + Log issue is clicked.
  const [logging, setLogging] = useState(false);
  const [newCat, setNewCat] = useState(categories[0]?.key || 'other');
  const [newCatOther, setNewCatOther] = useState('');
  const [newSev, setNewSev] = useState('moderate');
  const [newLoc, setNewLoc] = useState('');
  const [newLocOther, setNewLocOther] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const catObj = categories.find((c) => c.key === newCat) || categories[0];

  function commitIssue() {
    const catLabel = catObj?.key === 'other' && newCatOther.trim() ? newCatOther.trim() : catObj?.label;
    const locLabel = newLoc === '__other' ? newLocOther.trim() : newLoc;
    setIssues((prev) => [
      ...prev,
      {
        category: catLabel,
        categoryKey: catObj?.key || 'other',
        icon: catObj?.icon || '⚠',
        severity: newSev,
        location: locLabel,
        notes: newNotes.trim(),
      },
    ]);
    setLogging(false);
    setNewCat(categories[0]?.key || 'other');
    setNewCatOther('');
    setNewSev('moderate');
    setNewLoc('');
    setNewLocOther('');
    setNewNotes('');
  }
  function removeIssue(i) {
    setIssues((prev) => prev.filter((_, x) => x !== i));
  }
  function updateSeverity(i, sev) {
    setIssues((prev) => prev.map((it, x) => (x === i ? { ...it, severity: sev } : it)));
  }
  function updateIssueField(i, field, value) {
    setIssues((prev) => prev.map((it, x) => (x === i ? { ...it, [field]: value } : it)));
  }

  const canCommit = catObj && (catObj.key !== 'other' || newCatOther.trim().length > 0);

  function save() {
    onSave({
      condition,
      issues,
      assessmentNotes: notes.trim(),
      assessedBy,
      lastAssessed: new Date().toISOString().slice(0, 10),
    });
  }

  const critCount = issues.filter((i) => i.severity === 'critical').length;
  const modCount = issues.filter((i) => i.severity === 'moderate').length;

  return (
    <div className="fix-confirm" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="fix-confirm-box jobmodal-box">
        <div className="fac-jobmodal-head">
          <div>
            <div className="fac-detail-eyebrow">Physical inspection · {facility.venue}</div>
            <div className="fac-jobmodal-title">Assess · {title}</div>
          </div>
          <button className="fac-detail-close" onClick={onCancel}>
            <Icon.X />
          </button>
        </div>

        <div className="fac-jobmodal-body">
          {/* Condition slider */}
          <div className="assess-condition">
            <div className="assess-condition-l">Condition score</div>
            <div className="assess-condition-main">
              <div className={`assess-condition-n ${condition >= 3.6 ? 'good' : condition >= 2.8 ? 'ok' : 'bad'}`}>
                {condition.toFixed(1)}
                <span>/5</span>
              </div>
              <div className="assess-condition-word">
                {condition >= 4.3
                  ? 'Excellent'
                  : condition >= 3.6
                    ? 'Good'
                    : condition >= 2.8
                      ? 'Fair'
                      : condition >= 1.8
                        ? 'Poor'
                        : 'Critical'}
              </div>
            </div>
            <input
              type="range"
              className="fac-range"
              min="0"
              max="5"
              step="0.1"
              value={condition}
              onChange={(e) => setCondition(parseFloat(e.target.value))}
            />
            <div className="assess-condition-scale">
              <span>Critical</span>
              <span>Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Structured issues */}
          <div className="assess-section">
            <div className="assess-issues-head">
              <div>
                <label className="field-label" style={{ margin: 0 }}>
                  Issues found on inspection
                </label>
                <div className="assess-issues-subhead">
                  {issues.length === 0
                    ? 'Nothing logged yet — tap a category chip below or Log issue.'
                    : `${issues.length} logged${critCount ? ` · ${critCount} critical` : ''}${modCount ? ` · ${modCount} moderate` : ''}`}
                </div>
              </div>
              <button className="assess-log-btn" onClick={() => setLogging(!logging)}>
                {logging ? '× Cancel' : '+ Log issue'}
              </button>
            </div>

            {/* Quick-tag chip grid — one-tap common issues at this asset type */}
            {!logging && (
              <div className="assess-cat-grid">
                {categories
                  .filter((c) => c.key !== 'other')
                  .map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      className="assess-cat-chip"
                      title={`Quick-log: ${c.label}`}
                      onClick={() => {
                        setNewCat(c.key);
                        setLogging(true);
                      }}
                    >
                      <span className="assess-cat-chip-icon">{c.icon}</span>
                      <span>{c.label}</span>
                    </button>
                  ))}
              </div>
            )}

            {/* Inline logger — appears when the admin is adding an issue */}
            {logging && (
              <div className="assess-logger">
                <div>
                  <label className="field-label">Category</label>
                  <div className="assess-cat-grid">
                    {categories.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        className={`assess-cat-chip ${newCat === c.key ? 'on' : ''}`}
                        onClick={() => setNewCat(c.key)}
                      >
                        <span className="assess-cat-chip-icon">{c.icon}</span>
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>
                  {catObj?.key === 'other' && (
                    <input
                      className="field-input"
                      style={{ marginTop: 8 }}
                      placeholder="Specify the issue category…"
                      value={newCatOther}
                      onChange={(e) => setNewCatOther(e.target.value)}
                    />
                  )}
                </div>

                <div style={{ marginTop: 12 }}>
                  <label className="field-label">Severity</label>
                  <div className="assess-sev-row">
                    {ISSUE_SEVERITIES.map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        className={`assess-sev-chip tone-${s.tone} ${newSev === s.key ? 'on' : ''}`}
                        onClick={() => setNewSev(s.key)}
                      >
                        <span className="assess-sev-label">{s.label}</span>
                        <span className="assess-sev-desc">{s.advice}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {locations.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <label className="field-label">Location on asset (optional)</label>
                    <select
                      className="field-select"
                      value={newLoc}
                      onChange={(e) => setNewLoc(e.target.value)}
                    >
                      <option value="">— No specific location —</option>
                      {locations.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                      <option value="__other">Other…</option>
                    </select>
                    {newLoc === '__other' && (
                      <input
                        className="field-input"
                        style={{ marginTop: 8 }}
                        placeholder="Specify location…"
                        value={newLocOther}
                        onChange={(e) => setNewLocOther(e.target.value)}
                      />
                    )}
                  </div>
                )}

                <div style={{ marginTop: 12 }}>
                  <label className="field-label">Notes (optional)</label>
                  <input
                    className="field-input"
                    placeholder="e.g. Right rear wheel · about 12mm long tear · sealed with tape as temp fix"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && canCommit && commitIssue()}
                  />
                </div>

                <div className="assess-logger-actions">
                  <Btn tone="outline" size="sm" onClick={() => setLogging(false)}>
                    Cancel
                  </Btn>
                  <Btn tone="teal" size="sm" icon={Icon.Check} onClick={commitIssue} disabled={!canCommit}>
                    Log this issue
                  </Btn>
                </div>
              </div>
            )}

            {/* Existing issues render as coloured cards you can edit / remove */}
            {issues.length > 0 && (
              <div className="assess-issue-list">
                {issues.map((iss, i) => {
                  const tone = severityTone(iss.severity);
                  return (
                    <div key={i} className={`assess-issue-card tone-${tone}`}>
                      <div className="assess-issue-top">
                        <div className="assess-issue-cat">
                          <span className="assess-issue-cat-icon">{iss.icon || '⚠'}</span>
                          <div>
                            <div className="assess-issue-cat-l">{iss.category}</div>
                            {iss.location && <div className="assess-issue-loc">📍 {iss.location}</div>}
                          </div>
                        </div>
                        <div className="assess-issue-controls">
                          <select
                            className={`assess-issue-sev tone-${tone}`}
                            value={iss.severity || 'moderate'}
                            onChange={(e) => updateSeverity(i, e.target.value)}
                            title="Change severity"
                          >
                            {ISSUE_SEVERITIES.map((s) => (
                              <option key={s.key} value={s.key}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                          <button
                            className="assess-issue-remove"
                            onClick={() => removeIssue(i)}
                            title="Remove issue"
                          >
                            <Icon.X />
                          </button>
                        </div>
                      </div>
                      {(iss.notes || iss.severity) && (
                        <input
                          className="assess-issue-notes"
                          placeholder="Add a note about this issue…"
                          value={iss.notes || ''}
                          onChange={(e) => updateIssueField(i, 'notes', e.target.value)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Attribution + notes */}
          <div className="field-grid-2">
            <div>
              <label className="field-label">Assessed by</label>
              <select
                className="field-select"
                value={assessedBy}
                onChange={(e) => setAssessedBy(e.target.value)}
              >
                {staff.map((s) => (
                  <option key={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Inspection date</label>
              <input
                className="field-input"
                value={new Date().toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
                disabled
              />
            </div>
          </div>

          <div>
            <label className="field-label">Inspection notes</label>
            <textarea
              className="field-textarea"
              rows={3}
              placeholder="What did you look at, and what did you find that isn't already an issue?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="jobmodal-footer">
          <div className="jobmodal-footer-summary">
            <strong>{issues.length}</strong> {issues.length === 1 ? 'issue' : 'issues'} logged ·
            condition <strong>{condition.toFixed(1)}</strong>/5
          </div>
          <div className="jobmodal-footer-actions">
            <Btn tone="outline" onClick={onCancel}>
              Cancel
            </Btn>
            <Btn tone="teal" icon={Icon.Check} onClick={save}>
              Save assessment
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function FacilityInvestmentTab({ facility, capex: capexProp, onCreateJob, onAddCapex, onDiscardCapex }) {
  const capex = capexProp || FACILITY_CAPEX[facility.clubId] || [];
  const maint = FACILITY_MAINTENANCE_SCHEDULE[facility.clubId] || [];
  const spend = FACILITY_SPEND[facility.clubId] || { byAsset: {}, ytdBudget: 0, ytdActual: 0, yearlyBudget: 0 };
  const capexSum = capexTotal(facility.clubId);
  const annualMaint = annualisedMaintCost(facility.clubId);

  const capexByAsset = capex.reduce((acc, c) => {
    (acc[c.asset] = acc[c.asset] || []).push(c);
    return acc;
  }, {});
  const maintByAsset = maint.reduce((acc, m) => {
    (acc[m.asset] = acc[m.asset] || []).push(m);
    return acc;
  }, {});

  const ASSET_LABELS = {
    pitch: 'Pitch',
    covers: 'Covers',
    nets: 'Nets',
    bowling: 'Bowling machines',
    support: 'Support kit',
  };

  const variance = spend.ytdActual - spend.ytdBudget;
  const variancePct = spend.ytdBudget ? ((variance / spend.ytdBudget) * 100).toFixed(1) : '0';
  const overBudget = variance > 0;

  return (
    <div className="fac-tab-body">
      <div className="fac-objective">
        <div className="fac-objective-eyebrow">Objective</div>
        <div className="fac-objective-text">
          <strong>Track and forecast the cost of keeping {facility.venue} match-ready.</strong>{' '}
          Three views: <strong>YTD spend</strong> (what you've actually paid so far), the{' '}
          <strong>annual maintenance budget</strong> (what recurring work costs across the year),
          and <strong>capex</strong> (one-off renewals + upgrades). Together they build the number
          you take into the Union grant conversation.
        </div>
      </div>

      {/* ─── COST PANEL — the primary lens ─── */}
      <div className="fac-section-head" style={{ marginTop: 6 }}>
        <div>
          <div className="fac-section-title">Facility cost tracker</div>
          <div className="fac-section-sub">
            YTD actuals vs budget · month {spend.monthsElapsed} of 12
          </div>
        </div>
      </div>

      <div className="fac-cost-hero">
        <div className="fac-cost-hero-main">
          <div className="fac-cost-hero-l">YTD spend</div>
          <div className="fac-cost-hero-n">R {spend.ytdActual.toLocaleString()}</div>
          <div className="fac-cost-hero-meta">
            of R {spend.ytdBudget.toLocaleString()} budgeted
          </div>
          <div className={`fac-cost-hero-variance ${overBudget ? 'over' : 'under'}`}>
            {overBudget ? '▲' : '▼'} R {Math.abs(variance).toLocaleString()} ·{' '}
            {variancePct}% {overBudget ? 'over budget' : 'under budget'}
          </div>
        </div>
        <div className="fac-cost-hero-side">
          <div className="fac-cost-side-row">
            <span>Yearly maintenance budget</span>
            <strong>R {spend.yearlyBudget.toLocaleString()}</strong>
          </div>
          <div className="fac-cost-side-row">
            <span>Capex under proposal</span>
            <strong>R {capexSum.toLocaleString()}</strong>
          </div>
          <div className="fac-cost-side-row primary">
            <span>Total for the grant conversation</span>
            <strong>R {(spend.yearlyBudget + capexSum).toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* Per-asset spend breakdown */}
      <div className="fac-section-head" style={{ marginTop: 22 }}>
        <div>
          <div className="fac-section-title">Cost by asset · YTD</div>
          <div className="fac-section-sub">Where the maintenance rand is actually going</div>
        </div>
      </div>
      <div className="fac-cost-breakdown">
        {Object.keys(spend.byAsset).map((asset) => {
          const a = spend.byAsset[asset];
          const pct = spend.ytdActual ? (a.actual / spend.ytdActual) * 100 : 0;
          const varAmount = a.actual - a.budgeted;
          const varPct = a.budgeted ? ((varAmount / a.budgeted) * 100).toFixed(0) : '0';
          return (
            <div key={asset} className="fac-cost-row">
              <div className="fac-cost-row-l">
                <div className="fac-cost-row-name">{ASSET_LABELS[asset] || asset}</div>
                <div className="fac-cost-row-sub">
                  Yearly budget · R {a.yearlyBudget.toLocaleString()}
                </div>
              </div>
              <div className="fac-cost-row-bar">
                <div className="fac-cost-row-track">
                  <div className="fac-cost-row-fill" style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
                <div className="fac-cost-row-pct">{pct.toFixed(0)}%</div>
              </div>
              <div className="fac-cost-row-num">
                <div className="fac-cost-row-actual">R {a.actual.toLocaleString()}</div>
                <div
                  className={`fac-cost-row-var ${varAmount > 0 ? 'over' : 'under'}`}
                  title={`Budget R ${a.budgeted.toLocaleString()}`}
                >
                  {varAmount > 0 ? '▲' : '▼'} R {Math.abs(varAmount).toLocaleString()} · {varPct}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Existing capex + maintenance sections — keep, but they now sit *under* the cost panel */}

      {/* CAPEX */}
      <div className="fac-section-head" style={{ marginTop: 22 }}>
        <div>
          <div className="fac-section-title">Capex requirements</div>
          <div className="fac-section-sub">
            One-off asset renewals and expansion — used for Union grant + sponsor bids
          </div>
        </div>
        <Btn tone="teal" size="sm" icon={Icon.Plus} onClick={onAddCapex}>
          Add capex item
        </Btn>
      </div>

      {capex.length === 0 && (
        <div className="fac-empty">
          No capex items proposed. Great news — either everything is in shape or the plan is stale.
        </div>
      )}

      {Object.keys(capexByAsset).map((asset) => (
        <div key={asset} className="fac-capex-group">
          <div className="fac-capex-group-l">{ASSET_LABELS[asset] || asset}</div>
          {capexByAsset[asset].map((c) => (
            <div key={c.id} className="fac-capex-card">
              <div className="fac-capex-head">
                <div>
                  <div className="fac-capex-eyebrow">
                    <Pill tone={capexPriorityTone(c.priority)}>{c.priority.toUpperCase()}</Pill>
                    <Pill tone={capexStatusTone(c.status)} dot>
                      {c.status[0].toUpperCase() + c.status.slice(1)}
                    </Pill>
                    <span className="fac-capex-target">{c.targetYear}</span>
                  </div>
                  <div className="fac-capex-title">{c.title}</div>
                </div>
                <div className="fac-capex-cost">R {c.cost.toLocaleString()}</div>
              </div>
              <div className="fac-capex-justify">{c.justify}</div>
              <div className="fac-capex-foot">
                <span>
                  <strong>Funder:</strong> {c.funder}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="fac-discard-btn"
                    onClick={() => {
                      if (window.confirm(`Discard this capex item?\n\n${c.title}`)) {
                        onDiscardCapex?.(c.id);
                      }
                    }}
                  >
                    🗑 Discard
                  </button>
                  <button className="fac-job-btn">Open detail</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* MAINTENANCE PLAN */}
      <div className="fac-section-head" style={{ marginTop: 24 }}>
        <div>
          <div className="fac-section-title">Recurring maintenance plan</div>
          <div className="fac-section-sub">
            Planned work, grouped by asset — annualised into the budget
          </div>
        </div>
        <Btn tone="outline" size="sm" icon={Icon.Plus} onClick={() => onCreateJob?.()}>
          Dispatch as job card
        </Btn>
      </div>

      {Object.keys(maintByAsset).map((asset) => {
        const total = maintByAsset[asset].reduce((s, t) => {
          const per =
            t.frequency === 'weekly'
              ? 52
              : t.frequency === 'monthly'
                ? 12
                : t.frequency === 'quarterly'
                  ? 4
                  : 1;
          return s + t.cost * per;
        }, 0);
        return (
          <div key={asset} className="fac-maint-group">
            <div className="fac-maint-group-head">
              <div className="fac-capex-group-l">{ASSET_LABELS[asset] || asset}</div>
              <div className="fac-maint-total">R {total.toLocaleString()} <span>/ year</span></div>
            </div>
            <div className="fac-maint-table">
              {maintByAsset[asset].map((m) => (
                <div key={m.id} className="fac-maint-row">
                  <Pill tone="muted">{m.frequency}</Pill>
                  <div className="fac-maint-task">{m.task}</div>
                  <div className="fac-maint-meta">
                    <span>{m.assigneeName}</span>
                    <span>
                      Next{' '}
                      {new Date(m.nextDue).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                  <div className="fac-maint-cost">R {m.cost.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── AdminVendors · roster + onboarding lifecycle ─── */
function AdminVendors({ toast }) {
  const [vendors, setVendors] = useState(VENDORS);
  const [filter, setFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [onboarding, setOnboarding] = useState(false);
  const [detailId, setDetailId] = useState(null);

  function addVendor(v) {
    setVendors((prev) => [...prev, { ...v, id: 'v-' + Date.now() }]);
    setOnboarding(false);
    toast?.(`${v.name} onboarded · status: ${v.status}`);
  }
  function updateStatus(id, next) {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: next, onboardedAt: next === 'onboarded' ? new Date().toISOString().slice(0, 10) : v.onboardedAt } : v))
    );
    toast?.(`Vendor moved to ${next}`);
  }

  const onboarded = vendors.filter((v) => v.status === 'onboarded').length;
  const pending = vendors.filter((v) => v.status === 'submitted' || v.status === 'verified').length;
  const suspended = vendors.filter((v) => v.status === 'suspended').length;
  const draft = vendors.filter((v) => v.status === 'draft').length;

  const filtered = vendors
    .filter((v) => (filter === 'all' ? true : v.status === filter))
    .filter((v) => (catFilter === 'all' ? true : v.category === catFilter))
    .filter((v) =>
      !query.trim()
        ? true
        : (v.name + ' ' + v.category + ' ' + v.contactPerson + ' ' + (v.services || []).join(' '))
            .toLowerCase()
            .includes(query.toLowerCase())
    );

  const catCounts = vendors.reduce((acc, v) => {
    acc[v.category] = (acc[v.category] || 0) + 1;
    return acc;
  }, {});

  const detailVendor = detailId ? vendors.find((v) => v.id === detailId) : null;

  return (
    <div>
      <div className="page-head">
        <div className="ph-left">
          <div className="ph-crumb">Lions · Admin Console / Vendors</div>
          <h1 className="ph-title">
            Vendors &amp; <em>Suppliers</em>
          </h1>
          <p className="ph-desc">
            Approved external contractors and equipment suppliers. Onboard a vendor once (company
            details, compliance, banking) and dispatch job cards to them from any facility.
          </p>
        </div>
        <div className="ph-actions">
          <Btn tone="outline" size="sm" icon={Icon.Download}>
            Export
          </Btn>
          <Btn tone="teal" size="sm" icon={Icon.Plus} onClick={() => setOnboarding(true)}>
            Onboard vendor
          </Btn>
        </div>
      </div>

      {/* KPI strip */}
      <div className="players-stats">
        <div className="players-stat">
          <div className="players-stat-l">Total vendors</div>
          <div className="players-stat-n">{vendors.length}</div>
        </div>
        <div className="players-stat">
          <div className="players-stat-l">Onboarded</div>
          <div className="players-stat-n" style={{ color: 'var(--green)' }}>
            {onboarded}
          </div>
        </div>
        <div className="players-stat">
          <div className="players-stat-l">Pending review</div>
          <div className="players-stat-n" style={{ color: onboarded ? 'var(--gold)' : 'var(--ink)' }}>
            {pending + draft}
          </div>
        </div>
        <div className="players-stat">
          <div className="players-stat-l">Suspended</div>
          <div className="players-stat-n" style={{ color: suspended ? 'var(--coral)' : 'var(--ink)' }}>
            {suspended}
          </div>
        </div>
      </div>

      {/* Filter + search row */}
      <div className="filter-row" style={{ marginTop: 14 }}>
        {[
          { k: 'all', l: 'All', n: vendors.length },
          { k: 'onboarded', l: 'Onboarded', n: onboarded },
          { k: 'verified', l: 'Verified', n: vendors.filter((v) => v.status === 'verified').length },
          { k: 'submitted', l: 'Submitted', n: vendors.filter((v) => v.status === 'submitted').length },
          { k: 'draft', l: 'Draft', n: draft },
          { k: 'suspended', l: 'Suspended', n: suspended },
        ].map((b) => (
          <button
            key={b.k}
            className={`filter-pill ${filter === b.k ? 'active' : ''}`}
            onClick={() => setFilter(b.k)}
          >
            {b.l} <span style={{ opacity: 0.7, marginLeft: 4 }}>{b.n}</span>
          </button>
        ))}
        <input
          className="field-input"
          style={{ maxWidth: 260, marginLeft: 'auto', height: 36 }}
          placeholder="Search vendor · service · contact…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Category filter row */}
      <div className="filter-row vendor-cat-row" style={{ marginTop: 8 }}>
        <span className="vendor-cat-label">Category</span>
        <button
          className={`filter-pill ${catFilter === 'all' ? 'active' : ''}`}
          onClick={() => setCatFilter('all')}
        >
          All <span style={{ opacity: 0.7, marginLeft: 4 }}>{vendors.length}</span>
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
      </div>

      {/* Vendors table */}
      <div className="tbl-w" style={{ marginTop: 14 }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Category</th>
              <th>Contact</th>
              <th>Services</th>
              <th style={{ textAlign: 'right' }}>Rating · Jobs</th>
              <th>Status</th>
              <th style={{ width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id} className="clickable" onClick={() => setDetailId(v.id)}>
                <td>
                  <div
                    style={{
                      fontFamily: "'Montserrat',sans-serif",
                      fontWeight: 800,
                      fontSize: 13,
                      color: 'var(--ink)',
                    }}
                  >
                    {v.name}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>{v.address}</div>
                </td>
                <td>
                  <Pill tone="navy">{v.category}</Pill>
                </td>
                <td>
                  <div style={{ fontSize: 12.5, fontFamily: "'Montserrat',sans-serif", fontWeight: 600 }}>
                    {v.contactPerson}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--muted)', fontFamily: "'Montserrat',sans-serif" }}>
                    {v.phone}
                  </div>
                </td>
                <td>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--muted)',
                      fontFamily: "'Montserrat',sans-serif",
                      lineHeight: 1.45,
                      maxWidth: 240,
                    }}
                  >
                    {(v.services || []).slice(0, 3).join(' · ') || '—'}
                    {(v.services || []).length > 3 && ` +${v.services.length - 3}`}
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontFamily: "'Montserrat',sans-serif",
                      fontWeight: 800,
                      fontSize: 14,
                      color: v.rating >= 4 ? 'var(--green)' : v.rating > 0 ? 'var(--ink)' : 'var(--muted-2)',
                    }}
                  >
                    {v.rating > 0 ? v.rating.toFixed(1) : '—'}
                    <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 6 }}>
                      / 5
                    </span>
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>
                    {v.jobsCompleted || 0} jobs
                  </div>
                </td>
                <td>
                  <Pill tone={vendorStatusTone(v.status)} dot>
                    {v.status[0].toUpperCase() + v.status.slice(1)}
                  </Pill>
                </td>
                <td style={{ textAlign: 'right', paddingRight: 14 }}>
                  <Icon.Arrow />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: 28, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                  No vendors match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Onboarding modal */}
      {onboarding &&
        ReactDOM.createPortal(
          <VendorOnboardModal onSubmit={addVendor} onCancel={() => setOnboarding(false)} />,
          document.body
        )}

      {/* Vendor detail drawer */}
      {detailVendor &&
        ReactDOM.createPortal(
          <VendorDetailDrawer
            vendor={detailVendor}
            onClose={() => setDetailId(null)}
            onUpdateStatus={updateStatus}
          />,
          document.body
        )}
    </div>
  );
}

function VendorOnboardModal({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(VENDOR_CATEGORIES[0]);
  const [categoryOther, setCategoryOther] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [beeLevel, setBeeLevel] = useState('');
  const [insuranceExpiry, setInsuranceExpiry] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [services, setServices] = useState([]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('submitted');

  const effectiveCategory = category === 'Other' ? categoryOther.trim() || 'Other' : category;
  const canSubmit =
    name.trim() &&
    contactPerson.trim() &&
    phone.trim() &&
    email.trim() &&
    (category !== 'Other' || categoryOther.trim().length > 0);

  function toggleService(s) {
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function submit() {
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      category: effectiveCategory,
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      vatNumber: vatNumber.trim(),
      beeLevel,
      insuranceExpiry: insuranceExpiry || null,
      bankName,
      bankAccount: bankAccount.trim(),
      services,
      notes: notes.trim(),
      rating: 0,
      jobsCompleted: 0,
      status,
      onboardedAt: status === 'onboarded' ? new Date().toISOString().slice(0, 10) : null,
    });
  }

  return (
    <div className="fix-confirm" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="fix-confirm-box jobmodal-box">
        <div className="fac-jobmodal-head">
          <div>
            <div className="fac-detail-eyebrow">Vendor onboarding</div>
            <div className="fac-jobmodal-title">Onboard a new vendor</div>
          </div>
          <button className="fac-detail-close" onClick={onCancel}>
            <Icon.X />
          </button>
        </div>

        <div className="fac-jobmodal-body">
          {/* Step 1: Company */}
          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Step 1 · Company details</div>
            <div className="field-grid-2">
              <div>
                <label className="field-label">Vendor name <span className="req">*</span></label>
                <input
                  className="field-input"
                  placeholder="e.g. Green Turf Solutions"
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
                  {VENDOR_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
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
            <div style={{ marginTop: 12 }}>
              <label className="field-label">Business address</label>
              <input
                className="field-input"
                placeholder="Street · Suburb · City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Step 2: Contact */}
          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Step 2 · Primary contact</div>
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
              <label className="field-label">Email <span className="req">*</span></label>
              <input
                className="field-input"
                type="email"
                placeholder="you@vendor.co.za"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Step 3: Compliance */}
          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Step 3 · Compliance</div>
            <div className="field-grid-2">
              <div>
                <label className="field-label">VAT number</label>
                <input
                  className="field-input"
                  placeholder="0000000000"
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">B-BBEE level</label>
                <select
                  className="field-select"
                  value={beeLevel}
                  onChange={(e) => setBeeLevel(e.target.value)}
                >
                  <option value="">Select level…</option>
                  {BEE_LEVELS.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="field-label">Public-liability insurance expiry</label>
              <input
                type="date"
                className="field-input"
                value={insuranceExpiry}
                onChange={(e) => setInsuranceExpiry(e.target.value)}
              />
            </div>
          </div>

          {/* Step 4: Banking */}
          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Step 4 · Banking</div>
            <div className="field-grid-2">
              <div>
                <label className="field-label">Bank</label>
                <select
                  className="field-select"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                >
                  <option value="">Select bank…</option>
                  {['Standard Bank', 'FNB', 'Absa', 'Nedbank', 'Capitec', 'Investec', 'African Bank', 'Discovery Bank', 'Other'].map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Account (last 4 digits)</label>
                <input
                  className="field-input"
                  placeholder="1234"
                  maxLength={4}
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, '').slice(0, 4))}
                />
              </div>
            </div>
          </div>

          {/* Step 5: Services */}
          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Step 5 · Services offered</div>
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
          </div>

          {/* Step 6: Notes + status */}
          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Step 6 · Onboarding status</div>
            <div>
              <label className="field-label">Notes / references</label>
              <textarea
                className="field-textarea"
                rows={3}
                placeholder="Referrals, past work with the union, anything the next admin needs to know…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="field-label">Save as</label>
              <select
                className="field-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {VENDOR_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="jobmodal-footer">
          <div className="jobmodal-footer-summary">
            <strong>{name || 'Unnamed vendor'}</strong> · {effectiveCategory} ·{' '}
            <strong>{services.length}</strong> service{services.length === 1 ? '' : 's'} · status{' '}
            <strong>{status}</strong>
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

function VendorDetailDrawer({ vendor, onClose, onUpdateStatus }) {
  return (
    <div className="fix-confirm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fix-confirm-box jobmodal-box">
        <div className="fac-jobmodal-head">
          <div>
            <div className="fac-detail-eyebrow">{vendor.category}</div>
            <div className="fac-jobmodal-title">{vendor.name}</div>
            <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
              <Pill tone={vendorStatusTone(vendor.status)} dot>
                {vendor.status[0].toUpperCase() + vendor.status.slice(1)}
              </Pill>
              {vendor.rating > 0 && (
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  ⭐ {vendor.rating.toFixed(1)} · {vendor.jobsCompleted} jobs
                </span>
              )}
            </div>
          </div>
          <button className="fac-detail-close" onClick={onClose}>
            <Icon.X />
          </button>
        </div>

        <div className="fac-jobmodal-body">
          <div className="vendor-detail-grid">
            <div>
              <div className="fac-detail-l">Contact</div>
              <div className="fac-detail-v">{vendor.contactPerson}</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
                {vendor.phone} · {vendor.email}
              </div>
            </div>
            <div>
              <div className="fac-detail-l">Address</div>
              <div className="fac-detail-v" style={{ fontSize: 13 }}>{vendor.address}</div>
            </div>
            <div>
              <div className="fac-detail-l">VAT</div>
              <div className="fac-detail-v" style={{ fontSize: 13 }}>{vendor.vatNumber || '—'}</div>
            </div>
            <div>
              <div className="fac-detail-l">B-BBEE</div>
              <div className="fac-detail-v" style={{ fontSize: 13 }}>{vendor.beeLevel || '—'}</div>
            </div>
            <div>
              <div className="fac-detail-l">Insurance expires</div>
              <div className="fac-detail-v" style={{ fontSize: 13 }}>
                {vendor.insuranceExpiry
                  ? new Date(vendor.insuranceExpiry).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'}
              </div>
            </div>
            <div>
              <div className="fac-detail-l">Banking</div>
              <div className="fac-detail-v" style={{ fontSize: 13 }}>
                {vendor.bankName || '—'}{' '}
                <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{vendor.bankAccount}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="fac-detail-l">Services offered</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {(vendor.services || []).map((s) => (
                <Pill key={s} tone="navy">{s}</Pill>
              ))}
              {(vendor.services || []).length === 0 && (
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>None declared</span>
              )}
            </div>
          </div>

          {vendor.notes && (
            <div style={{ marginTop: 16 }}>
              <div className="fac-detail-l">Notes</div>
              <div
                style={{
                  marginTop: 6,
                  padding: 10,
                  background: 'var(--paper)',
                  borderRadius: 8,
                  fontFamily: "'Montserrat',sans-serif",
                  fontSize: 12.5,
                  color: 'var(--ink)',
                  lineHeight: 1.5,
                }}
              >
                {vendor.notes}
              </div>
            </div>
          )}
        </div>

        <div className="jobmodal-footer">
          <div className="jobmodal-footer-summary">
            {vendor.onboardedAt
              ? `Onboarded ${new Date(vendor.onboardedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
              : 'Not yet onboarded'}
          </div>
          <div className="jobmodal-footer-actions" style={{ flexWrap: 'wrap' }}>
            {vendor.status === 'submitted' && (
              <Btn tone="outline" size="sm" onClick={() => onUpdateStatus(vendor.id, 'verified')}>
                Mark verified
              </Btn>
            )}
            {(vendor.status === 'verified' || vendor.status === 'submitted') && (
              <Btn tone="teal" size="sm" icon={Icon.Check} onClick={() => onUpdateStatus(vendor.id, 'onboarded')}>
                Onboard
              </Btn>
            )}
            {vendor.status === 'onboarded' && (
              <Btn tone="outline" size="sm" onClick={() => onUpdateStatus(vendor.id, 'suspended')}>
                Suspend
              </Btn>
            )}
            {vendor.status === 'suspended' && (
              <Btn tone="teal" size="sm" onClick={() => onUpdateStatus(vendor.id, 'onboarded')}>
                Reinstate
              </Btn>
            )}
            <Btn tone="outline" onClick={onClose}>Close</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ClubReportsInbox · admin-side mirror of club Facility Reporting ───
   Everything a chair logs on their Facility page lands here. Admin can
   open the ground, promote to a scheduled job card, mark in-progress, or
   resolve. Whatever state is set flows back to the chair's Reports panel. */
function ClubReportsInbox({ jobs, clubs = [], onOpenGround, onOpenCreateJob, onMarkStatus }) {
  const reports = (jobs || []).filter((j) => j.reportedByClub);
  const openReports = reports.filter((j) => j.status !== 'done');
  const inProgress = reports.filter((j) => j.status === 'in-progress').length;
  const resolved = reports.filter((j) => j.status === 'done').length;
  const highPriority = reports.filter((j) => j.status !== 'done' && j.priority === 'high').length;

  if (!reports.length) {
    return (
      <div className="cri-empty">
        <div className="cri-empty-title">Club Reports Inbox</div>
        <div className="cri-empty-body">
          No club-side reports yet. When a chair logs an issue on their Facility page, it lands
          here as a draft job card ready to dispatch.
        </div>
      </div>
    );
  }

  const clubBy = (id) => clubs.find((c) => c.id === id);

  return (
    <div className="cri-wrap">
      <div className="cri-head">
        <div>
          <div className="cri-eyebrow">Club Reports Inbox</div>
          <div className="cri-title">
            {openReports.length} pending · {inProgress} in progress · {resolved} resolved
          </div>
        </div>
        <div className="cri-kpis">
          {highPriority > 0 && (
            <span className="cri-kpi cri-kpi-danger">🔥 {highPriority} high priority</span>
          )}
          <span className="cri-kpi">{reports.length} total</span>
        </div>
      </div>

      <div className="cri-list">
        {openReports.slice(0, 6).map((j) => {
          const club = clubBy(j.facilityId);
          const facility = FACILITIES.find((f) => f.clubId === j.facilityId);
          const created = new Date(j.reportedByClub?.at || j.createdAt);
          const daysAgo = Math.max(0, Math.round((new Date() - created) / 86400000));
          return (
            <div key={j.id} className={`cri-row cri-row-${j.priority}`}>
              <div className="cri-row-l">
                <div className="cri-row-club">
                  <span className="cri-row-club-name">
                    {club?.short || club?.name || facility?.venue || j.facilityId}
                  </span>
                  <span className="cri-row-chair">
                    · 🎽 {j.reportedByClub?.chair || 'Chair'}
                  </span>
                </div>
                <div className="cri-row-title">{j.title}</div>
                {j.notes && <div className="cri-row-note">"{j.notes}"</div>}
                <div className="cri-row-meta">
                  <span className={`cri-pri cri-pri-${j.priority}`}>{j.priority}</span>
                  <span className="cri-status">
                    {j.status === 'open' ? 'Awaiting dispatch' : j.status}
                  </span>
                  <span className="cri-age">
                    {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
                  </span>
                </div>
              </div>
              <div className="cri-row-actions">
                {j.status === 'open' && (
                  <button
                    className="cri-btn cri-btn-primary"
                    onClick={() => facility && onOpenCreateJob?.(facility, j)}
                  >
                    Dispatch →
                  </button>
                )}
                {j.status !== 'open' && j.status !== 'done' && (
                  <button
                    className="cri-btn"
                    onClick={() => onMarkStatus?.(j.id, 'done')}
                  >
                    Mark done
                  </button>
                )}
                {j.status === 'open' && (
                  <button
                    className="cri-btn cri-btn-ghost"
                    onClick={() => onMarkStatus?.(j.id, 'in-progress')}
                  >
                    Start
                  </button>
                )}
                <button
                  className="cri-btn cri-btn-ghost"
                  onClick={() => onOpenGround?.(j.facilityId)}
                >
                  Open ground
                </button>
              </div>
            </div>
          );
        })}
        {openReports.length > 6 && (
          <div className="cri-more">+ {openReports.length - 6} more open reports across the cohort</div>
        )}
      </div>
    </div>
  );
}

/* ─── AdminProjects · Project Portfolio ───
   Cross-cutting project management for the Lions office. Every project has a
   task list, an equipment BOM, resourcing (Lions staff + external vendors),
   and a rolling spend total computed from the equipment + people costs. */
function AdminProjects({ projects, setProjects, toast }) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [openProject, setOpenProject] = useState(null);
  const [addingProject, setAddingProject] = useState(false);

  const withSpend = useMemo(
    () => projects.map((p) => ({ ...p, _spend: computeProjectSpend(p) })),
    [projects]
  );

  const filtered = withSpend
    .filter((p) => (typeFilter === 'all' ? true : p.type === typeFilter))
    .filter((p) => (statusFilter === 'all' ? true : p.status === statusFilter))
    .filter((p) =>
      !query.trim()
        ? true
        : (p.name + ' ' + p.owner + ' ' + (p.description || ''))
            .toLowerCase()
            .includes(query.toLowerCase())
    );

  const active = withSpend.filter((p) => p.status === 'active').length;
  const planning = withSpend.filter((p) => p.status === 'planning').length;
  const totalBudget = withSpend.reduce((s, p) => s + (p.budget || 0), 0);
  const totalSpend = withSpend.reduce((s, p) => s + p._spend, 0);

  const typeCounts = withSpend.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {});

  function updateProject(id, patch) {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }
  function addProject(p) {
    const withId = { ...p, id: 'proj-' + Date.now(), tasks: [], equipment: [], people: [] };
    setProjects((prev) => [withId, ...prev]);
    setAddingProject(false);
    toast?.(`Project "${p.name}" created`);
    setOpenProject(withId.id);
  }
  function removeProject(id) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setOpenProject(null);
    toast?.('Project archived');
  }

  const detail = openProject ? withSpend.find((p) => p.id === openProject) : null;
  if (detail) {
    return (
      <ProjectDetail
        project={detail}
        onBack={() => setOpenProject(null)}
        onUpdate={(patch) => updateProject(detail.id, patch)}
        onRemove={() => removeProject(detail.id)}
        toast={toast}
      />
    );
  }

  return (
    <div>
      <div className="page-head">
        <div className="ph-left">
          <div className="ph-crumb">Lions · Admin Console / Projects</div>
          <h1 className="ph-title">
            Project <em>Portfolio</em>
          </h1>
          <p className="ph-desc">
            Every union-run initiative in one place — tournaments, asset upgrades, ground works,
            community outreach. Track tasks, kit, resourcing and money spent.
          </p>
        </div>
        <div className="ph-actions">
          <Btn tone="outline" size="sm" icon={Icon.Download}>Export</Btn>
          <Btn tone="teal" size="sm" icon={Icon.Plus} onClick={() => setAddingProject(true)}>
            New project
          </Btn>
        </div>
      </div>

      {/* KPI strip */}
      <div className="players-stats">
        <div className="players-stat">
          <div className="players-stat-l">Portfolio</div>
          <div className="players-stat-n">{withSpend.length}</div>
        </div>
        <div className="players-stat">
          <div className="players-stat-l">Active</div>
          <div className="players-stat-n" style={{ color: 'var(--green)' }}>{active}</div>
        </div>
        <div className="players-stat">
          <div className="players-stat-l">In planning</div>
          <div className="players-stat-n" style={{ color: planning ? 'var(--gold)' : 'var(--ink)' }}>{planning}</div>
        </div>
        <div className="players-stat">
          <div className="players-stat-l">Total budget</div>
          <div className="players-stat-n">R {(totalBudget / 1000).toFixed(0)}k</div>
        </div>
        <div className="players-stat">
          <div className="players-stat-l">Total spend</div>
          <div className="players-stat-n" style={{ color: totalSpend > totalBudget ? 'var(--coral)' : 'var(--ink)' }}>
            R {(totalSpend / 1000).toFixed(0)}k
          </div>
        </div>
      </div>

      {/* Type filter */}
      <div className="filter-row" style={{ marginTop: 14 }}>
        <button
          className={`filter-pill ${typeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setTypeFilter('all')}
        >
          All types <span style={{ opacity: 0.7, marginLeft: 4 }}>{withSpend.length}</span>
        </button>
        {PROJECT_TYPES.filter((t) => typeCounts[t.key]).map((t) => (
          <button
            key={t.key}
            className={`filter-pill ${typeFilter === t.key ? 'active' : ''}`}
            onClick={() => setTypeFilter(t.key)}
          >
            {t.icon} {t.label}
            <span style={{ opacity: 0.7, marginLeft: 4 }}>{typeCounts[t.key]}</span>
          </button>
        ))}
        <input
          className="field-input"
          style={{ maxWidth: 240, marginLeft: 'auto', height: 34 }}
          placeholder="Search projects…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Status pill row */}
      <div className="filter-row" style={{ marginTop: 8 }}>
        <span className="vendor-cat-label">Status</span>
        <button
          className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          Any
        </button>
        {PROJECT_STATUSES.map((s) => (
          <button
            key={s.key}
            className={`filter-pill ${statusFilter === s.key ? 'active' : ''}`}
            onClick={() => setStatusFilter(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Project cards */}
      <div className="proj-grid">
        {filtered.map((p) => {
          const meta = projectTypeMeta(p.type);
          const budget = p.budget || 0;
          const spend = p._spend || 0;
          const usage = budget ? Math.min(100, (spend / budget) * 100) : 0;
          const overBudget = spend > budget && budget > 0;
          const tasksDone = (p.tasks || []).filter((t) => t.status === 'done').length;
          const tasksTotal = (p.tasks || []).length;
          return (
            <div key={p.id} className="proj-card" onClick={() => setOpenProject(p.id)}>
              <div className="proj-card-head">
                <div className="proj-card-icon">{meta.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="proj-card-name">{p.name}</div>
                  <div className="proj-card-type">{meta.label}</div>
                </div>
                <Pill tone={projectStatusTone(p.status)} dot>
                  {PROJECT_STATUSES.find((s) => s.key === p.status)?.label || p.status}
                </Pill>
              </div>

              <div className="proj-card-desc">{p.description}</div>

              <div className="proj-card-stats">
                <div className="proj-card-stat">
                  <span className="proj-card-stat-l">Tasks</span>
                  <span className="proj-card-stat-n">{tasksDone}/{tasksTotal}</span>
                </div>
                <div className="proj-card-stat">
                  <span className="proj-card-stat-l">Kit items</span>
                  <span className="proj-card-stat-n">{(p.equipment || []).length}</span>
                </div>
                <div className="proj-card-stat">
                  <span className="proj-card-stat-l">People</span>
                  <span className="proj-card-stat-n">{(p.people || []).length}</span>
                </div>
                <div className="proj-card-stat">
                  <span className="proj-card-stat-l">Owner</span>
                  <span className="proj-card-stat-n" style={{ fontSize: 12.5 }}>{p.owner}</span>
                </div>
              </div>

              <div className="proj-card-spend">
                <div className="proj-card-spend-row">
                  <span>
                    <strong>R {spend.toLocaleString()}</strong>
                    <span style={{ color: 'var(--muted)', fontWeight: 500 }}>
                      {' '}spent of R {budget.toLocaleString()}
                    </span>
                  </span>
                  <span style={{ color: overBudget ? 'var(--coral)' : 'var(--muted)', fontWeight: 700, fontSize: 11 }}>
                    {overBudget ? 'Over' : `${usage.toFixed(0)}%`}
                  </span>
                </div>
                <div className="proj-card-spend-bar">
                  <div
                    className="proj-card-spend-bar-fill"
                    style={{
                      width: `${Math.min(100, usage)}%`,
                      background: overBudget ? 'var(--coral)' : usage > 80 ? 'var(--gold)' : 'var(--green)',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="cv-empty">No projects match this filter.</div>
        )}
      </div>

      {addingProject && ReactDOM.createPortal(
        <AddProjectModal onSubmit={addProject} onCancel={() => setAddingProject(false)} />,
        document.body
      )}
    </div>
  );
}

/* ─── ProjectDetail · four-column drilldown ─── */
function ProjectDetail({ project, onBack, onUpdate, onRemove, toast }) {
  const [addingTask, setAddingTask] = useState(false);
  const [addingEquip, setAddingEquip] = useState(false);
  const [addingPerson, setAddingPerson] = useState(false);

  const spend = computeProjectSpend(project);
  const budget = project.budget || 0;
  const budgetLeft = budget - spend;
  const meta = projectTypeMeta(project.type);

  const equipCost = (project.equipment || []).reduce(
    (s, e) => s + (Number(e.qty) || 0) * (Number(e.unitCost) || 0),
    0
  );
  const peopleCost = (project.people || []).reduce(
    (s, r) => s + (Number(r.dailyRate) || 0) * (Number(r.days) || 0),
    0
  );

  function addTask(t) {
    onUpdate({ tasks: [...(project.tasks || []), { ...t, id: 't-' + Date.now() }] });
    setAddingTask(false);
    toast?.('Task added');
  }
  function updateTask(id, patch) {
    onUpdate({ tasks: (project.tasks || []).map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  }
  function removeTask(id) {
    onUpdate({ tasks: (project.tasks || []).filter((t) => t.id !== id) });
  }

  function addEquip(e) {
    onUpdate({ equipment: [...(project.equipment || []), { ...e, id: 'e-' + Date.now() }] });
    setAddingEquip(false);
    toast?.(`${e.name} added · R ${((Number(e.qty)||0)*(Number(e.unitCost)||0)).toLocaleString()}`);
  }
  function removeEquip(id) {
    onUpdate({ equipment: (project.equipment || []).filter((e) => e.id !== id) });
  }

  function addPerson(r) {
    onUpdate({ people: [...(project.people || []), { ...r, id: 'p-' + Date.now() }] });
    setAddingPerson(false);
    toast?.(`${r.name} added to project`);
  }
  function removePerson(id) {
    onUpdate({ people: (project.people || []).filter((r) => r.id !== id) });
  }

  return (
    <div>
      <div className="page-head">
        <div className="ph-left">
          <div className="ph-crumb">
            <button className="ph-crumb-back" onClick={onBack}>← Portfolio</button>
            {' '}· {meta.label}
          </div>
          <h1 className="ph-title">
            {meta.icon} {project.name}
          </h1>
          <p className="ph-desc">{project.description}</p>
        </div>
        <div className="ph-actions" style={{ alignItems: 'flex-start' }}>
          <select
            className="field-select"
            style={{ width: 150 }}
            value={project.status}
            onChange={(e) => onUpdate({ status: e.target.value })}
          >
            {PROJECT_STATUSES.map((s) => (<option key={s.key} value={s.key}>{s.label}</option>))}
          </select>
          <Btn tone="outline" size="sm" onClick={onRemove}>Archive</Btn>
        </div>
      </div>

      {/* Meta strip */}
      <div className="proj-meta">
        <div className="proj-meta-item">
          <span className="proj-meta-l">Owner</span>
          <span className="proj-meta-v">{project.owner}</span>
        </div>
        <div className="proj-meta-item">
          <span className="proj-meta-l">Timeline</span>
          <span className="proj-meta-v">
            {project.startDate ? new Date(project.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
            {' → '}
            {project.endDate ? new Date(project.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
          </span>
        </div>
        <div className="proj-meta-item">
          <span className="proj-meta-l">Budget</span>
          <span className="proj-meta-v">R {budget.toLocaleString()}</span>
        </div>
        <div className="proj-meta-item">
          <span className="proj-meta-l">Spend to date</span>
          <span className="proj-meta-v" style={{ color: spend > budget ? 'var(--coral)' : 'var(--ink)' }}>
            R {spend.toLocaleString()}
          </span>
        </div>
        <div className="proj-meta-item">
          <span className="proj-meta-l">Budget left</span>
          <span className="proj-meta-v" style={{ color: budgetLeft < 0 ? 'var(--coral)' : 'var(--green)' }}>
            R {budgetLeft.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Four-column layout */}
      <div className="proj-cols">
        {/* TASKS */}
        <div className="proj-col">
          <div className="proj-col-head">
            <div>
              <div className="proj-col-title">Tasks</div>
              <div className="proj-col-sub">
                {(project.tasks || []).filter((t) => t.status === 'done').length} of{' '}
                {(project.tasks || []).length} done
              </div>
            </div>
            <Btn tone="teal" size="sm" icon={Icon.Plus} onClick={() => setAddingTask(true)}>
              Task
            </Btn>
          </div>
          <div className="proj-col-body">
            {(project.tasks || []).length === 0 && (
              <div className="proj-col-empty">No tasks yet.</div>
            )}
            {(project.tasks || []).map((t) => (
              <div key={t.id} className={`proj-task proj-task-${t.status}`}>
                <div className="proj-task-top">
                  <select
                    className="proj-task-status"
                    value={t.status}
                    onChange={(e) => updateTask(t.id, { status: e.target.value })}
                  >
                    {TASK_STATUSES.map((s) => (<option key={s.key} value={s.key}>{s.label}</option>))}
                  </select>
                  <button className="proj-task-x" onClick={() => removeTask(t.id)}>×</button>
                </div>
                <div className="proj-task-title">{t.title}</div>
                <div className="proj-task-meta">
                  {t.assigneeName && <span>👤 {t.assigneeName}</span>}
                  {t.dueDate && (
                    <span>📅 {new Date(t.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EQUIPMENT */}
        <div className="proj-col">
          <div className="proj-col-head">
            <div>
              <div className="proj-col-title">Equipment</div>
              <div className="proj-col-sub">{(project.equipment || []).length} line items · R {equipCost.toLocaleString()}</div>
            </div>
            <Btn tone="teal" size="sm" icon={Icon.Plus} onClick={() => setAddingEquip(true)}>
              Item
            </Btn>
          </div>
          <div className="proj-col-body">
            {(project.equipment || []).length === 0 && (
              <div className="proj-col-empty">No equipment logged.</div>
            )}
            {(project.equipment || []).map((e) => {
              const line = (Number(e.qty)||0) * (Number(e.unitCost)||0);
              const vendor = e.vendorId ? VENDORS.find((v) => v.id === e.vendorId) : null;
              return (
                <div key={e.id} className="proj-equip">
                  <div className="proj-equip-top">
                    <div className="proj-equip-name">{e.name}</div>
                    <button className="proj-task-x" onClick={() => removeEquip(e.id)}>×</button>
                  </div>
                  <div className="proj-equip-meta">
                    <span>{e.qty} × R {Number(e.unitCost).toLocaleString()}</span>
                    <span className={`proj-src proj-src-${e.source}`}>
                      {e.source === 'internal' ? 'Internal store' : vendor?.name || 'Vendor'}
                    </span>
                  </div>
                  <div className="proj-equip-line">R {line.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PEOPLE */}
        <div className="proj-col">
          <div className="proj-col-head">
            <div>
              <div className="proj-col-title">People</div>
              <div className="proj-col-sub">{(project.people || []).length} on project · R {peopleCost.toLocaleString()}</div>
            </div>
            <Btn tone="teal" size="sm" icon={Icon.Plus} onClick={() => setAddingPerson(true)}>
              Person
            </Btn>
          </div>
          <div className="proj-col-body">
            {(project.people || []).length === 0 && (
              <div className="proj-col-empty">No one assigned yet.</div>
            )}
            {(project.people || []).map((r) => {
              const line = (Number(r.dailyRate)||0) * (Number(r.days)||0);
              return (
                <div key={r.id} className="proj-person">
                  <div className="proj-equip-top">
                    <div className="proj-equip-name">{r.name}</div>
                    <button className="proj-task-x" onClick={() => removePerson(r.id)}>×</button>
                  </div>
                  <div className="proj-person-role">{r.role}</div>
                  <div className="proj-equip-meta">
                    <span>R {Number(r.dailyRate).toLocaleString()}/d × {r.days}d</span>
                    <span className={`proj-src proj-src-${r.type === 'internal' ? 'internal' : 'vendor'}`}>
                      {r.type === 'internal' ? 'Lions office' : 'Vendor'}
                    </span>
                  </div>
                  <div className="proj-equip-line">R {line.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MONEY */}
        <div className="proj-col proj-col-money">
          <div className="proj-col-head">
            <div>
              <div className="proj-col-title">Money spent</div>
              <div className="proj-col-sub">Auto-computed from equipment + people</div>
            </div>
          </div>
          <div className="proj-col-body">
            <div className="proj-money-hero">
              <div className="proj-money-hero-l">Total spend</div>
              <div className="proj-money-hero-n">R {spend.toLocaleString()}</div>
              <div className="proj-money-hero-sub">of R {budget.toLocaleString()} budget</div>
            </div>
            <div className="proj-money-row">
              <span>🔧 Equipment</span>
              <strong>R {equipCost.toLocaleString()}</strong>
            </div>
            <div className="proj-money-row">
              <span>👤 People</span>
              <strong>R {peopleCost.toLocaleString()}</strong>
            </div>
            <div className="proj-money-row proj-money-row-total">
              <span>Budget left</span>
              <strong style={{ color: budgetLeft < 0 ? 'var(--coral)' : 'var(--green)' }}>
                R {budgetLeft.toLocaleString()}
              </strong>
            </div>
            <div className="proj-money-bar">
              <div
                className="proj-money-bar-fill"
                style={{
                  width: `${budget ? Math.min(100, (spend / budget) * 100) : 0}%`,
                  background: spend > budget ? 'var(--coral)' : spend / (budget || 1) > 0.8 ? 'var(--gold)' : 'var(--green)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {addingTask && ReactDOM.createPortal(
        <AddTaskModal onSubmit={addTask} onCancel={() => setAddingTask(false)} />,
        document.body
      )}
      {addingEquip && ReactDOM.createPortal(
        <AddEquipmentModal onSubmit={addEquip} onCancel={() => setAddingEquip(false)} />,
        document.body
      )}
      {addingPerson && ReactDOM.createPortal(
        <AddPersonModal onSubmit={addPerson} onCancel={() => setAddingPerson(false)} />,
        document.body
      )}
    </div>
  );
}

/* ─── AddProjectModal ─── */
function AddProjectModal({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [type, setType] = useState(PROJECT_TYPES[0].key);
  const [status, setStatus] = useState('planning');
  const [ownerId, setOwnerId] = useState(LIONS_OFFICE_STAFF[0].id);
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');

  const canSubmit = name.trim() && type;

  function submit() {
    if (!canSubmit) return;
    const owner = LIONS_OFFICE_STAFF.find((s) => s.id === ownerId);
    onSubmit({
      name: name.trim(),
      type,
      status,
      ownerId,
      owner: owner?.name || '',
      description: description.trim(),
      startDate: startDate || null,
      endDate: endDate || null,
      budget: Number(String(budget).replace(/[^\d.]/g, '')) || 0,
      notes: '',
    });
  }

  return (
    <div className="fix-confirm" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="fix-confirm-box jobmodal-box" style={{ maxWidth: 620 }}>
        <div className="fac-jobmodal-head">
          <div>
            <div className="fac-detail-eyebrow">Project portfolio</div>
            <div className="fac-jobmodal-title">New project</div>
          </div>
          <button className="fac-detail-close" onClick={onCancel}><Icon.X /></button>
        </div>
        <div className="fac-jobmodal-body">
          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Basics</div>
            <div>
              <label className="field-label">Project name <span className="req">*</span></label>
              <input
                className="field-input"
                placeholder="e.g. Umlazi Junior Programme · Q3"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field-grid-2" style={{ marginTop: 12 }}>
              <div>
                <label className="field-label">Type</label>
                <select className="field-select" value={type} onChange={(e) => setType(e.target.value)}>
                  {PROJECT_TYPES.map((t) => (<option key={t.key} value={t.key}>{t.icon} {t.label}</option>))}
                </select>
              </div>
              <div>
                <label className="field-label">Status</label>
                <select className="field-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  {PROJECT_STATUSES.map((s) => (<option key={s.key} value={s.key}>{s.label}</option>))}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="field-label">Owner (Lions office)</label>
              <select className="field-select" value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
                {LIONS_OFFICE_STAFF.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} · {s.role}</option>
                ))}
              </select>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="field-label">Description</label>
              <textarea
                className="field-textarea"
                rows={3}
                placeholder="What's the project, who benefits, what's the outcome?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Timeline &amp; budget</div>
            <div className="field-grid-2">
              <div>
                <label className="field-label">Start date</label>
                <input className="field-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="field-label">End date</label>
                <input className="field-input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="field-label">Budget (ZAR)</label>
              <input
                className="field-input"
                inputMode="decimal"
                placeholder="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="jobmodal-footer">
          <div className="jobmodal-footer-summary">
            <strong>{name || 'Unnamed project'}</strong> · {projectTypeMeta(type).label}
          </div>
          <div className="jobmodal-footer-actions">
            <Btn tone="outline" onClick={onCancel}>Cancel</Btn>
            <Btn tone="teal" icon={Icon.Check} onClick={submit} disabled={!canSubmit}>Create project</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── AddTaskModal ─── */
function AddTaskModal({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState(LIONS_OFFICE_STAFF[0].id);
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const canSubmit = title.trim();

  function submit() {
    if (!canSubmit) return;
    const assignee = LIONS_OFFICE_STAFF.find((s) => s.id === assigneeId);
    onSubmit({
      title: title.trim(),
      status,
      assigneeId,
      assigneeName: assignee?.name || '',
      dueDate: dueDate || null,
    });
  }

  return (
    <div className="fix-confirm" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="fix-confirm-box jobmodal-box" style={{ maxWidth: 520 }}>
        <div className="fac-jobmodal-head">
          <div>
            <div className="fac-detail-eyebrow">Task</div>
            <div className="fac-jobmodal-title">Add a task</div>
          </div>
          <button className="fac-detail-close" onClick={onCancel}><Icon.X /></button>
        </div>
        <div className="fac-jobmodal-body">
          <div className="jobmodal-step">
            <div>
              <label className="field-label">Task title <span className="req">*</span></label>
              <input
                className="field-input"
                placeholder="e.g. Confirm umpire panel briefing"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="field-grid-2" style={{ marginTop: 12 }}>
              <div>
                <label className="field-label">Assignee</label>
                <select className="field-select" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                  {LIONS_OFFICE_STAFF.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} · {s.role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Status</label>
                <select className="field-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  {TASK_STATUSES.map((s) => (<option key={s.key} value={s.key}>{s.label}</option>))}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="field-label">Due date</label>
              <input className="field-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="jobmodal-footer">
          <div className="jobmodal-footer-actions">
            <Btn tone="outline" onClick={onCancel}>Cancel</Btn>
            <Btn tone="teal" icon={Icon.Check} onClick={submit} disabled={!canSubmit}>Add task</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── AddEquipmentModal · internal or vendor-sourced ─── */
function AddEquipmentModal({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('1');
  const [unitCost, setUnitCost] = useState('');
  const [source, setSource] = useState('vendor');
  const [vendorQuery, setVendorQuery] = useState('');
  const [vendorId, setVendorId] = useState('');

  const availableVendors = useMemo(
    () => VENDORS.filter((v) => v.status === 'onboarded' || v.status === 'verified'),
    []
  );
  const filteredVendors = vendorQuery.trim()
    ? availableVendors.filter((v) =>
        (v.name + ' ' + v.category + ' ' + (v.services || []).join(' '))
          .toLowerCase()
          .includes(vendorQuery.toLowerCase())
      )
    : availableVendors;

  const parsedQty = Number(qty) || 0;
  const parsedCost = Number(String(unitCost).replace(/[^\d.]/g, '')) || 0;
  const line = parsedQty * parsedCost;
  const canSubmit = name.trim() && parsedQty > 0 && parsedCost > 0 && (source === 'internal' || vendorId);

  function submit() {
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      qty: parsedQty,
      unitCost: parsedCost,
      source,
      vendorId: source === 'vendor' ? vendorId : null,
    });
  }

  return (
    <div className="fix-confirm" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="fix-confirm-box jobmodal-box" style={{ maxWidth: 620 }}>
        <div className="fac-jobmodal-head">
          <div>
            <div className="fac-detail-eyebrow">Equipment</div>
            <div className="fac-jobmodal-title">Add equipment / kit</div>
          </div>
          <button className="fac-detail-close" onClick={onCancel}><Icon.X /></button>
        </div>
        <div className="fac-jobmodal-body">
          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Item</div>
            <div>
              <label className="field-label">Item name <span className="req">*</span></label>
              <input
                className="field-input"
                placeholder="e.g. Kookaburra Red match balls"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field-grid-2" style={{ marginTop: 12 }}>
              <div>
                <label className="field-label">Quantity</label>
                <input className="field-input" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} />
              </div>
              <div>
                <label className="field-label">Unit cost (ZAR)</label>
                <input className="field-input" inputMode="decimal" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Source</div>
            <div className="proj-src-toggle">
              <button
                className={`proj-src-choice ${source === 'internal' ? 'on' : ''}`}
                onClick={() => setSource('internal')}
              >
                🏠 Internal store
                <div className="proj-src-choice-sub">Use existing Lions stock</div>
              </button>
              <button
                className={`proj-src-choice ${source === 'vendor' ? 'on' : ''}`}
                onClick={() => setSource('vendor')}
              >
                🚚 External vendor
                <div className="proj-src-choice-sub">Order from a vendor</div>
              </button>
            </div>
            {source === 'vendor' && (
              <div style={{ marginTop: 14 }}>
                <label className="field-label">Search vendors</label>
                <input
                  className="field-input"
                  placeholder="Search name · category · service…"
                  value={vendorQuery}
                  onChange={(e) => setVendorQuery(e.target.value)}
                />
                <div className="proj-vendor-list">
                  {filteredVendors.slice(0, 8).map((v) => (
                    <button
                      key={v.id}
                      className={`proj-vendor-choice ${vendorId === v.id ? 'on' : ''}`}
                      onClick={() => setVendorId(v.id)}
                    >
                      <div className="proj-vendor-choice-l">
                        <div className="proj-vendor-choice-name">{v.name}</div>
                        <div className="proj-vendor-choice-cat">{v.category}</div>
                      </div>
                      {v.rating > 0 && (
                        <div className="proj-vendor-choice-r">⭐ {v.rating.toFixed(1)}</div>
                      )}
                    </button>
                  ))}
                  {filteredVendors.length === 0 && (
                    <div className="proj-col-empty">No vendors match.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="jobmodal-footer">
          <div className="jobmodal-footer-summary">
            <strong>R {line.toLocaleString()}</strong> total ·{' '}
            {parsedQty} × R {parsedCost.toLocaleString()}
          </div>
          <div className="jobmodal-footer-actions">
            <Btn tone="outline" onClick={onCancel}>Cancel</Btn>
            <Btn tone="teal" icon={Icon.Check} onClick={submit} disabled={!canSubmit}>Add item</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── AddPersonModal · internal Lions staff or external vendor ─── */
function AddPersonModal({ onSubmit, onCancel }) {
  const [type, setType] = useState('internal');
  const [staffId, setStaffId] = useState(LIONS_OFFICE_STAFF[0].id);
  const [vendorQuery, setVendorQuery] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [role, setRole] = useState('');
  const [dailyRate, setDailyRate] = useState(String(LIONS_OFFICE_STAFF[0].dailyRate));
  const [days, setDays] = useState('1');

  const availableVendors = useMemo(
    () => VENDORS.filter((v) => v.status === 'onboarded' || v.status === 'verified'),
    []
  );
  const filteredVendors = vendorQuery.trim()
    ? availableVendors.filter((v) =>
        (v.name + ' ' + v.category + ' ' + (v.services || []).join(' '))
          .toLowerCase()
          .includes(vendorQuery.toLowerCase())
      )
    : availableVendors;

  function pickStaff(id) {
    setStaffId(id);
    const s = LIONS_OFFICE_STAFF.find((x) => x.id === id);
    if (s) setDailyRate(String(s.dailyRate));
  }

  const parsedRate = Number(String(dailyRate).replace(/[^\d.]/g, '')) || 0;
  const parsedDays = Number(days) || 0;
  const line = parsedRate * parsedDays;

  const canSubmit =
    parsedRate > 0 && parsedDays > 0 &&
    (type === 'internal' ? !!staffId : !!vendorId) && role.trim();

  function submit() {
    if (!canSubmit) return;
    if (type === 'internal') {
      const s = LIONS_OFFICE_STAFF.find((x) => x.id === staffId);
      onSubmit({
        type: 'internal',
        staffId,
        name: s?.name || '',
        role: role.trim(),
        dailyRate: parsedRate,
        days: parsedDays,
      });
    } else {
      const v = VENDORS.find((x) => x.id === vendorId);
      onSubmit({
        type: 'vendor',
        vendorId,
        name: v?.name || '',
        role: role.trim(),
        dailyRate: parsedRate,
        days: parsedDays,
      });
    }
  }

  return (
    <div className="fix-confirm" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="fix-confirm-box jobmodal-box" style={{ maxWidth: 620 }}>
        <div className="fac-jobmodal-head">
          <div>
            <div className="fac-detail-eyebrow">People</div>
            <div className="fac-jobmodal-title">Add someone to the project</div>
          </div>
          <button className="fac-detail-close" onClick={onCancel}><Icon.X /></button>
        </div>
        <div className="fac-jobmodal-body">
          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Who is this?</div>
            <div className="proj-src-toggle">
              <button
                className={`proj-src-choice ${type === 'internal' ? 'on' : ''}`}
                onClick={() => setType('internal')}
              >
                🦁 Lions office
                <div className="proj-src-choice-sub">Pick from union staff</div>
              </button>
              <button
                className={`proj-src-choice ${type === 'vendor' ? 'on' : ''}`}
                onClick={() => setType('vendor')}
              >
                🚚 External vendor
                <div className="proj-src-choice-sub">Search vendor database</div>
              </button>
            </div>

            {type === 'internal' ? (
              <div style={{ marginTop: 14 }}>
                <label className="field-label">Lions office staff</label>
                <div className="proj-vendor-list">
                  {LIONS_OFFICE_STAFF.map((s) => (
                    <button
                      key={s.id}
                      className={`proj-vendor-choice ${staffId === s.id ? 'on' : ''}`}
                      onClick={() => pickStaff(s.id)}
                    >
                      <div className="proj-vendor-choice-l">
                        <div className="proj-vendor-choice-name">{s.name}</div>
                        <div className="proj-vendor-choice-cat">{s.role}</div>
                      </div>
                      <div className="proj-vendor-choice-r">R {s.dailyRate.toLocaleString()}/d</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 14 }}>
                <label className="field-label">Search vendors</label>
                <input
                  className="field-input"
                  placeholder="Search name · category · service…"
                  value={vendorQuery}
                  onChange={(e) => setVendorQuery(e.target.value)}
                />
                <div className="proj-vendor-list">
                  {filteredVendors.slice(0, 8).map((v) => (
                    <button
                      key={v.id}
                      className={`proj-vendor-choice ${vendorId === v.id ? 'on' : ''}`}
                      onClick={() => setVendorId(v.id)}
                    >
                      <div className="proj-vendor-choice-l">
                        <div className="proj-vendor-choice-name">{v.name}</div>
                        <div className="proj-vendor-choice-cat">{v.category}</div>
                      </div>
                      {v.rating > 0 && (
                        <div className="proj-vendor-choice-r">⭐ {v.rating.toFixed(1)}</div>
                      )}
                    </button>
                  ))}
                  {filteredVendors.length === 0 && (
                    <div className="proj-col-empty">No vendors match.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="jobmodal-step">
            <div className="jobmodal-step-eyebrow">Role &amp; cost</div>
            <div>
              <label className="field-label">Role on this project <span className="req">*</span></label>
              <input
                className="field-input"
                placeholder="e.g. Umpire panel · Marketing lead · Turf contractor"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
            <div className="field-grid-2" style={{ marginTop: 12 }}>
              <div>
                <label className="field-label">Daily rate (ZAR)</label>
                <input className="field-input" inputMode="decimal" value={dailyRate} onChange={(e) => setDailyRate(e.target.value)} />
              </div>
              <div>
                <label className="field-label">Days on project</label>
                <input className="field-input" inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
        <div className="jobmodal-footer">
          <div className="jobmodal-footer-summary">
            <strong>R {line.toLocaleString()}</strong> total ·{' '}
            {parsedDays}d × R {parsedRate.toLocaleString()}
          </div>
          <div className="jobmodal-footer-actions">
            <Btn tone="outline" onClick={onCancel}>Cancel</Btn>
            <Btn tone="teal" icon={Icon.Check} onClick={submit} disabled={!canSubmit}>Add person</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

export {
  AdminDashboard,
  AdminClubsList,
  AdminClubDetail,
  AdminFixtures,
  CreateSeriesForm,
  AdminClearances,
  AdminFacilities,
  AdminVendors,
  AdminProjects,
  // Shared with the club-side facilities view:
  AssessmentEditor,
  AddAssetModal,
  AssetCard,
  ConditionStars,
};
