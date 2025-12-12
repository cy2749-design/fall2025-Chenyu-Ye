// 主应用逻辑
// 包含页面初始化函数和模糊发送逻辑

/**
 * 模糊发送逻辑
 * 检查所有已安排的信件，根据时间窗口决定是否发送
 */
function checkAndSendLetters() {
  const letters = loadLetters();
  const now = new Date();
  let updated = false;
  
  letters.forEach(letter => {
    if (letter.status === 'scheduled' && !letter.sentAt) {
      const windowStart = new Date(letter.scheduledWindowStart);
      const windowEnd = new Date(letter.scheduledWindowEnd);
      
      // 如果当前时间已经超过窗口结束时间，一定发送
      if (now >= windowEnd) {
        letter.status = 'sent';
        letter.sentAt = now.toISOString();
        updated = true;
      }
      // 如果当前时间在窗口内，随机决定是否发送（30% 概率）
      else if (now >= windowStart) {
        if (Math.random() < 0.3) {
          letter.status = 'sent';
          letter.sentAt = now.toISOString();
          updated = true;
        }
      }
    }
  });
  
  if (updated) {
    saveLetters(letters);
  }
}

/**
 * 初始化首页
 */
function initIndexPage() {
  // 初始化数据
  initializeData();
  
  // 检查并发送符合条件的信件
  checkAndSendLetters();
  
  const letters = loadLetters();
  const container = document.getElementById('letters-container');
  const filterButtons = document.querySelectorAll('.filter-btn');
  let currentFilter = 'all';
  
  // 如果没有信件，显示空状态
  if (letters.length === 0) {
    if (container) {
      container.innerHTML = '<p class="empty-state">No letters yet. <a href="write.html">Write your first letter</a>.</p>';
    }
    return;
  }
  
  /**
   * 渲染信件列表
   * @param {string} filter - 'all' | 'draft' | 'scheduled' | 'sent' | 'kept'
   */
  function renderLetters(filter = 'all') {
    if (!container) return;
    
    let filtered = letters;
    if (filter !== 'all') {
      filtered = letters.filter(letter => letter.status === filter);
    }
    
    // 按创建时间倒序排列
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (filtered.length === 0) {
      container.innerHTML = '<p class="empty-state">No letters in this category.</p>';
      return;
    }
    
    container.innerHTML = filtered.map(letter => {
      const statusLabel = {
        'draft': 'Draft',
        'scheduled': 'Scheduled',
        'sent': 'Sent',
        'kept': 'Kept Private',
        'cancelled': 'Cancelled'
      }[letter.status] || letter.status;
      
      // 获取收件人信息
      let recipientName = '(Not specified)';
      let recipientTag = '';
      
      if (letter.recipientType === 'human') {
        const contact = getContactById(letter.contactId);
        if (contact) {
          recipientName = contact.name;
          recipientTag = `<span class="channel-tag">${letter.channel === 'sms' ? 'SMS' : 'Email'}</span>`;
        }
      } else if (letter.recipientType === 'penpal') {
        const penpal = getPenpalById(letter.contactId);
        if (penpal) {
          recipientName = penpal.name;
          recipientTag = `<span class="channel-tag penpal-tag">Pen pal: ${penpal.name}</span>`;
        }
      }
      
      let scheduleInfo = '';
      if (letter.status === 'scheduled' && letter.scheduledWindow) {
        scheduleInfo = `<p class="schedule-info">${letter.scheduledWindow}</p>`;
      } else if (letter.status === 'sent' && letter.sentAt) {
        scheduleInfo = `<p class="schedule-info">Sent on ${formatDate(letter.sentAt)}</p>`;
      }
      
      return `
        <div class="letter-card">
          <div class="letter-header">
            <h3>${letter.title || '(No title)'}</h3>
            <span class="status-badge status-${letter.status}">${statusLabel}</span>
          </div>
          <div class="letter-meta">
            <p><strong>To:</strong> ${recipientName} ${recipientTag}</p>
            <p><strong>Created:</strong> ${formatDate(letter.createdAt)}</p>
            ${scheduleInfo}
          </div>
          <div class="letter-actions">
            <a href="letter.html?id=${letter.id}" class="btn-primary">Open</a>
          </div>
        </div>
      `;
    }).join('');
  }
  
  // 绑定过滤按钮
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter || 'all';
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderLetters(currentFilter);
    });
  });
  
  // 初始渲染
  renderLetters(currentFilter);
}

/**
 * 初始化写信页面
 */
