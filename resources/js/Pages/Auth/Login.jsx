import { useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({ employee_id: '', password: '', remember: false });

    function submit(event) {
        event.preventDefault();
        post(route('login'));
    }

    return (
        <main className="login-page">
            <form className="login-card" onSubmit={submit}>
                <img src="/assets/src/logo.png" alt="ServiSIS Logo" />
                <h1>ServiSIS</h1>
                <p>Staff Information System</p>
                <label htmlFor="employee_id">Employee ID</label>
                <input id="employee_id" value={data.employee_id} onChange={event => setData('employee_id', event.target.value)} placeholder="24-0787" autoComplete="username" />
                {errors.employee_id && <p className="error">{errors.employee_id}</p>}
                <label htmlFor="password">Password</label>
                <input id="password" type="password" value={data.password} onChange={event => setData('password', event.target.value)} autoComplete="current-password" />
                {errors.password && <p className="error">{errors.password}</p>}
                <label><input type="checkbox" checked={data.remember} onChange={event => setData('remember', event.target.checked)} /> Remember me</label>
                <button type="submit" disabled={processing}>Sign In</button>
                <a href={route('password.request')}>Forgot password?</a>
            </form>
        </main>
    );
}
