import { useForm, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Pagination from '../../Components/Pagination';

export default function Index({ requests, stats, filters }) {
    const form = useForm({ leave_type: '', start_date: '', end_date: '', reason: '' });
    function submit(event) { event.preventDefault(); form.post(route('leave.store'), { onSuccess: () => form.reset() }); }
    return <AppLayout title="Leave Request"><section className="page-content">
        <div className="stats-grid">{Object.entries(stats).map(([key, value]) => <div className="stat-card" key={key}><span>{key}</span><strong>{value}</strong></div>)}</div>
        <form className="leave-form" onSubmit={submit}>
            <h2>Submit Leave Request</h2>
            <label>Leave Type<select value={form.data.leave_type} onChange={e => form.setData('leave_type', e.target.value)}><option value="">Select leave type</option><option>Personal Leave</option><option>Sick Leave</option><option>Vacation Leave</option><option>Emergency Leave</option></select>{form.errors.leave_type && <small>{form.errors.leave_type}</small>}</label>
            <label>Start Date<input type="date" value={form.data.start_date} onChange={e => form.setData('start_date', e.target.value)} />{form.errors.start_date && <small>{form.errors.start_date}</small>}</label>
            <label>End Date<input type="date" min={form.data.start_date} value={form.data.end_date} onChange={e => form.setData('end_date', e.target.value)} />{form.errors.end_date && <small>{form.errors.end_date}</small>}</label>
            <label>Reason<textarea value={form.data.reason} onChange={e => form.setData('reason', e.target.value)} />{form.errors.reason && <small>{form.errors.reason}</small>}</label>
            <button type="submit" disabled={form.processing}>Submit Request</button>
        </form>
        <div className="filter-row"><label>Status <select value={filters?.status || 'All Status'} onChange={e => router.get(route('leave.index'), { ...filters, status: e.target.value })}><option>All Status</option><option>Pending</option><option>Approved</option><option>Rejected</option></select></label><label>Year <input type="number" value={filters?.year || new Date().getFullYear()} onChange={e => router.get(route('leave.index'), { ...filters, year: e.target.value })} /></label></div>
        <div className="table-wrap"><table><thead><tr><th>Leave Type</th><th>Start Date</th><th>End Date</th><th>Reason</th><th>Status</th><th>Applied At</th></tr></thead><tbody>
            {requests.data.map(row => <tr key={row.request_id}><td>{row.leave_type}</td><td>{row.start_date}</td><td>{row.end_date}</td><td>{row.reason}</td><td>{row.status}</td><td>{row.applied_at}</td></tr>)}
        </tbody></table></div><Pagination links={requests.links} />
    </section></AppLayout>;
}
