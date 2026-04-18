import React from 'react';
import { View } from 'react-native';
import { MetadataSection } from '@/components/MetadataSection';

interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
}

export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <View className="mb-4 rounded-[28px] border border-border bg-surface px-4 py-5">
      {title ? <MetadataSection label={title}>{children}</MetadataSection> : children}
    </View>
  );
}
