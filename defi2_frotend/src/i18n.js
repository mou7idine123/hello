import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// The translations
const resources = {
    fr: {
        translation: {
            header: {
                dashboard: "Tableau de bord",
                logout: "Déconnexion",
                login: "Connexion",
                register: "Créer un compte",
                toggleLang: "عربي",
            },
            dashboard: {
                title: "Mon Espace Donateur",
                backToHome: "Retour à l'accueil",
                totalDonated: "Total donné",
                donationsMade: "Dons effectués",
                familiesHelped: "Familles aidées",
                currentDonations: "Mes dons en cours",
                historyAndImpact: "Historique et Preuves d'impact",
                notifications: "Notifications",
                noCurrentDonations: "Vous n'avez pas de dons en cours.",
                mru: "MRU",
                seeImpactProof: "Voir la preuve d'impact",
                anonymized: "Anonymisé",
                status: {
                    "En attente de virement": "En attente de virement",
                    "Reçu soumis": "Reçu soumis",
                    "Vérifié": "Vérifié",
                    "Remis": "Remis",
                }
            },
            auth: {
                loginTitle: "Connexion Donateur",
                registerTitle: "Inscription Donateur",
                loginGoogle: "Connexion avec Google",
                fullName: "Nom complet",
                fullNamePlaceholder: "Ex: Ali Oumar",
                email: "Email",
                emailPlaceholder: "votre@email.com",
                password: "Mot de passe",
                passwordPlaceholder: "••••••••",
                phone: "Téléphone (optionnel)",
                phonePlaceholder: "+222 XX XX XX XX",
                anonymous: "Je veux rester anonyme lors de mes dons",
                forgotPassword: "Mot de passe oublié ?",
                loading: "Chargement...",
                connectBtn: "Se connecter",
                registerBtn: "Créer mon compte",
            },
            hero: {
                title: "Chaque don transforme une vie",
                subtitle: "La plateforme mauritanienne transparente pour connecter les donateurs aux familles dans le besoin. 100% de vos dons arrivent à destination.",
                startDonating: "Commencer à donner",
                ourImpact: "Notre impact",
                donors: "Donateurs",
                helped: "Familles Aidées",
                collected: "MRU Collectés"
            },
            catalog: {
                title: "Besoins Urgents",
                explore: "Découvrez les familles et les projets qui ont besoin de votre aide aujourd'hui.",
                donate: "Donner",
                collected: "collectés sur"
            },
            validator: {
                title: "Confirmer une remise",
                notification: "Un don de {{amount}} MRU a été vérifié pour votre besoin. Confirmez la remise dans les 24h",
                uploadPhoto: "Uploader la photo",
                uploadDesc: "Photo de la remise (repas, panier...), les visages sont automatiquement floutés par l'app.",
                messageDonor: "Message pour le donneur",
                messageNotice: "Texte libre, court et anonyme.",
                messagePlaceholder: "ex: « 3 familles ont reçu leur panier alimentaire »",
                gpsActive: "GPS automatique",
                gpsNotice: "Localisation de la remise enregistrée automatiquement (avec accord du validateur).",
                confirmBtn: "Confirmer",
                successMsg: "Remise confirmée ! Déclenche l'envoi de la notification au donneur et l'ancrage de la preuve sur Hedera."
            }
        }
    },
    ar: {
        translation: {
            header: {
                dashboard: "لوحة التحكم",
                logout: "تسجيل الخروج",
                login: "تسجيل الدخول",
                register: "إنشاء حساب",
                toggleLang: "FR",
            },
            dashboard: {
                title: "فضاء المتبرع الخاص بي",
                backToHome: "العودة للرئيسية",
                totalDonated: "إجمالي التبرعات",
                donationsMade: "التبرعات المنجزة",
                familiesHelped: "العائلات المستفيدة",
                currentDonations: "تبرعاتي الحالية",
                historyAndImpact: "السجل ودلائل الأثر",
                notifications: "الإشعارات",
                noCurrentDonations: "ليس لديك تبرعات حالية.",
                mru: "أوقية جديدة",
                seeImpactProof: "رؤية دليل الأثر",
                anonymized: "مجهول الهوية",
                status: {
                    "En attente de virement": "في انتظار التحويل",
                    "Reçu soumis": "تم إرسال الوصل",
                    "Vérifié": "تم التحقق",
                    "Remis": "تم التسليم",
                }
            },
            auth: {
                loginTitle: "تسجيل الدخول للمتبرع",
                registerTitle: "تسجيل متبرع جديد",
                loginGoogle: "تسجيل الدخول عبر جوجل",
                fullName: "الاسم الكامل",
                fullNamePlaceholder: "مثال: علي عمر",
                email: "البريد الإلكتروني",
                emailPlaceholder: "البريد الإلكتروني الخاص بك",
                password: "كلمة المرور",
                passwordPlaceholder: "••••••••",
                phone: "رقم الهاتف (اختياري)",
                phonePlaceholder: "+222 XX XX XX XX",
                anonymous: "أريد البقاء مجهول الهوية أثناء التبرع",
                forgotPassword: "هل نسيت كلمة المرور؟",
                loading: "جاري التحميل...",
                connectBtn: "تسجيل الدخول",
                registerBtn: "إنشاء حسابي",
            },
            hero: {
                title: "كل تبرع يغير حياة",
                subtitle: "المنصة الموريتانية الشفافة لربط المتبرعين بالعائلات المحتاجة. 100٪ من تبرعاتك تصل إلى وجهتها.",
                startDonating: "ابدأ التبرع الآن",
                ourImpact: "أثرنا",
                donors: "متبرع",
                helped: "عائلة مستفيدة",
                collected: "أوقية تم جمعها"
            },
            catalog: {
                title: "الاحتياجات العاجلة",
                explore: "اكتشف العائلات والمشاريع التي تحتاج إلى مساعدتك اليوم.",
                donate: "تبرع",
                collected: "جمعت من أصل"
            },
            validator: {
                title: "تأكيد التسليم",
                notification: "تم التحقق من تبرع بقيمة {{amount}} أوقية جديدة لحاجتك. يرجى تأكيد التسليم خلال 24 ساعة.",
                uploadPhoto: "رفع الصورة",
                uploadDesc: "صورة التسليم (وجبة، سلة...). يتم إخفاء الوجوه تلقائيًا بواسطة التطبيق للحفاظ على الكرامة.",
                messageDonor: "رسالة للمتبرع",
                messageNotice: "نص حر، قصير ومجهول.",
                messagePlaceholder: "مثال: « تم تسليم السلال الغذائية لـ 3 عائلات »",
                gpsActive: "تم تفعيل التحديد التلقائي للموقع (GPS)",
                gpsNotice: "يتم تسجيل موقع التسليم تلقائيًا (بموافقة المدقق).",
                confirmBtn: "تأكيد",
                successMsg: "تم تأكيد التسليم! يتم إرسال الإشعار للمتبرع وتوثيق الدليل على Hedera."
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        fallbackLng: 'fr',
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

// Update the body direction based on the language
i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
    document.documentElement.dir = i18n.dir(); // 'rtl' for 'ar', 'ltr' for 'fr'
});

export default i18n;
