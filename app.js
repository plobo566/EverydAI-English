// State Management
let state = {
    apiKey: null,
    dictionary: [],
    language: 'es',
    currentGlossary: [],
    topicsCount: 0
};

try {
    state = {
        apiKey: (window.GeminiService && window.GeminiService.getFreeKey()) || null,
        dictionary: JSON.parse(localStorage.getItem('english_dictionary')) || [],
        language: localStorage.getItem('app_language') || 'es', // Default to Spanish or load from storage
        currentGlossary: [], // Store current session glossary
        topicsCount: parseInt(localStorage.getItem('topics_count')) || 0
    };
} catch (e) {
    console.error('Error initializing state (likely localStorage access denied):', e);
}

// Translations
const translations = {
    es: {
        nav_home: "Inicio",
        nav_generator: "Generador",
        nav_challenge: "Modo Desafío",
        nav_dictionary: "Diccionario",
        nav_settings: "Configuración",
        nav_profile: "Perfil",
        home_welcome: "¡Bienvenido de nuevo!",
        home_subtitle: "¿Listo para mejorar tu inglés hoy?",
        btn_generate: "Generar Nuevo Tema",
        gen_title: "Generador de Temas",
        gen_topic_label: "Tema (Opcional)",
        gen_difficulty_label: "Nivel de Dificultad:",
        btn_generate_action: "Generar",
        result_context: "Contexto en Español",
        result_dialogue: "Diálogo en Inglés",
        result_glossary: "Glosario",
        gen_topic_toggle: "Especificar un tema personalizado (Opcional)",
        gen_loading: "Generando contenido...",
        challenge_title: "Modo Desafío",
        challenge_desc: "Escribe una frase o párrafo en inglés (o español) y recibe correcciones.",
        challenge_placeholder: "Escribe aquí...",
        challenge_btn: "Comprobar Texto",
        challenge_loading: "Analizando texto...",
        dict_title: "Mi Diccionario",
        dict_desc: "Palabras que has guardado.",
        settings_title: "Ajustes",
        settings_api: "Gestión de API Key",
        settings_reset: "Restablecer API Key",
        settings_data: "Gestión de Datos",
        settings_clear: "Borrar Todos los Datos",
        stat_words: "Palabras",
        stat_topics: "Temas",
        stat_streak: "Racha",
        profile_edit: "Editar Perfil",
        profile_logout: "Cerrar Sesión"
    },
    en: {
        nav_home: "Home",
        nav_generator: "Generator",
        nav_challenge: "Challenge Mode",
        nav_dictionary: "Dictionary",
        nav_settings: "Settings",
        nav_profile: "Profile",
        home_welcome: "Welcome back!",
        home_subtitle: "Ready to improve your English today?",
        btn_generate: "Generate New Topic",
        gen_title: "Topic Generator",
        gen_topic_label: "Topic (Optional)",
        gen_difficulty_label: "Difficulty Level:",
        btn_generate_action: "Generate",
        result_context: "Spanish Context",
        result_dialogue: "English Dialogue",
        result_glossary: "Glossary",
        gen_topic_toggle: "Specify a custom topic (Optional)",
        gen_loading: "Generating content...",
        challenge_title: "Challenge Mode",
        challenge_desc: "Write a sentence or paragraph in English (or Spanish) and get corrections.",
        challenge_placeholder: "Write here...",
        challenge_btn: "Check Text",
        challenge_loading: "Analyzing text...",
        dict_title: "My Dictionary",
        dict_desc: "Words you've saved.",
        settings_title: "Settings",
        settings_api: "API Key Management",
        settings_reset: "Reset API Key",
        settings_data: "Data Management",
        settings_clear: "Clear All Saved Data",
        stat_words: "Words",
        stat_topics: "Topics",
        stat_streak: "Streak",
        profile_edit: "Edit Profile",
        profile_logout: "Sign Out"
    }
};

// DOM Elements
// DOM Elements will be selected inside setup functions or DOMContentLoaded
let views = {};
let navLinks;
let apiKeyModal;
let apiKeyInput;
let saveApiKeyBtn;
let apiKeyError;
let languageSelector;

// Initialization
// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    views = {
        home: document.getElementById('home'),
        generator: document.getElementById('generator'),
        challenge: document.getElementById('challenge'),
        dictionary: document.getElementById('dictionary'),
        settings: document.getElementById('settings'),
        profile: document.getElementById('profile')
    };
    navLinks = document.querySelectorAll('.nav-links li');
    apiKeyModal = document.getElementById('apiKeyModal');
    apiKeyInput = document.getElementById('apiKeyInput');
    saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
    apiKeyError = document.getElementById('apiKeyError');
    languageSelector = document.getElementById('languageSelector');

    checkApiKey();
    setupNavigation();
    setupGenerator();
    setupChallenge();
    setupDictionary();
    setupSettings();
    setupSettings();
    // setupLanguage(); // Removed, handled by i18n.js
    setupParallax();
    setupParallax();
    setupTopicToggle();
    setupStarRating(); // Initialize star rating
    setupStarRating(); // Initialize star rating
    setupAuth(); // Initialize Auth
    setupPayment(); // Initialize Payment
});

