
export const authService = {
    login: async (password: string): Promise<boolean> => {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
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
