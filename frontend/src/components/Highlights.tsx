import { useEffect, useRef } from 'react';
import { Database, Cpu, BarChart3 } from 'lucide-react';
import gsap from 'gsap';
import { registerMotionPlugins, revealSectionItems } from '../lib/motion';

const highlights = [
    {
        icon: Database,
        title: 'CIFAR-10 Dataset',
        description:
            '60,000 images used for training with automatic RGB to grayscale conversion for supervised learning pairs.',
    },
    {
        icon: Cpu,
        title: 'Autoencoder Model',
        description:
            'Convolutional encoder-decoder architecture with 3 encoding blocks and 2 transposed-convolution decoding stages.',
    },
    {
        icon: BarChart3,
        title: 'Training Pipeline',
        description:
            'End-to-end PyTorch training with MSE loss, Adam optimizer, validation tracking, and best-model checkpointing.',
    },
];

export default function Highlights() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        registerMotionPlugins();
        const ctx = gsap.context(() => {
            revealSectionItems('.highlight-card', sectionRef.current, {
                y: 30,
                duration: 0.68,
                stagger: 0.12,
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-20 lg:py-28 relative">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                {highlights.map((h) => (
                    <div
                        key={h.title}
                        className="highlight-card interactive-card group bg-bg-card rounded-2xl border border-border p-8"
                    >
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 transition-colors duration-300 group-hover:bg-primary/20">
                            <h.icon size={22} className="text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{h.title}</h3>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            {h.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