function setupPayment() {
    // 1. Button Listener
    const premiumBtn = document.getElementById('usePremiumBtn');
    if (premiumBtn) {
        premiumBtn.addEventListener('click', () => {
            if (window.PaymentService) {
                window.PaymentService.startPremiumCheckout();
            } else {
                console.error('PaymentService not loaded');
            }
        });
    }

    // 2. Check for Payment Success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
        showToast('¡Gracias por suscribirte! Tu cuenta ahora es Premium.', 'success');

        // Remove query param to clean URL
        window.history.replaceState({}, document.title, window.location.pathname);

        // Force refresh session to get updated premium status
        if (window.AuthService) {
            window.AuthService.getCurrentUser().then(user => {
                if (user) {
                    // UI update will happen automatically via onAuthStateChange or we can force it
                    // But getCurrentUser already updates localStorage and we might need to trigger UI update
                    // Let's manually trigger UI update just in case
                    PremiumManager.updateUI();
                }
            });
        }
    }
}

// --- Auth Logic (SPA Flow) ---
function setupAuth() {
    console.log('setupAuth running...');
    const authScreen = document.getElementById('auth-screen');
    const appScreen = document.getElementById('app-screen');

    const form = document.getElementById('authForm');
    const emailInput = document.getElementById('authEmail');
    const passwordInput = document.getElementById('authPassword');
    const submitBtn = document.getElementById('authSubmitBtn');
    const errorMsg = document.getElementById('authError'); // Legacy, keep for now or remove if unused
    const authErrorDiv = document.getElementById('auth-error-message'); // New dedicated error container
    const successMsg = document.getElementById('authMessage');
    const tabs = document.querySelectorAll('.auth-tab');
    const signOutBtn = document.getElementById('signOutBtn');

    let isLoginMode = true;

    // Initial Auth Check
    if (window.AuthService) {
        checkUserSession();
    } else {
        console.error('AuthService not available - likely due to file:// protocol restrictions or script loading error.');
        // Fallback: Show auth screen and maybe disable features that require auth, or mock it for testing
        // For now, we just ensure the UI is interactive even if Auth fails
    }

    async function checkUserSession() {
        try {
            const user = await window.AuthService.getCurrentUser();
            if (user) {
                showApp();
                updateAuthUI(user);
            } else {
                showAuth();
            }
        } catch (error) {
            console.error('Error checking user session:', error);
            showAuth();
        }
    }

    function showApp() {
        authScreen.style.display = 'none';
        appScreen.style.display = 'block';
    }

    function showAuth() {
        authScreen.style.display = 'flex';
        appScreen.style.display = 'none';
    }

    // Tab Switching (Handled by inline script in index.html)
    // We listen for the custom event to update internal state
    document.addEventListener('auth-mode-change', (e) => {
        const mode = e.detail.mode;
        isLoginMode = mode === 'login';
        console.log('Auth mode changed to:', mode);

        // UI is already updated by inline script, but we ensure state is synced
        if (errorMsg) errorMsg.textContent = '';
        if (authErrorDiv) authErrorDiv.textContent = '';
        successMsg.textContent = '';
    });

    // Form Submission
    if (form) {
        console.log('Auth form found, attaching listener');
        form.addEventListener('submit', async (e) => {
            console.log('Auth form submitted');
            e.preventDefault();

            const email = emailInput.value;
            const password = passwordInput.value;
            // console.log('Form values:', { email, password: '***', isLoginMode });

            if (errorMsg) errorMsg.textContent = '';
            if (authErrorDiv) authErrorDiv.textContent = '';
            successMsg.textContent = '';
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';

            try {
                if (!window.AuthService) {
                    throw new Error('AuthService is not available');
                }

                let result;
                if (isLoginMode) {
                    console.log('Attempting SignIn...');
                    result = await window.AuthService.signIn(email, password);
                } else {
                    console.log('Attempting SignUp...');
                    result = await window.AuthService.signUp(email, password);
                }
                console.log('Auth Result:', result);

                if (result.error) {
                    throw result.error;
                }

                if (!isLoginMode && result.data?.user && !result.data.session) {
                    // Registration successful but email confirmation needed (if enabled)
                    console.log('Registration successful, waiting for confirmation');
                    successMsg.textContent = 'Registration successful! Please check your email.';
                } else {
                    // Login/Registration successful
                    console.log('Auth successful, redirecting...');
                    successMsg.textContent = isLoginMode ? 'Login successful!' : 'Registration successful!';

                    // Delay to show message
                    setTimeout(() => {
                        form.reset();
                        showApp();
                        showToast(isLoginMode ? 'Logged in successfully!' : 'Welcome!', 'success');
                    }, 1500);
                }

            } catch (error) {
                console.error('Auth Error caught:', error);
                const message = error.message || 'Authentication failed';

                // Translate common errors
                let displayMessage = message;
                if (message.includes('Password should be at least 6 characters')) {
                    displayMessage = 'La contraseña debe tener al menos 6 caracteres.';
                } else if (message.includes('Invalid login credentials')) {
                    displayMessage = 'Credenciales inválidas. Verifica tu email y contraseña.';
                } else if (message.includes('User already registered')) {
                    displayMessage = 'El usuario ya está registrado.';
                }

                if (authErrorDiv) {
                    authErrorDiv.textContent = displayMessage;
                } else if (errorMsg) {
                    errorMsg.textContent = displayMessage;
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = isLoginMode ? 'Login' : 'Register';
            }
        });
    } else {
        console.error('Auth form NOT found');
    }

    // Sign Out
    if (signOutBtn) {
        signOutBtn.addEventListener('click', async () => {
            const { error } = await window.AuthService.signOut();
            if (!error) {
                // Use Manager to reset status and UI
                PremiumManager.setStatus(false);

                showAuth();
                showToast('Signed out successfully', 'success');
            } else {
                showToast('Error signing out', 'error');
            }
        });
    }
    // Auth State Listener (Real-time)
    if (window.AuthService) {
        window.AuthService.onAuthStateChange(async (event, session) => {
            console.log('Auth State Change:', event, session);
            if (session) {
                const user = session.user;
                updateAuthUI(user);
                showApp();

                // --- Vocabulary Migration & Loading ---

                // 1. Check for local words to migrate
                const localDict = localStorage.getItem('english_dictionary');
                if (localDict) {
                    try {
                        const words = JSON.parse(localDict);
                        if (words.length > 0) {
                            showToast('Syncing your words to the cloud...', 'info');
                            for (const w of words) {
                                // Add to cloud (ignore errors/duplicates silently for now)
                                await window.VocabularyService.addWord(w.word, w.def, w.trans);
                            }
                            localStorage.removeItem('english_dictionary'); // Clear after sync
                            showToast('Words synced successfully!', 'success');
                        }
                    } catch (e) {
                        console.error('Migration error', e);
                    }
                }

                // 2. Load Words from Cloud
                const { data, error } = await window.VocabularyService.getWords();
                if (data) {
                    // Map Supabase structure to App structure
                    state.dictionary = data.map(item => ({
                        id: item.id,
                        word: item.word,
                        def: item.definition.split(' [')[0], // Extract pure def if we appended pron
                        trans: item.context,
                        pron: item.definition.match(/\[(.*?)\]/)?.[1] || '' // Extract pron if present
                    }));
                    renderDictionary();
                    updateStats();
                }

            } else {
                // Logout
                showAuth();
                state.dictionary = []; // Clear local state
                renderDictionary(); // Clear UI
                updateStats();
            }
        });
    }
}

// --- Premium Manager ---
const PremiumManager = {
    get isPremium() {
        return localStorage.getItem('is_premium') === 'true';
    },

    setStatus(isPremium) {
        localStorage.setItem('is_premium', isPremium);
        this.updateUI();
    },

    updateUI() {
        const isPremium = this.isPremium;
        const isTrial = typeof state !== 'undefined' && state.isTrialMode;

        // 1. Top Bar Indicator
        const indicator = document.getElementById('planIndicator');
        if (indicator) {
            if (isTrial) {
                indicator.style.background = '#6B7280'; // Grey
                indicator.style.color = '#fff';
                indicator.innerHTML = '<i class="fa-solid fa-plane-slash"></i> OFFLINE MODE';
            } else if (isPremium) {
                indicator.style.background = 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
                indicator.style.color = '#fff';
                indicator.innerHTML = '<i class="fa-solid fa-crown"></i> Premium';
            } else {
                indicator.style.background = '#E5E7EB';
                indicator.style.color = '#374151';
                indicator.innerHTML = '<i class="fa-solid fa-leaf"></i> Free';
            }
        }

        // 2. Profile Page Badge
        const profileBadge = document.getElementById('profilePlanBadge');
        if (profileBadge) {
            if (isTrial) {
                profileBadge.textContent = 'Offline Mode';
                profileBadge.style.background = '#6B7280';
                profileBadge.style.color = '#fff';
                profileBadge.style.border = 'none';
            } else if (isPremium) {
                profileBadge.textContent = 'Premium Plan';
                profileBadge.style.background = 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
                profileBadge.style.color = '#fff';
                profileBadge.style.border = 'none';
            } else {
                profileBadge.textContent = 'Free Plan';
                profileBadge.style.background = 'transparent';
                profileBadge.style.color = 'var(--primary)';
                profileBadge.style.border = '1px solid var(--primary)';
            }
        }

        // 3. Generator Topic Input (Hide in Trial Mode)
        const topicGroup = document.querySelector('.topic-group');
        if (topicGroup) {
            if (isTrial) {
                topicGroup.style.display = 'none';
            } else {
                topicGroup.style.display = 'block';
            }
        }
    }
};

function updateAuthUI(user) {
    const userEmail = document.getElementById('userEmail');
    if (user && userEmail) {
        userEmail.textContent = user.email;
    }

    // Delegate to PremiumManager
    PremiumManager.updateUI();
}

function setupTopicToggle() {
    const btn = document.getElementById('toggleTopicBtn');
    const container = document.getElementById('topicInputContainer');
    const chevron = document.getElementById('topicChevron');

    if (btn && container) {
        btn.addEventListener('click', () => {
            container.classList.toggle('hidden');
            // Rotate chevron if it exists
            if (chevron) {
                chevron.style.transform = container.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        });
    }
}

function setupStarRating() {
    const stars = document.querySelectorAll('.star-rating i');
    const hiddenInput = document.getElementById('genRarity');
    const label = document.getElementById('difficultyLabel');

    const labels = {
        1: 'Beginner',
        2: 'Elementary',
        3: 'Intermediate',
        4: 'Advanced',
        5: 'Native'
    };

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const value = parseInt(star.getAttribute('data-value'));
            hiddenInput.value = value;

            // Update UI
            stars.forEach(s => {
                const sValue = parseInt(s.getAttribute('data-value'));
                if (sValue <= value) {
                    s.classList.remove('fa-regular');
                    s.classList.add('fa-solid');
                } else {
                    s.classList.remove('fa-solid');
                    s.classList.add('fa-regular');
                }
            });

            // Update Label
            if (label) label.textContent = labels[value] || 'Intermediate';
        });
    });
}

