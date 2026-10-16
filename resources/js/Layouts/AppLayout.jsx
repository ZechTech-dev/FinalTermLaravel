import { Head, Link, usePage } from '@inertiajs/react';

export default function AppLayout({ children, title = 'Dashboard' }) {
    const page = usePage();
    const { auth, flash } = page.props;

    const user = auth?.user;
    const role = user?.role;
    const path = (page.url || '').split('?')[0];
    const active = (p) => (path === p || path.startsWith(p + '/') ? 'active' : '');

    const picture = !user?.profile_picture || user.profile_picture === 'default-picture.jpg'
        ? '/assets/src/default-picture.jpg'
        : `/storage/${user.profile_picture}`;

    return (
        <>
            <Head title={title} />

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

                <div className="wrapper">
                    <nav className="side-nav">
                        <div className="navigation">
                            <div className="nav-section-title">MAIN</div>

                            <Link href={route('dashboard')} className={active('/dashboard')}>
                                <i className="bi bi-house-door-fill"></i>
                                <span>Dashboard</span>
                            </Link>

                            {role === 'Employee' && (
                                <Link href={route('attendance.index')} className={active('/attendance')}>
                                    <i className="bi bi-clock-history"></i>
                                    <span>Attendance</span>
                                </Link>
                            )}

                            <div className="nav-section-title">MANAGEMENT</div>

                            {role === 'Manager' && (
                                <>
                                    <Link href={route('attendance.manage')} className={active('/attendance-management')}>
                                        <i className="bi bi-list-check"></i>
                                        <span>Attendance List</span>
                                    </Link>
                                    <Link href={route('employees.index')} className={active('/employees')}>
                                        <i className="bi bi-card-checklist"></i>
                                        <span>Employee List</span>
                                    </Link>
                                    <Link href={route('leave-management.index')} className={active('/leave-management')}>
                                        <i className="bi bi-calendar2-check"></i>
                                        <span>Leave Management</span>
                                    </Link>
                                </>
                            )}

                            {role === 'Employee' && (
                                <Link href={route('leave.index')} className={active('/leave')}>
                                    <i className="bi bi-file-earmark-text"></i>
                                    <span>My Leave Request</span>
                                </Link>
                            )}
                        </div>
                    </nav>

                    <div className="sidebar-city">
                        <img src="/assets/src/bg.png" alt="" />
                    </div>

                    <div className="sidebar-bottom">
                        <div className="user-info">
                            <div className="profile">
                                <img src={picture} alt="Profile" />
                            </div>
                            <div className="user-details">
                                <h6>{user?.employee_name || user?.name}</h6>
                                <small>{role}</small>
                            </div>
                        </div>

                        <Link href={route('logout')} method="post" as="button" className="logout-btn">
                            <i className="bi bi-box-arrow-left"></i>
                            <span>Logout</span>
                        </Link>
                    </div>
                </div>
            </aside>

            <header className="main-header">
                <div className="servisis-page-heading">
                    <h1>{title}</h1>
                    <span>Staff Information System</span>
                </div>
            </header>

            <main className="content">
                {flash?.success && <div className="flash success">{flash.success}</div>}
                {flash?.error && <div className="flash error">{flash.error}</div>}

                {children}

                <footer className="app-footer">
                    <div className="footer-brand">
                        <div className="footer-icon"><i className="bi bi-shield-check"></i></div>
                        <div className="footer-brand-text">
                            <span className="footer-copy">&copy; {new Date().getFullYear()} ServiSIS</span>
                            <span className="footer-tagline">Staff Information System</span>
                        </div>
                    </div>
                    <div className="footer-credits">
                        <span className="footer-credits-label">Developed by</span>
                        <div className="footer-names">
                            <div className="footer-name"><div className="footer-avatar">JM</div><span>Jer Zechariah Madriaga</span></div>
                            <div className="footer-name"><div className="footer-avatar">KM</div><span>Princess Katheleen Misa</span></div>
                            <div className="footer-name"><div className="footer-avatar">DG</div><span>Denisse Sharlyne Galit</span></div>
                        </div>
                    </div>
                </footer>
            </main>
        </>
    );
}
