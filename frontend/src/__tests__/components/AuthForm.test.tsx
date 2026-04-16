import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthForm from '../../components/Auth/AuthForm';

const mockLogin = vi.fn();
const mockRegister = vi.fn();

function TestWrapper({
  onLogin = mockLogin,
  onRegister = mockRegister,
  loading = false,
}) {
  return (
    <AuthForm onLogin={onLogin} onRegister={onRegister} loading={loading} />
  );
}

describe('AuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form by default', () => {
    render(<TestWrapper />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/mot de passe/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /me connecter/i })
    ).toBeInTheDocument();
  });

  it('should switch to register mode', () => {
    render(<TestWrapper />);
    fireEvent.click(screen.getByRole('button', { name: /inscription/i }));
    expect(screen.getByPlaceholderText(/ton pseudo/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /creer mon compte/i })
    ).toBeInTheDocument();
  });

  it('should call login when submitting in login mode', async () => {
    mockLogin.mockResolvedValue({ success: true });
    render(<TestWrapper />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/mot de passe/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /me connecter/i }));

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('should call register when submitting in register mode', async () => {
    mockRegister.mockResolvedValue({ success: true });
    render(<TestWrapper />);

    fireEvent.click(screen.getByRole('button', { name: /inscription/i }));

    fireEvent.change(screen.getByPlaceholderText(/ton pseudo/i), {
      target: { value: 'TestUser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/mot de passe/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /creer mon compte/i }));

    expect(mockRegister).toHaveBeenCalledWith(
      'TestUser',
      'test@example.com',
      'password123'
    );
  });

  it('should show error message on login failure', async () => {
    mockLogin.mockResolvedValue({
      success: false,
      message: 'Invalid credentials',
    });
    render(<TestWrapper />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/mot de passe/i), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /me connecter/i }));

    await vi.waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
