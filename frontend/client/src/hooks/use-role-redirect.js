import { useEffect } from 'react';
import { useLocation } from 'wouter';
export function useRoleRedirect(config) {
    var _a = useLocation(), setLocation = _a[1];
    useEffect(function () {
        var userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                var user = JSON.parse(userStr);
                if (!config.allowedRoles.includes(user.role)) {
                    setLocation(config.fallbackPath);
                }
            }
            catch (e) {
                console.error('Failed to parse user from localStorage', e);
            }
        }
    }, [config.allowedRoles, config.fallbackPath, setLocation]);
}
