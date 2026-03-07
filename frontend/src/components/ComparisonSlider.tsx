import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FadeImage from './ui/FadeImage';
import { isSmallViewport, prefersReducedMotion, registerMotionPlugins, revealSectionItems } from '../lib/motion';

interface ComparisonSliderProps {
    liveGrayscaleUrl?: string | null;
    liveColorizedUrl?: string | null;
}

export default function ComparisonSlider({ liveGrayscaleUrl, liveColorizedUrl }: ComparisonSliderProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const sliderPosRef = useRef(50);
    const autoAnimatedRef = useRef(false);
    const autoTimelineRef = useRef<gsap.core.Timeline | null>(null);
    const isDragging = useRef(false);
    const [isActiveDrag, setIsActiveDrag] = useState(false);
    const [sliderPercent, setSliderPercent] = useState(50);

    const grayscaleSrc = liveGrayscaleUrl || '/images/sample1bw.jpeg';
    const colorizedSrc = liveColorizedUrl || '/images/sample1color.jpeg';
    const isLive = !!(liveGrayscaleUrl && liveColorizedUrl);

    /* ── drag logic ─────────────────────────────────────────────── */
    const setSliderPosition = useCallback((nextValue: number, smooth = false) => {
        if (!containerRef.current) return;
        const clamped = Math.max(0, Math.min(nextValue, 100));
        sliderPosRef.current = clamped;
        setSliderPercent(clamped);
        gsap.to(containerRef.current, {
            '--slider-pos': `${clamped}%`,
            duration: smooth ? 0.16 : 0,
            ease: 'power2.out',
            overwrite: true,
        });
    }, []);

    const updatePosition = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        setSliderPosition((x / rect.width) * 100, true);
    }, [setSliderPosition]);

    const onPointerDown = useCallback(
        (e: React.PointerEvent) => {
            autoTimelineRef.current?.kill();
            isDragging.current = true;
            setIsActiveDrag(true);
            updatePosition(e.clientX);
            e.currentTarget.setPointerCapture(e.pointerId);
        },
        [updatePosition]
    );
    const onPointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!isDragging.current) return;
            updatePosition(e.clientX);
        },
        [updatePosition]
    );
    const onPointerUp = useCallback(() => {
        isDragging.current = false;
        setIsActiveDrag(false);
    }, [setIsActiveDrag]);

    /* ── GSAP scroll reveal ─────────────────────────────────────── */
    useEffect(() => {
        registerMotionPlugins();
        const ctx = gsap.context(() => {
            setSliderPosition(50);
            revealSectionItems('.comparison-inner', sectionRef.current, {
                y: 26,
                duration: 0.78,
            });

            if (prefersReducedMotion() || isSmallViewport()) return;

            ScrollTrigger.create({
                trigger: sectionRef.current,
                start: 'top 72%',
                once: true,
                onEnter: () => {
                    if (autoAnimatedRef.current || !containerRef.current) return;
                    autoAnimatedRef.current = true;
                    autoTimelineRef.current = gsap
                        .timeline()
                        .to(containerRef.current, {
                            '--slider-pos': '82%',
                            duration: 1,
                            ease: 'power2.inOut',
                        })
                        .to(containerRef.current, {
                            '--slider-pos': '34%',
                            duration: 0.95,
                            ease: 'power2.inOut',
                        })
                        .to(containerRef.current, {
                            '--slider-pos': '50%',
                            duration: 0.8,
                            ease: 'power2.out',
                        });
                },
            });
        }, sectionRef);
        return () => {
            autoTimelineRef.current?.kill();
            ctx.revert();
        };
    }, [setSliderPosition]);

    return (
        <section ref={sectionRef} className="py-20 lg:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
                <div className="text-center mb-14">
                    <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
                        Before &amp; After
                    </p>
                    <h2 className="text-3xl lg:text-4xl font-bold">
                        Colorization <span className="text-primary">Results</span>
                    </h2>
                </div>

                <div className="comparison-inner max-w-2xl mx-auto">
                    <div
                        ref={containerRef}
                        className={`comparison-track relative w-full aspect-square rounded-2xl overflow-hidden border border-border shadow-lg select-none touch-none transition-shadow duration-300 ${isActiveDrag ? 'cursor-grabbing drag-active-shadow' : 'cursor-col-resize hover:shadow-xl'
                            }`}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={onPointerUp}
                        onPointerLeave={onPointerUp}
                    >
                        {/* Colored (full) */}
                        {isLive ? (
                            <img
                                src={colorizedSrc}
                                alt="Colorized"
                                className="absolute inset-0 w-full h-full object-cover"
                                draggable={false}
                            />
                        ) : (
                            <FadeImage
                                src={colorizedSrc}
                                alt="Colorized"
                                className="absolute inset-0 w-full h-full object-cover"
                                draggable={false}
                            />
                        )}

                        {/* Grayscale (clipped) */}
                        <div
                            className="absolute inset-0 overflow-hidden"
                            style={{ width: 'var(--slider-pos)' }}
                        >
                            {isLive ? (
                                <img
                                    src={grayscaleSrc}
                                    alt="Grayscale"
                                    className="absolute inset-0 w-full h-full object-cover"
                                    draggable={false}
                                />
                            ) : (
                                <FadeImage
                                    src={grayscaleSrc}
                                    alt="Grayscale"
                                    className="absolute inset-0 w-full h-full object-cover"
                                    draggable={false}
                                />
                            )}
                        </div>

                        {/* Divider line + handle */}
                        <div
                            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md z-10"
                            style={{ left: 'var(--slider-pos)' }}
                        >
                            <div className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center transition-shadow duration-250 ${isActiveDrag ? 'shadow-xl' : 'shadow-lg'
                                }`}>
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    className="text-text-secondary"
                                >
                                    <path
                                        d="M7 4l-4 6 4 6M13 4l4 6-4 6"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                        </div>
                        <div
                            className="absolute top-0 bottom-0 w-8 -translate-x-1/2 pointer-events-none"
                            style={{
                                left: 'var(--slider-pos)',
                                background:
                                    'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%)',
                            }}
                        />

                        {/* Labels */}
                        <span className={`absolute top-4 left-4 text-xs font-semibold text-white px-3 py-1 rounded-full transition-colors duration-300 ${sliderPercent >= 60 ? 'bg-primary' : 'bg-black/50'
                            }`}>
                            Grayscale
                        </span>
                        <span className={`absolute top-4 right-4 text-xs font-semibold text-white px-3 py-1 rounded-full transition-colors duration-300 ${sliderPercent <= 40 ? 'bg-primary' : 'bg-black/50'
                            }`}>
                            Colorized
                        </span>
                    </div>

                    <p className="text-center text-sm text-text-secondary mt-4">
                        Drag the slider to compare the grayscale input with the colorized output.
                    </p>
                </div>
            </div>
        </section>
    );
}
