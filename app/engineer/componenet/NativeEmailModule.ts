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

if (__DEV__) {
  console.log(
    "[EmailModule] Native module loaded:",
    EmailModule ? "available" : "missing"
  );
}

export const EmailModuleBridge = EmailModule as EmailModuleInterface;

export default function NativeEmailModuleRoutePlaceholder() {
  return null;
}