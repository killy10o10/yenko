import type { Route } from "../core";
import { CATEGORY_BY_ID } from "../data/categories";

interface Props {
  route: Route;
  active: boolean;
  completed: boolean;
  onSelect: () => void;
  onComplete: () => void;
}

export function RouteCard({ route, active, completed, onSelect, onComplete }: Props) {
  return (
    <div className={`route-card ${active ? "active" : ""}`} onClick={onSelect}>
      <h3>{route.title}</h3>
      <div className="meta">
        {route.stops.length} stops · {route.distanceKm} km · ~{route.estimatedMinutes} min
      </div>
      {active && (
        <>
          <ol className="stops">
            {route.stops.map((s) => (
              <li key={s.id}>
                {CATEGORY_BY_ID[s.category].emoji} {s.name ?? <em>Unnamed {CATEGORY_BY_ID[s.category].label.toLowerCase()}</em>}
              </li>
            ))}
          </ol>
          <button
            className="primary"
            type="button"
            disabled={completed}
            onClick={(e) => {
              e.stopPropagation();
              onComplete();
            }}
          >
            {completed ? "Completed ✓" : "I walked this route"}
          </button>
        </>
      )}
    </div>
  );
}
