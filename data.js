// 数据模型和存储工具
// 定义 Letter 数据结构和 localStorage 操作函数

const STORAGE_KEY = 'slowletter.letters';
const SETTINGS_KEY = 'slowletter.settings';
const CONTACTS_KEY = 'slowletter.contacts';
const PENPALS_KEY = 'slowletter.penpals';

// Letter 状态类型
// 'draft' | 'scheduled' | 'sent' | 'kept' | 'cancelled'

/**
 * 从 localStorage 加载所有信件
 * @returns {Letter[]}
 */
function loadLetters() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error loading letters:', e);
    return [];
  }
}

/**
 * 保存所有信件到 localStorage
 * @param {Letter[]} letters
 */
function saveLetters(letters) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
  } catch (e) {
    console.error('Error saving letters:', e);
  }
}

/**
 * 根据 ID 获取单个信件
 * @param {string} id
 * @returns {Letter|undefined}
 */
function getLetterById(id) {
  const letters = loadLetters();
  return letters.find(letter => letter.id === id);
}

/**
 * 更新信件（如果存在则更新，否则添加）
 * @param {Letter} letter
 */
function updateLetter(letter) {
  const letters = loadLetters();
  const index = letters.findIndex(l => l.id === letter.id);
  if (index >= 0) {
    letters[index] = letter;
  } else {
    letters.push(letter);
  }
  saveLetters(letters);
}

/**
 * 创建新信件
 * @param {Object} data - 信件数据
 * @returns {Letter}
 */
function createLetter(data) {
  const now = new Date().toISOString();
  const id = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
  
  return {
    id: id,
    title: data.title || '',
    body: data.body || '',
    recipientType: data.recipientType || 'human', // 'human' | 'penpal'
    contactId: data.contactId || '',
    channel: data.channel || 'email', // 'sms' | 'email' | 'internal'
    status: data.status || 'draft',
    createdAt: data.createdAt || now,
    lastEditedAt: now,
    scheduledWindow: data.scheduledWindow || null, // 字符串如 "within 3-7 days"
    scheduledWindowStart: data.scheduledWindowStart || null,
    scheduledWindowEnd: data.scheduledWindowEnd || null,
    sentAt: data.sentAt || null,
    reflectionNotes: data.reflectionNotes || ''
  };
}

/**
 * 删除信件
 * @param {string} id
 */
function deleteLetter(id) {
  const letters = loadLetters();
  const filtered = letters.filter(l => l.id !== id);
  saveLetters(filtered);
}

/**
 * 加载设置
 * @returns {Object}
 */
function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) {
      return {
        defaultWindow: '3-7',
        profileName: ''
      };
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error loading settings:', e);
    return {
      defaultWindow: '3-7',
      profileName: ''
    };
  }
}

/**
 * 保存设置
 * @param {Object} settings
 */
function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

/**
 * 计算发送窗口的开始和结束时间
 * @param {string} windowOption - '1-3' | '3-7' | '8-14'
 * @returns {{start: string, end: string}}
 */
function calculateSendingWindow(windowOption) {
  const now = new Date();
  let daysStart, daysEnd;
  
  switch (windowOption) {
    case '1-3':
      daysStart = 1;
      daysEnd = 3;
      break;
    case '3-7':
      daysStart = 3;
      daysEnd = 7;
      break;
    case '8-14':
      daysStart = 8;
      daysEnd = 14;
      break;
    default:
      daysStart = 3;
      daysEnd = 7;
  }
  
  const start = new Date(now);
  start.setDate(start.getDate() + daysStart);
  
  const end = new Date(now);
  end.setDate(end.getDate() + daysEnd);
  
  return {
    start: start.toISOString(),
    end: end.toISOString()
  };
}

/**
 * 格式化日期显示
 * @param {string} isoString
 * @returns {string}
 */
function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * 格式化日期范围显示
 * @param {string} start
 * @param {string} end
 * @returns {string}
 */
