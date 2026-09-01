interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  locked?: boolean;
}

export default function Toggle({ checked, onChange, locked }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={locked}
      className={`toggle ${checked ? "toggle--on" : ""} ${locked ? "toggle--locked" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle__thumb" />
    </button>
  );
}
