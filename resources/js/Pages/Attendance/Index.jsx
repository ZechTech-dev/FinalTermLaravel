import { router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Pagination from '../../Components/Pagination';

export default function Index({ today, history }) {
    const actions = [
        ['Time In', 'attendance.time-in', !today?.time_in],
        ['Break In', 'attendance.break-in', !!today?.time_in && !today?.break_in && !today?.time_out],
        ['Break Out', 'attendance.break-out', !!today?.break_in && !today?.break_out && !today?.time_out],
        ['Time Out', 'attendance.time-out', !!today?.time_in && !today?.time_out && (!today?.break_in || !!today?.break_out)],
    ];
    return <AppLayout title="Attendance"><section className="page-content">
        <div className="attendance-actions">{actions.map(([label, routeName, enabled]) => <button key={routeName} disabled={!enabled} onClick={() => router.post(route(routeName))}>{label}</button>)}</div>
        <h2>Today's Attendance</h2>
        <p>Date: {today?.date || new Date().toLocaleDateString()}</p>
        <div className="table-wrap"><table><thead><tr><th>Date</th><th>Time In</th><th>Break In</th><th>Break Out</th><th>Time Out</th><th>Status</th><th>Total Hours</th></tr></thead><tbody>
            {history.data.map(row => <tr key={row.attendance_id}><td>{row.date}</td><td>{row.time_in || '-'}</td><td>{row.break_in || '-'}</td><td>{row.break_out || '-'}</td><td>{row.time_out || '-'}</td><td>{row.status}</td><td>{row.total_hours}</td></tr>)}
        </tbody></table></div><Pagination links={history.links} />
    </section></AppLayout>;
}