function initWritePage() {
  const form = document.getElementById('letter-form');
  if (!form) return;
  
  // 检查是否是编辑模式（暂时不实现编辑，先专注于新建）
  const urlParams = new URLSearchParams(window.location.search);
  const letterId = urlParams.get('id');
  let editingLetter = null;
  
  if (letterId) {
    editingLetter = getLetterById(letterId);
    // 编辑功能暂时简化，可以后续实现
  } else {
    // 新信件：加载默认设置
    const settings = loadSettings();
    if (settings.defaultWindow) {
      const defaultRadio = document.querySelector(`input[value="${settings.defaultWindow}"]`);
      if (defaultRadio) {
        defaultRadio.checked = true;
      }
    }
  }
  
  // 表单提交处理
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const recipientType = document.querySelector('input[name="recipient-type"]:checked')?.value || 'human';
    const title = document.getElementById('title').value.trim();
    const body = document.getElementById('body').value.trim();
    
    if (!body) {
      alert('Please fill in the "Body" field.');
      return;
    }
    
    let contactId = '';
    let channel = '';
    let newContact = null;
    
    if (recipientType === 'human') {
      const contactSelect = document.getElementById('contact-select');
      const selectedContactId = contactSelect.value;
      
      if (!selectedContactId || selectedContactId === '') {
        alert('Please select a contact or add a new one.');
        return;
      }
      
      if (selectedContactId === 'new') {
        // 新增联系人
        const name = document.getElementById('new-contact-name').value.trim();
        const contactChannel = document.querySelector('input[name="new-contact-channel"]:checked')?.value || 'email';
        const phone = document.getElementById('new-contact-phone').value.trim();
        const email = document.getElementById('new-contact-email').value.trim();
        
        if (!name) {
          alert('Please enter a contact name.');
          return;
        }
        
        if (contactChannel === 'sms' && !phone) {
          alert('Please enter a phone number for SMS.');
          return;
        }
        
        if (contactChannel === 'email' && !email) {
          alert('Please enter an email address.');
          return;
        }
        
        newContact = addContact({
          name,
          channel: contactChannel,
          phone,
          email
        });
        contactId = newContact.id;
        channel = contactChannel;
      } else {
        // 使用已有联系人
        const contact = getContactById(selectedContactId);
        if (!contact) {
          alert('Contact not found.');
          return;
        }
        contactId = contact.id;
        channel = contact.channel;
      }
    } else if (recipientType === 'penpal') {
      const penpalSelect = document.getElementById('penpal-select');
      const selectedPenpalId = penpalSelect.value;
      
      if (!selectedPenpalId) {
        alert('Please select a pen pal.');
        return;
      }
      
      contactId = selectedPenpalId;
      channel = 'internal';
    }
    
    const action = document.querySelector('input[name="action"]:checked')?.value || 'schedule';
    const windowOption = document.querySelector('input[name="window"]:checked')?.value;
    
    // 生成 scheduledWindow 字符串
    let scheduledWindow = null;
    if (action === 'schedule' && windowOption) {
      switch (windowOption) {
        case '1-3':
          scheduledWindow = 'within 1-3 days';
          break;
        case '3-7':
          scheduledWindow = 'within 3-7 days';
          break;
        case '8-14':
          scheduledWindow = 'within 8-14 days';
          break;
      }
    }
    
    // 创建信件对象
    const letter = createLetter({
      title,
      body,
      recipientType,
      contactId,
      channel,
      status: action === 'draft' ? 'draft' : 'scheduled',
      scheduledWindow
    });
    
    // 如果安排了发送，也设置时间窗口（用于模糊发送逻辑）
    if (action === 'schedule' && windowOption) {
      const window = calculateSendingWindow(windowOption);
      letter.scheduledWindowStart = window.start;
      letter.scheduledWindowEnd = window.end;
    }
    
    updateLetter(letter);
    window.location.href = `letter.html?id=${letter.id}`;
  });
}

/**
 * 初始化信件详情页
 */
