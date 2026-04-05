import { motion } from 'framer-motion';
import { HiArrowDown } from 'react-icons/hi';

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
            <div className="max-w-3xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                    <span className="inline-block mb-5 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase rounded-full border border-glass-border text-neon-purple"
                        style={{ background: 'rgba(139, 92, 246, 0.08)' }}>
                        AI-Powered Code Assistant
                    </span>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
                        Drop Your Broken Code.{' '}
                        <span className="gradient-text">Get Clean Logic.</span>
                    </h1>

                    <p className="mt-6 text-base sm:text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
                        Paste your buggy code and let our AI fix errors, optimize complexity,
                        and suggest cleaner patterns — all in seconds.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.35, ease: 'easeOut' }}
                    className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <a href="#editor" className="btn-glow text-base">
                        Fix My Code
                        <HiArrowDown className="ml-1 animate-bounce" />
                    </a>
                    <a href="#features" className="btn-outline">
                        See Features
                    </a>
                </motion.div>

                {/* Decorative glow orbs */}
                <div
                    className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full opacity-20 blur-[120px]"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                />
            </div>
        </section>
    );
}
