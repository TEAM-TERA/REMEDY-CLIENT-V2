/**
 * Vote drop detail — GET /droppings/{id} (VOTE), POST/DELETE /droppings/{id}/vote.
 * Shows the topic + option tracks with live vote bars; tapping an option casts
 * (or switches / retracts) the vote, then re-fetches. Includes the drop note,
 * like, and comments so a vote drop is a full social object.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SongCover } from '@/components/SongCover';
import { Avatar } from '@/components/Avatar';
import { PromptModal } from '@/components/PromptModal';
import { Check, ChevronLeft, DotsVertical, Heart, SendPencil, Vote as VoteIcon } from '@/components/Icons';
import { colors, font } from '@/theme/tokens';
import { castVote, getVoteDropDetail, retractVote, type VoteDropDetail } from '@/services/backend';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { Comment } from '@/types';
import type { RootStackParamList } from '@/navigation/types';

const EMPTY: Comment[] = [];

export default function VoteDropScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'VoteDrop'>>();
  const insets = useSafeAreaInsets();
  const dropId = route.params.dropId;

  const likedDropIds = useAppStore((s) => s.likedDropIds);
  const toggleDropLike = useAppStore((s) => s.toggleDropLike);
  const allComments = useAppStore((s) => s.comments);
  const comments = allComments[dropId] ?? EMPTY;
  const loadComments = useAppStore((s) => s.loadComments);
  const addComment = useAppStore((s) => s.addComment);
  const editComment = useAppStore((s) => s.editComment);
  const removeComment = useAppStore((s) => s.removeComment);
  const myName = useAuthStore((s) => s.user?.username ?? '');

  const [detail, setDetail] = useState<VoteDropDetail | null>(null);
  const [voting, setVoting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editTarget, setEditTarget] = useState<Comment | null>(null);
  const alive = useRef(true);

  const load = useCallback(async () => {
    try {
      const d = await getVoteDropDetail(dropId);
      if (alive.current) setDetail(d);
    } catch {
      /* ignore */
    }
  }, [dropId]);

  useEffect(() => {
    alive.current = true;
    load();
    loadComments(dropId);
    return () => {
      alive.current = false;
    };
  }, [dropId, load, loadComments]);

  const liked = likedDropIds.includes(dropId);

  const onVote = async (songId: string) => {
    if (!detail || voting) return;
    setVoting(true);
    try {
      if (detail.userVotedOption === songId) {
        await retractVote(dropId);
      } else {
        if (detail.userVotedOption) await retractVote(dropId);
        await castVote(dropId, songId);
      }
    } catch {
      Alert.alert('투표하지 못했어요', '잠시 후 다시 시도해주세요.');
    } finally {
      // always re-sync with server state (handles a half-applied vote switch)
      await load();
      setVoting(false);
    }
  };

  const onSend = async () => {
    const t = commentText.trim();
    if (!t) return;
    setCommentText('');
    const res = await addComment(dropId, t);
    if (!res.ok) {
      setCommentText(t);
      Alert.alert('댓글을 남기지 못했어요', res.message);
    }
  };

  const onCommentMenu = (c: Comment) => {
    Alert.alert('댓글', undefined, [
      { text: '수정', onPress: () => setEditTarget(c) },
      { text: '삭제', style: 'destructive', onPress: () => removeComment(dropId, c.id) },
      { text: '취소', style: 'cancel' },
    ]);
  };

  if (!detail) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color={colors.pink} />
      </View>
    );
  }

  const total = detail.totalVotes || 0;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn} accessibilityLabel="뒤로">
          <ChevronLeft size={20} color="#fff" strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.title}>투표</Text>
        <Pressable onPress={() => toggleDropLike(dropId)} hitSlop={8} style={styles.iconBtn} accessibilityLabel="좋아요">
          <Heart size={20} filled={liked} color={liked ? colors.pink : '#fff'} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.topicCard}>
          <View style={styles.topicTag}>
            <VoteIcon size={14} color={colors.pink} strokeWidth={2.2} />
            <Text style={styles.topicTagText}>투표</Text>
          </View>
          <Text style={styles.topic}>{detail.topic}</Text>
          {detail.content ? <Text style={styles.content}>{detail.content}</Text> : null}
          <Text style={styles.totalVotes}>{total}명 참여</Text>
        </View>

        <View style={{ gap: 12, marginTop: 4 }}>
          {detail.options.map((o) => {
            const pct = total > 0 ? Math.round((o.voteCount / total) * 100) : 0;
            const mine = detail.userVotedOption === o.songId;
            return (
              <Pressable key={o.songId} onPress={() => onVote(o.songId)} disabled={voting} style={[styles.option, mine && styles.optionMine]}>
                <View style={[styles.optionFill, { width: `${pct}%` }, mine && styles.optionFillMine]} />
                <SongCover songId={o.songId} artworkUrl={o.albumImagePath} size={46} radius={10} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.optTitle} numberOfLines={1}>{o.title}</Text>
                  <Text style={styles.optArtist} numberOfLines={1}>{o.artist}</Text>
                </View>
                <View style={styles.optRight}>
                  {mine && <Check size={16} color={colors.pink} strokeWidth={2.6} />}
                  <Text style={[styles.optPct, mine && { color: colors.pink }]}>{pct}%</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.hint}>{detail.userVotedOption ? '다시 누르면 투표를 취소해요.' : '마음에 드는 곡을 눌러 투표해보세요.'}</Text>

        {/* comments */}
        <View style={{ marginTop: 30 }}>
          <Text style={styles.commentsLabel}>댓글 {comments.length}</Text>
          <View style={styles.commentInputRow}>
            <View style={styles.commentInput}>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="이 투표에 한마디"
                placeholderTextColor="rgba(255,255,255,0.38)"
                style={styles.commentTextInput}
                returnKeyType="send"
                onSubmitEditing={onSend}
              />
            </View>
            <Pressable style={styles.sendBtn} onPress={onSend} accessibilityLabel="댓글 등록">
              <SendPencil size={18} color="#2a1530" />
            </Pressable>
          </View>
          <View style={{ marginTop: 18, gap: 18 }}>
            {comments.length === 0 && <Text style={styles.commentEmpty}>아직 댓글이 없어요.</Text>}
            {comments.map((c) => {
              const mine = !!myName && c.authorName === myName;
              return (
                <View key={c.id} style={styles.commentRow}>
                  <Avatar name={c.authorName || '익명'} size={36} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.commentUser}>{c.authorName || '익명'}</Text>
                    <Text style={styles.commentText}>{c.text}</Text>
                  </View>
                  {mine && (
                    <Pressable onPress={() => onCommentMenu(c)} hitSlop={8} accessibilityLabel="내 댓글 메뉴">
                      <DotsVertical size={18} />
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <PromptModal
        visible={!!editTarget}
        title="댓글 수정"
        initialValue={editTarget?.text ?? ''}
        confirmLabel="수정"
        maxLength={200}
        onCancel={() => setEditTarget(null)}
        onSubmit={async (text) => {
          const target = editTarget;
          setEditTarget(null);
          if (target) {
            const res = await editComment(dropId, target.id, text);
            if (!res.ok) Alert.alert('수정하지 못했어요', res.message);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: font.serifBold, fontSize: 18, color: '#fff' },
  scroll: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 44 },

  topicCard: { borderRadius: 20, padding: 20, backgroundColor: 'rgba(255,143,182,0.06)', borderWidth: 1, borderColor: 'rgba(255,143,182,0.2)', marginBottom: 18 },
  topicTag: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, backgroundColor: 'rgba(255,143,182,0.12)' },
  topicTagText: { fontFamily: font.bold, fontSize: 11.5, color: colors.pink },
  topic: { fontFamily: font.serifBold, fontSize: 22, lineHeight: 30, color: '#fff', marginTop: 12 },
  content: { fontFamily: font.regular, fontSize: 14, lineHeight: 21, color: 'rgba(255,255,255,0.65)', marginTop: 10 },
  totalVotes: { fontFamily: font.semibold, fontSize: 12.5, color: 'rgba(255,255,255,0.5)', marginTop: 12 },

  option: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 11, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  optionMine: { borderColor: 'rgba(255,143,182,0.55)' },
  optionFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.06)' },
  optionFillMine: { backgroundColor: 'rgba(255,143,182,0.16)' },
  optTitle: { fontFamily: font.semibold, fontSize: 15, color: '#fff' },
  optArtist: { fontFamily: font.regular, fontSize: 12.5, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  optRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  optPct: { fontFamily: font.bold, fontSize: 15, color: 'rgba(255,255,255,0.85)' },
  hint: { fontFamily: font.regular, fontSize: 12.5, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 14 },

  commentsLabel: { fontFamily: font.bold, fontSize: 15, color: '#fff', marginBottom: 14 },
  commentInputRow: { flexDirection: 'row', gap: 10 },
  commentInput: { flex: 1, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', paddingHorizontal: 16 },
  commentTextInput: { fontFamily: font.regular, fontSize: 13.5, color: '#fff', padding: 0 },
  sendBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#ff8fb6', alignItems: 'center', justifyContent: 'center' },
  commentEmpty: { fontFamily: font.regular, fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  commentRow: { flexDirection: 'row', gap: 12 },
  commentUser: { fontFamily: font.bold, fontSize: 14, color: '#fff' },
  commentText: { fontFamily: font.regular, fontSize: 14, lineHeight: 21, color: 'rgba(255,255,255,0.78)', marginTop: 4 },
});
