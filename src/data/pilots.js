export const MAX_PILOTS = 1;

export const PILOT_STATUS = {
  ALIVE: "alive",
  WOUNDED: "wounded",
  KIA: "kia",
};

export const PILOTS = [
  { id: 1, name: "Amara Nwosu", origin: "Nigeria", callsign: "Ember" },
  { id: 2, name: "Sipho Dlamini", origin: "South Africa", callsign: "Warden" },
  { id: 3, name: "Kwame Asante", origin: "Ghana", callsign: "Talon" },
  { id: 4, name: "Mei Lin Zhao", origin: "China", callsign: "Jade" },
  { id: 5, name: "Arjun Mehta", origin: "India", callsign: "Cipher" },
  { id: 6, name: "Yuki Tanaka", origin: "Japan", callsign: "Ronin" },
  { id: 7, name: "Elena Kovac", origin: "Croatia", callsign: "Frost" },
  { id: 8, name: "Magnus Eriksson", origin: "Sweden", callsign: "Anvil" },
  { id: 9, name: "Isabelle Moreau", origin: "France", callsign: "Mirage" },
  { id: 10, name: "Jake Sullivan", origin: "USA", callsign: "Drifter" },
  { id: 11, name: "Carlos Mendoza", origin: "Mexico", callsign: "Coyote" },
  { id: 12, name: "Naomi Whitehorse", origin: "Canada", callsign: "Wraith" },
  { id: 13, name: "Rafael Oliveira", origin: "Brazil", callsign: "Vantage" },
  { id: 14, name: "Camila Vargas", origin: "Argentina", callsign: "Condor" },
  { id: 15, name: "Kiri Tane", origin: "New Zealand", callsign: "Kestrel" },
  { id: 16, name: "Jack Ashby", origin: "Australia", callsign: "Outrider" },
];

export function pilotForIndex(index) {
  return PILOTS[index - 1] ?? null;
}

export function pilotForRun(pass) {
  return pilotForIndex(((pass - 1) % MAX_PILOTS) + 1);
}

export function pilotsAvailable(pilotStatus) {
  return PILOTS.filter((p) => pilotStatus[p.id] !== PILOT_STATUS.KIA).length;
}

export function formatPilotStatus(status) {
  if (status === PILOT_STATUS.KIA) return "KIA";
  if (status === PILOT_STATUS.WOUNDED) return "WOUNDED";
  return "ALIVE";
}
