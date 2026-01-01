
import React, { useState } from 'react';
import { auth } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { LogIn, Lock, Mail, Activity, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
    onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            onLoginSuccess();
        } catch (err: any) {
            console.error('Login error:', err);
            setError('Credenciales incorrectas o error de conexión.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-overlay">
            <div className="login-card">
                <div className="login-header">
                    <Activity color="#3b82f6" size={32} />
                    <h2>Brake X Admin</h2>
                    <p>Inicia sesión para gestionar el catálogo</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <Mail size={18} className="input-icon" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <Lock size={18} className="input-icon" />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="error-msg">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <button type="submit" className="login-submit" disabled={loading}>
                        {loading ? 'Verificando...' : <><LogIn size={18} /> Entrar al Panel</>}
                    </button>
                </form>
            </div>

            <style>{`
                .login-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: radial-gradient(circle at center, #1e293b, #0a0b10);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                }
                .login-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 3rem;
                    border-radius: 2rem;
                    width: 100%;
                    max-width: 400px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    text-align: center;
                }
                .login-header h2 { font-size: 1.5rem; margin: 1rem 0 0.5rem; color: #fff; }
                .login-header p { color: #9ca3af; font-size: 0.9rem; margin-bottom: 2rem; }
                
                .login-form { display: flex; flex-direction: column; gap: 1.25rem; }
                .input-group { position: relative; }
                .input-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #64748b; }
                .input-group input {
                    width: 100%;
                    padding: 0.85rem 1rem 0.85rem 3rem;
                    background: rgba(0,0,0,0.2);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 1rem;
                    color: #fff;
                    font-size: 1rem;
                    transition: all 0.3s;
                }
                .input-group input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }
                .login-submit {
                    background: #3b82f6;
                    color: #fff;
                    border: none;
                    padding: 1rem;
                    border-radius: 1rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    margin-top: 1rem;
                }
                .login-submit:hover:not(:disabled) { background: #2563eb; transform: translateY(-2px); }
                .login-submit:disabled { opacity: 0.5; cursor: not-allowed; }
                .error-msg {
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.1);
                    padding: 0.75rem;
                    border-radius: 0.75rem;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }
            `}</style>
        </div>
    );
};

export default AdminLogin;