function formatDateRange(start, end) {
  if (!start || !end) return '';
  const startDate = new Date(start);
  const endDate = new Date(end);
  const now = new Date();
  
  const daysFromNow = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
  const daysToEnd = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysFromNow <= 0 && daysToEnd > 0) {
    return `Will be delivered within ${daysToEnd} days`;
  } else if (daysFromNow > 0) {
    return `${daysFromNow}-${daysToEnd} days from ${formatDate(start)}`;
  } else {
    return `Window: ${formatDate(start)} - ${formatDate(end)}`;
  }
}

// ==================== 虚拟数据 ====================

/**
 * 初始化虚拟数据（通讯录）
 */
const DEFAULT_CONTACTS = [
  {
    id: 'c1',
    name: 'Mom',
    channel: 'sms',
    phone: '+1 917-555-0134',
    email: ''
  },
  {
    id: 'c2',
    name: 'Ethan Carter',
    channel: 'email',
    phone: '',
    email: 'ethan@example.com'
  },
  {
    id: 'c3',
    name: 'Sarah Miller',
    channel: 'sms',
    phone: '+1 212-555-0198',
    email: ''
  },
  {
    id: 'c4',
    name: 'Alex Chen',
    channel: 'email',
    phone: '',
    email: 'alex.chen@example.com'
  }
];

/**
 * 初始化虚拟数据（AI 笔友）
 */
const DEFAULT_PENPALS = [
  {
    id: 'p1',
    name: 'River',
    tagline: 'Calm, reflective listener for long, slow exchanges.'
  },
  {
    id: 'p2',
    name: 'Kai',
    tagline: 'Honest but kind; writes like a straightforward friend.'
  }
];

/**
 * 初始化虚拟数据（信件）
 */
