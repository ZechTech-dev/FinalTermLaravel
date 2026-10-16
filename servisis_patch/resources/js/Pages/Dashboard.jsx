import AppLayout from '../Layouts/AppLayout';
import { Link, usePage } from '@inertiajs/react';

const num = value => Number(value || 0).toLocaleString();
const dateText = value => value ? new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—';
const timeText = value => value ? String(value).slice(0, 5) : '—';

function Stat({ icon, label, value, note, tone = 'blue' }) {
    return <article className="sis-stat card"><div className={`sis-stat-icon ${tone}`}><i className={`bi ${icon}`} /></div><div className="sis-stat-copy"><span>{label}</span><strong>{num(value)}</strong>{note && <small>{note}</small>}</div></article>;
}

function Status({ value }) {
    const key = String(value || '').toLowerCase().replaceAll(' ', '-');
    return <span className={`sis-status ${key}`}>{value || '—'}</span>;
}

export default function Dashboard({ dashboardRole = 'Employee', employeeName, stats = {}, attendanceSummary = {}, recentAttendance = [], recentDocuments = [], recentLeaves = [], todayAttendance }) {
    const { auth } = usePage().props;
    const manager = dashboardRole === 'Manager';
    const name = employeeName || auth?.user?.employee_name || auth?.user?.name || 'User';
    const percent = Math.max(0, Math.min(100, Number(attendanceSummary.presentPercent || 0)));
    const attendanceRows = Array.isArray(recentAttendance) ? recentAttendance : recentAttendance?.data || [];
    const documentRows = Array.isArray(recentDocuments) ? recentDocuments : recentDocuments?.data || [];

    return <AppLayout title="Dashboard">
        <section className={`sis-dashboard ${manager ? 'manager-dashboard' : 'employee-dashboard'}`}>
            <div className="sis-top-grid">
                <article className="sis-welcome">
                    <div className="sis-welcome-icon"><i className="bi bi-speedometer2" /></div>
                    <div><p>Welcome back,</p><h2>{name}!</h2><span>{manager ? 'Here’s your employee management overview.' : 'Let’s keep up the good work.'}</span></div>
                </article>
                {manager ? <>
                    <Stat icon="bi-people-fill" label="EMPLOYEES" value={stats.totalEmployees} note={`${num(stats.activeEmployees)} active employees`} />
                    <Stat icon="bi-person-check-fill" label="PRESENT TODAY" value={stats.presentToday} note={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} tone="blue" />
                    <Stat icon="bi-clock-history" label="Attendance" value={stats.lateToday} note="Late today" tone="red" />
                    <article className="sis-stat sis-pending card"><div className="sis-pending-top"><span>Pending Leaves</span><div className="sis-stat-icon"><i className="bi bi-calendar2-check" /></div></div><strong>{num(stats.pendingLeaves)}</strong><small>Requests</small><Link href={route('leave-management.index')}>View details</Link></article>
                </> : <>
                    <Stat icon="bi-clock" label="TIME IN" value={todayAttendance?.time_in ? timeText(todayAttendance.time_in) : '—'} note={dateText(todayAttendance?.date)} />
                    <Stat icon="bi-clock-fill" label="TIME OUT" value={todayAttendance?.time_out ? timeText(todayAttendance.time_out) : '—'} note={todayAttendance?.time_out ? 'Timed out' : 'Not yet timed out'} tone="red" />
                    <Stat icon="bi-calendar2-check" label="PENDING LEAVES" value={stats.pendingLeaves} note="Requests" />
                </>}
            </div>

            <div className="sis-middle-grid">
                <section className="sis-panel sis-documents"><div className="sis-panel-heading"><h3>{manager ? 'Recent Employee Documents' : 'My Recent Documents'}</h3><Link href={manager ? (route().has('documents.index') ? route('documents.index') : route('employees.index')) : route('dashboard')}>View All</Link></div>
                    <div className="sis-table-scroll"><table className="sis-table"><thead><tr>{manager && <th>EMPLOYEE</th>}<th>DOCUMENT</th><th>CATEGORY</th><th>DATE UPLOADED</th></tr></thead><tbody>
                        {documentRows.length ? documentRows.map((doc, i) => <tr key={doc.id || doc.document_id || i}>{manager && <td>{doc.employee_name || doc.user_name || 'Employee'}</td>}<td><i className="bi bi-file-earmark-text" /> {doc.document_name || doc.original_name || doc.file_name || doc.name || 'Document'}</td><td>{doc.document_type_name || doc.category || doc.document_type || '—'}</td><td>{dateText(doc.uploaded_at || doc.created_at)}</td></tr>) : <tr><td colSpan={manager ? 4 : 3} className="sis-empty">No document records available yet.</td></tr>}
                    </tbody></table></div>
                </section>
                <section className="sis-panel sis-attendance-overview"><div className="sis-panel-heading"><h3>Attendance Overview</h3></div><div className="sis-donut-layout"><div className="sis-donut" style={{ background: `conic-gradient(#0b2e6d 0% ${percent}%, #e5e7eb ${percent}% 100%)` }}><div><strong>{percent}%</strong></div></div><div className="sis-legend"><span><i className="present-dot"/>Present <b>{num(attendanceSummary.present)}</b></span><span><i className="late-dot"/>Late <b>{num(attendanceSummary.late)}</b></span><span><i className="dayoff-dot"/>Day Off <b>{num(attendanceSummary.dayOff)}</b></span></div></div></section>
            </div>

            <div className="sis-bottom-grid">
                <section className="sis-panel sis-recent-attendance"><div className="sis-panel-heading"><h3>Recent Attendance Records</h3>{manager && <Link href={route('attendance.manage')}>View All</Link>}</div><div className="sis-table-scroll"><table className="sis-table"><thead><tr>{manager && <th>EMPLOYEE</th>}<th>DATE</th><th>TIME IN</th><th>TIME OUT</th><th>STATUS</th></tr></thead><tbody>
                    {attendanceRows.length ? attendanceRows.map((row, i) => <tr key={row.attendance_id || i}>{manager && <td>{row.user?.employee_name || row.user?.name || 'Employee'}</td>}<td>{dateText(row.date)}</td><td>{timeText(row.time_in)}</td><td>{timeText(row.time_out)}</td><td><Status value={row.status}/></td></tr>) : <tr><td colSpan={manager ? 5 : 4} className="sis-empty">No attendance records yet.</td></tr>}
                </tbody></table></div>{!manager && <Link className="sis-text-link" href={route('attendance.index')}>View Full Attendance History</Link>}</section>

                <section className="sis-panel sis-quick-links"><div className="sis-panel-heading"><h3>Quick Links</h3></div><div className="sis-quick-grid">
                    {manager ? <><Link href={route('employees.index')}><i className="bi bi-people"/><strong>Employee Management</strong><small>Manage employee records</small></Link><Link href={route('attendance.manage')}><i className="bi bi-clock-history"/><strong>Attendance Records</strong><small>View employee attendance</small></Link><Link href={route('leave-management.index')}><i className="bi bi-calendar2-check"/><strong>Leave Requests</strong><small>Review employee leave requests</small></Link></> : <><Link href={route('attendance.index')}><i className="bi bi-clock-history"/><strong>My Attendance</strong><small>View attendance records</small></Link><Link href={route('leave.index')}><i className="bi bi-calendar2-check"/><strong>Leave Requests</strong><small>Submit or review requests</small></Link></>}
                </div></section>

                <section className="sis-panel sis-system-overview"><div className="sis-panel-heading"><h3>{manager ? 'System Overview' : 'My Summary'}</h3></div>{manager ? <dl><div><dt>Total Employees</dt><dd>{num(stats.totalEmployees)}</dd></div><div><dt>Active Employees</dt><dd>{num(stats.activeEmployees)}</dd></div><div><dt>Total Documents</dt><dd>{num(stats.totalDocuments)}</dd></div></dl> : <dl><div><dt>Late this month</dt><dd>{num(stats.lateCount)}</dd></div><div><dt>Pending leave requests</dt><dd>{num(stats.pendingLeaves)}</dd></div><div><dt>Days present</dt><dd>{num(attendanceSummary.present)}</dd></div></dl>}</section>
            </div>
        </section>
    </AppLayout>;
}
