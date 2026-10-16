import { useForm, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Pagination from '../../Components/Pagination';

export default function Index({ employees, departments, filters }) {
    const form = useForm({
        employee_id: '', employee_name: '', email: '', role: 'Employee',
        department_id: departments?.[0]?.department_id || '', status: 'Active',
        hire_date: '', password: '', profile_picture: null,
    });

    function submit(event) {
        event.preventDefault();
        form.post(route('employees.store'), { forceFormData: true, onSuccess: () => form.reset() });
    }

    return (
        <AppLayout title="Employee Management">
            <section className="page-content">
                <form onSubmit={submit} className="employee-form" encType="multipart/form-data">
                    <h2>Add Employee</h2>
                    <div className="form-grid">
                        <label>Employee ID<input value={form.data.employee_id} onChange={e => form.setData('employee_id', e.target.value)} />{form.errors.employee_id && <small>{form.errors.employee_id}</small>}</label>
                        <label>Full Name<input value={form.data.employee_name} onChange={e => form.setData('employee_name', e.target.value)} />{form.errors.employee_name && <small>{form.errors.employee_name}</small>}</label>
                        <label>Email<input type="email" value={form.data.email} onChange={e => form.setData('email', e.target.value)} />{form.errors.email && <small>{form.errors.email}</small>}</label>
                        <label>Position / Role<select value={form.data.role} onChange={e => form.setData('role', e.target.value)}><option>Employee</option><option>Manager</option></select></label>
                        <label>Department<select value={form.data.department_id} onChange={e => form.setData('department_id', e.target.value)}>{departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}</select></label>
                        <label>Status<select value={form.data.status} onChange={e => form.setData('status', e.target.value)}><option>Active</option><option>Inactive</option></select></label>
                        <label>Date Hired<input type="date" value={form.data.hire_date} onChange={e => form.setData('hire_date', e.target.value)} /></label>
                        <label>Temporary Password<input type="password" value={form.data.password} onChange={e => form.setData('password', e.target.value)} />{form.errors.password && <small>{form.errors.password}</small>}</label>
                        <label>Profile Picture<input type="file" accept=".jpg,.jpeg,.png" onChange={e => form.setData('profile_picture', e.target.files[0])} /></label>
                    </div>
                    <button type="submit" disabled={form.processing}>Add Employee</button>
                </form>
                <h2>Employee List</h2>
                <form onSubmit={e => { e.preventDefault(); router.get(route('employees.index'), { search: e.currentTarget.search.value }); }}>
                    <input name="search" defaultValue={filters?.search || ''} placeholder="Search employees..." />
                    <button type="submit">Search</button>
                </form>
                <div className="table-wrap"><table><thead><tr><th>Employee ID</th><th>Full Name</th><th>Department</th><th>Email</th><th>Status</th><th>Date Hired</th></tr></thead>
                    <tbody>{employees.data.map(employee => <tr key={employee.id}><td>{employee.employee_id}</td><td>{employee.employee_name}</td><td>{employee.department?.department_name || '-'}</td><td>{employee.email}</td><td>{employee.status}</td><td>{employee.hire_date || '-'}</td></tr>)}</tbody>
                </table></div>
                <Pagination links={employees.links} />
            </section>
        </AppLayout>
    );
}
