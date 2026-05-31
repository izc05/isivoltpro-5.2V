export default function Section({ title, action, children }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="text-lg font-black text-appText">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
