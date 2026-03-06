import { useState } from 'react';

export default function LoginPage({ onSubmit, onBack, loading, error }) {
  const [form, setForm] = useState({ username: '', password: '' });

  return (
    <div className="mx-auto mt-12 w-full max-w-md rounded-xl bg-white p-6 shadow">
      <h2 className="text-2xl font-bold">Вход</h2>
      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
      >
        <input className="w-full rounded border px-3 py-2" placeholder="Логин" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <input type="password" className="w-full rounded border px-3 py-2" placeholder="Пароль" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button disabled={loading} className="w-full rounded bg-blue-600 px-3 py-2 text-white">{loading ? 'Вход...' : 'Войти'}</button>
      </form>
      <button onClick={onBack} className="mt-4 text-sm text-slate-600">← На главную</button>
    </div>
  );
}
