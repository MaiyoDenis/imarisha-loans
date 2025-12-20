import { useEffect, useState } from 'react';
export function useCurrentUser() {
    var _a = useState(null), user = _a[0], setUser = _a[1];
    var _b = useState(true), isLoading = _b[0], setIsLoading = _b[1];
    useEffect(function () {
        try {
            var userStr = localStorage.getItem('user');
            if (userStr) {
                var userData = JSON.parse(userStr);
                setUser(userData);
            }
        }
        catch (e) {
            console.error('Failed to parse user from localStorage', e);
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    return { user: user, isLoading: isLoading };
}
