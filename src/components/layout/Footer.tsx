import { Mail, Shield } from 'lucide-react';
import '../../styles/footer.css';
import AntigravityLogo from '../common/AntigravityLogo';
import packageJson from '../../../package.json';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const version = packageJson.version;


    const handleContactClick = () => {
        window.location.href = 'mailto:contacto@brakehubx.com';
    };

    return (
        <footer className="footer-wrapper">
            {/* Visual Decorative Top Line */}
            <div className="footer-accent-line"></div>

            <div className="footer-content footer-unified-content">
                {/* Left Section: Identity & Legal */}
                <div className="footer-left-section">
                    <h2 className="footer-logo">Brake <span className="logo-accent">X</span>pert</h2>
                    <span className="version-badge">v{version} Beta</span>
                    <div className="copyright-group">
                        <span className="divider">|</span>
                        <p className="copyright">© {currentYear} Brake Xpert Inc.</p>
                    </div>
                </div>

                {/* Right Section: Actions & Credits */}
                <div className="footer-right-section">
                    <button className="contact-btn" onClick={handleContactClick}>
                        <Mail size={12} />
                        <span>Contáctanos</span>
                    </button>

                    <div className="legal-links">
                        <a href="#">Privacidad</a>
                        <span className="dot">·</span>
                        <a href="#admin" className="admin-link">
                            <Shield size={10} />
                            <span>Admin</span>
                        </a>
                    </div>

                    <div className="credits-group">
                        <span className="divider">|</span>
                        <div className="social-info">
                            <span className="social-name">Desarrollada con</span>
                            <AntigravityLogo height={18} color="#8b5cf6" />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
