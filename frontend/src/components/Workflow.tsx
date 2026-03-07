import { useEffect, useRef } from 'react';
import { Upload, SlidersHorizontal, Cpu, ImageIcon } from 'lucide-react';
import gsap from 'gsap';
import { prefersReducedMotion, registerMotionPlugins } from '../lib/motion';

const steps = [
    {
        icon: Upload,
        title: 'Upload Image',
        description: 'Upload a grayscale photograph in any common format (PNG, JPG).',
    },
    {
        icon: SlidersHorizontal,
        title: 'Preprocessing',
        description: 'Image is resized to 32×32 and normalized to [0, 1] range.',
    },
    {
        icon: Cpu,
        title: 'Model Inference',
        description: 'Convolutional autoencoder predicts the 3-channel color output.',
    },
    {
        icon: ImageIcon,
        title: 'RGB Reconstruction',
        description: 'Output tensor is converted back to a full-color RGB image.',
    },
];

export default function Workflow() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        registerMotionPlugins();
        const ctx = gsap.context(() => {
            if (prefersReducedMotion()) return;

            gsap.fromTo('.workflow-step',
                { y: 24, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.16,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 85%',
                        once: true,
                    },
                }
            );
            gsap.from('.workflow-line', {
                scaleX: 0,
                duration: 0.65,
                stagger: 0.16,
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
        <section id="method" ref={sectionRef} className="py-20 lg:py-28 bg-bg-dark text-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
                <div className="text-center mb-16">
                    <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
                        How It Works
                    </p>
                    <h2 className="text-3xl lg:text-4xl font-bold">
                        Deep Learning <span className="text-primary">Pipeline</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-0 relative">
                    {steps.map((step, i) => (
                        <div key={step.title} className="relative flex flex-col items-center">
                            {/* Connector line (not on last) */}
                            {i < steps.length - 1 && (
                                <div className="workflow-line hidden md:block absolute top-9 left-1/2 w-full h-px bg-white/10 origin-left z-0" />
                            )}

                            <div className="workflow-step relative z-10 flex flex-col items-center text-center rounded-xl px-2.5 py-4 transition-all duration-300 border border-transparent hover:border-primary/35 hover:bg-white/[0.04]">
                                {/* Step number ring */}
                                <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mb-4">
                                    <step.icon size={22} className="text-primary" />
                                </div>

                                <span className="text-xs font-bold text-primary mb-1.5">
                                    Step {i + 1}
                                </span>
                                <h3 className="text-sm font-semibold mb-2">{step.title}</h3>
                                <p className="text-xs text-gray-300 max-w-[200px] leading-relaxed">
                                    {step.description}
                                </p>
                            </div>

                            {/* Vertical connector for mobile */}
                            {i < steps.length - 1 && (
                                <div className="md:hidden w-px h-8 bg-white/10 my-3" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
