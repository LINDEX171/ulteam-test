import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useHumeurContext } from '@/contexts/humeur-context';

const NIVEAUX = [
  { valeur: 1, emoji: '😢' },
  { valeur: 2, emoji: '😕' },
  { valeur: 3, emoji: '😐' },
  { valeur: 4, emoji: '🙂' },
  { valeur: 5, emoji: '😄' },
];

export default function HumeurScreen() {
  const { ajouterHumeur, envoiEnCours } = useHumeurContext();
  const [humeur, setHumeur] = useState<number | null>(null);
  const [resultat, setResultat] = useState<'succes' | 'erreur' | null>(null);

  const handleValider = async () => {
    if (humeur === null) return;

    setResultat(null);
    const succes = await ajouterHumeur(humeur);
    setResultat(succes ? 'succes' : 'erreur');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Mon humeur du jour</Text>

      <View style={styles.niveaux}>
        {NIVEAUX.map((niveau) => (
          <TouchableOpacity
            key={niveau.valeur}
            style={[
              styles.bouton,
              humeur === niveau.valeur && styles.boutonSelectionne,
            ]}
            onPress={() => setHumeur(niveau.valeur)}>
            <Text style={styles.emoji}>{niveau.emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.boutonValider,
          (humeur === null || envoiEnCours) && styles.boutonDesactive,
        ]}
        onPress={handleValider}
        disabled={humeur === null || envoiEnCours}>
        {envoiEnCours ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.texteValider}>Valider</Text>
        )}
      </TouchableOpacity>

      {resultat === 'succes' && (
        <Text style={styles.messageSucces}>Humeur enregistrée !</Text>
      )}
      {resultat === 'erreur' && (
        <Text style={styles.messageErreur}>
          Une erreur est survenue, réessaie.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 24,
  },
  titre: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  niveaux: {
    flexDirection: 'row',
    gap: 10,
  },
  bouton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  boutonSelectionne: {
    borderColor: '#2f95dc',
    backgroundColor: '#e0f0ff',
  },
  emoji: {
    fontSize: 24,
  },
  boutonValider: {
    backgroundColor: '#2f95dc',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  boutonDesactive: {
    backgroundColor: '#a0c4de',
  },
  texteValider: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  messageSucces: {
    color: '#2e7d32',
    fontSize: 16,
  },
  messageErreur: {
    color: '#c62828',
    fontSize: 16,
  },
});