function setupParallax() {
    const waves = document.querySelectorAll('.wave');
    let targetY = 0;
    let currentY = 0;

    document.addEventListener('mousemove', (e) => {
        // Calculate target Y based on mouse position
        targetY = (window.innerHeight / 2 - e.pageY) / 100;
    });

    function animate() {
        // Lerp: current = current + (target - current) * friction
        // Lower friction = more "ice/slide" feel (0.05 is very smooth)
        const friction = 0.05;
        currentY += (targetY - currentY) * friction;

        waves.forEach((wave, index) => {
            // User request:
            // "Lower" (visually bottom, e.g. wave1) -> Move MORE (Front)
            // "Higher/Back" (visually top, e.g. wave6) -> Move LESS (Back)

            // Index 0 = wave1 (Front)
            // Index 5 = wave6 (Back)

            // Factor decreases with index
            // wave1 (0): (6-0)*1.2 = 7.2
            // wave6 (5): (6-5)*1.2 = 1.2
            const factor = (waves.length - index) * 1.2;

            // Vertical only as requested
            wave.style.transform = `translateY(${currentY * factor}px)`;
        });

        requestAnimationFrame(animate);
    }

    animate();
}

// --- Language Handling ---
// Handled by services/i18n.js

// --- Navigation ---
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const target = link.getAttribute('data-target');
            navigateTo(target);
        });
    });
}

