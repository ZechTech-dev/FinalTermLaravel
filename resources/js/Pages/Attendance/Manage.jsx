import AppLayout from '../../Layouts/AppLayout';
import Pagination from '../../Components/Pagination';

export default function Manage({ attendance }) {
    return <AppLayout title="Attendance List"><section className="page-content">
        <div className="table-wrap"><table><thead><tr><th>Employee ID</th><th>Employee Name</th><th>Date</th><th>Time In</th><th>Break In</th><th>Break Out</th><th>Time Out</th><th>Status</th><th>Total Hours</th></tr></thead><tbody>
            {attendance.data.map(row => <tr key={row.attendance_id}><td>{row.user?.employee_id}</td><td>{row.user?.employee_name}</td><td>{row.date}</td><td>{row.time_in || '-'}</td><td>{row.break_in || '-'}</td><td>{row.break_out || '-'}</td><td>{row.time_out || '-'}</td><td>{row.status}</td><td>{row.total_hours}</td></tr>)}
        </tbody></table></div><Pagination links={attendance.links} />
    </section></AppLayout>;
}
