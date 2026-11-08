import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {appId:'com.almakan.companytasks',appName:'Company Tasks',webDir:'www',server:{url:'https://company-task-dashboard.onrender.com',cleartext:false,allowNavigation:['company-task-dashboard.onrender.com']},ios:{contentInset:'automatic',allowsLinkPreview:true},android:{allowMixedContent:false}};
export default config;
