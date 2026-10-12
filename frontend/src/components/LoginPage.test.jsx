import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from './LoginPage';

describe('LoginPage Component', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders login page title, demo credentials badge, and input fields', () => {
    render(<LoginPage onLoginSuccess={vi.fn()} />);

    expect(screen.getByText('Student Management System')).toBeInTheDocument();
    expect(screen.getByText(/Administrator Portal/i)).toBeInTheDocument();
    expect(screen.getByText('ADMIN ACCESS CREDENTIALS')).toBeInTheDocument();
    expect(screen.getByText('admin@studentportal.com')).toBeInTheDocument();
    expect(screen.getByText('admin123')).toBeInTheDocument();
    expect(screen.getByLabelText(/Admin Login ID \/ Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In to Dashboard/i })).toBeInTheDocument();
  });

  it('fills credentials automatically when Auto-Fill button is clicked', () => {
    render(<LoginPage onLoginSuccess={vi.fn()} />);

    const autofillBtn = screen.getByRole('button', { name: /Auto-Fill/i });
    fireEvent.click(autofillBtn);

    const usernameInput = screen.getByLabelText(/Admin Login ID \/ Email/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);

    expect(usernameInput.value).toBe('admin@studentportal.com');
    expect(passwordInput.value).toBe('admin123');
  });

  it('fills credentials when Use Admin Pass button is clicked', () => {
    render(<LoginPage onLoginSuccess={vi.fn()} />);

    const passHelperBtn = screen.getByRole('button', { name: /Use Admin Pass/i });
    fireEvent.click(passHelperBtn);

    const usernameInput = screen.getByLabelText(/Admin Login ID \/ Email/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);

    expect(usernameInput.value).toBe('admin@studentportal.com');
    expect(passwordInput.value).toBe('admin123');
  });

  it('toggles password visibility between text and password input type', () => {
    render(<LoginPage onLoginSuccess={vi.fn()} />);

    const passwordInput = screen.getByLabelText(/^Password$/i);
    const toggleBtn = screen.getByLabelText(/Show password|Hide password/i);

    expect(passwordInput.type).toBe('password');
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('text');
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('password');
  });

  it('shows validation error when username is empty', () => {
    render(<LoginPage onLoginSuccess={vi.fn()} />);

    const submitBtn = screen.getByRole('button', { name: /Sign In to Dashboard/i });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText('Please enter your administrator ID or email.')
    ).toBeInTheDocument();
  });

  it('shows validation error when password is empty', () => {
    render(<LoginPage onLoginSuccess={vi.fn()} />);

    const usernameInput = screen.getByLabelText(/Admin Login ID \/ Email/i);
    fireEvent.change(usernameInput, { target: { value: 'admin' } });

    const submitBtn = screen.getByRole('button', { name: /Sign In to Dashboard/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Please enter your password.')).toBeInTheDocument();
  });

  it('displays an error message when submitting invalid credentials', async () => {
    render(<LoginPage onLoginSuccess={vi.fn()} />);

    const usernameInput = screen.getByLabelText(/Admin Login ID \/ Email/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const submitBtn = screen.getByRole('button', { name: /Sign In to Dashboard/i });

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Invalid Administrator ID or password/i)
      ).toBeInTheDocument();
    });
  });

  it('successfully logs in with alternative valid credentials (admin / admin@123)', async () => {
    const handleLoginSuccess = vi.fn();
    render(<LoginPage onLoginSuccess={handleLoginSuccess} />);

    const usernameInput = screen.getByLabelText(/Admin Login ID \/ Email/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const submitBtn = screen.getByRole('button', { name: /Sign In to Dashboard/i });

    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'admin@123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleLoginSuccess).toHaveBeenCalledTimes(1);
    });

    expect(handleLoginSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'Administrator',
        name: 'College Admin',
      })
    );
  });

  it('does not store in localStorage when rememberMe is unchecked', async () => {
    const handleLoginSuccess = vi.fn();
    render(<LoginPage onLoginSuccess={handleLoginSuccess} />);

    const autofillBtn = screen.getByRole('button', { name: /Auto-Fill/i });
    fireEvent.click(autofillBtn);

    const rememberCheckbox = screen.getByLabelText(/Remember this session/i);
    fireEvent.click(rememberCheckbox); // Uncheck
    expect(rememberCheckbox.checked).toBe(false);

    const submitBtn = screen.getByRole('button', { name: /Sign In to Dashboard/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleLoginSuccess).toHaveBeenCalledTimes(1);
    });

    expect(localStorage.getItem('sms_auth_user')).toBeNull();
    expect(sessionStorage.getItem('sms_auth_user')).not.toBeNull();
  });
});
