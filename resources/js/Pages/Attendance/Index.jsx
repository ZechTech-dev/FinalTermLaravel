import { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Pagination from '../../Components/Pagination';
import '../../../css/attendance.css';

const dateOnly = (v) => (v ? String(v).slice(0, 10) : '');
const fmtTime = (t, empty = '---') => {
    if (!t) return empty;
    const [h, m] = String(t).split(':');
    const hour = parseInt(h, 10);
    return `${((hour + 11) % 12) + 1}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};
const fmtDate = (v) => {
    const d = dateOnly(v);
    if (!d) return '---';
    return new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const dayName = (v) => {
    const d = dateOnly(v);
    return d ? new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long' }) : '---';
};
const fmtHours = (h) => {
    const mins = Math.round(Number(h || 0) * 60);
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

export default function Index({ today, history, summary = {} }) {
    const { flash } = usePage().props;
    const [now, setNow] = useState(new Date());
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const act = (name) => router.post(route(name), {}, {
        preserveScroll: true,
        onStart: () => setBusy(true),
        onFinish: () => setBusy(false),
    });

    const steps = [
        { n: 1, label: 'Time In', icon: 'bi-box-arrow-in-right', route: 'attendance.time-in', value: fmtTime(today?.time_in, 'Not timed in'), done: !!today?.time_in, enabled: !today?.time_in, btn: today?.time_in ? 'Timed In' : 'Time In' },
        { n: 2, label: 'Break In', icon: 'bi-pause-circle', route: 'attendance.break-in', value: fmtTime(today?.break_in, 'No break'), done: !!today?.break_in, enabled: !!today?.time_in && !today?.break_in && !today?.time_out, btn: today?.break_in ? 'On Break' : 'Break In' },
        { n: 3, label: 'Break Out', icon: 'bi-play-circle', route: 'attendance.break-out', value: fmtTime(today?.break_out, 'No break'), done: !!today?.break_out, enabled: !!today?.break_in && !today?.break_out && !today?.time_out, btn: today?.break_out ? 'Break Ended' : 'Break Out' },
        { n: 4, label: 'Time Out', icon: 'bi-box-arrow-right', route: 'attendance.time-out', value: fmtTime(today?.time_out, 'Not timed out'), done: !!today?.time_out, enabled: !!today?.time_in && !today?.time_out && (!today?.break_in || !!today?.break_out), btn: today?.time_out ? 'Timed Out' : 'Time Out' },
    ];

    const rows = history?.data || [];
    const cards = [
        ['bi-calendar-check', summary.days ?? 0, 'Total Days'],
        ['bi-person-check', summary.present ?? 0, 'Present'],
        ['bi-alarm', summary.late ?? 0, 'Late'],
        ['bi-hourglass-split', fmtHours(summary.hours), 'Total Hours'],
    ];

    return (
        <AppLayout title="Attendance">
            <div className="attendance-wrapper">
                {flash?.error && <div className="att-alert error">{flash.error}</div>}
                {flash?.success && <div className="att-alert success">{flash.success}</div>}

                <div className="attendance-top">
                    <div className="today-info">
                        <span>Today</span>
                        <strong>{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' })}</strong>
                    </div>
                    <div className="current-time">
                        <span>Current Time</span>
                        <strong>{now.toLocaleTimeString('en-US', { timeZone: 'Asia/Manila' })}</strong>
                    </div>
                </div>

                <div className="attendance-panel">
                    <div className="panel-header"><i className="bi bi-lightning-charge-fill" /> Today's Activity</div>
                    <div className="attendance-actions">
                        {steps.map((s) => (
                            <div key={s.n} className={`attendance-box ${s.done ? 'is-done' : ''}`}>
                                <span className="step-index">{s.n}</span>
                                <div className="attendance-icon"><i className={`bi ${s.icon}`} /></div>
                                <span>{s.label}</span>
                                <strong>{s.value}</strong>
                                <button type="button" disabled={!s.enabled || busy} onClick={() => act(s.route)}>{s.btn}</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="attendance-summary">
                    <div className="summary-header">
                        <div><span>Overview</span><h3>Attendance Summary</h3></div>
                        <i className="bi bi-bar-chart-line" />
                    </div>
                    <div className="summary-cards">
                        {cards.map(([icon, value, label]) => (
                            <div className="summary-card" key={label}>
                                <div className="summary-icon"><i className={`bi ${icon}`} /></div>
                                <div className="summary-info"><strong>{value}</strong><span>{label}</span></div>
                            </div>
                        ))}
                    </div>
                </div>

                <table className="attendance-records">
                    <thead>
                        <tr><th colSpan="7" className="table-title">My Attendance Record</th></tr>
                        <tr><th>Date</th><th>Day</th><th>Time In</th><th>Time Out</th><th>Break</th><th>Total Hours</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        {rows.length ? rows.map((r) => (
                            <tr key={r.attendance_id}>
                                <td>{fmtDate(r.date)}</td>
                                <td>{dayName(r.date)}</td>
                                <td>{fmtTime(r.time_in, '-')}</td>
                                <td>{fmtTime(r.time_out, '-')}</td>
                                <td>{r.break_in ? `${fmtTime(r.break_in)} - ${fmtTime(r.break_out, '...')}` : '-'}</td>
                                <td>{r.time_out ? fmtHours(r.total_hours) : '-'}</td>
                                <td><span className={`status ${String(r.status || '').toLowerCase().replace(/\s+/g, '-')}`}>{r.status}</span></td>
                            </tr>
                        )) : <tr><td colSpan="7" className="no-records">No attendance records yet.</td></tr>}
                    </tbody>
                </table>

                <div className="pagination-row"><Pagination links={history?.links || []} /></div>
            </div>
        </AppLayout>
    );
}
