import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Palette, Loader2, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import gsap from 'gsap';
import { registerMotionPlugins, revealSectionItems } from '../lib/motion';

const API_URL = 'http://localhost:8000';

interface DemoSectionProps {
    onColorized?: (grayscaleUrl: string, colorizedUrl: string) => void;
}

export default function DemoSection({ onColorized }: DemoSectionProps) {
    const sectionRef = useRef<HTMLElement>(null);

    // State for the upload → colorize flow
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [colorizedUrl, setColorizedUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((accepted: File[]) => {
        if (accepted.length === 0) return;
        const file = accepted[0];
        setUploadedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setColorizedUrl(null);
        setError(null);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
        maxFiles: 1,
        onDrop,
    });

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            if (colorizedUrl) URL.revokeObjectURL(colorizedUrl);
        };
    }, [previewUrl, colorizedUrl]);

    const handleColorize = async () => {
        if (!uploadedFile) return;

        setIsLoading(true);
        setError(null);
        setColorizedUrl(null);

        try {
            const formData = new FormData();
            formData.append('file', uploadedFile);

            const response = await fetch(`${API_URL}/colorize`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errBody = await response.json().catch(() => null);
                throw new Error(errBody?.detail || `Server error (${response.status})`);
            }

            const blob = await response.blob();
            const resultUrl = URL.createObjectURL(blob);
            setColorizedUrl(resultUrl);
            if (previewUrl) {
                onColorized?.(previewUrl, resultUrl);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to connect to the server. Is the backend running?');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        if (colorizedUrl) URL.revokeObjectURL(colorizedUrl);
        setUploadedFile(null);
        setPreviewUrl(null);
        setColorizedUrl(null);
        setError(null);
    };

    /* ── GSAP scroll reveal ─────────────────────────────────────── */
    useEffect(() => {
        registerMotionPlugins();
        const ctx = gsap.context(() => {
            revealSectionItems('.demo-reveal', sectionRef.current, {
                y: 28,
                duration: 0.7,
                stagger: 0.08,
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section id="demo" ref={sectionRef} className="py-20 lg:py-28 bg-white relative overflow-hidden">
            <div className="radial-accent w-[480px] h-[480px] left-[-160px] top-[20%] opacity-55" />
            <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Left — description */}
                <div className="demo-reveal">
                    <p className="demo-reveal text-sm font-medium text-primary uppercase tracking-wider mb-3">
                        Project Demo
                    </p>
                    <h2 className="demo-reveal text-3xl lg:text-4xl font-bold mb-6 leading-tight">
                        Experience the <span className="text-primary">colorization</span>{' '}
                        model in action
                    </h2>
                    <p className="demo-reveal text-text-secondary leading-relaxed mb-6">
                        Upload a grayscale image and watch the convolutional autoencoder
                        predict the missing color channels in real time. The model processes
                        your image at 32×32 resolution and returns a colorized RGB output.
                    </p>
                    <ul className="space-y-4 demo-reveal">
                        {[
                            { icon: Upload, text: 'Upload any grayscale photograph' },
                            { icon: ImageIcon, text: 'Preview the input before processing' },
                            { icon: Palette, text: 'Receive a colorized RGB output in seconds' },
                        ].map((item) => (
                            <li key={item.text} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <item.icon size={16} className="text-primary" />
                                </div>
                                <span className="text-sm text-text-secondary">{item.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right — functional demo card */}
                <div className="demo-reveal flex justify-center">
                    <div className="w-full max-w-sm bg-bg rounded-2xl border border-border overflow-hidden shadow-lg interactive-card">
                        {/* Upload area */}
                        <div className="p-5 border-b border-border">
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-[border-color,background-color,box-shadow] duration-300 ${isDragActive
                                    ? 'border-primary/70 bg-primary/5 shadow-[0_16px_28px_-22px_rgba(249,115,22,0.8)]'
                                    : 'border-border hover:border-primary/40'
                                    }`}
                            >
                                <input {...getInputProps()} />
                                <Upload size={28} className="mx-auto text-text-secondary mb-3" />
                                <p className="text-sm font-medium mb-1">Drop your image here</p>
                                <p className="text-xs text-text-secondary">
                                    {uploadedFile?.name ?? 'PNG, JPG up to 10 MB'}
                                </p>
                            </div>
                        </div>

                        {/* Preview / Result area */}
                        <div className="p-5 space-y-3">
                            <div className="relative rounded-xl overflow-hidden bg-gray-100 border border-border min-h-[144px] flex items-center justify-center">
                                {!previewUrl && !colorizedUrl && (
                                    <p className="text-xs text-text-secondary py-12">
                                        Upload an image to get started
                                    </p>
                                )}

                                {previewUrl && !colorizedUrl && (
                                    <img
                                        src={previewUrl}
                                        alt="Uploaded grayscale"
                                        className="w-full h-36 object-cover"
                                    />
                                )}

                                {colorizedUrl && (
                                    <div className="w-full grid grid-cols-2 gap-0.5">
                                        <div className="relative">
                                            <img
                                                src={previewUrl!}
                                                alt="Original grayscale"
                                                className="w-full h-36 object-cover"
                                            />
                                            <span className="absolute bottom-2 left-2 text-[9px] font-semibold bg-black/50 text-white px-2 py-0.5 rounded-full">
                                                Input
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <img
                                                src={colorizedUrl}
                                                alt="Colorized output"
                                                className="w-full h-36 object-cover"
                                            />
                                            <span className="absolute bottom-2 right-2 text-[9px] font-semibold bg-primary text-white px-2 py-0.5 rounded-full">
                                                Colorized
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {isLoading && (
                                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                                        <Loader2 size={28} className="text-primary animate-spin" />
                                        <span className="text-xs text-white font-medium">Processing…</span>
                                    </div>
                                )}
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                    <p className="text-xs leading-relaxed">{error}</p>
                                </div>
                            )}

                            {/* Action buttons */}
                            {!colorizedUrl ? (
                                <button
                                    onClick={handleColorize}
                                    disabled={!uploadedFile || isLoading}
                                    className="interactive-button button-ripple w-full py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                                >
                                    {isLoading ? 'Processing…' : 'Colorize Image'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleReset}
                                    className="interactive-button button-ripple w-full py-2.5 rounded-full border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
                                >
                                    Try Another Image
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
