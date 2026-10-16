import AppLayout from '../Layouts/AppLayout';
import { Link } from '@inertiajs/react';

const Stat = ({ icon, label, value, sub }) => <section className="original-stat card"><div className="original-stat-label"><span className="original-icon-circle">{icon}</span>{label}</div><strong>{value}</strong>{sub && <small>{sub}</small>}</section>;
const Status = ({ value }) => <span className={`original-status ${(value || '').toLowerCase().replace(/\s+/g, '-')}`}>{value || '—'}</span>;

export default function Dashboard({ isManager, name, today, stats = {}, attendanceSummary = {}, recentAttendance = [], documents = [], totalDocuments = 0, timeIn }) {
    const present = attendanceSummary.present || 0;
    const late = attendanceSummary.late || 0;
    const dayOff = attendanceSummary.dayOff || 0;
    const percent = attendanceSummary.percent || 0;
    return <AppLayout title="Dashboard">
        <div className="original-dashboard">
            <div className="original-top-row">
                <section className="original-welcome"><span className="original-welcome-icon"><i className="bi bi-speedometer2" /></span><div><p>Welcome back,</p><h2>{name}!</h2><p>Here's your employee management overview.</p></div></section>
                {isManager ? <>
                    <Stat icon={<i className="bi bi-people-fill" />} label="EMPLOYEES" value={stats.totalEmployees ?? 0} sub={`${stats.activeEmployees ?? 0} active employees`} />
                    <Stat icon={<i className="bi bi-person-check-fill" />} label="PRESENT TODAY" value={stats.presentToday ?? 0} sub={today} />
                    <section className="original-stat card"><span className="original-muted">Attendance</span><small>Late Today</small><div className="original-summary"><strong>{stats.lateToday ?? 0}</strong><span className="original-clock"><i className="bi bi-clock-history" /></span></div></section>
                    <section className="original-stat card original-pending"><span className="original-muted">Pending Leaves</span><div className="original-pending-row"><span className="original-icon-circle"><i className="bi bi-calendar-check" /></span><div><strong>{stats.pendingLeaves ?? 0}</strong><small>Requests</small></div></div><Link href={route('leave-management.index')}>View details</Link></section>
                </> : <>
                    <Stat icon={<i className="bi bi-clock" />} label="TIME IN" value={timeIn ? new Date(`1970-01-01T${timeIn}`).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'} sub={today} />
                    <Stat icon={<i className="bi bi-calendar-check" />} label="PENDING LEAVES" value={stats.pendingLeaves ?? 0} sub="Requests" />
                    <Stat icon={<i className="bi bi-calendar2-check" />} label="DAYS PRESENT" value={stats.daysPresent ?? 0} sub="Attendance records" />
                    <Stat icon={<i className="bi bi-person" />} label="MY STATUS" value="Employee" sub="Staff Information System" />
                </>}
            </div>
            <div className="original-mid-row">
                <section className="card original-panel original-documents"><div className="original-card-header"><h3>{isManager ? 'Recent Employee Documents' : 'My Recent Documents'}</h3></div><div className="original-table-wrap"><table><thead><tr>{isManager && <th>Employee</th>}<th>Document</th><th>Category</th><th>Date Uploaded</th></tr></thead><tbody>{documents.length ? documents.map((doc, i) => <tr key={i}>{isManager && <td>{doc.employee}</td>}<td><i className="bi bi-file-earmark-text" /> {doc.document}</td><td>{doc.category}</td><td>{doc.uploaded}</td></tr>) : <tr><td colSpan={isManager ? 4 : 3} className="original-empty">No documents uploaded yet.</td></tr>}</tbody></table></div></section>
                <section className="card original-panel"><div className="original-card-header"><h3>Attendance Overview</h3></div><div className="original-donut-wrap"><div className="original-donut" style={{background:`conic-gradient(#0B2E6D 0% ${percent}%, #E5E7EB ${percent}% 100%)`}}><span>{percent}%</span></div><div className="original-legend"><div><b />Present {present}</div><div><b />Late {late}</div><div><b />Day Off {dayOff}</div></div></div></section>
            </div>
            <div className="original-bottom-row">
                <section className="card original-panel"><div className="original-card-header"><h3>Recent Attendance Records</h3></div><div className="original-table-wrap"><table><thead><tr>{isManager && <th>Employee</th>}<th>Date</th><th>Time In</th><th>Time Out</th><th>Status</th></tr></thead><tbody>{recentAttendance.length ? recentAttendance.map((r,i)=><tr key={i}>{isManager && <td>{r.name}</td>}<td>{r.date}</td><td>{r.time_in}</td><td>{r.time_out}</td><td><Status value={r.status}/></td></tr>):<tr><td colSpan={isManager ? 5 : 4} className="original-empty">No attendance records yet.</td></tr>}</tbody></table></div><Link className="original-history" href={isManager ? route('attendance.manage') : route('attendance.index')}>View Full Attendance History</Link></section>
                <section className="card original-panel"><div className="original-card-header"><h3>Quick Links</h3></div><div className="original-quick-links">{(isManager ? [{icon:'people',label:'Employee Management',desc:'Manage employee records',href:route('employees.index')},{icon:'clock-history',label:'Attendance Records',desc:'View employee attendance',href:route('attendance.manage')},{icon:'calendar-check',label:'Leave Requests',desc:'Review employee leave requests',href:route('leave-management.index')}] : [{icon:'clock',label:'Attendance',desc:'Record your time',href:route('attendance.index')},{icon:'calendar-plus',label:'Leave Request',desc:'Create and track leave requests',href:route('leave.index')}]).map(item=><Link key={item.label} href={item.href} className="original-quick-link"><span><i className={`bi bi-${item.icon}`} /></span><strong>{item.label}</strong><small>{item.desc}</small></Link>)}</div></section>
                <section className="card original-panel"><div className="original-card-header"><h3>{isManager ? 'System Overview' : 'Personal Information'}</h3></div>{isManager ? <><div className="original-info-row"><span>Total Employees</span><strong>{stats.totalEmployees ?? 0}</strong></div><div className="original-info-row"><span>Active Employees</span><strong>{stats.activeEmployees ?? 0}</strong></div><div className="original-info-row"><span>Total Documents</span><strong>{totalDocuments}</strong></div></> : <><div className="original-info-row"><span>Role</span><strong>Employee</strong></div><div className="original-info-row"><span>Today's Time In</span><strong>{timeIn ? new Date(`1970-01-01T${timeIn}`).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '—'}</strong></div></>}</section>
            </div>
        </div>
    </AppLayout>;
}
