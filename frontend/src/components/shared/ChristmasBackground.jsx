import React, { useEffect, useState } from 'react';

const ChristmasBackground = () => {
    const [snowflakes, setSnowflakes] = useState([]);

    useEffect(() => {
        const count = 50;
        const newSnowflakes = Array.from({ length: count }).map((_, i) => ({
            id: i,
            left: Math.random() * 100 + '%',
            animationDuration: Math.random() * 10 + 5 + 's',
            animationDelay: Math.random() * 5 + 's',
            opacity: Math.random() * 0.7 + 0.3,
            size: Math.random() * 8 + 4 + 'px',
        }));
        setSnowflakes(newSnowflakes);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" style={{ perspective: '1000px' }}>
            {/* Soft Festive Glows */}
            <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-red-500/5 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

            {/* Snowflakes */}
            {snowflakes.map((flake) => (
                <div
                    key={flake.id}
                    className="absolute top-[-20px] bg-white rounded-full shadow-[0_0_10px_white]"
                    style={{
                        left: flake.left,
                        width: flake.size,
                        height: flake.size,
                        opacity: flake.opacity,
                        animation: `fall ${flake.animationDuration} linear infinite`,
                        animationDelay: flake.animationDelay,
                        filter: 'blur(1px)',
                    }}
                />
            ))}

            <style>{`
                @keyframes fall {
                    0% {
                        transform: translateY(0) translateX(0) rotate(0deg);
                    }
                    25% {
                        transform: translateY(25vh) translateX(20px) rotate(90deg);
                    }
                    50% {
                        transform: translateY(50vh) translateX(-20px) rotate(180deg);
                    }
                    75% {
                        transform: translateY(75vh) translateX(20px) rotate(270deg);
                    }
                    100% {
                        transform: translateY(110vh) translateX(0) rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
};

export default ChristmasBackground;
