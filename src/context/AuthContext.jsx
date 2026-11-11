import { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInAnonymously, 
  firebaseSignOut, 
  updateProfile, 
  onAuthStateChanged 
} from '../firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState(() => localStorage.getItem('quickchat_username') || '');
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        if (user.displayName) {
          setUsername(user.displayName);
          localStorage.setItem('quickchat_username', user.displayName);
        } else {
          const stored = localStorage.getItem('quickchat_username');
          if (stored) {
            setUsername(stored);
            updateProfile(user, { displayName: stored }).catch(() => {});
          } else {
            // Generate a friendly default guest name if none exists yet
            const defaultGuest = `Guest_${user.uid.slice(0, 4).toUpperCase()}`;
            setUsername(defaultGuest);
            localStorage.setItem('quickchat_username', defaultGuest);
            updateProfile(user, { displayName: defaultGuest }).catch(() => {});
          }
        }
      } else {
        // Not signed in
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const name = user.displayName || user.email?.split('@')[0] || 'User';
      setUsername(name);
      localStorage.setItem('quickchat_username', name);
      return user;
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      // Give readable error message
      let message = err.message;
      if (err.code === 'auth/configuration-not-found') {
        message = 'Firebase Authentication is not initialized yet in your Firebase project (dialy-water). Please visit Firebase Console > Authentication, click "Get started", and enable Google / Anonymous sign-in.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        message = 'Sign-in window was closed before completion.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        message = 'Only one sign-in window allowed at a time.';
      } else if (err.code === 'auth/operation-not-allowed') {
        message = 'Google sign-in is not enabled in Firebase console. Please enable it under Firebase Authentication > Sign-in method.';
      }
      setAuthError(message);
      throw new Error(message);
    }
  };

  const loginAsGuest = async (chosenName) => {
    setAuthError(null);
    try {
      const result = await signInAnonymously(auth);
      const user = result.user;
      const finalName = chosenName?.trim() || `Guest_${user.uid.slice(0, 4).toUpperCase()}`;
      setUsername(finalName);
      localStorage.setItem('quickchat_username', finalName);
      await updateProfile(user, { displayName: finalName });
      return user;
    } catch (err) {
      console.error('Guest Sign-In Error:', err);
      let message = err.message;
      if (err.code === 'auth/configuration-not-found') {
        message = 'Firebase Authentication is not activated yet in your project (dialy-water). Please open Firebase Console > Authentication > Click "Get started" and enable Anonymous sign-in.';
      } else if (err.code === 'auth/operation-not-allowed') {
        message = 'Anonymous sign-in is not enabled in Firebase console. Please enable it under Firebase Authentication > Sign-in method.';
      }
      setAuthError(message);
      throw new Error(message);
    }
  };

  const updateDisplayName = async (newName) => {
    const trimmed = newName?.trim();
    if (!trimmed) return;
    setUsername(trimmed);
    localStorage.setItem('quickchat_username', trimmed);
    if (currentUser) {
      try {
        await updateProfile(currentUser, { displayName: trimmed });
      } catch (err) {
        console.warn('Could not update Firebase profile display name:', err);
      }
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('quickchat_active_room');
      // We can keep quickchat_username or reset it
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        username,
        authLoading,
        authError,
        setAuthError,
        loginWithGoogle,
        loginAsGuest,
        updateDisplayName,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

