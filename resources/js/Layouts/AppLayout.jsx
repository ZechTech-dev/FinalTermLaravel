import { Link, usePage } from '@inertiajs/react';

export default function AppLayout({ children, title = 'Dashboard' }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const role = user?.role || user?.roles?.[0]?.name;

    const linkClass = 'side-link';

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="side-top">
                    <div className="profile">
                        <img src="/assets/src/logo.png" alt="ServiSIS Logo" />
                    </div>
                    <div className="brand-info">
                        <span className="logo-text">ServiSIS</span>
                        <span className="logo-subtitle">Staff Information System</span>
                    </div>
                </div>
                <nav className="side-nav">
                    <div className="nav-section-title">MAIN</div>
                    <Link className={linkClass} href={route('dashboard')}> <i className="bi bi-house-door-fill" /> Dashboard</Link>
                    <Link className={linkClass} href={route('attendance.index')}><i className="bi bi-clock-history" /> Attendance</Link>
                    <div className="nav-section-title">MANAGEMENT</div>
                    {role === 'Manager' ? (
                        <>
                            <Link className={linkClass} href={route('attendance.manage')}><i className="bi bi-list-check" /> Attendance List</Link>
                            <Link className={linkClass} href={route('employees.index')}><i className="bi bi-card-checklist" /> Employee List</Link>
                            <Link className={linkClass} href={route('leave-management.index')}><i className="bi bi-calendar2-check" /> Leave Management</Link>
                        </>
                    ) : (
                        <>
                            <Link className={linkClass} href={route('leave.index')}><i className="bi bi-file-earmark-text" /> My Leave Request</Link>
                        </>
                    )}
                    <Link className={linkClass} href={route('logout')} method="post" as="button"><i className="bi bi-box-arrow-right" /> Logout</Link>
                </nav>
                <div className="sidebar-bottom">
                    <img src={user?.profile_picture ? `/storage/${user.profile_picture}` : '/assets/src/default-picture.jpg'} alt="" />
                    <span>{user?.employee_name || user?.name}</span>
                </div>
            </aside>
            <main className="main-content">
                <header className="page-header"><h1>{title}</h1></header>
                {children}
            </main>
        </div>
    );
}
