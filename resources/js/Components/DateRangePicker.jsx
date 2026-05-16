const presets = [
    { label: 'Today', getRange: () => {
        const d = new Date(); const s = d.toISOString().split('T')[0]; return [s, s]
    }},
    { label: 'This Week', getRange: () => {
        const now = new Date(); const start = new Date(now); start.setDate(now.getDate() - now.getDay());
        return [start.toISOString().split('T')[0], now.toISOString().split('T')[0]]
    }},
    { label: 'This Month', getRange: () => {
        const now = new Date(); const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return [start.toISOString().split('T')[0], now.toISOString().split('T')[0]]
    }},
    { label: 'Last Month', getRange: () => {
        const now = new Date(); const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return [start.toISOString().split('T')[0], end.toISOString().split('T')[0]]
    }},
    { label: 'This Year', getRange: () => {
        const now = new Date(); const start = new Date(now.getFullYear(), 0, 1);
        return [start.toISOString().split('T')[0], now.toISOString().split('T')[0]]
    }},
]

export default function DateRangePicker({ startDate, endDate, onChange }) {
    const handlePreset = (preset) => {
        const [s, e] = preset.getRange()
        onChange(s, e)
    }

    return (
        <div className="flex flex-wrap items-end gap-2">
            <div>
                <label className="form-label-sneat">From</label>
                <input type="date" value={startDate}
                    onChange={(e) => onChange(e.target.value, endDate)}
                    className="form-control-sneat px-3 py-2 text-sm" />
            </div>
            <div>
                <label className="form-label-sneat">To</label>
                <input type="date" value={endDate}
                    onChange={(e) => onChange(startDate, e.target.value)}
                    className="form-control-sneat px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-1 flex-wrap">
                {presets.map((p) => (
                    <button key={p.label} onClick={() => handlePreset(p)}
                        className="px-2.5 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-text-muted dark:text-text-muted-dark hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                        {p.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
