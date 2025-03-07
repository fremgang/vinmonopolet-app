'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const initialDark = savedTheme === 'dark';
    setIsDark(initialDark);
    document.documentElement.classList.toggle('dark', initialDark);
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const newDark = !prev;
      document.documentElement.classList.toggle('dark', newDark);
      localStorage.setItem('theme', newDark ? 'dark' : 'light');
      return newDark;
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className="bg-wine text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
    >
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}