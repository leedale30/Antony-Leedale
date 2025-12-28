
export const authService = {
    login: async (password: string): Promise<boolean> => {
        // Normalize the password to remove accidental whitespace (common in copy-paste)
        const cleanPassword = password.trim();

        // Client-side hardcoded check for absolute stability
        // This ensures the user can enter even if the Express backend isn't running or API fails
        if (cleanPassword === 'LEEDALE666888') {
            const mockToken = btoa(cleanPassword + '-' + Date.now());
            localStorage.setItem('auth_token', mockToken);
            return true;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: cleanPassword }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.token) {
                    localStorage.setItem('auth_token', data.token);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error("Login error:", error);
            // Redundant fallback for safety
            if (cleanPassword === 'LEEDALE666888') {
                const mockToken = btoa(cleanPassword + '-' + Date.now());
                localStorage.setItem('auth_token', mockToken);
                return true;
            }
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('auth_token');
        window.location.reload();
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('auth_token');
    }
};
