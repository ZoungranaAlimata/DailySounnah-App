import React, { useState, useContext } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert, ScrollView } from 'react-native';
import styles from './constants/MyStyles.js'; 
import RNPickerSelect from 'react-native-picker-select';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SSContexts } from '../../contexts/SSContexts.js';

export default function SettingsScreen() {
  // Context values
  const { hadithBook, hadithLang, setHadithBook, setHadithLang } = useContext(SSContexts);

  // Settings states
  const [selectedValue, setSelectedValue] = useState(null);
  const [selectedValue2, setSelectedValue2] = useState(null);

  // Save Book
  const saveBook = async () => {
    try {
      if (selectedValue !== null) {
        await AsyncStorage.setItem('book', selectedValue);
        setHadithBook(selectedValue);
        Alert.alert('Done!', 'The new hadith book has been saved');
      } else {
        Alert.alert('Alert!', 'Please select something');
      }
    } catch (error) {
      console.error('Error saving book:', error);
    }
  };

  // Save Language
  const saveLang = async () => {
    try {
      if (selectedValue2 !== null) {
        await AsyncStorage.setItem('lang', selectedValue2);
        setHadithLang(selectedValue2);
        Alert.alert('Done!', 'The new hadith language has been saved');
      } else {
        Alert.alert('Alert!', 'Please select something');
      }
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  // Options
  const options = [
    { label: 'Sunan Abu Dawud', value: 'abudawud' },
    { label: 'Musnad Imam Abu Hanifa', value: 'abuhanifa' },
    { label: 'Sahih al Bukhari', value: 'bukhari' },
    { label: 'Forty Hadith of Shah Waliullah Dehlawi', value: 'dehlawi' },
    { label: 'Sunan Ibn Majah', value: 'ibnmajah' },
    { label: 'Muwatta Malik', value: 'malik' },
    { label: 'Sahih Muslim', value: 'muslim' },
    { label: 'Sunan an Nasai', value: 'nasai' },
    { label: 'Forty Hadith of an-Nawawi', value: 'nawawi' },
    { label: 'Forty Hadith Qudsi', value: 'qudsi' },
    { label: 'Jami At Tirmidhi', value: 'tirmidhi' },
  ];

  const options2 = [
    { label: 'English', value: 'eng' },
    { label: 'Arabic', value: 'ara' },
    { label: 'French', value: 'fr' },
  ];

  return (
    <ScrollView>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.appTitle}>DailySunnah</Text>
          <Text style={styles.appSubtitle}>Sayings of Prophet Muhammad (ﷺ)</Text>
        </View>

        <Text style={styles.sectionTitle}>Settings</Text> 

        {/* Book Selector */}
        <View style={styles.recCard}>
          <Text>Select a Hadith Book</Text>
          <RNPickerSelect
            placeholder={{ label: hadithBook, value: null }}
            items={options}
            onValueChange={(value) => setSelectedValue(value)}
            value={selectedValue}
          />
          {selectedValue && <Text>Selected: {selectedValue}</Text>}
          <TouchableOpacity onPress={saveBook}>
            <View style={{ padding: 10, backgroundColor: '#03c013ff', borderRadius: 10, justifyContent: 'center', alignItems: 'center', margin: 5 }}>
              <Text style={{ color: 'white' }}>Change</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Language Selector */}
        <View style={styles.recCard}>
          <Text>Select a Language for the Hadiths</Text>
          <RNPickerSelect
            placeholder={{ label: hadithLang, value: null }}
            items={options2}
            onValueChange={(value) => setSelectedValue2(value)}
            value={selectedValue2}
          />
          {selectedValue2 && <Text>Selected: {selectedValue2}</Text>}
          <TouchableOpacity onPress={saveLang}>
            <View style={{ padding: 10, backgroundColor: '#23b405ff', borderRadius: 10, justifyContent: 'center', alignItems: 'center', margin: 5 }}>
              <Text style={{ color: 'white' }}>Change</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Developer Info */}
        <View style={styles.recCard}>
          <Text style={styles.recCardTitle}>Developer Information</Text>
          <Text style={styles.recCardContent}>This app was made with love by Darul Kayr people</Text>
          <Text style={styles.recCardContent}>Check out our GitHub profile @</Text>
        </View>

        <View style={{ alignItems: 'center', margin: 10 }}>
          <Text style={{ alignItems: 'center', color: 'blue' }}>
            Copyright {new Date().getFullYear()}
          </Text>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}