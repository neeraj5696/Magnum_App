export const EMAIL_CONFIG = {
    
  // Outlook/Hotmail SMTP Configuration
  OUTLOOK: {
    mailhost: 'mail.magnum.org.com',
    port: '25',
    ssl: false,
    username: 'Magnum Customer Care',
    password: 'c-crEjub&?5ukuvljinadr*?e@r+@eglfrubrugeR2&up=$evo0ohlfeswas=ewr',
    from: 'reply@magnum.org.in '
  },
  
  
};

// Use this configuration - change to OUTLOOK or YAHOO as needed
export const CURRENT_SMTP_CONFIG = EMAIL_CONFIG.OUTLOOK;

// Default export to satisfy Expo Router (this file is not a route)
export default function EmailConfigRoutePlaceholder() {
  return null;
}