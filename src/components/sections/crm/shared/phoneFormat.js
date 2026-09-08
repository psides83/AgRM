export function phoneDigits(value) {
  const digits = String(value || '').replace(/\D/g, '');

  if (digits.length > 10) {
    return digits.slice(-10);
  }

  return digits;
}

export function formatPhone(value) {
  const digits = phoneDigits(value);

  if (digits.length !== 10) {
    return String(value || '').trim();
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function formatPhoneInput(value) {
  const digits = phoneDigits(value);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function cleanPhone(value) {
  const formatted = formatPhone(value);
  return formatted || null;
}

export function handlePhoneChange(setter, field) {
  return (event) => {
    const formatted = formatPhoneInput(event.target.value);
    setter((current) => ({ ...current, [field]: formatted }));
  };
}

export function registerPhoneInput(register, name) {
  const registration = register(name, {
    setValueAs: (value) => formatPhone(value),
  });

  return {
    ...registration,
    onChange: (event) => {
      event.target.value = formatPhoneInput(event.target.value);
      registration.onChange(event);
    },
    onBlur: (event) => {
      event.target.value = formatPhone(event.target.value);
      registration.onChange(event);
      registration.onBlur(event);
    },
  };
}
