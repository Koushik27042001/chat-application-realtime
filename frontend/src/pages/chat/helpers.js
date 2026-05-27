export const EMOJI_GROUPS = [
  {
    label: "Smileys",
    items: ["\u{1F600}", "\u{1F602}", "\u{1F60A}", "\u{1F60D}", "\u{1F973}", "\u{1F60E}", "\u{1F914}", "\u{1F62D}", "\u{1F634}", "\u{1F917}"],
  },
  {
    label: "Gestures",
    items: ["\u{1F44B}", "\u{1F44D}", "\u{1F44F}", "\u{1F64C}", "\u{1F64F}", "\u{1F4AA}", "\u{1F44C}", "\u{1F91D}", "\u{270C}\u{FE0F}", "\u{1F91E}"],
  },
  {
    label: "Hearts",
    items: ["\u{2764}\u{FE0F}", "\u{1F9E1}", "\u{1F49B}", "\u{1F49A}", "\u{1F499}", "\u{1F49C}", "\u{1F90D}", "\u{1F5A4}", "\u{1F496}", "\u{1F4AF}"],
  },
  {
    label: "Chat",
    items: ["\u{1F525}", "\u{2728}", "\u{1F389}", "\u{1F4AC}", "\u{1F680}", "\u{1F4CC}", "\u{1F3B6}", "\u{2615}", "\u{1F308}", "\u{1F3AF}"],
  },
];

const MAX_AVATAR_DIMENSION = 512;
const MAX_AVATAR_DATA_URL_LENGTH = 1400000;

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });

const loadImageFromFile = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not open the selected image."));
    };

    image.src = objectUrl;
  });

export const prepareAvatarForUpload = async (file) => {
  if (!file?.type?.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  if (file.type === "image/svg+xml") {
    const dataUrl = await readFileAsDataUrl(file);
    if (dataUrl.length > MAX_AVATAR_DATA_URL_LENGTH) {
      throw new Error("The selected image is too large. Please use a smaller file.");
    }
    return dataUrl;
  }

  const image = await loadImageFromFile(file);
  const scale = Math.min(
    1,
    MAX_AVATAR_DIMENSION / Math.max(image.width || 1, image.height || 1)
  );
  const width = Math.max(1, Math.round((image.width || 1) * scale));
  const height = Math.max(1, Math.round((image.height || 1) * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Your browser could not process the selected image.");
  }

  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  for (const quality of [0.9, 0.82, 0.72, 0.6]) {
    const dataUrl = canvas.toDataURL("image/webp", quality);
    if (dataUrl.length <= MAX_AVATAR_DATA_URL_LENGTH) {
      return dataUrl;
    }
  }

  throw new Error("The selected image is too large. Please choose a smaller one.");
};

export const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export const normalizeMessage = (message, currentUserId) => {
  const senderId = String(message.sender?.toString?.() ?? message.sender ?? "");
  const me = String(currentUserId ?? "");

  return {
    id: message._id || message.id || `msg-${Date.now()}`,
    text: message.content,
    sender: senderId,
    own: senderId === me,
    time: formatTime(message.createdAt || new Date()),
    status: message.status || "sent",
  };
};

export const normalizeContact = (contact = {}) => ({
  id: String(contact.id || contact._id || ""),
  name: contact.name || "Unknown user",
  email: contact.email || "",
  avatar: contact.avatar || "",
  conversationId: contact.conversationId || null,
  lastMessage: contact.lastMessage || "Tap to start chatting.",
  lastMessageAt: contact.lastMessageAt || null,
});

export const upsertContact = (list, contact, { prepend = false } = {}) => {
  const nextContact = normalizeContact(contact);
  const existingIndex = list.findIndex((item) => item.id === nextContact.id);

  if (existingIndex === -1) {
    return prepend ? [nextContact, ...list] : [...list, nextContact];
  }

  const next = [...list];
  next[existingIndex] = {
    ...next[existingIndex],
    ...nextContact,
  };

  if (!prepend) {
    return next;
  }

  const [moved] = next.splice(existingIndex, 1);
  next.unshift(moved);
  return next;
};
