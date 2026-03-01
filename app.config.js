// App configuration with environment variable support
// In EAS, use eas.json secrets or --profile for env management

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
    if (IS_DEV) return 'com.abhinavbirajdar.fadeup.dev';
    if (IS_PREVIEW) return 'com.abhinavbirajdar.fadeup.preview';
    return 'com.abhinavbirajdar.fadeup';
};

const getAppName = () => {
    if (IS_DEV) return 'FadeUp (Dev)';
    if (IS_PREVIEW) return 'FadeUp (Preview)';
    return 'FadeUp';
};

export default {
    expo: {
        name: getAppName(),
        slug: "FadeUp",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./src/assets/icon.png",
        userInterfaceStyle: "dark",
        newArchEnabled: true,
        scheme: "fadeup",
        ios: {
            supportsTablet: true,
            bundleIdentifier: getUniqueIdentifier(),
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./src/assets/adaptive-icon.png",
                backgroundColor: "#121214"
            },
            package: getUniqueIdentifier(),
            edgeToEdgeEnabled: true,
        },
        web: {
            favicon: "./src/assets/favicon.png"
        },
        plugins: [
            "expo-router",
            "expo-font",
            [
                "expo-splash-screen",
                {
                    "backgroundColor": "#121214",
                    "image": "./src/assets/icon.png",
                    "imageWidth": 200,
                    "resizeMode": "contain"
                }
            ]
        ],
        jsEngine: "hermes",
        extra: {
            eas: {
                projectId: "93e46960-9a5f-4828-8e6c-d4378789a4ee"
            },
            // Environment flags
            isDevEnv: IS_DEV,
            isPreviewEnv: IS_PREVIEW,
        },
        updates: {
            url: "https://u.expo.dev/93e46960-9a5f-4828-8e6c-d4378789a4ee"
        },
        runtimeVersion: {
            policy: "appVersion"
        },
        owner: "abhinav28birajdar"
    }
};
