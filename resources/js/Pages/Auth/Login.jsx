import { Head, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        employee_id: '',
        password: '',
    });

    function submit(event) {
        event.preventDefault();
        post(route('login.store'), {
            onFinish: () => setData('password', ''),
        });
    }

    const errorMessage = errors.employee_id || errors.password;

    return (
        <div className="login-root">
            <Head title="Login" />
            <div className="wrapper">
                <div className="LPanel">
                    <h1 className="brand-name">ServiSIS</h1>
                    <img src="/assets/src/logo.png" alt="ServiSIS Logo" className="panel-logo" />
                    <h2 className="welcome">Welcome Back!</h2>
                    <div className="divider"></div>
                    <h1 className="system-title">Staff Information System</h1>
                    <p>Sign in to access the system</p>
                </div>

                <div className="RPanel">
                    <div className="extra-design">
                        <span className="yes-i">
                            <i className="bi bi-person-fill"></i>
                            <span>Employee Portal</span>
                        </span>
                        <h1>Login</h1>
                        <p>Enter your correct credentials to continue</p>
                    </div>

                    <form className="login-page" onSubmit={submit}>
                        <div className="input-id">
                            <label htmlFor="employee_id">Employee ID</label>
                            <div className="inputs">
                                <input
                                    type="text"
                                    id="employee_id"
                                    value={data.employee_id}
                                    onChange={e => setData('employee_id', e.target.value)}
                                    placeholder="Ex. 24-0787"
                                    autoComplete="off"
                                    autoFocus
                                />
                            </div>

                            <label htmlFor="password">Password</label>
                            <div className="inputs">
                                <input
                                    type="password"
                                    id="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />
                            </div>

                            {errorMessage && (
                                <div className="session-error">
                                    <i className="bi bi-x-circle-fill"></i>
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            <button type="submit" className="login-btn" disabled={processing}>
                                {processing ? 'Signing in...' : 'Login'}
                            </button>
                        </div>
                    </form>

                    <div className="security-box">
                        <div className="security-icon">
                            <i className="bi bi-shield-lock-fill"></i>
                        </div>
                        <div className="security-content">
                            <h4>Secure Login</h4>
                            <p>
                                This portal is intended only for authorized employees.
                                Unauthorized access is strictly prohibited.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
