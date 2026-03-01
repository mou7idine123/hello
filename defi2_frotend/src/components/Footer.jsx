import { Heart, Mail, MapPinned, Phone } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div>
                        <div className="logo" style={{ color: "white", marginBottom: "1rem" }}>
                            <Heart size={28} />
                            IHSAN
                        </div>
                        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", lineHeight: "1.6" }}>
                            Renforcer les communautés avec confiance, transparence et suivi d'impact en temps réel.
                            Restaurer la dignité grâce à une charité vérifiable, bloc par bloc.
                        </p>
                    </div>

                    <div>
                        <h4 className="footer-title">Navigation</h4>
                        <ul className="footer-links">
                            <li><a href="#">À propos</a></li>
                            <li><a href="#needs">Catalogue des besoins</a></li>
                            <li><a href="#">Tableau de bord de transparence publique</a></li>
                            <li><a href="#">Notre réseau de validateurs</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer-title">Contact</h4>
                        <ul className="footer-links" style={{ color: "rgba(255,255,255,0.8)" }}>
                            <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <MapPinned size={16} /> Nouakchott, Mauritanie
                            </li>
                            <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <Mail size={16} /> info@ihsan-platform.com
                            </li>
                            <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <Phone size={16} /> +222 42 55 53 27
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer-title">Réseaux sociaux et partenaires</h4>
                        <ul className="footer-links" style={{ color: "rgba(255,255,255,0.8)" }}>
                            <li><a href="#">Twitter/X</a></li>
                            <li><a href="#">LinkedIn</a></li>
                            <li><a href="#">Facebook</a></li>
                            <li><a href="#">Documentation API</a></li>
                        </ul>
                    </div>
                </div>

                <div className="copyright">
                    &copy; {new Date().getFullYear()} Plateforme de charité transparente IHSAN. Tous droits réservés. <br />
                    Conçu pour une transparence et une efficacité maximales.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
