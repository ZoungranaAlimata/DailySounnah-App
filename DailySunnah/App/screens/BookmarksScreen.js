import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getJSON, setJSON, KEYS } from '../utils/storage';

export default function BookmarksScreen() {
  const [bookmarks, setBookmarks] = useState([]);
  const navigation = useNavigation();

  const load = useCallback(async () => {
    setBookmarks(await getJSON(KEYS.bookmarks, []));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const remove = useCallback(async (id) => {
    const next = bookmarks.filter(b => b.id !== id);
    setBookmarks(next);
    await setJSON(KEYS.bookmarks, next);
  }, [bookmarks]);

  const openHadith = useCallback((b) => {
    navigation.navigate('Hadiths', {
      hadithBook: b.book,
      sectionNo: b.section,
      hadithLang: b.lang,
      hadithNumber: b.number, // optional but useful
    });
  }, [navigation]);

  if (!bookmarks.length) {
    return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:16 }}>
        <Text>No bookmarks yet. Save your favorite hadiths from the list.</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={{ padding: 12 }}
      data={bookmarks}
      keyExtractor={(item, i) => item.id || String(i)}
      renderItem={({ item }) => (
        <View style={{ backgroundColor:'#fff', borderRadius:10, padding:12, marginBottom:10, elevation:2 }}>
          <Text style={{ marginBottom:8 }}>{item.text}</Text>
          <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
            <Text>{item.book} · Section {item.section} · #{item.number} · {item.lang}</Text>
            <View style={{ flexDirection:'row' }}>
              <TouchableOpacity onPress={() => openHadith(item)} style={{ marginRight:12 }}>
                <Text>Open</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => remove(item.id)}>
                <Text>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    />
  );
}
