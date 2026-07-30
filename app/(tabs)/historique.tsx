import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export default function HistoriqueScreen() {
  return (
    <View style={styles.container}>
      <ThemedText type="title">Historique</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
});