function initLetterPage() {
  // 初始化数据
  initializeData();
  
  const urlParams = new URLSearchParams(window.location.search);
  const letterId = urlParams.get('id');
  
  if (!letterId) {
    window.location.href = 'index.html';
    return;
  }
  
  const letter = getLetterById(letterId);
  if (!letter) {
    alert('Letter not found.');
    window.location.href = 'index.html';
    return;
  }
  
  // 获取收件人信息
  let recipientName = '(Not specified)';
  let recipientInfo = '';
  
  if (letter.recipientType === 'human') {
    const contact = getContactById(letter.contactId);
    if (contact) {
      recipientName = contact.name;
      recipientInfo = `via ${letter.channel === 'sms' ? 'SMS' : 'Email'}`;
    }
  } else if (letter.recipientType === 'penpal') {
    const penpal = getPenpalById(letter.contactId);
    if (penpal) {
      recipientName = penpal.name;
      recipientInfo = `Pen pal: ${penpal.name}`;
    }
  }
  
  // 渲染信件详情
  const titleEl = document.getElementById('letter-title');
  const toNameEl = document.getElementById('letter-to-name');
  const relationshipEl = document.getElementById('letter-relationship');
  const emotionEl = document.getElementById('letter-emotion');
  const statusEl = document.getElementById('letter-status');
  const createdAtEl = document.getElementById('letter-created-at');
  const bodyEl = document.getElementById('letter-body');
  const scheduleInfoEl = document.getElementById('schedule-info');
  const actionsEl = document.getElementById('letter-actions');
  
  if (titleEl) titleEl.textContent = letter.title || '(No title)';
  if (toNameEl) {
    toNameEl.textContent = recipientName;
    if (recipientInfo) {
      const infoSpan = document.createElement('span');
      infoSpan.className = 'recipient-info';
      infoSpan.textContent = ' ' + recipientInfo;
      toNameEl.appendChild(infoSpan);
    }
  }
  
  // 隐藏不需要的字段（如果存在）
  if (relationshipEl) relationshipEl.parentElement.style.display = 'none';
  if (emotionEl) emotionEl.parentElement.style.display = 'none';
  
  const statusLabel = {
    'draft': 'Draft',
    'scheduled': 'Scheduled',
    'sent': 'Sent',
    'kept': 'Kept Private',
    'cancelled': 'Cancelled'
  }[letter.status] || letter.status;
  if (statusEl) statusEl.textContent = statusLabel;
  if (createdAtEl) createdAtEl.textContent = formatDate(letter.createdAt);
  
  // 显示发送窗口信息
  if (scheduleInfoEl) {
    if (letter.status === 'scheduled' && letter.scheduledWindow) {
      scheduleInfoEl.innerHTML = `<p>${letter.scheduledWindow}</p>`;
      scheduleInfoEl.style.display = 'block';
    } else if (letter.status === 'sent' && letter.sentAt) {
      scheduleInfoEl.innerHTML = `<p>Sent on ${formatDate(letter.sentAt)}.</p>`;
      scheduleInfoEl.style.display = 'block';
    } else if (letter.status === 'kept' || letter.status === 'cancelled') {
      scheduleInfoEl.innerHTML = `<p>This letter was kept private and not sent.</p>`;
      scheduleInfoEl.style.display = 'block';
    } else {
      scheduleInfoEl.style.display = 'none';
    }
  }
  
  // 显示信件内容
  if (bodyEl) {
    bodyEl.innerHTML = letter.body.split('\n').map(para => para.trim() ? `<p>${para}</p>` : '').join('');
  }
  
  // 如果是笔友，显示对话区
  if (letter.recipientType === 'penpal') {
    renderPenpalConversation(letter);
  }
  
  // 渲染操作按钮
  if (actionsEl) {
    let actionsHTML = '';
    
    if (letter.status === 'scheduled') {
      actionsHTML = `
        <a href="write.html?id=${letter.id}" class="btn-primary">Edit & Reschedule</a>
        <button id="keep-btn" class="btn-secondary">Keep to Myself</button>
      `;
    } else if (letter.status === 'draft') {
      actionsHTML = `
        <a href="write.html?id=${letter.id}" class="btn-primary">Edit and Schedule</a>
      `;
    }
    
    actionsHTML += `<a href="index.html" class="btn-link">Back to Letters</a>`;
    actionsEl.innerHTML = actionsHTML;
    
    // 绑定"Keep to Myself"按钮
    const keepBtn = document.getElementById('keep-btn');
    if (keepBtn) {
      keepBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to keep this letter private? It will not be sent.')) {
          letter.status = 'kept';
          letter.scheduledWindowStart = null;
          letter.scheduledWindowEnd = null;
          letter.scheduledWindow = null;
          updateLetter(letter);
          window.location.reload();
        }
      });
    }
  }
  
  // 更新面包屑导航
  const breadcrumbEl = document.getElementById('breadcrumb');
  if (breadcrumbEl) {
    breadcrumbEl.innerHTML = `<a href="index.html">Letters</a> / ${letter.title || '(No title)'}`;
  }
}

