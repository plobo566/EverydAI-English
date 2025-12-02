// services/auth.js
// Using global 'supabase' object from CDN

// HARDCODED CREDENTIALS AS REQUESTED FOR IMMEDIATE FIX
const SUPABASE_URL = 'https://zdsodoyfcixozqahoegf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkc29kb3lmY2l4b3pxYWhvZWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MjAyNDAsImV4cCI6MjA4MDE5NjI0MH0.3voxOsKoBSfL4DpU2SSZJ87Dk0eJlcakjsQXV7HbPzk';

// Initialize Client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const AuthService = {
    // Sign Up
    signUp: async (email, password) => {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
        });
        return { data, error };
    },

    // Sign In
    signIn: async (email, password) => {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
        });

        if (data.user) {
            // Fetch Profile for Premium Status
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('is_premium')
                .eq('id', data.user.id)
                .single();

            if (profile) {
                localStorage.setItem('is_premium', profile.is_premium);
            } else {
                localStorage.setItem('is_premium', 'false');
            }
        }

        return { data, error };
    },

    // Sign Out
    signOut: async () => {
        const { error } = await supabaseClient.auth.signOut();
        localStorage.removeItem('is_premium'); // Clear status
        localStorage.removeItem('gemini_apiKey'); // Clear API Key for privacy
        return { error };
    },

    // Get Current User
    getCurrentUser: async () => {
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (user) {
            // Refresh Premium Status on load
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('is_premium')
                .eq('id', user.id)
                .single();

            if (profile) {
                localStorage.setItem('is_premium', profile.is_premium);
            }
        }

        return user;
    },

    // Listen for Auth Changes
    onAuthStateChange: (callback) => {
        return supabaseClient.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    }
};

// Expose to window
window.AuthService = AuthService;
