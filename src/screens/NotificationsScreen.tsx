/**
 * Notifications — GET /notifications, PATCH read / read-all. Tapping a row marks
 * it read. (SSE /notifications/subscribe needs an EventSource polyfill in RN, so
 * this list refreshes on focus + a manual pull instead of streaming live.)
 */
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Bell, ChevronLeft, Heart, SendPencil, DropMark } from '@/components/Icons';
import { colors, font } from '@/theme/tokens';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '@/services/backend';
import type { AppNotification } from '@/types';
import type { RootStackParamList } from '@/navigation/types';

function messageFor(n: AppNotification): string {
  const who = n.actorName || '누군가';
  if (n.type === 'LIKE') return `${who}님이 회원님의 드랍을 좋아해요`;
  if (n.type === 'COMMENT') return `${who}님이 댓글을 남겼어요${n.commentContent ? `: ${n.commentContent}` : ''}`;
  return `${who}님이 근처에 음악을 드랍했어요`;
}

function IconFor({ type }: { type: AppNotification['type'] }) {
  if (type === 'LIKE') return <Heart size={16} filled color={colors.pink} />;
  if (type === 'COMMENT') return <SendPencil size={15} color={colors.sky} />;
  return <DropMark size={16} color={colors.yellow} strokeWidth={2.2} />;
}

export default function NotificationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await getNotifications());
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onTap = async (n: AppNotification) => {
    if (n.isRead) return;
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
    try {
      await markNotificationRead(n.id);
    } catch {
      /* ignore */
    }
  };

  const onReadAll = async () => {
    setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
    try {
      await markAllNotificationsRead();
    } catch {
      /* ignore */
    }
  };

  const hasUnread = items.some((n) => !n.isRead);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn} accessibilityLabel="뒤로">
          <ChevronLeft size={20} color="#fff" strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.title}>알림</Text>
        <Pressable onPress={onReadAll} disabled={!hasUnread} style={{ opacity: hasUnread ? 1 : 0.4 }}>
          <Text style={styles.readAll}>모두 읽음</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.pink} /></View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Bell size={40} color="rgba(255,255,255,0.25)" strokeWidth={1.6} />
          <Text style={styles.empty}>아직 알림이 없어요.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {items.map((n) => (
            <Pressable key={n.id} onPress={() => onTap(n)} style={[styles.row, !n.isRead && styles.rowUnread]}>
              <View style={styles.avatarWrap}>
                <Avatar name={n.actorName || '익명'} size={42} />
                <View style={styles.typeBadge}><IconFor type={n.type} /></View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.msg} numberOfLines={2}>{messageFor(n)}</Text>
                <Text style={styles.date}>{n.dateLabel}</Text>
              </View>
              {!n.isRead && <View style={styles.dot} />}
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  header: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: font.serifBold, fontSize: 18, color: '#fff' },
  readAll: { fontFamily: font.semibold, fontSize: 13.5, color: colors.pink },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  empty: { fontFamily: font.regular, fontSize: 14, color: 'rgba(255,255,255,0.4)' },
  list: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 40, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 13, paddingHorizontal: 12, borderRadius: 14 },
  rowUnread: { backgroundColor: 'rgba(255,143,182,0.06)' },
  avatarWrap: { width: 42, height: 42 },
  typeBadge: { position: 'absolute', right: -4, bottom: -4, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.bgBase, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  msg: { fontFamily: font.regular, fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.9)' },
  date: { fontFamily: font.regular, fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.pinkDeep },
});
