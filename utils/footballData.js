// Football Data & Helpers for RedCard App

export const LEAGUES = [
  { id: "ALL", name: "All Leagues", flag: "🌍", code: "ALL" },
  { id: "PL", name: "Premier League", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", code: "PL", country: "England" },
  { id: "PD", name: "La Liga", flag: "🇪🇸", code: "PD", country: "Spain" },
  { id: "SA", name: "Serie A", flag: "🇮🇹", code: "SA", country: "Italy" },
  { id: "BL1", name: "Bundesliga", flag: "🇩🇪", code: "BL1", country: "Germany" },
  { id: "FL1", name: "Ligue 1", flag: "🇫🇷", code: "FL1", country: "France" },
  { id: "CL", name: "Champions League", flag: "🏆", code: "CL", country: "Europe" },
];

export const FORMATIONS = {
  "4-3-3": {
    name: "4-3-3 Attacking",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: "86%", left: "50%" },
      { id: "lb", role: "LB", label: "LB", top: "68%", left: "15%" },
      { id: "cb1", role: "CB", label: "CB", top: "72%", left: "37%" },
      { id: "cb2", role: "CB", label: "CB", top: "72%", left: "63%" },
      { id: "rb", role: "RB", label: "RB", top: "68%", left: "85%" },
      { id: "cm1", role: "CM", label: "LCM", top: "48%", left: "22%" },
      { id: "cdm", role: "CDM", label: "DM", top: "54%", left: "50%" },
      { id: "cm2", role: "CM", label: "RCM", top: "48%", left: "78%" },
      { id: "lw", role: "LW", label: "LW", top: "22%", left: "18%" },
      { id: "st", role: "ST", label: "ST", top: "14%", left: "50%" },
      { id: "rw", role: "RW", label: "RW", top: "22%", left: "82%" },
    ],
  },
  "4-2-3-1": {
    name: "4-2-3-1 Modern",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: "86%", left: "50%" },
      { id: "lb", role: "LB", label: "LB", top: "68%", left: "15%" },
      { id: "cb1", role: "CB", label: "CB", top: "72%", left: "37%" },
      { id: "cb2", role: "CB", label: "CB", top: "72%", left: "63%" },
      { id: "rb", role: "RB", label: "RB", top: "68%", left: "85%" },
      { id: "cdm1", role: "CDM", label: "LDM", top: "53%", left: "35%" },
      { id: "cdm2", role: "CDM", label: "RDM", top: "53%", left: "65%" },
      { id: "lm", role: "LM", label: "LAM", top: "33%", left: "20%" },
      { id: "cam", role: "CAM", label: "CAM", top: "31%", left: "50%" },
      { id: "rm", role: "RM", label: "RAM", top: "33%", left: "80%" },
      { id: "st", role: "ST", label: "ST", top: "14%", left: "50%" },
    ],
  },
  "4-4-2": {
    name: "4-4-2 Classic",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: "86%", left: "50%" },
      { id: "lb", role: "LB", label: "LB", top: "68%", left: "15%" },
      { id: "cb1", role: "CB", label: "CB", top: "72%", left: "38%" },
      { id: "cb2", role: "CB", label: "CB", top: "72%", left: "62%" },
      { id: "rb", role: "RB", label: "RB", top: "68%", left: "85%" },
      { id: "lm", role: "LM", label: "LM", top: "45%", left: "15%" },
      { id: "cm1", role: "CM", label: "LCM", top: "48%", left: "38%" },
      { id: "cm2", role: "CM", label: "RCM", top: "48%", left: "62%" },
      { id: "rm", role: "RM", label: "RM", top: "45%", left: "85%" },
      { id: "st1", role: "ST", label: "LS", top: "18%", left: "35%" },
      { id: "st2", role: "ST", label: "RS", top: "18%", left: "65%" },
    ],
  },
  "3-5-2": {
    name: "3-5-2 Wing-Back",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: "86%", left: "50%" },
      { id: "cb1", role: "CB", label: "LCB", top: "72%", left: "26%" },
      { id: "cb2", role: "CB", label: "CB", top: "75%", left: "50%" },
      { id: "cb3", role: "CB", label: "RCB", top: "72%", left: "74%" },
      { id: "lwb", role: "LWB", label: "LWB", top: "48%", left: "12%" },
      { id: "cm1", role: "CM", label: "LCM", top: "50%", left: "35%" },
      { id: "cam", role: "CAM", label: "AM", top: "36%", left: "50%" },
      { id: "cm2", role: "CM", label: "RCM", top: "50%", left: "65%" },
      { id: "rwb", role: "RWB", label: "RWB", top: "48%", left: "88%" },
      { id: "st1", role: "ST", label: "LS", top: "17%", left: "35%" },
      { id: "st2", role: "ST", label: "RS", top: "17%", left: "65%" },
    ],
  },
};

