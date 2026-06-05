import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreState {
    solvedQuestions: number[];
    score: number;
    markSolved: (id: number) => void;
    getRank: () => string;
}

export const useStore = create<StoreState>()(
    persist(
        (set, get) => ({
            solvedQuestions: [],
            score: 0,
            markSolved: (id: number) => set((state) => {
                if (!state.solvedQuestions.includes(id)) {
                    return {
                        solvedQuestions: [...state.solvedQuestions, id],
                        score: state.score + 10,
                    };
                }
                return state;
            }),
            getRank: () => {
                const count = get().solvedQuestions.length;
                if (count >= 100) return 'Master Detective';
                if (count >= 75) return 'Senior Investigator';
                if (count >= 50) return 'Inspector';
                if (count >= 25) return 'Constable';
                if (count >= 10) return 'Rookie Detective';
                return 'Amateur Sleuth';
            }
        }),
        {
            name: 'sql-sherlock-storage',
        }
    )
);
