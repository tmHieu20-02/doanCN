import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';

type Props = {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
};

export default function ImagePickerField({ value, onChange, label }: Props) {
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [uploading, setUploading] = useState(false);
  const dropRef = useRef<any>(null);
  const fileInputRef = useRef<any>(null);

  useEffect(() => {
    setPreview(value ?? null);
  }, [value]);

  useEffect(() => {
    if ((Platform as any).OS !== 'web') return;
    const el = dropRef.current as any;
    if (!el) return;

    const onDrop = async (e: any) => {
      e.preventDefault();
      const f = e.dataTransfer?.files?.[0];
      if (!f) return;
      setPreview(URL.createObjectURL(f));
      setUploading(true);
      try {
        const url = await uploadToCloudinary(f);
        onChange(url);
      } catch (err) {
        console.warn('upload error', err);
      } finally {
        setUploading(false);
      }
    };

    const onDragOver = (e: any) => e.preventDefault();
    el.addEventListener('dragover', onDragOver);
    el.addEventListener('drop', onDrop);

    return () => {
      el.removeEventListener('dragover', onDragOver);
      el.removeEventListener('drop', onDrop);
    };
  }, [dropRef.current]);

  const openNative = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      } as any);
      if ((res as any).canceled) return;
      const asset = (res as any).assets?.[0] ?? null;
      if (!asset) return;

      setPreview(asset.uri);
      setUploading(true);
      try {
        const url = await uploadToCloudinary(asset.uri);
        onChange(url);
      } catch (err) {
        console.warn('upload error', err);
      } finally {
        setUploading(false);
      }
    } catch (err) {
      console.warn('image picker error', err);
    }
  };

  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={s.label}>{label}</Text> : null}

      <View ref={dropRef} style={s.dropArea as any}>
        {preview ? (
          Platform.OS === 'web' ? (
            // native tag on web gives best object-fit control
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Image source={{ uri: preview }} style={s.preview} />
          )
        ) : (
          <Pressable
            onPress={() => {
              if ((Platform as any).OS === 'web') {
                fileInputRef.current?.click?.();
                return;
              }
              openNative();
            }}
            style={{ alignItems: 'center', paddingVertical: 12 }}
          >
            <Text style={{ color: '#6B7280' }}>Chọn ảnh từ album / nhấn để mở</Text>
            <Text style={{ color: '#9CA3AF', marginTop: 6, fontSize: 12 }}>(Kéo thả ảnh vào đây trên web)</Text>
          </Pressable>
        )}
      </View>

      <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
        {uploading && <ActivityIndicator size="small" color="#111" />}
        {preview ? (
          <Pressable
            onPress={() => {
              setPreview(null);
              onChange(null);
            }}
            style={{ padding: 8 }}
          >
            <Text style={{ color: '#EF4444' }}>Xóa ảnh</Text>
          </Pressable>
        ) : null}
      </View>

      {((Platform as any).OS === 'web') && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={async (e: any) => {
            const f = e?.target?.files?.[0];
            if (!f) return;
            setPreview(URL.createObjectURL(f));
            setUploading(true);
            try {
              const url = await uploadToCloudinary(f);
              onChange(url);
            } catch (err) {
              console.warn('upload error', err);
            } finally {
              setUploading(false);
            }
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  dropArea: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBFBFB',
    overflow: 'hidden',
  },
  preview: { width: '100%', height: '100%', resizeMode: 'cover' },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 6, color: '#444' },
});
