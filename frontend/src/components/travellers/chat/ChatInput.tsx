import { useState, useRef, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  Image,
  MapPin,
  X,
  StopCircle,
  Loader2,
} from 'lucide-react';
import { ChatMessage } from './MessageBubble';
import styles from './ChatInput.module.css';
import toast from 'react-hot-toast';

interface ChatInputProps {
  onSend: (content: string, type?: 'text' | 'image' | 'voice' | 'location') => void | Promise<void>;
  onSendImage?: (file: File) => Promise<void>;
  onSendVoice?: (file: File, durationSeconds: number) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  replyingTo?: ChatMessage | null;
  onCancelReply?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const quickEmojis = [
  '\uD83D\uDE00',
  '\uD83D\uDE02',
  '\u2764\uFE0F',
  '\uD83D\uDC4D',
  '\uD83C\uDF89',
  '\uD83D\uDD25',
  '\uD83D\uDE0D',
  '\uD83E\uDD14',
  '\uD83D\uDC4F',
  '\u2728',
  '\uD83D\uDE4C',
  '\uD83D\uDCAF',
];

export function ChatInput({
  onSend,
  onSendImage,
  onSendVoice,
  onTyping,
  replyingTo,
  onCancelReply,
  disabled = false,
  placeholder = 'Type a message...',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiWrapperRef = useRef<HTMLDivElement>(null);
  const attachmentWrapperRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const cancelRecordingRef = useRef(false);
  const recorderMimeTypeRef = useRef<string>('');
  const recordingTimeRef = useRef(0);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const locationRequestIdRef = useRef(0);
  const locationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!showEmojiPicker && !showAttachMenu) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedEmoji = emojiWrapperRef.current?.contains(target);
      const clickedAttach = attachmentWrapperRef.current?.contains(target);

      if (showEmojiPicker && !clickedEmoji) {
        setShowEmojiPicker(false);
      }
      if (showAttachMenu && !clickedAttach) {
        setShowAttachMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showEmojiPicker, showAttachMenu]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onTyping?.(false); // Stop typing indicator when sending
      onSend(message.trim(), 'text');
      setMessage('');
      setShowEmojiPicker(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const getRecordingMimeType = () => {
    if (typeof MediaRecorder === 'undefined') return '';
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/mpeg',
    ];
    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || '';
  };

  const handleStartRecording = async () => {
    if (isRecording) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('Audio recording is not supported in this browser.');
      return;
    }
    if (typeof MediaRecorder === 'undefined') {
      toast.error('Audio recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      recordedChunksRef.current = [];
      cancelRecordingRef.current = false;

      const mimeType = getRecordingMimeType();
      recorderMimeTypeRef.current = mimeType;
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        if (recordingInterval.current) {
          clearInterval(recordingInterval.current);
        }

        const durationSeconds = Math.max(1, Math.round(recordingTimeRef.current));
        recordingTimeRef.current = 0;
        setRecordingTime(0);
        setIsRecording(false);

        const streamRef = mediaStreamRef.current;
        if (streamRef) {
          streamRef.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }

        if (cancelRecordingRef.current) {
          cancelRecordingRef.current = false;
          recordedChunksRef.current = [];
          return;
        }

        const chunks = recordedChunksRef.current;
        recordedChunksRef.current = [];
        if (chunks.length === 0) {
          toast.error('No audio recorded. Please try again.');
          return;
        }

        const blobType = recorderMimeTypeRef.current || chunks[0].type || 'audio/webm';
        const blob = new Blob(chunks, { type: blobType });
        const extension = blobType.includes('mp4')
          ? 'm4a'
          : blobType.includes('mpeg')
          ? 'mp3'
          : blobType.includes('wav')
          ? 'wav'
          : blobType.includes('ogg')
          ? 'ogg'
          : 'webm';
        const file = new File([blob], `voice-${Date.now()}.${extension}`, { type: blobType });

        try {
          if (onSendVoice) {
            await onSendVoice(file, durationSeconds);
          } else {
            onSend(`Voice message (${formatTime(durationSeconds)})`, 'voice');
          }
        } catch (error) {
          toast.error('Failed to send voice message. Please try again.');
        }
      };

      recordingTimeRef.current = 0;
      setRecordingTime(0);
      setIsRecording(true);
      recordingInterval.current = setInterval(() => {
        recordingTimeRef.current += 1;
        setRecordingTime(recordingTimeRef.current);
      }, 1000);

      recorder.start();
    } catch (error) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      setIsRecording(false);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const handleStopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      setIsRecording(false);
      return;
    }
    mediaRecorderRef.current.stop();
  };

  const handleCancelRecording = () => {
    cancelRecordingRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      setIsRecording(false);
      setRecordingTime(0);
      recordingTimeRef.current = 0;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAttachment = (type: string) => {
    setShowAttachMenu(false);
    if (type === 'image') {
      fileInputRef.current?.click();
    } else if (type === 'location') {
      handleLocationShare();
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please select an image (JPEG, PNG, WebP, or GIF).');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    // Reset file input for re-selection
    e.target.value = '';
  };

  const handleCancelImagePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSendImage = async () => {
    if (!selectedFile || !onSendImage) return;

    setIsUploading(true);
    try {
      await onSendImage(selectedFile);
      handleCancelImagePreview();
    } catch (error) {
      toast.error('Failed to send image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLocationShare = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    if (isGettingLocation) return;

    setIsGettingLocation(true);
    locationRequestIdRef.current += 1;
    const requestId = locationRequestIdRef.current;

    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
    }
    locationTimeoutRef.current = setTimeout(() => {
      if (locationRequestIdRef.current !== requestId) return;
      locationRequestIdRef.current += 1;
      locationTimeoutRef.current = null;
      setIsGettingLocation(false);
      toast.error('Location request timed out.');
    }, 25000);

    try {
      const sendLocation = async (position: GeolocationPosition) => {
        if (locationRequestIdRef.current !== requestId) return;
        if (locationTimeoutRef.current) {
          clearTimeout(locationTimeoutRef.current);
          locationTimeoutRef.current = null;
        }
        const { latitude, longitude } = position.coords;
        const locationData = {
          latitude,
          longitude,
          mapUrl: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`,
        };
        try {
          const result = onSend(JSON.stringify(locationData), 'location');
          if (result && typeof (result as Promise<void>).then === 'function') {
            await result;
          }
        } catch (err) {
          toast.error('Failed to share location. Please try again.');
        } finally {
          if (locationRequestIdRef.current === requestId) {
            setIsGettingLocation(false);
          }
        }
      };

      const handleLocationError = (error: GeolocationPositionError) => {
        if (locationRequestIdRef.current !== requestId) return;
        if (locationTimeoutRef.current) {
          clearTimeout(locationTimeoutRef.current);
          locationTimeoutRef.current = null;
        }
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location access denied. Please enable location permissions.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out.');
            break;
          default:
            toast.error('Failed to get location.');
        }
      };

      const primaryOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };
      const fallbackOptions: PositionOptions = {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000,
      };

      let didFallback = false;
      const requestPosition = () => {
        navigator.geolocation.getCurrentPosition(
          sendLocation,
          (error) => {
            if (locationRequestIdRef.current !== requestId) return;
            if (!didFallback && (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE)) {
              didFallback = true;
              navigator.geolocation.getCurrentPosition(sendLocation, handleLocationError, fallbackOptions);
              return;
            }
            handleLocationError(error);
          },
          primaryOptions
        );
      };

      requestPosition();
    } catch (err) {
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
        locationTimeoutRef.current = null;
      }
      setIsGettingLocation(false);
      toast.error('Failed to request location.');
    }
  };

  return (
    <div className={styles.container}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
      />

      {/* Image Preview */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            className={styles.imagePreview}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.previewContent}>
              <img src={previewUrl} alt="Preview" className={styles.previewImage} />
              <div className={styles.previewActions}>
                <button
                  className={styles.cancelPreviewBtn}
                  onClick={handleCancelImagePreview}
                  disabled={isUploading}
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  className={styles.sendPreviewBtn}
                  onClick={handleSendImage}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={18} className={styles.spinner} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Photo
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Loading Indicator */}
      <AnimatePresence>
        {isGettingLocation && (
          <motion.div
            className={styles.locationLoading}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Loader2 size={20} className={styles.spinner} />
            <span>Getting your location...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply Preview */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            className={styles.replyPreview}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.replyContent}>
              <div className={styles.replyBar} />
              <div className={styles.replyInfo}>
                <span className={styles.replyLabel}>Replying to {replyingTo.sender}</span>
                <span className={styles.replyText}>{replyingTo.content}</span>
              </div>
            </div>
            <button className={styles.cancelReply} onClick={onCancelReply}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording State */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            className={styles.recordingOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.recordingIndicator}>
              <div className={styles.recordingDot} />
              <span className={styles.recordingTime}>{formatTime(recordingTime)}</span>
            </div>
            <span className={styles.recordingText}>Recording...</span>
            <div className={styles.recordingActions}>
              <button className={styles.cancelRecordBtn} onClick={handleCancelRecording}>
                <X size={20} />
              </button>
              <button className={styles.stopRecordBtn} onClick={handleStopRecording}>
                <StopCircle size={24} />
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Area */}
      {!isRecording && (
        <div className={styles.inputWrapper}>
          {/* Attachment Button */}
          <div className={styles.attachmentWrapper} ref={attachmentWrapperRef}>
            <button
              className={`${styles.iconButton} ${showAttachMenu ? styles.active : ''}`}
              onClick={() => {
                setShowAttachMenu(!showAttachMenu);
                setShowEmojiPicker(false);
              }}
              title="Attach"
            >
              <Paperclip size={20} />
            </button>

            {/* Attachment Menu */}
            <AnimatePresence>
              {showAttachMenu && (
                <motion.div
                  className={styles.attachMenu}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <button
                    className={styles.attachOption}
                    onClick={() => handleAttachment('image')}
                  >
                    <div className={styles.attachIcon} style={{ background: '#8b5cf6' }}>
                      <Image size={18} />
                    </div>
                    <span>Photo</span>
                  </button>
                  <button
                    className={styles.attachOption}
                    onClick={() => handleAttachment('location')}
                  >
                    <div className={styles.attachIcon} style={{ background: '#22c55e' }}>
                      <MapPin size={18} />
                    </div>
                    <span>Location</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Text Input */}
          <div className={styles.textInputWrapper}>
            <textarea
              ref={inputRef}
              className={styles.textInput}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                onTyping?.(e.target.value.length > 0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
            />
          </div>

          {/* Emoji Button */}
          <div className={styles.emojiWrapper} ref={emojiWrapperRef}>
            <button
              className={`${styles.iconButton} ${showEmojiPicker ? styles.active : ''}`}
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowAttachMenu(false);
              }}
              title="Emoji"
            >
              <Smile size={20} />
            </button>

            {/* Quick Emoji Picker */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  className={styles.emojiPicker}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className={styles.emojiGrid}>
                    {quickEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        className={styles.emojiOption}
                        onClick={() => handleEmojiSelect(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Send / Voice Button */}
          {message.trim() ? (
            <motion.button
              className={styles.sendButton}
              onClick={handleSend}
              disabled={disabled}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Send size={18} />
            </motion.button>
          ) : (
            <button
              className={styles.voiceButton}
              onClick={handleStartRecording}
              disabled={disabled}
              title="Voice Message"
            >
              <Mic size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
