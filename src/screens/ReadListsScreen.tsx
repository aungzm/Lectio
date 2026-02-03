import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import type { ReadListsScreenProps } from '@/navigation/types';
import type { ReadList } from '@/providers';

export default function ReadListsScreen({ navigation }: ReadListsScreenProps) {
  const { serverConfig, auth } = useAuthStore();
  const { readLists, isLoading, fetchReadLists } = useBrowseStore();

  useEffect(() => {
    if (serverConfig && auth) {
      fetchReadLists(serverConfig, auth.token);
    }
  }, [serverConfig, auth]);

  function handlePress(list: ReadList) {
    navigation.navigate('ReadListDetail', { readListId: list.id, readListName: list.name });
  }

  if (isLoading && readLists.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={readLists}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 py-4 gap-3"
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-gray-100 rounded-xl px-5 py-4 flex-row items-center justify-between"
            onPress={() => handlePress(item)}
          >
            <View className="flex-1 mr-4">
              <Text className="text-base font-semibold text-gray-900">{item.name}</Text>
              {item.summary ? (
                <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
                  {item.summary}
                </Text>
              ) : null}
            </View>
            <Text className="text-gray-400 text-lg">›</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-20">No reading lists found.</Text>
        }
      />
    </View>
  );
}
