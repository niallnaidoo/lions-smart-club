/* ─── Sample data ─── */

// Sub-unions / districts derived from the affiliation form's drop-down
const DISTRICTS = [
  'Ethekwini Metro Cricket Union',
  'Umkhanyakude Cricket District',
  'Ugu Cricket District',
  'KCCD',
  'Illembe Cricket District',
];

const LEAGUES = [
  'Premier League',
  'Promotion League',
  'Premier Women',
  'Promotion Women',
  'Veterans League',
  'EMCU Division 1',
  'EMCU Division 2',
  'EMCU Division 3',
];

const COACHING_LEVELS = ['Level 1', 'Level 2', 'Level 3', 'Level 4'];

// Required compliance documents (from KZNCU Club Requirements 26-27)
const REQUIRED_DOCS = [
  {
    key: 'constitution',
    name: 'Club Constitution',
    desc: 'Current signed club constitution document',
  },
  { key: 'agm', name: 'AGM Minutes', desc: 'Minutes of the most recent AGM, signed off' },
  {
    key: 'financials',
    name: 'Financial Statements',
    desc: 'Annual financial statements for the prior season',
  },
  {
    key: 'exco',
    name: 'Exco Reps Listed',
    desc: 'Full list of executive committee representatives with contact details',
  },
];

// Sample clubs — names drawn from the actual Lions CQI list
// Each carries denormalised submission state so the admin views can score them.
const SAMPLE_CLUBS = [
  {
    id: 'ukzn',
    name: 'UKZN CC',
    district: 'Ethekwini Metro CU',
    sub: 'EMCU',
    chair: 'Ashraf Ganie',
    affiliation: 'complete',
    paid: true,
    cqi: 91.89,
    docs: { constitution: true, agm: true, financials: true, exco: true },
    players: 57,
    teams: 3,
    women: 0,
    juniors: 0,
    color: '#1B2A4A',
    ground: { venue: 'Howard College Oval', suburb: 'Glenwood', lat: -29.8666, lon: 30.9783 },
  },
  {
    id: 'clares',
    name: 'Clares CC',
    district: 'Ethekwini Metro CU',
    sub: 'EMCU',
    chair: 'Rajin Ramsaroop',
    affiliation: 'complete',
    paid: true,
    cqi: 87.4,
    docs: { constitution: true, agm: true, financials: true, exco: false },
    players: 72,
    teams: 6,
    women: 1,
    juniors: 3,
    color: '#1D9E75',
    ground: { venue: 'Clares Cricket Field', suburb: 'Glenwood', lat: -29.8533, lon: 30.9512 },
  },
  {
    id: 'chatsworth',
    name: 'Chatsworth Sporting CC',
    district: 'Ethekwini Metro CU',
    sub: 'EMCU',
    chair: 'Jason Sathiaseelan',
    affiliation: 'complete',
    paid: true,
    cqi: 81.2,
    docs: { constitution: true, agm: true, financials: false, exco: true },
    players: 114,
    teams: 10,
    women: 1,
    juniors: 3,
    color: '#C8A84B',
    ground: {
      venue: 'Chatsworth Sports Ground',
      suburb: 'Chatsworth',
      lat: -29.9112,
      lon: 30.8868,
    },
  },
  {
    id: 'umlazi',
    name: 'Umlazi CC',
    district: 'Ethekwini Metro CU',
    sub: 'EMCU',
    chair: 'Simphiwe Shangase',
    affiliation: 'complete',
    paid: true,
    cqi: 64.8,
    docs: { constitution: true, agm: false, financials: false, exco: true },
    players: 58,
    teams: 6,
    women: 1,
    juniors: 3,
    color: '#D85A30',
    ground: { venue: 'Umlazi Comtech Ground', suburb: 'Umlazi', lat: -29.9678, lon: 30.8842 },
  },
  {
    id: 'crusaders',
    name: 'Crusaders CC',
    district: 'Ethekwini Metro CU',
    sub: 'EMCU',
    chair: 'Duncun Miller',
    affiliation: 'complete',
    paid: true,
    cqi: 78.5,
    docs: { constitution: true, agm: true, financials: true, exco: true },
    players: 88,
    teams: 9,
    women: 1,
    juniors: 3,
    color: '#2E4070',
    ground: { venue: 'Crusaders Park', suburb: 'Durban North', lat: -29.7956, lon: 31.0356 },
  },
  {
    id: 'berea',
    name: 'Berea Rovers CC',
    district: 'Ethekwini Metro CU',
    sub: 'EMCU',
    chair: 'Wayne Scott',
    affiliation: 'in_progress',
    paid: false,
    cqi: 0,
    docs: { constitution: false, agm: false, financials: false, exco: false },
    players: 0,
    teams: 3,
    women: 0,
    juniors: 1,
    color: '#243356',
    ground: { venue: 'Berea Rovers Oval', suburb: 'Berea', lat: -29.8348, lon: 31.005 },
  },
  {
    id: 'rhythm',
    name: 'Rhythm DHSOB CC',
    district: 'Ethekwini Metro CU',
    sub: 'EMCU',
    chair: 'Mags Reddy',
    affiliation: 'complete',
    paid: true,
    cqi: 68.4,
    docs: { constitution: true, agm: false, financials: true, exco: true },
    players: 92,
    teams: 9,
    women: 1,
    juniors: 1,
    color: '#1D9E75',
    ground: { venue: 'DHS Old Boys Field', suburb: 'Stamford Hill', lat: -29.8205, lon: 31.0009 },
  },
  {
    id: 'warriors',
    name: 'African Warriors CC',
    district: 'Ethekwini Metro CU',
    sub: 'EMCU',
    chair: 'Knowledge Vilakazi',
    affiliation: 'complete',
    paid: true,
    cqi: 72.1,
    docs: { constitution: true, agm: true, financials: false, exco: true },
    players: 64,
    teams: 5,
    women: 2,
    juniors: 3,
    color: '#1B2A4A',
    ground: { venue: 'KwaMashu K-Section Ground', suburb: 'KwaMashu', lat: -29.7311, lon: 30.9876 },
  },
  {
    id: 'phoenix',
    name: 'Phoenix CC',
    district: 'Ethekwini Metro CU',
    sub: 'EMCU',
    chair: 'Bradley Chetty',
    affiliation: 'not_started',
    paid: false,
    cqi: 0,
    docs: { constitution: false, agm: false, financials: false, exco: false },
    players: 0,
    teams: 6,
    women: 0,
    juniors: 2,
    color: '#C8A84B',
    ground: { venue: 'Phoenix Sports Complex', suburb: 'Phoenix', lat: -29.7003, lon: 31.0214 },
  },
  {
    id: 'verulam',
    name: 'Verulam CC',
    district: 'Ethekwini Metro CU',
    sub: 'Verulam',
    chair: 'Kugan Subrayen',
    affiliation: 'in_progress',
    paid: false,
    cqi: 38.5,
    docs: { constitution: true, agm: false, financials: false, exco: false },
    players: 21,
    teams: 1,
    women: 0,
    juniors: 2,
    color: '#D85A30',
    ground: { venue: 'Verulam Sports Field', suburb: 'Verulam', lat: -29.6411, lon: 31.0498 },
  },
  {
    id: 'harlequins',
    name: 'Harlequins CC',
    district: 'Ethekwini Metro CU',
    sub: 'EMCU',
    chair: 'Eric Cavanagh',
    affiliation: 'complete',
    paid: true,
    cqi: 84.2,
    docs: { constitution: true, agm: true, financials: true, exco: true },
    players: 96,
    teams: 10,
    women: 0,
    juniors: 2,
    color: '#1D9E75',
    ground: { venue: 'Kingsmead North', suburb: 'Stamford Hill', lat: -29.8195, lon: 31.0308 },
  },
  {
    id: 'spartan',
    name: 'Spartan Sporting CC',
    district: 'Ethekwini Metro CU',
    sub: 'EMCU',
    chair: 'Shafee Ayob',
    affiliation: 'complete',
    paid: true,
    cqi: 56.3,
    docs: { constitution: true, agm: true, financials: false, exco: false },
    players: 38,
    teams: 5,
    women: 0,
    juniors: 2,
    color: '#2E4070',
    ground: { venue: 'Spartan Park', suburb: 'Mount Edgecombe', lat: -29.7256, lon: 31.0489 },
  },
  {
    id: 'ilembe',
    name: 'Ilembe CC',
    district: 'Illembe Cricket District',
    sub: 'Ilembe',
    chair: 'Naren Singh',
    affiliation: 'complete',
    paid: true,
    cqi: 47.6,
    docs: { constitution: true, agm: false, financials: true, exco: false },
    players: 28,
    teams: 2,
    women: 0,
    juniors: 0,
    color: '#8A6E1C',
    ground: { venue: 'KwaDukuza Stadium', suburb: 'KwaDukuza', lat: -29.3398, lon: 31.281 },
  },
  {
    id: 'tongaat',
    name: 'Tongaat CC',
    district: 'Ethekwini Metro CU',
    sub: 'Tongaat',
    chair: 'Praven Govender',
    affiliation: 'not_started',
    paid: false,
    cqi: 0,
    docs: { constitution: false, agm: false, financials: false, exco: false },
    players: 0,
    teams: 1,
    women: 0,
    juniors: 1,
    color: '#D85A30',
    ground: { venue: 'Tongaat Sports Field', suburb: 'Tongaat', lat: -29.5783, lon: 31.1149 },
  },
];

// CQI structure — categories, weights, and questions
// Weighting model: Admin 20 / Teams 20 / Coaching 20 / Facilities 15 / Representation 10 / Financial 15 = 100
const CQI_STRUCTURE = [
  {
    key: 'admin',
    title: 'Administration',
    weight: 20,
    accent: 'var(--navy)',
    desc: 'Governance, documentation and structural compliance.',
    questions: [
      { key: 'constitution', label: 'Club has a current Constitution', kind: 'yn', pts: 4 },
      { key: 'conduct', label: 'Code of Conduct is in place', kind: 'yn', pts: 3 },
      { key: 'inventory', label: 'General Admin Inventory maintained', kind: 'yn', pts: 3 },
      { key: 'agm', label: 'AGM conducted at least once a year', kind: 'yn', pts: 4 },
      { key: 'officers', label: 'Chairperson, Secretary & Treasurer in place', kind: 'yn', pts: 4 },
      { key: 'minutes', label: 'Minutes of AGM available', kind: 'yn', pts: 4 },
      { key: 'playerdb', label: 'Player database available', kind: 'yn', pts: 3 },
    ],
  },
  {
    key: 'teams',
    title: 'Teams',
    weight: 20,
    accent: 'var(--teal)',
    desc: 'Squad depth across senior, women and junior structures.',
    questions: [
      {
        key: 'premprom',
        label: '1st Team plays in Premier or Promotion league',
        kind: 'yn',
        pts: 5,
      },
      { key: 'senior', label: 'Number of Senior Teams', kind: 'num', max: 12, pts: 8 },
      { key: 'women', label: "Number of Women's Teams", kind: 'num', max: 6, pts: 6 },
      { key: 'juniorB', label: 'Number of Junior Boys Teams', kind: 'num', max: 8, pts: 3 },
      { key: 'juniorG', label: 'Number of Junior Girls Teams', kind: 'num', max: 6, pts: 3 },
    ],
  },
  {
    key: 'coaching',
    title: 'Coaching',
    weight: 20,
    accent: 'var(--gold)',
    desc: 'Coach-to-team ratio and accreditation levels.',
    questions: [
      { key: 'coaches', label: 'Total Coaches at the club', kind: 'num', max: 20, pts: 8 },
      { key: 'certified', label: 'Number of Certified Coaches', kind: 'num', max: 20, pts: 8 },
      { key: 'level2', label: '1st Team coach is Level 2 or above', kind: 'yn', pts: 9 },
    ],
  },
  {
    key: 'facilities',
    title: 'Facilities',
    weight: 15,
    accent: 'var(--coral)',
    desc: 'Playing fields, nets, covers, machines and venue ownership. Sourced by the club during CQI submission; drives the Facility Management dashboard.',
    questions: [
      // Pitch / field
      { key: 'fieldsGrass', label: 'Number of Grass fields', kind: 'num', max: 10, pts: 2 },
      { key: 'fieldsArt', label: 'Number of Artificial fields', kind: 'num', max: 10, pts: 1 },
      { key: 'ownFacility', label: 'Responsible for own facility', kind: 'yn', pts: 1 },
      // Covers
      { key: 'covers', label: 'Square covers available', kind: 'yn', pts: 2 },
      // Nets
      { key: 'netsGrass', label: 'Number of Grass nets', kind: 'num', max: 12, pts: 2 },
      { key: 'netsArt', label: 'Number of Artificial nets', kind: 'num', max: 12, pts: 1 },
      { key: 'netsIndoor', label: 'Number of Indoor nets', kind: 'num', max: 8, pts: 1 },
      // Bowling + support kit
      { key: 'bowlingMachines', label: 'Number of Bowling machines', kind: 'num', max: 4, pts: 2 },
      { key: 'sightscreens', label: 'Sightscreens installed both ends', kind: 'yn', pts: 1 },
      { key: 'boundary', label: 'Adequate boundary rope available', kind: 'yn', pts: 1 },
      { key: 'scoreboard', label: 'Scoreboard available', kind: 'yn', pts: 1 },
    ],
  },
  {
    key: 'representation',
    title: 'Representation',
    weight: 10,
    accent: 'var(--navy-light)',
    desc: 'Player demographics across the club (must sum to 100%).',
    questions: [
      { key: 'pctBA', label: '% Black African', kind: 'pct', pts: 4 },
      { key: 'pctIN', label: '% Indian', kind: 'pct', pts: 2 },
      { key: 'pctCO', label: '% Coloured', kind: 'pct', pts: 2 },
      { key: 'pctWH', label: '% White', kind: 'pct', pts: 2 },
    ],
  },
  {
    key: 'financial',
    title: 'Financial Sustainability',
    weight: 15,
    accent: 'var(--green)',
    desc: 'Member subscriptions and monetary sponsorships keeping the club running.',
    questions: [
      {
        key: 'subCycle',
        label: 'Subscription cycle',
        kind: 'choice',
        options: ['Annual', 'Seasonal'],
        pts: 2,
      },
      {
        key: 'subAmount',
        label: 'Subscription cost per member',
        kind: 'money',
        currency: 'R',
        pts: 4,
      },
      { key: 'sponsors', label: 'Number of monetary sponsors', kind: 'num', max: 10, pts: 9 },
    ],
  },
];

