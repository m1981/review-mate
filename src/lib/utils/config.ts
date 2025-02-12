interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
}

export const getFirebaseConfig = (): FirebaseConfig => {
    // Validate required environment variables
    const requiredVars = [
        'VITE_FIREBASE_APIKEY',
        'VITE_FIREBASE_AUTHDOMAIN',
        'VITE_FIREBASE_PROJECTID',
        'VITE_FIREBASE_STORAGEBUCKET',
        'VITE_FIREBASE_MESSAGINGSENDERID',
        'VITE_FIREBASE_APPID'
    ];

    for (const varName of requiredVars) {
        if (!import.meta.env[varName]) {
            throw new Error(`Missing required environment variable: ${varName}`);
        }
    }

    return {
        apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
        appId: import.meta.env.VITE_FIREBASE_APPID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENTID
    };
};
