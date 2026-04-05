import { motion } from 'framer-motion';
import { HiShieldCheck, HiLightningBolt, HiSparkles } from 'react-icons/hi';

const cards = [
    {
        icon: <HiShieldCheck />,
        title: 'Bug Detection',
        desc: 'Instantly spot syntax errors, off-by-one bugs, null-reference issues and more — before they hit production.',
        color: 'from-neon-blue to-neon-purple',
        glow: 'rgba(59, 130, 246, 0.15)',
    },
    {
        icon: <HiLightningBolt />,
        title: 'Performance Optimization',
        desc: 'Get AI-driven refactors that shave milliseconds, reduce memory usage, and improve Big-O complexity.',
        color: 'from-neon-purple to-neon-pink',
        glow: 'rgba(139, 92, 246, 0.15)',
    },
    {
        icon: <HiSparkles />,
        title: 'Clean Code Suggestions',
        desc: 'Receive best-practice tips on naming, structure, and patterns — write code your future self will thank you for.',
        color: 'from-neon-cyan to-neon-blue',
        glow: 'rgba(6, 182, 212, 0.15)',
    },
];

const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Features() {
    return (
        <section id="features" className="relative py-24 px-6">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold">
                        Why <span className="gradient-text">CodeFixer</span>?
                    </h2>
                    <p className="mt-3 text-text-secondary text-sm sm:text-base max-w-md mx-auto">
                        Three super-powers your editor doesn't have — yet.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-60px' }}
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {cards.map((card) => (
                        <motion.div
                            key={card.title}
                            variants={cardVariants}
                            whileHover={{ y: -6, transition: { duration: 0.25 } }}
                            className="glass p-7 flex flex-col gap-4 group cursor-default"
                            style={{ transition: 'box-shadow 0.3s ease' }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.boxShadow = `0 0 40px ${card.glow}`)
                            }
                            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                        >
                            <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl text-white bg-gradient-to-br ${card.color} shadow-lg`}
                            >
                                {card.icon}
                            </div>
                            <h3 className="text-lg font-bold">{card.title}</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {card.desc}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
