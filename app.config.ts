
import 'dotenv/config';

export default {
  "expo": {
 
    "extra": {
      "supabaseUrl": process.env.SUPABASE_URL, 
      "supabaseAnonKey": process.env.SUPABASE_ANON_KEY, 
      "eas": {
        "projectId": "YOUR_EAS_PROJECT_ID" 
      }
    },
  }
};