import { useEffect, useRef } from 'react';
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

                            {/* Mini bar chart */}
                            <div className="flex items-end gap-1 h-20 mb-4">
                                {r.chartBars.map((h, i) => (
                                    <div
                                        key={i}
                                        className="result-bar flex-1 rounded-t bg-primary/20 hover:bg-primary/40 transition-colors"
                                        style={{ height: `${h}%` }}
                                    />
                                ))}
                            </div>

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
