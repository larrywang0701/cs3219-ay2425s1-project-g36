/**
 * The enum type that represents the difficulty.
 */
export type TDifficulty = "easy" | "medium" | "hard";

/**
 * Component for formatting the difficulty colour.
 */
export default function Difficulty({ type } : { type: TDifficulty }) {
  const colors = {
    "easy": "text-emerald-600",
    "medium": "text-amber-500",
    "hard": "text-red-600"
  };

  return (
    <span className={ colors[type] }>{ type[0].toUpperCase() + type.slice(1) }</span>
  )
}