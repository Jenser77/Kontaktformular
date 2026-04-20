export type Abteilung = { id: string; name: string };
export type Einrichtung = { id: string; name: string; abteilungen: Abteilung[] };
export type Mandant = { id: string; name: string; einrichtungen: Einrichtung[] };