// Aggregate stats helpers
function cohortStats(clubs) {
  const total = clubs.length;
  const affComplete = clubs.filter((c) => c.affiliation === 'complete').length;
  const paid = clubs.filter((c) => c.paid).length;
  const cqiSubmitted = clubs.filter((c) => c.cqi > 0).length;
  const avgCqi =
    clubs.filter((c) => c.cqi > 0).reduce((s, c) => s + c.cqi, 0) / Math.max(1, cqiSubmitted);
  const docsComplete = clubs.filter((c) => Object.values(c.docs).every((v) => v)).length;
  return { total, affComplete, paid, cqiSubmitted, avgCqi, docsComplete };
}

function docCompletion(club) {
  const vals = Object.values(club.docs);
  return Math.round((vals.filter((v) => v).length / vals.length) * 100);
}

function overallProgress(club) {
  // 5 weighted phases: 20% each
  const p1 = club.paid ? 100 : club.affiliation === 'in_progress' ? 40 : 0;
  const p2 = club.affiliation === 'complete' ? 100 : 0; // assume league assigned once affiliated
  const p3 = Math.min(100, ((club.players || 0) / 60) * 100);
  const p4 = club.cqi > 60 ? 100 : club.cqi > 0 ? 50 : 0;
  const p5 = docCompletion(club);
  return Math.round((p1 + p2 + p3 + p4 + p5) / 5);
}

/* ─── FIXTURE GENERATION + TRAVEL COSTS ───
   Haversine great-circle distance between two lat/lon coords (km).
   Round-robin schedule generator.
   Travel cost = round-trip distance × cars × cost per km. */
function haversineKm(a, b) {
  if (!a || !b) return 0;
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function fixtureCost(homeClub, awayClub, costPerKm = 4.5, cars = 3) {
  const km = haversineKm(homeClub.ground, awayClub.ground);
  const roundTripKm = km * 2;
  const fuelR = roundTripKm * cars * costPerKm;
  return { distanceKm: km, roundTripKm, cars, costPerKm, fuelR };
}

// Round-robin: each team plays every other team once. Home/away alternates fairly.
function generateRoundRobin(teamIds, startDateISO) {
  if (teamIds.length < 2) return [];
  const teams = [...teamIds];
  if (teams.length % 2 === 1) teams.push(null); // bye
  const n = teams.length;
  const rounds = n - 1;
  const start = new Date(startDateISO);
  const fixtures = [];
  let fixtureId = 1;
  for (let r = 0; r < rounds; r++) {
    const matchDate = new Date(start.getTime() + r * 7 * 86400000); // weekly rounds
    for (let i = 0; i < n / 2; i++) {
      const home = teams[i],
        away = teams[n - 1 - i];
      if (!home || !away) continue;
      // Alternate home/away by round so it's fair
      const swap = r % 2 === 1;
      fixtures.push({
        id: 'f' + fixtureId++,
        round: r + 1,
        date: matchDate.toISOString().slice(0, 10),
        home: swap ? away : home,
        away: swap ? home : away,
      });
    }
    // Rotate teams (keep teams[0] fixed)
    const fixed = teams[0];
    const rest = teams.slice(1);
    rest.unshift(rest.pop());
    teams.splice(0, teams.length, fixed, ...rest);
  }
  return fixtures;
}

// One pre-made series so the admin lands on populated content
const _premierTeams = [
  'ukzn',
  'clares',
  'chatsworth',
  'crusaders',
  'rhythm',
  'harlequins',
  'warriors',
  'umlazi',
];
const SERIES = [
  {
    id: 's-prem-26-27',
    name: 'Premier League · 2026/27',
    startDate: '2026-08-01',
    divisions: false,
    groups: 1,
    maxOvers: 50,
    maxPlayers: 11,
    rosterLimit: 18,
    ballType: 'Cricket Ball',
    seriesType: 'One-Day (40-50 overs)',
    powerPlay: true,
    category: 'Men',
    level: 'Club',
    winPoints: 4,
    bonusPoints: 1,
    lossPoints: 0,
    tiePoints: 2,
    abandonedPoints: 1,
    ballsPerOver: 6,
    maxBallsPerOver: 8,
    minLeagueMatches: 2,
    configureExtras: false,
    lockAfterLive: true,
    lockAfterManual: true,
    preventTeamSwitch: true,
    umpireReportsMandatory: true,
    captainReportsMandatory: true,
    sendReportEmails: true,
    rankCalculator: 'New',
    hideSeriesDetails: false,
    allowLockedRegistration: false,
    pointsTableOrder: ['Most Points', 'NRR', 'Head To Head', 'Number of Wins', 'Win Percentage'],
    tags: ['Premier', 'Men', 'Round-robin'],
    teams: _premierTeams,
    costPerKm: 4.5,
    carsPerAwayTrip: 3,
    released: false,
    releasedAt: null,
    fixtures: generateRoundRobin(_premierTeams, '2026-08-02'),
  },
  {
    id: 's-prom-26-27',
    name: 'Promotion League · 2026/27',
    startDate: '2026-08-08',
    divisions: false,
    groups: 1,
    maxOvers: 50,
    maxPlayers: 11,
    rosterLimit: 18,
    ballType: 'Cricket Ball',
    seriesType: 'One-Day (40-50 overs)',
    powerPlay: true,
    category: 'Men',
    level: 'Club',
    winPoints: 4,
    bonusPoints: 1,
    lossPoints: 0,
    tiePoints: 2,
    abandonedPoints: 1,
    ballsPerOver: 6,
    maxBallsPerOver: 8,
    minLeagueMatches: 2,
    configureExtras: false,
    lockAfterLive: true,
    lockAfterManual: true,
    preventTeamSwitch: true,
    umpireReportsMandatory: false,
    captainReportsMandatory: true,
    sendReportEmails: true,
    rankCalculator: 'New',
    hideSeriesDetails: false,
    allowLockedRegistration: false,
    pointsTableOrder: ['Most Points', 'NRR', 'Head To Head', 'Number of Wins', 'Win Percentage'],
    tags: ['Promotion', 'Men'],
    teams: ['spartan', 'ilembe', 'verulam', 'tongaat'],
    costPerKm: 4.5,
    carsPerAwayTrip: 3,
    released: false,
    releasedAt: null,
    fixtures: generateRoundRobin(['spartan', 'ilembe', 'verulam', 'tongaat'], '2026-08-08'),
  },
];

/* ─── Player registration + clearance model ─── */

const BATTING_TYPES = ['Top Order', 'Mid Order', 'Low Order', 'WK Batsman', 'Bat All Round'];
const BOWLER_TYPES = ['Fast', 'Medium Fast', 'Medium', 'Slow', 'Finger Spin', 'Wrist Spin'];
const HANDS = ['Right', 'Left'];

const SAMPLE_PLAYERS = [
  {
    id: 'ply-001',
    clubId: 'phoenix',
    surname: 'Gangadu',
    firstNames: 'Wishalen',
    idNumber: '9112205243086',
    dob: '1991-12-20',
    race: 'Indian',
    gender: 'Male',
    postalAddress: '67 Fiona Street, Mobeni Heights',
    postalCode: '4092',
    phone: '065 299 1365',
    email: 'wishalen.gangadu@example.com',
    team: 'Promotion Men',
    district: 'Chatsworth',
    lastClub: 'Topham',
    battingHand: 'Right',
    battingType: 'Mid Order',
    bowlingHand: 'Right',
    isAllRounder: true,
    isWk: false,
    bowlerType: 'Medium Fast',
    idDocumentName: 'WGangadu_ID.pdf',
    idDocumentUploaded: true,
    registeredAt: '2026-04-12',
    status: 'active',
  },
  {
    id: 'ply-002',
    clubId: 'phoenix',
    surname: 'Naicker',
    firstNames: 'Rishav',
    idNumber: '9805124081089',
    dob: '1998-05-12',
    race: 'Indian',
    gender: 'Male',
    postalAddress: '12 Northway, Phoenix',
    postalCode: '4068',
    phone: '078 421 5560',
    email: 'r.naicker@example.com',
    team: 'Premier Men',
    district: 'Phoenix',
    lastClub: '—',
    battingHand: 'Right',
    battingType: 'Top Order',
    bowlingHand: 'Right',
    isAllRounder: false,
    isWk: true,
    bowlerType: '',
    idDocumentName: 'RNaicker_ID.pdf',
    idDocumentUploaded: true,
    registeredAt: '2026-03-04',
    status: 'clearance-pending',
  },
  {
    id: 'ply-003',
    clubId: 'ukzn',
    surname: 'Mthembu',
    firstNames: 'Sanele',
    idNumber: '0107224082088',
    dob: '2001-07-22',
    race: 'African',
    gender: 'Male',
    postalAddress: 'Howard College Res, Glenwood',
    postalCode: '4001',
    phone: '082 901 4421',
    email: 's.mthembu@ukzn.ac.za',
    team: 'Premier Men',
    district: 'Ethekwini Metro',
    lastClub: '—',
    battingHand: 'Left',
    battingType: 'Top Order',
    bowlingHand: 'Right',
    isAllRounder: false,
    isWk: false,
    bowlerType: 'Finger Spin',
    idDocumentName: 'SMthembu_ID.pdf',
    idDocumentUploaded: true,
    registeredAt: '2026-02-18',
    status: 'clearance-pending',
  },
  {
    id: 'ply-004',
    clubId: 'berea',
    surname: 'Pillay',
    firstNames: 'Devan',
    idNumber: '9407184562084',
    dob: '1994-07-18',
    race: 'Indian',
    gender: 'Male',
    postalAddress: '44 Manning Rd, Berea',
    postalCode: '4001',
    phone: '071 320 9914',
    email: 'd.pillay@example.com',
    team: 'Premier Men',
    district: 'Ethekwini Metro',
    lastClub: '—',
    battingHand: 'Right',
    battingType: 'Mid Order',
    bowlingHand: 'Right',
    isAllRounder: true,
    isWk: false,
    bowlerType: 'Fast',
    idDocumentName: 'DPillay_ID.pdf',
    idDocumentUploaded: true,
    registeredAt: '2026-04-21',
    status: 'active',
  },
  {
    id: 'ply-005',
    clubId: 'phoenix',
    surname: 'Govender',
    firstNames: 'Ashlin',
    idNumber: '0203145012083',
    dob: '2002-03-14',
    race: 'Indian',
    gender: 'Male',
    postalAddress: '8 Newleaf Cres, Mount Edgecombe',
    postalCode: '4302',
    phone: '076 514 2208',
    email: 'a.govender@example.com',
    team: 'Premier Men',
    district: 'Phoenix',
    lastClub: '—',
    battingHand: 'Right',
    battingType: 'Low Order',
    bowlingHand: 'Left',
    isAllRounder: false,
    isWk: false,
    bowlerType: 'Slow',
    idDocumentName: 'AGovender_ID.pdf',
    idDocumentUploaded: true,
    registeredAt: '2026-04-29',
    status: 'active',
  },
];

// Two clearance requests so we can demo both states:
//   clr-001 → fresh (5 days ago, within 14-day club window)
//   clr-002 → overdue (21 days ago, Lions admin can override)
const SAMPLE_CLEARANCE_REQUESTS = [
  {
    id: 'clr-001',
    playerId: 'ply-002',
    fromClubId: 'phoenix', // current club (must approve)
    toClubId: 'crusaders', // destination
    requestedAt: '2026-05-31',
    feesCleared: false,
    misconductCleared: false,
    clubApprovedAt: null,
    adminOverrideAt: null,
    status: 'pending',
    note: 'Player relocating to Westville — wants to play out of Crusaders for 2026/27.',
  },
  {
    id: 'clr-002',
    playerId: 'ply-003',
    fromClubId: 'ukzn',
    toClubId: 'rhythm',
    requestedAt: '2026-05-15',
    feesCleared: false,
    misconductCleared: false,
    clubApprovedAt: null,
    adminOverrideAt: null,
    status: 'pending',
    note: 'Graduated UKZN, joining Rhythm DHSOB — UKZN unresponsive for 3+ weeks.',
  },
];

// Helpers
function daysBetween(a, b) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.floor(ms / 86400000);
}
function clearanceDaysElapsed(req) {
  // Pretend "today" is 2026-06-05 so the seed dates produce predictable demo state
  return daysBetween(req.requestedAt, '2026-06-05');
}
function isClearanceOverdue(req, deadlineDays = 14) {
  if (req.status !== 'pending') return false;
  return clearanceDaysElapsed(req) >= deadlineDays;
}
function clearanceDaysRemaining(req, deadlineDays = 14) {
  return Math.max(0, deadlineDays - clearanceDaysElapsed(req));
}

/* ─── Facilities · VINIS-style satellite intelligence + compliance ───
   Per-ground metadata that layers on top of SAMPLE_CLUBS[i].ground.
   VINIS = ND-vegetation-derived turf-condition score (0-100).
   Distance is from the Lions provincial stadium (Wanderers, Jhb).
   Data model mirrors the Groundskeeper reference UI: score, condition
   word (Lush / Healthy / Adequate / Stressed / Bare), 5-year mean,
   yearly trend, area (hectares), 12-month seasonal profile, and a
   5-year composite condition series for the sparkline / line chart. */

const LIONS_HQ = {
  name: 'Wanderers Stadium',
  city: 'Johannesburg',
  lat: -26.1815,
  lon: 28.053,
};

// Turf condition word ladder — matches Groundskeeper's semantics.
function vinisCondition(score) {
  if (score >= 75) return 'Lush';
  if (score >= 60) return 'Healthy';
  if (score >= 45) return 'Adequate';
  if (score >= 30) return 'Stressed';
  return 'Bare';
}

// Compliance banding: cross-cuts docs + affiliation into a single score.
function complianceScore(club) {
  const docCount = Object.values(club.docs || {}).filter(Boolean).length;
  const docPct = (docCount / 4) * 60; // 4 docs → 60 pts max
  const affPts = club.paid ? 25 : club.affiliation === 'in_progress' ? 10 : 0;
  const cqiPts = Math.min(15, ((club.cqi || 0) / 100) * 15);
  return Math.round(docPct + affPts + cqiPts);
}
function complianceBand(score) {
  if (score >= 85) return 'Compliant';
  if (score >= 65) return 'Partial';
  if (score >= 40) return 'At risk';
  return 'Non-compliant';
}