function navigateTo(targetId) {
    // Update Sidebar
    navLinks.forEach(link => {
        if (link.getAttribute('data-target') === targetId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Update View
    Object.values(views).forEach(view => view.classList.remove('active-section'));
    if (views[targetId]) {
        views[targetId].classList.add('active-section');
    }

    // Specific View Logic
    if (targetId === 'dictionary') {
        renderDictionary();
        // Hide language selector in dictionary view
        const langSelector = document.getElementById('languageSelector');
        if (langSelector) langSelector.parentElement.style.display = 'none';
    } else {
        // Show language selector in other views
        const langSelector = document.getElementById('languageSelector');
        if (langSelector) langSelector.parentElement.style.display = 'flex';
    }
}

// --- API Key Handling ---
function checkApiKey() {
    if (!state.apiKey) {
        apiKeyModal.style.display = 'flex';
    }
}

function setupSettings() {
    // Save API Key
    if (saveApiKeyBtn) {
        saveApiKeyBtn.addEventListener('click', () => {
            const key = apiKeyInput.value.trim();
            if (key.length > 10) { // Basic validation
                if (GeminiService.saveFreeKey(key)) {
                    state.apiKey = key;
                    apiKeyModal.style.display = 'none';
                } else {
                    apiKeyError.textContent = 'Invalid API Key format.';
                }
            } else {
                apiKeyError.textContent = 'Invalid API Key format.';
            }
        });
    }

    // Reset API Key
    const resetBtn = document.getElementById('resetApiKeyBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            localStorage.removeItem('gemini_apiKey');
            state.apiKey = null;
            location.reload();
        });
    }

    // Clear Data
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                localStorage.clear();
                location.reload();
            }
        });
    }
}

// --- Gemini API Helper ---



function setupDictionary() {
    const searchInput = document.getElementById('dictSearchInput');
    const searchContainer = document.querySelector('.search-bar-mac');
    const searchIcon = searchContainer ? searchContainer.querySelector('i') : null;

    if (searchInput && searchContainer) {
        // Toggle expansion on container click
        searchContainer.addEventListener('click', (e) => {
            // Don't toggle if clicking the input itself while open
            if (e.target === searchInput) return;

            e.stopPropagation(); // Prevent bubbling
            searchContainer.classList.toggle('expanded');

            if (searchContainer.classList.contains('expanded')) {
                searchInput.focus();
            } else {
                searchInput.blur();
            }
        });

        // Keep open if clicking input
        searchInput.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target) && searchContainer.classList.contains('expanded')) {
                searchContainer.classList.remove('expanded');
                searchInput.blur();
            }
        });

        // Real-time filtering
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            renderDictionary(term);
        });

        // Search on Enter (Blur and Scroll to first match)
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchInput.blur();

                // Scroll to first match if exists
                const firstItem = document.querySelector('.dict-item-pdf');
                if (firstItem) {
                    firstItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    }
}

