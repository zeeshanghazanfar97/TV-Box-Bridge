const REMOTE_CODES = {
  red_power_top: { label: "Red Power Top", protocol: "NEC", address: 0xfd01, command: 0xdc, raw: 0x23dcfd01, bits: 32 },
  white_power: { label: "White Power", protocol: "SAMSUNG", address: 0x7, command: 0x2, raw: 0xfd020707, bits: 32 },
  tv: { label: "TV", protocol: "SAMSUNG", address: 0x7, command: 0xf1, raw: 0x0ef10707, bits: 32 },
  mute_top_right: { label: "Mute Top Right", protocol: "NEC", address: 0xfd01, command: 0x9d, raw: 0x629dfd01, bits: 32 },
  tv_av: { label: "TV/AV", protocol: "SAMSUNG", address: 0x7, command: 0x1, raw: 0xfe010707, bits: 32 },
  top_vol_plus: { label: "Top VOL+", protocol: "SAMSUNG", address: 0x7, command: 0x7, raw: 0xf8070707, bits: 32 },
  top_vol_minus: { label: "Top VOL-", protocol: "SAMSUNG", address: 0x7, command: 0xb, raw: 0xf40b0707, bits: 32 },
  top_ch_plus: { label: "Top CH+", protocol: "SAMSUNG", address: 0x7, command: 0x12, raw: 0xed120707, bits: 32 },
  top_ch_minus: { label: "Top CH-", protocol: "SAMSUNG", address: 0x7, command: 0x10, raw: 0xef100707, bits: 32 },
  set: { label: "SET", protocol: "NEC", address: 0xfd01, command: 0xdc, raw: 0x23dcfd01, bits: 32 },
  mute_middle_right: { label: "Mute Middle Right", protocol: "SAMSUNG", address: 0x7, command: 0xf2, raw: 0x0df20707, bits: 32 },
  red_record: { label: "Red Record", protocol: "NEC", address: 0xfd01, command: 0xdd, raw: 0x22ddfd01, bits: 32 },
  play_pause: { label: "Play/Pause", protocol: "NEC", address: 0xfd01, command: 0xd6, raw: 0x29d6fd01, bits: 32 },
  stop: { label: "Stop", protocol: "NEC", address: 0xfd01, command: 0x91, raw: 0x6e91fd01, bits: 32 },
  rewind: { label: "Rewind", protocol: "NEC", address: 0xfd01, command: 0x8d, raw: 0x728dfd01, bits: 32 },
  info: { label: "INFO", protocol: "NEC", address: 0xfd01, command: 0xcf, raw: 0x30cffd01, bits: 32 },
  fast_forward: { label: "Fast Forward", protocol: "NEC", address: 0xfd01, command: 0x95, raw: 0x6a95fd01, bits: 32 },
  navigation_up: { label: "Navigation CH+ / Up", protocol: "NEC", address: 0xfd01, command: 0xca, raw: 0x35cafd01, bits: 32 },
  navigation_down: { label: "Navigation CH- / Down", protocol: "NEC", address: 0xfd01, command: 0xd2, raw: 0x2dd2fd01, bits: 32 },
  navigation_left: { label: "Navigation VOL- / Left", protocol: "NEC", address: 0xfd01, command: 0x99, raw: 0x6699fd01, bits: 32 },
  navigation_right: { label: "Navigation VOL+ / Right", protocol: "NEC", address: 0xfd01, command: 0xc1, raw: 0x3ec1fd01, bits: 32 },
  ok: { label: "OK", protocol: "NEC", address: 0xfd01, command: 0xce, raw: 0x31cefd01, bits: 32 },
  left_side_vol_plus: { label: "Left Side VOL+", protocol: "NEC", address: 0xfd01, command: 0x80, raw: 0x7f80fd01, bits: 32 },
  left_side_vol_minus: { label: "Left Side VOL-", protocol: "NEC", address: 0xfd01, command: 0x81, raw: 0x7e81fd01, bits: 32 },
  right_side_ch_plus: { label: "Right Side CH+", protocol: "NEC", address: 0xfd01, command: 0x85, raw: 0x7a85fd01, bits: 32 },
  right_side_ch_minus: { label: "Right Side CH-", protocol: "NEC", address: 0xfd01, command: 0x86, raw: 0x7986fd01, bits: 32 },
  menu_exit: { label: "MENU/EXIT", protocol: "NEC", address: 0xfd01, command: 0x98, raw: 0x6798fd01, bits: 32 },
  back: { label: "BACK", protocol: "NEC", address: 0xfd01, command: 0x82, raw: 0x7d82fd01, bits: 32 },
  number_1: { label: "Number 1", protocol: "NEC", address: 0xfd01, command: 0x92, raw: 0x6d92fd01, bits: 32 },
  number_2: { label: "Number 2", protocol: "NEC", address: 0xfd01, command: 0x93, raw: 0x6c93fd01, bits: 32 },
  number_3: { label: "Number 3", protocol: "NEC", address: 0xfd01, command: 0xcc, raw: 0x33ccfd01, bits: 32 },
  number_4: { label: "Number 4", protocol: "NEC", address: 0xfd01, command: 0x8e, raw: 0x718efd01, bits: 32 },
  number_5: { label: "Number 5", protocol: "NEC", address: 0xfd01, command: 0x8f, raw: 0x708ffd01, bits: 32 },
  number_6: { label: "Number 6", protocol: "NEC", address: 0xfd01, command: 0xc8, raw: 0x37c8fd01, bits: 32 },
  number_7: { label: "Number 7", protocol: "NEC", address: 0xfd01, command: 0x8a, raw: 0x758afd01, bits: 32 },
  number_8: { label: "Number 8", protocol: "NEC", address: 0xfd01, command: 0x8b, raw: 0x748bfd01, bits: 32 },
  number_9: { label: "Number 9", protocol: "NEC", address: 0xfd01, command: 0xc4, raw: 0x3bc4fd01, bits: 32 },
  number_0: { label: "Number 0", protocol: "NEC", address: 0xfd01, command: 0x87, raw: 0x7887fd01, bits: 32 },
  epg: { label: "EPG", protocol: "NEC", address: 0xfd01, command: 0xda, raw: 0x25dafd01, bits: 32 },
  fav: { label: "FAV", protocol: "NEC", address: 0xfd01, command: 0x9c, raw: 0x639cfd01, bits: 32 },
  red_audio: { label: "Red AUDIO", protocol: "NEC", address: 0xfd01, command: 0x89, raw: 0x7689fd01, bits: 32 },
  yellow_mail: { label: "Yellow MAIL", protocol: "NEC", address: 0xfd01, command: 0xd9, raw: 0x26d9fd01, bits: 32 },
  green_sub: { label: "Green SUB", protocol: "NEC", address: 0xfd01, command: 0x84, raw: 0x7b84fd01, bits: 32 },
  blue_media: { label: "Blue MEDIA", protocol: "NEC", address: 0xfd01, command: 0x96, raw: 0x6996fd01, bits: 32 }
};