// League Top Scorers data
export const TOP_SCORERS = {
  PL: [
    { rank: 1, name: "Erling Haaland", team: "Man City", goals: 21, penalties: 4, assists: 3, matches: 22 },
    { rank: 2, name: "Mohamed Salah", team: "Liverpool", goals: 17, penalties: 3, assists: 11, matches: 23 },
    { rank: 3, name: "Cole Palmer", team: "Chelsea", goals: 15, penalties: 5, assists: 8, matches: 22 },
    { rank: 4, name: "Bukayo Saka", team: "Arsenal", goals: 12, penalties: 2, assists: 10, matches: 21 },
    { rank: 5, name: "Alexander Isak", team: "Newcastle", goals: 12, penalties: 1, assists: 2, matches: 19 },
    { rank: 6, name: "Chris Wood", team: "Nott'm Forest", goals: 11, penalties: 1, assists: 1, matches: 23 },
    { rank: 7, name: "Ollie Watkins", team: "Aston Villa", goals: 10, penalties: 0, assists: 6, matches: 22 },
  ],
  PD: [
    { rank: 1, name: "Robert Lewandowski", team: "Barcelona", goals: 19, penalties: 3, assists: 4, matches: 21 },
    { rank: 2, name: "Kylian Mbappé", team: "Real Madrid", goals: 16, penalties: 4, assists: 4, matches: 20 },
    { rank: 3, name: "Raphinha", team: "Barcelona", goals: 14, penalties: 1, assists: 9, matches: 21 },
    { rank: 4, name: "Vinicius Junior", team: "Real Madrid", goals: 13, penalties: 2, assists: 7, matches: 19 },
    { rank: 5, name: "Ante Budimir", team: "Osasuna", goals: 10, penalties: 3, assists: 2, matches: 22 },
    { rank: 6, name: "Ayoze Pérez", team: "Villarreal", goals: 9, penalties: 0, assists: 2, matches: 18 },
  ],
  SA: [
    { rank: 1, name: "Mateo Retegui", team: "Atalanta", goals: 16, penalties: 2, assists: 3, matches: 21 },
    { rank: 2, name: "Marcus Thuram", team: "Inter", goals: 14, penalties: 0, assists: 4, matches: 22 },
    { rank: 3, name: "Lautaro Martínez", team: "Inter", goals: 12, penalties: 1, assists: 3, matches: 20 },
    { rank: 4, name: "Dušan Vlahović", team: "Juventus", goals: 11, penalties: 3, assists: 2, matches: 20 },
    { rank: 5, name: "Ademola Lookman", team: "Atalanta", goals: 10, penalties: 1, assists: 6, matches: 19 },
    { rank: 6, name: "Khvicha Kvaratskhelia", team: "Napoli", goals: 9, penalties: 1, assists: 5, matches: 21 },
  ],
  BL1: [
    { rank: 1, name: "Harry Kane", team: "Bayern Munich", goals: 22, penalties: 4, assists: 7, matches: 20 },
    { rank: 2, name: "Omar Marmoush", team: "Frankfurt", goals: 17, penalties: 2, assists: 9, matches: 19 },
    { rank: 3, name: "Tim Kleindienst", team: "M'gladbach", goals: 11, penalties: 1, assists: 3, matches: 20 },
    { rank: 4, name: "Victor Boniface", team: "Leverkusen", goals: 10, penalties: 0, assists: 4, matches: 18 },
    { rank: 5, name: "Serhou Guirassy", team: "Dortmund", goals: 10, penalties: 2, assists: 2, matches: 17 },
  ],
  FL1: [
    { rank: 1, name: "Bradley Barcola", team: "PSG", goals: 14, penalties: 0, assists: 5, matches: 21 },
    { rank: 2, name: "Mason Greenwood", team: "Marseille", goals: 12, penalties: 3, assists: 4, matches: 21 },
    { rank: 3, name: "Jonathan David", team: "Lille", goals: 11, penalties: 2, assists: 3, matches: 20 },
    { rank: 4, name: "Ousmane Dembélé", team: "PSG", goals: 9, penalties: 1, assists: 8, matches: 19 },
    { rank: 5, name: "Alexandre Lacazette", team: "Lyon", goals: 9, penalties: 2, assists: 2, matches: 20 },
  ],
};

