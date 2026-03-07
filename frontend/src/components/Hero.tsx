import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Github } from 'lucide-react';
import gsap from 'gsap';
import FadeImage from './ui/FadeImage';
import { prefersReducedMotion } from '../lib/motion';

type PreviewMode = 'grayscale' | 'colorized';

export default function Hero() {
    const sectionRef = useRef<HTMLElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const revealRef = useRef<HTMLDivElement>(null);
    const scanRef = useRef<HTMLDivElement>(null);
    const hasMountedRef = useRef(false);
    const [previewMode, setPreviewMode] = useState<PreviewMode>('colorized');

    const animatePreviewMode = useCallback((mode: PreviewMode) => {
        if (!revealRef.current) return;
        const targetWidth = mode === 'grayscale' ? '100%' : '0%';

        if (prefersReducedMotion()) {
            gsap.set(revealRef.current, { width: targetWidth });
            return;
        }

        gsap.to(revealRef.current, {
            width: targetWidth,
            duration: 0.55,
            ease: 'power2.inOut',
            overwrite: true,
        });

        if (scanRef.current) {
            gsap.fromTo(
                scanRef.current,
                { xPercent: -125, opacity: 0.85 },
                { xPercent: 125, opacity: 0, duration: 0.62, ease: 'power2.inOut', overwrite: true }
            );
        }
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (prefersReducedMotion()) return;

            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            tl.from('.hero-line', {
                y: 34,
                opacity: 0,
                duration: 0.7,
                stagger: 0.11,
            })
                .from(
                    '.hero-copy',
                    {
                        y: 20,
                        opacity: 0,
                        duration: 0.65,
                    },
                    '-=0.35'
                )
                .from(
                    '.hero-actions > *',
                    {
                        y: 16,
                        opacity: 0,
                        duration: 0.5,
                        stagger: 0.1,
                    },
                    '-=0.35'
                )
                .from(
                    cardRef.current!,
                    {
                        x: 52,
                        opacity: 0,
                        duration: 0.95,
                    },
                    '-=0.6'
                )
                .from(
                    '.hero-stat',
                    {
                        y: 16,
                        opacity: 0,
                        duration: 0.45,
                        stagger: 0.08,
                    },
                    '-=0.45'
                )
                .fromTo(
                    revealRef.current,
                    { width: '100%' },
                    {
                        width: '0%',
                        duration: 1.2,
                        ease: 'power2.inOut',
                    },
                    '-=0.5'
                )
                .fromTo(
                    scanRef.current,
                    { xPercent: -130, opacity: 0.8 },
                    {
                        xPercent: 135,
                        opacity: 0,
                        duration: 1,
                        ease: 'power2.inOut',
                    },
                    '<'
                );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
            return;
        }
        animatePreviewMode(previewMode);
    }, [previewMode, animatePreviewMode]);

    return (
        <section
            id="overview"
            ref={sectionRef}
            className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden"
        >
            <div className="pointer-events-none absolute inset-0 -z-20">
                <FadeImage
                    src="/herobgnewer.jpeg"
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-bg/62 via-bg/24 to-bg/8" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-14 items-center relative z-10">
                {/* Left — text */}
                <div ref={textRef}>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                        <span className="hero-line block">
                            Restoring <span className="text-primary">color</span>
                        </span>
                        <span className="hero-line block">to grayscale images</span>
                        <span className="hero-line block">using deep learning</span>
                    </h1>

                    <p className="hero-copy text-base lg:text-lg text-black max-w-lg mb-10 leading-relaxed">
                        This project demonstrates how neural networks such as autoencoders
                        and U-Net architectures can reconstruct realistic color information
                        from grayscale images.
                    </p>
                    <p className="hero-copy text-xs sm:text-sm text-black mb-6 tracking-wide uppercase">
                        Scroll down to see how it works
                    </p>

                    <div className="hero-actions flex flex-wrap gap-4">
                        <a
                            href="#repository"
                            className="interactive-button button-ripple inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary-dark"
                        >
                            <Github size={16} /> View Source Code
                        </a>
                    </div>
                </div>

                {/* Right — colorization mockup card */}
                <div ref={cardRef} className="flex justify-center lg:justify-end">
                    <div className="w-full max-w-md bg-bg-card rounded-2xl shadow-xl border border-border overflow-hidden interactive-card">
                        {/* Card header */}
                        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                            <span className="text-sm font-semibold">Colorization Preview</span>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                                Live
                            </span>
                        </div>

                        {/* Card body */}
                        <div className="p-5 space-y-4">
                            <div className="relative rounded-xl overflow-hidden border border-border">
                                <FadeImage
                                    src="/images/sample_colored.png"
                                    alt="Colorized output"
                                    className="w-full h-40 object-cover"
                                />
                                <div
                                    ref={revealRef}
                                    className="absolute inset-0 overflow-hidden border-r border-white/60"
                                >
                                    <FadeImage
                                        src="/images/sample_grayscale.png"
                                        alt="Grayscale input"
                                        className="w-full h-40 object-cover"
                                    />
                                </div>
                                <div ref={scanRef} className="scan-overlay opacity-0 -translate-x-[120%]" />
                                <button
                                    type="button"
                                    onClick={() => setPreviewMode('grayscale')}
                                    className={`absolute top-3 left-3 z-10 text-[10px] font-semibold px-2 py-1 rounded-full transition-colors duration-250 cursor-pointer ${previewMode === 'grayscale'
                                        ? 'bg-black/70 text-white'
                                        : 'bg-black/45 text-white/90 hover:bg-black/60'
                                        }`}
                                    aria-label="Show grayscale preview"
                                >
                                    Grayscale
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPreviewMode('colorized')}
                                    className={`absolute top-3 right-3 z-10 text-[10px] font-semibold px-2 py-1 rounded-full transition-colors duration-250 cursor-pointer ${previewMode === 'colorized'
                                        ? 'bg-primary text-white'
                                        : 'bg-primary/70 text-white hover:bg-primary/85'
                                        }`}
                                    aria-label="Show colorized preview"
                                >
                                    Colorized
                                </button>
                            </div>

                            {/* Arrow */}
                            <div className="flex items-center justify-center gap-2 text-text-secondary">
                                <div className="h-px flex-1 bg-border" />
                                <ArrowRight size={18} className="text-primary" />
                                <div className="h-px flex-1 bg-border" />
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3 text-center">
                                {[
                                    { label: 'MSE Loss', value: '0.0043' },
                                    { label: 'PSNR', value: '28.4 dB' },
                                    { label: 'Runtime', value: '12 ms' },
                                ].map((s) => (
                                    <div key={s.label} className="hero-stat py-2">
                                        <p className="text-lg font-bold">{s.value}</p>
                                        <p className="text-xs text-text-secondary">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
