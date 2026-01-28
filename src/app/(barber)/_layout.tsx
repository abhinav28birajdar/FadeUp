import { Tabs } from 'expo-router';
import { Colors } from '../../constants/colors';
import { LayoutDashboard, Clock, Calendar, Store, MoreHorizontal } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function BarberLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Colors.surface,
                    borderTopColor: Colors.border,
                    height: Platform.OS === 'ios' ? 85 : 65,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textTertiary,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '500',
                },
            }}
        >
            <Tabs.Screen
                name="dashboard/index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="queue/index"
                options={{
                    title: 'Queue',
                    tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="bookings/index"
                options={{
                    title: 'Bookings',
                    tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="shop/index"
                options={{
                    title: 'Shop',
                    tabBarIcon: ({ color, size }) => <Store size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="more/index"
                options={{
                    title: 'More',
                    tabBarIcon: ({ color, size }) => <MoreHorizontal size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
