// Football Data, Real Player Photos, Formations & Helpers for Football App

export const LEAGUES = [
  { id: "ALL", name: "All Leagues", icon: "earth", iconFamily: "Ionicons", code: "ALL" },
  { id: "PL", name: "Premier League", icon: "shield-crown", iconFamily: "MaterialCommunityIcons", code: "PL", country: "England" },
  { id: "PD", name: "La Liga", icon: "shield-sun", iconFamily: "MaterialCommunityIcons", code: "PD", country: "Spain" },
  { id: "SA", name: "Serie A", icon: "shield-star", iconFamily: "MaterialCommunityIcons", code: "SA", country: "Italy" },
  { id: "BL1", name: "Bundesliga", icon: "shield-half-full", iconFamily: "MaterialCommunityIcons", code: "BL1", country: "Germany" },
  { id: "FL1", name: "Ligue 1", icon: "shield-check", iconFamily: "MaterialCommunityIcons", code: "FL1", country: "France" },
  { id: "CL", name: "Champions League", icon: "trophy", iconFamily: "Ionicons", code: "CL", country: "Europe" },
];

// Real Player Face Headshots Database
export const PLAYER_PHOTOS = {
  // Strikers & Forwards
  "Erling Haaland": "https://resources.premierleague.com/premierleague/photos/players/250x250/p223094.png",
  "Mohamed Salah": "https://resources.premierleague.com/premierleague/photos/players/250x250/p118748.png",
  "Bukayo Saka": "https://resources.premierleague.com/premierleague/photos/players/250x250/p246669.png",
  "Cole Palmer": "https://resources.premierleague.com/premierleague/photos/players/250x250/p244851.png",
  "Kylian Mbappé": "https://assets.laliga.com/assets/2024/07/16/xlarge/b4b3b1850d53c391309b671a5c6046e7.png",
  "Vinicius Junior": "https://assets.laliga.com/assets/2024/07/16/xlarge/24a13d78c3b9b46e3cb5b3e654eb683e.png",
  "Robert Lewandowski": "https://assets.laliga.com/assets/2024/07/16/xlarge/f0808cf70b92db26a310c8ce7510d291.png",
  "Lamine Yamal": "https://assets.laliga.com/assets/2024/07/16/xlarge/d4d98a00bf8a08c5c998f0607d7301c4.png",
  "Raphinha": "https://assets.laliga.com/assets/2024/07/16/xlarge/9f7e80fc8beabdeebf8fc009d7df3f24.png",
  "Harry Kane": "https://img.bundesliga.com/tachyon/sites/2/2024/08/Kane_Harry_FCB_2425_01.png",
  "Alexander Isak": "https://resources.premierleague.com/premierleague/photos/players/250x250/p219168.png",
  "Ollie Watkins": "https://resources.premierleague.com/premierleague/photos/players/250x250/p178301.png",
  "Kai Havertz": "https://resources.premierleague.com/premierleague/photos/players/250x250/p219847.png",
  "Gabriel Martinelli": "https://resources.premierleague.com/premierleague/photos/players/250x250/p444145.png",
  "Phil Foden": "https://resources.premierleague.com/premierleague/photos/players/250x250/p209244.png",
  "Son Heung-min": "https://resources.premierleague.com/premierleague/photos/players/250x250/p85971.png",
  "Marcus Rashford": "https://resources.premierleague.com/premierleague/photos/players/250x250/p176297.png",
  "Darwin Núñez": "https://resources.premierleague.com/premierleague/photos/players/250x250/p447206.png",
  "Luis Díaz": "https://resources.premierleague.com/premierleague/photos/players/250x250/p244731.png",
  "Nicolas Jackson": "https://resources.premierleague.com/premierleague/photos/players/250x250/p500914.png",
  "Christopher Nkunku": "https://resources.premierleague.com/premierleague/photos/players/250x250/p214104.png",
  "Lautaro Martínez": "https://img.legaseriea.it/vimages/66cc7c1b9ebbc927709a365f/108930.png",
  "Marcus Thuram": "https://img.legaseriea.it/vimages/66cc7c1b9ebbc927709a365f/171540.png",
  "Rafael Leão": "https://img.legaseriea.it/vimages/66cc7c1b9ebbc927709a365f/357164.png",
  "Khvicha Kvaratskhelia": "https://img.legaseriea.it/vimages/66cc7c1b9ebbc927709a365f/497746.png",
  "Victor Osimhen": "https://img.legaseriea.it/vimages/66cc7c1b9ebbc927709a365f/234509.png",
  "Dušan Vlahović": "https://img.legaseriea.it/vimages/66cc7c1b9ebbc927709a365f/365572.png",
  "Christian Pulisic": "https://img.legaseriea.it/vimages/66cc7c1b9ebbc927709a365f/176413.png",
  "Florian Wirtz": "https://img.bundesliga.com/tachyon/sites/2/2024/08/Wirtz_Florian_B04_2425_01.png",
  "Jamal Musiala": "https://img.bundesliga.com/tachyon/sites/2/2024/08/Musiala_Jamal_FCB_2425_01.png",
  "Bradley Barcola": "https://images.psg.fr/media/243760/hero-barcola.png",
  "Ousmane Dembélé": "https://images.psg.fr/media/243760/hero-dembele.png",
  "Antoine Griezmann": "https://assets.laliga.com/assets/2024/07/16/xlarge/2ba2bfebae35db9d46944e057baec46c.png",
  "Julián Álvarez": "https://assets.laliga.com/assets/2024/07/16/xlarge/7ca28dbbf1f609e078e36262ad01fdf7.png",

  // Midfielders
  "Kevin De Bruyne": "https://resources.premierleague.com/premierleague/photos/players/250x250/p61366.png",
  "Martin Ødegaard": "https://resources.premierleague.com/premierleague/photos/players/250x250/p184029.png",
  "Declan Rice": "https://resources.premierleague.com/premierleague/photos/players/250x250/p204480.png",
  "Rodri": "https://resources.premierleague.com/premierleague/photos/players/250x250/p220566.png",
  "Bernardo Silva": "https://resources.premierleague.com/premierleague/photos/players/250x250/p165809.png",
  "Bruno Fernandes": "https://resources.premierleague.com/premierleague/photos/players/250x250/p141746.png",
  "Jude Bellingham": "https://assets.laliga.com/assets/2024/07/16/xlarge/a8d8e583c483f98be128bb9a3eb64eb7.png",
  "Federico Valverde": "https://assets.laliga.com/assets/2024/07/16/xlarge/4b7beaf219ef89569faee9a59cfd2a89.png",
  "Pedri": "https://assets.laliga.com/assets/2024/07/16/xlarge/6c4f03901b228f4bc9b0d1e2e987c041.png",
  "Gavi": "https://assets.laliga.com/assets/2024/07/16/xlarge/935eb82b9a7c36bfe6b31e3d368f3a38.png",
  "Dani Olmo": "https://assets.laliga.com/assets/2024/07/16/xlarge/bf94c77c0b021ef3ae2aa021870bb7e6.png",
  "Joshua Kimmich": "https://img.bundesliga.com/tachyon/sites/2/2024/08/Kimmich_Joshua_FCB_2425_01.png",
  "Nicolò Barella": "https://img.legaseriea.it/vimages/66cc7c1b9ebbc927709a365f/162725.png",
  "Enzo Fernández": "https://resources.premierleague.com/premierleague/photos/players/250x250/p493015.png",
  "Moisés Caicedo": "https://resources.premierleague.com/premierleague/photos/players/250x250/p486672.png",
  "Alexis Mac Allister": "https://resources.premierleague.com/premierleague/photos/players/250x250/p243016.png",
  "Dominik Szoboszlai": "https://resources.premierleague.com/premierleague/photos/players/250x250/p243644.png",
  "Ryan Gravenberch": "https://resources.premierleague.com/premierleague/photos/players/250x250/p433154.png",
  "James Maddison": "https://resources.premierleague.com/premierleague/photos/players/250x250/p172780.png",

  // Defenders
  "William Saliba": "https://resources.premierleague.com/premierleague/photos/players/250x250/p243716.png",
  "Gabriel Magalhães": "https://resources.premierleague.com/premierleague/photos/players/250x250/p224134.png",
  "Virgil van Dijk": "https://resources.premierleague.com/premierleague/photos/players/250x250/p97032.png",
  "Trent Alexander-Arnold": "https://resources.premierleague.com/premierleague/photos/players/250x250/p169187.png",
  "Rúben Dias": "https://resources.premierleague.com/premierleague/photos/players/250x250/p171317.png",
  "Joško Gvardiol": "https://resources.premierleague.com/premierleague/photos/players/250x250/p477424.png",
  "Kyle Walker": "https://resources.premierleague.com/premierleague/photos/players/250x250/p58621.png",
  "Antonio Rüdiger": "https://assets.laliga.com/assets/2024/07/16/xlarge/89efc1fa75e533c373a0cbaf9637b561.png",
  "Jules Koundé": "https://assets.laliga.com/assets/2024/07/16/xlarge/77cc827be9d9f5da03b1fe836cf935f0.png",
  "Pau Cubarsí": "https://assets.laliga.com/assets/2024/07/16/xlarge/1990c7f1a309e6c52a0a2569ba746c07.png",
  "Alphonso Davies": "https://img.bundesliga.com/tachyon/sites/2/2024/08/Davies_Alphonso_FCB_2425_01.png",
  "Achraf Hakimi": "https://images.psg.fr/media/243760/hero-hakimi.png",
  "Alessandro Bastoni": "https://img.legaseriea.it/vimages/66cc7c1b9ebbc927709a365f/171541.png",
  "Federico Dimarco": "https://img.legaseriea.it/vimages/66cc7c1b9ebbc927709a365f/162810.png",
  "Marc Cucurella": "https://resources.premierleague.com/premierleague/photos/players/250x250/p243017.png",

  // Goalkeepers
  "David Raya": "https://resources.premierleague.com/premierleague/photos/players/250x250/p154566.png",
  "Ederson": "https://resources.premierleague.com/premierleague/photos/players/250x250/p121160.png",
  "Alisson Becker": "https://resources.premierleague.com/premierleague/photos/players/250x250/p116535.png",
  "Thibaut Courtois": "https://assets.laliga.com/assets/2024/07/16/xlarge/7cb1fe8ef421fb3d56ec42b6a2fc862a.png",
  "Marc-André ter Stegen": "https://assets.laliga.com/assets/2024/07/16/xlarge/4b5fc0742f9b87ebfc219717ea2d46e2.png",
  "Manuel Neuer": "https://img.bundesliga.com/tachyon/sites/2/2024/08/Neuer_Manuel_FCB_2425_01.png",
  "Gianluigi Donnarumma": "https://images.psg.fr/media/243760/hero-donnarumma.png",
  "Emiliano Martínez": "https://resources.premierleague.com/premierleague/photos/players/250x250/p98980.png",
  "Yann Sommer": "https://img.legaseriea.it/vimages/66cc7c1b9ebbc927709a365f/108929.png",
  "Robert Sánchez": "https://resources.premierleague.com/premierleague/photos/players/250x250/p215059.png",
};

