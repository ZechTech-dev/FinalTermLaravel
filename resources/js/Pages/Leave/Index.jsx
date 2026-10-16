import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Pagination from '../../Components/Pagination';
import '../../../css/leave-request.css';

const d10 = (v) => (v ? String(v).slice(0, 10) : '');
const fmt = (v) => {
    const s = d10(v);
    return s ? new Date(`${s}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-';
};
const daysBetween = (a, b) => {
    if (!d10(a) || !d10(b)) return null;
    const n = Math.round((new Date(`${d10(b)}T00:00:00`) - new Date(`${d10(a)}T00:00:00`)) / 86400000);
    return n >= 0 ? n + 1 : null;
};
const durationText = (a, b) => {
    const n = daysBetween(a, b);
    return n === null ? '' : `${n} day(s)`;
};
const slug = (s) => String(s || '').toLowerCase();

export default function Index({ requests, stats = {}, filters = {} }) {
    const rows = requests?.data || [];
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [stepError, setStepError] = useState('');
    const [viewing, setViewing] = useState(null);
    const form = useForm({ leave_type: '', start_date: '', end_date: '', reason: '' });
    const duration = durationText(form.data.start_date, form.data.end_date);

    const openModal = () => { form.reset(); form.clearErrors(); setStep(1); setStepError(''); setOpen(true); };
    const closeModal = () => { setOpen(false); setStep(1); setStepError(''); };

    const next = () => {
        setStepError('');
        if (step === 1 && !form.data.leave_type) return setStepError('Please select leave type.');
        if (step === 2) {
            const { start_date, end_date, reason } = form.data;
            if (!start_date || !end_date || !reason.trim()) return setStepError('Please complete all leave details.');
            if (end_date < start_date) return setStepError('End date cannot be before start date.');
        }
        if (step < 4) setStep(step + 1);
    };
    const back = () => { setStepError(''); if (step > 1) setStep(step - 1); };

    const submit = (e) => {
        e.preventDefault();
        if (step < 4) return next();
        form.post(route('leave.store'), {
            preserveScroll: true,
            onSuccess: () => { form.reset(); closeModal(); },
            onError: (errs) => {
                if (errs.start_date || errs.end_date || errs.reason) setStep(2);
                else if (errs.leave_type) setStep(1);
                setStepError(Object.values(errs)[0] || 'Unable to submit your request.');
            },
        });
    };

    const filterStatus = (status) => router.get(route('leave.index'), { ...filters, status }, { preserveState: true, replace: true });
    const statusValue = filters?.status || 'All Status';

    const cards = [
        ['bi-calendar-check', 'TOTAL LEAVE REQUESTS', stats.total ?? 0, 'This year'],
        ['bi-hourglass-split', 'PENDING REQUESTS', stats.pending ?? 0, 'Awaiting approval'],
        ['bi-check-circle', 'APPROVED LEAVES', stats.approved ?? 0, 'Approved requests'],
        ['bi-x-circle', 'REJECTED LEAVES', stats.rejected ?? 0, 'Rejected requests'],
    ];

    return (
        <AppLayout title="Leave Request">
            <div className="leave-request-wrapper">
                <section className="yearFilter">
                    <div className="leave">
                        <div className="calc"><h1>Total Number of Request: {stats.total ?? 0}</h1></div>
                        <span>Filter:{' '}
                            <select value={statusValue} onChange={e => filterStatus(e.target.value)}>
                                <option>All Status</option>
                                <option>Approved</option>
                                <option>Pending</option>
                                <option>Rejected</option>
                            </select>
                        </span>
                        <button type="button" className="new-request-btn" onClick={openModal}>
                            <i className="bi bi-plus-circle-fill" /> Add New Request
                        </button>
                    </div>
                </section>

                <div className="stats">
                    {cards.map(([icon, label, value, sub]) => (
                        <div className="div-total" key={label}>
                            <div className="total">
                                <div className="cover-total"><i className={`bi ${icon}`} /></div>
                                <span><span>{label}</span><h6>{value}</h6><span>{sub}</span></span>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ height: 28 }} />

                <section className="tableLeave">
                    <table>
                        <thead>
                            <tr><th>Leave Type</th><th>Date Filed</th><th>From</th><th>To</th><th>Duration</th><th>Status</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                            {rows.length ? rows.map(r => (
                                <tr key={r.request_id}>
                                    <td>{r.leave_type}</td>
                                    <td>{fmt(r.applied_at)}</td>
                                    <td>{fmt(r.start_date)}</td>
                                    <td>{fmt(r.end_date)}</td>
                                    <td>{durationText(r.start_date, r.end_date)}</td>
                                    <td><span className={`status ${slug(r.status)}`}>{r.status}</span></td>
                                    <td><button type="button" className="btn-view" onClick={() => setViewing(r)}>View</button></td>
                                </tr>
                            )) : <tr><td colSpan="7" className="no-records">No leave requests found.</td></tr>}
                        </tbody>
                        <tfoot><tr><td colSpan="7"><Pagination links={requests?.links || []} /></td></tr></tfoot>
                    </table>
                </section>

                <div className={`modal-overlay ${viewing ? 'active' : ''}`} onMouseDown={e => { if (e.target === e.currentTarget) setViewing(null); }}>
                    {viewing && (
                        <div className="leave-modal">
                            <h2>Leave Request Details</h2>
                            <button type="button" className="close-modal" onClick={() => setViewing(null)}>&times;</button>
                            <div className="modal-details">
                                <div><label>Leave Type</label><p>{viewing.leave_type}</p></div>
                                <div><label>Status</label><p>{viewing.status}</p></div>
                                <div><label>Date Filed</label><p>{fmt(viewing.applied_at)}</p></div>
                                <div><label>From</label><p>{fmt(viewing.start_date)}</p></div>
                                <div><label>To</label><p>{fmt(viewing.end_date)}</p></div>
                                <div><label>Duration</label><p>{durationText(viewing.start_date, viewing.end_date)}</p></div>
                                <div className="reason-box"><label>Reason</label><p>{viewing.reason}</p></div>
                                {viewing.status === 'Rejected' && viewing.decision_reason && (
                                    <div className="reason-box"><label>Rejection Reason</label><p>{viewing.decision_reason}</p></div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className={`request-overlay ${open ? 'active' : ''}`} onMouseDown={e => { if (e.target === e.currentTarget) closeModal(); }}>
                    {open && (
                        <div className="request-modal">
                            <div className="modal-header">
                                <h2>New Leave Request</h2>
                                <button type="button" className="close-btn" onClick={closeModal}>&times;</button>
                            </div>

                            <div className="progress">
                                {[1, 2, 3, 4].map((n, i) => (
                                    <span key={n} style={{ display: 'contents' }}>
                                        <div className={`circle ${step >= n ? 'active' : ''}`}>{n}</div>
                                        {i < 3 && <div className="line" />}
                                    </span>
                                ))}
                            </div>

                            <form onSubmit={submit} noValidate>
                                <div className={`step ${step === 1 ? 'active' : ''}`}>
                                    <h3>Select Leave Type</h3>
                                    <p className="instruction">Select the leave category you are requesting.</p>
                                    <select value={form.data.leave_type} onChange={e => form.setData('leave_type', e.target.value)}>
                                        <option value="">Choose Leave Type</option>
                                        <option value="Sick Leave">Sick Leave</option>
                                        <option value="Vacation Leave">Vacation Leave</option>
                                        <option value="Emergency Leave">Emergency Leave</option>
                                    </select>
                                    <div className="buttons"><button type="button" onClick={next}>Next</button></div>
                                </div>

                                <div className={`step ${step === 2 ? 'active' : ''}`}>
                                    <h3>Leave Details</h3>
                                    <p className="instruction">Select your leave dates and provide a reason.</p>
                                    <label>From</label>
                                    <input type="date" value={form.data.start_date} onChange={e => form.setData('start_date', e.target.value)} />
                                    <label>To</label>
                                    <input type="date" min={form.data.start_date} value={form.data.end_date} onChange={e => form.setData('end_date', e.target.value)} />
                                    <label>Total Duration</label>
                                    <input type="text" readOnly value={form.data.start_date && form.data.end_date ? (duration || 'Invalid date') : ''} />
                                    <label>Reason</label>
                                    <textarea rows="5" placeholder="Explain why you're requesting leave" value={form.data.reason} onChange={e => form.setData('reason', e.target.value)} />
                                    <div className="buttons">
                                        <button type="button" onClick={back}>Back</button>
                                        <button type="button" onClick={next}>Next</button>
                                    </div>
                                </div>

                                <div className={`step ${step === 3 ? 'active' : ''}`}>
                                    <h3>Review Request</h3>
                                    <p className="instruction">Verify all information before submitting.</p>
                                    <div className="review">
                                        <p><strong>Leave Type:</strong> <span>{form.data.leave_type}</span></p>
                                        <p><strong>From:</strong> <span>{form.data.start_date}</span></p>
                                        <p><strong>To:</strong> <span>{form.data.end_date}</span></p>
                                        <p><strong>Duration:</strong> <span>{duration}</span></p>
                                        <p><strong>Reason:</strong></p>
                                        <div className="reason-box"><span>{form.data.reason}</span></div>
                                    </div>
                                    <div className="buttons">
                                        <button type="button" onClick={back}>Back</button>
                                        <button type="button" onClick={next}>Continue</button>
                                    </div>
                                </div>

                                <div className={`step ${step === 4 ? 'active' : ''}`} id="step4">
                                    <i className="bi bi-send-check-fill success-icon" />
                                    <h3>Confirm Submission</h3>
                                    <p className="instruction">Your leave request will be sent to your manager for approval.</p>
                                    <div className="buttons">
                                        <button type="button" onClick={back}>Back</button>
                                        <button type="submit" disabled={form.processing}>{form.processing ? 'Submitting...' : 'Submit Request'}</button>
                                    </div>
                                </div>

                                {stepError && <div className="step-error">{stepError}</div>}
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
