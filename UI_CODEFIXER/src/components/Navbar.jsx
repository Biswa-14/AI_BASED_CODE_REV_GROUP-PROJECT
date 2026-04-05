import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenuAlt3, HiX } from 'react-icons/hi';

const navLinks = ['Home', 'Features', 'How it Works'];

export default function Navbar() {
    const [open, setOpen] = useState(false);

    return (
        <motion.nav
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="fixed top-0 inset-x-0 z-50 border-b border-glass-border"
            style={{
                background: 'rgba(10, 10, 15, 0.7)',
                backdropFilter: 'blur(8px)',
                borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
                WebkitBackdropFilter: 'blur(20px)'
                ,
            }}
        >
            <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
                {/* Logo */}
                <a href="#" className="text-xl font-extrabold tracking-tight gradient-text">
                    CodeFixer
                </a>

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link}
                            href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-300"
                        >
                            {link}
                        </a>
                    ))}
                    <button className="btn-glow !py-2.5 !px-6 !text-sm">Login</button>
                </div>

                {/* Hamburger */}
                <button
                    className="md:hidden text-text-primary text-2xl"
                    onClick={() => setOpen(!open)}
                    aria-label="Toggle menu"
                >
                    {open ? <HiX /> : <HiMenuAlt3 />}
                </button>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden overflow-hidden border-t border-glass-border"
                        style={{ background: 'rgba(10, 10, 15, 0.9)' }}
                    >
                        <div className="flex flex-col gap-4 px-6 py-5">
                            {navLinks.map((link) => (
                                <a
                                    key={link}
                                    href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                                    onClick={() => setOpen(false)}
                                    className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    {link}
                                </a>
                            ))}
                            <button className="btn-glow !py-2.5 !text-sm w-full">Login</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
