'use server';

export async function registerUser(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const agree = formData.get('agree') === 'on';

  if (!email) {
    return { error: 'Введите e-mail' };
  }

  if (password.length < 8) {
    return { error: 'Пароль должен быть не короче 8 символов' };
  }

  if (!agree) {
    return { error: 'Нужно согласиться с политикой' };
  }

  // TODO: подключить БД, хеширование пароля и создание пользователя.
  return { success: true };
}
