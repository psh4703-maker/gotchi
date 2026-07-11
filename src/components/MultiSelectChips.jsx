import { useState } from "react";

function MultiSelectChips({ label, options, selected, onChange, allowCustom = true, placeholder = "직접 추가" }) {
  const [customValue, setCustomValue] = useState("");

  const toggle = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const addCustom = () => {
    const value = customValue.trim();
    if (!value || selected.includes(value)) return;
    onChange([...selected, value]);
    setCustomValue("");
  };

  return (
    <div>
      <p className="text-sm font-black text-slate-800">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={`rounded-full px-3 py-2 text-xs font-bold transition ${
                isSelected
                  ? "bg-slate-950 text-white"
                  : "glass-pill text-slate-600 hover:bg-white/70"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {allowCustom && (
        <div className="mt-2 flex gap-2">
          <input
            value={customValue}
            onChange={(event) => setCustomValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCustom();
              }
            }}
            placeholder={placeholder}
            className="glass-pill flex-1 rounded-2xl px-4 py-2 text-sm outline-none focus:ring-4 focus:ring-[#0a84ff]/15"
          />
          <button
            type="button"
            onClick={addCustom}
            className="glass-pill rounded-2xl px-4 py-2 text-sm font-black text-slate-600 hover:bg-white/70"
          >
            추가
          </button>
        </div>
      )}

      {selected.filter((item) => !options.includes(item)).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selected
            .filter((item) => !options.includes(item))
            .map((item) => (
              <span
                key={item}
                className="flex items-center gap-1 rounded-full bg-[#0a84ff]/10 px-3 py-1 text-xs font-bold text-[#0a84ff]"
              >
                {item}
                <button
                  type="button"
                  onClick={() => onChange(selected.filter((value) => value !== item))}
                  className="font-black"
                >
                  x
                </button>
              </span>
            ))}
        </div>
      )}
    </div>
  );
}

export default MultiSelectChips;
