export default function MonthNavigator({ value, options, onChange, onPrev, onNext, id, label = 'Month' }) {
  return (
    <div className="month-navigation" aria-label={label}>
      <button type="button" onClick={onPrev} aria-label="Previous month" className="month-nav-button month-nav-prev">
        <i className="bi bi-chevron-left" aria-hidden="true" />
      </button>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} aria-label={label} className="month-navigation-select">
        {options.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
      <button type="button" onClick={onNext} aria-label="Next month" className="month-nav-button month-nav-next">
        <i className="bi bi-chevron-right" aria-hidden="true" />
      </button>
    </div>
  );
}
