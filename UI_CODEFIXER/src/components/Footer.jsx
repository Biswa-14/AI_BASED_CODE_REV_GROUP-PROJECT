export default function Footer() {
    return (
        <footer className="relative mt-12 pb-10 pt-8 px-6 text-center">
            {/* Gradient separator */}
            <div
                className="mx-auto mb-8 h-px w-48 rounded-full"
                style={{
                    background:
                        'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), rgba(59,130,246,0.5), transparent)',
                }}
            />

            <p className="text-xs text-text-secondary">
                &copy; {new Date().getFullYear()}{' '}
                <span className="font-semibold text-text-primary">CodeFixer</span>. Built
                with 💜 for developers.
            </p>
        </footer>
    );
}
