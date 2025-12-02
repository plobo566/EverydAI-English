const VocabularyService = {
    // Add a word to Supabase
    addWord: async (word, definition, context) => {
        const user = await window.AuthService.getCurrentUser();
        if (!user) return { error: 'User not logged in' };

        const { data, error } = await supabaseClient
            .from('user_vocabulary')
            .insert([
                {
                    user_id: user.id,
                    word: word,
                    definition: definition,
                    context: context
                }
            ])
            .select();

        return { data, error };
    },

    // Get all words for current user
    getWords: async () => {
        const user = await window.AuthService.getCurrentUser();
        if (!user) return { data: [], error: 'User not logged in' };

        const { data, error } = await supabaseClient
            .from('user_vocabulary')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        return { data, error };
    },

    // Delete a word by ID
    deleteWord: async (id) => {
        const { error } = await supabaseClient
            .from('user_vocabulary')
            .delete()
            .eq('id', id);

        return { error };
    }
};

window.VocabularyService = VocabularyService;