// --- Generator Feature ---
function setupGenerator() {
    const btn = document.getElementById('generateBtn');
    const topicInput = document.getElementById('genTopic');
    const rarityInput = document.getElementById('genRarity');
    const rarityDisplay = document.getElementById('rarityValue');

    rarityInput.addEventListener('input', (e) => {
        const val = e.target.value;
        // Convert 1-5 to FontAwesome stars
        let stars = '';
        for (let i = 0; i < val; i++) {
            stars += '<i class="fa-solid fa-star"></i>';
        }
        rarityDisplay.innerHTML = stars;
    });

    btn.addEventListener('click', async () => {
        const topic = topicInput.value.trim();
        const difficultyLevel = parseInt(rarityInput.value) || 3;

        // --- TRIAL MODE LOGIC ---
        if (state.isTrialMode) {
            document.getElementById('genResult').classList.add('hidden');
            document.getElementById('genLoading').classList.remove('hidden');

            // Simulate delay for realism
            setTimeout(() => {
                const scenarioIndex = Math.min(Math.max(difficultyLevel - 1, 0), 4);
                const scenario = window.TrialData[scenarioIndex];

                if (scenario) {
                    const fakeData = {
                        title: scenario.title,
                        spanish_context: scenario.description,
                        dialogue: scenario.dialogue, // Use full dialogue from static data
                        glossary: scenario.staticGlossary.map(item => ({
                            word: item.word,
                            pronunciation: '',
                            definition: item.definition,
                            translation: item.context // Mapping context to translation for UI
                        }))
                    };

                    document.getElementById('genLoading').classList.add('hidden');
                    renderGeneratorResult(fakeData, 'gen'); // Fixed typo and added prefix
                    document.getElementById('genResult').classList.remove('hidden'); // Ensure result is shown

                    // Also populate current glossary state for adding words
                    state.currentGlossary = fakeData.glossary.map(g => ({
                        word: g.word,
                        definition: g.definition,
                        translation: g.translation,
                        pronunciation: g.pronunciation
                    }));
                }
            }, 1500);
            return;
        }
        // ------------------------

        // Map 1-5 to CEFR
        const levels = {
            "1": "A1 (Beginner) - Very simple words",
            "2": "A2 (Elementary) - Basic everyday words",
            "3": "B1 (Intermediate) - Standard conversation",
            "4": "B2 (Upper Intermediate) - More complex topics",
            "5": "C1 (Advanced) - Sophisticated vocabulary"
        };
        const levelDesc = levels[difficultyLevel];

        document.getElementById('genResult').classList.add('hidden');
        document.getElementById('genLoading').classList.remove('hidden');

        const prompt = `
            Generate a realistic everyday English conversation as a DIALOGUE between two people.
            Topic: ${topic || 'Random everyday situation'}
            Vocabulary Difficulty: ${levelDesc}
            
            Output JSON format:
            {
                "title": "Creative Title",
                "spanish_context": "5-6 lines describing the situation in Spanish.",
                "dialogue": [
                    { "speaker": "Person A", "text": "English text...", "translation": "Texto en español..." },
                    { "speaker": "Person B", "text": "English text...", "translation": "Texto en español..." }
                ],
                "glossary": [
                    {
                        "word": "word or phrase",
                        "pronunciation": "/IPA/",
                        "definition": "Spanish definition",
                        "translation": "Spanish translation"
                    }
                ]
            }
            IMPORTANT: 
            1. Ensure "glossary" items have ALL fields.
            2. Ensure each dialogue message has a "translation" field.
            3. Ensure at least 3-5 glossary items matching the difficulty level.
        `;

        try {
            const data = await GeminiService.enviarMensaje(prompt, true);

            document.getElementById('genLoading').classList.add('hidden');

            if (data) {
                // Parse if string (from backend or direct)
                let parsedData = data;
                if (typeof data === 'string') {
                    try {
                        parsedData = JSON.parse(data);
                    } catch (e) {
                        // If backend returned object structure with candidates
                        // We need to handle that. 
                        // Wait, GeminiService returns the raw response object structure in both cases now?
                        // Let's check GeminiService implementation.
                        // Direct: returns data (full response object)
                        // Backend: returns data (full response object)
                        // So we need to extract text and parse JSON here, similar to old callGemini
                    }
                }

                // Extract text from response structure
                let text = '';
                if (data.candidates && data.candidates[0].content) {
                    text = data.candidates[0].content.parts[0].text;
                } else {
                    // Fallback or error
                    throw new Error('Invalid response format');
                }

                // Clean and Parse JSON
                text = text.replace(/```json/g, '').replace(/```/g, '').trim();
                parsedData = JSON.parse(text);

                state.topicsCount++;
                localStorage.setItem('topics_count', state.topicsCount);
                updateStats();

                renderGeneratorResult(parsedData, 'gen');
                document.getElementById('genResult').classList.remove('hidden');
            }
        } catch (error) {
            console.error('Generation Error:', error);
            document.getElementById('genLoading').classList.add('hidden');
            showToast(error.message, 'error');
            if (error.message.includes('Premium')) {
                checkApiKey(); // Prompt for key if premium fails/unauthorized
            }
        }
    });
}

