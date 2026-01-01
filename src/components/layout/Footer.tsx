import { Github, Zap, Shield, ArrowUpRight, Mail } from 'lucide-react';
import '../../styles/footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer-wrapper">
            {/* Visual Decorative Top Line */}
            <div className="footer-accent-line"></div>

            <div className="footer-content">
                {/* 1. Brand & Vision Column */}
                <div className="footer-brand-section">
                    <div className="brand-header">
                        <h2 className="footer-logo">Brake X</h2>
                        <span className="version-badge">v1.2 Beta</span>
                    </div>
                    <p className="footer-description">
                        Redefiniendo la búsqueda de autopartes.
                        Precisión técnica y velocidad para profesionales.
                    </p>
                    <button className="contact-btn">
                        <Mail size={16} />
                        <span>Contáctanos</span>
                    </button>
                </div>

                {/* 2. Quick Navigation */}
                <div className="footer-links-column">
                    <h4 className="column-title">Explorar</h4>
                    <nav className="footer-nav">
                        <a href="#" className="nav-item">Catálogo Completo</a>
                        <a href="#" className="nav-item">Comparador Técnico</a>
                        <a href="#" className="nav-item">Historial de Búsqueda</a>
                        <a href="#" className="nav-item">Documentación API</a>
                    </nav>
                </div>

                {/* 3. Connect / Social */}
                <div className="footer-social-column">
                    <h4 className="column-title">Powered By</h4>
                    <div className="social-cards">
                        <a href="#" className="social-card featured">
                            <div className="icon-box"><Zap size={20} /></div>
                            <div className="social-info">
                                <span className="social-name">Antigravity</span>
                                <span className="social-sub">Next-Gen AI Agent</span>
                            </div>
                            <ArrowUpRight size={16} className="arrow-icon" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="footer-bar">
                <div className="bar-content">
                    <p className="copyright">© {currentYear} Brake X Inc. Todos los derechos reservados.</p>
                    <div className="legal-links">
                        <a href="#">Privacidad</a>
                        <span className="dot">·</span>
                        <a href="#">Términos</a>
                        <span className="dot">·</span>
                        <a href="#">Sitemap</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
