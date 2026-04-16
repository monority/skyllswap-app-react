export const parseCommaSeparated = (text: string): string[] =>
  text
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const truncateText = (
  text: string | null | undefined,
  maxLength = 50
): string => {
  if (!text || text.length <= maxLength) return text ?? '';
  return `${text.slice(0, maxLength)}...`;
};

export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m] ?? m);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (
  password: string
): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return {
      valid: false,
      message: 'Le mot de passe doit contenir au moins 8 caractères',
    };
  }
  return { valid: true };
};

export const validateUsername = (
  name: string
): { valid: boolean; message?: string } => {
  if (name.length < 2 || name.length > 40) {
    return {
      valid: false,
      message: 'Le pseudo doit contenir entre 2 et 40 caractères',
    };
  }
  return { valid: true };
};

export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>]/g, '').trim().slice(0, 1000);
};
