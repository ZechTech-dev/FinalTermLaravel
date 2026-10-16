import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Pagination from '../../Components/Pagination';
import '../../../css/employee-list.css';

const blank = (departments) => ({ employee_id: '', employee_name: '', email: '', role: 'Employee', department_id: departments?.[0]?.department_id || '', status: 'Active', hire_date: '', password: '', profile_picture: null });

const pictureUrl = (path) => {
    if (!path || path === 'default-picture.jpg') return '/assets/src/default-picture.jpg';
    if (/^https?:\/\//i.test(path) || path.startsWith('/')) return path;
    return `/storage/${path.replace(/^\/+/, '')}`;
};

export default function Index({ employees, departments = [], filters = {}, flash = {} }) {
    const [modal, setModal] = useState(null);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState(filters.search || '');
    const form = useForm(blank(departments));
    const editForm = useForm(blank(departments));
    const rows = employees?.data || [];
    const count = employees?.total ?? rows.length;

    function openAdd() { form.reset(); form.setData(blank(departments)); setSelected(null); setModal('add'); }
    function openEdit(employee) {
        setSelected(employee);
        editForm.setData({ employee_id: employee.employee_id || '', employee_name: employee.employee_name || employee.name || '', email: employee.email || '', role: employee.role || (employee.roles?.[0]?.name) || 'Employee', department_id: employee.department_id || '', status: employee.status || 'Active', hire_date: employee.hire_date ? String(employee.hire_date).slice(0, 10) : '', password: '', profile_picture: null });
        setModal('edit');
    }
    function submitAdd(e) {
        e.preventDefault();
        form.clearErrors();
        form.transform(data => ({ ...data, hire_date: String(data.hire_date || '').slice(0, 10) }));
        form.post(route('employees.store'), { forceFormData: true, preserveScroll: true, onSuccess: () => { setModal(null); form.reset(); }, onError: () => { setModal('add'); document.querySelector('.emp-modal')?.scrollTo({ top: 0, behavior: 'smooth' }); } });
    }
    function submitEdit(e) {
        e.preventDefault();
        if (!selected?.id) return;
        editForm.clearErrors();
        editForm.transform(data => ({ ...data, _method: 'put', hire_date: String(data.hire_date || '').slice(0, 10) }));
        editForm.post(route('employees.update', selected.id), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => { setModal(null); editForm.reset('password', 'profile_picture'); },
                onError: () => { setModal('edit'); document.querySelector('.emp-modal')?.scrollTo({ top: 0, behavior: 'smooth' }); },
            });
    }
    function removeEmployee(employee) { if (window.confirm(`Delete ${employee.employee_name || employee.name}? This cannot be undone.`)) router.delete(route('employees.destroy', employee.id)); }
    function doSearch(e) { e.preventDefault(); router.get(route('employees.index'), { search }, { preserveState: true, replace: true }); }
    const fields = (f) => <div className="emp-form-grid">
        <label>Employee ID<input value={f.data.employee_id} onChange={e => f.setData('employee_id', e.target.value)} required />{f.errors.employee_id && <small>{f.errors.employee_id}</small>}</label>
        <label>Full Name<input value={f.data.employee_name} onChange={e => f.setData('employee_name', e.target.value)} required />{f.errors.employee_name && <small>{f.errors.employee_name}</small>}</label>
        <label>Email Address<input type="email" value={f.data.email} onChange={e => f.setData('email', e.target.value)} required />{f.errors.email && <small>{f.errors.email}</small>}</label>
        <label>Position<select value={f.data.role} onChange={e => f.setData('role', e.target.value)}><option value="Employee">Employee</option><option value="Manager">Manager</option></select></label>
        <label>Department<select value={f.data.department_id} onChange={e => f.setData('department_id', e.target.value)} required><option value="">Select department</option>{departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}</select>{f.errors.department_id && <small>{f.errors.department_id}</small>}</label>
        <label>Status<select value={f.data.status} onChange={e => f.setData('status', e.target.value)}><option>Active</option><option>Inactive</option></select></label>
        <label>Date Hired<input type="date" value={f.data.hire_date} onChange={e => f.setData('hire_date', e.target.value)} required />{f.errors.hire_date && <small>{f.errors.hire_date}</small>}</label>
        <label>{modal === 'edit' ? 'New Password (optional)' : 'Temporary Password'}<input type="password" autoComplete="new-password" value={f.data.password} onChange={e => f.setData('password', e.target.value)} required={modal === 'add'} />{f.errors.password && <small>{f.errors.password}</small>}</label>
        <div className="emp-full-field emp-picture-field"><label htmlFor={modal === 'add' ? 'add-profile-picture' : 'edit-profile-picture'}>Profile Picture</label><div className="emp-picture-upload"><img src={f.data.profile_picture instanceof File ? URL.createObjectURL(f.data.profile_picture) : (modal === 'edit' && selected ? pictureUrl(selected.profile_picture) : '/assets/src/default-picture.jpg')} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/src/default-picture.jpg'; }} alt="Profile preview"/><div><input id={modal === 'add' ? 'add-profile-picture' : 'edit-profile-picture'} type="file" accept="image/jpeg,image/png" onChange={e => f.setData('profile_picture', e.target.files?.[0] || null)} /> <small>JPG or PNG, maximum 5 MB</small></div></div>{f.errors.profile_picture && <small>{f.errors.profile_picture}</small>}</div>
    </div>;

    return <AppLayout title="Employee Management">
        <Head title="Employee List" />
        <section className="emp-page">
            <div className="emp-list-header">
                <div className="emp-title-group"><div className="emp-title-icon"><i className="bi bi-people-fill" /></div><div><h2>Employee List</h2><p>Manage and view all employees in the organization</p></div></div>
                <form className="emp-search" onSubmit={doSearch}><i className="bi bi-search"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee..." aria-label="Search employees"/><button type="submit">Search</button></form>
                <button className="emp-add-btn" type="button" onClick={openAdd}><i className="bi bi-plus-lg"/> Add Employee</button>
            </div>
            {flash?.success && <div className="emp-alert success">{flash.success}</div>}
            <div className="emp-table-card"><div className="emp-table-top"><div><h3>Employees</h3><span>{count} employee{count === 1 ? '' : 's'} registered</span></div><span className="emp-record-tag"><i className="bi bi-people"/> Employee Records</span></div>
                <div className="emp-table-scroll"><table className="emp-table"><thead><tr><th>Employee ID</th><th>Full Name</th><th>Position</th><th>Department</th><th>Email</th><th>Status</th><th>Date Hired</th><th>Action</th></tr></thead><tbody>
                    {rows.length ? rows.map(employee => <tr key={employee.id}><td className="emp-id">{employee.employee_id || '—'}</td><td><div className="emp-person"><img src={pictureUrl(employee.profile_picture)} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/src/default-picture.jpg'; }} alt=""/><span>{employee.employee_name || employee.name || 'Unnamed'}</span></div></td><td>{employee.role || employee.roles?.[0]?.name || 'Employee'}</td><td>{employee.department?.department_name || '—'}</td><td>{employee.email || '—'}</td><td><span className={`emp-status ${(employee.status || 'Active').toLowerCase().replaceAll(' ', '-')}`}>{employee.status || 'Active'}</span></td><td>{employee.hire_date || '—'}</td><td><div className="emp-actions"><button type="button" title="View details" onClick={() => { setSelected(employee); setModal('view'); }}><i className="bi bi-eye"/></button><button type="button" title="Edit employee" onClick={() => openEdit(employee)}><i className="bi bi-pencil-square"/></button><button type="button" title="Delete employee" className="delete" onClick={() => removeEmployee(employee)}><i className="bi bi-trash3"/></button></div></td></tr>) : <tr><td colSpan="8" className="emp-empty"><i className="bi bi-person-lines-fill"/><strong>No employees found</strong><span>Try another search or add a new employee.</span></td></tr>}
                </tbody></table></div><div className="emp-pagination"><Pagination links={employees?.links || []}/></div>
            </div>
        </section>
        {(modal === 'add' || modal === 'edit') && <div className="emp-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModal(null); }}><section className="emp-modal" role="dialog" aria-modal="true" aria-labelledby="emp-modal-title"><button className="emp-modal-close" onClick={() => setModal(null)} type="button" aria-label="Close"><i className="bi bi-x-lg"/></button><div className="emp-modal-heading"><div className="emp-title-icon"><i className={`bi ${modal === 'add' ? 'bi-person-plus' : 'bi-pencil-square'}`}/></div><div><h2 id="emp-modal-title">{modal === 'add' ? 'Add Employee' : 'Edit Employee'}</h2><p>{modal === 'add' ? "Enter the employee's information below." : 'Update the employee information below.'}</p></div></div><form noValidate onSubmit={modal === 'add' ? submitAdd : submitEdit} encType="multipart/form-data">{Object.keys((modal === 'add' ? form : editForm).errors).length > 0 && <div className="emp-alert error" role="alert"><strong>Could not save the employee.</strong><span>Please correct the highlighted fields and try again.</span><ul>{Object.entries((modal === 'add' ? form : editForm).errors).map(([field, message]) => <li key={field}>{message}</li>)}</ul></div>}{fields(modal === 'add' ? form : editForm)}<div className="emp-modal-actions"><button type="button" className="emp-cancel" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="emp-add-btn emp-save-button">{modal === 'add' ? 'Add Employee' : 'Save Changes'}</button></div></form></section></div>}
        {modal === 'view' && selected && <div className="emp-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModal(null); }}><section className="emp-modal emp-view-modal" role="dialog" aria-modal="true"><button className="emp-modal-close" onClick={() => setModal(null)} type="button"><i className="bi bi-x-lg"/></button><div className="emp-modal-heading"><div className="emp-title-icon"><i className="bi bi-person-vcard"/></div><div><h2>Employee Details</h2><p>Employee information and current status</p></div></div><div className="emp-detail-grid">{[['Employee ID',selected.employee_id],['Full Name',selected.employee_name || selected.name],['Position',selected.role || selected.roles?.[0]?.name],['Department',selected.department?.department_name],['Email',selected.email],['Status',selected.status],['Date Hired',selected.hire_date]].map(([label,value]) => <div className="emp-detail" key={label}><span>{label}</span><strong>{value || '—'}</strong></div>)}</div><div className="emp-modal-actions"><button type="button" className="emp-cancel" onClick={() => setModal(null)}>Close</button><button type="button" className="emp-add-btn" onClick={() => openEdit(selected)}>Edit Employee</button></div></section></div>}
    </AppLayout>;
}