/**
 * 渲染笔友对话区
 * @param {Object} currentLetter
 */
function renderPenpalConversation(currentLetter) {
  const penpal = getPenpalById(currentLetter.contactId);
  if (!penpal) return;
  
  // 获取所有与这个笔友的对话
  const allLetters = loadLetters();
  const conversation = allLetters.filter(l => 
    l.recipientType === 'penpal' && l.contactId === currentLetter.contactId
  ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  // 创建对话区容器
  let conversationEl = document.getElementById('penpal-conversation');
  if (!conversationEl) {
    conversationEl = document.createElement('section');
    conversationEl.id = 'penpal-conversation';
    conversationEl.className = 'penpal-conversation';
    const bodySection = document.querySelector('.letter-body-section');
    if (bodySection) {
      bodySection.parentNode.insertBefore(conversationEl, bodySection.nextSibling);
    }
  }
  
  let conversationHTML = '<h3>Conversation with ' + penpal.name + '</h3>';
  conversationHTML += '<div class="conversation-messages">';
  
  conversation.forEach(msg => {
    const isUser = !msg.isPenpalReply;
    const senderName = isUser ? 'You' : penpal.name;
    const className = isUser ? 'message-user' : 'message-penpal';
    
    conversationHTML += `
      <div class="conversation-message ${className}">
        <div class="message-header">
          <strong>${senderName}:</strong>
          <span class="message-date">${formatDate(msg.createdAt)}</span>
        </div>
        <div class="message-body">${msg.body.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('')}</div>
      </div>
    `;
  });
  
  conversationHTML += '</div>';
  
  // 添加生成回复按钮（仅当最后一条消息是用户发送的）
  const lastMessage = conversation[conversation.length - 1];
  if (lastMessage && !lastMessage.isPenpalReply) {
    conversationHTML += `
      <div class="conversation-actions">
        <button id="generate-reply-btn" class="btn-secondary">Generate sample reply</button>
      </div>
    `;
  }
  
  conversationEl.innerHTML = conversationHTML;
  
  // 绑定生成回复按钮
  const generateBtn = document.getElementById('generate-reply-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      generatePenpalReply(currentLetter.contactId, penpal.name);
    });
  }
}

/**
 * 生成笔友示例回复
 * @param {string} penpalId
 * @param {string} penpalName
 */
function generatePenpalReply(penpalId, penpalName) {
  const sampleReplies = [
    'Thank you for sharing that with me. I\'ve been reflecting on what you wrote, and I appreciate the thoughtfulness in your words.\n\nSometimes the slow pace of these exchanges allows us to express things we might rush past in faster conversations. There\'s something valuable about having time to really consider what someone has shared before responding.\n\nWhat you described resonates with me. I\'ve found that when I slow down and really think about what I want to say, I often discover things I didn\'t know I was feeling. Writing helps me understand myself better, and reading your words helps me see things from new perspectives.\n\nI hope you\'re finding this process helpful too. There\'s no pressure here—just space to think, to feel, to express yourself honestly. I\'m here to listen and to respond thoughtfully when I have something meaningful to add.\n\nTake care, and I look forward to continuing our exchange.',
    'I read your message carefully, and I want you to know that I hear you. What you\'re describing resonates with me, though I may not have experienced it in exactly the same way.\n\nThank you for trusting me with these thoughts. It takes courage to be vulnerable, even in a slow, asynchronous exchange like this. I appreciate that you\'re willing to share what\'s on your mind.\n\nI\'ve been thinking about what you said, and it\'s made me reflect on my own experiences. Sometimes hearing someone else articulate something helps us understand our own feelings better. Your words have given me things to consider.\n\nI hope you\'re doing okay, and that writing this helped you process whatever you\'re going through. Sometimes just getting thoughts out of our heads and onto paper (or screen) can be healing in itself.\n\nI\'m here to continue this conversation whenever you\'re ready. No rush.',
    'Your words made me pause and think. There\'s something beautiful about taking time to process before responding.\n\nI appreciate the honesty in what you shared. It\'s not always easy to be open about what we\'re feeling, especially when we\'re still figuring things out ourselves. But I think that\'s when honest communication is most valuable.\n\nI hope you\'re doing okay. It sounds like you\'ve been going through a lot, and I want you to know that your feelings are valid. Sometimes we need to give ourselves permission to feel what we feel, without judgment.\n\nThis slower form of communication has been meaningful for me too. It gives me space to really consider what you\'ve written, to think about how to respond in a way that\'s helpful and genuine.\n\nI\'m here to continue this conversation whenever you\'re ready. Take your time.',
    'I appreciate the space you\'re creating for this kind of exchange. Your message gave me a lot to think about.\n\nSometimes the best conversations happen when we slow down and really listen to each other. In our fast-paced world, it\'s rare to have the luxury of time to process and respond thoughtfully. But I think that\'s when we can have the most meaningful exchanges.\n\nWhat you shared has stayed with me. I\'ve found myself thinking about it at different moments, letting it settle, considering different angles. That\'s the gift of slow communication—it gives ideas room to breathe.\n\nI don\'t have all the answers, but I\'m here to think alongside you, to listen, and to share my own reflections when they might be helpful. There\'s something valuable in having someone to process with, even if we\'re not in the same room or responding in real-time.\n\nThank you for being part of this exchange. I look forward to continuing our conversation.'
  ];
  
  const randomReply = sampleReplies[Math.floor(Math.random() * sampleReplies.length)];
  
  const replyLetter = createLetter({
    title: '',
    body: randomReply,
    recipientType: 'penpal',
    contactId: penpalId,
    channel: 'internal',
    status: 'sent',
    scheduledWindow: null
  });
  
  replyLetter.isPenpalReply = true;
  replyLetter.sentAt = new Date().toISOString();
  
  updateLetter(replyLetter);
  
  // 重新渲染对话区
  const currentLetter = getLetterById(new URLSearchParams(window.location.search).get('id'));
  if (currentLetter) {
    renderPenpalConversation(currentLetter);
  }
}

