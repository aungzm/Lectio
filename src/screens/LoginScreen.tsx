import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuthStore } from '@/store/authStore';
import type { ProviderType, ServerConfig } from '@/store/authStore';
import { useThemeColors } from '@/theme/useThemeColors';

const PROVIDERS: { label: string; value: ProviderType; placeholder: string }[] = [
  { label: 'Komga', value: 'komga', placeholder: 'http://192.168.1.100:25600' },
];

function SurfaceInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType,
  placeholderTextColor,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'url';
  placeholderTextColor: string;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-tertiary">
        {label}
      </Text>
      <TextInput
        className="rounded-2xl border border-border bg-background px-4 py-3.5 text-base text-secondary"
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
    </View>
  );
}

export default function LoginScreen() {
  const { login, continueWithDemo, isLoading, error } = useAuthStore();
  const { muted, secondary, tertiary, accent, accentDark } = useThemeColors();

  const [providerType, setProviderType] = useState<ProviderType>('komga');
  const [serverUrl, setServerUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const selectedProvider = PROVIDERS.find((provider) => provider.value === providerType)!;

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

  async function handleContinueWithDemo() {
    await continueWithDemo();
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="relative overflow-hidden rounded-[32px] border border-border bg-surface">
          <View className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-accent-soft-strong" />
          <View className="absolute -left-10 top-28 h-24 w-24 rounded-full bg-accent-soft" />

          <View className="border-b border-border px-5 pb-5 pt-6">
            <View className="mb-4 self-start rounded-full bg-accent-soft px-3 py-2">
              <Text className="text-xs font-semibold uppercase tracking-wide text-accent">
                Connect your library
              </Text>
            </View>
            <Text className="text-3xl font-bold text-secondary">Sign in to Lektio</Text>
            <Text className="mt-2 max-w-[320px] text-sm leading-6 text-tertiary">
              Use your Komga server details, or open the bundled demo library instead.
            </Text>
          </View>

          <View className="px-5 py-5">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-tertiary">
              Server Type
            </Text>
            <View className="mb-5 flex-row gap-2">
              {PROVIDERS.map((provider) => {
                const selected = providerType === provider.value;

                return (
                  <Pressable
                    key={provider.value}
                    onPress={() => setProviderType(provider.value)}
                    className={`flex-1 items-center rounded-2xl border px-4 py-3 ${
                      selected ? 'border-accent bg-accent-soft' : 'border-border bg-background'
                    }`}
                  >
                    <Text className={`text-sm font-semibold ${selected ? 'text-accent' : 'text-secondary'}`}>
                      {provider.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <SurfaceInput
              label="Server URL"
              placeholder={selectedProvider.placeholder}
              value={serverUrl}
              onChangeText={setServerUrl}
              keyboardType="url"
              placeholderTextColor={muted}
            />
            <SurfaceInput
              label="Username"
              placeholder="admin"
              value={username}
              onChangeText={setUsername}
              placeholderTextColor={muted}
            />
            <SurfaceInput
              label="Password"
              placeholder="********"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={muted}
            />

            {error ? (
              <View className="mb-4 rounded-2xl border border-danger-border bg-danger-soft px-4 py-3">
                <Text className="text-sm text-danger">{error}</Text>
              </View>
            ) : null}

            <View className="gap-3">
              <Pressable
                className="items-center rounded-2xl border border-accent bg-accent-soft py-4"
                onPress={handleLogin}
                disabled={isLoading}
                style={{ shadowColor: accent, shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 1 }}
              >
                {isLoading ? (
                  <ActivityIndicator color={accentDark} />
                ) : (
                  <Text className="text-base font-semibold text-accent">Login</Text>
                )}
              </Pressable>

              <Pressable
                className="items-center rounded-2xl border border-border bg-background py-4"
                onPress={handleContinueWithDemo}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={secondary} />
                ) : (
                  <Text className="text-base font-semibold text-secondary">Continue with Demo</Text>
                )}
              </Pressable>
            </View>

            <Text className="mt-4 text-center text-sm leading-6 text-tertiary">
              Demo mode stays on this device until sign out.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