const DEFAULT_LETTERS = [
  {
    id: 'l1',
    title: 'About yesterday',
    body: 'Hi Mom,\n\nI wanted to write this down while it\'s still fresh in my mind, but I also wanted to give myself some time to think before sending it. Yesterday was difficult, and I realize I may have reacted too quickly when we talked on the phone.\n\nI know you were just trying to help, and I appreciate that. But in the moment, I felt like you weren\'t really hearing what I was trying to say. I got defensive, and I said some things I didn\'t mean. I\'m sorry for that.\n\nThe truth is, I\'ve been under a lot of stress lately with work and everything else going on. When you asked about my plans, I felt like you were judging me or pushing me in a direction I\'m not ready for. But looking back, I think you were just trying to understand where I\'m at.\n\nI\'m taking time to reflect on what happened and what I really want to say. I don\'t want to rush this conversation or make it worse. Maybe in a few days, when we\'ve both had time to process, we can talk again with clearer heads.\n\nI love you, and I hope you know that even when I\'m frustrated, I\'m grateful to have you in my life.\n\nLove,\nYour child',
    recipientType: 'human',
    contactId: 'c1',
    channel: 'sms',
    status: 'scheduled',
    createdAt: '2024-12-01T09:15:00Z',
    scheduledWindow: 'within 3-7 days'
  },
  {
    id: 'l2',
    title: 'Thank you for everything',
    body: 'Dear Ethan,\n\nI\'ve been meaning to write this for a while, but I wanted to find the right words. I just wanted to say thank you for being there when I needed you last month. Your support means more than I can express in words.\n\nWhen everything fell apart with the job situation, I felt so lost and embarrassed. I didn\'t want to tell anyone, but you noticed something was wrong and you didn\'t push. You just made space for me to talk when I was ready.\n\nThat conversation we had over coffee really helped me see things differently. You reminded me that setbacks aren\'t failures, and that I have people in my corner. I don\'t think I would have had the courage to start applying again without your encouragement.\n\nI also want to thank you for checking in on me these past few weeks. The small messages and the way you\'ve been genuinely interested in how things are going—it\'s made such a difference. Sometimes it\'s the little things that matter most.\n\nI hope you know how much your friendship means to me. I\'m lucky to have someone like you who shows up, listens, and cares without expecting anything in return.\n\nThank you, truly.\n\nWith gratitude,\nYour friend',
    recipientType: 'human',
    contactId: 'c2',
    channel: 'email',
    status: 'sent',
    createdAt: '2024-11-25T14:30:00Z',
    scheduledWindow: 'within 1-3 days',
    sentAt: '2024-11-27T10:00:00Z'
  },
  {
    id: 'l3',
    title: 'Thoughts on our conversation',
    body: 'Sarah,\n\nI\'ve been thinking about what we discussed the other night, and there are a few things I\'d like to clarify. I want to take my time to express them clearly, so I\'m writing this down first.\n\nWhen you mentioned that you felt like I wasn\'t making enough effort in our friendship, it really hit me. I\'ve been so caught up in my own stuff lately—work stress, family things, just trying to keep my head above water—that I realize I haven\'t been showing up for you the way I should.\n\nI want you to know that I value our friendship deeply. The fact that you felt comfortable enough to tell me how you were feeling means a lot, even though it was hard to hear. I\'d rather know than have you quietly pull away.\n\nI\'ve been reflecting on what I can do differently. I know I\'ve been canceling plans, not responding to messages as quickly, and generally being less present. That\'s not fair to you, and it\'s not the kind of friend I want to be.\n\nI\'m not making excuses, but I want you to understand where I\'ve been coming from. That said, understanding isn\'t enough—I need to do better. I\'m committing to being more intentional about our friendship.\n\nCan we talk about this more when you\'re ready? I\'d like to hear your thoughts on what would help you feel more connected.\n\nThanks for your patience with me.\n\nYour friend',
    recipientType: 'human',
    contactId: 'c3',
    channel: 'sms',
    status: 'draft',
    createdAt: '2024-12-02T16:45:00Z',
    scheduledWindow: null
  },
  {
    id: 'l4',
    title: 'What I should have said',
    body: 'Alex,\n\nI wrote this letter but decided to keep it to myself. Sometimes writing helps me process, even if I don\'t send it. I needed to get these thoughts out, but I also realized that sending them might not be helpful right now.\n\nWhen you made that comment at the meeting last week, I felt dismissed and frustrated. I had put a lot of work into that proposal, and it felt like you didn\'t even consider it before suggesting we go in a completely different direction.\n\nI wanted to tell you how that made me feel. I wanted to explain why I think my approach was worth discussing. I wanted to ask why you didn\'t bring up your concerns earlier, when we could have collaborated on a solution.\n\nBut the more I wrote, the more I realized that this letter was more about me venting than about having a productive conversation. I was hurt, and I wanted you to know it. But I\'m not sure that would help us work better together.\n\nMaybe I\'ll bring this up in person when I\'m less emotional about it. Or maybe I\'ll let it go if it doesn\'t come up again. For now, writing it down helped me understand my own feelings better, and that\'s enough.\n\nSometimes the letters we don\'t send are the most important ones.\n\n(Kept private)',
    recipientType: 'human',
    contactId: 'c4',
    channel: 'email',
    status: 'kept',
    createdAt: '2024-11-20T11:20:00Z',
    scheduledWindow: null
  },
  {
    id: 'l5',
    title: 'Starting our exchange',
    body: 'Hi River,\n\nI\'ve been thinking about starting a slow conversation with someone, and I\'m glad I found this space. I appreciate having a place to write without the pressure of immediate responses.\n\nLately, I\'ve been feeling like everything moves too fast. Conversations happen in real-time, messages demand instant replies, and there\'s this constant sense that if I don\'t respond quickly, I\'m being rude or disengaged. But sometimes I need time to really think about what I want to say.\n\nI\'ve been going through a period of reflection. Work has been intense, relationships feel complicated, and I\'m trying to figure out what I actually want versus what I think I should want. It\'s a lot to process, and I don\'t always have the words right away.\n\nThat\'s why I like the idea of this slower form of communication. It gives me space to be thoughtful, to revise my thoughts, to say things I might not say in a rushed conversation. And it gives you—or whoever is reading—time to really consider what I\'ve written before responding.\n\nI\'m not sure what I\'m looking for exactly. Maybe just a place to think out loud. Maybe someone to exchange ideas with. Maybe just the practice of slowing down and being more intentional with my words.\n\nI\'d be curious to hear your thoughts on this, whenever you have time to respond. No rush.\n\nLooking forward to our exchange,\nA new pen pal',
    recipientType: 'penpal',
    contactId: 'p1',
    channel: 'internal',
    status: 'sent',
    createdAt: '2024-11-15T09:00:00Z',
    scheduledWindow: 'within 3-7 days',
    sentAt: '2024-11-18T14:00:00Z'
  },
  {
    id: 'l6',
    title: '',
    body: 'Thank you for your thoughtful message. I\'ve been reflecting on what you shared, and I appreciate the space you\'re creating for this kind of exchange.\n\nI understand what you mean about everything moving too fast. There\'s something beautiful about taking time to really consider what we want to say before we say it. In my experience, the best conversations happen when both people have had time to think, to process, to let ideas settle.\n\nYour point about figuring out what you actually want versus what you think you should want—that resonates deeply. I think many of us spend a lot of energy trying to meet expectations that aren\'t even our own. It takes courage to slow down and ask yourself what really matters to you.\n\nI don\'t have all the answers, but I\'ve found that writing helps. There\'s something about putting thoughts into words, even if you\'re not sure who will read them, that clarifies things. And the slow pace of this exchange means we can both take our time to really understand each other.\n\nI\'m glad you found this space. Sometimes the best connections happen when we\'re not rushing. I\'m here to listen, to think alongside you, and to respond when I have something meaningful to say.\n\nTake your time. There\'s no hurry here.\n\nRiver',
    recipientType: 'penpal',
    contactId: 'p1',
    channel: 'internal',
    status: 'sent',
    createdAt: '2024-11-20T10:30:00Z',
    scheduledWindow: null,
    sentAt: '2024-11-20T10:30:00Z',
    isPenpalReply: true
  },
  {
    id: 'l7',
    title: 'Continuing the conversation',
    body: 'River,\n\nYour response helped me see things from a different angle. I\'m grateful for this slower form of communication, and for your willingness to engage with what I shared.\n\nYou\'re right that writing helps clarify things. Since I sent that first message, I\'ve been doing more of it—just writing down thoughts, questions, things I\'m trying to figure out. It\'s been surprisingly helpful, even when I don\'t share what I write.\n\nI\'ve been thinking about what you said about meeting expectations that aren\'t our own. I realized that a lot of my stress comes from trying to be who I think other people want me to be, rather than who I actually am. It\'s exhausting, and it\'s not sustainable.\n\nI\'m trying to practice being more honest with myself about what I need and what I want. It\'s harder than it sounds, especially when you\'ve spent years operating on autopilot, just doing what seems expected.\n\nI guess what I\'m saying is that this exchange is already helping me slow down and think more clearly. I appreciate having someone to talk to who isn\'t expecting an immediate response, who values thoughtfulness over speed.\n\nI\'d love to hear more about your own experiences with this kind of reflection, if you\'re open to sharing.\n\nThanks again for your thoughtful words.\n\nLooking forward to continuing our conversation',
    recipientType: 'penpal',
    contactId: 'p1',
    channel: 'internal',
    status: 'scheduled',
    createdAt: '2024-12-01T08:00:00Z',
    scheduledWindow: 'within 3-7 days'
  }
];

