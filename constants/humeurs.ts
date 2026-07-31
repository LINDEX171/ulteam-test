export interface NiveauHumeur {
  valeur: number;
  emoji: string;
  label: string;
  couleur: string;
}

export const NIVEAUX_HUMEUR: NiveauHumeur[] = [
  { valeur: 1, emoji: '😢', label: 'Terrible', couleur: '#e57373' },
  { valeur: 2, emoji: '😕', label: 'Pas top', couleur: '#ffb74d' },
  { valeur: 3, emoji: '😐', label: 'Neutre', couleur: '#ffd54f' },
  { valeur: 4, emoji: '🙂', label: 'Bien', couleur: '#aed581' },
  { valeur: 5, emoji: '😄', label: 'Excellent', couleur: '#66bb6a' },
];

export function trouverNiveauHumeur(valeur: number): NiveauHumeur | undefined {
  return NIVEAUX_HUMEUR.find((niveau) => niveau.valeur === valeur);
}
