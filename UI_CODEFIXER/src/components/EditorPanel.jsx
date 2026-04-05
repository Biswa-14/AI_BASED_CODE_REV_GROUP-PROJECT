import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
    HiChartBar,
    HiClock,
    HiCode,
    HiDatabase,
    HiExclamationCircle,
    HiLightBulb,
    HiLightningBolt,
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

export default function EditorPanel() {
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
        setOutput('Thinking...');

        if (!code.trim()) {
            setOutput('Paste some code first so I can analyze it.');
            setActiveBtn(null);
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/chat-stream/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Language: ${lang}
Action: ${action}
Analyze and improve this code:

${code}`,
                }),
            });

            if (!response.ok || !response.body) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let result = '';
            setOutput('');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                if (!chunk) continue;

                result += chunk;
                setOutput(result);
            }

            const finalChunk = decoder.decode();
            if (finalChunk) {
                result += finalChunk;
                setOutput(result);
            }
        } catch (error) {
            console.error('ERROR:', error);
            setOutput('Error connecting to Sentient.');
        }

        setTimeout(() => setActiveBtn(null), 300);
    };

    const actionButtons = [
        { label: 'Fix Bugs', icon: <HiExclamationCircle />, action: 'fix' },
        { label: 'Optimize Code', icon: <HiLightningBolt />, action: 'optimize' },
        { label: 'Improve Complexity', icon: <HiChartBar />, action: 'complexity' },
    ];

    return (
        <section id="editor" className="relative py-20 px-6">
            <div className="max-w-7xl mx-auto">
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
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6 }}
                        className="space-y-5"
                    >
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 glass px-3 py-2 !rounded-xl">
                                <HiCode className="text-neon-purple text-lg" />
                                <select
                                    value={lang}
                                    onChange={(e) => setLang(e.target.value)}
                                    className="select-styled !bg-transparent !border-0 !p-0 !pr-6"
                                >
                                    {languages.map((language) => (
                                        <option key={language}>{language}</option>
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

                        {output && (
                            <motion.div
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
                                <div
                                    ref={outputRef}
                                    className="code-output !pt-12 !border-neon-purple/20"
                                >
                                    <pre className="code-output-text">{output}</pre>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

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

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
                                <HiClock className="text-neon-blue" /> Time Complexity
                            </div>
                            <div className="glass !rounded-xl p-4">
                                <span className="text-2xl font-bold gradient-text">O(n)</span>
                                <p className="mt-1 text-xs text-text-secondary">
                                    Linear single-pass improvements are usually the target.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
                                <HiDatabase className="text-neon-cyan" /> Space Complexity
                            </div>
                            <div className="glass !rounded-xl p-4">
                                <span className="text-2xl font-bold gradient-text">O(1)</span>
                                <p className="mt-1 text-xs text-text-secondary">
                                    Efficient fixes should avoid unnecessary extra memory.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
                                <HiLightBulb className="text-neon-pink" /> Suggestions
                            </div>
                            <ul className="space-y-2 text-xs text-text-secondary leading-relaxed">
                                {[
                                    'Keep demo inputs under 150-200 lines for faster streaming.',
                                    'Use the fix action first, then optimization for a cleaner demo flow.',
                                    'Prefer one focused code sample per request during the presentation.',
                                    'If needed, keep llama3.1:8b as your emergency fallback model.',
                                ].map((suggestion) => (
                                    <li key={suggestion} className="flex gap-2">
                                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neon-purple" />
                                        {suggestion}
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
