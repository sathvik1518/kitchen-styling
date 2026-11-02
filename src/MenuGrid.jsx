import MenuCard from "./MenuCard";

export default function MenuGrid({ dishes, onAdd }) {
  if (dishes.length === 0) return <p className="text-ink-500">The menu is empty.</p>;
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {dishes.map((dish) => (
        <li key={dish.id}>
          <MenuCard dish={dish} onAdd={onAdd} />
        </li>
      ))}
    </ul>
  );
}
