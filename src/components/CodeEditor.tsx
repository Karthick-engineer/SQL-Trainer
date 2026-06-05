import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { Play, CheckCircle, XCircle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { initDB, runQuery } from '../db';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

interface MysteryProps {
    mystery: {
        id: number;
        title: string;
        description: string;
        lesson: string;
        difficulty: string;
        setup_sql: string;
        expected_query: string;
        solutions: { query: string; description: string; efficiency: string }[];
        hint: string;
    }
}

export const CodeEditor: React.FC<MysteryProps> = ({ mystery }) => {
    const [code, setCode] = useState('-- Write your SQL query here\n');
    const [result, setResult] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [showSolutions, setShowSolutions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { markSolved, solvedQuestions } = useStore();
    const alreadySolved = solvedQuestions.includes(mystery.id);

    useEffect(() => {
        // Initialize DB and run setup SQL when component mounts
        const setup = async () => {
            try {
                await initDB();
                await runQuery(mystery.setup_sql);
            } catch (err) {
                console.error("Failed to setup DB:", err);
            }
        };
        setup();
    }, [mystery.id]);

    const handleRunQuery = async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);
        setIsSuccess(false);

        try {
            // Run user query
            const userResult = await runQuery(code);
            setResult(userResult);

            // Run expected query to compare
            const expectedResult = await runQuery(mystery.expected_query);

            // Simple comparison (could be more robust in a real app)
            const isMatch = JSON.stringify(userResult) === JSON.stringify(expectedResult);

            if (isMatch) {
                setIsSuccess(true);
                if (!alreadySolved) {
                    markSolved(mystery.id);
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }
            } else {
                setError("Your query executed, but the results don't match the expected evidence. Try again, Detective.");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred while executing the query.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-6 h-[calc(100vh-80px)]">
            {/* Left Panel: Narrative & Instructions */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                <div className="bg-slate-800 p-6 rounded-xl border border-amber-900/30 shadow-lg">
                    <h1 className="text-2xl font-serif font-bold text-amber-500 mb-2">{mystery.title}</h1>
                    <div className="inline-block px-2 py-1 rounded bg-slate-900 text-xs font-mono text-slate-400 mb-6 border border-slate-700">
                        Case File #{mystery.id.toString().padStart(3, '0')} | Difficulty: {mystery.difficulty}
                    </div>

                    <div className="prose prose-invert prose-amber max-w-none">
                        <p className="text-slate-300 leading-relaxed font-serif text-lg italic bg-slate-900/50 p-4 rounded-lg border-l-4 border-amber-700">
                            "{mystery.description}"
                        </p>

                        <div className="mt-8">
                            <h3 className="text-amber-400 font-bold uppercase tracking-wider text-sm mb-2">Detective's Notes</h3>
                            <p className="text-slate-400 text-sm">{mystery.lesson}</p>
                        </div>
                    </div>
                </div>

                {/* Hint Toggle */}
                <div className="bg-slate-800 rounded-xl border border-amber-900/30 overflow-hidden">
                    <button
                        onClick={() => setShowHint(!showHint)}
                        className="w-full p-4 flex justify-between items-center hover:bg-slate-700/50 transition-colors"
                    >
                        <span className="flex items-center gap-2 font-bold text-amber-500 text-sm">
                            <Lightbulb className="w-4 h-4" /> Need a Clue?
                        </span>
                        {showHint ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    <AnimatePresence>
                        {showHint && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="p-4 bg-slate-900/50 border-t border-slate-700 text-sm text-slate-300 font-serif italic"
                            >
                                {mystery.hint}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Solutions (Visible after solving) */}
                <AnimatePresence>
                    {(isSuccess || alreadySolved) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-800 rounded-xl border border-emerald-900/50 overflow-hidden mt-auto"
                        >
                            <button
                                onClick={() => setShowSolutions(!showSolutions)}
                                className="w-full p-4 flex justify-between items-center bg-emerald-900/20 hover:bg-emerald-900/30 transition-colors"
                            >
                                <span className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                                    <CheckCircle className="w-4 h-4" /> Case Closed: View Solutions
                                </span>
                                {showSolutions ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-emerald-400" />}
                            </button>
                            <AnimatePresence>
                                {showSolutions && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="p-4 bg-slate-900/50 border-t border-slate-700"
                                    >
                                        <p className="text-xs text-slate-400 mb-4 uppercase tracking-wider">Solutions ranked by efficiency:</p>
                                        <div className="flex flex-col gap-4">
                                            {mystery.solutions.map((sol, idx) => (
                                                <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-mono text-emerald-500">{sol.efficiency}</span>
                                                    </div>
                                                    <code className="block text-sm text-amber-100 font-mono mb-2 whitespace-pre-wrap">{sol.query}</code>
                                                    <p className="text-xs text-slate-400">{sol.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right Panel: Editor & Results */}
            <div className="w-full lg:w-2/3 flex flex-col gap-4">
                <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden flex-grow flex flex-col shadow-2xl">
                    <div className="bg-slate-950 p-2 flex justify-between items-center border-b border-slate-800">
                        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider px-2">Investigation Terminal</span>
                        <button
                            onClick={handleRunQuery}
                            disabled={isLoading}
                            className="bg-amber-600 hover:bg-amber-500 text-amber-50 px-4 py-1.5 rounded flex items-center gap-2 text-sm font-bold transition-colors disabled:opacity-50"
                        >
                            <Play className="w-4 h-4" /> {isLoading ? 'Analyzing...' : 'Execute Query'}
                        </button>
                    </div>
                    <div className="flex-grow overflow-auto">
                        <CodeMirror
                            value={code}
                            height="100%"
                            theme="dark"
                            extensions={[sql()]}
                            onChange={(value) => setCode(value)}
                            className="h-full text-base"
                        />
                    </div>
                </div>

                {/* Results Panel */}
                <div className="h-64 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
                    <div className="bg-slate-950 p-2 border-b border-slate-800">
                        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider px-2">Findings</span>
                    </div>
                    <div className="p-4 overflow-auto flex-grow bg-slate-900">
                        {error && (
                            <div className="flex items-start gap-2 text-red-400 bg-red-950/30 p-3 rounded-lg border border-red-900/50">
                                <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span className="font-mono text-sm">{error}</span>
                            </div>
                        )}

                        {isSuccess && (
                            <div className="mb-4 flex items-center gap-2 text-emerald-400 bg-emerald-950/30 p-3 rounded-lg border border-emerald-900/50">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-mono text-sm">Excellent deduction, Detective. The evidence matches.</span>
                            </div>
                        )}

                        {result && result.length > 0 && (
                            <div className="overflow-x-auto rounded border border-slate-800">
                                <table className="w-full text-left text-sm font-mono text-slate-300">
                                    <thead className="bg-slate-800 text-amber-500">
                                        <tr>
                                            {Object.keys(result[0]).map(key => (
                                                <th key={key} className="px-4 py-2 border-b border-slate-700">{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.map((row, i) => (
                                            <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50">
                                                {Object.values(row).map((val: any, j) => (
                                                    <td key={j} className="px-4 py-2">{String(val)}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {result && result.length === 0 && (
                            <div className="text-slate-500 font-mono text-sm text-center py-8">
                                Query executed successfully, but returned 0 rows.
                            </div>
                        )}

                        {!result && !error && (
                            <div className="text-slate-600 font-mono text-sm h-full flex items-center justify-center italic">
                                Execute a query to analyze the evidence.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
