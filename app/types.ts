import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  '/engineer/details': {
    complaintNo: string;
    clientName: string;
    SYSTEM_NAME: string;
    S_assigndate: string;
    location: string;
    S_TASK_TYPE: string;
    status: string;
    S_SERVDT: string;
    S_assignedengg: string;
    username: string;
    password: string;
  };
  // Add other routes as needed
};

export type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

// Since these are types, we'll export a default object with type information
export default {
  RootStackParamList: {} as RootStackParamList,
  NavigationProps: {} as NavigationProps
}; 