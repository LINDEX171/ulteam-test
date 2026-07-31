import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { API_URL } from '@/constants/api';

const STORAGE_KEY = '@ulteam_humeurs';

export interface Humeur {
  id: string;
  humeur: number;
  date: string;
}

function trierParDateDesc(liste: Humeur[]): Humeur[] {
  return [...liste].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

interface HumeurContextType {
  humeurs: Humeur[];
  loading: boolean;
  error: boolean;
  envoiEnCours: boolean;
  chargerHumeurs: () => Promise<void>;
  ajouterHumeur: (valeur: number) => Promise<boolean>;
}

const HumeurContext = createContext<HumeurContextType | undefined>(undefined);

export function HumeurProvider({ children }: { children: ReactNode }) {
  const [humeurs, setHumeurs] = useState<Humeur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  // Toujours à jour de façon synchrone (contrairement à `humeurs`, qui ne l'est
  // qu'après le prochain rendu) : évite de construire une nouvelle liste à partir
  // d'une valeur obsolète si `ajouterHumeur` est appelé plusieurs fois de suite.
  const humeursRef = useRef<Humeur[]>([]);

  const definirHumeurs = useCallback((liste: Humeur[]) => {
    humeursRef.current = liste;
    setHumeurs(liste);
  }, []);

  const chargerHumeurs = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Réponse serveur invalide');
      }
      const json: Humeur[] = await response.json();
      const triees = trierParDateDesc(json);
      definirHumeurs(triees);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(triees));
    } catch {
      // Pas de réseau ou serveur injoignable : on retombe sur la dernière
      // copie locale sauvegardée, pour que l'historique reste consultable hors ligne.
      try {
        const local = await AsyncStorage.getItem(STORAGE_KEY);
        if (local) {
          definirHumeurs(trierParDateDesc(JSON.parse(local)));
        } else {
          setError(true);
        }
      } catch {
        // Cache local corrompu ou dans un format inattendu : on ne peut pas
        // s'y fier, on retombe sur l'état d'erreur classique.
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }, [definirHumeurs]);

  const ajouterHumeur = useCallback(async (valeur: number) => {
    setEnvoiEnCours(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ humeur: valeur, date: new Date() }),
      });

      if (!response.ok) {
        throw new Error('Réponse serveur invalide');
      }

      const nouvelleHumeur: Humeur = await response.json();
      const misAJour = trierParDateDesc([nouvelleHumeur, ...humeursRef.current]);
      definirHumeurs(misAJour);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(misAJour));
      return true;
    } catch {
      return false;
    } finally {
      setEnvoiEnCours(false);
    }
  }, [definirHumeurs]);

  useEffect(() => {
    chargerHumeurs();
  }, [chargerHumeurs]);

  return (
    <HumeurContext.Provider
      value={{ humeurs, loading, error, envoiEnCours, chargerHumeurs, ajouterHumeur }}>
      {children}
    </HumeurContext.Provider>
  );
}

export function useHumeurContext() {
  const context = useContext(HumeurContext);
  if (!context) {
    throw new Error('useHumeurContext doit être utilisé à l\'intérieur d\'un HumeurProvider');
  }
  return context;
}
