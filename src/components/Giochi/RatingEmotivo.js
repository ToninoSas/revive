import React, { useState } from 'react';
import styles from './RatingEmotivo.module.css';

const RatingEmotivo = ({ onSelect }) => {
    const [hovered, setHovered] = useState(null);

    const scale = [
        { value: 1, label: 'Molto Male', emoji: '😫' },
        { value: 2, label: 'Male', emoji: '🙁' },
        { value: 3, label: 'Neutrale', emoji: '😐' },
        { value: 4, label: 'Bene', emoji: '🙂' },
        { value: 5, label: 'Molto Bene', emoji: '😄' },
    ];

    return (
        <div className={styles.ratingContainer}>
            <h2 className={styles.title}>Come ti senti dopo questo esercizio?</h2>
            <div className={styles.emojiGrid}>
                {scale.map((item) => (
                    <button
                        key={item.value}
                        className={`${styles.emojiBtn} ${hovered === item.value ? styles.hovered : ''}`}
                        onClick={() => onSelect(item.value)}
                        onMouseEnter={() => setHovered(item.value)}
                        onMouseLeave={() => setHovered(null)}
                    >
                        <span className={styles.emojiIcon}>{item.emoji}</span>
                        <span className={styles.emojiLabel}>{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default RatingEmotivo;