// Deterministic pseudo-random from a string seed — so seeded facilities
// data is stable across reloads without a rand call in module scope.
function seededRand(seed, salt = 0) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  h = (h ^ (h >>> 16)) >>> 0;
  return (h % 10000) / 10000;
}

// Attach VINIS + compliance + distance to every club ground.
const FACILITIES = SAMPLE_CLUBS.map((club) => {
  const r = (salt) => seededRand(club.id, salt);
  // Base score anchors — CQI-heavy clubs get slightly better turf on average.
  const base = 50 + (club.cqi ? (club.cqi - 60) * 0.35 : 0) + (r(1) - 0.5) * 20;
  const score = Math.max(18, Math.min(92, Math.round(base * 10) / 10));
  const trend = Math.round((r(2) - 0.4) * 6 * 100) / 100; // ±3.6/yr, biased up
  const mean5y = Math.round((score - trend * 2 + (r(3) - 0.5) * 6) * 100) / 100;
  const areaHa = Math.round((0.02 + r(4) * 0.14) * 100) / 100;
  const distanceKm = haversineKm(LIONS_HQ, club.ground);

  // 12-month seasonal profile — Highveld cricket-season shape (dry Jul-Sep, wet Nov-Mar)
  const seasonBias = [1.05, 1.02, 0.95, 1.0, 0.9, 0.7, 0.55, 0.5, 0.55, 0.75, 1.0, 1.1];
  const monthly = seasonBias.map((b) => Math.max(15, Math.round(score * b + (r(10 + b * 3) - 0.5) * 10)));

  // 5-year composite condition series (yearly average points, oldest → newest)
  const years5 = [0, 1, 2, 3, 4, 5].map((i) => ({
    year: 2021 + i,
    score: Math.max(20, Math.round(mean5y + trend * i + (r(20 + i) - 0.5) * 8)),
  }));

  const cScore = complianceScore(club);

  return {
    clubId: club.id,
    clubName: club.name,
    clubShort: club.short || club.name.split(' ')[0],
    venue: club.ground.venue,
    suburb: club.ground.suburb,
    lat: club.ground.lat,
    lon: club.ground.lon,
    // VINIS field health
    score,
    condition: vinisCondition(score),
    mean5y,
    trendPerYear: trend,
    areaHa,
    lastObserved: '2026-05-20',
    daysAgo: 16,
    monthly,
    years5,
    // Compliance
    compliance: cScore,
    complianceBand: complianceBand(cScore),
    // Distance from Lions HQ (Wanderers)
    distanceKm,
    // Context — Groundskeeper-style
    nearMallKm: Math.round((2 + r(30) * 8) * 10) / 10,
    nearHospitalKm: Math.round((1.5 + r(31) * 10) * 10) / 10,
    nearMajorRoadKm: Math.round((0.3 + r(32) * 3) * 100) / 100,
    builtUp: r(33) > 0.35,
    // Type (school / club / uni) — reuse Groundskeeper's ladder
    type:
      club.id === 'ukzn'
        ? 'University'
        : r(40) > 0.85
          ? 'Primary/High School'
          : r(40) > 0.6
            ? 'Combined School'
            : 'Cricket Club',
  };
});

/* ─── Facility management: jobs, load, ownership ─── */

// Job types the admin can dispatch to a groundskeeper
const JOB_TYPES = [
  {
    key: 'pitch-prep',
    label: 'Pitch preparation',
    icon: '◇',
    checklist: [
      'Confirm fixture list for the week',
      'Water pitch square to depth',
      'Roll with 1-tonne roller',
      'Mow to 12mm',
      'Apply pre-match line marking',
    ],
  },
  {
    key: 'grass-cutting',
    label: 'Grass cutting · outfield',
    icon: '≣',
    checklist: [
      'Mow outfield to 18mm',
      'Trim boundary edge to 12mm',
      'Collect + dispose of clippings',
    ],
  },
  {
    key: 'top-soil',
    label: 'Top soil / re-turfing',
    icon: '▤',
    checklist: [
      'Assess bare patches on pitch square',
      'Rake and level worn areas',
      'Apply top-soil dressing (loamy)',
      'Reseed with kikuyu blend',
      'Water and cordon off for 14 days',
    ],
  },
  {
    key: 'rolling',
    label: 'Rolling / consolidation',
    icon: '◉',
    checklist: [
      'Check moisture reading (target 22-26%)',
      'Roll square with 1-tonne',
      'Cross-roll at 45°',
      'Roll ends 3x each',
    ],
  },
  {
    key: 'boundary-rope',
    label: 'Boundary rope / gullies',
    icon: '○',
    checklist: [
      'Inspect rope for wear',
      'Measure boundary distances',
      'Fix loose pegs',
      'Rake/cover rain gullies',
    ],
  },
  {
    key: 'nets',
    label: 'Practice nets maintenance',
    icon: '⌗',
    checklist: [
      'Inspect net panels for tears',
      'Tighten mesh attachments',
      'Check pitch-mat condition',
      'Sweep and clear debris',
    ],
  },
  {
    key: 'sightscreen',
    label: 'Sightscreen / boundary boards',
    icon: '▤',
    checklist: [
      'Inspect sightscreen wheels',
      'Repaint if faded',
      'Test rolling movement',
    ],
  },
  {
    key: 'drainage',
    label: 'Drainage / covers',
    icon: '⇩',
    checklist: [
      'Inspect drain covers',
      'Clear leaves / debris',
      'Test rain-covers roll out',
      'Assess sub-surface saturation',
    ],
  },
  {
    key: 'other',
    label: 'Other',
    icon: '⌂',
    checklist: [],
  },
];

// Groundstaff pool — assigned to each facility by clubId below.
const GROUNDSTAFF = [
  { id: 'gs-sipho',    name: 'Sipho Dlamini',    role: 'Head Groundsman', phone: '083 421 5502', years: 8 },
  { id: 'gs-nkosi',    name: 'Nkosinathi Zulu',  role: 'Assistant',       phone: '072 991 4408', years: 3 },
  { id: 'gs-anwar',    name: 'Anwar Naidoo',     role: 'Curator',         phone: '076 552 3399', years: 12 },
  { id: 'gs-thabo',    name: 'Thabo Mokoena',    role: 'Curator',         phone: '082 300 1156', years: 6 },
  { id: 'gs-lerato',   name: 'Lerato Khumalo',   role: 'Assistant',       phone: '074 128 6631', years: 2 },
  { id: 'gs-ravi',     name: 'Ravi Chetty',      role: 'Head Groundsman', phone: '083 001 7788', years: 14 },
  { id: 'gs-jabu',     name: 'Jabu Mchunu',      role: 'Assistant',       phone: '071 444 9002', years: 4 },
  { id: 'gs-yolanda',  name: 'Yolanda Naicker',  role: 'Curator',         phone: '079 812 4457', years: 9 },
];

// Ownership + staffing per facility (facilityId = clubId)
const FACILITY_OWNERSHIP = FACILITIES.reduce((acc, f) => {
  const r = seededRand(f.clubId, 100);
  const ownership = f.clubId === 'ukzn' ? 'university' : r > 0.6 ? 'club' : r > 0.3 ? 'municipality' : 'shared';
  const ownerLabelMap = {
    club: `${f.clubName} Executive`,
    municipality: 'eThekwini Metro · Parks & Rec',
    shared: `${f.clubName} + eThekwini Metro`,
    university: 'UKZN Sports Admin',
  };
  const headIdx = Math.floor(seededRand(f.clubId, 101) * GROUNDSTAFF.length);
  const asst1Idx = (headIdx + 1) % GROUNDSTAFF.length;
  const asst2Idx = (headIdx + 3) % GROUNDSTAFF.length;
  acc[f.clubId] = {
    ownership,
    ownerLabel: ownerLabelMap[ownership],
    contractStart: '2024-08-01',
    contractRenews: '2027-07-31',
    budgetAnnual: 40000 + Math.round(seededRand(f.clubId, 102) * 80000),
    head: GROUNDSTAFF[headIdx],
    assistants: [GROUNDSTAFF[asst1Idx], GROUNDSTAFF[asst2Idx]],
    // Teams that use this ground — pulled from the club record where possible
    teamsUsing: (() => {
      const club = SAMPLE_CLUBS.find((c) => c.id === f.clubId);
      const list = ['Premier Men'];
      if ((club?.teams || 0) > 1) list.push('Promotion Men');
      if ((club?.women || 0) > 0) list.push('Premier Women');
      if ((club?.juniors || 0) > 0) list.push('Under-19', 'Under-15');
      return list;
    })(),
  };
  return acc;
}, {});

// Match-load metrics per facility — fixtures already played this season +
// the derived batting-event breakdown that drives wear on the square.
const FACILITY_LOAD = FACILITIES.reduce((acc, f) => {
  const r = (s) => seededRand(f.clubId, 200 + s);
  const fixturesPlayed = Math.max(2, Math.round(r(0) * 10 + 3));
  const fixturesPlanned = fixturesPlayed + Math.round(r(1) * 12 + 6);
  const totalOvers = fixturesPlayed * (40 + Math.round(r(2) * 12));
  const totalBalls = totalOvers * 6;
  // Distribute balls across scoring buckets — roughly matches SA club-cricket norms
  const singles = Math.round(totalBalls * (0.19 + r(3) * 0.05));
  const twos = Math.round(totalBalls * (0.033 + r(4) * 0.012));
  const threes = Math.round(totalBalls * (0.002 + r(5) * 0.002));
  const fours = Math.round(totalBalls * (0.062 + r(6) * 0.02));
  const sixes = Math.round(totalBalls * (0.017 + r(7) * 0.008));
  // Load index: 100 = fully utilised, higher = wear risk.
  const loadIndex = Math.min(
    98,
    Math.round((fixturesPlayed / (fixturesPlanned || 1)) * 100 + (totalBalls / 3600) * 20)
  );
  // Seed match log — one entry per fixture played on this ground.
  const OPPONENTS_POOL = [
    'UKZN CC', 'Clares CC', 'Chatsworth Sporting CC', 'Umlazi CC', 'Crusaders CC',
    'Berea Rovers CC', 'Rhythm DHSOB CC', 'African Warriors CC', 'Phoenix CC',
    'Verulam CC', 'Harlequins CC', 'Spartan Sporting CC',
  ];
  const RESULTS_POOL = ['Won', 'Lost', 'Tied', 'Won', 'Won', 'Lost'];
  const SERIES_LABELS = ['Premier · Round', 'Promotion · Round', 'T20 Cup · Round', 'Premier · Round'];
  const startDate = new Date('2026-08-02');
  const matches = Array.from({ length: fixturesPlayed }).map((_, i) => {
    const oppIdx = Math.floor(r(50 + i) * OPPONENTS_POOL.length);
    let opp = OPPONENTS_POOL[oppIdx];
    if (opp === f.clubName) opp = OPPONENTS_POOL[(oppIdx + 1) % OPPONENTS_POOL.length];
    const seriesIdx = Math.floor(r(60 + i) * SERIES_LABELS.length);
    const overs = 40 + Math.round(r(70 + i) * 12);
    const result = RESULTS_POOL[Math.floor(r(80 + i) * RESULTS_POOL.length)];
    const scoreFor = 140 + Math.round(r(90 + i) * 140);
    const scoreAgainst = result === 'Won' ? scoreFor - Math.round(r(100 + i) * 60 + 10) : scoreFor + Math.round(r(110 + i) * 60 + 5);
    const matchDate = new Date(startDate);
    matchDate.setDate(matchDate.getDate() - i * 14 - Math.round(r(120 + i) * 5));
    return {
      id: `m-${f.clubId}-${i}`,
      date: matchDate.toISOString().slice(0, 10),
      series: SERIES_LABELS[seriesIdx] + ' ' + ((i % 6) + 1),
      opponent: opp,
      home: true,
      result,
      scoreFor,
      scoreAgainst,
      overs,
    };
  });

  acc[f.clubId] = {
    fixturesPlayed,
    fixturesPlanned,
    totalOvers,
    totalBalls,
    singles,
    twos,
    threes,
    fours,
    sixes,
    dotBalls: totalBalls - singles - twos - threes - fours - sixes,
    loadIndex,
    lastMatchDate: '2026-05-24',
    matches,
  };
  return acc;
}, {});

// Live job cards — some open per facility so the admin has something to see.
// Each is dispatched to a specific staffer with a checklist and status.
const FACILITY_JOBS = (() => {
  const jobs = [];
  const today = '2026-06-05';
  FACILITIES.forEach((f, i) => {
    const r = (s) => seededRand(f.clubId, 300 + s);
    const ownership = FACILITY_OWNERSHIP[f.clubId];
    const staff = [ownership.head, ...ownership.assistants];
    const jobCount = Math.round(r(0) * 3) + 1;
    for (let j = 0; j < jobCount; j++) {
      const typeIdx = Math.floor(r(j * 5 + 1) * (JOB_TYPES.length - 1));
      const t = JOB_TYPES[typeIdx];
      const assignee = staff[Math.floor(r(j * 7 + 2) * staff.length)];
      const status = r(j * 9 + 3) < 0.15 ? 'done' : r(j * 9 + 3) < 0.45 ? 'in-progress' : 'open';
      const priority = r(j * 11 + 4) > 0.75 ? 'high' : r(j * 11 + 4) > 0.4 ? 'medium' : 'low';
      const daysToDue = status === 'done' ? -Math.round(r(j * 13 + 5) * 10) : Math.round(r(j * 13 + 5) * 12) - 2;
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + daysToDue);
      const doneCount = status === 'done' ? t.checklist.length : Math.floor(r(j * 15 + 6) * t.checklist.length);
      jobs.push({
        id: `job-${f.clubId}-${j}`,
        facilityId: f.clubId,
        type: t.key,
        typeLabel: t.label,
        title:
          j === 0 && t.key === 'pitch-prep'
            ? `Prep pitch for Sat premier fixture · ${f.venue}`
            : `${t.label} · round ${(i % 4) + 1}`,
        status,
        priority,
        assigneeId: assignee.id,
        assigneeName: assignee.name,
        dueDate: dueDate.toISOString().slice(0, 10),
        createdAt: '2026-05-30',
        checklist: t.checklist.map((text, ci) => ({ done: ci < doneCount, text })),
        notes: '',
      });
    }
  });
  return jobs;
})();

/* ─── Full asset catalog · playing surfaces + practice + BUILDINGS ─── */

