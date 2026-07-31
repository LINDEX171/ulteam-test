import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useHumeurContext } from '@/contexts/humeur-context';

const EMOJIS: Record<number, string> = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
};

export default function HistoriqueScreen() {
  const { humeurs, loading, error, chargerHumeurs } = useHumeurContext();

  if (loading) {
    return (
      <View style={styles.centre}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centre}>
        <Text style={styles.messageErreur}>Impossible de charger l&apos;historique.</Text>
        <TouchableOpacity style={styles.boutonReessayer} onPress={chargerHumeurs}>
          <Text style={styles.texteReessayer}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Historique</Text>
      <FlatList
        data={humeurs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.liste}
        ListEmptyComponent={
          <Text style={styles.messageVide}>Aucune humeur enregistrée pour l&apos;instant.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.ligne}>
            <Text style={styles.ligneEmoji}>{EMOJIS[item.humeur] ?? '❓'}</Text>
            <Text style={styles.ligneDate}>{new Date(item.date).toLocaleString('fr-FR')}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
  titre: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  liste: {
    gap: 10,
  },
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  ligneEmoji: {
    fontSize: 24,
  },
  ligneDate: {
    fontSize: 14,
    color: '#333',
  },
  messageVide: {
    textAlign: 'center',
    color: '#666',
  },
  messageErreur: {
    color: '#c62828',
    fontSize: 16,
    textAlign: 'center',
  },
  boutonReessayer: {
    backgroundColor: '#2f95dc',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  texteReessayer: {
    color: '#fff',
    fontWeight: '600',
  },
});
