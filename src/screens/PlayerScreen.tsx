/**
 * Player — README §4.3. Turntable hero (spinning LP + tonearm), title/like,
 * rainbow progress, transport controls, drop-note card, comments.
 * M3 binds playing/progress/controls to the real Spotify playback state.
 */
import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SongCover } from '@/components/SongCover';
import { SpinningRecord } from '@/components/anim/SpinningRecord';
import { Avatar } from '@/components/Avatar';
import { RainbowGradient } from '@/components/Gradient';
import {
  ChevronLeft,
  DotsVertical,
  Heart,
  LocationPin,
  NextTrack,
  Pause,
  Play,
  PrevTrack,
  SendPencil,
  ShareExternal,
  Shuffle,
} from '@/components/Icons';
import { colors, font } from '@/theme/tokens';
import { formatDuration } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import type { RootStackParamList } from '@/navigation/types';

const W = Dimensions.get('window').width;
const HERO = 448;
const RECORD = 280;

export default function PlayerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const currentSongId = useAppStore((s) => s.currentSongId);
  const selectedDropId = useAppStore((s) => s.selectedDropId);
  const playing = useAppStore((s) => s.playing);
  const progress = useAppStore((s) => s.progress);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const toggleLike = useAppStore((s) => s.toggleLike);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const lookupSong = useAppStore((s) => s.lookupSong);
  const drops = useAppStore((s) => s.drops); // subscribe so per-drop likes re-render
  const likedSongIds = useAppStore((s) => s.likedSongIds); // subscribe so heart re-renders
  const commentsByDrop = useAppStore((s) => s.comments); // subscribe so new comments render
  const addComment = useAppStore((s) => s.addComment);

  const song = lookupSong(currentSongId);
  // may be undefined when playing a song that isn't a drop (playlist / likes)
  const drop = drops.find((d) => d.id === selectedDropId);
  const liked = likedSongIds.includes(currentSongId);
  const likeCount = drop?.likeCount ?? 0;
  const comments = drop ? commentsByDrop[drop.id] ?? [] : [];
  const durationMs = song.durationMs ?? 192000;
  const elapsed = formatDuration((durationMs * progress) / 100, true);

  const [commentText, setCommentText] = useState('');
  const onSendComment = () => {
    const t = commentText.trim();
    if (!t || !drop) return;
    addComment(drop.id, t);
    setCommentText('');
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      {/* hero */}
      <View style={styles.hero}>
        <SongCover songId={currentSongId} artworkUrl={song.artworkUrl} size={W} height={HERO} radius={0} innerBorder={false} style={styles.heroCover} />
        <LinearGradient
          colors={['rgba(8,7,12,0.52)', 'rgba(8,7,12,0.16)', 'rgba(13,11,22,0.93)', colors.bgDeep]}
          locations={[0, 0.33, 0.85, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          style={[styles.back, { top: insets.top + 15 }]}
        >
          <ChevronLeft size={20} color="#fff" strokeWidth={2.2} />
        </Pressable>

        <View style={styles.recordWrap}>
          <SpinningRecord songId={currentSongId} artworkUrl={song.artworkUrl} size={RECORD} playing={playing} />
        </View>

        {/* tonearm */}
        <Svg width="100%" height="100%" viewBox="0 0 390 448" style={styles.tonearm} pointerEvents="none">
          <Line x1={342} y1={86} x2={357} y2={62} stroke="#cfccd6" strokeWidth={6} strokeLinecap="round" />
          <Circle cx={359} cy={60} r={8} fill="#2a2730" stroke="#4a4750" strokeWidth={1.5} />
          <Line x1={342} y1={86} x2={236} y2={222} stroke="#cfccd6" strokeWidth={5.5} strokeLinecap="round" />
          <Circle cx={342} cy={86} r={13} fill="#2a2730" stroke="#56525c" strokeWidth={2} />
          <Circle cx={342} cy={86} r={4.5} fill="#6a6671" />
          <Rect x={225} y={212} width={22} height={14} rx={3} transform="rotate(52 236 219)" fill="#3a3640" stroke="#56525c" strokeWidth={1} />
        </Svg>
      </View>

      <View style={styles.body}>
        {/* title row */}
        <View style={styles.titleRow}>
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.title}>{song.title}</Text>
            <Text style={styles.artist}>{song.artist}</Text>
          </View>
          <Pressable
            onPress={toggleLike}
            accessibilityRole="button"
            accessibilityLabel={liked ? '좋아요 취소' : '좋아요'}
            hitSlop={8}
            style={styles.likeBtn}
          >
            {drop && <Text style={styles.likeCount}>{likeCount}</Text>}
            <Heart size={22} filled={liked} />
          </Pressable>
        </View>

        {/* progress */}
        <View style={{ marginTop: 26 }}>
          <View style={styles.track}>
            <RainbowGradient style={[styles.progressFill, { width: `${progress}%` }]} />
            <View style={[styles.knob, { left: `${progress}%` }]} />
          </View>
          <View style={styles.times}>
            <Text style={styles.timeText}>{elapsed}</Text>
            <Text style={styles.timeText}>{formatDuration(durationMs, true)}</Text>
          </View>
        </View>

        {/* controls */}
        <View style={styles.controls}>
          <Pressable accessibilityRole="button" accessibilityLabel="셔플" hitSlop={12}>
            <Shuffle size={22} />
          </Pressable>
          <Pressable onPress={prevTrack} accessibilityRole="button" accessibilityLabel="이전 곡" hitSlop={12}>
            <PrevTrack size={30} color="#fff" />
          </Pressable>
          <Pressable
            onPress={togglePlay}
            accessibilityRole="button"
            accessibilityLabel={playing ? '일시정지' : '재생'}
            style={styles.playBtn}
          >
            {playing ? <Pause size={26} color="#fff" /> : <Play size={28} color="#fff" />}
          </Pressable>
          <Pressable onPress={nextTrack} accessibilityRole="button" accessibilityLabel="다음 곡" hitSlop={12}>
            <NextTrack size={30} color="#fff" />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="공유" hitSlop={12}>
            <ShareExternal size={22} />
          </Pressable>
        </View>

        {/* drop note + comments — only when this song is a drop */}
        {drop && (
        <>
        <View style={styles.noteCard}>
          <View style={styles.noteHead}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Avatar name={drop.authorName} size={22} />
              <Text style={styles.noteUser}>{drop.authorName}</Text>
            </View>
            <Text style={styles.noteDate}>{drop.dateLabel}</Text>
          </View>
          <Text style={styles.noteText}>{drop.note || '메시지 없음'}</Text>
          <View style={styles.noteLoc}>
            <LocationPin size={14} color="rgba(255,255,255,0.4)" strokeWidth={2} />
            <Text style={styles.noteLocText}>{drop.address}</Text>
          </View>
        </View>

        {/* comments */}
        <View style={{ marginTop: 26 }}>
          <View style={styles.commentInputRow}>
            <View style={styles.commentInput}>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="이 자리에 댓글을 남겨보세요"
                placeholderTextColor="rgba(255,255,255,0.38)"
                style={styles.commentTextInput}
                returnKeyType="send"
                onSubmitEditing={onSendComment}
              />
            </View>
            <Pressable style={styles.sendBtn} onPress={onSendComment} accessibilityRole="button" accessibilityLabel="댓글 등록">
              <SendPencil size={18} color="#2a1530" />
            </Pressable>
          </View>
          <View style={{ marginTop: 20, gap: 20 }}>
            {comments.length === 0 && (
              <Text style={styles.commentEmpty}>아직 댓글이 없어요. 첫 댓글을 남겨보세요.</Text>
            )}
            {comments.map((c) => (
              <View key={c.id} style={styles.commentRow}>
                <Avatar name={c.authorName} size={38} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.commentUser}>{c.authorName}</Text>
                    <Text style={styles.commentDate}>{c.dateLabel}</Text>
                  </View>
                  <Text style={styles.commentText}>{c.text}</Text>
                </View>
                <DotsVertical size={18} />
              </View>
            ))}
          </View>
        </View>
        </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgDeep },
  hero: { height: HERO, overflow: 'hidden' },
  heroCover: { position: 'absolute', top: 0, left: 0 },
  back: { position: 'absolute', top: 62, left: 18, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', zIndex: 6 },
  recordWrap: { position: 'absolute', left: '50%', top: '55%', marginLeft: -RECORD / 2, marginTop: -RECORD / 2 },
  tonearm: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 },

  body: { paddingHorizontal: 24, paddingBottom: 40, marginTop: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 },
  title: { fontFamily: font.serifBold, fontSize: 30, color: '#fff', lineHeight: 33 },
  artist: { fontFamily: font.regular, fontSize: 16, color: 'rgba(255,255,255,0.55)', marginTop: 5 },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingTop: 6 },
  likeCount: { fontFamily: font.regular, fontSize: 15, color: 'rgba(255,255,255,0.7)' },

  track: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.14)' },
  progressFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 2 },
  knob: { position: 'absolute', top: '50%', width: 14, height: 14, borderRadius: 7, backgroundColor: '#fff', marginLeft: -7, marginTop: -7, boxShadow: '0 2px 6px rgba(0,0,0,0.5)' },
  times: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  timeText: { fontFamily: font.regular, fontSize: 12.5, color: 'rgba(255,255,255,0.45)' },

  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22 },
  playBtn: { width: 74, height: 74, borderRadius: 37, borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)', backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center' },

  noteCard: { marginTop: 30, borderRadius: 22, padding: 20, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  noteHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  noteUser: { fontFamily: font.bold, fontSize: 15, color: '#fff' },
  noteDate: { fontFamily: font.regular, fontSize: 12.5, color: 'rgba(255,255,255,0.4)' },
  noteText: { fontFamily: font.regular, fontSize: 15, lineHeight: 23, color: 'rgba(255,255,255,0.85)', marginTop: 14 },
  noteLoc: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12 },
  noteLocText: { fontFamily: font.regular, fontSize: 13, color: 'rgba(255,255,255,0.5)' },

  commentInputRow: { flexDirection: 'row', gap: 10 },
  commentInput: { flex: 1, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', paddingHorizontal: 16 },
  commentTextInput: { fontFamily: font.regular, fontSize: 13.5, color: '#fff', padding: 0 },
  commentEmpty: { fontFamily: font.regular, fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  sendBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#ff8fb6', alignItems: 'center', justifyContent: 'center' },
  commentRow: { flexDirection: 'row', gap: 12 },
  commentUser: { fontFamily: font.bold, fontSize: 14, color: '#fff' },
  commentDate: { fontFamily: font.regular, fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  commentText: { fontFamily: font.regular, fontSize: 14, lineHeight: 21, color: 'rgba(255,255,255,0.78)', marginTop: 5 },
});