const ASSET_CATEGORIES = [
  // Playing surfaces
  { key: 'Pitch square',   icon: '◇', quantityL: 'Number of pitches', group: 'Playing' },
  { key: 'Cover',          icon: '☂', quantityL: 'Number of covers', group: 'Playing' },
  { key: 'Sightscreen',    icon: '▤', quantityL: 'Number of screens', group: 'Playing' },
  { key: 'Boundary rope',  icon: '○', quantityL: 'Number of rope sets', group: 'Playing' },
  { key: 'Scoreboard',     icon: '▤', quantityL: 'Number of scoreboards', group: 'Playing' },
  // Practice
  { key: 'Outdoor net',    icon: '⌗', quantityL: 'Number of net lanes', group: 'Practice' },
  { key: 'Indoor net',     icon: '⌗', quantityL: 'Number of net lanes', group: 'Practice' },
  { key: 'Bowling machine', icon: '◉', quantityL: 'Number of machines', group: 'Practice' },
  // Grounds care
  { key: 'Sprinkler / irrigation', icon: '⇩', quantityL: 'Number of zones', group: 'Grounds care' },
  { key: 'Roller / mower', icon: '◉', quantityL: 'Number of units', group: 'Grounds care' },
  // Buildings
  { key: 'Clubhouse',      icon: '🏛', quantityL: 'Number of clubhouses', group: 'Buildings' },
  { key: 'Change rooms',   icon: '🚻', quantityL: 'Number of change rooms', group: 'Buildings' },
  { key: 'Toilets',        icon: '🚽', quantityL: 'Number of toilet blocks', group: 'Buildings' },
  { key: 'Storage / Kit room', icon: '📦', quantityL: 'Number of storerooms', group: 'Buildings' },
  { key: 'Kitchen / Bar',  icon: '🍽', quantityL: 'Number of kitchens/bars', group: 'Buildings' },
  { key: 'Parking',        icon: '🅿', quantityL: 'Number of parking areas', group: 'Buildings' },
  { key: 'Fencing / security', icon: '🚧', quantityL: 'Number of fence sections', group: 'Buildings' },
  { key: 'Other',          icon: '⌂', quantityL: 'Quantity', group: 'Other' },
];

/* ─── ISSUE catalog for physical inspections ───
   Structured issues let the management team log what they see with a
   click instead of typing prose. Categories are keyed off the asset
   path so the picker adapts (a bowling machine can't have "turf wear"). */

const ISSUE_SEVERITIES = [
  { key: 'minor',    label: 'Minor',    tone: 'muted', advice: 'Note for next session · no immediate action' },
  { key: 'moderate', label: 'Moderate', tone: 'gold',  advice: 'Schedule work within the month' },
  { key: 'critical', label: 'Critical', tone: 'coral', advice: 'Blocks safe use · dispatch a job card now' },
];

const ISSUE_LOCATIONS = {
  pitch: ['Middle strip', 'End 1 (north)', 'End 2 (south)', 'Popping crease', 'Outfield · long-on', 'Outfield · long-off', 'Boundary edge', 'Square', 'Whole strip'],
  covers: ['Left cover', 'Right cover', 'Wheel assembly', 'Corner', 'Seams', 'Frame', 'Handles'],
  'nets.outdoor': ['Lane 1', 'Lane 2', 'Lane 3', 'Lane 4', 'Lane 5', 'Lane 6', 'Side mesh', 'Rear net', 'Roof net', 'Concrete base', 'Fixings'],
  'nets.indoor': ['Bay 1', 'Bay 2', 'Retractable curtain', 'Overhead', 'Fixings'],
  'nets.bowlingMachines': ['Feeder mechanism', 'Delivery wheel', 'Motor', 'Power / cable', 'Chassis', 'Remote / control'],
  support: ['Sightscreen · pavilion end', 'Sightscreen · far end', 'Scoreboard', 'Boundary rope', 'Boundary flags'],
};

const ISSUE_CATEGORIES = {
  pitch: [
    { key: 'turf-wear',     label: 'Turf wear',              icon: '🌿' },
    { key: 'bare-patches',  label: 'Bare patches',           icon: '🟤' },
    { key: 'uneven-bounce', label: 'Uneven bounce',          icon: '📉' },
    { key: 'settlement',    label: 'Settlement',             icon: '⬇' },
    { key: 'weed',          label: 'Weed / grass invasion',  icon: '🌾' },
    { key: 'standing-water',label: 'Drainage · standing water', icon: '💧' },
    { key: 'cracks',        label: 'Surface cracks',         icon: '⚡' },
    { key: 'compaction',    label: 'Compaction',             icon: '🔨' },
    { key: 'moss-fungal',   label: 'Moss / fungal growth',   icon: '🍄' },
    { key: 'other',         label: 'Other',                  icon: '⚠' },
  ],
  covers: [
    { key: 'wheel-bearing', label: 'Wheel bearing wear',     icon: '⚙' },
    { key: 'tear',          label: 'Tear / rip',             icon: '📛' },
    { key: 'waterproofing', label: 'Waterproofing failing',  icon: '💧' },
    { key: 'frame-rust',    label: 'Frame rust / corrosion', icon: '🟤' },
    { key: 'grommet',       label: 'Grommet damage',         icon: '🔗' },
    { key: 'stitching',     label: 'Stitching split',        icon: '🪡' },
    { key: 'handles',       label: 'Handles broken / worn',  icon: '🖐' },
    { key: 'other',         label: 'Other',                  icon: '⚠' },
  ],
  'nets.outdoor': [
    { key: 'mesh-tear',     label: 'Mesh tear',              icon: '📛' },
    { key: 'mat-worn',      label: 'Mat worn / thinning',    icon: '🟫' },
    { key: 'concrete-crack',label: 'Concrete base crack',    icon: '⚡' },
    { key: 'net-loose',     label: 'Net loose / anchoring',  icon: '🔗' },
    { key: 'fixings',       label: 'Fixings corrosion',      icon: '⚙' },
    { key: 'return-panel',  label: 'Return panel damage',    icon: '⚠' },
    { key: 'holes',         label: 'Ball passing through',   icon: '⚽' },
    { key: 'other',         label: 'Other',                  icon: '⚠' },
  ],
  'nets.indoor': [
    { key: 'mesh-tear',     label: 'Mesh tear',              icon: '📛' },
    { key: 'lighting',      label: 'Lighting issue',         icon: '💡' },
    { key: 'roof-leak',     label: 'Roof leak',              icon: '💧' },
    { key: 'flooring',      label: 'Flooring damage',        icon: '🟫' },
    { key: 'retractable',   label: 'Retractable mechanism',  icon: '⚙' },
    { key: 'ventilation',   label: 'Ventilation',            icon: '🌀' },
    { key: 'other',         label: 'Other',                  icon: '⚠' },
  ],
  'nets.bowlingMachines': [
    { key: 'feeder-jam',    label: 'Feeder mechanism jam',   icon: '⚙' },
    { key: 'motor',         label: 'Motor / power issue',    icon: '⚡' },
    { key: 'wheel-wear',    label: 'Delivery wheel wear',    icon: '🔄' },
    { key: 'electrical',    label: 'Electrical / wiring',    icon: '🔌' },
    { key: 'accuracy',      label: 'Accuracy off',           icon: '🎯' },
    { key: 'remote',        label: 'Remote / controller',    icon: '📱' },
    { key: 'other',         label: 'Other',                  icon: '⚠' },
  ],
  support: [
    { key: 'paint-fade',    label: 'Paint fade / peeling',   icon: '🎨' },
    { key: 'panel-damage',  label: 'Panel damage',           icon: '📛' },
    { key: 'wheel-track',   label: 'Wheel / track issue',    icon: '⚙' },
    { key: 'bulb-digit',    label: 'Bulb / digit failure',   icon: '💡' },
    { key: 'wiring',        label: 'Wiring',                 icon: '🔌' },
    { key: 'rope-worn',     label: 'Rope worn / knotted',    icon: '🪢' },
    { key: 'other',         label: 'Other',                  icon: '⚠' },
  ],
  custom: [
    { key: 'general-wear',  label: 'General wear',           icon: '⚠' },
    { key: 'damage',        label: 'Physical damage',        icon: '📛' },
    { key: 'malfunction',   label: 'Malfunction',            icon: '⚙' },
    { key: 'safety',        label: 'Safety concern',         icon: '🚨' },
    { key: 'compliance',    label: 'Compliance issue',       icon: '📋' },
    { key: 'other',         label: 'Other',                  icon: '⚠' },
  ],
  // Building-related — shared across Clubhouse / Change rooms / Toilets / Storage / Kitchen / Parking / Fencing
  building: [
    { key: 'roof-leak',     label: 'Roof leak',              icon: '💧' },
    { key: 'plumbing',      label: 'Plumbing · leaks / blocks', icon: '🚰' },
    { key: 'electrical',    label: 'Electrical fault',       icon: '⚡' },
    { key: 'damage',        label: 'Structural damage',      icon: '🧱' },
    { key: 'break-in',      label: 'Break-in / vandalism',   icon: '🚨' },
    { key: 'cleanliness',   label: 'Cleanliness / hygiene',  icon: '🧽' },
    { key: 'accessibility', label: 'Accessibility issue',    icon: '♿' },
    { key: 'lighting',      label: 'Lighting failure',       icon: '💡' },
    { key: 'ventilation',   label: 'Ventilation / mould',    icon: '🍄' },
    { key: 'pest',          label: 'Pest infestation',       icon: '🐜' },
    { key: 'paint-finish',  label: 'Paint / finish worn',    icon: '🎨' },
    { key: 'compliance',    label: 'Compliance / permit',    icon: '📋' },
    { key: 'other',         label: 'Other',                  icon: '⚠' },
  ],
};

// Building keys share a single issue catalog because roof leaks and
// plumbing problems apply the same way whether it's the clubhouse or
// the toilets.
const BUILDING_KEYS = new Set([
  'Clubhouse',
  'Change rooms',
  'Toilets',
  'Storage / Kit room',
  'Kitchen / Bar',
  'Parking',
  'Fencing / security',
]);

function issueCategoriesFor(assetKey) {
  if (!assetKey) return ISSUE_CATEGORIES.custom;
  if (assetKey.startsWith('custom.')) {
    // Custom-added assets whose category matches a building key get the
    // building catalog; everything else falls through to the generic set.
    const categoryHint = assetKey.split(':')[1] || '';
    if (BUILDING_KEYS.has(categoryHint)) return ISSUE_CATEGORIES.building;
    return ISSUE_CATEGORIES.custom;
  }
  return ISSUE_CATEGORIES[assetKey] || ISSUE_CATEGORIES.custom;
}
function issueLocationsFor(assetKey) {
  if (!assetKey) return [];
  if (assetKey.startsWith('custom.')) return [];
  return ISSUE_LOCATIONS[assetKey] || [];
}
function severityTone(k) {
  return (ISSUE_SEVERITIES.find((s) => s.key === k) || ISSUE_SEVERITIES[0]).tone;
}

/* ─── VENDORS · roster + onboarding lifecycle ───
   Vendors are the external suppliers/service providers the Lions office
   maintains an approved list of. Each vendor goes through an onboarding
   workflow (draft → submitted → verified → onboarded) so admins can
   dispatch job cards to vetted third parties without repeating due
   diligence for every job. */

const VENDOR_CATEGORIES = [
  'Turf care',
  'Equipment supply',
  'Nets & fencing',
  'Machine service',
  'Fabrication / Metalwork',
  'Painting / Coatings',
  'Consulting',
  'Cleaning',
  'Landscaping',
  'Electrical',
  'Plumbing',
  'Security',
  'Transport / Logistics',
  'Coaching',
  'Medical / Clinical',
  'Utilities',
  'Administration / Hospitality',
  'Other',
];

const VENDOR_CATEGORY_GROUPS = {
  Facility: [
    'Turf care',
    'Nets & fencing',
    'Machine service',
    'Fabrication / Metalwork',
    'Painting / Coatings',
    'Cleaning',
    'Landscaping',
    'Electrical',
    'Plumbing',
    'Security',
  ],
  Cricket: ['Equipment supply', 'Coaching', 'Consulting'],
  'Player welfare': ['Medical / Clinical'],
  Operations: ['Utilities', 'Transport / Logistics', 'Administration / Hospitality', 'Other'],
};

const VENDOR_STATUSES = ['draft', 'submitted', 'verified', 'onboarded', 'suspended'];

const VENDOR_SERVICES = [
  // Facility
  'Pitch preparation',
  'Grass cutting',
  'Top soil / re-turfing',
  'Rolling / consolidation',
  'Boundary rope / gullies',
  'Nets · installation',
  'Nets · maintenance',
  'Sightscreen fabrication',
  'Sightscreen · painting',
  'Drainage / covers · service',
  'Bowling machine · service',
  'Scoreboard · installation',
  'Scoreboard · maintenance',
  'Sprinkler / irrigation · install',
  'Sprinkler / irrigation · service',
  'Roller · service',
  'Mower · service',
  'Equipment supply',
  'General inspection / audit',
  'Cleaning',
  // Coaching
  'Coaching · Head coach',
  'Coaching · Assistant',
  'Coaching · Batting specialist',
  'Coaching · Bowling specialist',
  'Coaching · Wicket-keeping',
  'Coaching · Fielding',
  'Coaching · Junior / youth',
  'Coaching · Strength & conditioning',
  // Medical / Clinical
  'Physiotherapy',
  'Sports medicine · GP',
  'Biokinetics',
  'Imaging / scans',
  'Massage therapy',
  'Strapping / taping supplies',
  'Nutrition consultation',
  // Utilities
  'Electricity',
  'Water & sanitation',
  'Waste removal',
  'Internet / connectivity',
  'Gas / fuel',
  // Administration / Hospitality
  'Association / union fees',
  'Umpire fees',
  'Scorer fees',
  'Match hospitality',
  'Kit sponsorship / procurement',
  'Awards / trophies',
  'Bank fees',
  'Insurance premiums',
  'Accounting / audit fees',
  'Chairman honorarium',
];

const BEE_LEVELS = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6', 'Level 7', 'Level 8', 'Non-compliant', 'Exempt Micro Enterprise'];

