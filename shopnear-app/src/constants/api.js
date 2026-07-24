// Backend server
// - 'http://localhost:9001/v1/api'      → USB debug build ke liye (adb reverse tcp:9001 tcp:9001 zaroori)
// - 'http://192.168.68.115:9001/v1/api' → standalone/release APK ke liye (phone aur PC same Wi-Fi par hon)
export const API_BASE_URL = 'http://192.168.68.112:9001/v1/api';

// Backend relative image paths (/uploads/...) isi bucket se serve hote hain
export const MEDIA_BASE_URL = 'https://bank-ster-dev.s3.ap-south-1.amazonaws.com';
