import { useState, useEffect } from 'react';

const usePlayerName = () => {
    const [playerName, setPlayerName] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedPlayerName = localStorage.getItem('playerName');
            setPlayerName(storedPlayerName);
        }
        setLoading(false);
    }, []);

    const savePlayerName = (name: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('playerName', `${name}#${Date.now()}`);
        }
        setPlayerName(`${name}#${Date.now()}`);
    };

    return {
        playerName,
        savePlayerName,
        loading
    };
};

export default usePlayerName;