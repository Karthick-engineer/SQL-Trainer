import React from 'react';
import questions from '../data/questions.json';
import { useStore } from '../store/useStore';
import { CheckCircle2, Lock } from 'lucide-react';

export const MysteryList = () => {
    const { solvedQuestions } = useStore();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {questions.map((q) => {
                const isSolved = solvedQuestions.includes(q.id);
                // Allow unlocking the next mystery
                const isUnlocked = q.id === 1 || isSolved || solvedQuestions.includes(q.id - 1);

                return (
                    <a
                        key={q.id}
                        href={isUnlocked ? `${import.meta.env.BASE_URL}mystery/${q.id}` : '#'}
                        className={`
                            relative block p-6 rounded-xl border-2 transition-all duration-300
                            ${isUnlocked
                                ? 'bg-slate-800 border-amber-900/50 hover:border-amber-500 hover:-translate-y-1 shadow-lg'
                                : 'bg-slate-900/50 border-slate-800 opacity-75 cursor-not-allowed'}
                        `}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold px-2 py-1 rounded bg-slate-950 text-amber-500 font-mono">
                                CASE #{q.id.toString().padStart(3, '0')}
                            </span>
                            {isSolved ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : !isUnlocked ? (
                                <Lock className="w-5 h-5 text-slate-500" />
                            ) : null}
                        </div>

                        <h3 className={`font-serif text-lg font-bold mb-2 ${isUnlocked ? 'text-amber-50' : 'text-slate-400'}`}>
                            {q.title.split(': ')[1]}
                        </h3>

                        <div className="flex justify-between items-center mt-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                                q.difficulty === 'Easy' ? 'bg-green-900/30 text-green-400' :
                                q.difficulty === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' :
                                'bg-red-900/30 text-red-400'
                            }`}>
                                {q.difficulty}
                            </span>
                        </div>
                    </a>
                );
            })}
        </div>
    );
};