/**
 * 初始化设置页面
 */
function initSettingsPage() {
  // 初始化数据
  initializeData();
  
  const settings = loadSettings();
  
  // 加载默认窗口设置
  const defaultWindowInputs = document.querySelectorAll('input[name="default-window"]');
  defaultWindowInputs.forEach(input => {
    if (input.value === settings.defaultWindow) {
      input.checked = true;
    }
  });
  
  // 加载用户名称
  const profileNameInput = document.getElementById('profile-name');
  if (profileNameInput) {
    profileNameInput.value = settings.profileName || '';
  }
  
  // 保存设置表单
  const settingsForm = document.getElementById('settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const defaultWindow = document.querySelector('input[name="default-window"]:checked')?.value || '3-7';
      const profileName = profileNameInput ? profileNameInput.value.trim() : '';
      
      saveSettings({
        defaultWindow,
        profileName
      });
      
      alert('Settings saved!');
    });
  }
  
  // 渲染联系人列表
  renderContactsList();
  
  // 渲染笔友列表
  renderPenpalsList();
}

/**
 * 渲染联系人列表
 */
function renderContactsList() {
  const contacts = loadContacts();
  const container = document.getElementById('contacts-list');
  
  if (!container) return;
  
  if (contacts.length === 0) {
    container.innerHTML = '<p class="empty-state">No contacts yet.</p>';
    return;
  }
  
  container.innerHTML = contacts.map(contact => {
    const address = contact.channel === 'sms' ? contact.phone : contact.email;
    return `
      <div class="contact-item">
        <div class="contact-info">
          <strong>${contact.name}</strong>
          <span class="channel-tag">${contact.channel === 'sms' ? 'SMS' : 'Email'}</span>
        </div>
        <div class="contact-address">${address || '(Not set)'}</div>
      </div>
    `;
  }).join('');
}

/**
 * 渲染笔友列表
 */
function renderPenpalsList() {
  const penpals = loadPenpals();
  const container = document.getElementById('penpals-list');
  
  if (!container) return;
  
  if (penpals.length === 0) {
    container.innerHTML = '<p class="empty-state">No pen pals yet.</p>';
    return;
  }
  
  container.innerHTML = penpals.map(penpal => {
    return `
      <div class="penpal-item">
        <div class="penpal-info">
          <strong>${penpal.name}</strong>
          <span class="channel-tag penpal-tag">Pen pal</span>
        </div>
        <div class="penpal-tagline">${penpal.tagline}</div>
      </div>
    `;
  }).join('');
}

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  
  if (page === 'index') {
    initIndexPage();
  } else if (page === 'write') {
    initWritePage();
  } else if (page === 'letter') {
    initLetterPage();
  } else if (page === 'settings') {
    initSettingsPage();
  }
});

