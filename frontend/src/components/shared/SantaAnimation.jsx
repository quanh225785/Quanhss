import React, { useEffect, useState } from 'react';
import './SantaAnimation.css';

const SantaAnimation = ({ onComplete }) => {
    const [gifts, setGifts] = useState([]);

    useEffect(() => {
        // Timeline for the animation
        // Santa starts at right (-10% off screen) and moves to left (110% off screen)
        // We'll use CSS for the movement, but JS to spawn gifts

        const giftImages = [
            '/gif_blue.svg',
            '/gif_pink.svg',
            '/gif_red.svg',
            '/gif_yellow.svg',
            '/git_green.svg'
        ];

        const spawnInterval = setInterval(() => {
            // Find Santa's current position to drop gifts from there
            const santaElement = document.querySelector('.santa-claus');
            if (santaElement) {
                const rect = santaElement.getBoundingClientRect();
                const newGift = {
                    id: Date.now() + Math.random(),
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                    image: giftImages[Math.floor(Math.random() * giftImages.length)],
                    rotation: Math.random() * 360
                };
                setGifts(prev => [...prev, newGift]);
            }
        }, 300);

        const timeout = setTimeout(() => {
            clearInterval(spawnInterval);
            if (onComplete) onComplete();
        }, 6000); // 6 seconds for the animation

        return () => {
            clearInterval(spawnInterval);
            clearTimeout(timeout);
        };
    }, [onComplete]);

    return (
        <div className="santa-overlay">
            <div className="santa-claus">
                <img src="/santa.png" alt="Santa" />
            </div>
            {gifts.map(gift => (
                <div
                    key={gift.id}
                    className="gift-box"
                    style={{
                        left: gift.x,
                        top: gift.y,
                        '--rotate': `${gift.rotation}deg`
                    }}
                >
                    <img src={gift.image} alt="gift" />
                </div>
            ))}
        </div>
    );
};

export default SantaAnimation;
