import AppLayout from '../Layouts/AppLayout';
import { usePage } from '@inertiajs/react';

export default function Dashboard({ stats, timeIn }) {
    const { auth } = usePage().props;
    const name = auth.user.employee_name || auth.user.name;

    return (
        <AppLayout title="Dashboard">
            <section className="page-content">
                <h2>Welcome, {name}</h2>
                <p>{timeIn ? `You timed in today at ${timeIn}.` : 'You have not timed in today.'}</p>
                <div className="stats-grid">
                    {Object.entries(stats).map(([label, value]) => (
                        <div className="stat-card" key={label}>
                            <span>{label}</span>
                            <strong>{value}</strong>
                        </div>
                    ))}
                </div>
            </section>
        </AppLayout>
    );
}