import MenuCard from "./MenuCard";

// The same MenuCard, in a narrow column. The card adapts by itself.
export default function RecentSidebar({ dishes, onAdd }) {
  return (
    <aside aria-labelledby="recent-title" className="w-full lg:w-64 lg:shrink-0">
      <h2 id="recent-title" className="mb-3 text-lg font-semibold">
        Recently ordered
      </h2>
      {dishes.length === 0 ? (
        <p className="text-sm text-ink-500">Nothing ordered yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {dishes.map((dish) => (
            <li key={dish.id}>
              <MenuCard dish={dish} onAdd={onAdd} />
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
