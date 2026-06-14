"""Trim an MP3 to N seconds by copying whole MPEG frames (no re-encode).

Dependency-free: walks frame headers, skips ID3v2 and any Xing/Info VBR
header frame (its frame count would be wrong after the cut), and writes
frames until the target duration is reached. Used to cut a short loop out
of the long CC rain recording without needing ffmpeg.

usage: python tools/trim_mp3.py <in.mp3> <out.mp3> <seconds>
"""
import sys

BITRATES_V1L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0]
BITRATES_V2L3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0]
SAMPLERATES = {3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000]}


def frame_info(data, i):
    """Return (frame_length, seconds) for the frame at offset i, or None."""
    if i + 4 > len(data) or data[i] != 0xFF or (data[i + 1] & 0xE0) != 0xE0:
        return None
    version = (data[i + 1] >> 3) & 3          # 3=MPEG1, 2=MPEG2, 0=MPEG2.5
    layer = (data[i + 1] >> 1) & 3            # 1=Layer III
    if version == 1 or layer != 1:
        return None
    bitrate_idx = (data[i + 2] >> 4) & 0xF
    sr_idx = (data[i + 2] >> 2) & 3
    padding = (data[i + 2] >> 1) & 1
    if sr_idx == 3 or bitrate_idx in (0, 15):
        return None
    sr = SAMPLERATES[version][sr_idx]
    if version == 3:
        bitrate = BITRATES_V1L3[bitrate_idx] * 1000
        length = 144 * bitrate // sr + padding
        samples = 1152
    else:
        bitrate = BITRATES_V2L3[bitrate_idx] * 1000
        length = 72 * bitrate // sr + padding
        samples = 576
    return length, samples / sr


def main(src, dst, seconds):
    data = open(src, 'rb').read()
    i = 0
    if data[:3] == b'ID3':
        i = 10 + ((data[6] << 21) | (data[7] << 14) | (data[8] << 7) | data[9])
    out = bytearray()
    written = 0.0
    first = True
    while i < len(data) and written < seconds:
        info = frame_info(data, i)
        if not info:
            i += 1                            # resync on junk bytes
            continue
        length, dur = info
        frame = data[i:i + length]
        i += length
        if first:
            first = False
            if b'Xing' in frame[:64] or b'Info' in frame[:64]:
                continue                      # drop the VBR header frame
        out += frame
        written += dur
    open(dst, 'wb').write(bytes(out))
    print(f'{dst}: {written:.1f}s, {len(out)} bytes')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], float(sys.argv[3]))
