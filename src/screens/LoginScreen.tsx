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

const PROVIDERS: { label: string; value: ProviderType; placeholder: string }[] = [
  { label: 'Kavita', value: 'kavita', placeholder: 'http://192.168.1.100:5000' },
  { label: 'Komga',  value: 'komga',  placeholder: 'http://192.168.1.100:25600' },
];

export default function LoginScreen() {
  const { login, isLoading, error } = useAuthStore();

  const [providerType, setProviderType] = useState<ProviderType>('kavita');
  const [serverUrl, setServerUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const selectedProvider = PROVIDERS.find((p) => p.value === providerType)!;

  async function handleLogin() {
    if (!serverUrl || !username || !password) return;
    const config: ServerConfig = {
      id: `${providerType}-default`,
      name: `My ${selectedProvider.label}`,
      serverUrl: serverUrl.trim(),
      providerType,
    };
    await login(config, username, password);
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-12">
        <Text className="text-3xl font-bold text-primary-700 mb-2">Lektio</Text>
        <Text className="text-base text-gray-500 mb-10">Connect to your library</Text>

        {/* Provider picker */}
        <Text className="text-sm font-medium text-gray-700 mb-2">Server type</Text>
        <View className="flex-row gap-2 mb-6">
          {PROVIDERS.map((p) => (
            <TouchableOpacity
              key={p.value}
              onPress={() => setProviderType(p.value)}
              className={`flex-1 py-2.5 rounded-lg border items-center ${
                providerType === p.value
                  ? 'bg-primary-600 border-primary-600'
                  : 'border-gray-300 bg-white'
              }`}
            >
              <Text
                className={`font-semibold text-sm ${
                  providerType === p.value ? 'text-white' : 'text-gray-700'
                }`}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-sm font-medium text-gray-700 mb-1">Server URL</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base text-gray-900"
          placeholder={selectedProvider.placeholder}
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
