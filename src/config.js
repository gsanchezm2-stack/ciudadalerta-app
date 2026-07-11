import { Platform } from 'react-native';

const DEV_API = Platform.OS === 'android'
  ? 'http://10.0.2.2:5000'
  : 'http://localhost:5000';

const API_URL = DEV_API;

export { API_URL };
