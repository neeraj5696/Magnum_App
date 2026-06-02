import { NativeModules } from 'react-native';

declare module 'react-native' {
  interface NativeModulesStatic {
    EmailModule: {
      sendEmail(
        host: string,
        port: number,
        username: string,
        password: string,
        from: string,
        to: string,
        subject: string,
        htmlBody: string,
        attachmentBase64?: string,
        attachmentName?: string
      ): Promise<boolean>;
    };
  }
}

interface EmailModuleInterface {
  sendEmail(
    host: string,
    port: number,
    username: string,
    password: string,
    from: string,
    to: string,
    subject: string,
    htmlBody: string,
    attachmentBase64?: string,
    attachmentName?: string
  ): Promise<boolean>;
}

const { EmailModule } = NativeModules;

console.log("[NativeEmailModule] NativeModules object:", Object.keys(NativeModules));
console.log("[NativeEmailModule] EmailModule from NativeModules:", EmailModule);

if (__DEV__) {
  console.log(
    "[EmailModule] Native module loaded:",
    EmailModule ? "available" : "missing"
  );
}

if (!EmailModule) {
  console.error("❌ CRITICAL: EmailModule is null or undefined!");
  console.error("[NativeEmailModule] Available native modules:", Object.keys(NativeModules));
}

export const EmailModuleBridge = EmailModule as EmailModuleInterface;

export default function NativeEmailModuleRoutePlaceholder() {
  return null;
}