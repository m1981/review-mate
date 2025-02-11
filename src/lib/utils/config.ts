import * as fs from 'fs';
import * as yaml from 'js-yaml';

export function loadConfig() {
  try {
    // Look for decrypted config first
    const configPath = process.env.NODE_ENV === 'production'
      ? '/app/secrets/config.yaml'
      : '/app/secrets/development.local.yaml';

    const fileContents = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(fileContents) as any;

        // Map the YAML structure to environment variables
        process.env.FIREBASE_API_KEY = config.reviewmate.firebase.apiKey;
        process.env.FIREBASE_AUTH_DOMAIN = config.reviewmate.firebase.authDomain;
        process.env.FIREBASE_PROJECT_ID = config.reviewmate.firebase.projectId;
        process.env.FIREBASE_STORAGE_BUCKET = config.reviewmate.firebase.storageBucket;
        process.env.FIREBASE_MESSAGING_SENDER_ID = config.reviewmate.firebase.messagingSenderId;
        process.env.FIREBASE_APP_ID = config.reviewmate.firebase.appId;
        process.env.FIREBASE_MEASUREMENT_ID = config.reviewmate.firebase.measurementId;

    } catch (error) {
        console.error('Failed to load configuration:', error);
        process.exit(1);
    }
}