// League Top Assists data
export const TOP_ASSISTS = {
  PL: [
    { rank: 1, name: "Mohamed Salah", team: "Liverpool", assists: 11, matches: 23 },
    { rank: 2, name: "Bukayo Saka", team: "Arsenal", assists: 10, matches: 21 },
    { rank: 3, name: "Cole Palmer", team: "Chelsea", assists: 8, matches: 22 },
    { rank: 4, name: "James Maddison", team: "Tottenham", assists: 7, matches: 20 },
    { rank: 5, name: "Kevin De Bruyne", team: "Man City", assists: 6, matches: 15 },
  ],
  PD: [
    { rank: 1, name: "Lamine Yamal", team: "Barcelona", assists: 10, matches: 20 },
    { rank: 2, name: "Raphinha", team: "Barcelona", assists: 9, matches: 21 },
    { rank: 3, name: "Vinicius Junior", team: "Real Madrid", assists: 7, matches: 19 },
    { rank: 4, name: "Alex Baena", team: "Villarreal", assists: 7, matches: 21 },
    { rank: 5, name: "Antoine Griezmann", team: "Atlético Madrid", assists: 6, matches: 22 },
  ],
  SA: [
    { rank: 1, name: "Ademola Lookman", team: "Atalanta", assists: 6, matches: 19 },
    { rank: 2, name: "Khvicha Kvaratskhelia", team: "Napoli", assists: 5, matches: 21 },
    { rank: 3, name: "Christian Pulisic", team: "AC Milan", assists: 5, matches: 20 },
    { rank: 4, name: "Federico Dimarco", team: "Inter", assists: 5, matches: 21 },
  ],
  BL1: [
    { rank: 1, name: "Omar Marmoush", team: "Frankfurt", assists: 9, matches: 19 },
    { rank: 2, name: "Harry Kane", team: "Bayern Munich", assists: 7, matches: 20 },
    { rank: 3, name: "Florian Wirtz", team: "Leverkusen", assists: 7, matches: 20 },
    { rank: 4, name: "Michael Olise", team: "Bayern Munich", assists: 6, matches: 19 },
  ],
  FL1: [
    { rank: 1, name: "Ousmane Dembélé", team: "PSG", assists: 8, matches: 19 },
    { rank: 2, name: "Bradley Barcola", team: "PSG", assists: 5, matches: 21 },
    { rank: 3, name: "Moses Simon", team: "Nantes", assists: 5, matches: 20 },
  ],
};