const VENDORS = [
  {
    id: 'v-001',
    name: 'Green Turf Solutions',
    category: 'Turf care',
    contactPerson: 'Rajen Naidoo',
    phone: '083 421 6688',
    email: 'rajen@greenturfsolutions.co.za',
    address: '14 Industrial Rd, Pinetown, Durban',
    vatNumber: '4520149822',
    beeLevel: 'Level 2',
    insuranceExpiry: '2027-03-15',
    bankName: 'Standard Bank',
    bankAccount: '···· 4482',
    services: ['Pitch preparation', 'Grass cutting', 'Top soil / re-turfing', 'Rolling / consolidation'],
    rating: 4.6,
    jobsCompleted: 24,
    status: 'onboarded',
    onboardedAt: '2025-08-14',
    notes: 'Preferred vendor for pitch renewals across EMCU. Fast response times.',
  },
  {
    id: 'v-002',
    name: 'BOLA Manufacturing SA',
    category: 'Equipment supply',
    contactPerson: 'Kagiso Mokwena',
    phone: '011 493 0021',
    email: 'sales@bola.co.za',
    address: '7 Ashley St, Johannesburg',
    vatNumber: '4110215548',
    beeLevel: 'Level 4',
    insuranceExpiry: '2027-11-30',
    bankName: 'FNB',
    bankAccount: '···· 9902',
    services: ['Equipment supply', 'Bowling machine · service'],
    rating: 4.8,
    jobsCompleted: 11,
    status: 'onboarded',
    onboardedAt: '2025-05-02',
    notes: 'OEM for BOLA machines. 6-week lead time on new units, 5-day on service.',
  },
  {
    id: 'v-003',
    name: 'Netpro Fencing',
    category: 'Nets & fencing',
    contactPerson: 'Devlin Pillay',
    phone: '072 118 9014',
    email: 'devlin@netpro.co.za',
    address: '55 Bluff Rd, Durban',
    vatNumber: '4320185561',
    beeLevel: 'Level 1',
    insuranceExpiry: '2026-10-08',
    bankName: 'Nedbank',
    bankAccount: '···· 1130',
    services: ['Nets · installation', 'Nets · maintenance'],
    rating: 4.2,
    jobsCompleted: 7,
    status: 'onboarded',
    onboardedAt: '2025-09-19',
    notes: '',
  },
  {
    id: 'v-004',
    name: 'JR Turf Consulting',
    category: 'Consulting',
    contactPerson: 'John Roberts',
    phone: '082 990 4477',
    email: 'john@jrturf.co.za',
    address: 'Umhlanga, Durban',
    vatNumber: '4610248832',
    beeLevel: 'Non-compliant',
    insuranceExpiry: '2027-04-22',
    bankName: 'Standard Bank',
    bankAccount: '···· 7799',
    services: ['General inspection / audit', 'Pitch preparation'],
    rating: 4.9,
    jobsCompleted: 5,
    status: 'onboarded',
    onboardedAt: '2025-11-11',
    notes: 'Independent turf consultant. Retained per-day for pitch audits.',
  },
  {
    id: 'v-005',
    name: 'Coastal Coatings',
    category: 'Painting / Coatings',
    contactPerson: 'Ashwin Chetty',
    phone: '084 442 1103',
    email: 'ashwin@coastalcoatings.co.za',
    address: 'Chatsworth, Durban',
    vatNumber: '',
    beeLevel: 'Level 4',
    insuranceExpiry: '',
    bankName: 'Absa',
    bankAccount: '···· 5540',
    services: ['Sightscreen · painting'],
    rating: 3.8,
    jobsCompleted: 0,
    status: 'submitted',
    onboardedAt: null,
    notes: 'Awaiting insurance certificate. Referred by Chatsworth Sporting CC.',
  },
  {
    id: 'v-006',
    name: 'Sipho Machine Services',
    category: 'Machine service',
    contactPerson: 'Sipho Zulu',
    phone: '076 810 2245',
    email: 'sipho.zulu@example.co.za',
    address: 'Amanzimtoti, Durban',
    vatNumber: '',
    beeLevel: 'Level 1',
    insuranceExpiry: '2026-08-30',
    bankName: 'Capitec',
    bankAccount: '···· 3320',
    services: ['Roller · service', 'Mower · service'],
    rating: 4.1,
    jobsCompleted: 3,
    status: 'verified',
    onboardedAt: null,
    notes: 'Verified — needs one more compliance check before onboarding.',
  },
  {
    id: 'v-007',
    name: 'Southern Cricket Supplies',
    category: 'Equipment supply',
    contactPerson: 'Marius van der Merwe',
    phone: '083 200 1109',
    email: 'marius@southerncricket.co.za',
    address: 'Umbilo, Durban',
    vatNumber: '4520332211',
    beeLevel: 'Level 4',
    insuranceExpiry: '2027-06-14',
    bankName: 'Standard Bank',
    bankAccount: '···· 0044',
    services: ['Equipment supply'],
    rating: 0,
    jobsCompleted: 0,
    status: 'draft',
    onboardedAt: null,
    notes: '',
  },
  {
    id: 'v-009',
    name: 'Sanele Cele Cricket Academy',
    category: 'Coaching',
    contactPerson: 'Sanele Cele',
    phone: '084 118 2299',
    email: 'sanele@scacricket.co.za',
    address: 'Umhlanga, Durban',
    vatNumber: '',
    beeLevel: 'Level 1',
    insuranceExpiry: '2027-01-30',
    bankName: 'FNB',
    bankAccount: '···· 8811',
    services: ['Coaching · Head coach', 'Coaching · Batting specialist', 'Coaching · Junior / youth'],
    rating: 4.7,
    jobsCompleted: 12,
    status: 'onboarded',
    onboardedAt: '2025-10-04',
    notes: 'Former KZN Coastal player. Runs a mid-week batting clinic for junior sides.',
  },
  {
    id: 'v-010',
    name: 'Mark Robertson · Bowling Consultancy',
    category: 'Coaching',
    contactPerson: 'Mark Robertson',
    phone: '083 604 4471',
    email: 'mark@robertsonbowling.com',
    address: 'Westville, Durban',
    vatNumber: '',
    beeLevel: 'Non-compliant',
    insuranceExpiry: '2026-09-01',
    bankName: 'Standard Bank',
    bankAccount: '···· 2201',
    services: ['Coaching · Bowling specialist', 'General inspection / audit'],
    rating: 4.5,
    jobsCompleted: 6,
    status: 'onboarded',
    onboardedAt: '2025-07-22',
    notes: 'Specialises in pace-bowling biomechanics. Available Saturdays.',
  },
  {
    id: 'v-011',
    name: 'Pillay Sports Physio',
    category: 'Medical / Clinical',
    contactPerson: 'Dr. Rushil Pillay',
    phone: '031 205 8811',
    email: 'reception@pillayphysio.co.za',
    address: 'Berea, Durban',
    vatNumber: '4610441100',
    beeLevel: 'Level 4',
    insuranceExpiry: '2027-05-15',
    bankName: 'Nedbank',
    bankAccount: '···· 6620',
    services: ['Physiotherapy', 'Biokinetics', 'Strapping / taping supplies'],
    rating: 4.8,
    jobsCompleted: 18,
    status: 'onboarded',
    onboardedAt: '2025-04-11',
    notes: 'Direct billing to medical aids. On-call for match-day injuries within 45 min.',
  },
  {
    id: 'v-012',
    name: 'Kloof Sports Medicine',
    category: 'Medical / Clinical',
    contactPerson: 'Dr. Naledi Motaung',
    phone: '031 764 0900',
    email: 'admin@kloofsportsmed.co.za',
    address: 'Kloof, Durban',
    vatNumber: '4520771122',
    beeLevel: 'Level 2',
    insuranceExpiry: '2027-08-08',
    bankName: 'Discovery Bank',
    bankAccount: '···· 5511',
    services: ['Sports medicine · GP', 'Imaging / scans', 'Nutrition consultation'],
    rating: 4.6,
    jobsCompleted: 9,
    status: 'onboarded',
    onboardedAt: '2025-06-30',
    notes: 'Referrals to Netcare Kingsway for scans. Concussion protocol certified.',
  },
  {
    id: 'v-013',
    name: 'eThekwini Municipality',
    category: 'Utilities',
    contactPerson: 'Municipal accounts',
    phone: '080 131 3013',
    email: 'accounts@durban.gov.za',
    address: 'City Hall, Durban',
    vatNumber: '4020123456',
    beeLevel: 'Exempt Micro Enterprise',
    insuranceExpiry: '',
    bankName: 'Standard Bank',
    bankAccount: '···· 0001',
    services: ['Electricity', 'Water & sanitation', 'Waste removal'],
    rating: 3.2,
    jobsCompleted: 0,
    status: 'onboarded',
    onboardedAt: '2024-01-01',
    notes: 'Standing account — monthly invoicing. Debit order on the 25th.',
  },
  {
    id: 'v-014',
    name: 'KZN Cricket Union',
    category: 'Administration / Hospitality',
    contactPerson: 'Union Secretariat',
    phone: '031 335 4200',
    email: 'accounts@kzncricket.co.za',
    address: 'Kingsmead, Durban',
    vatNumber: '4110998877',
    beeLevel: 'Level 2',
    insuranceExpiry: '',
    bankName: 'Standard Bank',
    bankAccount: '···· 3341',
    services: ['Association / union fees', 'Umpire fees', 'Scorer fees'],
    rating: 4.0,
    jobsCompleted: 0,
    status: 'onboarded',
    onboardedAt: '2024-01-01',
    notes: 'Season affiliation invoiced in July. Umpire panel billed per fixture.',
  },
  {
    id: 'v-015',
    name: 'Bulls Kit & Apparel',
    category: 'Administration / Hospitality',
    contactPerson: 'Reshma Naicker',
    phone: '072 447 0091',
    email: 'reshma@bullskit.co.za',
    address: 'Springfield Park, Durban',
    vatNumber: '4520886644',
    beeLevel: 'Level 4',
    insuranceExpiry: '2027-02-28',
    bankName: 'FNB',
    bankAccount: '···· 7710',
    services: ['Kit sponsorship / procurement', 'Awards / trophies'],
    rating: 4.3,
    jobsCompleted: 4,
    status: 'onboarded',
    onboardedAt: '2025-08-05',
    notes: 'End-of-season awards + custom playing kit. 3-week lead time.',
  },
  {
    id: 'v-008',
    name: 'Reliable Roller Rentals',
    category: 'Equipment supply',
    contactPerson: 'Trevor Green',
    phone: '083 004 9911',
    email: 'trevor@reliableroller.co.za',
    address: 'Verulam, Durban',
    vatNumber: '4110114488',
    beeLevel: 'Level 3',
    insuranceExpiry: '2024-12-01',
    bankName: 'Nedbank',
    bankAccount: '···· 2210',
    services: ['Equipment supply', 'Roller · service'],
    rating: 3.4,
    jobsCompleted: 8,
    status: 'suspended',
    onboardedAt: '2024-03-10',
    notes: 'Insurance lapsed. Suspended until renewed cert supplied.',
  },
];

/* ─── CLUB FINANCIALS · cost categories + sample ledger ───
   Every rand a club spends is bucketed here. The chairman tracks
   coaching payroll, clinical bills, facility costs (job cards + capex),
   and administration into a single ledger. The Financials tab renders
   this as running totals, per-category subtotals, and an export template
   the club can hand to their accountant. */

const CLUB_COST_CATEGORIES = [
  { key: 'coach_salary', label: 'Coach · Salary', group: 'Coaching', tone: 'teal' },
  { key: 'coach_adhoc', label: 'Coach · Adhoc / Session', group: 'Coaching', tone: 'gold' },
  { key: 'clinical_physio', label: 'Clinical · Physiotherapy', group: 'Player welfare', tone: 'coral' },
  { key: 'clinical_medical', label: 'Clinical · Medical / GP', group: 'Player welfare', tone: 'coral' },
  { key: 'clinical_supplies', label: 'Clinical · Supplies', group: 'Player welfare', tone: 'coral' },
  { key: 'facility_jobcard', label: 'Facility · Job card', group: 'Facility', tone: 'navy' },
  { key: 'facility_capex', label: 'Facility · Capex', group: 'Facility', tone: 'navy' },
  { key: 'facility_utility', label: 'Facility · Utilities', group: 'Facility', tone: 'navy' },
  { key: 'facility_consumable', label: 'Facility · Consumables', group: 'Facility', tone: 'navy' },
  { key: 'admin_union', label: 'Admin · Union / affiliation', group: 'Administration', tone: 'muted' },
  { key: 'admin_umpire', label: 'Admin · Umpire / scorer', group: 'Administration', tone: 'muted' },
  { key: 'admin_hospitality', label: 'Admin · Match hospitality', group: 'Administration', tone: 'muted' },
  { key: 'admin_kit', label: 'Admin · Kit / awards', group: 'Administration', tone: 'muted' },
  { key: 'admin_banking', label: 'Admin · Banking / insurance', group: 'Administration', tone: 'muted' },
  { key: 'chairman_honorarium', label: 'Chairman · Honorarium', group: 'Administration', tone: 'gold' },
  { key: 'chairman_reimburse', label: 'Chairman · Reimbursement', group: 'Administration', tone: 'gold' },
  { key: 'other', label: 'Other', group: 'Administration', tone: 'muted' },
];

const CLUB_COST_FREQUENCIES = ['One-off', 'Weekly', 'Monthly', 'Quarterly', 'Season', 'Annual'];

const SUBSCRIPTION_DEFAULT_ZAR = 500;

const CLUB_INCOME_CATEGORIES = [
  { key: 'subscription', label: 'Player subscription', group: 'Subscriptions', tone: 'teal' },
  { key: 'sponsorship', label: 'Sponsorship', group: 'Sponsorships', tone: 'gold' },
  { key: 'grant', label: 'Grant / union funding', group: 'Sponsorships', tone: 'gold' },
  { key: 'donation', label: 'Donation', group: 'Donations', tone: 'coral' },
  { key: 'match_fees', label: 'Match fees / gate', group: 'Match day', tone: 'navy' },
  { key: 'tuck_shop', label: 'Tuck shop / bar', group: 'Match day', tone: 'navy' },
  { key: 'event_hosting', label: 'Event hosting', group: 'Events', tone: 'navy' },
  { key: 'other_income', label: 'Other income', group: 'Other', tone: 'muted' },
];

const CLUB_INCOME_GROUPS = ['Subscriptions', 'Sponsorships', 'Donations', 'Match day', 'Events', 'Other'];

const CLUB_PRIMARY_INCOME_GROUPS = ['Subscriptions', 'Sponsorships', 'Donations'];

