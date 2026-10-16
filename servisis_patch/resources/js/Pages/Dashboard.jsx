import AppLayout from '../Layouts/AppLayout';
import { Link, usePage } from '@inertiajs/react';
import '../../../css/dashboard.css';

const time = (value) => {
    if (!value) return '—';
    const parts = String(value).split(':');
    const date = new Date();
    date.setHours(Number(parts[0]), Number(parts[1]), Number(parts[2] || 0));
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const dateLabel = (value) => {
    if (!value) return '—';
    const d = new Date(`${String(value).slice(0, 10)}T12:00:00`);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const statusClass = (status) => String(status || '').toLowerCase().replaceAll(' ', '-');

export default function Dashboard({ isManager, stats = [], today, todayAttendance, recentAttendance = [], recentLeaves = [], attendanceSummary = {} }) {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const name = user.employee_name || user.name || 'User';
    const total = attendanceSummary.total || 0;
    const presentPercent = total ? Math.round((attendanceSummary.present / total) * 100) : 0;

    return (
        <AppLayout title="Dashboard">
            <div className="dashboard-page">
                <section className="dashboard-top-grid">
                    <div className="dashboard-welcome">
                        <div className="dashboard-welcome-icon"><i className={`bi ${isManager ? 'bi-speedometer2' : 'bi-alarm-fill'}`} /></div>
                        <div>
                            <p>Welcome back,</p>
                            <h2>{name}!</h2>
                            <span>{isManager ? 'Here is your employee management overview.' : "Let's keep up the good work."}</span>
                        </div>
                    </div>
                    {stats.map((stat) => (
                        <article className="dashboard-stat-card" key={stat.label}>
                            <div className="dashboard-stat-label"><span className={`dashboard-stat-icon ${stat.tone}`}><i className={`bi ${stat.icon}`} /></span>{stat.label}</div>
                            <strong>{stat.value}</strong>
                            <small>{stat.label.includes('Today') || stat.label === 'Present Today' ? today : 'Current summary'}</small>
                        </article>
                    ))}
                </section>

                <section className="dashboard-main-grid">
                    <article className="dashboard-panel dashboard-attendance-panel">
                        <div className="dashboard-panel-heading">
                            <div><h3>{isManager ? 'Recent Attendance Records' : 'My Recent Attendance Records'}</h3><p>{isManager ? 'Latest employee attendance activity' : 'Your latest attendance activity'}</p></div>
                            <Link href={isManager ? route('attendance.manage') : route('attendance.index')}>View all <i className="bi bi-arrow-up-right" /></Link>
                        </div>
                        <div className="dashboard-table-wrap">
                            <table className="dashboard-table">
                                <thead><tr>{isManager && <th>Employee</th>}<th>Date</th><th>Time In</th><th>Time Out</th><th>Status</th></tr></thead>
                                <tbody>
                                    {recentAttendance.length ? recentAttendance.map((record) => (
                                        <tr key={record.attendance_id}>
                                            {isManager && <td><div className="dashboard-employee-cell"><span className="dashboard-mini-avatar">{(record.user?.employee_name || record.user?.name || '?').slice(0, 1).toUpperCase()}</span>{record.user?.employee_name || record.user?.name || 'Employee'}</div></td>}
                                            <td>{dateLabel(record.date)}</td><td>{time(record.time_in)}</td><td>{time(record.time_out)}</td>
                                            <td><span className={`dashboard-status ${statusClass(record.status)}`}>{record.status}</span></td>
                                        </tr>
                                    )) : <tr><td colSpan={isManager ? 5 : 4} className="dashboard-empty">No attendance records yet.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </article>

                    <article className="dashboard-panel dashboard-summary-panel">
                        <div className="dashboard-panel-heading"><div><h3>{isManager ? 'Attendance Overview' : 'My Attendance Summary'}</h3><p>Attendance records at a glance</p></div></div>
                        <div className="dashboard-donut-wrap">
                            <div className="dashboard-donut" style={{ '--present-percent': `${presentPercent}%` }}><div><strong>{presentPercent}%</strong><span>Present</span></div></div>
                            <div className="dashboard-legend">
                                <div><span className="legend-dot present-dot" />Present <strong>{attendanceSummary.present || 0}</strong></div>
                                <div><span className="legend-dot late-dot" />Late <strong>{attendanceSummary.late || 0}</strong></div>
                                <div><span className="legend-dot dayoff-dot" />Day Off <strong>{attendanceSummary.dayOff || 0}</strong></div>
                            </div>
                        </div>
                        <div className="dashboard-today-box"><span className="dashboard-today-icon"><i className="bi bi-clock-history" /></span><div><small>Today's time in</small><strong>{time(todayAttendance?.time_in)}</strong></div><span className={`dashboard-status ${statusClass(todayAttendance?.status || 'Not yet timed in')}`}>{todayAttendance?.status || 'Not yet timed in'}</span></div>
                    </article>
                </section>

                <section className="dashboard-bottom-grid">
                    <article className="dashboard-panel">
                        <div className="dashboard-panel-heading"><div><h3>{isManager ? 'Recent Leave Requests' : 'My Recent Leave Requests'}</h3><p>Latest leave application updates</p></div><Link href={isManager ? route('leave-management.index') : route('leave.index')}>View all <i className="bi bi-arrow-up-right" /></Link></div>
                        <div className="dashboard-leave-list">
                            {recentLeaves.length ? recentLeaves.map((leave) => (
                                <div className="dashboard-leave-row" key={leave.request_id}>
                                    <span className="dashboard-leave-icon"><i className="bi bi-calendar2-check" /></span>
                                    <div className="dashboard-leave-info"><strong>{leave.leave_type}</strong><small>{isManager ? (leave.user?.employee_name || leave.user?.name || 'Employee') : `${dateLabel(leave.start_date)} – ${dateLabel(leave.end_date)}`}</small></div>
                                    <span className={`dashboard-status ${statusClass(leave.status)}`}>{leave.status}</span>
                                </div>
                            )) : <p className="dashboard-empty dashboard-empty-block">No leave requests yet.</p>}
                        </div>
                    </article>

                    <article className="dashboard-panel">
                        <div className="dashboard-panel-heading"><div><h3>Quick Links</h3><p>Go directly to a common task</p></div></div>
                        <div className="dashboard-quick-links">
                            {isManager ? <>
                                <Link href={route('employees.index')}><span className="quick-icon blue"><i className="bi bi-people" /></span><span><strong>Employee List</strong><small>View employee records</small></span><i className="bi bi-chevron-right" /></Link>
                                <Link href={route('attendance.manage')}><span className="quick-icon orange"><i className="bi bi-clock-history" /></span><span><strong>Attendance List</strong><small>Review attendance records</small></span><i className="bi bi-chevron-right" /></Link>
                                <Link href={route('leave-management.index')}><span className="quick-icon purple"><i className="bi bi-calendar-check" /></span><span><strong>Leave Management</strong><small>Review leave requests</small></span><i className="bi bi-chevron-right" /></Link>
                            </> : <>
                                <Link href={route('attendance.index')}><span className="quick-icon blue"><i className="bi bi-clock-history" /></span><span><strong>My Attendance</strong><small>Review attendance history</small></span><i className="bi bi-chevron-right" /></Link>
                                <Link href={route('leave.index')}><span className="quick-icon purple"><i className="bi bi-calendar-check" /></span><span><strong>My Leave Request</strong><small>View or submit leave requests</small></span><i className="bi bi-chevron-right" /></Link>
                            </>}
                        </div>
                    </article>
                </section>
            </div>
        </AppLayout>
    );
}
