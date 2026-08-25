export type Tournament = {
  id: number;
  name: string;
  game: "BGMI" | "Free Fire";
  prize: number;
  entryFee: number;
  maxTeams: number;
  registeredTeams: number;
  date: string;
  time: string;
  mode: string;
  map: string;
  status: string;
};

const tournaments: Tournament[] = [
  {
    id: 1,
    name: "BGMI Night Cup",
    game: "BGMI",
    prize: 10000,
    entryFee: 50,
    maxTeams: 64,
    registeredTeams: 48,
    date: "15 August 2026",
    time: "8:00 PM",
    mode: "Squad",
    map: "Erangel",
    status: "Upcoming",
  },

  {
    id: 2,
    name: "Free Fire Booyah Cup",
    game: "Free Fire",
    prize: 15000,
    entryFee: 50,
    maxTeams: 48,
    registeredTeams: 32,
    date: "20 August 2026",
    time: "8:00 PM",
    mode: "Squad",
    map: "Bermuda",
    status: "Upcoming",
  },

  {
    id: 3,
    name: "BGMI Pro Battle",
    game: "BGMI",
    prize: 25000,
    entryFee: 100,
    maxTeams: 64,
    registeredTeams: 64,
    date: "25 August 2026",
    time: "9:00 PM",
    mode: "Squad",
    map: "Erangel",
    status: "Upcoming",
  },

  {
    id: 4,
    name: "Free Fire Weekend War",
    game: "Free Fire",
    prize: 20000,
    entryFee: 100,
    maxTeams: 48,
    registeredTeams: 48,
    date: "30 August 2026",
    time: "7:00 PM",
    mode: "Squad",
    map: "Bermuda",
    status: "Upcoming",
  },
];

export default tournaments;