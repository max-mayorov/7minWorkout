import { Tabs } from 'expo-router/js-tabs';

import { Icon } from '../../components/ui';
import { colors } from '../../theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '800', letterSpacing: 0.5 },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '7 MINUTE',
          tabBarLabel: 'Workouts',
          tabBarIcon: ({ focused }) => (
            <Icon name="dumbbell" color={focused ? colors.accent : colors.textMuted} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          tabBarIcon: ({ focused }) => (
            <Icon name="calendar-check" color={focused ? colors.accent : colors.textMuted} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <Icon name="cog" color={focused ? colors.accent : colors.textMuted} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
