import { NIVEAUX_HUMEUR, trouverNiveauHumeur } from './humeurs';

describe('trouverNiveauHumeur', () => {
  it('retourne le bon niveau pour une valeur valide', () => {
    const niveau = trouverNiveauHumeur(5);
    expect(niveau).toBeDefined();
    expect(niveau?.label).toBe('Excellent');
    expect(niveau?.emoji).toBe('😄');
  });

  it('retourne undefined pour une valeur inconnue', () => {
    expect(trouverNiveauHumeur(42)).toBeUndefined();
  });

  it('contient exactement 5 niveaux, numérotés de 1 à 5', () => {
    expect(NIVEAUX_HUMEUR).toHaveLength(5);
    expect(NIVEAUX_HUMEUR.map((n) => n.valeur)).toEqual([1, 2, 3, 4, 5]);
  });
});
