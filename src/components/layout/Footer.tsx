import '../../styles/footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container">
                <p className="footer-powered">
                    Impulsado por:{' '}
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link"
                    >
                        GitHub
                    </a>
                    {' | '}
                    <a
                        href="https://gemini.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link"
                    >
                        Gemini
                    </a>
                </p>
                <p className="footer-copyright">
                    © {currentYear} Brake X. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