function renderGeneratorResult(data, prefix) {
    // document.getElementById(`${prefix}Title`).textContent = data.title; // Removed as per user request
    document.getElementById(`${prefix}Spanish`).textContent = data.spanish_context;

    // Render Chat
    const chatContainer = document.getElementById(`${prefix}English`);
    chatContainer.innerHTML = ''; // Clear previous text
    chatContainer.className = 'chat-container'; // Add class for styling

    // Update state glossary
    if (data.glossary && Array.isArray(data.glossary)) {
        state.currentGlossary = data.glossary;
    } else {
        state.currentGlossary = [];
    }
    renderGlossaryList(prefix);

    if (data.dialogue && Array.isArray(data.dialogue)) {
        data.dialogue.forEach((msg, index) => {
            const bubble = document.createElement('div');
            // Alternate sides: even index = left, odd index = right
            const sideClass = index % 2 === 0 ? 'chat-left' : 'chat-right';
            bubble.className = `chat-bubble ${sideClass}`;

            // Store translations in data attributes
            bubble.dataset.original = msg.text;
            bubble.dataset.translation = msg.translation || msg.text;
            bubble.dataset.lang = 'en'; // Current state

            // Wrap words for interactivity
            const wrappedText = wrapWords(msg.text);

            bubble.innerHTML = `
                <span class="speaker-name">${msg.speaker}</span>
                <span class="bubble-text">${wrappedText}</span>
            `;

            // Attach listeners to interactive words
            const words = bubble.querySelectorAll('.interactive-word');
            let hoverTimer;

            words.forEach(wordSpan => {
                wordSpan.addEventListener('mouseenter', () => {
                    if (bubble.dataset.lang !== 'en') return; // Only in untranslated state
                    hoverTimer = setTimeout(() => {
                        wordSpan.classList.add('word-highlight');
                    }, 500);
                });

                wordSpan.addEventListener('mouseleave', () => {
                    clearTimeout(hoverTimer);
                    wordSpan.classList.remove('word-highlight');
                });

                wordSpan.addEventListener('click', (e) => {
                    if (bubble.dataset.lang !== 'en') return;

                    // If highlighted, add to glossary
                    if (wordSpan.classList.contains('word-highlight')) {
                        e.stopPropagation(); // Prevent bubble translation
                        const word = wordSpan.textContent.replace(/[.,!?;:()"]/g, ''); // Clean punctuation
                        addToGlossaryFromText(word, prefix);
                        wordSpan.classList.remove('word-highlight');
                    }
                });
            });

            // Click to toggle translation
            bubble.addEventListener('click', () => {
                const textSpan = bubble.querySelector('.bubble-text');

                if (bubble.dataset.lang === 'en') {
                    // Switch to translation
                    textSpan.textContent = bubble.dataset.translation;
                    bubble.dataset.lang = 'translated';
                } else {
                    // Switch back to English (re-wrap words)
                    textSpan.innerHTML = wrapWords(bubble.dataset.original);
                    // Re-attach listeners? Yes, because innerHTML destroyed them.
                    // This is tricky. Better to toggle a class or swap hidden spans?
                    // Or just re-run the attachment logic.
                    // For simplicity, let's just re-render the original text with spans.
                    // But we need to re-attach listeners.
                    // Let's extract the attachment logic.
                    attachWordListeners(bubble, prefix);
                    bubble.dataset.lang = 'en';
                }
            });

            chatContainer.appendChild(bubble);
        });
    } else if (typeof data.english_description === 'string') {
        // Fallback for old data format
        chatContainer.textContent = data.english_description;
        chatContainer.className = '';
    }
}

function wrapWords(text) {
    // Split by space, preserving structure roughly
    return text.split(' ').map(word => `<span class="interactive-word">${word}</span>`).join(' ');
}

function attachWordListeners(bubble, prefix) {
    const words = bubble.querySelectorAll('.interactive-word');
    let hoverTimer;

    words.forEach(wordSpan => {
        wordSpan.addEventListener('mouseenter', () => {
            if (bubble.dataset.lang !== 'en') return;
            hoverTimer = setTimeout(() => {
                wordSpan.classList.add('word-highlight');
            }, 500);
        });

        wordSpan.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimer);
            wordSpan.classList.remove('word-highlight');
        });

        wordSpan.addEventListener('click', (e) => {
            if (bubble.dataset.lang !== 'en') return;

            if (wordSpan.classList.contains('word-highlight')) {
                e.stopPropagation();
                const word = wordSpan.textContent.replace(/[.,!?;:()"]/g, '');
                addToGlossaryFromText(word, prefix);
                wordSpan.classList.remove('word-highlight');
            }
        });
    });
}

function renderGlossaryList(prefix) {
    const list = document.getElementById(`${prefix}Glossary`);
    if (!list) return;
    list.innerHTML = '';

    state.currentGlossary.forEach(item => {
        const li = document.createElement('li');

        const contentDiv = document.createElement('div');
        contentDiv.className = 'glossary-content';
        const cleanWord = (item.word || '???').replace(/\*\*/g, '').replace(/\*/g, '');
        contentDiv.innerHTML = `
            <span class="word">${cleanWord}</span>
            <span class="pronunciation">${item.pronunciation || ''}</span>
            <span class="definition">${(item.definition || 'Loading...').replace(/\*\*/g, '')}</span>
            <span class="translation">(${item.translation || '...'})</span>
        `;

        const speakBtn = document.createElement('button');
        speakBtn.className = 'btn-icon';
        speakBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        speakBtn.onclick = () => speakText(item.word);

        const addBtn = document.createElement('button');
        addBtn.className = 'btn-icon';
        addBtn.style.marginLeft = '5px';
        addBtn.innerHTML = '<i class="fa-solid fa-plus"></i>'; // Changed to icon for consistency
        addBtn.onclick = (e) => addToDictionary(item.word, item.definition, item.translation, item.pronunciation, e.currentTarget);

        li.appendChild(contentDiv);
        li.appendChild(speakBtn);
        li.appendChild(addBtn);

        list.appendChild(li);
    });
}

async function addToGlossaryFromText(word, prefix) {
    // Check if already exists
    const exists = state.currentGlossary.find(item => item.word.toLowerCase() === word.toLowerCase());
    if (exists) {
        showToast(`"${word}" is already in the glossary.`, 'info');
        return;
    }

    // Add placeholder
    const newItem = { word: word, definition: 'Loading...', translation: 'Loading...', pronunciation: '' };
    state.currentGlossary.push(newItem);
    renderGlossaryList(prefix);

    // Determine target language for translation
    const targetLang = state.language === 'es' ? 'Spanish' : 'English';
    // If user is in 'en' mode, maybe they want definition in English and translation in... Spanish? 
    // Usually "Translation" implies L1. If app is for learning English, L1 is likely Spanish (default) or whatever user selected.
    // But if interface is English, maybe user is advanced or L1 is English learning Spanish? 
    // The app seems to be "Everyday English AI", implying learning English.
    // So "Translation" should be in the user's preferred language (state.language).
    // If state.language is 'en', translation might be redundant if they are fluent, but let's assume 'Spanish' is the default L1 context 
    // UNLESS we want to support other L1s. 
    // The user said "in the language selected by the user".
    // So if state.language is 'es', translate to Spanish. If 'en', translate to English (which is weird for English words, but maybe they want simple English?).
    // Let's stick to: Translate to [Language Name of state.language].

    const langName = state.language === 'es' ? 'Spanish' : 'English';

    // Fetch details
    const prompt = `Define and translate the word "${word}" in the context of learning English. 
    Output JSON: { 
        "word": "${word}", 
        "pronunciation": "/.../", 
        "definition": "Short definition in Spanish", 
        "translation": "${langName} translation" 
    }`;

    try {
        // We need to extract text and parse JSON manually now since GeminiService returns full response
        const responseData = await GeminiService.enviarMensaje(prompt, true);

        let text = '';
        if (responseData.candidates && responseData.candidates[0].content) {
            text = responseData.candidates[0].content.parts[0].text;
        }

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const details = JSON.parse(text);

        if (details) {
            // Update item
            const index = state.currentGlossary.findIndex(item => item.word === word);
            if (index !== -1) {
                state.currentGlossary[index] = details;
                renderGlossaryList(prefix);
            }
        }
    } catch (e) {
        console.error("Error fetching word details", e);
        // Remove or show error?
    }
}

// --- Challenge Mode ---
function setupChallenge() {
    const btn = document.getElementById('challengeBtn');
    const input = document.getElementById('challengeInput');
    const resultDiv = document.getElementById('challengeResult');
    const feedbackDiv = document.getElementById('challengeFeedback');
    const loading = document.getElementById('challengeLoading');

    btn.addEventListener('click', async () => {
        const text = input.value.trim();
        if (!text) return;

        resultDiv.classList.add('hidden');
        loading.classList.remove('hidden');

        const prompt = `
            Analyze this user text (English or Spanish learning English): "${text}"
            Provide:
            1. Corrections (if any errors).
            2. Improved natural UK phrasing.
            3. Brief explanation of changes.
            
            Output HTML format (just the inner HTML for a div):
            <p><strong>Correction:</strong> ...</p>
            <p><strong>Better Phrasing:</strong> ...</p>
            <p><strong>Why:</strong> ...</p>
        `;

        try {
            const responseData = await GeminiService.enviarMensaje(prompt, false); // false for HTML/Text mode

            let responseText = '';
            if (responseData.candidates && responseData.candidates[0].content) {
                responseText = responseData.candidates[0].content.parts[0].text;
            }

            loading.classList.add('hidden');
            if (responseText) {
                feedbackDiv.innerHTML = responseText;
                resultDiv.classList.remove('hidden');
            }
        } catch (error) {
            loading.classList.add('hidden');
            showToast(error.message, 'error');
        }
    });
}

// --- Dictionary ---


async function addToDictionary(word, def, trans, pron, targetBtn = null) {
    // Check if exists locally first to avoid duplicates in UI
    if (state.dictionary.some(item => item.word.toLowerCase() === word.toLowerCase())) {
        showToast('Word already in dictionary!', 'info');
        return;
    }

    // Prepare context (using translation as context for now)
    // Append pronunciation to definition if needed, or just store it.
    // The table has: word, definition, context.
    // We'll store 'trans' in 'context'.
    // We'll append pron to definition if we want to save it, or just lose it.
    // Let's append it to definition: "Def. [Pron]"
    const definitionToSave = pron ? `${def} [${pron}]` : def;

    // Call Service
    const { data, error } = await window.VocabularyService.addWord(word, definitionToSave, trans);

    if (error) {
        console.error('Error adding word:', error);
        showToast('Error saving word to cloud.', 'error');
        return;
    }

    // Success - Update Local State (Optimistic or from response)
    // The response data[0] has the new ID.
    if (data && data[0]) {
        const newWord = {
            id: data[0].id,
            word: data[0].word,
            def: def, // Keep original for UI
            trans: data[0].context,
            pron: pron // Keep original
        };

        state.dictionary.push(newWord);
        state.dictionary.sort((a, b) => a.word.localeCompare(b.word));

        renderDictionary();
        updateStats();

        // Show comic bubble
        if (targetBtn) {
            const bubble = document.createElement('div');
            bubble.className = 'comic-bubble';
            bubble.innerHTML = '<i class="fa-solid fa-check"></i>';
            const originalPosition = targetBtn.style.position;
            if (getComputedStyle(targetBtn).position === 'static') {
                targetBtn.style.position = 'relative';
            }
            targetBtn.style.overflow = 'visible';
            targetBtn.appendChild(bubble);
            setTimeout(() => {
                bubble.remove();
                targetBtn.style.position = originalPosition;
                targetBtn.style.overflow = '';
            }, 1000);
        } else {
            showToast(`Added "${word}" to dictionary.`, 'success');
        }
    }
}

function renderDictionary(searchTerm = '') {
    const listContainer = document.getElementById('dictionaryList');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    // Filter and Sort
    let items = state.dictionary;

    if (searchTerm) {
        items = items.filter(item =>
            item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.def.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.trans.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    items.sort((a, b) => a.word.localeCompare(b.word));

    if (items.length === 0) {
        listContainer.innerHTML = `
            <div class="dict-item-pdf" style="text-align: center; color: #888;">
                <p>${searchTerm ? 'No matches found.' : 'No words saved yet.'}</p>
            </div>
        `;
        return;
    }

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'dict-item-pdf';

        const pron = item.pron || '/.../';

        div.innerHTML = `
            <div class="dict-word-pdf">
                ${item.word}
                <span class="dict-pron-pdf">${pron}</span>
            </div>
            <p class="dict-def-pdf">${item.def}</p>
            <p class="dict-trans-pdf">${item.trans}</p>
            <div class="dict-actions-pdf">
                <button class="btn-pdf-action" onclick="speakText('${item.word}')" title="Listen">
                    <i class="fa-solid fa-volume-high"></i>
                </button>
                <button class="btn-pdf-action delete" onclick="deleteFromDictionary('${item.id || item.word}')" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        listContainer.appendChild(div);
    });
}

async function deleteFromDictionary(identifier) {
    if (confirm('Delete this word?')) {
        // Check if it's an ID (number/uuid) or word (string)
        // If it's a legacy word (no ID), we can't easily delete from cloud unless we search by word.
        // But we are migrating, so we should have IDs.
        // If identifier is a string that looks like a word, it might be legacy.

        let idToDelete = identifier;
        let isLegacy = false;

        // Find in state to get ID if passed word
        const item = state.dictionary.find(i => i.id == identifier || i.word === identifier);
        if (item && item.id) {
            idToDelete = item.id;
        } else {
            isLegacy = true; // Should not happen after migration
        }

        if (!isLegacy) {
            const { error } = await window.VocabularyService.deleteWord(idToDelete);
            if (error) {
                showToast('Error deleting word.', 'error');
                return;
            }
        }

        // Update Local State
        const index = state.dictionary.findIndex(i => i.id == idToDelete || i.word === identifier);
        if (index > -1) {
            state.dictionary.splice(index, 1);
            renderDictionary();
            updateStats();
        }
    }
}

// Removed showWordDetails as we show details directly on page now
/* function showWordDetails(item) { ... } */

// --- Settings ---
// Duplicate setupSettings removed


// --- TTS Utility ---
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-GB'; // UK English

        // Try to find a specific UK voice
        const voices = window.speechSynthesis.getVoices();
        const ukVoice = voices.find(voice => voice.lang === 'en-GB' || voice.name.includes('UK'));
        if (ukVoice) utterance.voice = ukVoice;

        window.speechSynthesis.speak(utterance);
    } else {
        showToast('Text-to-speech not supported.', 'error');
    }
}

// --- Stats ---
function updateStats() {
    const wordCount = state.dictionary.length;
    const topicCount = state.topicsCount;

    // Sidebar/Home Stats (if any)
    const wordEl = document.getElementById('statWords');
    const topicEl = document.getElementById('statTopics');
    if (wordEl) wordEl.textContent = wordCount;
    if (topicEl) topicEl.textContent = topicCount;

    // Profile Page Stats
    const profileWordEl = document.getElementById('profileWordCount');
    const profileTopicEl = document.getElementById('profileTopicCount');
    if (profileWordEl) profileWordEl.textContent = wordCount;
    if (profileTopicEl) profileTopicEl.textContent = topicCount;
}

// --- API Modal Tabs ---
function switchApiTab(clickedTab, mode) {
    // Visual Update
    const tabs = clickedTab.parentElement.querySelectorAll('.auth-tab');
    tabs.forEach(t => t.classList.remove('active'));
    clickedTab.classList.add('active');

    // Content Update
    const freeContent = document.getElementById('apiFreeContent');
    const premiumContent = document.getElementById('apiPremiumContent');

    if (mode === 'free') {
        freeContent.classList.remove('hidden');
        premiumContent.classList.add('hidden');
    } else {
        freeContent.classList.add('hidden');
        premiumContent.classList.remove('hidden');
    }
}

function setupTrialMode() {
    const btn = document.getElementById('trialModeBtn');
    if (btn) {
        btn.addEventListener('click', () => {
            state.isTrialMode = true;
            state.apiKey = 'TRIAL'; // Dummy key to bypass checks
            apiKeyModal.style.display = 'none';
            showToast('Offline Trial Mode Activated', 'info');
            PremiumManager.updateUI(); // Update UI for Trial Mode
        });
    }
}

// Call updateStats on load
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    setupMobileMenu();
    setupTrialMode();
    setupAuth(); // Restore Auth Setup

    // Initialize i18n
    if (window.LanguageService) {
        window.LanguageService.init();
    }

    // Initial UI Update
    PremiumManager.updateUI();
    const usePremiumBtn = document.getElementById('usePremiumBtn');
    if (usePremiumBtn) {
        usePremiumBtn.addEventListener('click', () => {
            // Save 'PREMIUM' as the key to satisfy the check but trigger backend usage
            if (GeminiService.saveFreeKey('PREMIUM')) {
                state.apiKey = 'PREMIUM';
                apiKeyModal.style.display = 'none';
                showToast('Premium Mode Activated!', 'success');
            }
        });
    }
});

function setupMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');

    if (!btn || !sidebar) return;

    btn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        const isOpen = sidebar.classList.contains('open');
        btn.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });

    // Close sidebar when clicking a link on mobile
    const links = sidebar.querySelectorAll('li');
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
                btn.innerHTML = '<i class="fa-solid fa-bars"></i>';
            }
        });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 &&
            sidebar.classList.contains('open') &&
            !sidebar.contains(e.target) &&
            !btn.contains(e.target)) {
            sidebar.classList.remove('open');
            btn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        }
    });
}

// --- Toast Notification ---
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.textContent = message;

    // Style it
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.color = 'white';
    toast.style.fontWeight = '500';
    toast.style.zIndex = '10000';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';

    // Set color based on type
    if (type === 'error') {
        toast.style.backgroundColor = '#ff4444';
    } else if (type === 'success') {
        toast.style.backgroundColor = '#00C851';
    } else {
        toast.style.backgroundColor = '#33b5e5'; // Info blue
    }

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';

        // Remove from DOM after animation
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}
