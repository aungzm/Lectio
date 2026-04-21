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
import { isDemoModeEnabled } from '@/demo/config';

const PROVIDERS: { label: string; value: ProviderType; placeholder: string }[] = [
  { label: 'Komga', value: 'komga', placeholder: 'http://192.168.1.100:25600' },
];

export default function LoginScreen() {
  const { login, isLoading, error } = useAuthStore();
  const demoMode = isDemoModeEnabled();

  const [providerType, setProviderType] = useState<ProviderType>('komga');
  const [serverUrl, setServerUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const selectedProvider = PROVIDERS.find((p) => p.value === providerType)!;

  async function handleLogin() {
    if (demoMode) {
      const config: ServerConfig = {
        id: 'demo-library',
        name: 'Lektio Demo Library',
        serverUrl: 'demo://library',
        providerType,
      };
      await login(config, '', '');
      return;
    }

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
        <Text className="mb-2 text-3xl font-bold text-primary-700">Lektio</Text>
        <Text className="mb-10 text-base text-gray-500">
          {demoMode ? 'Explore the bundled demo library' : 'Connect to your library'}
        </Text>

        {!demoMode ? (
          <>
            <Text className="mb-2 text-sm font-medium text-gray-700">Server type</Text>
            <View className="mb-6 flex-row gap-2">
              {PROVIDERS.map((provider) => (
                <TouchableOpacity
                  key={provider.value}
                  onPress={() => setProviderType(provider.value)}
                  className={`flex-1 items-center rounded-lg border py-2.5 ${
                    providerType === provider.value
                      ? 'border-primary-600 bg-primary-600'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      providerType === provider.value ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {provider.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="mb-1 text-sm font-medium text-gray-700">Server URL</Text>
            <TextInput
              className="mb-4 rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900"
              placeholder={selectedProvider.placeholder}
              value={serverUrl}
              onChangeText={setServerUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <Text className="mb-1 text-sm font-medium text-gray-700">Username</Text>
            <TextInput
              className="mb-4 rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900"
              placeholder="admin"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text className="mb-1 text-sm font-medium text-gray-700">Password</Text>
            <TextInput
              className="mb-6 rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900"
              placeholder="********"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </>
        ) : (
          <View className="mb-6 rounded-2xl border border-primary-100 bg-primary-50 px-4 py-4">
            <Text className="mb-1 text-sm font-semibold text-primary-700">Demo mode enabled</Text>
            <Text className="text-sm leading-6 text-gray-600">
              This build uses bundled public-domain sample metadata, so anyone can open the app without setting up a Komga server first.
            </Text>
          </View>
        )}

        {error ? (
          <Text className="mb-4 text-sm text-red-500">{error}</Text>
        ) : null}

        <TouchableOpacity
          className="items-center rounded-lg bg-primary-600 py-4"
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-semibold text-white">
              {demoMode ? 'Enter Demo Library' : 'Connect'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
