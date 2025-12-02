const TRANSLATIONS = {
    es: {
        // Auth
        auth_title: "Everyday English AI",
        auth_subtitle: "Tu tutor personal de inglés con IA",
        btn_login: "Iniciar Sesión",
        btn_register: "Registrarse",
        auth_email_placeholder: "Correo electrónico",
        auth_password_placeholder: "Contraseña",
        auth_no_account: "¿No tienes cuenta? Regístrate",
        auth_has_account: "¿Ya tienes cuenta? Inicia sesión",

        // API Modal
        api_modal_title: "Configuración de API Key",
        api_tab_free: "GRATIS",
        api_tab_premium: "PREMIUM",
        api_free_desc: "Introduce tu API Key de Google Gemini. Se guarda localmente.",
        api_get_key: "Consigue una key gratis aquí",
        api_security_note: "Tu API Key se almacena localmente en tu navegador. Nunca se envía a nuestros servidores.",
        btn_start_learning: "Empezar a Aprender",
        btn_offline_mode: "Lo haré más tarde (modo offline)",

        // Home
        home_welcome: "¡Bienvenido de nuevo!",
        home_subtitle: "¿Listo para mejorar tu inglés hoy?",
        btn_generate: "Generar Nuevo Tema",

        // Generator
        gen_title: "Generador de Temas",
        gen_difficulty_label: "Nivel de Dificultad",
        gen_topic_label: "Especificar un tema personalizado (Opcional)",
        gen_topic_placeholder: "ej. Pedir café, Entrevista de trabajo",
        btn_generate_action: "Generar",
        gen_loading: "Generando contenido...",
        result_context: "Contexto en Español",
        result_dialogue: "Diálogo en Inglés",
        result_glossary: "Glosario",

        // Dictionary
        dict_title: "Diccionario",
        dict_search_placeholder: "Buscar palabras...",
        dict_empty: "No hay palabras guardadas todavía.",

        // Challenge
        challenge_title: "Modo Desafío",
        challenge_desc: "Escribe una frase o párrafo en inglés (o español) y recibe correcciones.",
        challenge_placeholder: "Escribe aquí...",
        challenge_btn: "Comprobar Texto",
        challenge_loading: "Analizando texto...",

        // Profile
        profile_title: "Mi Perfil",
        profile_plan: "Plan Actual",
        profile_stats: "Estadísticas",
        stat_words: "Palabras",
        stat_topics: "Temas",
        profile_edit: "Editar Perfil",
        profile_logout: "Cerrar Sesión",

        // Settings
        settings_title: "Ajustes",
        settings_api: "Gestión de API Key",
        settings_language: "Idioma de la Interfaz",
        settings_reset: "Restablecer API Key",
        settings_data: "Gestión de Datos",
        settings_clear: "Borrar Todos los Datos",

        // Navigation
        nav_home: "Inicio",
        nav_generator: "Generador",
        nav_challenge: "Desafío",
        nav_dictionary: "Diccionario",
        nav_profile: "Perfil",
        nav_settings: "Ajustes",

        // Plans
        plan_free: "Gratis",
        plan_premium: "Premium",
        plan_offline: "Modo Offline"
    },
    en: {
        // Auth
        auth_title: "Everyday English AI",
        auth_subtitle: "Your personal AI English Tutor",
        btn_login: "Login",
        btn_register: "Register",
        auth_email_placeholder: "Email address",
        auth_password_placeholder: "Password",
        auth_no_account: "No account? Register",
        auth_has_account: "Already have an account? Login",

        // API Modal
        api_modal_title: "API Key Setup",
        api_tab_free: "FREE",
        api_tab_premium: "PREMIUM",
        api_free_desc: "Enter your Google Gemini API Key. Stored locally.",
        api_get_key: "Get a free key here",
        api_security_note: "Your API Key is stored locally in your browser. It is never sent to our servers.",
        btn_start_learning: "Start Learning",
        btn_offline_mode: "I'll do it later (offline mode)",

        // Home
        home_welcome: "Welcome back!",
        home_subtitle: "Ready to improve your English today?",
        btn_generate: "Generate New Topic",

        // Generator
        gen_title: "Topic Generator",
        gen_difficulty_label: "Difficulty Level",
        gen_topic_label: "Specify a custom topic (Optional)",
        gen_topic_placeholder: "e.g., Ordering coffee, Job interview",
        btn_generate_action: "Generate",
        gen_loading: "Generating content...",
        result_context: "Spanish Context",
        result_dialogue: "English Dialogue",
        result_glossary: "Glossary",

        // Dictionary
        dict_title: "Dictionary",
        dict_search_placeholder: "Search words...",
        dict_empty: "No words saved yet.",

        // Challenge
        challenge_title: "Challenge Mode",
        challenge_desc: "Write a sentence or paragraph in English (or Spanish) and get corrections.",
        challenge_placeholder: "Write here...",
        challenge_btn: "Check Text",
        challenge_loading: "Analyzing text...",

        // Profile
        profile_title: "My Profile",
        profile_plan: "Current Plan",
        profile_stats: "Statistics",
        stat_words: "Words",
        stat_topics: "Topics",
        profile_edit: "Edit Profile",
        profile_logout: "Logout",

        // Settings
        settings_title: "Settings",
        settings_api: "API Key Management",
        settings_language: "Interface Language",
        settings_reset: "Reset API Key",
        settings_data: "Data Management",
        settings_clear: "Clear All Saved Data",

        // Navigation
        nav_home: "Home",
        nav_generator: "Generator",
        nav_challenge: "Challenge",
        nav_dictionary: "Dictionary",
        nav_profile: "Profile",
        nav_settings: "Settings",

        // Plans
        plan_free: "Free",
        plan_premium: "Premium",
        plan_offline: "Offline Mode"
    }
};

const LanguageService = {
    currentLang: 'es', // Default

    init() {
        // 1. Detect Language
        const savedLang = localStorage.getItem('app_language');
        if (savedLang) {
            this.currentLang = savedLang;
        } else {
            const browserLang = navigator.language || navigator.userLanguage;
            if (browserLang.startsWith('en')) {
                this.currentLang = 'en';
            } else {
                this.currentLang = 'es';
            }
        }

        // 2. Apply Language
        this.updateDOM();

        // 3. Update Selector if exists
        const selector = document.getElementById('languageSelector');
        if (selector) {
            selector.value = this.currentLang;
            selector.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
        }

        console.log('LanguageService initialized:', this.currentLang);
    },

    changeLanguage(lang) {
        if (!TRANSLATIONS[lang]) return;
        this.currentLang = lang;
        localStorage.setItem('app_language', lang);
        this.updateDOM();
    },

    getText(key) {
        return TRANSLATIONS[this.currentLang][key] || key;
    },

    updateDOM() {
        document.documentElement.lang = this.currentLang;

        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = this.getText(key);

            // Handle placeholders for inputs
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = text;
            } else {
                el.textContent = text;
            }
        });
    }
};

window.LanguageService = LanguageService;
