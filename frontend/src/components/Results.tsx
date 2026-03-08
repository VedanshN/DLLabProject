import { useEffect, useRef, useState } from 'react';
import { TrendingDown, Eye, BarChart3 } from 'lucide-react';
import gsap from 'gsap';
import { prefersReducedMotion, registerMotionPlugins, revealSectionItems } from '../lib/motion';

const results = [
    {
        icon: TrendingDown,
        title: 'Training Loss Curve',
        description:
            'Mean Squared Error steadily decreases across 25 epochs, reaching a final validation loss of 0.0043.',
        metric: '0.0043',
        metricLabel: 'Best Val Loss',
        chartBars: [90, 72, 58, 45, 35, 28, 22, 18, 15, 12],
    },
    {
        icon: Eye,
        title: 'Sample Predictions',
        description:
            'The model successfully captures dominant colors — sky blues, vegetation greens, and earth tones — even at 32×32 resolution.',
        metric: '28.4 dB',
        metricLabel: 'Avg PSNR',
        chartBars: [40, 55, 65, 70, 75, 78, 80, 82, 84, 85],
    },
    {
        icon: BarChart3,
        title: 'Model Comparison',
        description:
            'The U-Net variant achieves ~15% lower MSE compared to the vanilla autoencoder thanks to skip connections.',
        metric: '15%',
        metricLabel: 'Improvement',
        chartBars: [50, 55, 60, 58, 65, 70, 72, 78, 82, 88],
    },
];

export default function Results() {
    const sectionRef = useRef<HTMLElement>(null);
    const [hoveredLossIndex, setHoveredLossIndex] = useState<number | null>(null);

    useEffect(() => {
        registerMotionPlugins();
        const ctx = gsap.context(() => {
            revealSectionItems('.result-card', sectionRef.current, {
                y: 28,
                duration: 0.7,
                stagger: 0.13,
            });
            if (prefersReducedMotion()) return;
            gsap.from('.result-bar', {
                scaleY: 0,
                transformOrigin: 'bottom',
                duration: 0.45,
                stagger: 0.02,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 78%',
                    once: true,
                },
            });
            gsap.from('.result-line', {
                scaleY: 0,
                transformOrigin: 'bottom',
                duration: 0.6,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 78%',
                    once: true,
                },
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section id="results" ref={sectionRef} className="py-20 lg:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
                <div className="text-center mb-16">
                    <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
                        Evaluation
                    </p>
                    <h2 className="text-3xl lg:text-4xl font-bold">
                        Training <span className="text-primary">Results</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {results.map((r) => (
                        <div
                            key={r.title}
                            className="result-card interactive-card bg-bg rounded-2xl border border-border p-7"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <r.icon size={18} className="text-primary" />
                                    </div>
                                    <h3 className="text-sm font-semibold">{r.title}</h3>
                                </div>
                            </div>

                            {/* Mini chart */}
                            {r.title === 'Training Loss Curve' ? (
                                <div 
                                    className="relative flex items-end h-20 mb-4 w-full"
                                    onMouseLeave={() => setHoveredLossIndex(null)}
                                >
                                    <svg
                                        className="w-full h-full overflow-visible result-line"
                                        viewBox="0 0 100 100"
                                        preserveAspectRatio="none"
                                    >
                                        <polyline
                                            points={r.chartBars.map((val, i) => `${(i / (r.chartBars.length - 1)) * 100},${100 - val}`).join(' ')}
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            className="text-primary"
                                            vectorEffect="non-scaling-stroke"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    
                                    {/* Data Points Overlay */}
                                    <div className="absolute inset-0 pointer-events-none z-10">
                                        {r.chartBars.map((val, i) => {
                                            const x = (i / (r.chartBars.length - 1)) * 100;
                                            const y = 100 - val;
                                            return (
                                                <div
                                                    key={i}
                                                    className={`absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-primary border-2 border-white shadow-sm transition-all duration-200 ${hoveredLossIndex === i ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                                                    style={{
                                                        left: `${x}%`,
                                                        top: `${y}%`,
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                    
                                    {/* Hover Areas */}
                                    <div className="absolute inset-0 flex z-10">
                                        {r.chartBars.map((_, i) => (
                                            <div
                                                key={i}
                                                className="h-full flex-1 cursor-crosshair"
                                                onMouseEnter={() => setHoveredLossIndex(i)}
                                            />
                                        ))}
                                    </div>

                                    {/* Tooltip */}
                                    <div 
                                        className={`absolute flex items-center gap-1 bg-[#131b2c] border border-white/10 text-xs px-2.5 py-1.5 rounded-md shadow-xl whitespace-nowrap pointer-events-none z-20 font-medium -translate-x-1/2 -translate-y-[calc(100%+12px)] transition-all duration-200 ${hoveredLossIndex !== null ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                                        style={{ 
                                            left: hoveredLossIndex !== null ? `${(hoveredLossIndex / (r.chartBars.length - 1)) * 100}%` : '50%',
                                            top: hoveredLossIndex !== null ? `${100 - r.chartBars[hoveredLossIndex]}%` : '50%',
                                            willChange: 'left, top, opacity, transform'
                                        }}
                                    >
                                        <span className="text-slate-400 font-normal">Loss:</span>
                                        <span className="text-white">{hoveredLossIndex !== null ? (r.chartBars[hoveredLossIndex] * (0.0043 / 12)).toFixed(4) : ''}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-end gap-1 h-20 mb-4">
                                    {r.chartBars.map((h, i) => (
                                        <div
                                            key={i}
                                            className="result-bar flex-1 rounded-t bg-primary/20 hover:bg-primary/40 transition-colors"
                                            style={{ height: `${h}%` }}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Metric */}
                            <div className="flex items-baseline gap-2 mb-3">
                                <span className="text-2xl font-bold">{r.metric}</span>
                                <span className="text-xs text-text-secondary">{r.metricLabel}</span>
                            </div>

                            <p className="text-xs text-text-secondary leading-relaxed">
                                {r.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
