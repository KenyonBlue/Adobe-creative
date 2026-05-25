import { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function TextField({ label, hint, className = '', ...props }: FieldProps) {
  return (
    <div>
      <label className="studio-label">{label}</label>
      <input {...props} className={`studio-input ${className}`} />
      {hint && <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export function TextAreaField({ label, hint, className = '', ...props }: TextAreaFieldProps) {
  return (
    <div>
      <label className="studio-label">{label}</label>
      <textarea {...props} className={`studio-input resize-none ${className}`} />
      {hint && <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
        {title}
      </h3>
      {children}
    </section>
  );
}
