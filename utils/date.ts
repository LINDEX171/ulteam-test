function estMemeJour(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formaterDateRelative(dateISO: string): string {
  const date = new Date(dateISO);
  const maintenant = new Date();
  const heure = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  if (estMemeJour(date, maintenant)) {
    return `Aujourd'hui à ${heure}`;
  }

  const hier = new Date(maintenant);
  hier.setDate(hier.getDate() - 1);
  if (estMemeJour(date, hier)) {
    return `Hier à ${heure}`;
  }

  const jour = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  return `${jour} à ${heure}`;
}
