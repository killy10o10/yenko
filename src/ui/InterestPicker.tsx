import type { Category } from "../core";
import { CATEGORIES } from "../data/categories";

interface Props {
  selected: Category[];
  onChange: (next: Category[]) => void;
}

export function InterestPicker({ selected, onChange }: Props) {
  const toggle = (id: Category) =>
    onChange(selected.includes(id) ? selected.filter((c) => c !== id) : [...selected, id]);
  return (
    <div className="chips" role="group" aria-label="Interests">
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`chip ${selected.includes(c.id) ? "on" : ""}`}
          aria-pressed={selected.includes(c.id)}
          onClick={() => toggle(c.id)}
        >
          {c.emoji} {c.label}
        </button>
      ))}
    </div>
  );
}