// Generate rich match details (Stats, Events, Pitch Lineups, H2H, Commentary)
export function getRichMatchDetails(match) {
  const home = match.home || "Home Team";
  const away = match.away || "Away Team";
  const isFinished = match.status === "Full-Time" || match.status === "FINISHED" || match.status === "FT";
  const isLive = match.status === "Live" || match.status === "IN_PLAY" || match.status === "PAUSED";

  // Parse scores
  let homeScore = 0;
  let awayScore = 0;
  if (match.score && match.score.includes("-")) {
    const parts = match.score.split("-").map((s) => parseInt(s.trim(), 10));
    homeScore = isNaN(parts[0]) ? 1 : parts[0];
    awayScore = isNaN(parts[1]) ? 1 : parts[1];
  } else if (isFinished) {
    homeScore = 2;
    awayScore = 1;
  }

  // Realistic Events
  const events = [];
  if (isLive || isFinished) {
    // Generate events consistent with the score
    if (homeScore > 0) {
      events.push({
        minute: 23,
        team: "home",
        type: "goal",
        player: `${home} Scorer`,
        detail: "Right foot shot to the bottom corner",
      });
    }
    events.push({
      minute: 38,
      team: "away",
      type: "yellow_card",
      player: `${away} Defender`,
      detail: "Tactical foul in midfield",
    });
    if (awayScore > 0) {
      events.push({
        minute: 54,
        team: "away",
        type: "goal",
        player: `${away} Striker`,
        detail: "Header from corner kick",
      });
    }
    if (homeScore > 1) {
      events.push({
        minute: 71,
        team: "home",
        type: "goal",
        player: `${home} Playmaker`,
        detail: "Curling effort from outside the box",
      });
    }
    // Red Card feature!
    events.push({
      minute: 82,
      team: awayScore >= homeScore ? "home" : "away",
      type: "red_card",
      player: `${awayScore >= homeScore ? home : away} Midfielder`,
      detail: "Second yellow card / serious foul play",
    });
    events.push({
      minute: 85,
      team: "home",
      type: "sub",
      playerIn: "Fresh Striker",
      playerOut: "Tired Forward",
      detail: "Tactical substitution",
    });
  }

  // Sort events chronologically
  events.sort((a, b) => a.minute - b.minute);

  // Realistic Stats
  const possessionHome = Math.floor(45 + Math.random() * 18);
  const possessionAway = 100 - possessionHome;
  const stats = [
    { label: "Possession", home: `${possessionHome}%`, away: `${possessionAway}%`, homeVal: possessionHome, awayVal: possessionAway },
    { label: "Expected Goals (xG)", home: (homeScore * 0.72 + 0.35).toFixed(2), away: (awayScore * 0.68 + 0.28).toFixed(2), homeVal: (homeScore + 0.5) * 20, awayVal: (awayScore + 0.5) * 20 },
    { label: "Total Shots", home: (homeScore * 4 + 5), away: (awayScore * 3 + 4), homeVal: (homeScore * 4 + 5) * 4, awayVal: (awayScore * 3 + 4) * 4 },
    { label: "Shots on Target", home: Math.max(homeScore, 4), away: Math.max(awayScore, 3), homeVal: Math.max(homeScore, 4) * 8, awayVal: Math.max(awayScore, 3) * 8 },
    { label: "Corner Kicks", home: 6, away: 4, homeVal: 60, awayVal: 40 },
    { label: "Fouls", home: 11, away: 13, homeVal: 45, awayVal: 55 },
    { label: "Yellow Cards", home: 2, away: 3, homeVal: 40, awayVal: 60 },
    { label: "Red Cards", home: 0, away: 1, homeVal: 0, awayVal: 100 },
    { label: "Offsides", home: 2, away: 1, homeVal: 66, awayVal: 33 },
    { label: "Goalkeeper Saves", home: 3, away: 5, homeVal: 37, awayVal: 63 },
  ];

  // Tactical Starting XI Lineups
  const homeLineup = {
    formation: "4-3-3",
    manager: "Head Coach",
    startingXI: [
      { num: 1, name: "Keeper", pos: "GK", grid: { top: "86%", left: "50%" } },
      { num: 2, name: "Right Back", pos: "RB", grid: { top: "68%", left: "85%" } },
      { num: 4, name: "Centre Back", pos: "CB", grid: { top: "72%", left: "62%" } },
      { num: 5, name: "Centre Back", pos: "CB", grid: { top: "72%", left: "38%" } },
      { num: 3, name: "Left Back", pos: "LB", grid: { top: "68%", left: "15%" } },
      { num: 6, name: "Holding Mid", pos: "CDM", grid: { top: "54%", left: "50%" } },
      { num: 8, name: "Box-to-Box", pos: "CM", grid: { top: "46%", left: "75%" } },
      { num: 10, name: "Playmaker", pos: "CAM", grid: { top: "46%", left: "25%" } },
      { num: 7, name: "Right Winger", pos: "RW", grid: { top: "24%", left: "82%" } },
      { num: 9, name: "Target Man", pos: "ST", grid: { top: "15%", left: "50%" } },
      { num: 11, name: "Left Winger", pos: "LW", grid: { top: "24%", left: "18%" } },
    ],
    subs: ["Sub GK (13)", "Defender (15)", "Midfielder (17)", "Winger (19)", "Forward (21)"],
  };

  const awayLineup = {
    formation: "4-2-3-1",
    manager: "Head Coach",
    startingXI: [
      { num: 1, name: "Keeper", pos: "GK", grid: { top: "86%", left: "50%" } },
      { num: 20, name: "Right Back", pos: "RB", grid: { top: "68%", left: "85%" } },
      { num: 25, name: "Centre Back", pos: "CB", grid: { top: "72%", left: "62%" } },
      { num: 26, name: "Centre Back", pos: "CB", grid: { top: "72%", left: "38%" } },
      { num: 12, name: "Left Back", pos: "LB", grid: { top: "68%", left: "15%" } },
      { num: 16, name: "Pivot", pos: "CDM", grid: { top: "54%", left: "65%" } },
      { num: 18, name: "Pivot", pos: "CDM", grid: { top: "54%", left: "35%" } },
      { num: 22, name: "Right Winger", pos: "RM", grid: { top: "34%", left: "80%" } },
      { num: 8, name: "Number 10", pos: "CAM", grid: { top: "32%", left: "50%" } },
      { num: 11, name: "Left Winger", pos: "LM", grid: { top: "34%", left: "20%" } },
      { num: 9, name: "Striker", pos: "ST", grid: { top: "15%", left: "50%" } },
    ],
    subs: ["Backup GK (31)", "Full Back (14)", "Anchor Mid (23)", "Striker (29)"],
  };

  // H2H Record
  const h2h = {
    totalMatches: 8,
    homeWins: 4,
    draws: 2,
    awayWins: 2,
    recentMeetings: [
      { date: "15 Dec 2024", score: `${home} 2 - 0 ${away}`, winner: "home" },
      { date: "24 Apr 2024", score: `${away} 1 - 1 ${home}`, winner: "draw" },
      { date: "03 Nov 2023", score: `${home} 3 - 2 ${away}`, winner: "home" },
      { date: "12 Feb 2023", score: `${away} 2 - 1 ${home}`, winner: "away" },
    ],
    homeForm: ["W", "W", "D", "W", "L"],
    awayForm: ["L", "W", "W", "D", "W"],
  };

  // Live Commentary
  const commentary = [
    { minute: "90+3'", title: "Full-Time Whistle", text: "The referee signals the end of an electric 90 minutes filled with intense drama!" },
    { minute: "89'", title: "Crucial Save", text: "The goalkeeper stretches out a glove to deny a goalbound volley!" },
    { minute: "82'", title: "RED CARD!", text: "Disciplinary action! High boot foul resulting in a straight dismissal." },
    { minute: "71'", title: "GOAL! Masterclass", text: "Sensational technique curled into the top corner. Unstoppable strike!" },
    { minute: "54'", title: "GOAL! Equaliser", text: "Clinical header from 6 yards out off a pinpoint corner delivery." },
    { minute: "45'", title: "Half-Time", text: "Both managers head down the tunnel to prepare second-half tactical shifts." },
    { minute: "23'", title: "GOAL! Opener", text: "Low drive into the bottom corner after a rapid counter-attacking sequence." },
    { minute: "1'", title: "Kick-Off", text: "Under the lights, the match is officially underway!" },
  ];

  return {
    homeScore,
    awayScore,
    events,
    stats,
    homeLineup,
    awayLineup,
    h2h,
    commentary,
    venue: match.venue || "Metropolitan Stadium",
    referee: match.referee || "Michael Oliver",
    competitionName: match.competition?.name || "Premier League",
  };
}

