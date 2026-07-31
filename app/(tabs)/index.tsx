import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import { NIVEAUX_HUMEUR } from '@/constants/humeurs';
import { useHumeurContext } from '@/contexts/humeur-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

function capitaliser(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

const dateDuJour = capitaliser(
  new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
);

export default function HumeurScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { ajouterHumeur, envoiEnCours } = useHumeurContext();

  const [humeur, setHumeur] = useState<number | null>(null);
  const [resultat, setResultat] = useState<'succes' | 'erreur' | null>(null);

  const echelles = useRef(NIVEAUX_HUMEUR.map(() => new Animated.Value(1))).current;
  const opaciteMessage = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (resultat === null) return;

    Animated.timing(opaciteMessage, { toValue: 1, duration: 200, useNativeDriver: true }).start();

    const timer = setTimeout(() => {
      Animated.timing(opaciteMessage, { toValue: 0, duration: 200, useNativeDriver: true }).start(
        () => setResultat(null)
      );
      if (resultat === 'succes') {
        setHumeur(null);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [resultat, opaciteMessage]);

  const handleSelection = (index: number, valeur: number) => {
    setHumeur(valeur);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(echelles[index], { toValue: 1.15, useNativeDriver: true, speed: 30 }),
      Animated.spring(echelles[index], { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
  };

  const handleValider = async () => {
    if (humeur === null) return;

    const succes = await ajouterHumeur(humeur);
    setResultat(succes ? 'succes' : 'erreur');
    Haptics.notificationAsync(
      succes ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <View style={styles.container}>
        <View style={styles.entete}>
          <Text style={[styles.titre, { color: colors.text }]}>Mon humeur du jour</Text>
          <Text style={[styles.sousTitre, { color: colors.muted }]}>{dateDuJour}</Text>
        </View>

        <View style={styles.niveaux}>
          {NIVEAUX_HUMEUR.map((niveau, index) => {
            const estSelectionne = humeur === niveau.valeur;
            return (
              <View key={niveau.valeur} style={styles.niveauColonne}>
                <Animated.View style={{ transform: [{ scale: echelles[index] }] }}>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Humeur ${niveau.label}`}
                    accessibilityState={{ selected: estSelectionne }}
                    style={[
                      styles.bouton,
                      { backgroundColor: colors.card, borderColor: 'transparent' },
                      estSelectionne && {
                        borderColor: niveau.couleur,
                        backgroundColor: niveau.couleur + '33',
                      },
                    ]}
                    onPress={() => handleSelection(index, niveau.valeur)}>
                    <Text style={styles.emoji}>{niveau.emoji}</Text>
                  </TouchableOpacity>
                </Animated.View>
                <Text
                  style={[
                    styles.labelNiveau,
                    { color: estSelectionne ? colors.text : colors.muted },
                    estSelectionne && styles.labelNiveauActif,
                  ]}
                  numberOfLines={1}>
                  {niveau.label}
                </Text>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.boutonValider,
            { backgroundColor: colors.tint },
            (humeur === null || envoiEnCours) && styles.boutonDesactive,
          ]}
          onPress={handleValider}
          disabled={humeur === null || envoiEnCours}>
          {envoiEnCours ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="check" size={20} color="#fff" />
              <Text style={styles.texteValider}>Valider</Text>
            </>
          )}
        </TouchableOpacity>

        {resultat && (
          <Animated.View
            style={[
              styles.message,
              {
                opacity: opaciteMessage,
                backgroundColor:
                  resultat === 'succes' ? colors.successBackground : colors.errorBackground,
              },
            ]}>
            <MaterialIcons
              name={resultat === 'succes' ? 'check-circle' : 'error'}
              size={18}
              color={resultat === 'succes' ? colors.success : colors.error}
            />
            <Text
              style={[
                styles.texteMessage,
                { color: resultat === 'succes' ? colors.success : colors.error },
              ]}>
              {resultat === 'succes'
                ? 'Humeur enregistrée !'
                : 'Une erreur est survenue, réessaie.'}
            </Text>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 32,
  },
  entete: {
    alignItems: 'center',
    gap: 4,
  },
  titre: {
    fontSize: 24,
    fontWeight: '700',
  },
  sousTitre: {
    fontSize: 14,
  },
  niveaux: {
    flexDirection: 'row',
    gap: 10,
  },
  niveauColonne: {
    alignItems: 'center',
    gap: 6,
    width: 62,
  },
  bouton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  labelNiveau: {
    fontSize: 11,
  },
  labelNiveauActif: {
    fontWeight: '700',
  },
  boutonValider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  boutonDesactive: {
    opacity: 0.5,
  },
  texteValider: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  texteMessage: {
    fontSize: 14,
    fontWeight: '600',
  },
});
