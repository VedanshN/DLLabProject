import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
    { label: 'Methodology', target: 'method' },
    { label: 'Architecture', target: 'architecture' },
    { label: 'Result', target: 'results' },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const navRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollTo = (id: string) => {
        setMobileOpen(false);
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <nav
            ref={navRef}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/80 backdrop-blur-md shadow-sm'
                : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16 lg:h-20">
                {/* Logo */}
                <a href="#" className="text-lg font-semibold tracking-tight text-bg-dark">
                    <span className="text-primary">AI</span> Colorization
                </a>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <button
                            key={link.label}
                            onClick={() => scrollTo(link.target)}
                            className="interactive-link text-sm text-black hover:text-black cursor-pointer"
                        >
                            {link.label}
                        </button>
                    ))}
                    <a
                        href="#demo"
                        className="interactive-button ml-2 px-5 py-2 rounded-full bg-bg-dark text-white text-sm font-medium hover:bg-bg-dark/90"
                    >
                        View Demo
                    </a>
                </div>

                {/* Mobile toggle */}
                <button
                    className="md:hidden p-2 text-text"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-t border-border px-6 py-4 space-y-3">
                    {navLinks.map((link) => (
                        <button
                            key={link.label}
                            onClick={() => scrollTo(link.target)}
                            className="interactive-link block w-full text-left text-sm text-black hover:text-black"
                        >
                            {link.label}
                        </button>
                    ))}
                    <a
                        href="#demo"
                        onClick={() => setMobileOpen(false)}
                        className="interactive-button block text-center px-5 py-2 rounded-full bg-bg-dark text-white text-sm font-medium"
                    >
                        View Demo
                    </a>
                </div>
            )}
        </nav>
    );
}
