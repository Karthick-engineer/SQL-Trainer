import React from 'react';
import { useStore } from '../store/useStore';
import { Search } from 'lucide-react';

export const NavBar = () => {
    const { score, getRank, solvedQuestions } = useStore();

    return (
        <nav className="bg-slate-900 text-amber-50 p-4 shadow-lg border-b border-amber-900/50">
            <div className="container mx-auto flex justify-between items-center">
                <a href={import.meta.env.BASE_URL} className="text-2xl font-serif font-bold tracking-wider flex items-center gap-2">
                    <Search className="w-6 h-6 text-amber-500" />
                    <span className="text-amber-500">SQL</span> Sherlock
                </a>
                <div className="flex gap-6 text-sm font-medium">
                    <div className="bg-slate-800 px-4 py-1.5 rounded-full border border-amber-900/30">
                        Rank: <span className="text-amber-400">{getRank()}</span>
                    </div>
                    <div className="bg-slate-800 px-4 py-1.5 rounded-full border border-amber-900/30">
                        Score: <span className="text-amber-400">{score}</span>
                    </div>
                    <div className="bg-slate-800 px-4 py-1.5 rounded-full border border-amber-900/30">
                        Solved: <span className="text-amber-400">{solvedQuestions.length}/100</span>
                    </div>
                </div>
            </div>
        </nav>
    );
};