const CLUB_COST_SEED = [
  { id: 'c-001', direction: 'out', date: '2026-07-05', category: 'coach_salary', vendorId: 'v-009', payee: 'Sanele Cele Cricket Academy', desc: 'Head coach retainer · July', amount: 12000, frequency: 'Monthly', invoice: 'SCA-2607', paid: true },
  { id: 'c-002', direction: 'out', date: '2026-07-05', category: 'coach_adhoc', vendorId: 'v-010', payee: 'Mark Robertson · Bowling', desc: 'Sat clinic × 2 · pace group', amount: 3600, frequency: 'One-off', invoice: 'MR-041', paid: true },
  { id: 'c-003', direction: 'out', date: '2026-07-02', category: 'clinical_physio', vendorId: 'v-011', payee: 'Pillay Sports Physio', desc: 'Match-day cover + 3 sessions', amount: 4850, frequency: 'One-off', invoice: 'PSP-119', paid: false },
  { id: 'c-004', direction: 'out', date: '2026-06-25', category: 'facility_utility', vendorId: 'v-013', payee: 'eThekwini Municipality', desc: 'Electricity + water · June', amount: 6120, frequency: 'Monthly', invoice: 'ETH-6-26', paid: true },
  { id: 'c-005', direction: 'out', date: '2026-06-30', category: 'facility_jobcard', vendorId: 'v-001', payee: 'Green Turf Solutions', desc: 'Pre-season pitch renovation', amount: 18500, frequency: 'One-off', invoice: 'GTS-2201', paid: true },
  { id: 'c-006', direction: 'out', date: '2026-06-15', category: 'admin_union', vendorId: 'v-014', payee: 'KZN Cricket Union', desc: 'Season affiliation 2026/27', amount: 8500, frequency: 'Annual', invoice: 'KZNCU-A26', paid: true },
  { id: 'c-007', direction: 'out', date: '2026-06-10', category: 'admin_kit', vendorId: 'v-015', payee: 'Bulls Kit & Apparel', desc: 'Team playing kit x 15', amount: 22500, frequency: 'Season', invoice: 'BKA-3312', paid: false },
  { id: 'c-008', direction: 'out', date: '2026-05-30', category: 'admin_banking', vendorId: null, payee: 'FNB', desc: 'Monthly account fees', amount: 340, frequency: 'Monthly', invoice: '', paid: true },
  { id: 'c-009', direction: 'out', date: '2026-05-28', category: 'chairman_reimburse', vendorId: null, payee: 'Ashraf Ganie', desc: 'Fuel · match-day travel', amount: 890, frequency: 'One-off', invoice: 'CH-052', paid: true },
];

const CLUB_INCOME_SEED = [
  { id: 'i-001', direction: 'in', date: '2026-07-01', category: 'sponsorship', sponsorTier: 'Gold', payee: 'Coastal Insurance Brokers', desc: 'Season shirt sponsor · 2026/27', amount: 45000, frequency: 'Season', invoice: 'CIB-SP-01', paid: true },
  { id: 'i-002', direction: 'in', date: '2026-06-28', category: 'sponsorship', sponsorTier: 'Silver', payee: 'Umhlanga Auto Repairs', desc: 'Boundary board · half season', amount: 12000, frequency: 'One-off', invoice: 'UAR-2201', paid: true },
  { id: 'i-003', direction: 'in', date: '2026-06-20', category: 'grant', payee: 'KZN Cricket Union', desc: 'Development grant · junior programme', amount: 15000, frequency: 'Annual', invoice: 'KZNCU-G26', paid: true },
  { id: 'i-004', direction: 'in', date: '2026-06-14', category: 'match_fees', payee: 'Home match · vs Berea Rovers', desc: 'Gate + tea kitty', amount: 2100, frequency: 'One-off', invoice: '', paid: true },
  { id: 'i-005', direction: 'in', date: '2026-06-05', category: 'donation', payee: 'UKZN Old Boys Trust', desc: 'Junior kit fund · 2026/27', amount: 5000, frequency: 'One-off', invoice: 'OBT-2026', paid: true },
  { id: 'i-006', direction: 'in', date: '2026-05-22', category: 'donation', payee: 'Anonymous alumnus', desc: 'Bowling machine · service fund', amount: 1500, frequency: 'One-off', invoice: '', paid: true },
];

/* ─── Lions office staff · internal resource pool for project portfolio ───
   These are the union's own employees. When a project owner picks "internal"
   in the People modal, they choose from this list. Externals come from the
   VENDORS pool (searchable in the same modal). */

const LIONS_OFFICE_STAFF = [
  { id: 'los-001', name: 'Bilal Faku', role: 'Operations Lead', phone: '083 111 2233', email: 'bilal@lions.co.za', rate:4500 },
  { id: 'los-002', name: 'Nadia Naidoo', role: 'Finance & Admin', phone: '082 220 3388', email: 'nadia@lions.co.za', rate:4000 },
  { id: 'los-003', name: 'Sipho Zulu', role: 'Facilities Manager', phone: '076 810 2245', email: 'sipho@lions.co.za', rate:4200 },
  { id: 'los-004', name: 'Rushil Patel', role: 'Cricket Development Officer', phone: '083 604 4471', email: 'rushil@lions.co.za', rate:3800 },
  { id: 'los-005', name: 'Marissa Botha', role: 'Marketing & Comms', phone: '072 447 0091', email: 'marissa@lions.co.za', rate:3600 },
  { id: 'los-006', name: 'Themba Ndlovu', role: 'Groundskeeping Coordinator', phone: '084 118 2299', email: 'themba@lions.co.za', rate:3400 },
  { id: 'los-007', name: 'Kirsten Adams', role: 'Player Welfare Officer', phone: '082 990 4477', email: 'kirsten@lions.co.za', rate:3800 },
];

/* ─── PROJECT PORTFOLIO · Lions-office project management ───
   The admin's project portfolio spans tournaments, asset upgrades, ground
   works, community outreach, compliance drives, and coaching programmes.
   Each project carries a task list, an equipment BOM, a resourcing plan
   (internal Lions staff + external vendors), and a rolling spend total. */

const PROJECT_TYPES = [
  { key: 'tournament', label: 'Tournament', icon: '🏆', tone: 'gold' },
  { key: 'asset',      label: 'Asset upgrade', icon: '🔧', tone: 'navy' },
  { key: 'ground',     label: 'Ground works', icon: '🏟', tone: 'navy' },
  { key: 'community',  label: 'Community outreach', icon: '🎽', tone: 'teal' },
  { key: 'compliance', label: 'Compliance', icon: '📋', tone: 'muted' },
  { key: 'coaching',   label: 'Coaching programme', icon: '🎯', tone: 'teal' },
  { key: 'other',      label: 'Other', icon: '📌', tone: 'muted' },
];

const PROJECT_STATUSES = [
  { key: 'planning',  label: 'Planning',  tone: 'muted' },
  { key: 'active',    label: 'Active',    tone: 'teal' },
  { key: 'on_hold',   label: 'On hold',   tone: 'gold' },
  { key: 'completed', label: 'Completed', tone: 'teal' },
  { key: 'cancelled', label: 'Cancelled', tone: 'coral' },
];

const TASK_STATUSES = [
  { key: 'todo',        label: 'To do',       tone: 'muted' },
  { key: 'in_progress', label: 'In progress', tone: 'gold' },
  { key: 'done',        label: 'Done',        tone: 'teal' },
  { key: 'blocked',     label: 'Blocked',     tone: 'coral' },
];

const PROJECT_SEED = [
  {
    id: 'proj-001',
    name: 'KZNCU Premier League · 2026/27',
    type: 'tournament',
    status: 'active',
    ownerId: 'los-001',
    owner: 'Bilal Faku',
    description: 'Season-long premier league across 14 affiliated clubs. Coordinates fixtures, umpiring, prize kit and marketing.',
    startDate: '2026-08-01',
    endDate: '2027-03-30',
    budget: 380000,
    tasks: [
      {
        id: 't-101',
        title: 'Confirm fixtures schedule with clubs',
        status: 'done',
        assigneeId: 'los-001', assigneeName: 'Bilal Faku',
        startDate: '2026-07-05', endDate: '2026-07-15', dueDate: '2026-07-15',
        equipment: [],
        people: [
          { id: 'p-101-1', type: 'internal', staffId: 'los-001', name: 'Bilal Faku', role: 'Fixture coordination', rate: 4500, rateUnit: 'day', units: 3 },
        ],
      },
      {
        id: 't-102',
        title: 'Umpire panel briefing + contracts',
        status: 'in_progress',
        assigneeId: 'los-001', assigneeName: 'Bilal Faku',
        startDate: '2026-07-15', endDate: '2026-08-01', dueDate: '2026-07-25',
        equipment: [
          { id: 'e-102-1', name: 'Umpire coats + hats', qty: 8, unitCost: 850, source: 'vendor', vendorId: 'v-015' },
        ],
        people: [
          { id: 'p-102-1', type: 'vendor', vendorId: 'v-014', name: 'KZN Cricket Union', role: 'Umpire panel · per match', rate: 1500, rateUnit: 'deliverable', units: 20 },
        ],
      },
      {
        id: 't-103',
        title: 'Prize kit procurement',
        status: 'todo',
        assigneeId: 'los-005', assigneeName: 'Marissa Botha',
        startDate: '2026-07-25', endDate: '2026-08-10', dueDate: '2026-08-10',
        equipment: [
          { id: 'e-103-1', name: 'Winner\'s trophy + plaques × 3', qty: 4, unitCost: 4500, source: 'vendor', vendorId: 'v-015' },
        ],
        people: [
          { id: 'p-103-1', type: 'internal', staffId: 'los-002', name: 'Nadia Naidoo', role: 'Finance & prize money', rate: 4000, rateUnit: 'day', units: 4 },
        ],
      },
      {
        id: 't-104',
        title: 'Season launch press release',
        status: 'todo',
        assigneeId: 'los-005', assigneeName: 'Marissa Botha',
        startDate: '2026-07-20', endDate: '2026-07-30', dueDate: '2026-07-30',
        equipment: [],
        people: [
          { id: 'p-104-1', type: 'internal', staffId: 'los-005', name: 'Marissa Botha', role: 'Season launch event mgmt', rate: 18000, rateUnit: 'once_off', units: 1 },
        ],
      },
      {
        id: 't-105',
        title: 'Match-day physio panel confirmed',
        status: 'todo',
        assigneeId: 'los-007', assigneeName: 'Kirsten Adams',
        startDate: '2026-07-28', endDate: '2026-08-05', dueDate: '2026-08-05',
        equipment: [
          { id: 'e-105-1', name: 'Match balls · Kookaburra Red', qty: 60, unitCost: 350, source: 'vendor', vendorId: 'v-002' },
          { id: 'e-105-2', name: 'Scoreboard batteries + spares', qty: 20, unitCost: 180, source: 'internal' },
        ],
        people: [
          { id: 'p-105-1', type: 'internal', staffId: 'los-007', name: 'Kirsten Adams', role: 'Physio panel confirms', rate: 3800, rateUnit: 'day', units: 2 },
        ],
      },
    ],
    notes: 'Sponsorship confirmed with Coastal Insurance (Gold). Prize pool R 45k.',
  },
  {
    id: 'proj-002',
    name: 'Howard College Oval · Pitch Renewal',
    type: 'asset',
    status: 'active',
    ownerId: 'los-003',
    owner: 'Sipho Zulu',
    description: 'Full pitch square relay + top-dress after seasonal wear survey flagged Vinis health <55.',
    startDate: '2026-07-01',
    endDate: '2026-08-15',
    budget: 42000,
    tasks: [
      {
        id: 't-201',
        title: 'Site survey with turf consultant',
        status: 'done',
        assigneeId: 'los-003', assigneeName: 'Sipho Zulu',
        startDate: '2026-07-01', endDate: '2026-07-05', dueDate: '2026-07-05',
        equipment: [],
        people: [
          { id: 'p-201-1', type: 'vendor', vendorId: 'v-004', name: 'JR Turf Consulting', role: 'Independent audit', rate: 5500, rateUnit: 'once_off', units: 1 },
        ],
      },
      {
        id: 't-202',
        title: 'Turf delivery + laying',
        status: 'in_progress',
        assigneeId: 'los-003', assigneeName: 'Sipho Zulu',
        startDate: '2026-07-08', endDate: '2026-07-20', dueDate: '2026-07-20',
        equipment: [
          { id: 'e-202-1', name: 'Kikuyu turf rolls · 200m²', qty: 200, unitCost: 85, source: 'vendor', vendorId: 'v-001' },
          { id: 'e-202-2', name: 'Top dressing loam · tonnes', qty: 3, unitCost: 2200, source: 'vendor', vendorId: 'v-001' },
        ],
        people: [
          { id: 'p-202-1', type: 'internal', staffId: 'los-003', name: 'Sipho Zulu', role: 'Site oversight', rate: 4200, rateUnit: 'day', units: 5 },
          { id: 'p-202-2', type: 'vendor', vendorId: 'v-001', name: 'Green Turf Solutions', role: 'Turf contractor', rate: 3800, rateUnit: 'day', units: 4 },
        ],
      },
      {
        id: 't-203',
        title: 'Sign off with UKZN CC chair',
        status: 'todo',
        assigneeId: 'los-001', assigneeName: 'Bilal Faku',
        startDate: '2026-08-10', endDate: '2026-08-15', dueDate: '2026-08-15',
        equipment: [],
        people: [
          { id: 'p-203-1', type: 'internal', staffId: 'los-001', name: 'Bilal Faku', role: 'Handover meeting', rate: 4500, rateUnit: 'day', units: 1 },
        ],
      },
    ],
    notes: 'Vinis dropped to 52.2. Post-relay target: 65+.',
  },
  {
    id: 'proj-003',
    name: 'Kingsmead North · Boundary & Sightscreens',
    type: 'ground',
    status: 'planning',
    ownerId: 'los-003',
    owner: 'Sipho Zulu',
    description: 'Replace worn boundary rope + fabricate second-end sightscreen. Prep for T20 hosting.',
    startDate: '2026-08-15',
    endDate: '2026-09-30',
    budget: 28000,
    tasks: [
      {
        id: 't-301',
        title: 'Confirm design with Harlequins CC chair',
        status: 'todo',
        assigneeId: 'los-003', assigneeName: 'Sipho Zulu',
        startDate: '2026-08-15', endDate: '2026-08-20', dueDate: '2026-08-20',
        equipment: [
          { id: 'e-301-1', name: 'Boundary rope · 450m + stakes', qty: 1, unitCost: 4200, source: 'vendor', vendorId: 'v-001' },
        ],
        people: [
          { id: 'p-301-1', type: 'internal', staffId: 'los-003', name: 'Sipho Zulu', role: 'Design lead', rate: 4200, rateUnit: 'day', units: 2 },
        ],
      },
      {
        id: 't-302',
        title: 'Fabricator quotes ×3',
        status: 'in_progress',
        assigneeId: 'los-006', assigneeName: 'Themba Ndlovu',
        startDate: '2026-08-20', endDate: '2026-08-25', dueDate: '2026-08-25',
        equipment: [
          { id: 'e-302-1', name: 'Sightscreen · fabricated + painted', qty: 1, unitCost: 18500, source: 'vendor', vendorId: 'v-005' },
        ],
        people: [
          { id: 'p-302-1', type: 'internal', staffId: 'los-006', name: 'Themba Ndlovu', role: 'Project lead', rate: 3400, rateUnit: 'day', units: 4 },
        ],
      },
    ],
    notes: '',
  },
  {
    id: 'proj-004',
    name: 'Township Junior Development · Q3',
    type: 'community',
    status: 'active',
    ownerId: 'los-004',
    owner: 'Rushil Patel',
    description: 'School-based coaching in Umlazi, Chatsworth & Phoenix. 6-week programme, 12 sessions, ~120 juniors.',
    startDate: '2026-07-15',
    endDate: '2026-08-28',
    budget: 65000,
    tasks: [
      {
        id: 't-401',
        title: 'School coordinator briefings',
        status: 'done',
        assigneeId: 'los-004', assigneeName: 'Rushil Patel',
        startDate: '2026-07-15', endDate: '2026-07-05', dueDate: '2026-07-05',
        equipment: [],
        people: [
          { id: 'p-401-1', type: 'internal', staffId: 'los-004', name: 'Rushil Patel', role: 'Briefings', rate: 3800, rateUnit: 'day', units: 2 },
        ],
      },
      {
        id: 't-402',
        title: 'Coaching kit distribution',
        status: 'in_progress',
        assigneeId: 'los-004', assigneeName: 'Rushil Patel',
        startDate: '2026-07-08', endDate: '2026-07-20', dueDate: '2026-07-20',
        equipment: [
          { id: 'e-402-1', name: 'Junior kit sets · shirt + cap', qty: 120, unitCost: 220, source: 'vendor', vendorId: 'v-015' },
          { id: 'e-402-2', name: 'Softball × 24 packs of 6', qty: 24, unitCost: 480, source: 'vendor', vendorId: 'v-002' },
          { id: 'e-402-3', name: 'Portable stumps + bases × 12 sets', qty: 12, unitCost: 650, source: 'internal' },
        ],
        people: [
          { id: 'p-402-1', type: 'internal', staffId: 'los-004', name: 'Rushil Patel', role: 'Distribution lead', rate: 3800, rateUnit: 'day', units: 3 },
        ],
      },
      {
        id: 't-403',
        title: 'Session 1 · Umlazi Primary',
        status: 'todo',
        assigneeId: 'los-004', assigneeName: 'Rushil Patel',
        startDate: '2026-07-22', endDate: '2026-08-15', dueDate: '2026-07-22',
        equipment: [],
        people: [
          { id: 'p-403-1', type: 'vendor', vendorId: 'v-009', name: 'Sanele Cele Cricket Academy', role: 'Coaching · per session hour', rate: 600, rateUnit: 'hour', units: 36 },
          { id: 'p-403-2', type: 'internal', staffId: 'los-004', name: 'Rushil Patel', role: 'Programme oversight', rate: 3800, rateUnit: 'day', units: 7 },
        ],
      },
      {
        id: 't-404',
        title: 'Mid-programme review with union',
        status: 'todo',
        assigneeId: 'los-001', assigneeName: 'Bilal Faku',
        startDate: '2026-08-01', endDate: '2026-08-05', dueDate: '2026-08-05',
        equipment: [],
        people: [
          { id: 'p-404-1', type: 'internal', staffId: 'los-001', name: 'Bilal Faku', role: 'Union review', rate: 4500, rateUnit: 'day', units: 1 },
        ],
      },
    ],
    notes: 'KZNCU grant of R15k confirmed. Coastal Insurance in-kind: R5k towards kit.',
  },
];

