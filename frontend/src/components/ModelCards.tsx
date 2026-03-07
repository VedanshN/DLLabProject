import { useEffect, useRef } from 'react';
import { Layers, ArrowDown, ArrowUp } from 'lucide-react';
import gsap from 'gsap';
import { registerMotionPlugins, revealSectionItems } from '../lib/motion';

const encoder = [
    { label: 'Conv2d (1 → 64) + ReLU + MaxPool', output: '64 × 16 × 16' },
    { label: 'Conv2d (64 → 128) + ReLU + MaxPool', output: '128 × 8 × 8' },
    { label: 'Conv2d (128 → 256) + ReLU', output: '256 × 8 × 8 (bottleneck)' },
];

const decoder = [
    { label: 'ConvTranspose2d (256 → 128, stride 2) + ReLU', output: '128 × 16 × 16' },
    { label: 'ConvTranspose2d (128 → 64, stride 2) + ReLU', output: '64 × 32 × 32' },
    { label: 'Conv2d (64 → 3) + Sigmoid', output: '3 × 32 × 32 (RGB)' },
];

const details = [
    { label: 'Dataset', value: 'CIFAR-10 (60,000 images)' },
    { label: 'Input', value: 'Grayscale (1 × 32 × 32)' },
    { label: 'Output', value: 'RGB (3 × 32 × 32)' },
    { label: 'Loss Function', value: 'MSE Loss' },
    { label: 'Optimizer', value: 'Adam (lr = 0.001)' },
    { label: 'Checkpointing', value: 'Best val-loss model saved' },
];

export default function ModelCards() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        registerMotionPlugins();
        const ctx = gsap.context(() => {
            revealSectionItems('.arch-card', sectionRef.current, {
                y: 28,
                duration: 0.7,
                stagger: 0.13,
                start: 'top 75%',
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section id="architecture" ref={sectionRef} className="py-20 lg:py-28">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
                <div className="text-center mb-16">
                    <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
                        Architecture
                    </p>
                    <h2 className="text-3xl lg:text-4xl font-bold">
                        Model <span className="text-primary">Design</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Encoder card */}
                    <div className="arch-card interactive-card bg-bg-card rounded-2xl border border-border p-8 group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <ArrowDown size={20} className="text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">Encoder</h3>
                        </div>
                        <div className="space-y-3">
                            {encoder.map((layer, i) => (
                                <div key={i} className="bg-bg rounded-lg px-4 py-3 border border-border/60">
                                    <p className="text-xs font-mono text-text mb-1">{layer.label}</p>
                                    <p className="text-[11px] text-text-secondary">→ {layer.output}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Decoder card */}
                    <div className="arch-card interactive-card bg-bg-card rounded-2xl border border-border p-8 group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <ArrowUp size={20} className="text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">Decoder</h3>
                        </div>
                        <div className="space-y-3">
                            {decoder.map((layer, i) => (
                                <div key={i} className="bg-bg rounded-lg px-4 py-3 border border-border/60">
                                    <p className="text-xs font-mono text-text mb-1">{layer.label}</p>
                                    <p className="text-[11px] text-text-secondary">→ {layer.output}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Training details card */}
                    <div className="arch-card interactive-card bg-bg-card rounded-2xl border border-border p-8 group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <Layers size={20} className="text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">Training Config</h3>
                        </div>
                        <div className="space-y-3">
                            {details.map((d) => (
                                <div key={d.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                                    <span className="text-xs text-text-secondary">{d.label}</span>
                                    <span className="text-xs font-medium text-text">{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
