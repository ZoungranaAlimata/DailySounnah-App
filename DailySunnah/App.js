// App.js
import React, { useState, useEffect } from 'react';
import { Platform, Alert, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

import { SSContexts } from './contexts/SSContexts';

// Screens
import HomeScreen from './app/screens/HomeScreen';
import HadithsScreen from './app/screens/HadithsScreen';
import SettingsScreen from './app/screens/SettingsScreen';
import BookmarksScreen from './app/screens/BookmarksScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator(); 

// Bottom Tabs including Bookmarks
const HomeTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#01a825ff',
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} />,
      }}
    />
    <Tab.Screen
      name="Bookmarks"
      component={BookmarksScreen}
      options={{
        tabBarLabel: 'Bookmarks',
        tabBarIcon: ({ color, size }) => <Feather name="bookmark" color={color} size={size} />,
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        tabBarLabel: 'Settings',
        tabBarIcon: ({ color, size }) => <Feather name="settings" color={color} size={size} />,
      }}
    />
  </Tab.Navigator>
);

export default function App() {
  const [hadithBook, setHadithBook] = useState('bukhari');
  const [hadithLang, setHadithLang] = useState('eng');
  const [internet, setInternet] = useState(true);

  // Load book and language from AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const book = await AsyncStorage.getItem('book');
        const lang = await AsyncStorage.getItem('lang');

        if (book) setHadithBook(book);
        else await AsyncStorage.setItem('book', 'bukhari');

        if (lang) setHadithLang(lang);
        else await AsyncStorage.setItem('lang', 'eng');
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    };
    loadSettings();
  }, []);

  // Check internet connectivity
  const checkInternetConnection = async () => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
      if (!response.ok) return false;
      await response.json();
      return true;
    } catch {
      return false;
    }
  };

  // Check internet on app start
  useEffect(() => {
    checkInternetConnection().then((hasInternet) => {
      setInternet(hasInternet);
      if (!hasInternet) Alert.alert('No Internet', 'Please check your internet connection');
    });
  }, []);

  return (
    <SSContexts.Provider value={{ hadithBook, setHadithBook, hadithLang, setHadithLang }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              marginTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
            },
          }}
        >
          <Stack.Screen name="MainTabs" component={HomeTabs} options={{ headerShown: false }} />
          <Stack.Screen name="Hadiths" component={HadithsScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SSContexts.Provider>
  );
}