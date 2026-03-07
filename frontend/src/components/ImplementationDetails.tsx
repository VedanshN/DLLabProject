import { useEffect, useRef } from 'react';
import { Code2, Server, Database, GraduationCap } from 'lucide-react';
import gsap from 'gsap';
import { registerMotionPlugins, revealSectionItems } from '../lib/motion';

const details = [
    {
        icon: Code2,
        title: 'Frameworks',
        items: ['PyTorch', 'FastAPI', 'React + TypeScript'],
    },
    {
        icon: Server,
        title: 'Backend',
        items: ['FastAPI + Uvicorn', 'REST API endpoints', 'CORS middleware'],
    },
    {
        icon: Database,
        title: 'Dataset',
        items: ['CIFAR-10 (60K images)', 'Auto RGB → Grayscale', '32×32 resolution'],
    },
    {
        icon: GraduationCap,
        title: 'Training',
        items: ['MSE loss function', 'Adam optimizer (lr=0.001)', 'Best-model checkpointing'],
    },
];

export default function ImplementationDetails() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        registerMotionPlugins();
        const ctx = gsap.context(() => {
            revealSectionItems('.impl-card', sectionRef.current, {
                y: 22,
                duration: 0.62,
                stagger: 0.1,
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-20 lg:py-28 bg-bg-dark text-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
                <div className="text-center mb-16">
                    <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
                        Technical Stack
                    </p>
                    <h2 className="text-3xl lg:text-4xl font-bold">
                        Implementation <span className="text-primary">Details</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {details.map((d) => (
                        <div
                            key={d.title}
                            className="impl-card interactive-card bg-white/[0.03] rounded-2xl border border-white/10 p-7 hover:bg-white/[0.06] hover:border-primary/35"
                        >
                            <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-5">
                                <d.icon size={20} className="text-primary" />
                            </div>

                            <h3 className="text-sm font-semibold mb-4">{d.title}</h3>

                            <ul className="space-y-2.5">
                                {d.items.map((item) => (
                                    <li key={item} className="flex items-center gap-2 text-xs text-gray-300">
                                        <div className="w-1 h-1 rounded-full bg-primary shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
