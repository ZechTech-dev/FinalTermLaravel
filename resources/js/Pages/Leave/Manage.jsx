import { useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Pagination from '../../Components/Pagination';

export default function Manage({ requests }) {
    return <AppLayout title="Leave Management"><section className="page-content">
        <div className="table-wrap"><table><thead><tr><th>Employee</th><th>Leave Type</th><th>Dates</th><th>Reason</th><th>Status</th><th>Decision</th></tr></thead><tbody>
            {requests.data.map(row => <LeaveRow key={row.request_id} row={row} />)}
        </tbody></table></div><Pagination links={requests.links} />
    </section></AppLayout>;
}

function LeaveRow({ row }) {
    const form = useForm({ status: 'Approved', decision_reason: '' });
    function decide(status) {
        form.setData('status', status);
        if (status === 'Approved') form.patch(route('leave-management.update', row.request_id));
    }
    return <tr><td>{row.user?.employee_name}</td><td>{row.leave_type}</td><td>{row.start_date} – {row.end_date}</td><td>{row.reason}</td><td>{row.status}</td><td>{row.status === 'Pending' ? <form onSubmit={e => { e.preventDefault(); form.patch(route('leave-management.update', row.request_id)); }}>
        <select value={form.data.status} onChange={e => form.setData('status', e.target.value)}><option>Approved</option><option>Rejected</option></select>
        {form.data.status === 'Rejected' && <textarea required placeholder="Reason for rejection" value={form.data.decision_reason} onChange={e => form.setData('decision_reason', e.target.value)} />}
        {form.errors.decision_reason && <small>{form.errors.decision_reason}</small>}
        <button type="submit" disabled={form.processing}>Submit Decision</button>
    </form> : row.decision_reason || '-'}</td></tr>;
}