// Fallback high-quality football news articles
export const FALLBACK_NEWS = [
  {
    title: "Champions League Quarter-Finals Draw: Giants Clash in Thrilling Ties",
    description: "Europe's elite prepare for high-stakes European nights as defending champions meet formidable rivals in knockout showdowns.",
    url: "https://www.uefa.com/uefachampionsleague/",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
    source: "Sky Sports Football",
    publishedAt: "2 hours ago",
    category: "Champions League",
  },
  {
    title: "Transfer Pulse: Top European Clubs Target Summer Blockbuster Signings",
    description: "Scouts and sporting directors mobilize as premier talents across the globe become targets in a record-breaking market.",
    url: "https://theathletic.com/football/",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    source: "The Athletic",
    publishedAt: "4 hours ago",
    category: "Transfers",
  },
  {
    title: "Tactical Breakdown: How High-Pressing Inverted Full-Backs Are Reshaping the Modern Game",
    description: "Managers across the top 5 leagues are revolutionizing transitional dynamics with fluid midfield overloads.",
    url: "https://www.coachesvoice.com/",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80",
    source: "Coaches' Voice",
    publishedAt: "6 hours ago",
    category: "Tactics",
  },
  {
    title: "Title Race Showdown: Crucial Clashes That Will Decide League Glory",
    description: "With only single-digit points separating the summit, every touch, tackle, and VAR call carries championship weight.",
    url: "https://www.bbc.com/sport/football",
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80",
    source: "BBC Sport",
    publishedAt: "8 hours ago",
    category: "Premier League",
  },
  {
    title: "Golden Boot Watch: Striker Power Rankings and Expected Goals Analysis",
    description: "Haaland, Mbappe, and Kane continue historic scoring runs as Europe's finest frontmen rewrite domestic records.",
    url: "https://www.goal.com/en",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80",
    source: "Goal.com",
    publishedAt: "12 hours ago",
    category: "Top Scorers",
  },
];

