import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
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
      setHumeurs(triees);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(triees));
    } catch {
      // Pas de réseau ou serveur injoignable : on retombe sur la dernière
      // copie locale sauvegardée, pour que l'historique reste consultable hors ligne.
      const local = await AsyncStorage.getItem(STORAGE_KEY);
      if (local) {
        setHumeurs(trierParDateDesc(JSON.parse(local)));
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

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
      const misAJour = trierParDateDesc([nouvelleHumeur, ...humeurs]);
      setHumeurs(misAJour);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(misAJour));
      return true;
    } catch {
      return false;
    } finally {
      setEnvoiEnCours(false);
    }
  }, [humeurs]);

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