/**
 * Returns a high-res real player photo URL if mapped, or generates a clean sports avatar
 */
export function getPlayerFace(playerName = "") {
  if (!playerName) {
    return "https://cdn.sofifa.net/players/notfound_0_120.png";
  }

  // Exact match
  if (PLAYER_PHOTOS[playerName]) {
    return PLAYER_PHOTOS[playerName];
  }

  // Partial surname/first name match
  const parts = playerName.trim().split(" ");
  const surname = parts[parts.length - 1];
  for (const [key, url] of Object.entries(PLAYER_PHOTOS)) {
    if (key.includes(surname) || key.toLowerCase().includes(playerName.toLowerCase())) {
      return url;
    }
  }

  // Fallback to high-contrast sports portrait avatar
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    playerName
  )}&background=141d2d&color=d7fc5a&bold=true&size=160&rounded=true`;
}

// 12 Tactical Formations with calibrated pitch coordinates
export const FORMATIONS = {
  "4-3-3": {
    name: "4-3-3 Attacking",
    description: "Wide wingers with inverted fullbacks and central attacking midfielder",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: "86%", left: "50%" },
      { id: "lb", role: "LB", label: "LB", top: "68%", left: "15%" },
      { id: "cb1", role: "CB", label: "LCB", top: "72%", left: "37%" },
      { id: "cb2", role: "CB", label: "RCB", top: "72%", left: "63%" },
      { id: "rb", role: "RB", label: "RB", top: "68%", left: "85%" },
      { id: "cm1", role: "CM", label: "LCM", top: "48%", left: "24%" },
      { id: "cdm", role: "CDM", label: "DM", top: "54%", left: "50%" },
      { id: "cm2", role: "CM", label: "RCM", top: "48%", left: "76%" },
      { id: "lw", role: "LW", label: "LW", top: "22%", left: "18%" },
      { id: "st", role: "ST", label: "ST", top: "14%", left: "50%" },
      { id: "rw", role: "RW", label: "RW", top: "22%", left: "82%" },
    ],
  },
  "4-2-3-1": {
    name: "4-2-3-1 Modern Wide",
    description: "Double pivot with attacking trio behind a lone target striker",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: "86%", left: "50%" },
      { id: "lb", role: "LB", label: "LB", top: "68%", left: "15%" },
      { id: "cb1", role: "CB", label: "LCB", top: "72%", left: "37%" },
      { id: "cb2", role: "CB", label: "RCB", top: "72%", left: "63%" },
      { id: "rb", role: "RB", label: "RB", top: "68%", left: "85%" },
      { id: "cdm1", role: "CDM", label: "LDM", top: "53%", left: "34%" },
      { id: "cdm2", role: "CDM", label: "RDM", top: "53%", left: "66%" },
      { id: "lm", role: "LM", label: "LAM", top: "33%", left: "20%" },
      { id: "cam", role: "CAM", label: "CAM", top: "31%", left: "50%" },
      { id: "rm", role: "RM", label: "RAM", top: "33%", left: "80%" },
      { id: "st", role: "ST", label: "ST", top: "14%", left: "50%" },
    ],
  },
  "4-4-2": {
    name: "4-4-2 Classic Flat",
    description: "Solid two banks of four with dual striking partnership",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: "86%", left: "50%" },
      { id: "lb", role: "LB", label: "LB", top: "68%", left: "15%" },
      { id: "cb1", role: "CB", label: "LCB", top: "72%", left: "38%" },
      { id: "cb2", role: "CB", label: "RCB", top: "72%", left: "62%" },
      { id: "rb", role: "RB", label: "RB", top: "68%", left: "85%" },
      { id: "lm", role: "LM", label: "LM", top: "45%", left: "15%" },
      { id: "cm1", role: "CM", label: "LCM", top: "48%", left: "38%" },
      { id: "cm2", role: "CM", label: "RCM", top: "48%", left: "62%" },
      { id: "rm", role: "RM", label: "RM", top: "45%", left: "85%" },
      { id: "st1", role: "ST", label: "LS", top: "18%", left: "35%" },
      { id: "st2", role: "ST", label: "RS", top: "18%", left: "65%" },
    ],
  },
  "4-1-2-1-2": {
    name: "4-1-2-1-2 Diamond",
    description: "Narrow central midfield diamond creating superior midfield control",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: "86%", left: "50%" },
      { id: "lb", role: "LB", label: "LB", top: "68%", left: "15%" },
      { id: "cb1", role: "CB", label: "LCB", top: "72%", left: "38%" },
      { id: "cb2", role: "CB", label: "RCB", top: "72%", left: "62%" },
      { id: "rb", role: "RB", label: "RB", top: "68%", left: "85%" },
      { id: "cdm", role: "CDM", label: "DM", top: "56%", left: "50%" },
      { id: "cm1", role: "CM", label: "LCM", top: "44%", left: "30%" },
      { id: "cm2", role: "CM", label: "RCM", top: "44%", left: "70%" },
      { id: "cam", role: "CAM", label: "CAM", top: "30%", left: "50%" },
      { id: "st1", role: "ST", label: "LS", top: "16%", left: "35%" },
      { id: "st2", role: "ST", label: "RS", top: "16%", left: "65%" },
    ],
  },
  "3-5-2": {
    name: "3-5-2 Wing-Backs",
    description: "High-pressing dynamic wingbacks with 3 central defenders",
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
  "3-4-3": {
    name: "3-4-3 Fluid Front 3",
    description: "Aggressive attacking structure with front three and high midfield line",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: "86%", left: "50%" },
      { id: "cb1", role: "CB", label: "LCB", top: "72%", left: "26%" },
      { id: "cb2", role: "CB", label: "CB", top: "75%", left: "50%" },
      { id: "cb3", role: "CB", label: "RCB", top: "72%", left: "74%" },
      { id: "lm", role: "LM", label: "LM", top: "48%", left: "15%" },
      { id: "cm1", role: "CM", label: "LCM", top: "52%", left: "38%" },
      { id: "cm2", role: "CM", label: "RCM", top: "52%", left: "62%" },
      { id: "rm", role: "RM", label: "RM", top: "48%", left: "85%" },
      { id: "lw", role: "LW", label: "LW", top: "24%", left: "20%" },
      { id: "st", role: "ST", label: "ST", top: "16%", left: "50%" },
      { id: "rw", role: "RW", label: "RW", top: "24%", left: "80%" },
    ],
  },
  "5-3-2": {
    name: "5-3-2 Solid Wall",
    description: "Compact defensive low block ideal for shutting down elite opposition",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: "86%", left: "50%" },
      { id: "lwb", role: "LWB", label: "LWB", top: "66%", left: "12%" },
      { id: "cb1", role: "CB", label: "LCB", top: "73%", left: "31%" },
      { id: "cb2", role: "CB", label: "CB", top: "76%", left: "50%" },
      { id: "cb3", role: "CB", label: "RCB", top: "73%", left: "69%" },
      { id: "rwb", role: "RWB", label: "RWB", top: "66%", left: "88%" },
      { id: "cm1", role: "CM", label: "LCM", top: "48%", left: "28%" },
      { id: "cdm", role: "CDM", label: "DM", top: "52%", left: "50%" },
      { id: "cm2", role: "CM", label: "RCM", top: "48%", left: "72%" },
      { id: "st1", role: "ST", label: "LS", top: "18%", left: "35%" },
      { id: "st2", role: "ST", label: "RS", top: "18%", left: "65%" },
    ],
  },
  "5-2-3": {
    name: "5-2-3 Rapid Counter",
    description: "Resilient 5-man backline launching venomous counter-attacks with wingers",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: "86%", left: "50%" },
      { id: "lwb", role: "LWB", label: "LWB", top: "66%", left: "12%" },
      { id: "cb1", role: "CB", label: "LCB", top: "73%", left: "31%" },
      { id: "cb2", role: "CB", label: "CB", top: "76%", left: "50%" },
      { id: "cb3", role: "CB", label: "RCB", top: "73%", left: "69%" },
      { id: "rwb", role: "RWB", label: "RWB", top: "66%", left: "88%" },
      { id: "cm1", role: "CM", label: "LCM", top: "50%", left: "36%" },
      { id: "cm2", role: "CM", label: "RCM", top: "50%", left: "64%" },
      { id: "lw", role: "LW", label: "LW", top: "24%", left: "20%" },
      { id: "st", role: "ST", label: "ST", top: "16%", left: "50%" },
      { id: "rw", role: "RW", label: "RW", top: "24%", left: "80%" },
    ],
  },
  "4-1-4-1": {
    name: "4-1-4-1 Controlled Possession",
    description: "Anchor defensive midfielder dictating tempo behind a flat midfield 4",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: "86%", left: "50%" },
      { id: "lb", role: "LB", label: "LB", top: "68%", left: "15%" },
      { id: "cb1", role: "CB", label: "LCB", top: "72%", left: "38%" },
      { id: "cb2", role: "CB", label: "RCB", top: "72%", left: "62%" },
      { id: "rb", role: "RB", label: "RB", top: "68%", left: "85%" },
      { id: "cdm", role: "CDM", label: "DM", top: "57%", left: "50%" },
      { id: "lm", role: "LM", label: "LM", top: "38%", left: "16%" },
      { id: "cm1", role: "CM", label: "LCM", top: "40%", left: "38%" },
      { id: "cm2", role: "CM", label: "RCM", top: "40%", left: "62%" },
      { id: "rm", role: "RM", label: "RM", top: "38%", left: "84%" },
      { id: "st", role: "ST", label: "ST", top: "15%", left: "50%" },
    ],
  },
  "4-2-2-2": {
    name: "4-2-2-2 Box Midfield",
    description: "Two holding midfielders and two attacking playmakers feeding two forwards",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: "86%", left: "50%" },
      { id: "lb", role: "LB", label: "LB", top: "68%", left: "15%" },
      { id: "cb1", role: "CB", label: "LCB", top: "72%", left: "38%" },
      { id: "cb2", role: "CB", label: "RCB", top: "72%", left: "62%" },
      { id: "rb", role: "RB", label: "RB", top: "68%", left: "85%" },
      { id: "cdm1", role: "CDM", label: "LDM", top: "54%", left: "35%" },
      { id: "cdm2", role: "CDM", label: "RDM", top: "54%", left: "65%" },
      { id: "cam1", role: "CAM", label: "LCAM", top: "36%", left: "26%" },
      { id: "cam2", role: "CAM", label: "RCAM", top: "36%", left: "74%" },
      { id: "st1", role: "ST", label: "LS", top: "16%", left: "36%" },
      { id: "st2", role: "ST", label: "RS", top: "16%", left: "64%" },
    ],
  },
  "3-4-2-1": {
    name: "3-4-2-1 European Elite",
    description: "Two inside-forwards behind a mobile striker with wing-backs offering width",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: "86%", left: "50%" },
      { id: "cb1", role: "CB", label: "LCB", top: "72%", left: "26%" },
      { id: "cb2", role: "CB", label: "CB", top: "75%", left: "50%" },
      { id: "cb3", role: "CB", label: "RCB", top: "72%", left: "74%" },
      { id: "lwb", role: "LWB", label: "LWB", top: "50%", left: "12%" },
      { id: "cm1", role: "CM", label: "LCM", top: "52%", left: "38%" },
      { id: "cm2", role: "CM", label: "RCM", top: "52%", left: "62%" },
      { id: "rwb", role: "RWB", label: "RWB", top: "50%", left: "88%" },
      { id: "cam1", role: "CAM", label: "LAM", top: "30%", left: "32%" },
      { id: "cam2", role: "CAM", label: "RAM", top: "30%", left: "68%" },
      { id: "st", role: "ST", label: "ST", top: "15%", left: "50%" },
    ],
  },
  "4-3-3-DEF": {
    name: "4-3-3 Holding (4-1-2-3)",
    description: "Deep defensive anchor shielding the center-backs with twin 8s pressing",
    slots: [
      { id: "gk", role: "GK", label: "GK", top: "86%", left: "50%" },
      { id: "lb", role: "LB", label: "LB", top: "68%", left: "15%" },
      { id: "cb1", role: "CB", label: "LCB", top: "72%", left: "37%" },
      { id: "cb2", role: "CB", label: "RCB", top: "72%", left: "63%" },
      { id: "rb", role: "RB", label: "RB", top: "68%", left: "85%" },
      { id: "cdm", role: "CDM", label: "DM", top: "56%", left: "50%" },
      { id: "cm1", role: "CM", label: "LCM", top: "42%", left: "30%" },
      { id: "cm2", role: "CM", label: "RCM", top: "42%", left: "70%" },
      { id: "lw", role: "LW", label: "LW", top: "20%", left: "18%" },
      { id: "st", role: "ST", label: "ST", top: "14%", left: "50%" },
      { id: "rw", role: "RW", label: "RW", top: "20%", left: "82%" },
    ],
  },
};

// Club Verified Squad Database for Realistic Pitch Lineups
const CLUB_ROSTERS = {
  Arsenal: {
    manager: "Mikel Arteta",
    formation: "4-3-3",
    startingXI: [
      { num: 22, name: "David Raya", pos: "GK", grid: { top: "86%", left: "50%" } },
      { num: 4, name: "Ben White", pos: "RB", grid: { top: "68%", left: "85%" } },
      { num: 2, name: "William Saliba", pos: "CB", grid: { top: "72%", left: "62%" } },
      { num: 6, name: "Gabriel Magalhães", pos: "CB", grid: { top: "72%", left: "38%" } },
      { num: 12, name: "Jurrien Timber", pos: "LB", grid: { top: "68%", left: "15%" } },
      { num: 5, name: "Thomas Partey", pos: "CDM", grid: { top: "54%", left: "50%" } },
      { num: 41, name: "Declan Rice", pos: "CM", grid: { top: "46%", left: "30%" } },
      { num: 8, name: "Martin Ødegaard", pos: "CAM", grid: { top: "46%", left: "70%" } },
      { num: 7, name: "Bukayo Saka", pos: "RW", grid: { top: "24%", left: "82%" } },
      { num: 29, name: "Kai Havertz", pos: "ST", grid: { top: "15%", left: "50%" } },
      { num: 11, name: "Gabriel Martinelli", pos: "LW", grid: { top: "24%", left: "18%" } },
    ],
    subs: ["Neto (32)", "Kiwior (15)", "Zinchenko (17)", "Jorginho (20)", "Merino (23)", "Trossard (19)", "Jesus (9)"],
  },
  "Manchester City": {
    manager: "Pep Guardiola",
    formation: "4-2-3-1",
    startingXI: [
      { num: 31, name: "Ederson", pos: "GK", grid: { top: "86%", left: "50%" } },
      { num: 82, name: "Rico Lewis", pos: "RB", grid: { top: "68%", left: "85%" } },
      { num: 3, name: "Rúben Dias", pos: "CB", grid: { top: "72%", left: "62%" } },
      { num: 25, name: "Manuel Akanji", pos: "CB", grid: { top: "72%", left: "38%" } },
      { num: 24, name: "Joško Gvardiol", pos: "LB", grid: { top: "68%", left: "15%" } },
      { num: 8, name: "Mateo Kovačić", pos: "CDM", grid: { top: "54%", left: "35%" } },
      { num: 16, name: "Rodri", pos: "CDM", grid: { top: "54%", left: "65%" } },
      { num: 20, name: "Bernardo Silva", pos: "RM", grid: { top: "34%", left: "80%" } },
      { num: 17, name: "Kevin De Bruyne", pos: "CAM", grid: { top: "32%", left: "50%" } },
      { num: 47, name: "Phil Foden", pos: "LM", grid: { top: "34%", left: "20%" } },
      { num: 9, name: "Erling Haaland", pos: "ST", grid: { top: "15%", left: "50%" } },
    ],
    subs: ["Ortega (18)", "Walker (2)", "Stones (5)", "Aké (6)", "Gündogan (19)", "Nunes (27)", "Doku (11)", "Grealish (10)"],
  },
  Liverpool: {
    manager: "Arne Slot",
    formation: "4-3-3",
    startingXI: [
      { num: 1, name: "Alisson Becker", pos: "GK", grid: { top: "86%", left: "50%" } },
      { num: 66, name: "Trent Alexander-Arnold", pos: "RB", grid: { top: "68%", left: "85%" } },
      { num: 5, name: "Ibrahima Konaté", pos: "CB", grid: { top: "72%", left: "62%" } },
      { num: 4, name: "Virgil van Dijk", pos: "CB", grid: { top: "72%", left: "38%" } },
      { num: 26, name: "Andy Robertson", pos: "LB", grid: { top: "68%", left: "15%" } },
      { num: 38, name: "Ryan Gravenberch", pos: "CDM", grid: { top: "54%", left: "50%" } },
      { num: 10, name: "Alexis Mac Allister", pos: "CM", grid: { top: "46%", left: "30%" } },
      { num: 8, name: "Dominik Szoboszlai", pos: "CAM", grid: { top: "46%", left: "70%" } },
      { num: 11, name: "Mohamed Salah", pos: "RW", grid: { top: "24%", left: "82%" } },
      { num: 9, name: "Darwin Núñez", pos: "ST", grid: { top: "15%", left: "50%" } },
      { num: 7, name: "Luis Díaz", pos: "LW", grid: { top: "24%", left: "18%" } },
    ],
    subs: ["Kelleher (62)", "Gomez (2)", "Quansah (78)", "Tsimikas (21)", "Jones (17)", "Endo (3)", "Gakpo (18)", "Chiesa (14)"],
  },
  "Real Madrid": {
    manager: "Carlo Ancelotti",
    formation: "4-3-3",
    startingXI: [
      { num: 1, name: "Thibaut Courtois", pos: "GK", grid: { top: "86%", left: "50%" } },
      { num: 2, name: "Dani Carvajal", pos: "RB", grid: { top: "68%", left: "85%" } },
      { num: 3, name: "Éder Militão", pos: "CB", grid: { top: "72%", left: "62%" } },
      { num: 22, name: "Antonio Rüdiger", pos: "CB", grid: { top: "72%", left: "38%" } },
      { num: 23, name: "Ferland Mendy", pos: "LB", grid: { top: "68%", left: "15%" } },
      { num: 14, name: "Aurélien Tchouaméni", pos: "CDM", grid: { top: "54%", left: "50%" } },
      { num: 8, name: "Federico Valverde", pos: "CM", grid: { top: "46%", left: "70%" } },
      { num: 5, name: "Jude Bellingham", pos: "CAM", grid: { top: "46%", left: "30%" } },
      { num: 11, name: "Rodrygo", pos: "RW", grid: { top: "24%", left: "82%" } },
      { num: 9, name: "Kylian Mbappé", pos: "ST", grid: { top: "15%", left: "50%" } },
      { num: 7, name: "Vinicius Junior", pos: "LW", grid: { top: "24%", left: "18%" } },
    ],
    subs: ["Lunin (13)", "Vázquez (17)", "García (20)", "Camavinga (6)", "Modrić (10)", "Ceballos (19)", "Güler (15)", "Endrick (16)"],
  },
  Barcelona: {
    manager: "Hansi Flick",
    formation: "4-2-3-1",
    startingXI: [
      { num: 1, name: "Marc-André ter Stegen", pos: "GK", grid: { top: "86%", left: "50%" } },
      { num: 23, name: "Jules Koundé", pos: "RB", grid: { top: "68%", left: "85%" } },
      { num: 2, name: "Pau Cubarsí", pos: "CB", grid: { top: "72%", left: "62%" } },
      { num: 5, name: "Iñigo Martínez", pos: "CB", grid: { top: "72%", left: "38%" } },
      { num: 3, name: "Alejandro Balde", pos: "LB", grid: { top: "68%", left: "15%" } },
      { num: 17, name: "Marc Casadó", pos: "CDM", grid: { top: "54%", left: "35%" } },
      { num: 8, name: "Pedri", pos: "CDM", grid: { top: "54%", left: "65%" } },
      { num: 19, name: "Lamine Yamal", pos: "RM", grid: { top: "34%", left: "80%" } },
      { num: 20, name: "Dani Olmo", pos: "CAM", grid: { top: "32%", left: "50%" } },
      { num: 11, name: "Raphinha", pos: "LM", grid: { top: "34%", left: "20%" } },
      { num: 9, name: "Robert Lewandowski", pos: "ST", grid: { top: "15%", left: "50%" } },
    ],
    subs: ["Peña (13)", "Fort (32)", "Domínguez (36)", "Frenkie de Jong (21)", "Gavi (6)", "Fermín López (16)", "Ferran Torres (7)", "Fati (10)"],
  },
  "Bayern Munich": {
    manager: "Vincent Kompany",
    formation: "4-2-3-1",
    startingXI: [
      { num: 1, name: "Manuel Neuer", pos: "GK", grid: { top: "86%", left: "50%" } },
      { num: 6, name: "Joshua Kimmich", pos: "RB", grid: { top: "68%", left: "85%" } },
      { num: 2, name: "Dayot Upamecano", pos: "CB", grid: { top: "72%", left: "62%" } },
      { num: 3, name: "Kim Min-jae", pos: "CB", grid: { top: "72%", left: "38%" } },
      { num: 19, name: "Alphonso Davies", pos: "LB", grid: { top: "68%", left: "15%" } },
      { num: 16, name: "João Palhinha", pos: "CDM", grid: { top: "54%", left: "35%" } },
      { num: 45, name: "Aleksandar Pavlovic", pos: "CDM", grid: { top: "54%", left: "65%" } },
      { num: 17, name: "Michael Olise", pos: "RM", grid: { top: "34%", left: "80%" } },
      { num: 42, name: "Jamal Musiala", pos: "CAM", grid: { top: "32%", left: "50%" } },
      { num: 7, name: "Serge Gnabry", pos: "LM", grid: { top: "34%", left: "20%" } },
      { num: 9, name: "Harry Kane", pos: "ST", grid: { top: "15%", left: "50%" } },
    ],
    subs: ["Ulreich (26)", "Boey (23)", "Dier (15)", "Guerreiro (22)", "Laimer (27)", "Goretzka (8)", "Sané (10)", "Müller (25)", "Coman (11)"],
  },
  Chelsea: {
    manager: "Enzo Maresca",
    formation: "4-2-3-1",
    startingXI: [
      { num: 1, name: "Robert Sánchez", pos: "GK", grid: { top: "86%", left: "50%" } },
      { num: 27, name: "Malo Gusto", pos: "RB", grid: { top: "68%", left: "85%" } },
      { num: 29, name: "Wesley Fofana", pos: "CB", grid: { top: "72%", left: "62%" } },
      { num: 6, name: "Levi Colwill", pos: "CB", grid: { top: "72%", left: "38%" } },
      { num: 3, name: "Marc Cucurella", pos: "LB", grid: { top: "68%", left: "15%" } },
      { num: 25, name: "Moisés Caicedo", pos: "CDM", grid: { top: "54%", left: "35%" } },
      { num: 8, name: "Enzo Fernández", pos: "CDM", grid: { top: "54%", left: "65%" } },
      { num: 11, name: "Noni Madueke", pos: "RM", grid: { top: "34%", left: "80%" } },
      { num: 20, name: "Cole Palmer", pos: "CAM", grid: { top: "32%", left: "50%" } },
      { num: 19, name: "Jadon Sancho", pos: "LM", grid: { top: "34%", left: "20%" } },
      { num: 15, name: "Nicolas Jackson", pos: "ST", grid: { top: "15%", left: "50%" } },
    ],
    subs: ["Jørgensen (12)", "James (24)", "Tosin (4)", "Badiashile (5)", "Lavia (45)", "Dewsbury-Hall (22)", "Mudryk (10)", "Nkunku (18)", "Neto (7)"],
  },
  Inter: {
    manager: "Simone Inzaghi",
    formation: "3-5-2",
    startingXI: [
      { num: 1, name: "Yann Sommer", pos: "GK", grid: { top: "86%", left: "50%" } },
      { num: 28, name: "Benjamin Pavard", pos: "CB", grid: { top: "72%", left: "26%" } },
      { num: 15, name: "Francesco Acerbi", pos: "CB", grid: { top: "75%", left: "50%" } },
      { num: 95, name: "Alessandro Bastoni", pos: "CB", grid: { top: "72%", left: "74%" } },
      { num: 32, name: "Federico Dimarco", pos: "LWB", grid: { top: "48%", left: "12%" } },
      { num: 22, name: "Henrikh Mkhitaryan", pos: "CM", grid: { top: "50%", left: "35%" } },
      { num: 20, name: "Hakan Çalhanoğlu", pos: "CAM", grid: { top: "36%", left: "50%" } },
      { num: 23, name: "Nicolò Barella", pos: "CM", grid: { top: "50%", left: "65%" } },
      { num: 2, name: "Denzel Dumfries", pos: "RWB", grid: { top: "48%", left: "88%" } },
      { num: 9, name: "Marcus Thuram", pos: "ST", grid: { top: "17%", left: "35%" } },
      { num: 10, name: "Lautaro Martínez", pos: "ST", grid: { top: "17%", left: "65%" } },
    ],
    subs: ["Martinez (13)", "De Vrij (6)", "Bisseck (31)", "Darmian (36)", "Carlos Augusto (30)", "Frattesi (16)", "Zielinski (7)", "Taremi (99)", "Arnautovic (8)"],
  },
};

/**
 * Generates starting XI with photo faces for any team
 */
function buildTeamLineup(teamName = "Club", formationKey = "4-3-3") {
  // If registered in CLUB_ROSTERS
  for (const [key, roster] of Object.entries(CLUB_ROSTERS)) {
    if (teamName.includes(key) || key.includes(teamName)) {
      return {
        manager: roster.manager,
        formation: roster.formation,
        startingXI: roster.startingXI.map((p) => ({
          ...p,
          photo: getPlayerFace(p.name),
        })),
        subs: roster.subs,
      };
    }
  }

  // Generic roster with accurate positions and photos
  const form = FORMATIONS[formationKey] || FORMATIONS["4-3-3"];
  const startingXI = form.slots.map((slot, idx) => {
    const num = idx === 0 ? 1 : idx + 2;
    const name = `${teamName} ${slot.label}`;
    return {
      num,
      name,
      pos: slot.role,
      grid: { top: slot.top, left: slot.left },
      photo: getPlayerFace(name),
    };
  });

  return {
    manager: "Head Coach",
    formation: form.name.split(" ")[0],
    startingXI,
    subs: [
      `Backup GK (${teamName})`,
      `Central Defender (${teamName})`,
      `Full-Back (${teamName})`,
      `Anchor Midfielder (${teamName})`,
      `Winger (${teamName})`,
      `Striker (${teamName})`,
    ],
  };
}

// Generate rich match details (Stats, Events, Pitch Lineups with Faces, H2H, Commentary)
export function getRichMatchDetails(match = {}) {
  const home = match.home || "Home Team";
  const away = match.away || "Away Team";
  const isFinished = match.status === "Full-Time" || match.status === "FINISHED" || match.status === "FT";
  const isLive = match.status === "Live" || match.status === "IN_PLAY" || match.status === "PAUSED";

  // Parse scores safely
  let homeScore = 0;
  let awayScore = 0;
  if (match.score && typeof match.score === "string" && match.score.includes("-")) {
    const parts = match.score.split("-").map((s) => parseInt(s.trim(), 10));
    homeScore = isNaN(parts[0]) ? 1 : parts[0];
    awayScore = isNaN(parts[1]) ? 1 : parts[1];
  } else if (isFinished) {
    homeScore = 2;
    awayScore = 1;
  }

  const homeLineup = buildTeamLineup(home, "4-3-3");
  const awayLineup = buildTeamLineup(away, "4-2-3-1");

  // Pick realistic key scorers from starting XI
  const homeScorer1 = homeLineup.startingXI[9]?.name || `${home} Striker`;
  const homeScorer2 = homeLineup.startingXI[10]?.name || `${home} Winger`;
  const awayScorer1 = awayLineup.startingXI[10]?.name || `${away} Striker`;
  const homeCardPlayer = homeLineup.startingXI[6]?.name || `${home} Midfielder`;
  const awayCardPlayer = awayLineup.startingXI[2]?.name || `${away} Defender`;

  // Realistic Match Events
  const events = [];
  if (isLive || isFinished) {
    if (homeScore > 0) {
      events.push({
        minute: 23,
        team: "home",
        type: "goal",
        player: homeScorer1,
        photo: getPlayerFace(homeScorer1),
        detail: "Right foot strike nestled in the bottom corner",
      });
    }
    events.push({
      minute: 38,
      team: "away",
      type: "yellow_card",
      player: awayCardPlayer,
      photo: getPlayerFace(awayCardPlayer),
      detail: "Tactical foul breaking up counter-attack",
    });
    if (awayScore > 0) {
      events.push({
        minute: 54,
        team: "away",
        type: "goal",
        player: awayScorer1,
        photo: getPlayerFace(awayScorer1),
        detail: "Powerful header from 6 yards out off corner delivery",
      });
    }
    if (homeScore > 1) {
      events.push({
        minute: 71,
        team: "home",
        type: "goal",
        player: homeScorer2,
        photo: getPlayerFace(homeScorer2),
        detail: "Curling finesse strike from edge of the penalty box",
      });
    }
    events.push({
      minute: 82,
      team: awayScore >= homeScore ? "home" : "away",
      type: "red_card",
      player: homeCardPlayer,
      photo: getPlayerFace(homeCardPlayer),
      detail: "High challenge resulting in a direct dismissal",
    });
    events.push({
      minute: 86,
      team: "home",
      type: "sub",
      playerIn: homeLineup.subs[5] || "Forward (IN)",
      playerOut: homeScorer1,
      detail: "Tactical substitution for fresh legs",
    });
  }

  // Sort events chronologically
  events.sort((a, b) => a.minute - b.minute);

  // Realistic Stats
  const possessionHome = Math.floor(48 + Math.random() * 12);
  const possessionAway = 100 - possessionHome;
  const stats = [
    { label: "Possession", home: `${possessionHome}%`, away: `${possessionAway}%`, homeVal: possessionHome, awayVal: possessionAway },
    { label: "Expected Goals (xG)", home: (homeScore * 0.72 + 0.35).toFixed(2), away: (awayScore * 0.68 + 0.28).toFixed(2), homeVal: (homeScore + 0.5) * 20, awayVal: (awayScore + 0.5) * 20 },
    { label: "Total Shots", home: (homeScore * 4 + 6), away: (awayScore * 3 + 5), homeVal: (homeScore * 4 + 6) * 4, awayVal: (awayScore * 3 + 5) * 4 },
    { label: "Shots on Target", home: Math.max(homeScore + 1, 4), away: Math.max(awayScore, 3), homeVal: Math.max(homeScore + 1, 4) * 8, awayVal: Math.max(awayScore, 3) * 8 },
    { label: "Corner Kicks", home: 7, away: 4, homeVal: 64, awayVal: 36 },
    { label: "Fouls", home: 11, away: 13, homeVal: 46, awayVal: 54 },
    { label: "Yellow Cards", home: 2, away: 3, homeVal: 40, awayVal: 60 },
    { label: "Red Cards", home: 1, away: 0, homeVal: 100, awayVal: 0 },
    { label: "Offsides", home: 2, away: 1, homeVal: 66, awayVal: 34 },
    { label: "Goalkeeper Saves", home: 3, away: 5, homeVal: 38, awayVal: 62 },
  ];

  // Head to Head history
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
    { minute: "90+4'", title: "Full-Time Whistle", text: "The referee concludes an intense 90-minute clash packed with high drama." },
    { minute: "89'", title: "Crucial Save", text: "Goalkeeper parries a fierce deflected shot over the crossbar!" },
    { minute: "82'", title: "DISMISSAL • RED CARD", text: "Disciplinary sanction issued following a dangerous high tackle in midfield." },
    { minute: "71'", title: "GOAL! Sensational Finish", text: "A breathtaking strike into the top corner leaves the goalkeeper stranded." },
    { minute: "54'", title: "GOAL! Equaliser", text: "Clinical header directed down past the keeper off an inswinging corner delivery." },
    { minute: "45'", title: "Half-Time", text: "The teams retreat to the dressing rooms after a fiercely contested first half." },
    { minute: "23'", title: "GOAL! Match Opener", text: "Deadlock broken! Low drilled effort clinical into the bottom left corner." },
    { minute: "1'", title: "Kick-Off", text: "The stadium lights shine bright as the match is officially underway!" },
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
    venue: match.venue || "Metropolitan Arena",
    referee: match.referee || "Michael Oliver",
    competitionName: match.competition?.name || "Premier Division",
  };
}

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
