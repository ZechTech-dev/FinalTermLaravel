import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Pagination from '../../Components/Pagination';
import '../../../css/leave-management.css';

const d10 = (v) => (v ? String(v).slice(0, 10) : '');
const fmt = (v) => {
    const s = d10(v);
    return s ? new Date(`${s}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
};
const days = (a, b) => {
    const n = Math.round((new Date(`${d10(b)}T00:00:00`) - new Date(`${d10(a)}T00:00:00`)) / 86400000) + 1;
    return Number.isNaN(n) ? '-' : `${n} day${n === 1 ? '' : 's'}`;
};
const pic = (p) => (!p || p === 'default-picture.jpg' ? '/assets/src/default-picture.jpg' : p.startsWith('http') || p.startsWith('/') ? p : `/storage/${p}`);

export default function Manage({ requests }) {
    const [rejecting, setRejecting] = useState(null);
    const [reason, setReason] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const rows = requests?.data || [];
    const pending = rows.filter(r => r.status === 'Pending').length;

    const decide = (row, status, decision_reason = '') => {
        router.patch(route('leave-management.update', row.request_id), { status, decision_reason }, {
            preserveScroll: true,
            onStart: () => setBusy(true),
            onFinish: () => setBusy(false),
            onSuccess: () => { setRejecting(null); setReason(''); setError(''); },
            onError: (errs) => setError(errs.decision_reason || 'Unable to save decision.'),
        });
    };

    return (
        <AppLayout title="Leave Management">
            <div className="pg">
                <div className="pg-banner">
                    <div className="pg-banner-left">
                        <div className="pg-banner-icon"><i className="bi bi-calendar2-check" /></div>
                        <div><h2>Leave Management</h2><p>Review and decide on employee leave requests</p></div>
                    </div>
                    <div className="pg-banner-right"><span className="pg-pill pending">{pending} pending on this page</span></div>
                </div>

                <div className="pg-card">
                    <div className="pg-scroll">
                        <table className="pg-table">
                            <thead><tr><th>Employee</th><th>Leave Type</th><th>From</th><th>To</th><th>Duration</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody>
                                {rows.length ? rows.map(r => (
                                    <tr key={r.request_id}>
                                        <td><div className="pg-person"><img src={pic(r.user?.profile_picture)} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/src/default-picture.jpg'; }} alt="" /><span>{r.user?.employee_name || r.user?.name || '-'}</span></div></td>
                                        <td>{r.leave_type}</td>
                                        <td>{fmt(r.start_date)}</td>
                                        <td>{fmt(r.end_date)}</td>
                                        <td>{days(r.start_date, r.end_date)}</td>
                                        <td className="reason">{r.reason}</td>
                                        <td><span className={`pg-pill ${String(r.status).toLowerCase()}`}>{r.status}</span></td>
                                        <td>
                                            <div className="pg-actions leave-decision-actions">
                                                {r.status !== 'Approved' && <button type="button" className="pg-btn success sm leave-approve-btn" disabled={busy || r.status === 'Approved'} onClick={() => decide(r, 'Approved')}><i className="bi bi-check-lg" /> {r.status === 'Pending' ? 'Approve' : 'Change to Approved'}</button>}
                                                {r.status !== 'Rejected' && <button type="button" className="pg-btn danger sm leave-reject-btn" disabled={busy || r.status === 'Rejected'} onClick={() => { setRejecting(r); setReason(''); setError(''); }}><i className="bi bi-x-lg" /> {r.status === 'Pending' ? 'Reject' : 'Change to Rejected'}</button>}
                                            </div>
                                            {r.status === 'Rejected' && r.decision_reason && <small style={{ display: 'block', marginTop: 6, color: '#b3262f' }}>{r.decision_reason}</small>}
                                            </td>
                                    </tr>
                                )) : <tr><td colSpan="8" className="pg-empty">No leave requests found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    <div className="pg-foot"><Pagination links={requests?.links || []} /></div>
                </div>
            </div>

            {rejecting && (
                <div className="pg-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setRejecting(null); }}>
                    <section className="pg-modal" role="dialog" aria-modal="true">
                        <button type="button" className="pg-close" onClick={() => setRejecting(null)} aria-label="Close"><i className="bi bi-x-lg" /></button>
                        <h3>Reject Leave Request</h3>
                        <p>{rejecting.user?.employee_name} — {rejecting.leave_type}</p>
                        <form className="pg-form" onSubmit={e => { e.preventDefault(); decide(rejecting, 'Rejected', reason); }}>
                            <label className="full">Reason for rejection<textarea value={reason} onChange={e => setReason(e.target.value)} required />{error && <small>{error}</small>}</label>
                            <div className="full pg-modal-actions" style={{ marginTop: 6 }}>
                                <button type="button" className="pg-btn ghost" onClick={() => setRejecting(null)}>Cancel</button>
                                <button type="submit" className="pg-btn danger" disabled={busy}>Confirm Rejection</button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </AppLayout>
    );
}
