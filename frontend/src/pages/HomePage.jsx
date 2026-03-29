export default function HomePage({ goLogin, goRegister }) {
  return (
    <div className="mx-auto mt-20 w-full max-w-xl rounded-2xl bg-white p-8 text-center shadow-xl transition-all duration-300 hover:-translate-y-1 dark:bg-slate-900 dark:text-slate-100">
      <h1 className="text-3xl font-bold">Service Desk предприятия</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">Система заявок ИТ-поддержки</p>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={goLogin} className="rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:scale-105">Войти</button>
        <button onClick={goRegister} className="rounded-lg bg-emerald-600 px-5 py-2 text-white transition hover:scale-105">Зарегистрироваться</button>
      </div>
    </div>
  );
}
