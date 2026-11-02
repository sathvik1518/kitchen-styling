/**
 * One dish. It does NOT know where it is placed.
 *
 * `@container` makes this card the thing its own children measure against.
 * The `@sm:` classes below look at the CARD'S width (24rem and up), not the screen's.
 *   - in the wide main grid the card has room, so the picture sits beside the text
 *   - in the narrow sidebar the card is tight, so everything stacks
 * The same component works in both places with no `variant` prop.
 */
export default function MenuCard({ dish, onAdd }) {
  return (
    <article className="@container rounded-card border border-ink-200 bg-surface shadow-sm">
      <div className="flex flex-col gap-3 p-4 @sm:flex-row @sm:items-center">
        <div
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-control bg-brand-100 text-2xl @sm:size-20 @sm:text-4xl"
        >
          {dish.emoji}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-ink-900">{dish.name}</h3>
          <p className="hidden text-sm text-ink-500 @sm:block">{dish.blurb}</p>
          <p className="font-medium text-brand-700">₹{dish.price}</p>
        </div>

        <button
          type="button"
          aria-label={`Add ${dish.name} to cart`}
          onClick={() => onAdd(dish)}
          className="min-h-11 rounded-control bg-brand-700 px-4 font-medium text-surface hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
        >
          Add
        </button>
      </div>
    </article>
  );
}
