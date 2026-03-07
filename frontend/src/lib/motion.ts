import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let isRegistered = false;

export const registerMotionPlugins = () => {
    if (isRegistered) return;
    gsap.registerPlugin(ScrollTrigger);
    isRegistered = true;
};

export const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isSmallViewport = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 767px)').matches;

type SectionRevealOptions = {
    start?: string;
    y?: number;
    duration?: number;
    stagger?: number;
    ease?: string;
    once?: boolean;
    disableOnMobile?: boolean;
};

export const revealSectionItems = (
    selector: string,
    trigger: Element | null,
    options: SectionRevealOptions = {}
) => {
    if (!trigger || prefersReducedMotion()) return;
    if (options.disableOnMobile && isSmallViewport()) return;

    return gsap.from(selector, {
        y: options.y ?? 24,
        opacity: 0,
        duration: options.duration ?? 0.75,
        stagger: options.stagger ?? 0.1,
        ease: options.ease ?? 'power2.out',
        scrollTrigger: {
            trigger,
            start: options.start ?? 'top 82%',
            once: options.once ?? true,
        },
    });
};
