import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { NIVEAUX_HUMEUR, trouverNiveauHumeur } from '@/constants/humeurs';
import { Humeur, useHumeurContext } from '@/contexts/humeur-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formaterDateRelative } from '@/utils/date';

export default function HistoriqueScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { humeurs, loading, error, chargerHumeurs } = useHumeurContext();

  if (loading && humeurs.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
        <View style={styles.centre}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
        <View style={styles.centre}>
          <MaterialIcons name="cloud-off" size={40} color={colors.muted} />
          <Text style={[styles.messageErreur, { color: colors.error }]}>
            Impossible de charger l&apos;historique.
          </Text>
          <TouchableOpacity
            style={[styles.boutonReessayer, { backgroundColor: colors.tint }]}
            onPress={chargerHumeurs}>
            <Text style={styles.texteReessayer}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <View style={styles.container}>
        <FlatList
          data={humeurs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.liste}
          refreshing={loading}
          onRefresh={chargerHumeurs}
          ListHeaderComponent={
            humeurs.length > 0 ? <ResumeStats humeurs={humeurs} colors={colors} /> : undefined
          }
          ListEmptyComponent={
            <View style={styles.vide}>
              <MaterialIcons name="mood" size={40} color={colors.muted} />
              <Text style={[styles.messageVide, { color: colors.muted }]}>
                Aucune humeur enregistrée pour l&apos;instant.{'\n'}Direction l&apos;onglet Humeur
                pour commencer !
              </Text>
            </View>
          }
          renderItem={({ item, index }) => <LigneHumeur item={item} index={index} colors={colors} />}
        />
      </View>
    </SafeAreaView>
  );
}

function ResumeStats({ humeurs, colors }: { humeurs: Humeur[]; colors: (typeof Colors)['light'] }) {
  const moyenne = humeurs.reduce((total, item) => total + item.humeur, 0) / humeurs.length;
  const niveauMoyen = trouverNiveauHumeur(Math.round(moyenne)) ?? NIVEAUX_HUMEUR[2];

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.resume, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.resumeBloc}>
        <Text style={[styles.resumeChiffre, { color: colors.text }]}>{humeurs.length}</Text>
        <Text style={[styles.resumeLabel, { color: colors.muted }]}>
          {humeurs.length > 1 ? 'entrées' : 'entrée'}
        </Text>
      </View>
      <View style={[styles.resumeSeparateur, { backgroundColor: colors.border }]} />
      <View style={styles.resumeBloc}>
        <Text style={styles.resumeEmoji}>{niveauMoyen.emoji}</Text>
        <Text style={[styles.resumeLabel, { color: colors.muted }]}>
          Moyenne {moyenne.toFixed(1)}/5
        </Text>
      </View>
    </Animated.View>
  );
}

function LigneHumeur({
  item,
  index,
  colors,
}: {
  item: Humeur;
  index: number;
  colors: (typeof Colors)['light'];
}) {
  const niveau = trouverNiveauHumeur(item.humeur) ?? NIVEAUX_HUMEUR[2];

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(300)}
      layout={LinearTransition}
      style={[styles.ligne, { backgroundColor: colors.card, borderLeftColor: niveau.couleur }]}>
      <View style={[styles.ligneEmojiConteneur, { backgroundColor: niveau.couleur + '33' }]}>
        <Text style={styles.ligneEmoji}>{niveau.emoji}</Text>
      </View>
      <View style={styles.ligneTexte}>
        <Text style={[styles.ligneLabel, { color: colors.text }]}>{niveau.label}</Text>
        <Text style={[styles.ligneDate, { color: colors.muted }]}>
          {formaterDateRelative(item.date)}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
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
  liste: {
    gap: 10,
    flexGrow: 1,
  },
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 6,
  },
  resumeBloc: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  resumeSeparateur: {
    width: 1,
    alignSelf: 'stretch',
  },
  resumeChiffre: {
    fontSize: 22,
    fontWeight: '700',
  },
  resumeEmoji: {
    fontSize: 22,
  },
  resumeLabel: {
    fontSize: 12,
  },
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
  },
  ligneEmojiConteneur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ligneEmoji: {
    fontSize: 22,
  },
  ligneTexte: {
    gap: 2,
  },
  ligneLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  ligneDate: {
    fontSize: 13,
  },
  vide: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 80,
  },
  messageVide: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  messageErreur: {
    fontSize: 16,
    textAlign: 'center',
  },
  boutonReessayer: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  texteReessayer: {
    color: '#fff',
    fontWeight: '600',
  },
});
