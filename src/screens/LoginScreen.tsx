import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuthStore } from '@/store/authStore';
import type { ProviderType, ServerConfig } from '@/store/authStore';

export default function LoginScreen() {
  const { login, isLoading, error } = useAuthStore();

  const [serverUrl, setServerUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    if (!serverUrl || !username || !password) return;
    const config: ServerConfig = {
      id: 'kavita-default',
      name: 'My Kavita',
      serverUrl: serverUrl.trim(),
      providerType: 'kavita' as ProviderType,
    };
    await login(config, username, password);
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-12">
        <Text className="text-3xl font-bold text-primary-700 mb-2">Lektio</Text>
        <Text className="text-base text-gray-500 mb-10">Connect to your library</Text>

        <Text className="text-sm font-medium text-gray-700 mb-1">Server URL</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base text-gray-900"
          placeholder="http://192.168.1.100:5000"
          value={serverUrl}
          onChangeText={setServerUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />

        <Text className="text-sm font-medium text-gray-700 mb-1">Username</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base text-gray-900"
          placeholder="admin"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 mb-6 text-base text-gray-900"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? (
          <Text className="text-red-500 text-sm mb-4">{error}</Text>
        ) : null}

        <TouchableOpacity
          className="bg-primary-600 rounded-lg py-4 items-center"
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">Connect</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
