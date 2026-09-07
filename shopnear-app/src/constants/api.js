// Backend server
// - 'http://localhost:9001/v1/api'      → USB debug build ke liye (adb reverse tcp:9001 tcp:9001 zaroori)
// - 'http://192.168.1.36:9001/v1/api' → local Wi-Fi APK ke liye (phone aur PC same Wi-Fi par hon)
// - 'https://backend.aaspass.net/v1/api' → AWS production (nginx SSL → localhost:9001, EC2 15.206.98.250)
export const API_BASE_URL = 'https://backend.aaspass.net/v1/api';

// Backend relative image paths (/uploads/...) isi bucket se serve hote hain
export const MEDIA_BASE_URL = 'https://bank-ster-dev.s3.ap-south-1.amazonaws.com';
