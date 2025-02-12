import { browser } from '$app/environment';
import { initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirebaseConfig } from './utils/config';

let auth: Auth;

export const initializeFirebase = () => {
  if (!browser) {
    return null;
  }

  const app = initializeApp(getFirebaseConfig());
  auth = getAuth(app);
  return auth;
};

export const getFirebaseAuth = (): Auth => {
  if (!browser) {
    throw new Error('Firebase auth is only available in browser environment');
  }

  if (!auth) {
    auth = initializeFirebase();
  }
  return auth;
};
