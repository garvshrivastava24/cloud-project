import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import DarkModeToggle, { useTheme } from './DarkModeToggle';

describe('DarkModeToggle & useTheme Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('initializes to light mode by default and saves in localStorage upon toggle', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');
    expect(result.current.isDark).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDark).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('sms_theme')).toBe('dark');
  });

  it('restores existing theme from localStorage key "sms_theme"', () => {
    localStorage.setItem('sms_theme', 'dark');
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDark).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('renders DarkModeToggle button with correct icon and text for light and dark states', () => {
    const handleToggle = vi.fn();
    const { rerender } = render(<DarkModeToggle theme="light" onToggle={handleToggle} />);

    const toggleBtn = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(toggleBtn).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(handleToggle).toHaveBeenCalledTimes(1);

    // Rerender as dark
    rerender(<DarkModeToggle theme="dark" onToggle={handleToggle} />);
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
  });
});