const RATE_UNITS = [
  { key: 'hour', label: 'Per hour', unitL: 'Hours' },
  { key: 'day', label: 'Per day', unitL: 'Days' },
  { key: 'deliverable', label: 'Per deliverable', unitL: 'Deliverables' },
  { key: 'once_off', label: 'Once-off', unitL: 'Fee' },
];

// Compute one person's line cost. Handles both the legacy schema
// (dailyRate + days) and the new one (rate + rateUnit + units).
// Once-off entries always cost `rate × 1`.
function personLineCost(r) {
  const rate = Number(r.rate ?? r.dailyRate ?? 0) || 0;
  const unit = r.rateUnit || 'day';
  if (unit === 'once_off') return rate;
  const units = Number(r.units ?? r.days ?? 0) || 0;
  return rate * units;
}

// MS-Project style: equipment + people live on each activity (task). The
// project spend is the sum of every activity's spend. Legacy top-level
// project.equipment / project.people are still supported so existing seed
// data reads correctly, but new UI writes everything into activities.
function computeTaskSpend(t) {
  const equip = (t?.equipment || []).reduce(
    (s, e) => s + (Number(e.qty) || 0) * (Number(e.unitCost) || 0),
    0
  );
  const people = (t?.people || []).reduce((s, r) => s + personLineCost(r), 0);
  return equip + people;
}

function computeProjectSpend(p) {
  const legacyEquip = (p.equipment || []).reduce(
    (s, e) => s + (Number(e.qty) || 0) * (Number(e.unitCost) || 0),
    0
  );
  const legacyPeople = (p.people || []).reduce((s, r) => s + personLineCost(r), 0);
  const taskSum = (p.tasks || []).reduce((s, t) => s + computeTaskSpend(t), 0);
  return legacyEquip + legacyPeople + taskSum;
}

function projectStatusTone(key) {
  return PROJECT_STATUSES.find((s) => s.key === key)?.tone || 'muted';
}
function projectTypeMeta(key) {
  return PROJECT_TYPES.find((t) => t.key === key) || { key, label: key, icon: '📌', tone: 'muted' };
}
function taskStatusTone(key) {
  return TASK_STATUSES.find((s) => s.key === key)?.tone || 'muted';
}

function vendorStatusTone(s) {
  return s === 'onboarded'
    ? 'teal'
    : s === 'verified'
      ? 'gold'
      : s === 'submitted'
        ? 'gold'
        : s === 'suspended'
          ? 'coral'
          : 'muted';
}

/* ─── FACILITY_OPTIONS · curated dropdown catalogs ───
   One place for every dropdown value used across the Asset assessment
   + Facility costing modals. Extend this to grow the picker set. */

const FACILITY_OPTIONS = {
  // Sub-type / spec dropdowns per asset category. Keys match ASSET_CATEGORIES.
  assetSubType: {
    'Pitch square': ['Natural turf', 'Artificial (astro)', 'Hybrid', 'Concrete + mat', 'Clay'],
    Cover: [
      'Mobile flat cover',
      'Roll-on square cover',
      'Permanent tarpaulin',
      'Rainer / bubble',
      'Hessian frost cover',
    ],
    'Outdoor net': [
      'Grass + rolled square',
      'Concrete base + artificial mat',
      'Astro turf',
      'Rubber mat',
      'Clay + mat',
    ],
    'Indoor net': ['Standard indoor', 'Retractable', 'Cage · caged practice', 'Bay · single lane'],
    'Bowling machine': [
      'BOLA Machine SR',
      'BOLA Junior',
      'Cricket Freaks Pro',
      'Sidearm feeder',
      'Merlyn',
      'ProBatter',
    ],
    Sightscreen: [
      'Fixed timber',
      'Fixed metal',
      'Roll-out fabric',
      'Wheeled composite',
      'Motorised sliding',
    ],
    'Boundary rope': ['Standard fabric rope', 'Dolomite line + rope', 'Wheeled boundary marker'],
    Scoreboard: ['Manual · flip', 'Electronic · LED', 'Digital · app-linked'],
    'Sprinkler / irrigation': [
      'Pop-up irrigation',
      'Manual hose + spray',
      'Drip line',
      'Automated with weather link',
    ],
    'Roller / mower': [
      '1-tonne roller',
      '2-tonne roller',
      'Ride-on mower',
      'Cylinder mower',
      'Rotary mower',
    ],
    Clubhouse: ['Brick + tile', 'Brick + IBR roof', 'Prefab', 'Tent / marquee', 'Portable container', 'Historic listed'],
    'Change rooms': ['Home only', 'Home + away', 'Home + away + officials', 'Unisex', 'Junior + senior split'],
    Toilets: ['Flush · sewer', 'Flush · septic', 'Chemical', 'Composting', 'Disabled access'],
    'Storage / Kit room': ['Lockable · concrete', 'Lockable · steel container', 'Wire cage', 'Under-pavilion'],
    'Kitchen / Bar': ['Full kitchen · gas', 'Full kitchen · electric', 'Braai area', 'Bar service only', 'Vending'],
    Parking: ['Paved', 'Gravel', 'Grass verge', 'Shared with venue', 'Off-street only'],
    'Fencing / security': ['Palisade', 'Diamond mesh', 'Electric fence', 'Wall + razor', 'CCTV monitored', 'Guard on site'],
    Other: [],
  },
  // Curated suppliers (SA cricket + turf-care market).
  supplier: [
    'BOLA Manufacturing',
    'Cricket Freaks',
    'ProCricket SA',
    'Sportsmans Warehouse',
    'Total Sport',
    'JR Turf',
    'Kikuyu Growers Association',
    'John Deere SA',
    'Toro SA',
    'Netpro (nets & fencing)',
    'Local fabrication',
    'Other / import',
  ],
  // Warranty periods for asset purchases.
  warranty: ['3 months', '6 months', '1 year', '2 years', '3 years', '5 years', 'None'],
  // Financial year targets for capex planning.
  targetYear: ['2026/27', '2027/28', '2028/29', '2029/30', '2030/31'],
  // Funders that can pay for capex items.
  funder: [
    'Lions capital grant',
    'KZNCU capital grant',
    'KZNCU pitch renewal programme',
    'Lions development fund',
    'Club reserves',
    'Sponsorship-linked (naming rights)',
    'Provincial capital grant',
    'Municipal sports grant',
    'Fundraising drive',
    'Combined · Union + club',
    'CSA facility fund',
    'Other',
  ],
  // Capex lifecycle statuses.
  capexStatus: ['draft', 'submitted', 'approved', 'funded', 'installed', 'declined'],
  // Priority ladder for capex items.
  priority: ['high', 'medium', 'low'],
  // Asset categories for the capex "which asset does this pay for?" picker.
  assetCategory: [
    'Pitch square',
    'Cover',
    'Outdoor net',
    'Indoor net',
    'Bowling machine',
    'Sightscreen',
    'Boundary rope',
    'Scoreboard',
    'Sprinkler / irrigation',
    'Roller / mower',
    'Clubhouse / changerooms',
    'Fencing / security',
    'Other',
  ],
};

/* ─── Facility ASSETS · linked back to CQI questions ───
   For every facility, we hold the club's CQI-declared counts + a richer
   condition + issues profile that the admin manages. cqiKey lets us
   badge each asset section with its CQI provenance. */

const FACILITY_ASSETS = FACILITIES.reduce((acc, f) => {
  const club = SAMPLE_CLUBS.find((c) => c.id === f.clubId);
  const r = (s) => seededRand(f.clubId, 400 + s);
  const cqi = club?.cqi || 0;
  // Derive counts that scale roughly with the club's CQI score
  const grassNets = Math.max(2, Math.round(2 + r(1) * 6 + (cqi / 100) * 3));
  const artNets = Math.max(0, Math.round(r(2) * 4 + (cqi / 100) * 2));
  const indoorNets = cqi > 75 && r(3) > 0.55 ? Math.round(r(4) * 3 + 1) : 0;
  const hasCovers = r(5) > 0.35;
  const coversCount = hasCovers ? Math.round(r(6) * 2) + 1 : 0;
  const bowlingMachines = cqi > 70 && r(7) > 0.55 ? Math.round(r(8) * 2) + 1 : 0;

  return {
    ...acc,
    [f.clubId]: {
      pitch: {
        count: Math.max(1, Math.round(r(10) * 2) + 1),
        type: f.clubId === 'ukzn' || r(11) > 0.55 ? 'Natural turf' : 'Artificial (astro)',
        squareSize: '28×24 m',
        squareStrips: Math.round(r(12) * 3) + 6, // 6-9 wickets
        condition: 3.2 + r(13) * 1.6, // 3.2–4.8 / 5
        soilProfile: r(14) > 0.55 ? 'Loam · kikuyu blend' : 'Sandy loam · rye',
        drainageRating: r(15) > 0.65 ? 'Good' : r(15) > 0.35 ? 'Adequate' : 'Poor',
        lastRelaid: r(16) > 0.5 ? '2024-08' : '2023-05',
        issues: [
          r(17) > 0.6 && 'Wear on middle strip',
          r(18) > 0.7 && 'Slight settlement at both ends',
          r(19) > 0.75 && 'Bare patches near popping crease',
        ].filter(Boolean),
        cqiKey: 'fieldsGrass',
      },
      covers: {
        has: hasCovers,
        count: coversCount,
        type: !hasCovers ? '—' : r(20) > 0.55 ? 'Mobile flat covers' : 'Roll-on square covers',
        condition: hasCovers ? 2.5 + r(21) * 2.2 : 0,
        age: hasCovers ? Math.round(r(22) * 7) + 2 : 0,
        replacementCost: hasCovers ? Math.round(r(23) * 100 + 60) * 1000 : 180000,
        issues: hasCovers
          ? [
              r(24) > 0.5 && 'Wheel bearing wear',
              r(25) > 0.6 && 'Torn corner grommet',
              r(26) > 0.75 && 'Waterproofing failing at seams',
            ].filter(Boolean)
          : ['No covers on site — pitch exposed to rain'],
        cqiKey: 'covers',
      },
      nets: {
        outdoor: {
          count: grassNets + artNets,
          grass: grassNets,
          artificial: artNets,
          surface: artNets > grassNets ? 'Concrete base + artificial mat' : 'Rolled grass square',
          condition: 3.0 + r(30) * 1.8,
          lastResurfaced: '2024-03',
          issues: [
            r(31) > 0.55 && `${Math.round(r(32) * grassNets)} nets have tears on side mesh`,
            r(33) > 0.7 && 'Concrete base cracking on lane 3',
          ].filter(Boolean),
          cqiKey: 'netsGrass',
        },
        indoor: {
          count: indoorNets,
          condition: indoorNets > 0 ? 3.5 + r(34) * 1.3 : 0,
          issues: indoorNets > 0 ? [] : ['No indoor facility on site'],
          cqiKey: 'netsIndoor',
        },
        bowlingMachines: {
          count: bowlingMachines,
          model: bowlingMachines > 0 ? (r(35) > 0.5 ? 'BOLA Machine SR' : 'Cricket Freaks Pro') : '—',
          condition: bowlingMachines > 0 ? 'Working' : 'None',
          lastService: bowlingMachines > 0 ? '2026-03-14' : '—',
          issues:
            bowlingMachines > 0
              ? r(36) > 0.7
                ? ['Feeder mechanism jams intermittently']
                : []
              : ['No bowling machine on inventory'],
          cqiKey: 'bowlingMachines',
        },
      },
      support: {
        sightscreensBothEnds: r(40) > 0.45,
        scoreboard: r(41) > 0.4,
        boundaryRope: r(42) > 0.5,
        cqiKeys: { sightscreens: 'sightscreens', scoreboard: 'scoreboard', boundary: 'boundary' },
      },
    },
  };
}, {});

