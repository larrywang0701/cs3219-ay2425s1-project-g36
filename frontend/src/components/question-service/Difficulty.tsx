/**
 * Component for setting difficulty colour.
 */
export default function Difficulty({ type } : { type: "easy" | "medium" | "hard" }) {
  const colors = {
    "easy": "text-emerald-600",
    "medium": "text-amber-500",
    "hard": "text-red-600"
  };

  return (
    <span className={ colors[type] }>{ type.toUpperCase() }</span>
  )
}