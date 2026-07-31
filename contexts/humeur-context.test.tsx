import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { HumeurProvider, useHumeurContext } from './humeur-context';

function wrapper({ children }: { children: React.ReactNode }) {
  return <HumeurProvider>{children}</HumeurProvider>;
}

describe('HumeurProvider', () => {
  beforeEach(async () => {
    global.fetch = jest.fn();
    await AsyncStorage.clear();
  });

  it('charge les humeurs au montage et les trie de la plus récente à la plus ancienne', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: '1', humeur: 3, date: '2024-01-01T10:00:00.000Z' },
        { id: '2', humeur: 5, date: '2024-01-03T10:00:00.000Z' },
      ],
    });

    const { result } = await renderHook(() => useHumeurContext(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.humeurs.map((h) => h.id)).toEqual(['2', '1']);
    expect(result.current.error).toBe(false);
  });

  it('ajoute une nouvelle humeur en tête de liste après un POST réussi', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '99', humeur: 4, date: new Date().toISOString() }),
      });

    const { result } = await renderHook(() => useHumeurContext(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let succes = false;
    await act(async () => {
      succes = await result.current.ajouterHumeur(4);
    });

    expect(succes).toBe(true);
    expect(result.current.humeurs).toHaveLength(1);
    expect(result.current.humeurs[0].id).toBe('99');
  });

  it("bascule en erreur si le chargement échoue et qu'aucune donnée locale n'existe", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network error'));

    const { result } = await renderHook(() => useHumeurContext(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(true);
    expect(result.current.humeurs).toEqual([]);
  });
});
