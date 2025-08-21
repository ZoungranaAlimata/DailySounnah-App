import React, { useState, useEffect, useContext } from 'react';
import { View, Text, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity, Share, ToastAndroid, Alert } from 'react-native';
import styles from './constants/MyStyles.js'; 
import Icon from 'react-native-ico-material-design';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SSContexts } from '../../contexts/SSContexts.js';
import { Feather } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getJSON, setJSON, KEYS } from '../utils/storage';

const makeId = (book, section, number, lang) => `${book}:${section}:${number}:${lang}`;
const REACTIONS = ['👍','❤️','😊','🤲'];

export default function HadithsScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { hadithBook, hadithLang } = useContext(SSContexts);

  const [hadiths, setHadiths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [metadata, setMetadata] = useState({});
  const [loadedHadiths, setLoadedHadiths] = useState(true);

  // NEW states that you had outside
  const [bookmarks, setBookmarks] = useState([]);
  const [reactions, setReactions] = useState({});

  useEffect(() => {
    (async () => {
      setBookmarks(await getJSON(KEYS.bookmarks, []));
      setReactions(await getJSON(KEYS.reactions, {}));
    })();
  }, []);

  useEffect(() => {
    fetchData();
  }, [pageNumber, hadithLang]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${hadithLang}-${hadithBook}/sections/${route.params.sectionNo}.json`
      );
      const data = await response.json();
      setMetadata(data.metadata);
      setTotalPages(Math.ceil(data.hadiths.length / 20));
      const startIndex = (pageNumber - 1) * 20;
      const endIndex = pageNumber * 20;
      const newHadiths = data.hadiths.slice(startIndex, endIndex);
      setHadiths(prev => [...prev, ...newHadiths]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      setLoadedHadiths(false);
    }
  };

  const onToggleBookmark = async (h) => {
    const id = makeId(route.params.hadithBook, route.params.sectionNo, h.hadithnumber || h.hadithNumber, hadithLang);
    const exists = bookmarks.find(b => b.id === id);
    let next;
    if (exists) {
      next = bookmarks.filter(b => b.id !== id);
    } else {
      next = [
        { id, text: h.text, book: route.params.hadithBook, section: route.params.sectionNo, number: h.hadithnumber || h.hadithNumber, lang: hadithLang },
        ...bookmarks,
      ];
    }
    setBookmarks(next);
    await setJSON(KEYS.bookmarks, next);
    ToastAndroid?.show(exists ? 'Removed bookmark' : 'Bookmarked', ToastAndroid.SHORT);
  };

  const onShare = async (h) => {
    const message = `${h.text}\n\n— ${route.params.hadithBook} #${h.hadithnumber || h.hadithNumber}`;
    try { 
      await Share.share({ message }); 
    } catch (e) { 
      Alert.alert('Share failed', e?.message || String(e)); 
    }
  };

  const onReact = async (h, emoji) => {
    const id = makeId(route.params.hadithBook, route.params.sectionNo, h.hadithnumber || h.hadithNumber, hadithLang);
    const next = { ...reactions, [id]: reactions[id] === emoji ? undefined : emoji };
    Object.keys(next).forEach(k => next[k] === undefined && delete next[k]);
    setReactions(next);
    await setJSON(KEYS.reactions, next);
  };

  const HadithItem = ({ item }) => (
    <View style={styles.recCard}>
      <Text style={styles.recCardTitle}>Book {item.reference.book}, Hadith {item.reference.hadith}</Text>
      <Text style={styles.recCardContent}>{item.text}</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => onToggleBookmark(item)}>
          <Text>🔖 {bookmarks.some(b => b.id === makeId(route.params.hadithBook, route.params.sectionNo, item.hadithnumber, hadithLang)) ? 'Saved' : 'Save'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onShare(item)}>
          <Text>📤 Share</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row' }}>
          {REACTIONS.map(e => (
            <TouchableOpacity key={e} onPress={() => onReact(item, e)} style={{ marginLeft: 8 }}>
              <Text style={{ fontSize: 18 }}>
                {reactions[makeId(route.params.hadithBook, route.params.sectionNo, item.hadithnumber, hadithLang)] === e ? `${e}✓` : e}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.recCardFoot}>No. {item.hadithnumber}</Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (loading) return <ActivityIndicator size="large" color="#00d11cff" />;
    if (!loadedHadiths) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.recCard}>
            <Text style={styles.recCardTitle}>Something went wrong! What can you do?</Text>
            <Text style={styles.recCardContent}>1. Check your internet connection.</Text>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.recCardContent}>
                2. Try changing the language to Arabic (some books are only in Arabic).{' '}
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                  <Feather name="settings" style={{ margin: 4, fontSize: 24 }} color="#16bb00ff" />
                </TouchableOpacity>
              </Text>
            </View>
          </View>
        </SafeAreaView>
      );
    }
    return null;
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Icon name="keyboard-left-arrow-button" size="14" width="40" color="white" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'column' }}>
          {metadata.name && <Text style={styles.appTitle}>SunnahSnap - {metadata.name}</Text>}
          {metadata.section && (
            <Text style={styles.appSubtitle}>
              Section {Object.keys(metadata.section)[0]}: {metadata.section[Object.keys(metadata.section)[0]]}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={hadiths}
        keyExtractor={(item, index) => item.hadithnumber.toString() + index}
        renderItem={({ item }) => <HadithItem item={item} />}
        onEndReached={() => !loading && pageNumber < totalPages && setPageNumber(p => p + 1)}
        onEndReachedThreshold={0.2}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={renderHeader}
        stickyHeaderIndices={[0]}
      />
    </SafeAreaView>
  );
}
