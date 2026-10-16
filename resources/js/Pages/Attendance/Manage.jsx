import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Pagination from '../../Components/Pagination';
import '../../../css/attendance-management.css';

export default function Manage({ attendance, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const rows = attendance?.data || [];

    function submitSearch(event) {
        event.preventDefault();
        router.get(route('attendance.manage'), { search }, { preserveState: true, replace: true });
    }

    function picturePath(path) {
        if (!path || path === 'default-picture.jpg') return '/assets/src/default-picture.jpg';
        return path.startsWith('http') || path.startsWith('/') ? path : `/storage/${path}`;
    }

    function formatDate(value) {
        if (!value) return '-';
        const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
        return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    function formatTime(value) {
        if (!value) return '-';
        const parts = String(value).split(':');
        if (parts.length < 2) return value;
        const date = new Date();
        date.setHours(Number(parts[0]), Number(parts[1]), Number(parts[2] || 0), 0);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    return <AppLayout title="Attendance Management">
        <Head title="Attendance List" />
        <section className="attendance-management-page">
            <div className="list-header">
                <div className="left">
                    <div className="cover"><i className="bi bi-calendar2-check-fill" /></div>
                    <div className="cover-info"><h3>Attendance List</h3><span>View employee attendance records</span></div>
                </div>
                <form className="employee-search" onSubmit={submitSearch}>
                    <i className="bi bi-search" />
                    <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search employee..." aria-label="Search attendance by employee" />
                    <button type="submit" className="attendance-search-button">Search</button>
                </form>
            </div>
            <div className="attendance-table-wrap">
            <table className="attendance-list">
                <thead><tr><th>Employee ID</th><th>Employee</th><th>Date</th><th>Time In</th><th>Break In</th><th>Break Out</th><th>Time Out</th><th>Total Hours</th><th>Status</th></tr></thead>
                <tbody>
                    {rows.length ? rows.map(row => <tr key={row.attendance_id}>
                        <td>{row.user?.employee_id || '-'}</td>
                        <td><div className="employee-info"><img src={picturePath(row.user?.profile_picture)} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/assets/src/default-picture.jpg'; }} alt="Profile" /><span>{row.user?.employee_name || row.user?.name || 'Unknown employee'}</span></div></td>
                        <td>{formatDate(row.date)}</td><td>{formatTime(row.time_in)}</td><td>{formatTime(row.break_in)}</td><td>{formatTime(row.break_out)}</td><td>{formatTime(row.time_out)}</td><td>{Number(row.total_hours || 0).toFixed(2)}</td>
                        <td><span className={`attendance-status ${String(row.status || '').toLowerCase().replaceAll(' ', '-')}`}>{row.status || '-'}</span></td>
                    </tr>) : <tr><td colSpan="9" className="no-attendance">No attendance records found.</td></tr>}
                </tbody>
                <tfoot><tr><td colSpan="9"><Pagination links={attendance?.links || []} /></td></tr></tfoot>
            </table>
            </div>
        </section>
    </AppLayout>;
}
