import { formaterDateRelative } from './date';

describe('formaterDateRelative', () => {
  it("affiche \"Aujourd'hui\" pour une date du jour", () => {
    const maintenant = new Date();
    const resultat = formaterDateRelative(maintenant.toISOString());
    expect(resultat).toMatch(/^Aujourd'hui à \d{2}:\d{2}$/);
  });

  it('affiche "Hier" pour une date de la veille', () => {
    const hier = new Date();
    hier.setDate(hier.getDate() - 1);
    const resultat = formaterDateRelative(hier.toISOString());
    expect(resultat).toMatch(/^Hier à \d{2}:\d{2}$/);
  });

  it('affiche le jour et le mois pour une date plus ancienne', () => {
    const ilYaUneSemaine = new Date();
    ilYaUneSemaine.setDate(ilYaUneSemaine.getDate() - 7);
    const resultat = formaterDateRelative(ilYaUneSemaine.toISOString());
    expect(resultat).toMatch(/^\d{1,2} \S+\.? à \d{2}:\d{2}$/);
  });
});