const COMMAND_ALIASES = {
  power: "red_power_top",
  power_on: "red_power_top",
  power_off: "red_power_top",
  power_toggle: "red_power_top",
  stb_power: "red_power_top",
  tv_power: "white_power",
  input: "tv_av",
  source: "tv_av",
  mute: "mute_top_right",
  unmute: "mute_top_right",
  tv_mute: "mute_middle_right",
  volume_up: "left_side_vol_plus",
  volume_down: "left_side_vol_minus",
  channel_up: "right_side_ch_plus",
  channel_down: "right_side_ch_minus",
  tv_volume_up: "top_vol_plus",
  tv_volume_down: "top_vol_minus",
  tv_channel_up: "top_ch_plus",
  tv_channel_down: "top_ch_minus",
  navigate_up: "navigation_up",
  navigate_down: "navigation_down",
  navigate_left: "navigation_left",
  navigate_right: "navigation_right",
  up: "navigation_up",
  down: "navigation_down",
  left: "navigation_left",
  right: "navigation_right",
  navigation_ch_plus_up: "navigation_up",
  navigation_ch_down: "navigation_down",
  navigation_vol_minus_left: "navigation_left",
  navigation_vol_plus_right: "navigation_right",
  menu: "menu_exit",
  exit: "menu_exit",
  guide: "epg",
  favorites: "fav",
  favorite: "fav",
  audio: "red_audio",
  mail: "yellow_mail",
  subtitle: "green_sub",
  subtitles: "green_sub",
  sub: "green_sub",
  media: "blue_media",
  record: "red_record",
  rec: "red_record",
  play: "play_pause",
  pause: "play_pause",
  forward: "fast_forward",
  fastforward: "fast_forward",
  ff: "fast_forward"
};

for (const digit of "0123456789") {
  COMMAND_ALIASES[digit] = `number_${digit}`;
  COMMAND_ALIASES[`digit_${digit}`] = `number_${digit}`;
}

function normalizeCommand(command) {
  return String(command)
    .trim()
    .toLowerCase()
    .replace(/\+/g, " plus ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getCommandError(message, statusCode = 422) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getCodeForCommand(command) {
  const normalized = normalizeCommand(command);
  const key = COMMAND_ALIASES[normalized] || normalized;
  const code = REMOTE_CODES[key];

  if (!code) {
    throw getCommandError(`Unsupported remote command: ${command}`);
  }

  return { key, ...code };
}

function resolveChannelSequence(payload, options) {
  const raw = String(payload.value ?? "").replace(/\D/g, "");
  const digits = raw.slice(0, 4).split("");

  if (digits.length === 0) {
    throw getCommandError("Channel command requires a numeric value", 400);
  }

  const sequence = digits.map((digit) => getCodeForCommand(`number_${digit}`));
  const confirm = String(options.channelConfirmCommand || "").trim();

  if (confirm) {
    sequence.push(getCodeForCommand(confirm));
  }

  return sequence;
}

function resolveRemoteSequence(payload, options = {}) {
  const command = String(payload.command || "").trim();
  if (!command) throw getCommandError("command is required", 400);

  const normalized = normalizeCommand(command);
  if (normalized === "go_to_channel" || normalized === "tune_channel") {
    return resolveChannelSequence(payload, options);
  }

  return [getCodeForCommand(command)];
}

function summarizeCode(code) {
  return {
    key: code.key,
    label: code.label,
    protocol: code.protocol,
    address: `0x${code.address.toString(16).toUpperCase()}`,
    command: `0x${code.command.toString(16).toUpperCase()}`,
    bits: code.bits
  };
}

export { REMOTE_CODES, resolveRemoteSequence, summarizeCode };
