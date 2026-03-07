import { useState } from 'react';
import type { ImgHTMLAttributes } from 'react';

type FadeImageProps = ImgHTMLAttributes<HTMLImageElement>;

export default function FadeImage({ className = '', onLoad, ...props }: FadeImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <img
            {...props}
            onLoad={(event) => {
                setIsLoaded(true);
                onLoad?.(event);
            }}
            className={`transition-[opacity,filter,transform] duration-700 ease-out will-change-transform ${isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-sm scale-[1.02]'} ${className}`}
        />
    );
}
