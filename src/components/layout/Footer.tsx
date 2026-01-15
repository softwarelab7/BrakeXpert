import { Shield } from 'lucide-react';
import '../../styles/footer.css';
import AntigravityLogo from '../common/AntigravityLogo';
// import packageJson from '../../../package.json'; // Removed unused import

const Footer = () => {
    const currentYear = new Date().getFullYear();
    // const version = packageJson.version; // Removed unused variable




    return (
        <footer className="footer-wrapper">
            {/* Visual Decorative Top Line */}
            <div className="footer-accent-line"></div>

            <div className="footer-content footer-unified-content">
                {/* Left Section: Identity & Legal */}
                <div className="footer-left-section">
                    <h2 className="footer-logo">Brake <span className="logo-accent">X</span>pert</h2>
                    {/* Version badge removed per user request */}
                    <div className="copyright-group">
                        <span className="divider">|</span>
                        <p className="copyright">© {currentYear} Brake Xpert Inc.</p>
                    </div>
                </div>

                {/* Right Section: Actions & Credits */}
                <div className="footer-right-section">
                    {/* Contact button removed per user request */}

                    <div className="legal-links">
                        <a href="#admin" className="admin-link" target="_blank" rel="noopener noreferrer">
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
