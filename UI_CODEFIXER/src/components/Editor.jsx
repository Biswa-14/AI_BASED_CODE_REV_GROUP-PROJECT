import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    HiExclamationCircle,
    HiLightningBolt,
    HiChartBar,
    HiCode,
    HiClock,
    HiDatabase,
    HiLightBulb,
} from 'react-icons/hi';

const languages = ['Python', 'JavaScript', 'Java', 'C++', 'C'];

const placeholderCode = `// Paste your code here...
function findMax(arr) {
  let max = 0;
  for (let i = 0; i <= arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}`;

export default function Editor() {
    const [lang, setLang] = useState('Python');
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [activeBtn, setActiveBtn] = useState(null);

    const outputRef = useRef(null);

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);

    const handleAction = async (action) => {
        setActiveBtn(action);

        // Show thinking first
        setOutput("⚡ Thinking...\n\n");

        try {
            const response = await fetch("http://127.0.0.1:8000/chat-stream/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: `You are an expert ${lang} developer.
Action: ${action}.
Analyze and improve this code:\n\n${code}`
                })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let result = "";

            // Slight delay so "Thinking..." is visible before stream starts
            await new Promise(res => setTimeout(res, 400));

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                result += chunk;

                // Replace thinking with real streamed output
                setOutput(result);
            }

        } catch (error) {
            console.error("ERROR:", error);
            setOutput("Error connecting to Sentient.");
        }

        setTimeout(() => setActiveBtn(null), 600);
    };

    const actionButtons = [
        { label: 'Fix Bugs', icon: <HiExclamationCircle />, action: 'fix' },
        { label: 'Optimize Code', icon: <HiLightningBolt />, action: 'optimize' },
        { label: 'Improve Complexity', icon: <HiChartBar />, action: 'complexity' },
    ];

    return (
        <section id="editor" className="relative py-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Section heading */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold">
                        Code <span className="gradient-text">Editor</span>
                    </h2>
                    <p className="mt-3 text-text-secondary text-sm sm:text-base max-w-md mx-auto">
                        Paste your code, pick a language, and let AI do its magic.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-[1fr_340px] gap-6">
                    {/* ─── Left: code I/O ─── */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6 }}
                        className="space-y-5"
                    >
                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 glass px-3 py-2 !rounded-xl">
                                <HiCode className="text-neon-purple text-lg" />
                                <select
                                    value={lang}
                                    onChange={(e) => setLang(e.target.value)}
                                    className="select-styled !bg-transparent !border-0 !p-0 !pr-6"
                                >
                                    {languages.map((l) => (
                                        <option key={l}>{l}</option>
                                    ))}
                                </select>
                            </div>

                            {actionButtons.map((btn) => (
                                <motion.button
                                    key={btn.action}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAction(btn.action)}
                                    className={`btn-outline !rounded-xl ${activeBtn === btn.action
                                        ? '!border-neon-purple !bg-neon-purple/10'
                                        : ''
                                        }`}
                                >
                                    {btn.icon}
                                    <span className="hidden sm:inline">{btn.label}</span>
                                </motion.button>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="relative">
                            <div className="absolute top-4 left-5 flex gap-1.5 z-10">
                                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                                <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                                <span className="w-3 h-3 rounded-full bg-green-500/70" />
                            </div>
                            <textarea
                                className="code-input !pt-12"
                                placeholder={placeholderCode}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                spellCheck={false}
                            />
                        </div>

                        {/* Output — ref attached here for auto-scroll */}
                        {output && (
                            <motion.div
                                ref={outputRef}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="relative"
                            >
                                <span className="absolute top-4 right-5 text-[10px] font-semibold uppercase tracking-widest text-neon-cyan/60">
                                    Output
                                </span>
                                <div className="absolute top-4 left-5 flex gap-1.5 z-10">
                                    <span className="w-3 h-3 rounded-full bg-red-500/70" />
                                    <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                                    <span className="w-3 h-3 rounded-full bg-green-500/70" />
                                </div>
                                <textarea
                                    className="code-input !pt-12 !border-neon-purple/20"
                                    value={output}
                                    readOnly
                                />
                            </motion.div>
                        )}
                    </motion.div>

                    {/* ─── Right: analysis panel ─── */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="glass p-6 space-y-6 self-start"
                    >
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <HiChartBar className="text-neon-purple" />
                            Analysis
                        </h3>

                        {/* Time complexity */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
                                <HiClock className="text-neon-blue" /> Time Complexity
                            </div>
                            <div className="glass !rounded-xl p-4">
                                <span className="text-2xl font-bold gradient-text">O(n)</span>
                                <p className="mt-1 text-xs text-text-secondary">
                                    Linear — single pass through the array.
                                </p>
                            </div>
                        </div>

                        {/* Space complexity */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
                                <HiDatabase className="text-neon-cyan" /> Space Complexity
                            </div>
                            <div className="glass !rounded-xl p-4">
                                <span className="text-2xl font-bold gradient-text">O(1)</span>
                                <p className="mt-1 text-xs text-text-secondary">
                                    Constant — no extra data structures used.
                                </p>
                            </div>
                        </div>

                        {/* Suggestions */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
                                <HiLightBulb className="text-neon-pink" /> Suggestions
                            </div>
                            <ul className="space-y-2 text-xs text-text-secondary leading-relaxed">
                                {[
                                    'Add null / empty-array guard clause.',
                                    'Initialize max with arr[0] instead of 0.',
                                    'Use < instead of <= to avoid out-of-bound.',
                                    'Consider using Math.max(...arr) for short arrays.',
                                ].map((s, i) => (
                                    <li key={i} className="flex gap-2">
                                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neon-purple" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
