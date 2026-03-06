import { useState } from 'react';

export default function RegisterPage({ onSubmit, onBack, loading, error }) {
  const [form, setForm] = useState({ fullName: '', username: '', password: '', role: 'user' });

  return (
    <div className="mx-auto mt-12 w-full max-w-md rounded-xl bg-white p-6 shadow">
      <h2 className="text-2xl font-bold">Регистрация</h2>
      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
      >
        <input className="w-full rounded border px-3 py-2" placeholder="ФИО" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
        <input className="w-full rounded border px-3 py-2" placeholder="Логин" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <input type="password" className="w-full rounded border px-3 py-2" placeholder="Пароль" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <select className="w-full rounded border px-3 py-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="user">Сотрудник</option>
          <option value="support">ИТ-поддержка</option>
        </select>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button disabled={loading} className="w-full rounded bg-emerald-600 px-3 py-2 text-white">{loading ? 'Создание...' : 'Зарегистрироваться'}</button>
      </form>
      <button onClick={onBack} className="mt-4 text-sm text-slate-600">← На главную</button>
    </div>
  );
}
