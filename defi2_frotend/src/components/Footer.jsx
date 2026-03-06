import { Heart, Mail, MapPinned, Phone } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div>
                        <div className="logo mb-6" style={{ color: "white" }}>
                            <Heart size={24} strokeWidth={3} fill="var(--primary)" />
                            <span>IHSAN</span>
                        </div>
                        <p className="max-w-xs text-sm leading-relaxed opacity-60">
                            Renforcer les communautés avec confiance, transparence et suivi d'impact en temps réel.
                            Restaurer la dignité grâce à une charité vérifiable, bloc par bloc.
                        </p>
                    </div>

                    <div>
                        <h4 className="footer-title">Navigation</h4>
                        <ul className="footer-links">
                            <li><a href="#">À propos</a></li>
                            <li><a href="#needs">Catalogue des besoins</a></li>
                            <li><a href="#">Transparence Publique</a></li>
                            <li><a href="#">Réseau de Validateurs</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer-title">Contact</h4>
                        <ul className="footer-links opacity-80">
                            <li className="gap-3">
                                <MapPinned size={16} className="text-primary" />
                                <span className="text-sm">Nouakchott, Mauritanie</span>
                            </li>
                            <li className="gap-3">
                                <Mail size={16} className="text-primary" />
                                <span className="text-sm">info@ihsan-platform.com</span>
                            </li>
                            <li className="gap-3">
                                <Phone size={16} className="text-primary" />
                                <span className="text-sm">+222 42 55 53 27</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer-title">Réseaux Sociaux</h4>
                        <ul className="footer-links opacity-80">
                            <li><a href="#">Twitter / X</a></li>
                            <li><a href="#">LinkedIn</a></li>
                            <li><a href="#">Facebook</a></li>
                            <li><a href="#">Documentation API</a></li>
                        </ul>
                    </div>
                </div>

                <div className="copyright">
                    <p>&copy; {new Date().getFullYear()} IHSAN Transparent Charity Platform. Tous droits réservés.</p>
                    <p className="mt-1 opacity-50 tracking-tighter flex items-center justify-center gap-2">
                        <span>Developed by <strong className="text-white opacity-100">PixelCraft</strong></span>
                        <span className="opacity-20">|</span>
                        <span>Powered by Blockchain Transparency Engine</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