// Formatting helpers
function conditionWord(score /* /5 */) {
  if (score >= 4.3) return 'Excellent';
  if (score >= 3.6) return 'Good';
  if (score >= 2.8) return 'Fair';
  if (score >= 1.8) return 'Poor';
  return 'Critical';
}
function conditionTone(score) {
  if (score >= 3.6) return 'teal';
  if (score >= 2.8) return 'gold';
  return 'coral';
}

/* ─── FACILITY_CAPEX · investment requirements per facility ───
   The admin uses this to plan and justify union / provincial grant
   requests. Each item ties to an asset class (pitch / covers / nets /
   bowling / support) so the Investment plan tab can group them. */

const CAPEX_TEMPLATES = [
  {
    asset: 'covers',
    title: 'Upgrade to permanent roll-on rainer covers',
    justify:
      'Current mobile covers 6+ years old and waterproofing failing at seams. Rain-affected fixtures cost the club R 12k+ in refund/replay costs last season.',
    cost: 180000,
    priority: 'high',
    funder: 'KZNCU capital grant + club contribution',
    targetYear: '2026/27',
  },
  {
    asset: 'nets',
    title: 'Add 2 outdoor grass nets + resurface existing 4',
    justify:
      'Current 4 nets over-utilised (junior + senior programs share slots). Two are unusable due to mesh damage. Expansion opens up junior program capacity.',
    cost: 95000,
    priority: 'medium',
    funder: 'Lions development fund',
    targetYear: '2026/27',
  },
  {
    asset: 'bowling',
    title: 'Purchase 1× BOLA Machine SR bowling machine',
    justify:
      'No bowling machine on inventory. Coaches currently rent from a nearby club (R 400/session). Payback in ~18 months on rental savings.',
    cost: 42000,
    priority: 'medium',
    funder: 'Club reserves',
    targetYear: '2027/28',
  },
  {
    asset: 'pitch',
    title: 'Relay pitch square (top 100mm loam + reseed)',
    justify:
      'Middle strip worn beyond safe use. Third-year relay is due per KZNCU turf standard. Extends life to 2032.',
    cost: 55000,
    priority: 'medium',
    funder: 'Union pitch renewal programme',
    targetYear: '2026/27',
  },
  {
    asset: 'support',
    title: 'New sightscreens (both ends)',
    justify:
      'Current makeshift boards fail KZNCU premier-league inspection. Blocking eligibility for Premier promotion.',
    cost: 28000,
    priority: 'high',
    funder: 'Club fundraising + KZNCU',
    targetYear: '2026/27',
  },
  {
    asset: 'nets',
    title: 'Add 1× indoor practice net (winter programme)',
    justify:
      'No all-weather practice option. Winter drop-off in player attendance is 40%+. Would enable a winter academy.',
    cost: 210000,
    priority: 'low',
    funder: 'Sponsorship-linked (naming rights)',
    targetYear: '2028/29',
  },
];

const FACILITY_CAPEX = FACILITIES.reduce((acc, f) => {
  const r = (s) => seededRand(f.clubId, 500 + s);
  const assets = FACILITY_ASSETS[f.clubId];
  const items = [];
  // Emit capex items that fit this facility's gaps
  if (!assets.covers.has || assets.covers.age >= 5) {
    items.push({ ...CAPEX_TEMPLATES[0], id: `cap-${f.clubId}-covers`, status: r(1) > 0.6 ? 'submitted' : 'draft' });
  }
  if (assets.nets.outdoor.count < 6) {
    items.push({ ...CAPEX_TEMPLATES[1], id: `cap-${f.clubId}-nets`, status: r(2) > 0.5 ? 'submitted' : 'draft' });
  }
  if (assets.nets.bowlingMachines.count === 0) {
    items.push({ ...CAPEX_TEMPLATES[2], id: `cap-${f.clubId}-bowling`, status: r(3) > 0.5 ? 'draft' : 'submitted' });
  }
  if (assets.pitch.condition < 4.0) {
    items.push({ ...CAPEX_TEMPLATES[3], id: `cap-${f.clubId}-pitch`, status: r(4) > 0.55 ? 'approved' : 'submitted' });
  }
  if (!assets.support.sightscreensBothEnds) {
    items.push({ ...CAPEX_TEMPLATES[4], id: `cap-${f.clubId}-support`, status: r(5) > 0.4 ? 'submitted' : 'draft' });
  }
  if (assets.nets.indoor.count === 0 && r(6) > 0.7) {
    items.push({ ...CAPEX_TEMPLATES[5], id: `cap-${f.clubId}-indoor`, status: 'draft' });
  }
  acc[f.clubId] = items;
  return acc;
}, {});

/* ─── FACILITY_MAINTENANCE_SCHEDULE · recurring planned tasks ───
   Distinct from reactive job cards. Weekly/monthly/quarterly maintenance
   that the admin needs to budget for and staff against. */

const MAINT_TEMPLATES = [
  { asset: 'pitch',   frequency: 'weekly',    task: 'Mow pitch square to 12mm + roll',            cost: 250 },
  { asset: 'pitch',   frequency: 'weekly',    task: 'Outfield mow to 18mm',                       cost: 350 },
  { asset: 'pitch',   frequency: 'monthly',   task: 'Aerate + top-dress bare patches',            cost: 900 },
  { asset: 'pitch',   frequency: 'seasonal',  task: 'End-of-season relay + reseed',               cost: 12000 },
  { asset: 'covers',  frequency: 'monthly',   task: 'Wheel bearing service + waterproof check',   cost: 400 },
  { asset: 'covers',  frequency: 'seasonal',  task: 'Deep clean + re-treat waterproof surface',   cost: 1800 },
  { asset: 'nets',    frequency: 'weekly',    task: 'Sweep + rake nets · check mesh',             cost: 180 },
  { asset: 'nets',    frequency: 'quarterly', task: 'Repair mesh tears + tighten fixings',        cost: 1200 },
  { asset: 'nets',    frequency: 'seasonal',  task: 'Replace worn matting / mesh panels',         cost: 6000 },
  { asset: 'bowling', frequency: 'quarterly', task: 'Bowling machine service + feeder overhaul',  cost: 1400 },
  { asset: 'support', frequency: 'monthly',   task: 'Sightscreen · wheel + paint touch-up',       cost: 320 },
  { asset: 'support', frequency: 'monthly',   task: 'Scoreboard bulb + digit check',              cost: 200 },
];

const FACILITY_MAINTENANCE_SCHEDULE = FACILITIES.reduce((acc, f) => {
  const ownership = FACILITY_OWNERSHIP[f.clubId];
  const staff = [ownership.head, ...ownership.assistants];
  const assets = FACILITY_ASSETS[f.clubId];
  const r = (s) => seededRand(f.clubId, 600 + s);
  const items = MAINT_TEMPLATES
    .filter((t) => {
      if (t.asset === 'covers' && !assets.covers.has) return false;
      if (t.asset === 'bowling' && assets.nets.bowlingMachines.count === 0) return false;
      return true;
    })
    .map((t, i) => {
      const assignee = staff[i % staff.length];
      const daysAhead =
        t.frequency === 'weekly'
          ? Math.round(r(i * 3) * 5) + 1
          : t.frequency === 'monthly'
            ? Math.round(r(i * 5) * 25) + 3
            : t.frequency === 'quarterly'
              ? Math.round(r(i * 7) * 80) + 10
              : 120;
      const nextDue = new Date('2026-06-05');
      nextDue.setDate(nextDue.getDate() + daysAhead);
      return {
        id: `maint-${f.clubId}-${i}`,
        ...t,
        assigneeId: assignee.id,
        assigneeName: assignee.name,
        nextDue: nextDue.toISOString().slice(0, 10),
      };
    });
  acc[f.clubId] = items;
  return acc;
}, {});

// Facility spend ledger — YTD actuals per asset. Prototype: seeded from
// the maintenance schedule with a random-variance factor per club so the
// budget-vs-actual variance panels have honest looking numbers.
const FACILITY_SPEND = FACILITIES.reduce((acc, f) => {
  const schedule = FACILITY_MAINTENANCE_SCHEDULE[f.clubId] || [];
  const monthsElapsed = 8; // pretend we're at month 8 of the year
  const r = (s) => seededRand(f.clubId, 700 + s);
  const byAsset = {};
  schedule.forEach((t) => {
    const yearly =
      t.cost *
      (t.frequency === 'weekly'
        ? 52
        : t.frequency === 'monthly'
          ? 12
          : t.frequency === 'quarterly'
            ? 4
            : 1);
    const budgeted = Math.round((yearly / 12) * monthsElapsed);
    const varianceFactor = 0.75 + r(t.asset.length) * 0.6; // 0.75x – 1.35x
    const actual = Math.round(budgeted * varianceFactor);
    byAsset[t.asset] = byAsset[t.asset] || { budgeted: 0, actual: 0, yearlyBudget: 0 };
    byAsset[t.asset].budgeted += budgeted;
    byAsset[t.asset].actual += actual;
    byAsset[t.asset].yearlyBudget += yearly;
  });
  acc[f.clubId] = {
    monthsElapsed,
    byAsset,
    ytdBudget: Object.values(byAsset).reduce((s, a) => s + a.budgeted, 0),
    ytdActual: Object.values(byAsset).reduce((s, a) => s + a.actual, 0),
    yearlyBudget: Object.values(byAsset).reduce((s, a) => s + a.yearlyBudget, 0),
  };
  return acc;
}, {});

// Roll-up: annualise the maintenance schedule to £ per year
function annualisedMaintCost(facilityId) {
  const items = FACILITY_MAINTENANCE_SCHEDULE[facilityId] || [];
  return items.reduce((s, t) => {
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
}
function capexTotal(facilityId) {
  const items = FACILITY_CAPEX[facilityId] || [];
  return items.reduce((s, c) => s + c.cost, 0);
}

function capexStatusTone(s) {
  return s === 'approved' || s === 'funded' || s === 'installed'
    ? 'teal'
    : s === 'submitted'
      ? 'gold'
      : 'muted';
}
function capexPriorityTone(p) {
  return p === 'high' ? 'coral' : p === 'medium' ? 'gold' : 'muted';
}

// Helpers used by the drilldown UI
function jobStatusTone(s) {
  return s === 'done' ? 'teal' : s === 'in-progress' ? 'gold' : 'coral';
}
function jobPriorityTone(p) {
  return p === 'high' ? 'coral' : p === 'medium' ? 'gold' : 'muted';
}
function loadTone(idx) {
  return idx >= 80 ? 'coral' : idx >= 55 ? 'gold' : 'teal';
}

export {
  DISTRICTS,
  LEAGUES,
  COACHING_LEVELS,
  REQUIRED_DOCS,
  SAMPLE_CLUBS,
  CQI_STRUCTURE,
  SERIES,
  SAMPLE_PLAYERS,
  SAMPLE_CLEARANCE_REQUESTS,
  BATTING_TYPES,
  BOWLER_TYPES,
  HANDS,
  cohortStats,
  docCompletion,
  overallProgress,
  haversineKm,
  fixtureCost,
  generateRoundRobin,
  daysBetween,
  clearanceDaysElapsed,
  isClearanceOverdue,
  clearanceDaysRemaining,
  FACILITIES,
  LIONS_HQ,
  vinisCondition,
  complianceScore,
  complianceBand,
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
  conditionWord,
  conditionTone,
  capexStatusTone,
  capexPriorityTone,
  annualisedMaintCost,
  capexTotal,
  VENDORS,
  VENDOR_CATEGORIES,
  VENDOR_STATUSES,
  VENDOR_SERVICES,
  BEE_LEVELS,
  vendorStatusTone,
  ISSUE_CATEGORIES,
  ISSUE_SEVERITIES,
  ISSUE_LOCATIONS,
  issueCategoriesFor,
  issueLocationsFor,
  severityTone,
  ASSET_CATEGORIES,
  BUILDING_KEYS,
  VENDOR_CATEGORY_GROUPS,
  CLUB_COST_CATEGORIES,
  CLUB_COST_FREQUENCIES,
  CLUB_COST_SEED,
  CLUB_INCOME_CATEGORIES,
  CLUB_INCOME_GROUPS,
  CLUB_PRIMARY_INCOME_GROUPS,
  CLUB_INCOME_SEED,
  SUBSCRIPTION_DEFAULT_ZAR,
  LIONS_OFFICE_STAFF,
  PROJECT_TYPES,
  PROJECT_STATUSES,
  TASK_STATUSES,
  PROJECT_SEED,
  RATE_UNITS,
  personLineCost,
  computeTaskSpend,
  computeProjectSpend,
  projectStatusTone,
  projectTypeMeta,
  taskStatusTone,
};
