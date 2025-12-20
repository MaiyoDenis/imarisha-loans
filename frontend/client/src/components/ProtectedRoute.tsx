import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallbackPath?: string;
}

function normalizeRole(role: string | undefined): string {
  if (!role) return '';
  return role.toLowerCase().replace(/\s+/g, '_').trim();
}

export function ProtectedRoute({ allowedRoles, children, fallbackPath = '/dashboard' }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const userStr = localStorage.getItem('user');
      console.log('=== ProtectedRoute.tsx checking ===');
      console.log('localStorage user:', userStr);
      console.log('allowed roles:', allowedRoles);
      
      if (!userStr) {
        console.log('❌ No user in localStorage, redirecting to login');
        setIsAuthorized(false);
        setIsChecking(false);
        // Small delay to ensure redirect happens
        setTimeout(() => setLocation('/'), 100);
        return;
      }
      
      try {
        const user = JSON.parse(userStr);
        console.log('✓ Parsed user:', user);
        console.log('  user.role =', user.role);
        
        const userRole = normalizeRole(user.role);
        const normalizedAllowedRoles = allowedRoles.map(r => normalizeRole(r));
        
        console.log('  normalized user role:', userRole);
        console.log('  normalized allowed roles:', normalizedAllowedRoles);
        
        const isAllowed = normalizedAllowedRoles.includes(userRole);
        console.log('  allowed?', isAllowed);
        
        if (!isAllowed) {
          console.log('❌ Role not in allowedRoles, redirecting to', fallbackPath);
          setIsAuthorized(false);
          setIsChecking(false);
          setTimeout(() => setLocation(fallbackPath), 100);
        } else {
          console.log('✓ Role authorized, rendering component');
          setIsAuthorized(true);
          setIsChecking(false);
        }
      } catch (e) {
        console.error('❌ Failed to parse user:', e);
        setIsAuthorized(false);
        setIsChecking(false);
        setTimeout(() => setLocation(fallbackPath), 100);
      }
    };
    
    checkAuth();
  }, [allowedRoles, fallbackPath, setLocation]);

  if (isChecking) {
    return null;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
