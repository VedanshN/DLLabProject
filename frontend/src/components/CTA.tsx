import { useEffect, useRef } from 'react';
import { ArrowRight, Github } from 'lucide-react';
import gsap from 'gsap';
import { registerMotionPlugins, revealSectionItems } from '../lib/motion';

export default function CTA() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        registerMotionPlugins();
        const ctx = gsap.context(() => {
            revealSectionItems('.cta-inner', sectionRef.current, {
                y: 30,
                duration: 0.8,
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-20 lg:py-28 bg-white relative overflow-hidden">
            <div className="radial-accent w-[420px] h-[420px] right-[-110px] top-[20%] opacity-60" />
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
                <div className="cta-inner bg-bg-dark rounded-3xl px-8 py-16 lg:px-20 lg:py-20 text-center">
                    <p className="text-sm font-medium text-primary uppercase tracking-wider mb-4">
                        Get Started
                    </p>
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-5 leading-tight">
                        Explore the full{' '}
                        <span className="text-primary">implementation</span>
                        <br className="hidden sm:block" /> and experiment with the model
                    </h2>
                    <p className="text-sm text-gray-400 max-w-lg mx-auto mb-10 leading-relaxed">
                        Clone the repository, train the model on CIFAR-10, and deploy the
                        FastAPI inference server to colorize your own images.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="#demo"
                            className="interactive-button button-ripple inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-dark"
                        >
                            Open Demo <ArrowRight size={16} />
                        </a>
                        <a
                            href="#repository"
                            className="interactive-button inline-flex items-center gap-2 px-8 py-3 border border-gray-600 text-white rounded-full text-sm font-medium hover:bg-white/10"
                        >
                            <Github size={16} /> View Repository
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
