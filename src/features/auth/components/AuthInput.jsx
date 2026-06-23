export default function AuthInput({
  id,
  label,
  icon: Icon,
  type = "text",
  ...inputProps
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[11px] font-bold text-slate-700"
      >
        {label}
      </label>

      <div className="mt-2 flex h-11 items-center gap-2 rounded-md border border-blue-200 bg-[#f8fbff] px-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
        {Icon && <Icon size={15} className="shrink-0 text-blue-600" />}

        <input
          id={id}
          name={id}
          type={type}
          className="min-w-0 flex-1 bg-transparent text-[12px] text-slate-800 outline-none placeholder:text-slate-400"
          {...inputProps}
        />
      </div>
    </div>
  )
}
