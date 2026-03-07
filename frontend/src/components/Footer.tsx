export default function Footer() {
    return (
        <footer id="repository" className="border-t border-border bg-bg">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                {/* Left — branding */}
                <div>
                    <h3 className="text-lg font-semibold mb-1">
                        <span className="text-primary">AI</span> Image Colorization
                    </h3>
                    <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                        A deep learning project demonstrating automatic image colorization
                        using convolutional autoencoders trained on CIFAR-10.
                    </p>
                </div>

                {/* Right — links */}
                <div className="flex gap-10">
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
                            Resources
                        </h4>
                        <ul className="space-y-2">
                            {['GitHub', 'Documentation', 'Dataset'].map((link) => (
                                <li key={link}>
                                    <a
                                        href="#"
                                        className="interactive-link text-sm text-text-secondary hover:text-text"
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>

        </footer>
    );
}
