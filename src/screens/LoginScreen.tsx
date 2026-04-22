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
import { BookOpen, Compass, Library, Sparkles } from 'lucide-react-native';
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
  const { accent, muted, primary, secondary } = useThemeColors();

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
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="relative overflow-hidden rounded-[32px] border border-border bg-surface px-5 pb-6 pt-5">
          <View className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent-soft-strong" />
          <View className="absolute -left-10 top-24 h-24 w-24 rounded-full bg-accent-soft" />

          <View className="mb-4 self-start rounded-full bg-accent-soft px-3 py-2">
            <Text className="text-xs font-semibold uppercase tracking-wide text-accent">
              Welcome
            </Text>
          </View>

          <Text className="text-3xl font-bold text-secondary">Lektio</Text>
          <Text className="mt-2 text-sm leading-6 text-tertiary">
            Connect to your Komga library or hand someone the app and let them explore the bundled demo shelf right from their phone.
          </Text>

          <View className="mt-5 flex-row flex-wrap gap-3">
            <View className="min-w-[30%] flex-1 rounded-2xl border border-border bg-background px-3 py-3">
              <Text className="text-[11px] font-bold uppercase tracking-wide text-tertiary">
                Demo Ready
              </Text>
              <Text className="mt-1 text-sm font-semibold text-secondary">2 libraries</Text>
            </View>
            <View className="min-w-[30%] flex-1 rounded-2xl border border-border bg-background px-3 py-3">
              <Text className="text-[11px] font-bold uppercase tracking-wide text-tertiary">
                Browse
              </Text>
              <Text className="mt-1 text-sm font-semibold text-secondary">10 series</Text>
            </View>
            <View className="min-w-[30%] flex-1 rounded-2xl border border-border bg-background px-3 py-3">
              <Text className="text-[11px] font-bold uppercase tracking-wide text-tertiary">
                Read
              </Text>
              <Text className="mt-1 text-sm font-semibold text-secondary">38 books</Text>
            </View>
          </View>
        </View>

        <View className="mt-4 overflow-hidden rounded-[28px] border border-border bg-surface">
          <View className="border-b border-border px-5 py-4">
            <Text className="text-xs font-semibold uppercase tracking-wide text-tertiary">
              Server Login
            </Text>
            <Text className="mt-1 text-xl font-bold text-secondary">Connect your library</Text>
            <Text className="mt-1 text-sm leading-6 text-tertiary">
              Sign in with your Komga server to browse your own shelves.
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
                      selected ? 'border-secondary bg-secondary' : 'border-border bg-background'
                    }`}
                  >
                    <Text className={`text-sm font-semibold ${selected ? 'text-primary' : 'text-secondary'}`}>
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

            <Pressable
              className="items-center rounded-2xl bg-secondary py-4"
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={primary} />
              ) : (
                <Text className="text-base font-semibold text-primary">Connect</Text>
              )}
            </Pressable>
          </View>
        </View>

        <View className="mt-4 overflow-hidden rounded-[28px] border border-border bg-surface">
          <View className="border-b border-border px-5 py-4">
            <View className="mb-3 self-start rounded-full bg-accent-soft px-3 py-2">
              <Text className="text-xs font-semibold uppercase tracking-wide text-accent">
                Demo Library
              </Text>
            </View>
            <Text className="text-xl font-bold text-secondary">Hand it over and let them browse</Text>
            <Text className="mt-1 text-sm leading-6 text-tertiary">
              No server setup, no credentials, no extra steps. The demo session is stored on-device until they sign out.
            </Text>
          </View>

          <View className="gap-3 px-5 py-5">
            <View className="flex-row flex-wrap gap-2">
              <View className="rounded-full bg-background px-3 py-2">
                <View className="flex-row items-center gap-2">
                  <Library size={14} color={accent} />
                  <Text className="text-xs font-semibold text-secondary">Libraries</Text>
                </View>
              </View>
              <View className="rounded-full bg-background px-3 py-2">
                <View className="flex-row items-center gap-2">
                  <Compass size={14} color={accent} />
                  <Text className="text-xs font-semibold text-secondary">Series</Text>
                </View>
              </View>
              <View className="rounded-full bg-background px-3 py-2">
                <View className="flex-row items-center gap-2">
                  <BookOpen size={14} color={accent} />
                  <Text className="text-xs font-semibold text-secondary">Books</Text>
                </View>
              </View>
              <View className="rounded-full bg-background px-3 py-2">
                <View className="flex-row items-center gap-2">
                  <Sparkles size={14} color={accent} />
                  <Text className="text-xs font-semibold text-secondary">Collections</Text>
                </View>
              </View>
            </View>

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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