/**
 * 加载通讯录
 * @returns {Array}
 */
function loadContacts() {
  try {
    const stored = localStorage.getItem(CONTACTS_KEY);
    if (!stored) {
      // 首次加载，使用默认数据
      saveContacts(DEFAULT_CONTACTS);
      return DEFAULT_CONTACTS;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error loading contacts:', e);
    return DEFAULT_CONTACTS;
  }
}

/**
 * 保存通讯录
 * @param {Array} contacts
 */
function saveContacts(contacts) {
  try {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  } catch (e) {
    console.error('Error saving contacts:', e);
  }
}

/**
 * 加载笔友列表
 * @returns {Array}
 */
function loadPenpals() {
  try {
    const stored = localStorage.getItem(PENPALS_KEY);
    if (!stored) {
      savePenpals(DEFAULT_PENPALS);
      return DEFAULT_PENPALS;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error loading penpals:', e);
    return DEFAULT_PENPALS;
  }
}

/**
 * 保存笔友列表
 * @param {Array} penpals
 */
function savePenpals(penpals) {
  try {
    localStorage.setItem(PENPALS_KEY, JSON.stringify(penpals));
  } catch (e) {
    console.error('Error saving penpals:', e);
  }
}

/**
 * 初始化数据（首次加载时）
 */
function initializeData() {
  // 初始化通讯录
  if (!localStorage.getItem(CONTACTS_KEY)) {
    saveContacts(DEFAULT_CONTACTS);
  }
  
  // 初始化笔友
  if (!localStorage.getItem(PENPALS_KEY)) {
    savePenpals(DEFAULT_PENPALS);
  }
  
  // 初始化信件
  const existingLetters = loadLetters();
  if (existingLetters.length === 0) {
    // 如果完全没有信件，直接保存默认数据
    saveLetters(DEFAULT_LETTERS);
  } else {
    // 如果已有信件，更新默认信件（通过 ID 匹配）
    // 对于默认信件，始终使用最新的 body 内容
    let updated = false;
    
    DEFAULT_LETTERS.forEach(defaultLetter => {
      const existingIndex = existingLetters.findIndex(l => l.id === defaultLetter.id);
      if (existingIndex >= 0) {
        // 更新现有默认信件的内容，但保留状态和时间信息
        const existing = existingLetters[existingIndex];
        existingLetters[existingIndex] = {
          ...defaultLetter,
          // 保留用户可能修改的状态和时间
          status: existing.status,
          sentAt: existing.sentAt,
          scheduledWindow: existing.scheduledWindow || defaultLetter.scheduledWindow,
          scheduledWindowStart: existing.scheduledWindowStart || defaultLetter.scheduledWindowStart,
          scheduledWindowEnd: existing.scheduledWindowEnd || defaultLetter.scheduledWindowEnd,
          lastEditedAt: existing.lastEditedAt || defaultLetter.lastEditedAt
        };
        updated = true;
      } else {
        // 添加新的默认信件
        existingLetters.push(defaultLetter);
        updated = true;
      }
    });
    
    if (updated) {
      saveLetters(existingLetters);
    }
  }
}

/**
 * 根据 contactId 获取联系人信息
 * @param {string} contactId
 * @returns {Object|undefined}
 */
function getContactById(contactId) {
  const contacts = loadContacts();
  return contacts.find(c => c.id === contactId);
}

/**
 * 根据 contactId 获取笔友信息
 * @param {string} contactId
 * @returns {Object|undefined}
 */
function getPenpalById(contactId) {
  const penpals = loadPenpals();
  return penpals.find(p => p.id === contactId);
}

/**
 * 添加新联系人
 * @param {Object} contactData
 * @returns {Object}
 */
function addContact(contactData) {
  const contacts = loadContacts();
  const id = 'c' + Date.now().toString();
  const newContact = {
    id: id,
    name: contactData.name,
    channel: contactData.channel,
    phone: contactData.phone || '',
    email: contactData.email || ''
  };
  contacts.push(newContact);
  saveContacts(contacts);
  return newContact;
}

