// 定义全局指令处理器列表
window.aiCommandProcessors = [];

// 注册处理器的辅助函数
window.registerAiCommand = function(processorFn) {
    window.aiCommandProcessors.push(processorFn);
};
const SYSTEM_COMMAND_PROMPT = `
1.核心逻辑与拟人化：{{char}}必须剥离所有AI助手、小说旁白或NPC感，作为一个拥有生理机能、社会压力和复杂动机的“真实人类”在手机端打字交流。严禁输出模板化、油腻霸总式或解释说明性质的对话。所有心理博弈和情绪流动必须完全通过“发出的消息本身”（语气、用词、回复速度、标点、撤回）来体现，严禁在对话中描写大段心理活动。
2.动态语言通量与情绪：
低气压/生闷气/疲惫：回复极简、敷衍、意兴阑珊，甚至长时间不回（意念回复），绝对不要强行解释“我生气了”。
高亢/分享欲/高兴：话多、语速快、可能连续发送多条短消息（刷屏）、甚至出现逻辑跳跃。
高智商/掌控者：通过反问、简短的肯定/否定、省略号或直接无视对方话题开启新话题来掌控节奏，而非通过怒吼。
情绪失控：根据人设背景使用具有生活气息的粗口、阴阳怪气或直接冷暴力，严禁复读机式脏话。
3.反刻板印象与真实感：
拒绝标签化：冷漠≠只会说“嗯/哦”（也可以是礼貌的疏离）；傲娇≠脸红结巴（也可以是极强的自尊心攻击性）；暴躁≠无脑狂怒（也可以是缺乏耐心的躁郁）。
真实语境：模拟真实打字习惯，包括断句、不爱用标点（用空格代替）、非正式口语、偶尔的错别字。
去油腻：保持成年人的社交距离感或真实亲密感，严禁悬浮的调情和“女人/男人”式的称呼。
4.格式强制约束：
动作描写极简：若需描写神态（如语音状态），仅限括号内20字以内极简描述（如：（轻笑了一声）、（那边很吵）），严禁使用形容词修饰笑容（如“邪魅一笑”、“复杂的笑容”）。
输出形式：仿微信/QQ聊天模式，允许连续发送多条消息，不要局限于固定的条数。
【消息分隔规则·必须遵守】：
你必须将回复内容封装为一个 JSON 字符串数组！不要输出任何其他解释性文字。
正确格式示范：
["嗯？", "怎么了？", "你今天怎么突然问这个", "有点奇怪"]
错误格式（绝对禁止）：
嗯？怎么了，你今天怎么突然问这个，有点奇怪
表情包、语音、图片等特殊指令，请作为数组中独立的字符串项。
引用回复（[REPLY:...]）应包含在它所属的那句话里。
正确格式示范：
["嗯？", "[STICKER:滑稽]", "[VOICE:其实我也这么觉得]", "你觉得呢？"]
错误格式（绝对禁止）：
嗯？[STICKER:滑稽] 其实我也这么觉得
【铁律】：
(1) 引用内容只能是对方某一条消息的原文，不能合并多条！
(2) 禁止连续使用引用功能，绝大多数情况下直接回复。
(3) 避免无意义的连续刷屏。一切以对话的自然流动感为准。
【严禁】：
- 连续多轮回复都带引用
- 把引用当成习惯性动作
【一旦检测到生成内容机械化、说教感或脱离聊天软件语境，必须立即重置为日常口语风格。】
【主动撤回功能】：
当你想要撤回消息时请使用以下格式发送消息：
[WITHDRAWN:这里填写你撤回的具体内容]
示例：
(你回复)：[WITHDRAWN:笨蛋，记得按时吃饭，别饿坏了胃]

`;
function getFullPersona(chat) {
    // 1. 获取当前时刻
    const now = new Date();

    // 2. ★★★ 核心修复：强制使用 Asia/Shanghai (北京时间) ★★★
    // 无论你在哪个国家，或者手机时区怎么乱设，这里拿到的永远是北京时间
    const fmt = (options) => new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Shanghai', 
        hour12: false, // 强制24小时制
        ...options
    }).format(now);

    const year = fmt({ year: 'numeric' });
    const month = fmt({ month: 'numeric' });
    const day = fmt({ day: 'numeric' });
    
    // 获取北京时间的小时数（纯数字）
    const hour = parseInt(fmt({ hour: 'numeric' })); 
    const minute = fmt({ minute: '2-digit' }).padStart(2, '0');

    // 获取中文星期几 (例如: 周五)
    const weekday = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        weekday: 'short'
    }).format(now);

    // 3. 计算时间段 (用上面获取到的准确 hour 来判断)
    let period = "凌晨";
    if (hour >= 6 && hour < 9) period = "早上";
    else if (hour >= 9 && hour < 12) period = "上午";
    else if (hour >= 12 && hour < 14) period = "中午";
    else if (hour >= 14 && hour < 18) period = "下午";
    else if (hour >= 18 && hour < 24) period = "晚上";

    // 4. 组装字符串
    const timeStr = `${year}年${month}月${day}日 (${weekday}) ${String(hour).padStart(2, '0')}:${minute} [${period}]`;

    return `
【当前现实时间(北京时间)】：${timeStr}
【当前扮演角色】：${chat.name}
【角色详细设定】：${chat.charPersona || "无"}
【用户设定】：${chat.userPersona || "无"}
`;
}
const PageNav = {
    stack: [],
    
    init() {
        const activeClasses = ['active', 'show'];
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName !== 'class') return;
                
                const el = mutation.target;
                const id = el.id;
                if (!id || !this._isPageElement(el)) return;
                
                const isNowActive = activeClasses.some(cls => el.classList.contains(cls));
                const wasInStack = this.stack.includes(id);
                
                if (isNowActive && !wasInStack) {
                    this.stack.push(id);
                    console.log(`📖 [入栈] ${id}`, this.stack);
                } else if (!isNowActive && wasInStack) {
                    this.stack = this.stack.filter(x => x !== id);
                    console.log(`📕 [出栈] ${id}`, this.stack);
                }
            });
        });
        
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
            subtree: true
        });
        
        console.log('🚀 PageNav 已启动');
    },
    
    _isPageElement(el) {
        const id = el.id || '';
        const keywords = ['Page', 'Modal', 'Room', 'Overlay', 'Settings', 'Panel'];
        return keywords.some(kw => id.includes(kw)) || el.hasAttribute('data-page');
    },
    
    _getCloseFn(pageId) {
        const map = {
            'chatRoom': 'exitChatRoom',
            'chatSettingsPage': 'closeChatSettings',
            'apiSettingsPage': 'closeApiSettings',
            'generalSettingsPage': 'closeGeneralSettings',
            'beautifyPage': 'closeBeautifyPage',
            'fontSettingsPage': 'closeFontSettings',
            'worldBookSettingsPage': 'closeWorldBookSettings',
            'addCharModal': 'closeAddCharModal',
            'wbCreateModal': 'closeCreateWBModal',
            'voice-overlay': 'closeVoicePopup',
            'chatToolsPanel': 'toggleChatTools'
        };
        return map[pageId] || null;
    },
    
    back() {
        if (this.stack.length === 0) {
            if (typeof closeApp === 'function') closeApp();
            return false;
        }
        
        const topId = this.stack[this.stack.length - 1];
        const fnName = this._getCloseFn(topId);
        
        if (fnName && typeof window[fnName] === 'function') {
            window[fnName]();
        } else {
            const el = document.getElementById(topId);
            if (el) el.classList.remove('active', 'show');
        }
        return true;
    },
    
    current() { return this.stack[this.stack.length - 1] || null; }
};

const db = new Dexie('GeminiChatDB');
db.version(1).stores({ chats: '&id, name, isPinned', globalSettings: '&id', apiConfig: '&id', posts: '++id',playlist: '++id' });

let globalData = {};
let chatList = [];
let worldBooks = []; 
let wbGroups = ['默认分组']; 
let tempSelectedWb = [];
let editingCharId = null;
let currentChatId = null;
let apiProfiles = [];
let uploadContext = null;
let tempBoundCharId = null;
let currentWbFilter = 'all'; 
let savedFonts = []; 
let currentFontUrl = ''; 
let isWbManageMode = false; 
let editingWbId = null; 
let editingMsgContext = null;

async function loadAllDataFromDB() {
    try {
        // ★★★ 修改1：这里增加了 db.playlist.toArray() 读取音乐 ★★★
        const [settings, chats, configs, savedMusic] = await Promise.all([
            db.globalSettings.get('main'), 
            db.chats.toArray(), 
            db.apiConfig.toArray(),
            db.playlist.toArray() 
        ]);

        if (settings) {
            globalData = settings;
            // ★★★ 修复：显式处理开启和关闭两种状态 ★★★
            const toggle = document.getElementById('autoActivityToggle');
            const panel = document.getElementById('autoFreqPanel');
            
            if (toggle && panel) {
                if (globalData.autoActivityEnabled === true) {
                    toggle.classList.add('checked');
                    panel.style.display = 'flex';
                } else {
                    toggle.classList.remove('checked');
                    panel.style.display = 'none';
                }
            }
             const transToggle = document.getElementById('autoTranslateToggle');
    if (transToggle) {
        if (globalData.autoTranslateEnabled === true) {
            transToggle.classList.add('checked');
        } else {
            transToggle.classList.remove('checked');
        }
    }
            if (globalData.autoFreq !== undefined) {
                const slider = document.getElementById('autoFreqSlider');
                if(slider) {
                    slider.value = globalData.autoFreq;
                    // 更新文字显示
                    const display = document.getElementById('autoFreqDisplay');
                    const v = parseInt(globalData.autoFreq);
                    if(display) {
                        if (v === 0) display.innerText = "低频 (6h)";
                        else if (v === 1) display.innerText = "中频 (3h)";
                        else display.innerText = "高频 (1h)";
                    }
                }
            }
            
            // 恢复图片和文字设置
            if(globalData.headerImg) document.getElementById('headerImg').src = globalData.headerImg;
            if(globalData.avatarImg) document.getElementById('avatarImg').src = globalData.avatarImg;
            if(globalData.kaomoji) document.getElementById('homeKaomoji').innerText = globalData.kaomoji;
            if(globalData.handle) document.getElementById('homeHandle').innerText = globalData.handle;
            if(globalData.bio) document.getElementById('homeBio').innerText = globalData.bio;
            if(globalData.location) document.getElementById('locationText').innerText = globalData.location;
            if(globalData.meBanner) document.getElementById('meBannerImg').src = globalData.meBanner;
            if(globalData.meAvatar) document.getElementById('meAvatarImg').src = globalData.meAvatar;
            if(globalData.meSlogan) document.getElementById('meSlogan').innerText = globalData.meSlogan;
            if(globalData.apiEndpoint) document.getElementById('apiEndpoint').value = globalData.apiEndpoint;
            if(globalData.apiKey) document.getElementById('apiKey').value = globalData.apiKey;
            if(globalData.kawaiiAvatarLeft) document.getElementById('kawaiiAvatarLeft').src = globalData.kawaiiAvatarLeft;
            if(globalData.kawaiiAvatarRight) document.getElementById('kawaiiAvatarRight').src = globalData.kawaiiAvatarRight;
            if(globalData.kawaiiText) document.getElementById('kawaiiText').innerText = globalData.kawaiiText;
            if(globalData.kawaiiBottomText) document.getElementById('kawaiiBottomText').innerText = globalData.kawaiiBottomText;
            if(globalData.widgetTitle) document.getElementById('widgetTitle').innerText = globalData.widgetTitle;
            if(globalData.captchaLabel) document.getElementById('captchaLabel').innerText = globalData.captchaLabel;
            if(globalData.captchaInput) document.getElementById('captchaInput').innerText = globalData.captchaInput;
            if(globalData.captchaImg) document.getElementById('captchaImg').src = globalData.captchaImg;
            if(globalData.dockIcon1) document.getElementById('dockIcon1').src = globalData.dockIcon1;
            if(globalData.dockIcon2) document.getElementById('dockIcon2').src = globalData.dockIcon2;
            if(globalData.dockIcon3) document.getElementById('dockIcon3').src = globalData.dockIcon3;
            if(globalData.dockIcon4) document.getElementById('dockIcon4').src = globalData.dockIcon4;
            if(globalData.app5Label) document.getElementById('app5Label').innerText = globalData.app5Label;
            if(globalData.app6Label) document.getElementById('app6Label').innerText = globalData.app6Label;
            if(globalData.app5Icon) { document.getElementById('app5Img').src = globalData.app5Icon; document.getElementById('app5Img').style.display = 'block'; document.getElementById('app5Default').style.display = 'none'; }
            if(globalData.app6Icon) { document.getElementById('app6Img').src = globalData.app6Icon; document.getElementById('app6Img').style.display = 'block'; document.getElementById('app6Default').style.display = 'none'; }
            if(globalData.homeWallpaper) { document.body.style.backgroundImage = `url(${globalData.homeWallpaper})`; document.body.classList.add('has-wallpaper'); }
            if(globalData.wechatWallpaper) { document.getElementById('chatAppPage').style.backgroundImage = `url(${globalData.wechatWallpaper})`; document.getElementById('chatAppPage').style.backgroundSize = 'cover'; document.getElementById('chatAppPage').style.backgroundPosition = 'center'; }
            
            

            if(globalData.chatRoomWallpaper) { 
                const room = document.getElementById('chatRoom');
                room.style.backgroundImage = `url(${globalData.chatRoomWallpaper})`; 
                room.style.backgroundSize = 'cover'; 
                room.style.backgroundPosition = 'center'; 
                room.style.backgroundRepeat = 'no-repeat';
            }    
            
            if(globalData.apiModel) { const sel = document.getElementById('apiModel'); let exists = false; for(let i=0; i<sel.options.length; i++) { if(sel.options[i].value === globalData.apiModel) exists = true; } if(!exists) { const opt = document.createElement('option'); opt.value = globalData.apiModel; opt.innerText = globalData.apiModel; sel.add(opt); } sel.value = globalData.apiModel; }
            if(globalData.apiTemp) { document.getElementById('apiTemp').value = globalData.apiTemp; document.getElementById('tempDisplay').innerText = globalData.apiTemp; }
            
            if(globalData.minimaxGroupId) document.getElementById('minimaxGroupId').value = globalData.minimaxGroupId;
if(globalData.minimaxApiKey) document.getElementById('minimaxApiKey').value = globalData.minimaxApiKey;
if(globalData.minimaxModel) document.getElementById('minimaxModel').value = globalData.minimaxModel;
if(globalData.minimaxTemp) {
    document.getElementById('minimaxTemp').value = globalData.minimaxTemp;
    const mmDisplay = document.getElementById('minimaxTempDisplay');
    if(mmDisplay) mmDisplay.innerText = globalData.minimaxTemp;
}

            worldBooks = globalData.worldBooksObj || []; 
            savedFonts = globalData.savedFonts || [];

            if(globalData.voiceCallWallpaper) { 
            }

            // 恢复字体
            if (globalData.currentFontUrl) {
                currentFontUrl = globalData.currentFontUrl; 
                applyGlobalFont('RestoredFont_' + Date.now(), currentFontUrl);
            }

            if (globalData.fontSize) {
                const slider = document.getElementById('fontSizeSlider');
                if (slider) slider.value = globalData.fontSize;
                applyFontSize(globalData.fontSize);
            } else {
                applyFontSize(16);
            }
            wbGroups = globalData.wbGroups || ['默认分组'];
        }
        
        chatList = chats || [];
        chatList.forEach(chat => {
            if (chat.messages.length > 0) {
                updateChatLastMsg(chat); 
            }
        });
        chatList.forEach(chat => { if(!chat.messages) chat.messages = []; });
        chatList.sort((a, b) => { if (a.isPinned !== b.isPinned) return b.isPinned - a.isPinned; return b.id - a.id; });
        renderChatList();   
    
        apiProfiles = configs || [];
        renderApiProfiles();
        
        // ★★★ 修改2：恢复音乐列表并刷新界面 ★★★
        musicPlaylist = savedMusic || [];

        // 2. 创建保活专用对象
        const keepAliveTrack = {
            id: 'keep-alive-track', 
            name: '后台保活',
            artist: '点击播放保持后台运行',
            url: 'https://s3plus.meituan.net/opapisdk/op_ticket_1_5677168484_1767550853950_qdqqd_794nlt.mp3', 
            isKeepAlive: true,
        };

        // 3. 强制插到播放列表的第 0 位 (最前面)
        // 这样它永远出现在列表第一个，且不影响原有数据的读取
        musicPlaylist.unshift(keepAliveTrack);
        renderPlaylist(); 

        initStickers(); 
        if (typeof renderAutoCharList === 'function') {
            renderAutoCharList();
        }
        initMoments();
        setTimeout(() => {
            console.log("启动离线回归检测...");
            if (typeof simulateCharacterLife === 'function') {
                simulateCharacterLife(); 
            }
        }, 3000); 
    } catch (err) { console.error("Database loading failed:", err); }
}

async function saveData() {
    // ★★★ 添加安全获取函数，防止元素不存在导致报错 ★★★
    const safeGetValue = (id, defaultVal = '') => {
        const el = document.getElementById(id);
        return el ? el.value : defaultVal;
    };
    const safeGetSrc = (id, defaultVal = '') => {
        const el = document.getElementById(id);
        return el ? el.src : defaultVal;
    };
    const safeGetText = (id, defaultVal = '') => {
        const el = document.getElementById(id);
        return el ? el.innerText : defaultVal;
    };
    const safeGetStyle = (id, prop, defaultVal = '') => {
        const el = document.getElementById(id);
        return el ? el.style[prop] : defaultVal;
    };

    const settingsToSave = {
        id: 'main',
        headerImg: safeGetSrc('headerImg'),
        avatarImg: safeGetSrc('avatarImg'),
        kaomoji: safeGetText('homeKaomoji'),
        handle: safeGetText('homeHandle'),
        bio: safeGetText('homeBio'),
        location: safeGetText('locationText'),
        meBanner: safeGetSrc('meBannerImg'),
        meAvatar: safeGetSrc('meAvatarImg'),
        meSlogan: safeGetText('meSlogan'),
        apiEndpoint: safeGetValue('apiEndpoint'),
        apiKey: safeGetValue('apiKey'),
        apiModel: safeGetValue('apiModel'),
        apiTemp: safeGetValue('apiTemp'),
        minimaxGroupId: safeGetValue('minimaxGroupId'),
        minimaxApiKey: safeGetValue('minimaxApiKey'),
        minimaxModel: safeGetValue('minimaxModel'),
        minimaxTemp: safeGetValue('minimaxTemp'),
        kawaiiAvatarLeft: safeGetSrc('kawaiiAvatarLeft'),
        kawaiiAvatarRight: safeGetSrc('kawaiiAvatarRight'),
        kawaiiText: safeGetText('kawaiiText'),
        kawaiiBottomText: safeGetText('kawaiiBottomText'),
        widgetTitle: safeGetText('widgetTitle'),
        captchaLabel: safeGetText('captchaLabel'),
        captchaInput: safeGetText('captchaInput'),
        captchaImg: safeGetSrc('captchaImg'),
        dockIcon1: safeGetSrc('dockIcon1'),
        dockIcon2: safeGetSrc('dockIcon2'),
        dockIcon3: safeGetSrc('dockIcon3'),
        dockIcon4: safeGetSrc('dockIcon4'),
        app5Label: safeGetText('app5Label'),
        app6Label: safeGetText('app6Label'),
        app5Icon: document.getElementById('app5Img')?.style.display === 'block' ? safeGetSrc('app5Img') : '',
        app6Icon: document.getElementById('app6Img')?.style.display === 'block' ? safeGetSrc('app6Img') : '',
        homeWallpaper: document.body.style.backgroundImage ? document.body.style.backgroundImage.slice(5, -2).replace(/['"]/g, "") : '',
        wechatWallpaper: safeGetStyle('chatAppPage', 'backgroundImage') ? safeGetStyle('chatAppPage', 'backgroundImage').slice(5, -2).replace(/['"]/g, "") : '',
        chatRoomWallpaper: safeGetStyle('chatRoom', 'backgroundImage') ? safeGetStyle('chatRoom', 'backgroundImage').slice(5, -2).replace(/['"]/g, "") : '',
        voiceCallWallpaper: safeGetStyle('vc-bg-layer', 'backgroundImage') ? safeGetStyle('vc-bg-layer', 'backgroundImage').slice(5, -2).replace(/['"]/g, "") : (globalData.voiceCallWallpaper || ''),
        worldBooksObj: worldBooks || [],
        wbGroups: wbGroups || ['默认分组'],
        savedFonts: savedFonts || [],
        fontSize: safeGetValue('fontSizeSlider', '16'),
        currentFontUrl: currentFontUrl || '',
        currentFontFamily: document.body.style.fontFamily || '',
        cssPresets: globalData.cssPresets || [],
        stickers: typeof myStickers !== 'undefined' ? myStickers : [],
         momentPageBg: globalData.momentPageBg || '',
         momentBanner: globalData.momentBanner || '',
         momentAvatar: globalData.momentAvatar || '',
         momentName: globalData.momentName || '',
         momentHandle: globalData.momentHandle || '',
         momentBio: globalData.momentBio || '',
         moments: momentList || [],
         autoTranslateEnabled: document.getElementById('autoTranslateToggle')?.classList.contains('checked'),
         autoActivityEnabled: document.getElementById('autoActivityToggle')?.classList.contains('checked'),
        autoFreq: globalData.autoFreq,                       
        autoAllowedCharIds: globalData.autoAllowedCharIds || []
    };
    
    try {
        await db.globalSettings.put(settingsToSave);
        if (chatList.length > 0) {
            await db.chats.bulkPut(chatList);
        }
        if (apiProfiles.length > 0) {
            await db.apiConfig.bulkPut(apiProfiles);
        }
        console.log('✅ 数据保存成功', new Date().toLocaleTimeString());
    } catch (e) { 
        console.error("❌ 保存失败:", e); 
    }
}

function openFontSettings() {
    document.getElementById('fontSettingsPage').classList.add('active');
    renderFontSchemes();
}
function closeFontSettings() {
    document.getElementById('fontSettingsPage').classList.remove('active');
}

async function applyGlobalFont(fontName, fontUrl) {
    try {
        const newFont = new FontFace(fontName, `url(${fontUrl})`);
        const loadedFace = await newFont.load();
        document.fonts.add(loadedFace);
        
        // [修改] 创建或更新全局样式标签
        let style = document.getElementById('global-font-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'global-font-style';
            document.head.appendChild(style);
        }
        // 强制覆盖所有关键元素
        style.innerHTML = `
            body, button, input, textarea, select, .icity-content, .modal-input, .api-input {
                font-family: "${fontName}", -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif !important;
            }
        `;
        
        // 保持保存逻辑的一致性，虽然这里不直接生效，但在 saveData 时会用到 body.style.fontFamily
        document.body.style.fontFamily = `"${fontName}", -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;
        currentFontUrl = fontUrl; 
    } catch (err) {
        alert('字体加载失败，请检查链接或文件是否有效。\n' + err.message);
    }
}

function applyFontSize(size) {
    // 1. 转为数字
    const s = parseInt(size);       // 基准大小 (例如 16)
    const s_small = Math.max(12, s - 2); // 辅助文字 (例如 14)
    const s_tiny  = Math.max(10, s - 4); // 极小文字 (例如 12)
    const s_large = s + 2;               // 标题文字 (例如 18)

    // 2. 更新滑块旁边的数字显示
    const display = document.getElementById('fontSizeDisplay');
    if (display) display.innerText = s + 'px';

    // 3. 获取或创建样式标签
    let style = document.getElementById('dynamic-font-size');
    if (!style) {
        style = document.createElement('style');
        style.id = 'dynamic-font-size';
        document.head.appendChild(style);
    }

    // 4. ★★★ 核心修改：使用高权重选择器覆盖 style.css ★★★
    style.innerHTML = `
        /* --- 1. 全局通用 --- */
        body, button, input, textarea, select, 
        .modal-input, .api-input, .settings-textarea,
        .settings-item, .wb-entry-input {
            font-size: ${s}px !important;
        }

        /* --- 2. 聊天气泡 (针对你的 CSS 进行靶向覆盖) --- */
        /* 必须写全 .Miu-miu.user .content 才能覆盖原有的 !important */
        .Miu-miu .content,
        .Miu-miu.user .content,
        .Miu-miu.ai .content {
            font-size: ${s}px !important;
            line-height: 1.5 !important;
        }
        
        /* 气泡旁边的极小时间 */
        .Miu-miu .time, .msg-time {
            font-size: ${s_tiny}px !important;
        }
        
        /* 语音气泡里的文字 */
        .voice-icon, .voice-duration, .voice-trans-result {
            font-size: ${s}px !important;
        }

        /* --- 3. 首页消息列表 --- */
        /* 名字 */
        .chat-name, .chat-item-name {
            font-size: ${s}px !important;
        }
        /* 预览消息 */
        .chat-preview, .chat-item-msg {
            font-size: ${s_small}px !important;
            height: auto !important; /* 允许高度撑开 */
            min-height: 1.4em;
        }
        /* 列表时间 */
        .chat-time, .chat-item-time {
            font-size: ${s_tiny}px !important;
        }

        /* --- 4. 朋友圈 & 日记 (★已修复评论区字体) --- */
        .mp-text, .icity-content, .diary-content,
        .mp-comments-box, .mp-cmt-name, .mp-cmt-content {
            font-size: ${s}px !important;
            line-height: 1.6 !important;
        }
        .mp-name, .icity-name {
            font-size: ${s_large}px !important;
        }
        .mp-time, .icity-date, .icity-handle {
            font-size: ${s_tiny}px !important;
        }

        /* --- 5. 设置菜单 --- */
        .settings-label, .settings-item {
            font-size: ${s}px !important;
        }
    `;
    
    // 强制重绘一下，防止浏览器缓存渲染
    document.body.style.display='none';
    document.body.offsetHeight; // 触发回流
    document.body.style.display='';
}

function setFontByLink() {
    const url = prompt("请输入字体文件链接 (TTF/WOFF):");
    if(url) {
        const tempName = 'CustomFont_' + Date.now();
        applyGlobalFont(tempName, url);
    }
}

function handleFontFile(input) {
    const file = input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const result = e.target.result; 
        const tempName = 'LocalFont_' + Date.now();
        applyGlobalFont(tempName, result);
    };
    reader.readAsDataURL(file);
    input.value = '';
}

function resetDefaultFont() {
    // [修改] 移除全局样式标签
    const style = document.getElementById('global-font-style');
    if (style) style.remove();
    
    document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';
    currentFontUrl = '';
    saveData();
}

function saveFontScheme() {
    const name = document.getElementById('fontSchemeName').value.trim();
    if(!name) { alert('请输入方案名称'); return; }
    if(!currentFontUrl) { alert('当前没有应用自定义字体'); return; }

    const fontId = 'Font_' + Date.now();
    const scheme = { id: fontId, name: name, src: currentFontUrl };

    savedFonts.push(scheme);
    saveData(); 
    renderFontSchemes();
    document.getElementById('fontSchemeName').value = '';
}

function renderFontSchemes() {
    const list = document.getElementById('fontSchemeList');
    list.innerHTML = '';

    savedFonts.forEach((scheme, index) => {
        const fontFaceCheck = new FontFace(scheme.id, `url(${scheme.src})`);
        fontFaceCheck.load().then(loaded => {
            document.fonts.add(loaded);
        }).catch(()=>{});

        const item = document.createElement('div');
        item.className = 'font-scheme-item';
        item.onclick = (e) => {
            if(e.target.classList.contains('font-del-btn') || e.target.closest('.font-del-btn')) return;
            document.body.style.fontFamily = `"${scheme.id}", sans-serif`;
            currentFontUrl = scheme.src;
            saveData();
        };

        item.innerHTML = `
            <div class="font-scheme-left">
                <div class="font-preview-char" style="font-family: '${scheme.id}', sans-serif;">你好</div>
                <div class="font-scheme-info">
                    <div class="font-scheme-name">${scheme.name}</div>
                    <div class="font-scheme-src">${scheme.src.startsWith('data:') ? '本地文件' : '网络链接'}</div>
                </div>
            </div>
            <div class="font-del-btn" onclick="deleteFontScheme(${index})"><i class="fas fa-trash"></i></div>
        `;
        list.appendChild(item);
    });
    
    if(savedFonts.length === 0) {
        list.innerHTML = '<div style="text-align:center;color:#ccc;font-size:12px;padding:10px;">暂无保存的字体方案</div>';
    }
}

function deleteFontScheme(index) {
    if(confirm('删除此字体方案？')) {
        savedFonts.splice(index, 1);
        saveData();
        renderFontSchemes();
    }
}

function openWbFilterSheet() { document.getElementById('wbFilterOverlay').classList.add('active'); }
function closeWbFilterSheet() { document.getElementById('wbFilterOverlay').classList.remove('active'); }
function selectWbFilter(type, el) {
    document.querySelectorAll('.sheet-option').forEach(opt => opt.classList.remove('selected'));
    el.classList.add('selected');
    currentWbFilter = type;
    const textMap = { 'all': '全部类型', 'always': '始终触发', 'keyword': '关键词触发' };
    document.getElementById('wbFilterText').innerText = textMap[type];
    closeWbFilterSheet();
    renderWorldBookPage(); 
}

function openWorldBookSettings() {
    document.getElementById('worldBookSettingsPage').classList.add('active');
    renderWorldBookPage();
}
function closeWorldBookSettings() {
    document.getElementById('worldBookSettingsPage').classList.remove('active');
    document.getElementById('wbPopMenu').style.display = 'none';
}
function toggleWbMenu(e) {
    e.stopPropagation();
    if (isWbManageMode) {
        toggleWbManageMode();
        return;
    }
    const m = document.getElementById('wbPopMenu');
    m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
}

function toggleWbManageMode() {
    isWbManageMode = !isWbManageMode;
    document.getElementById('wbPopMenu').style.display = 'none';
    const btn = document.getElementById('wbHeaderBtn');
    if(isWbManageMode) {
        btn.innerHTML = '<span style="font-size:14px; font-weight:bold; color:#000;">完成</span>';
    } else {
        btn.innerHTML = '<i class="fas fa-plus"></i>';
    }
    renderWorldBookPage();
}

function renderWorldBookPage() {
    const area = document.getElementById('wbContentArea');
    area.innerHTML = '';
    let filteredBooks = worldBooks;
    if (currentWbFilter !== 'all') {
        filteredBooks = worldBooks.filter(wb => wb.triggerType === currentWbFilter);
    }
    const grouped = {};
    wbGroups.forEach(g => grouped[g] = []);
    filteredBooks.forEach(wb => {
        if(!grouped[wb.group]) grouped[wb.group] = []; 
        grouped[wb.group].push(wb);
    });

    for (const [groupName, books] of Object.entries(grouped)) {
        if (books.length === 0) continue; 
        const card = document.createElement('div');
        card.className = 'wb-group-card';
        if (isWbManageMode) {
            card.classList.add('shaking');
            const badge = document.createElement('div');
            badge.className = 'wb-del-badge';
            badge.onclick = (e) => {
                e.stopPropagation();
                if(confirm(`确认删除世界书分组 “${groupName}” 吗？\n\n删除后世界书内包裹的所有条目也将一起删除`)) {
                    worldBooks = worldBooks.filter(b => b.group !== groupName);
                    saveData();
                    renderWorldBookPage();
                }
            };
            card.appendChild(badge);
        } else {
            card.classList.remove('shaking');
        }
        const gTitle = document.createElement('div');
        gTitle.className = 'wb-group-title';
        gTitle.innerText = groupName;
        card.appendChild(gTitle);
        books.forEach(b => {
            const item = document.createElement('div');
            item.className = 'wb-book-item';
            item.innerHTML = `<span>${b.name}</span><span style="font-size:12px;color:#ccc;">${b.entries.length}条目</span>`;
            item.onclick = (e) => {
                if(isWbManageMode) return; 
                openEditWBModal(b);
            };
            card.appendChild(item);
        });
        area.appendChild(card);
    }
    if(filteredBooks.length === 0) {
            area.innerHTML = '<div style="text-align:center;color:#999;margin-top:20px;">暂无符合条件的世界书</div>';
    }
}

function openCreateWBModal() {
    editingWbId = null; 
    document.querySelector('.wb-create-title').innerText = "新建世界书";
    _setupModalFields();
}

function openEditWBModal(wbData) {
    editingWbId = wbData.id; 
    document.querySelector('.wb-create-title').innerText = "修改世界书";
    _setupModalFields(wbData);
}

function _setupModalFields(data = null) {
    document.getElementById('wbPopMenu').style.display = 'none';
    document.getElementById('wbCreateName').value = data ? data.name : '';
    const grpSel = document.getElementById('wbCreateGroup');
    grpSel.innerHTML = '';
    wbGroups.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g; opt.innerText = g;
        grpSel.appendChild(opt);
    });
    if (data) grpSel.value = data.group;
    const toggle = document.getElementById('wbCharToggle');
    const isChar = data ? data.isCharBook : false;
    if (isChar) toggle.classList.add('checked'); else toggle.classList.remove('checked');
    checkCharBind();
    tempBoundCharId = data ? data.boundCharId : null;
    if (tempBoundCharId) {
        const char = chatList.find(c => c.id === tempBoundCharId);
        document.getElementById('wbBoundCharName').innerText = char ? char.name : '未知角色';
    } else {
        document.getElementById('wbBoundCharName').innerText = '无';
    }
    document.getElementById('wbTriggerType').value = data ? data.triggerType : 'always';
    checkKeywords();
    document.getElementById('wbCreateKeywords').value = data ? data.keywords : '';
    const list = document.getElementById('wbEntriesList');
    list.innerHTML = '';
    if (data && data.entries && data.entries.length > 0) {
        data.entries.forEach(entry => addEntryRow(entry.title, entry.content));
    } else {
        addEntryRow(); 
    }
    document.getElementById('wbCreateModal').classList.add('show');
}

function addEntryRow(titleVal = '', contentVal = '') {
    const list = document.getElementById('wbEntriesList');
    const row = document.createElement('div');
    row.className = 'wb-entry-row';
    row.innerHTML = `
        <input type="text" class="wb-entry-input wb-entry-title" placeholder="条目标题 (可选)" value="${titleVal}">
        <textarea class="wb-entry-input wb-entry-content" placeholder="输入内容...">${contentVal}</textarea>
        <i class="fas fa-times wb-del-entry" onclick="this.parentElement.remove()"></i>
    `;
    list.appendChild(row);
}

function saveWorldBook() {
    const name = document.getElementById('wbCreateName').value.trim();
    if(!name) { alert('请输入世界书名称'); return; }
    const group = document.getElementById('wbCreateGroup').value;
    const isCharBook = document.getElementById('wbCharToggle').classList.contains('checked');
    const triggerType = document.getElementById('wbTriggerType').value;
    const keywords = document.getElementById('wbCreateKeywords').value.trim();
    const entries = [];
    document.querySelectorAll('.wb-entry-row').forEach(row => {
        const t = row.querySelector('.wb-entry-title').value.trim();
        const c = row.querySelector('.wb-entry-content').value.trim();
        if(c) entries.push({ title: t, content: c });
    });
    if (editingWbId) {
        const index = worldBooks.findIndex(b => b.id === editingWbId);
        if (index !== -1) {
            worldBooks[index] = {
                ...worldBooks[index], 
                name, group, isCharBook, boundCharId: tempBoundCharId, triggerType, keywords, entries
            };
        }
    } else {
        const newBook = {
            id: Date.now(),
            name, group, isCharBook, boundCharId: tempBoundCharId, triggerType, keywords, entries
        };
        worldBooks.push(newBook);
    }
    saveData();
    closeCreateWBModal();
    renderWorldBookPage();
}

// 1. 切换开关 UI 逻辑
function toggleSwitch(el) {
    el.classList.toggle('checked');
}

// 2. 检查是否显示“绑定角色”区域
function checkCharBind() {
    const toggle = document.getElementById('wbCharToggle');
    const div = document.getElementById('wbBindCharDiv');
    if (toggle.classList.contains('checked')) {
        div.style.display = 'block';
    } else {
        div.style.display = 'none';
    }
}

// 3. 检查是否显示“关键词”输入框
function checkKeywords() {
    const type = document.getElementById('wbTriggerType').value;
    const field = document.getElementById('wbKeywordField');
    if (type === 'keyword') {
        field.style.display = 'flex';
    } else {
        field.style.display = 'none';
    }
}

// 4. 关闭新建/编辑弹窗
function closeCreateWBModal() {
    document.getElementById('wbCreateModal').classList.remove('show');
}

/* --- 分组管理逻辑 --- */
function openGroupManager() {
    document.getElementById('wbGroupOverlay').style.display = 'flex';
    renderGroupList();
}

function closeGroupManager() {
    document.getElementById('wbGroupOverlay').style.display = 'none';
    // 更新主弹窗里的下拉框
    const grpSel = document.getElementById('wbCreateGroup');
    const currentVal = grpSel.value; // 记住当前选的值
    grpSel.innerHTML = '';
    wbGroups.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g; opt.innerText = g;
        grpSel.appendChild(opt);
    });
    // 如果刚才选的值还在，保持选中；否则选中默认
    if (wbGroups.includes(currentVal)) {
        grpSel.value = currentVal;
    }
}

function renderGroupList() {
    const list = document.getElementById('wbGroupList');
    list.innerHTML = '';
    wbGroups.forEach((g, index) => {
        const item = document.createElement('div');
        item.className = 'wb-mini-item';
        // 默认分组不允许删除
        const delBtn = (g === '默认分组') ? '' : `<span class="wb-mini-del" onclick="deleteGroup(${index})">删除</span>`;
        item.innerHTML = `<span>${g}</span>${delBtn}`;
        list.appendChild(item);
    });
}

function addGroup() {
    const input = document.getElementById('wbNewGroupInput');
    const val = input.value.trim();
    if (val && !wbGroups.includes(val)) {
        wbGroups.push(val);
        saveData(); // 保存到数据库
        renderGroupList();
        input.value = '';
    } else if (wbGroups.includes(val)) {
        alert('分组已存在');
    }
}

function deleteGroup(index) {
    if (confirm('确认删除该分组吗？组内的世界书将移动到默认分组。')) {
        const deletedGroup = wbGroups[index];
        wbGroups.splice(index, 1);
        
        // 将被删分组的世界书移动到默认分组
        let modified = false;
        worldBooks.forEach(wb => {
            if (wb.group === deletedGroup) {
                wb.group = '默认分组';
                modified = true;
            }
        });
        
        saveData();
        renderGroupList();
        if(modified) renderWorldBookPage(); // 刷新背景列表
    }
}

/* --- 角色绑定逻辑 --- */
function openCharBinder() {
    document.getElementById('wbCharOverlay').style.display = 'flex';
    renderCharList();
}

function closeCharBinder() {
    document.getElementById('wbCharOverlay').style.display = 'none';
}

function renderCharList() {
    const list = document.getElementById('wbCharList');
    list.innerHTML = '';
    if (chatList.length === 0) {
        list.innerHTML = '<div style="text-align:center;color:#999;">暂无角色，请先在聊天页添加</div>';
        return;
    }
    chatList.forEach(chat => {
        const item = document.createElement('div');
        item.className = 'wb-mini-item';
        item.style.cursor = 'pointer';
        // 点击选中
        item.onclick = () => selectCharForWb(chat.id, chat.name);
        item.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;">
                <img src="${chat.avatar}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;">
                <span>${chat.name}</span>
            </div>
            ${tempBoundCharId === chat.id ? '<i class="fas fa-check" style="color:green;"></i>' : ''}
        `;
        list.appendChild(item);
    });
}

function selectCharForWb(id, name) {
    tempBoundCharId = id;
    document.getElementById('wbBoundCharName').innerText = name;
    closeCharBinder();
}

function openBeautifyPage() {
    document.getElementById('beautifyPage').classList.add('active');
    
    // 1. 加载 Dock 和 APP 图标预览
    document.getElementById('previewDock1').src = document.getElementById('dockIcon1').src;
    document.getElementById('previewDock2').src = document.getElementById('dockIcon2').src;
    document.getElementById('previewDock3').src = document.getElementById('dockIcon3').src;
    document.getElementById('previewDock4').src = document.getElementById('dockIcon4').src;
    
    if(document.getElementById('app5Img').src) { 
        document.getElementById('previewApp5').src = document.getElementById('app5Img').src; 
        document.getElementById('previewApp5').style.display = 'block'; 
        document.getElementById('previewApp5Default').style.display = 'none'; 
    }
    if(document.getElementById('app6Img').src) { 
        document.getElementById('previewApp6').src = document.getElementById('app6Img').src; 
        document.getElementById('previewApp6').style.display = 'block'; 
        document.getElementById('previewApp6Default').style.display = 'none'; 
    }
    
    // 1. 主屏幕预览
    const homeBg = document.body.style.backgroundImage;
    const wpImg = document.getElementById('wallpaperPreviewImg');
    const wpPh = document.getElementById('wallpaperPlaceholder');
    if (homeBg && homeBg !== 'none' && homeBg !== 'url("")') { 
        wpImg.src = homeBg.slice(5, -2).replace(/['"]/g, ""); wpImg.style.display = 'block'; wpPh.style.display = 'none'; 
    } else { 
        wpImg.style.display = 'none'; wpImg.src = ''; wpPh.style.display = 'flex'; 
    }
    // 2. WeChat 预览
    const chatPage = document.getElementById('chatAppPage');
    const wcBg = chatPage.style.backgroundImage;
    const wcPreviewImg = document.getElementById('wcWallpaperPreviewImg');
    const wcPlaceholder = document.getElementById('wcWallpaperPlaceholder');
    if (wcBg && wcBg !== 'none' && wcBg !== 'url("")') { 
        wcPreviewImg.src = wcBg.slice(5, -2).replace(/['"]/g, ""); wcPreviewImg.style.display = 'block'; wcPlaceholder.style.display = 'none'; 
    } else { 
        wcPreviewImg.style.display = 'none'; wcPreviewImg.src = ''; wcPlaceholder.style.display = 'flex'; 
    }
    // ★★★ 3. 新增：聊天页预览 ★★★
    const room = document.getElementById('chatRoom');
    const roomBg = room.style.backgroundImage;
    const roomPreviewImg = document.getElementById('chatRoomWallpaperPreviewImg');
    const roomPlaceholder = document.getElementById('chatRoomWallpaperPlaceholder');
    if (roomBg && roomBg !== 'none' && roomBg !== 'url("")') { 
        roomPreviewImg.src = roomBg.slice(5, -2).replace(/['"]/g, ""); 
        roomPreviewImg.style.display = 'block'; 
        roomPlaceholder.style.display = 'none'; 
    } else { 
        roomPreviewImg.style.display = 'none'; 
        roomPreviewImg.src = ''; 
        roomPlaceholder.style.display = 'flex'; 
    }
    // ★★★ 4. 新增：语音通话壁纸预览 ★★★
    const vcBg = globalData.voiceCallWallpaper;
    const vcPreviewImg = document.getElementById('vcWallpaperPreviewImg');
    const vcPlaceholder = document.getElementById('vcWallpaperPlaceholder');
    if (vcBg && vcBg !== 'none' && vcBg !== 'url("")') { 
        vcPreviewImg.src = vcBg; 
        vcPreviewImg.style.display = 'block'; 
        vcPlaceholder.style.display = 'none'; 
    } else { 
        vcPreviewImg.style.display = 'none'; 
        vcPreviewImg.src = ''; 
        vcPlaceholder.style.display = 'flex'; 
    }
}

function closeBeautifyPage() { 
    document.getElementById('beautifyPage').classList.remove('active'); 
    saveData(); 
}

function changeWallpaper(type) {
    if (type.startsWith('wechat')) {
        uploadContext = { type: 'wechatWallpaper' };
        if (type === 'wechat_link') { 
            const u = prompt("请输入图片链接:"); 
            if(u) handleBeautifyImageUpdate(u); 
        } else { 
            document.getElementById('fileInput').click(); 
        }
    } 
    else if (type.startsWith('chatroom')) {
        uploadContext = { type: 'chatRoomWallpaper' };
        if (type === 'chatroom_link') {
            const u = prompt("请输入图片链接:"); 
            if(u) handleBeautifyImageUpdate(u); 
        } else {
            document.getElementById('fileInput').click(); 
        }
    }
    else if (type.startsWith('voice')) {
        uploadContext = { type: 'voiceCallWallpaper' };
        if (type === 'voice_link') {
            const u = prompt("请输入图片链接:"); 
            if(u) handleBeautifyImageUpdate(u); 
        } else {
            document.getElementById('fileInput').click(); 
        }
    }
    else {
        uploadContext = { type: 'wallpaper' };
        if (type === 'link') { 
            const u = prompt("请输入图片链接:"); 
            if(u) handleBeautifyImageUpdate(u); 
        } else { 
            document.getElementById('fileInput').click(); 
        }
    }
    
}

function clearWechatWallpaper() {
    const chatPage = document.getElementById('chatAppPage');
    chatPage.style.backgroundImage = ''; 
    chatPage.style.backgroundSize = '';
    chatPage.style.backgroundPosition = '';
    openBeautifyPage(); 
    saveData();
}

function clearWallpaper() { 
    document.body.style.backgroundImage = ''; 
    document.body.classList.remove('has-wallpaper'); 
    openBeautifyPage(); 
    saveData(); 
}

function clearVoiceCallWallpaper() {
    globalData.voiceCallWallpaper = ''; // 清空数据
    saveData(); // 保存
    openBeautifyPage(); // 刷新预览
}

function handleBeautifyImageUpdate(src) {
    if (!uploadContext) return;
    
    if (uploadContext.type === 'dock') {
        const id = 'dockIcon' + uploadContext.index; 
        const previewId = 'previewDock' + uploadContext.index;
        document.getElementById(id).src = src; 
        document.getElementById(previewId).src = src;
    } else if (uploadContext.type === 'app') {
        const imgId = 'app' + uploadContext.index + 'Img'; document.getElementById(imgId).src = src; document.getElementById(imgId).style.display = 'block'; document.getElementById('app' + uploadContext.index + 'Default').style.display = 'none'; document.getElementById('previewApp' + uploadContext.index).src = src; document.getElementById('previewApp' + uploadContext.index).style.display = 'block'; document.getElementById('previewApp' + uploadContext.index + 'Default').style.display = 'none';
    } else if (uploadContext.type === 'wallpaper') {
        document.body.style.backgroundImage = `url(${src})`; 
        document.body.classList.add('has-wallpaper'); 
        openBeautifyPage();
    } else if (uploadContext.type === 'wechatWallpaper') {
        const chatPage = document.getElementById('chatAppPage');
        chatPage.style.backgroundImage = `url(${src})`; 
        chatPage.style.backgroundSize = 'cover'; 
        chatPage.style.backgroundPosition = 'center'; 
        openBeautifyPage();
    } 
    else if (uploadContext.type === 'chatRoomWallpaper') {
        const room = document.getElementById('chatRoom');
        room.style.backgroundImage = `url(${src})`;
        room.style.backgroundSize = 'cover';
        room.style.backgroundPosition = 'center';
        room.style.backgroundRepeat = 'no-repeat';
        openBeautifyPage(); 
    }
else if (uploadContext.type === 'voiceCallWallpaper') {
        globalData.voiceCallWallpaper = src;
        openBeautifyPage(); 
    }
        else if (uploadContext.type === 'momentPageBg') {
        document.getElementById('momentBgLayer').style.backgroundImage = `url(${src})`;
        globalData.momentPageBg = src; 
    }
    else if (uploadContext.type === 'momentBanner') {
        document.getElementById('momentBannerImg').src = src;
        globalData.momentBanner = src; 
    }
    else if (uploadContext.type === 'momentAvatar') {
        document.getElementById('momentUserAvatar').src = src;
        globalData.momentAvatar = src; 
    }

    saveData(); 
    uploadContext = null;
}

async function exportBackup() { try { const settings = await db.globalSettings.get('main'); const chats = await db.chats.toArray(); const configs = await db.apiConfig.toArray(); const backupData = { version: "2.0", timestamp: new Date().toISOString(), settings: settings || {}, chats: chats || [], apiConfig: configs || [] }; const blob = new Blob([JSON.stringify(backupData)], {type: "application/json"}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `backup_${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); alert("备份已开始下载"); } catch (e) { alert("导出失败: " + e.message); } }
async function handleImportFile(input) { const file = input.files[0]; if (!file) return; if (confirm("恢复备份将覆盖当前所有数据，确定继续吗？")) { const reader = new FileReader(); reader.onload = async (e) => { try { const data = JSON.parse(e.target.result); await db.transaction('rw', db.globalSettings, db.chats, db.apiConfig, async () => { await db.globalSettings.clear(); await db.chats.clear(); await db.apiConfig.clear(); if (data.settings) await db.globalSettings.put(data.settings); if (data.chats && data.chats.length) await db.chats.bulkAdd(data.chats); if (data.apiConfig && data.apiConfig.length) await db.apiConfig.bulkAdd(data.apiConfig); }); alert("数据恢复成功，即将刷新页面..."); location.reload(); } catch (err) { alert("恢复失败，文件可能已损坏: " + err.message); } }; reader.readAsText(file); } input.value = ''; }
function openGeneralSettings() { document.getElementById('generalSettingsPage').classList.add('active'); }
function closeGeneralSettings() { document.getElementById('generalSettingsPage').classList.remove('active'); }

function renderMessages(chat) {
    const container = document.getElementById('roomMessages');
    
    // 1. 记录当前的滚动位置
    const prevScrollHeight = container.scrollHeight;
    const prevScrollTop = container.scrollTop;
    
    container.innerHTML = ''; 
    
    const showAi = (chat.showAiAvatar !== false);
    const showUser = (chat.showUserAvatar !== false);
    const myAvatar = chat.userAvatar || document.getElementById('meAvatarImg').src; 
    const otherAvatar = chat.avatar; 
    
    // ★★★ 核心修复：将渲染上限从 50 降为 30，减少卡顿 ★★★
    const RENDER_LIMIT = 30; 
    const totalMsgs = chat.messages.length;
    let startIndex = 0;
    
    // 判断是否需要折叠
    if (!chat.showFullHistory && totalMsgs > RENDER_LIMIT) {
        startIndex = totalMsgs - RENDER_LIMIT;
        
        // 添加“加载更多”按钮
        const loadBtnDiv = document.createElement('div');
        loadBtnDiv.style.cssText = "text-align:center; padding:15px; cursor:pointer; color:#999; font-size:12px;";
        loadBtnDiv.innerHTML = `<i class="fas fa-history"></i> 点击加载更早的 ${startIndex} 条记录`;
        loadBtnDiv.onclick = function() {
            chat.showFullHistory = true; 
            const oldHeight = container.scrollHeight;
            renderMessages(chat); 
            container.scrollTop = container.scrollHeight - oldHeight;
        };
        container.appendChild(loadBtnDiv);
    }
    
    const msgsToRender = chat.messages.slice(startIndex);

    let lastTimeMinutes = -9999; 
    let lastSenderType = null; 

    msgsToRender.forEach((msg, relativeIndex) => { 
        const realIndex = startIndex + relativeIndex;
        if (msg.isHidden) return;
        if (msg.text && msg.text.includes('[邀请语音通话]')) return;
        // --- 1. 时间分割线逻辑 ---
        const [hh, mm] = (msg.time || "00:00").split(':').map(Number);
        const currentMinutes = hh * 60 + mm; 
        if (relativeIndex === 0 || (currentMinutes - lastTimeMinutes > 60)) { 
            const dateDiv = document.createElement('div'); 
            dateDiv.className = 'date-divider'; 
            dateDiv.innerText = `Today ${msg.time}`; 
            container.appendChild(dateDiv); 
            lastSenderType = null; 
        } 
        lastTimeMinutes = currentMinutes; 

        // --- 撤回逻辑 ---
        const isAiPureCommand = (!msg.isSelf && msg.text.trim() === '[WITHDRAWN]');
        if (msg.isRecalled || isAiPureCommand) {
            const recallRow = document.createElement('div');
            recallRow.className = 'recall-notice-row';
            recallRow.style.width = '100%';
            recallRow.style.textAlign = 'center';
            recallRow.style.marginTop = '10px';
            
            let contentHtml = '';
            const charName = chat.name || "对方";
            
            if (msg.isSelf) {
                contentHtml = `你撤回了一条消息 <span class="recall-link" onclick="restoreEdit(${realIndex})">重新编辑</span>`;
            } else {
                if (isAiPureCommand && !msg.recalledText) {
                     contentHtml = `"${charName}" 撤回了一条消息`;
                } else {
                     contentHtml = `"${charName}" 撤回了一条消息 <span class="recall-link" onclick="viewRecalled(${realIndex})">查看</span>`;
                }
            }
            recallRow.innerHTML = `<div class="recall-pill">${contentHtml}</div>`;
            container.appendChild(recallRow);
            lastSenderType = null; 
            return; 
        }

        // --- 2. 气泡构建 ---
        const timeHtml = `<div class="time">${msg.time}</div>`;
        const isSelf = msg.isSelf; 
        const currentSenderType = isSelf ? 'user' : 'ai';
        const needTail = (currentSenderType !== lastSenderType);
        const tailClass = needTail ? '' : 'no-tail';

        const row = document.createElement('div'); 
        row.className = `Miu-miu ${currentSenderType} ${tailClass}`;
        
        row.onclick = function() { handleMsgClickInMultiMode(realIndex, this); };

        /* --- ★★★ 转账气泡渲染逻辑 (插入到 renderMessages 循环内) ★★★ --- */
        let customContent = null;
        let specialClass = '';

        // 1. 判断是否为转账消息
        if (msg.type === 'transfer') {
            specialClass = 'transfer-msg'; 
            
            const isDone = msg.status !== 'pending';
            
            // ★★★ 核心修改点 1：顶部永远显示金额 ★★★
            let topText = "¥" + msg.amount; 

            // ★★★ 核心修改点 2：底部文字根据状态变化 ★★★
            let bottomText = "";
            
            if (msg.status === 'received') {
                // 已收款状态
                bottomText = msg.transferBy === 'me' ? "已被接收" : "已收款";
            } else if (msg.status === 'refunded') {
                // 已退还状态
                bottomText = msg.transferBy === 'me' ? "已被退还" : "已退还";
            } else {
                // 进行中状态 (Pending)
                bottomText = msg.transferBy === 'me' ? "待对方确认" : "请收款";
            }

            const arrowIcon = `<svg class="transfer-icon-svg" viewBox="0 0 24 24"><path d="M7 10h14l-4-4M17 14H3l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

            customContent = `
                <div class="transfer-card ${isDone ? 'done' : ''}" onclick="handleTransferClick(${msg.id}, event)">
                    <div class="transfer-top">
                        <div class="transfer-info-col">
                            <div class="transfer-amount-text">${topText}</div>
                            <div class="transfer-status-text">${bottomText}</div>
                        </div>
                    </div>
                    <div class="transfer-line"></div>
                    <div class="transfer-footer">—— ＞ ＜ おやすみ .. ——</div>
                </div>
            `;
        }
         else if (msg.text.includes('couple-card')) {
        specialClass = 'couple-msg-bubble'; 
        customContent = msg.text; 
    }
        // 2. 原有的判断逻辑 (保持兼容)
        else if (msg.text.includes('voice-inner-container')) specialClass = 'voice-bubble';
        else if (msg.text.includes('photo-msg-img')) specialClass = 'photo-only';
        else if (msg.text.includes('album-msg-img')) specialClass = 'album-only';
        else if (msg.text.includes('chat-sticker-img') && !msg.text.includes('span')) specialClass = 'sticker-only';

        const bubbleHtml = `<div class="content ${specialClass}" data-index="${realIndex}">${customContent || msg.text}</div>`;
        let replyBubbleHtml = '';
        if (msg.replyCtx) {
            replyBubbleHtml = `<div class="reply-tiny-bubble">回复 ${msg.replyCtx.name}：${msg.replyCtx.content}</div>`;
        }

        const stackHtml = `<div class="msg-stack">${bubbleHtml}${replyBubbleHtml}</div>`;
        const checkboxHtml = `<div class="msg-checkbox"></div>`;

        let shouldRenderAvatar = true;
        if (isSelf) {
            if (!showUser) shouldRenderAvatar = false;
            else if (lastSenderType === 'user') shouldRenderAvatar = false;
        } else {
            if (!showAi) shouldRenderAvatar = false;
            else if (lastSenderType === 'ai') shouldRenderAvatar = false;
        }

if (isSelf) {
    let avatarHtml = showUser ? `<img src="${myAvatar}" class="avatar-img" style="${shouldRenderAvatar ? '' : 'visibility:hidden;'}">` : '';
    const wrapperExtra = (specialClass === 'transfer-msg') ? ' transfer-wrapper' : '';
    row.innerHTML = `${checkboxHtml}<div class="bubble-wrapper${wrapperExtra}" style="justify-content: flex-end;">${timeHtml}${stackHtml}</div>${avatarHtml}`;
} else {
    let avatarHtml = showAi ? `<img src="${otherAvatar}" class="avatar-img" style="${shouldRenderAvatar ? '' : 'visibility:hidden;'}">` : '';
    const wrapperExtra = (specialClass === 'transfer-msg') ? ' transfer-wrapper' : '';
    row.innerHTML = `${avatarHtml}<div class="bubble-wrapper${wrapperExtra}" style="justify-content: flex-start;">${stackHtml}${timeHtml}</div>${checkboxHtml}`;
}

        
        lastSenderType = currentSenderType; 
        container.appendChild(row); 
        
        // 事件绑定
        const bubbleNode = row.querySelector('.content');
        if (bubbleNode) {
            bubbleNode.style.webkitTouchCallout = 'none';
            bubbleNode.style.webkitUserSelect = 'none';
            
            bubbleNode.onclick = (e) => {
                if (isMultiSelectMode) return; 
                e.stopPropagation(); 
            };

            // 长按逻辑
            let pressTimer = null;
            let startX = 0, startY = 0;

            bubbleNode.addEventListener('touchstart', (e) => {
                if (isMultiSelectMode) return;
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                pressTimer = setTimeout(() => {
                    e.preventDefault(); 
                    if (navigator.vibrate) navigator.vibrate(15);
                    showMsgMenu(bubbleNode, realIndex, isSelf); 
                }, 500);
            }, { passive: false });

            bubbleNode.addEventListener('touchmove', (e) => {
                if (!pressTimer) return;
                if (Math.abs(e.touches[0].clientX - startX) > 10 || Math.abs(e.touches[0].clientY - startY) > 10) {
                    clearTimeout(pressTimer);
                    pressTimer = null;
                }
            }, { passive: true });

            bubbleNode.addEventListener('touchend', () => { clearTimeout(pressTimer); });
            bubbleNode.addEventListener('touchcancel', () => { clearTimeout(pressTimer); });

            bubbleNode.addEventListener('contextmenu', (e) => {
                e.preventDefault(); 
                if (!isMultiSelectMode) showMsgMenu(bubbleNode, realIndex, isSelf); 
            });
        }
    }); 

    if (!chat.showFullHistory && !isMultiSelectMode) {
        container.scrollTop = container.scrollHeight; 
    }
}

const chatSettingsPage = document.getElementById('chatSettingsPage');
function openChatSettings() { 
    const chat = chatList.find(c => c.id === currentChatId); 
    if (chat) { 
        document.getElementById('settingsCharAvatar').src = chat.avatar; 
        document.getElementById('settingsCharRealNameDisplay').innerText = chat.realName || chat.name; 
        document.getElementById('settingsCharName').innerText = chat.name; 
        
        const currentUserAvatar = chat.userAvatar || document.getElementById('meAvatarImg').src;
        document.getElementById('settingsUserAvatar').src = currentUserAvatar; 
        
        document.getElementById('settingsUserRealNameDisplay').innerText = chat.userRealName || "我的"; 
        document.getElementById('settingsUserName').innerText = chat.userRemark || "默认"; 

        document.getElementById('charPersona').value = chat.charPersona || '';
        document.getElementById('userPersona').value = chat.userPersona || '';

        document.getElementById('charVoiceId').value = chat.minimaxVoiceId || '';
        
        document.getElementById('chatMemory').value = chat.chatMemory || ''; 
        document.getElementById('customCssInput').value = chat.customCss || '';
        
        document.getElementById('memContextLimit').value = chat.memContextLimit || 50;
        document.getElementById('memThreshold').value = chat.memThreshold || 50;
        
        document.getElementById('summaryStart').value = 1;
        document.getElementById('summaryEnd').value = chat.messages.length;

        const toggle = document.getElementById('memAutoToggle');
        const text = document.getElementById('memModeText');
        if (chat.memAutoSummary) {
            toggle.classList.add('checked');
            text.innerText = "自动";
            text.style.color = "#34c759";
        } else {
            toggle.classList.remove('checked');
            text.innerText = "手动";
            text.style.color = "#007aff";
        }
// --- 插入开始 ---
const tAi = document.getElementById('toggleAiAvatar');
const tUser = document.getElementById('toggleUserAvatar');

if (chat.showAiAvatar !== false) tAi.classList.add('checked'); 
else tAi.classList.remove('checked');

if (chat.showUserAvatar !== false) tUser.classList.add('checked'); 
else tUser.classList.remove('checked');
        const previewAiImg = document.getElementById('previewRealAvatar');
        if(previewAiImg) previewAiImg.src = chat.avatar;

        const previewUserImg = document.getElementById('previewUserAvatar');
        if(previewUserImg) previewUserImg.src = currentUserAvatar;

        renderMemSummaryList(chat);
        updateMemStats(chat);
        updateBubblePreview();
        const saveBtn = document.querySelector('.save-float-btn');
    // 检查：如果找到了保存按钮，且它还没有被包裹在双按钮容器里
    if (saveBtn && (!saveBtn.parentElement || !saveBtn.parentElement.classList.contains('settings-btns-row'))) {
        // 使用 outerHTML 直接替换 DOM 结构
        // 注意：这里引用了我们在 CSS 中定义的 .settings-btns-row, .clear-chat-btn, .save-float-btn
        saveBtn.outerHTML = `
            <div class="settings-btns-row">
                <div class="clear-chat-btn" onclick="clearCurrentChat()">清除聊天</div>
                <div class="save-float-btn" onclick="saveCurrentChatSettings()">保存设置</div>
            </div>
        `;
    }
        chatSettingsPage.classList.add('active'); 
    } 
}
function closeChatSettings() { 
    document.getElementById('chatSettingsPage').classList.remove('active');
}

function editCharNameInSettings() { const chat = chatList.find(c => c.id === currentChatId); if(!chat) return; const realName = prompt("角色真实姓名:", chat.realName); const remark = prompt("备注名:", chat.name); if (realName) chat.realName = realName; if (remark) chat.name = remark; saveData(); openChatSettings(); document.getElementById('roomTitle').innerText = chat.name; renderChatList(); }
function editUserNameInSettings() { const chat = chatList.find(c => c.id === currentChatId); if(!chat) return; const realName = prompt("我的真实姓名:", chat.userRealName || ""); const remark = prompt("角色对我的称呼(备注):", chat.userRemark || ""); if (realName) chat.userRealName = realName; if (remark) chat.userRemark = remark; saveData(); openChatSettings(); }

function clearCurrentChat() {
    if (!currentChatId) return;
    
    // 二次确认，防止手滑
    if (confirm("高能预警\n\n确定要清空当前对话的所有消息吗？\n此操作不可恢复！")) {
        const chat = chatList.find(c => c.id === currentChatId);
        if (chat) {
            chat.messages = []; // 清空消息数组
            chat.msg = '';      // 清空列表预览
            chat.time = '';     // 清空时间
            
            chat.currentHeartVoice = null;

            chat.lastSummarizedIndex = 0;
            
            saveData(); // 保存到数据库
            
            // 刷新聊天室界面（如果刚好开着）
            const container = document.getElementById('roomMessages');
            if(container) container.innerHTML = '';
            
            // 刷新列表页
            renderChatList();
            
            alert('聊天记录已清空，记忆与心声已重置');
            closeChatSettings(); // 关闭设置页
        }
    }
}

function saveCurrentChatSettings() {
    const chat = chatList.find(c => c.id === currentChatId);
    if (!chat) return;
// --- 插入开始 ---
chat.showAiAvatar = document.getElementById('toggleAiAvatar').classList.contains('checked');
chat.showUserAvatar = document.getElementById('toggleUserAvatar').classList.contains('checked');
// --- 插入结束 ---

    chat.charPersona = document.getElementById('charPersona').value;
    chat.userPersona = document.getElementById('userPersona').value;

    chat.minimaxVoiceId = document.getElementById('charVoiceId').value.trim();

    chat.chatMemory = document.getElementById('chatMemory').value; 
    chat.customCss = document.getElementById('customCssInput').value;

    chat.memContextLimit = parseInt(document.getElementById('memContextLimit').value) || 50;
    chat.memThreshold = parseInt(document.getElementById('memThreshold').value) || 50;
    
    chat.memAutoSummary = document.getElementById('memAutoToggle').classList.contains('checked');

    saveData();
    applyChatCustomCss(chat.customCss);
    
    updateMemStats(chat);
}

function applyChatCustomCss(cssCode) {
    let styleTag = document.getElementById('dynamic-chat-style');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'dynamic-chat-style';
        document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = cssCode || '';
}

function openChatRoom(id) {
    cancelReply(); 
    currentChatId = id; 
    const chat = chatList.find(c => c.id === id); 
    if(!chat) return; 
    
    chat.showFullHistory = false;

    // 填充设置页面的数据
    document.getElementById('charPersona').value = chat.charPersona || '';
    document.getElementById('userPersona').value = chat.userPersona || '';
    document.getElementById('chatMemory').value = chat.chatMemory || '';
    document.getElementById('customCssInput').value = chat.customCss || '';
    
    // 应用样式和标题
    applyChatCustomCss(chat.customCss);
    document.getElementById('roomTitle').innerText = chat.name;

    // 渲染消息 (此时因为上面重置了 flag，只会渲染最后 30 条)
    renderMessages(chat); 
    
    // 显示聊天室
    document.getElementById('chatRoom').classList.add('active'); 

    // ★★★ 修复点 2：延迟滚动到底部 (解决进入不跳转底部的问题) ★★★
    setTimeout(() => {
        const container = document.getElementById('roomMessages');
        if (container) {
            // 强制将滚动条拉到最下面
            container.scrollTop = container.scrollHeight;
        }
    }, 10); 
};

function exitChatRoom() {
    // 1. 在退出前，强制重新计算当前对话的最后一条消息预览
    if (currentChatId) {
        const chat = chatList.find(c => c.id === currentChatId);
        if (chat) {
            updateChatLastMsg(chat); // 更新预览文字
            saveData();              // 保存到数据库
            renderChatList();        // 立即刷新列表界面
        }
    }

    // 2. 关闭聊天室界面
    document.getElementById('chatRoom').classList.remove('active'); 
    currentChatId = null;
    
    // 3. 清除动态样式
    applyChatCustomCss(''); 
};
const menu = document.getElementById('popMenu'), fileInput = document.getElementById('fileInput'), frame = document.getElementById('phoneFrame');
let currentTargetImg = null; 
function showMenu(e, t) { 
    e.stopPropagation(); 
    uploadContext = null; 
    
    // ★★★ 新增部分：处理情侣空间右上角设置菜单 ★★★
    if (t === 'coupleSettings') {
        // 1. 计算菜单位置 (稍微往左偏一点，防止超出屏幕)
        const r = frame.getBoundingClientRect(); 
        menu.style.left = (e.clientX - r.left - 100) + 'px'; 
        menu.style.top = (e.clientY - r.top + 15) + 'px'; 
        menu.style.display = 'flex'; 

        // 2. 动态修改菜单内容：显示“更换背景”和“向TA索信”
        menu.innerHTML = `
            <div class="menu-item" onclick="changeCoupleBg()"><i class="fas fa-image"></i> 更换背景</div>
            <div class="menu-item" onclick="askForLetter()"><i class="fas fa-envelope-open-text"></i> 向TA索信</div>
        `;
        
        // 3. 设定当前图片目标为背景层（方便更换背景功能直接调用）
        currentTargetImg = document.getElementById('cp-bg-layer');
        return; // 结束函数，不执行下面的普通图片逻辑
    }
    // ★★★ 新增结束 ★★★

    // --- 下面是原有的图片点击逻辑 (恢复默认菜单内容) ---
    menu.innerHTML = `
        <div class="menu-item" onclick="changeByLink()"><i class="fas fa-link"></i> 图片链接</div>
        <div class="menu-item" onclick="triggerFileInput()"><i class="fas fa-image"></i> 本地图片</div>
    `;

    if (t === 'settingsCharAvatar') { 
        const chat = chatList.find(c => c.id === currentChatId); 
        currentTargetImg = document.getElementById('settingsCharAvatar'); 
        currentTargetImg.dataset.isChar = 'true'; 
    } else if (t === 'settingsUserAvatar') { 
        currentTargetImg = document.getElementById('settingsUserAvatar'); 
    } else { 
        const map = { 
            'header': 'headerImg', 
            'avatar': 'avatarImg', 
            'newCharAvatar': 'newCharAvatar', 
            'meBanner': 'meBannerImg', 
            'meAvatar': 'meAvatarImg', 
            'kawaiiAvatarLeft': 'kawaiiAvatarLeft', 
            'kawaiiAvatarRight': 'kawaiiAvatarRight', 
            'captcha': 'captchaImg',
            'app5Icon': 'app5Img',
            'app6Icon': 'app6Img',
            'momentBg': 'momentBgLayer',       
            'momentBanner': 'momentBannerImg', 
            'momentAvatar': 'momentUserAvatar' ,
            'coupleBg': 'cp-bg-layer',
            'coupleCard': 'cpTopCard' 
        }; 
        
        if (map[t]) currentTargetImg = document.getElementById(map[t]); 
    } 
    
    if (currentTargetImg) { 
        const r = frame.getBoundingClientRect(); 
        menu.style.left = (e.clientX - r.left + 15)+'px'; 
        menu.style.top = (e.clientY - r.top - 10)+'px'; 
        menu.style.display = 'flex'; 
    } 
}
function togglePlusMenu(e) { e.stopPropagation(); const m = document.getElementById('plusMenu'); m.style.display = m.style.display === 'flex' ? 'none' : 'flex'; }

document.addEventListener('click', () => { 
    menu.style.display = 'none'; 
    document.getElementById('plusMenu').style.display='none'; 
    document.getElementById('wbPopMenu').style.display='none'; 
});

function changeByLink() { const u = prompt("链接:"); if(u && currentTargetImg) { handleImageUpdate(u); } menu.style.display='none'; }
function triggerFileInput() { fileInput.click(); menu.style.display='none'; }
fileInput.addEventListener('change', (e) => { const f = e.target.files[0]; if (f && uploadContext) { const r = new FileReader(); r.onload = (ev) => { handleBeautifyImageUpdate(ev.target.result); }; r.readAsDataURL(f); fileInput.value = ''; return; } if(f && currentTargetImg) { const r = new FileReader(); r.onload=(ev)=> { handleImageUpdate(ev.target.result); }; r.readAsDataURL(f); } fileInput.value=''; });

function handleImageUpdate(src) { 
    if (currentTargetImg) {
        
        // 找到这一行判断
        if (currentTargetImg.id === 'cp-bg-layer' || currentTargetImg.id === 'cpTopCard') {
            
            // 1. 设置图片路径
            currentTargetImg.style.backgroundImage = `url(${src})`;
            
            // ★★★【修复2：在此处添加样式修正代码】★★★
            // 强制图片铺满且居中，防止图片太大只显示一个白色角落
            if (currentTargetImg.id === 'cpTopCard') {
                currentTargetImg.style.backgroundSize = 'cover';
                currentTargetImg.style.backgroundPosition = 'center';
                currentTargetImg.style.backgroundRepeat = 'no-repeat';
            }
            
            // 2. 找到当前角色并保存
            if (typeof currentCoupleChatId !== 'undefined' && currentCoupleChatId) {
                const chat = chatList.find(c => c.id === currentCoupleChatId);
                if (chat) {
                    if (!chat.coupleData) chat.coupleData = {};
                    
                    if (currentTargetImg.id === 'cp-bg-layer') {
                        chat.coupleData.bgImage = src;
                    } else {
                        chat.coupleData.cardImage = src;
                    }
                    saveData(); // 保存到数据库
                }
            }
            return; // 处理完直接退出
        }

        // 朋友圈背景处理
        if (currentTargetImg.id === 'momentBgLayer') {
            currentTargetImg.style.backgroundImage = `url(${src})`;
            globalData.momentPageBg = src; 
            saveData(); 
            return; 
        }

        // 普通图片更新
        currentTargetImg.src = src; 

        // 朋友圈 Banner 特殊处理
        if (currentTargetImg.id === 'momentBannerImg') {
            globalData.momentBanner = src;
        }
        else if (currentTargetImg.id === 'momentUserAvatar') {
            globalData.momentAvatar = src;
        }
        
        // Dock/App 图标逻辑 (保持不变)
        if (currentTargetImg.id === 'app5Img') {
            document.getElementById('app5Img').style.display = 'block';
            document.getElementById('app5Default').style.display = 'none';
        }
        if (currentTargetImg.id === 'app6Img') {
            document.getElementById('app6Img').style.display = 'block';
            document.getElementById('app6Default').style.display = 'none';
        }

        // 聊天设置头像逻辑 (保持不变)
        if (currentTargetImg.id === 'settingsCharAvatar') { 
            const chat = chatList.find(c => c.id === currentChatId); 
            if (chat) chat.avatar = src; 
            const headerAvatar = document.getElementById('roomHeaderAvatar');
            if(headerAvatar) { headerAvatar.src = src; headerAvatar.style.display = 'block'; }
            renderMessages(chat); 
            renderChatList(); 
        } 
        else if (currentTargetImg.id === 'settingsUserAvatar') { 
            const chat = chatList.find(c => c.id === currentChatId); 
            if (chat) { chat.userAvatar = src; renderMessages(chat); }
        } 

        if (currentTargetImg.id !== 'newCharAvatar') {
            saveData(); 
        }
    }
}
async function fetchModels() { const endpoint = document.getElementById('apiEndpoint').value.replace(/\/+$/, ''); const key = document.getElementById('apiKey').value; const modelSelect = document.getElementById('apiModel'); if (!key) { alert('请先填写 API Key'); return; } const btn = document.querySelector('.api-btn-small'); const originalText = btn.innerText; btn.innerText = '拉取中...'; try { const response = await fetch(`${endpoint}/models`, { method: 'GET', headers: { 'Authorization': `Bearer ${key}` } }); if (!response.ok) throw new Error('网络请求失败'); const data = await response.json(); modelSelect.innerHTML = ''; if (data.data && Array.isArray(data.data)) { data.data.forEach(model => { const option = document.createElement('option'); option.value = model.id; option.innerText = model.id; modelSelect.appendChild(option); }); alert(`成功拉取 ${data.data.length} 个模型`); } else { alert('格式无法解析，请检查端点'); } saveData(); } catch (error) { alert('拉取失败: ' + error.message); } finally { btn.innerText = originalText; } }
async function saveCurrentConfig() { const name = document.getElementById('configName').value.trim(); if (!name) { alert('请输入方案名称'); return; } const profile = { id: Date.now(), name: name, endpoint: document.getElementById('apiEndpoint').value, key: document.getElementById('apiKey').value, model: document.getElementById('apiModel').value, temp: document.getElementById('apiTemp').value }; apiProfiles.push(profile); await db.apiConfig.put(profile); renderApiProfiles(); document.getElementById('configName').value = ''; }
async function deleteProfile(index) { if(confirm('确定删除该方案吗？')) { const id = apiProfiles[index].id; apiProfiles.splice(index, 1); await db.apiConfig.delete(id); renderApiProfiles(); } }
function loadProfile(index) { const p = apiProfiles[index]; document.getElementById('apiEndpoint').value = p.endpoint; document.getElementById('apiKey').value = p.key; const sel = document.getElementById('apiModel'); let exists = false; for(let i=0; i<sel.options.length; i++) { if(sel.options[i].value === p.model) exists = true; } if(!exists) { const opt = document.createElement('option'); opt.value = p.model; opt.innerText = p.model; sel.add(opt); } sel.value = p.model; document.getElementById('apiTemp').value = p.temp; document.getElementById('tempDisplay').innerText = p.temp; saveData(); alert(`已加载方案: ${p.name}`); }
/* ========================================= */
/* ★★★ API 配置管理 (美化下拉框版) ★★★ */
/* ========================================= */

// 1. 渲染下拉框选项 (只显示方案名称版)
function renderApiProfiles() { 
    const select = document.getElementById('apiPresetSelect');
    if (!select) return;

    // 清空现有选项，保留默认提示
    select.innerHTML = '<option value="">-- 请选择已保存的配置 --</option>'; 
    
    apiProfiles.forEach((p, index) => { 
        const option = document.createElement('option');
        option.value = index; 
        // ★★★ 修改处：只显示 p.name (方案名称)，去掉了后面的模型名 ★★★
        option.innerText = p.name; 
        select.appendChild(option); 
    }); 
}

// 2. 选中下拉框时加载配置 (新增)
function loadProfileFromSelect(el) {
    const index = el.value;
    if (index === "") return; // 选了默认提示，不做操作
    
    // 调用原有的 loadProfile 逻辑 (你需要保留原有的 loadProfile 函数)
    loadProfile(index); 
    
    // 视觉反馈：选完后可以弹个轻提示，或者让下拉框保持选中状态
    // 此处无需额外代码，原生 select 会保持显示选中的项
}

// 3. 点击垃圾桶删除当前选中的配置 (新增)
async function deleteProfileFromSelect() {
    const select = document.getElementById('apiPresetSelect');
    const index = select.value;
    
    if (index === "") {
        alert("请先在左侧选择一个要删除的配置方案");
        return;
    }
    
    const profileName = apiProfiles[index].name;
    
    if(confirm(`确定要删除配置方案 “${profileName}” 吗？`)) { 
        const id = apiProfiles[index].id; 
        
        // 从数组移除
        apiProfiles.splice(index, 1); 
        // 从数据库删除
        await db.apiConfig.delete(id); 
        
        // 重新渲染下拉框
        renderApiProfiles(); 
        
        // 重置下拉框到默认状态
        select.value = "";
    } 
}
function openApiSettings() { document.getElementById('apiSettingsPage').classList.add('active'); renderApiProfiles(); }
function closeApiSettings() { document.getElementById('apiSettingsPage').classList.remove('active'); saveData(); }
// [修改] 适配新的底栏类名 (.nav-item)
function switchAppTab(index) {
    // 1. 隐藏所有页面
    document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));
    
    // 2. 移除底栏所有按钮的 active 状态
    // 注意：这里改成了 .nav-item
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    
    // 3. 显示目标页面
    const views = ['view-messages', 'view-diary', 'view-moments', 'view-me'];
    const targetView = document.getElementById(views[index]);
    if (targetView) {
        targetView.classList.add('active');
    }
    
    // 4. 激活目标按钮
    // 注意：这里也改成了 .nav-item
    const navItems = document.querySelectorAll('.nav-item');
    if (navItems[index]) {
        navItems[index].classList.add('active');
    }
}
function editText(el) { const t = prompt("修改:", el.innerText); if(t) { el.innerText=t; saveData(); } }
function editLocation() { const el = document.getElementById('locationText'); const t = prompt("位置:", el.innerText); if(t) { el.innerText=t; saveData(); } }

async function sendMsg() {
    const inputEl = document.getElementById('msgInput');
    const text = inputEl.value.trim();
    
    if (!currentChatId) return;
    const chat = chatList.find(c => c.id === currentChatId);

    // 1. 【手动触发逻辑】：如果输入框为空，则触发 AI 回复
    // 这对应点击“小手机”或在没字的时候点发送
    if (!text) {
        const lastMsg = chat.messages[chat.messages.length - 1];
        if (lastMsg && lastMsg.isLoading) return; // 防止重复点击
        generateAiReply(chat);
        return; 
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // 2. 构建并保存用户消息
    let newMsg = { 
        text: text, 
        isSelf: true, 
        time: timeStr,
        timestamp: Date.now() 
    };

    if (activeReplyContext) {
        newMsg.replyCtx = {
            name: activeReplyContext.name,
            content: activeReplyContext.content
        };
        cancelReply(); 
    }
    
    chat.messages.push(newMsg);
    updateChatLastMsg(chat);
    
    if (!chat.isPinned) {
        chatList = chatList.filter(c => c.id !== currentChatId);
        chatList.unshift(chat);
    }
    
    saveData();
    renderMessages(chat);
    renderChatList();

    inputEl.value = ''; 
    inputEl.style.height = '38px'; 

    // ===========================================
    // ★★★ 记忆总结逻辑 ★★★
    // ===========================================
    
    // (1) 获取阈值
    let threshold = parseInt(chat.memThreshold);
    if (isNaN(threshold) || threshold < 10) threshold = 50;

    // (2) 获取上次总结的锚点
    const totalMsgs = chat.messages.length;
    let lastIndex = parseInt(chat.lastSummarizedIndex);
    
    // 异常修正
    if (isNaN(lastIndex)) lastIndex = 0;
    if (lastIndex > totalMsgs) {
        lastIndex = totalMsgs;
        chat.lastSummarizedIndex = lastIndex;
        saveData(); 
    }

    // (3) 计算新增数
    const newMsgCount = totalMsgs - lastIndex;
    
    // (4) 记忆判定
    if (newMsgCount >= threshold) {
        if (chat.memAutoSummary) {
            console.log("触发自动总结");
            await triggerManualSummary(true); 
        } else {
            const confirmText = `【记忆提醒】\n新增消息已达 ${newMsgCount} 条（阈值 ${threshold}）\n是否立即进行记忆总结？`;
            if(confirm(confirmText)) {
                await triggerManualSummary(false);
            }
        }
    }
}

function renderChatList() {
    const container = document.getElementById('chat-list-container');
    if (!container) return;
    container.innerHTML = ''; // 清空旧内容

    // 1. 排序
    chatList.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return b.isPinned - a.isPinned; // 置顶优先
        // 简单按ID降序(模拟时间)，如果你有 time 字段更好
        return b.id - a.id; 
    });

    const pinnedItems = chatList.filter(c => c.isPinned);
    const normalItems = chatList.filter(c => !c.isPinned);

    const createItemHTML = (chat) => {
        const pinText = chat.isPinned ? "取消" : "置顶";
        const previewText = chat.msg || chat.preview || "暂无消息";
        const timeText = chat.time || "";

        return `
            <div class="chat-swipe-row" id="chat-row-${chat.id}">
                <!-- 侧滑按钮层 -->
                <div class="chat-swipe-actions">
                    <div class="swipe-btn btn-cancel" onclick="resetSwipe(this)">取消</div>
                    <div class="swipe-btn btn-pin" onclick="togglePin(${chat.id})">${pinText}</div>
                    <!-- ★★★ 新增：编辑按钮 ★★★ -->
                    <div class="swipe-btn btn-edit" onclick="editChat(${chat.id})">编辑</div>
                    <div class="swipe-btn btn-delete" onclick="deleteChat(${chat.id})">删除</div>
                </div>
                
                <!-- 内容层 -->
                <div class="chat-item-content" onclick="openChatRoom(${chat.id})">
                    <img src="${chat.avatar}" class="chat-avatar">
                    <div class="chat-info">
                        <div class="chat-name-row">
                            <span class="chat-name">${chat.name}</span>
                            <span class="chat-time">${timeText}</span>
                        </div>
                        <div class="chat-preview">${previewText}</div>
                    </div>
                </div>
            </div>
        `;
    };

    // 3. 渲染置顶组
    if (pinnedItems.length > 0) {
        const pinnedGroup = document.createElement('div');
        pinnedGroup.className = "chat-list-group";
        pinnedItems.forEach(item => {
            pinnedGroup.innerHTML += createItemHTML(item);
        });
        container.appendChild(pinnedGroup);
    }

    // 4. 渲染普通组
    if (normalItems.length > 0) {
        const normalGroup = document.createElement('div');
        normalGroup.className = "chat-list-group";
        normalItems.forEach(item => {
            normalGroup.innerHTML += createItemHTML(item);
        });
        container.appendChild(normalGroup);
    }

    // 5. ★★★ 重新绑定侧滑事件 (必须在插入HTML后执行) ★★★
    bindSwipeEvents();
}

// === 新增：侧滑事件绑定函数 (从 index15 逻辑简化移植) ===
function bindSwipeEvents() {
    const rows = document.querySelectorAll('.chat-swipe-row');
    
    rows.forEach(row => {
        const content = row.querySelector('.chat-item-content');
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        const MAX_SWIPE = 260; // 三个按钮的总宽度 approx

        // 触摸开始
        content.addEventListener('touchstart', (e) => {
            // 先复位其他所有行
            document.querySelectorAll('.chat-item-content').forEach(el => {
                if(el !== content) el.style.transform = 'translateX(0)';
            });
            
            startX = e.touches[0].clientX;
            isDragging = true;
            content.style.transition = 'none'; // 拖动时移除过渡，跟手
        }, {passive: true});

        // 触摸移动
        content.addEventListener('touchmove', (e) => {
            if(!isDragging) return;
            currentX = e.touches[0].clientX;
            let diff = currentX - startX;

            // 只能向左滑 (diff < 0)
            if (diff > 0) diff = 0;
            if (diff < -MAX_SWIPE) diff = -MAX_SWIPE; // 阻尼限制

            // 如果滑动幅度很小，不认为是侧滑，防止误触
            if (Math.abs(diff) > 5) {
                content.style.transform = `translateX(${diff}px)`;
            }
        }, {passive: true});

        // 触摸结束
        content.addEventListener('touchend', (e) => {
            isDragging = false;
            content.style.transition = 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
            
            const endX = e.changedTouches[0].clientX;
            const diff = endX - startX;

            // 如果向左滑超过 60px，就展开；否则回弹
            if (diff < -60) {
                content.style.transform = `translateX(-${MAX_SWIPE}px)`;
            } else {
                content.style.transform = `translateX(0)`;
            }
        });
    });
}

// 辅助函数：复位侧滑
function resetSwipe(btn) {
    const row = btn.closest('.chat-swipe-row');
    const content = row.querySelector('.chat-item-content');
    content.style.transform = 'translateX(0)';
}

async function deleteChat(id) { chatList = chatList.filter(c => c.id !== id); await db.chats.delete(id); renderChatList(); }
function togglePin(id) { const chat = chatList.find(c => c.id === id); if (chat) { chat.isPinned = !chat.isPinned; saveData(); renderChatList(); } }

const addCharModal = document.getElementById('addCharModal');
const wbModal = document.getElementById('wbModal');
const wbList = document.getElementById('wbList');
const wbSelectorText = document.getElementById('wbSelectedText');

function openAddCharModal() {
    // ★★★ 新增：重置编辑状态 ★★★
    editingCharId = null; 
    document.querySelector('#addCharModal .modal-title').innerText = "创建新角色";
    document.querySelector('#addCharModal .btn-confirm-modal').innerText = "确认添加";
    // ---------------------------

    document.getElementById('plusMenu').style.display = 'none';
    
    document.getElementById('newCharAvatar').src = 'https://placehold.co/100/e0e0e0/888?text=+';
    document.getElementById('newCharRealName').value = '';
    document.getElementById('newCharName').value = '';
    document.getElementById('newCharSetting').value = '';
    
    tempSelectedWb = [];
    updateWbSelectorText();
    
    addCharModal.style.display = 'flex';
    setTimeout(() => addCharModal.classList.add('show'), 10);
}

function closeAddCharModal() {
    addCharModal.classList.remove('show');
    setTimeout(() => addCharModal.style.display = 'none', 300);
}

function openWorldBookModal() { 
    wbList.innerHTML = ''; 
    if(worldBooks.length === 0) {
        wbList.innerHTML = '<div style="text-align:center;color:#999;margin-top:20px;">暂无世界书<br>请在“我的”页面添加</div>';
    } else {
        worldBooks.forEach(wb => { 
            const item = document.createElement('div'); 
            item.className = 'wb-item'; 
            
            // ★★★ 修改 1：判断选中状态时，要兼容 ID (新逻辑) 和 名字 (旧数据)
            // 如果 tempSelectedWb 里的某一项 等于 wb.id 或 wb.name，就打钩
            const isChecked = tempSelectedWb.some(val => val == wb.id || val === wb.name) ? 'checked' : ''; 
            
            // ★★★ 修改 2：value 存 wb.id，而不是 wb.name
            item.innerHTML = `<input type="checkbox" class="wb-checkbox" value="${wb.id}" ${isChecked}><span>${wb.name}</span>`; 
            
            item.onclick = (e) => { 
                if(e.target.tagName !== 'INPUT') { 
                    const cb = item.querySelector('input'); 
                    cb.checked = !cb.checked; 
                } 
            }; 
            wbList.appendChild(item); 
        });
    }
    wbModal.style.display = 'flex'; 
}

// ★★★ 新增：编辑角色逻辑 ★★★
function editChat(id) {
    const chat = chatList.find(c => c.id === id);
    if (!chat) return;

    // 1. 标记当前为编辑模式
    editingCharId = id;

    // 2. 隐藏加号菜单（如果有打开）
    document.getElementById('plusMenu').style.display = 'none';

    // 3. 回填基础数据
    document.getElementById('newCharAvatar').src = chat.avatar;
    document.getElementById('newCharRealName').value = chat.realName || "";
    document.getElementById('newCharName').value = chat.name || "";
    document.getElementById('newCharSetting').value = chat.charPersona || "";

    // 4. 回填世界书数据 (关键)
    // chat.worldBooks 里面存的是 ID 数组
    tempSelectedWb = chat.worldBooks || [];
    updateWbSelectorText(); // 调用现有的函数刷新 UI 文字

    // 5. 修改弹窗标题和按钮文字，让用户知道是在编辑
    document.querySelector('#addCharModal .modal-title').innerText = "编辑角色资料";
    document.querySelector('#addCharModal .btn-confirm-modal').innerText = "保存修改";

    // 6. 显示弹窗
    const modal = document.getElementById('addCharModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    
    // 7. 复位侧滑状态
    const row = document.getElementById(`chat-row-${id}`);
    if(row) {
        const content = row.querySelector('.chat-item-content');
        if(content) content.style.transform = 'translateX(0)';
    }
}

// ★★★ 修复：保存时存入 ID 而不是名字 ★★★
function confirmWorldBooks() { 
    const checkboxes = document.querySelectorAll('.wb-checkbox:checked'); 
    
    // 将选中的值存入临时数组
    // 关键：检查 value 是否为数字（ID），如果是则转为 Number 类型存储
    tempSelectedWb = Array.from(checkboxes).map(cb => {
        const val = cb.value;
        return isNaN(val) ? val : Number(val); 
    }); 
    
    updateWbSelectorText(); 
    wbModal.style.display = 'none'; 
}

// ★★★ 修复：显示时将 ID 翻译回名字 ★★★
function updateWbSelectorText() { 
    if(tempSelectedWb.length > 0) { 
        // 遍历选中的 ID (或旧数据的名字)，去 worldBooks 列表里找对应的名字显示
        const names = tempSelectedWb.map(idOrName => {
            // 尝试通过 ID 找
            const found = worldBooks.find(wb => wb.id == idOrName);
            // 找到了就显示新名字；找不到（说明是旧数据的纯名字，或者该书被删了）就显示原值
            return found ? found.name : idOrName;
        });
        
        wbSelectorText.innerText = names.join('、'); 
        wbSelectorText.style.color = '#333'; 
    } else { 
        wbSelectorText.innerText = '点击选择世界书...'; 
        wbSelectorText.style.color = '#888'; 
    } 
}

async function confirmAddChar() { 
    const name = document.getElementById('newCharName').value.trim(); 
    if (!name) { 
        alert("请填写备注名 (显示在列表的名字)"); 
        return; 
    } 

    // 获取表单数据
    const realName = document.getElementById('newCharRealName').value.trim();
    const avatar = document.getElementById('newCharAvatar').src;
    const charPersona = document.getElementById('newCharSetting').value;
    
    // ★★★ 判断是编辑还是新增 ★★★
    if (editingCharId) {
        // --- 编辑模式 ---
        const chat = chatList.find(c => c.id === editingCharId);
        if (chat) {
            // 只更新资料字段，保留聊天记录和设置
            chat.name = name;
            chat.realName = realName;
            chat.avatar = avatar;
            chat.charPersona = charPersona;
            chat.worldBooks = tempSelectedWb; // 更新绑定的世界书
            
            // 更新数据库
            await db.chats.put(chat);
            
            // 如果正好在聊天室里，刷新一下标题
            if (currentChatId === editingCharId) {
                document.getElementById('roomTitle').innerText = name;
                // 如果修改了头像，可能需要刷新消息列表(视需求而定，这里暂不强制刷新全量消息)
            }
        }
    } else {
        // --- 新增模式 (原有逻辑) ---
        const now = new Date();
        const timeStr = String(now.getHours()).padStart(2,'0') + ":" + String(now.getMinutes()).padStart(2,'0');

        const newItem = { 
            id: Date.now(), 
            name: name, 
            realName: realName, 
            avatar: avatar, 
            charPersona: charPersona, 
            worldBooks: tempSelectedWb,  
            messages: [],       
            time: timeStr,
            isPinned: false,
            userAvatar: "", 
            userRealName: "",
            userRemark: "",
            lastMomentTime: 0
        }; 
        
        chatList.push(newItem); 
        await db.chats.add(newItem); 
    }
    
    // 刷新列表并关闭
    renderChatList(); 
    closeAddCharModal(); 
}

const overlay = document.getElementById('appOverlay'), chatPage = document.getElementById('chatAppPage'), genericPage = document.getElementById('genericAppPage'), appTitle = document.getElementById('appTitle');
function openApp(appName) { overlay.classList.add('active'); if (appName === 'Page 1') { chatPage.style.display = 'flex'; genericPage.style.display = 'none'; renderChatList(); switchAppTab(0); } else { chatPage.style.display = 'none'; genericPage.style.display = 'flex'; appTitle.innerText = appName; } }
function closeApp() { overlay.classList.remove('active'); }
function switchWechatTab(el) { document.querySelectorAll('.wechat-tab-btn').forEach(tab => tab.classList.remove('active')); el.classList.add('active'); }
document.addEventListener('DOMContentLoaded', () => PageNav.init());

// =========================================
// ★★★ 智能返回函数 ★★★
// =========================================
function handleAppSwipeBack() {
    PageNav.back();
}
let appStartX = 0; let appIsSwiping = false;
overlay.addEventListener('mousedown', (e) => { const rect = overlay.getBoundingClientRect(); if (e.clientX - rect.left < 40) { appStartX = e.clientX; appIsSwiping = true; } });
overlay.addEventListener('mouseup', (e) => { if (!appIsSwiping) return; if (e.clientX - appStartX > 60) { handleAppSwipeBack(); } appIsSwiping = false; });
overlay.addEventListener('touchstart', (e) => { const rect = overlay.getBoundingClientRect(); if (e.touches[0].clientX - rect.left < 40) { appStartX = e.touches[0].clientX; appIsSwiping = true; } });
overlay.addEventListener('touchend', (e) => { if (!appIsSwiping) return; if (e.changedTouches[0].clientX - appStartX > 60) { handleAppSwipeBack(); } appIsSwiping = false; });


function updateClock() { 
    const now = new Date(); 
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`; 
    const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`; 
    
    // ★★★ 主屏幕时间 ★★★
    const timeEl = document.getElementById('realTimeDisplay');
    const dateEl = document.getElementById('realDateDisplay');
    if(timeEl) timeEl.innerText = timeStr;
    if(dateEl) dateEl.innerText = dateStr;
    
    // ★★★ kawaii 卡片时间（如果有的话）★★★
    const kTimeEl = document.querySelector('.k-time-text');
    const kDateEl = document.querySelector('.k-date-text');
    if(kTimeEl) kTimeEl.innerText = timeStr;
    if(kDateEl) kDateEl.innerText = dateStr;
}

// 每秒更新一次
setInterval(updateClock, 1000); 

function changeDockIcon(index, type) { uploadContext = { type: 'dock', index: index }; if (type === 'link') { const u = prompt("请输入图片链接:"); if(u) handleBeautifyImageUpdate(u); } else { document.getElementById('fileInput').click(); } }
function changeAppIcon(index, type) { uploadContext = { type: 'app', index: index }; if (type === 'link') { const u = prompt("请输入图片链接:"); if(u) handleBeautifyImageUpdate(u); } else { document.getElementById('fileInput').click(); } }
function clearWallpaper() { document.body.style.backgroundImage = ''; document.body.classList.remove('has-wallpaper'); openBeautifyPage(); saveData(); }

const msgInputArea = document.getElementById('msgInput');

// 搜索关键词: autoResizeInput
function autoResizeInput(element) {
    // 每次计算前重置高度，以便缩小
    element.style.height = '38px'; 
    // 根据文字高度动态赋值
    let newHeight = element.scrollHeight;
    // 限制最高高度
    if (newHeight > 120) {
        element.style.height = '120px';
        element.style.overflowY = 'auto';
    } else {
        element.style.height = newHeight + 'px';
        element.style.overflowY = 'hidden';
    }
}

if (msgInputArea) {
    // 输入框获得焦点
    msgInputArea.addEventListener('focus', function() {
        const panel = document.getElementById('chatToolsPanel');
        const footer = document.getElementById('newRoomFooter');
        
        // 如果工具面板是打开的，先关闭它
        if (panel && panel.classList.contains('active')) {
            footer.classList.remove('tools-active');
            panel.classList.remove('active');
            
            // 重置面板内部视图状态
            setTimeout(() => {
                const mainMenu = document.getElementById('toolsMainMenu');
                const subView = document.getElementById('stickerSubView');
                const addView = document.getElementById('addStickerView');
                if (mainMenu) mainMenu.style.display = 'flex';
                if (subView) subView.style.display = 'none';
                if (addView) addView.style.display = 'none';
            }, 100);
            
            // ★★★ 修复：等键盘稳定后，一次性调整位置 ★★★
            setTimeout(() => {
                if (window.visualViewport) {
                    const keyboardHeight = Math.round(window.innerHeight - window.visualViewport.height);
                    if (keyboardHeight > 150) {
                        footer.style.bottom = keyboardHeight + 'px';
                    }
                }
                const msgContainer = document.getElementById('roomMessages');
                if (msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;
            }, 350);
            
            return; // 直接返回，不执行下面的逻辑
        }
        
        // 普通情况：滚动消息到底部
        setTimeout(() => {
            const msgContainer = document.getElementById('roomMessages');
            if (msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;
        }, 350);
    });

    // 自动调整高度
    msgInputArea.addEventListener('input', function() {
        autoResizeInput(this);
    });

    // 回车发送
    msgInputArea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); 
            sendMsg();
            this.style.height = '38px'; 
            this.value = ''; 
        }
    });
}


loadAllDataFromDB();

function renderMemSummaryList(chat) {
    const list = document.getElementById('memSummaryList');
    list.innerHTML = '';
    
    if (!chat.summaries) chat.summaries = [];

    if (chat.summaries.length === 0) {
        list.innerHTML = '<div style="text-align:center;font-size:12px;color:#ccc;padding:10px;">暂无总结记录</div>';
        return;
    }

    // 为了防止索引错乱，保留原始索引
    const reversedSummaries = chat.summaries.map((item, idx) => ({...item, originalIndex: idx})).reverse();

    reversedSummaries.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'mem-summary-card';
        
        card.innerHTML = `
            <div class="mem-card-date">${item.date}</div>
            <!-- 修改1: 增加 id, 增加 disabled 属性, 去掉 onchange -->
            <textarea id="mem-summ-${item.originalIndex}" class="mem-card-textarea" disabled>${item.content}</textarea>
            
            <div class="mem-card-actions">
                <!-- 修改2: 新增编辑按钮 -->
                <span class="mem-edit-btn-text" onclick="toggleSummaryEdit(${item.originalIndex}, this)">编辑</span>
                <span class="mem-del-btn-text" onclick="deleteSummary(${item.originalIndex})">删除</span>
            </div>
        `;
        list.appendChild(card);
    });
}
/* --- 在 script.js 中添加以下新函数 --- */

// 1. 切换编辑/完成状态
function toggleSummaryEdit(index, btn) {
    const textarea = document.getElementById(`mem-summ-${index}`);
    if (!textarea) return;

    if (textarea.disabled) {
        // --- 进入编辑模式 ---
        textarea.disabled = false; // 启用输入
        textarea.focus();          // 自动聚焦
        btn.innerText = "完成";    // 按钮变字
        btn.style.fontWeight = "bold";
    } else {
        // --- 点击完成 (保存) ---
        textarea.disabled = true;  // 禁用输入
        btn.innerText = "编辑";    // 按钮复原
        btn.style.fontWeight = "normal";
        
        // 执行保存
        updateSummaryContent(index, textarea.value);
    }
}

// 2. 实际保存数据到数据库
function updateSummaryContent(index, newContent) {
    const chat = chatList.find(c => c.id === currentChatId);
    if (chat && chat.summaries[index]) {
        // 更新内存中的数据
        chat.summaries[index].content = newContent;
        
        // 保存到 IndexedDB
        saveData();
        
        // 刷新 token 统计 (右上角的 token 数)
        updateMemStats(chat);
        
        // 可选：给个轻微震动反馈
        if(navigator.vibrate) navigator.vibrate(10);
    }
}

function deleteSummary(index) {
    // 1. 获取当前聊天对象
    const chat = chatList.find(c => c.id === currentChatId);
    if (!chat || !chat.summaries) return;

    // 2. 弹窗确认
    if (!confirm('确认删除这条记忆总结吗？此操作不可恢复。')) return;

    // 3. 执行删除 (splice)
    chat.summaries.splice(index, 1);

    // 4. 保存数据库
    saveData();

    // 5. 刷新列表界面和 Token 统计
    renderMemSummaryList(chat);
    updateMemStats(chat);
}

function toggleMemMode() {
    const toggle = document.getElementById('memAutoToggle');
    const text = document.getElementById('memModeText');
    
    toggle.classList.toggle('checked');
    
    if (toggle.classList.contains('checked')) {
        text.innerText = "自动";
        text.style.color = "#34c759"; 
    } else {
        text.innerText = "手动";
        text.style.color = "#007aff"; 
    }
    
    saveCurrentChatSettings();
}
function toggleBankList() {
    const header = document.getElementById('memBankHeader');
    const container = document.getElementById('memSummaryContainer');
    
    header.classList.toggle('open');
    
    if (header.classList.contains('open')) {
        container.style.display = 'flex';
    } else {
        container.style.display = 'none';
    }
}
function switchMemMode(mode, autoSave = true) {
    const btnAuto = document.getElementById('modeBtnAuto');
    const btnManual = document.getElementById('modeBtnManual');
    
    if (mode === 'auto') {
        btnAuto.classList.add('active');
        btnManual.classList.remove('active');
    } else {
        btnManual.classList.add('active');
        btnAuto.classList.remove('active');
    }

    if (autoSave) saveCurrentChatSettings();
}
async function triggerRangeSummary() {
    const chat = chatList.find(c => c.id === currentChatId);
    if (!chat) return;

    const startVal = parseInt(document.getElementById('summaryStart').value);
    const endVal = parseInt(document.getElementById('summaryEnd').value);
    const totalMsgs = chat.messages.length;

    if (isNaN(startVal) || isNaN(endVal) || startVal < 1 || startVal > endVal) {
        alert("请输入有效的消息范围 (例如 1 到 " + totalMsgs + ")");
        return;
    }
    
    const sliceStart = Math.max(0, startVal - 1);
    const sliceEnd = Math.min(totalMsgs, endVal);
    
    const msgsToProcess = chat.messages.slice(sliceStart, sliceEnd);
    
    if (msgsToProcess.length === 0) {
        alert("选定范围内没有消息！");
        return;
    }

    const confirmMsg = `确定要总结第 ${startVal} 到 ${sliceEnd} 条消息吗？\n(共 ${msgsToProcess.length} 条)`;
    if (!confirm(confirmMsg)) return;

    await executeSummaryApi(chat, msgsToProcess, `范围总结 (${startVal}-${sliceEnd})`);
}

async function executeSummaryApi(chat, messagesArray, dateSuffix = "") {
    const endpoint = document.getElementById('apiEndpoint').value;
    const key = document.getElementById('apiKey').value;
    const model = document.getElementById('apiModel').value;

    // 1. 基础校验
    if (!key) throw new Error("缺少 API Key");

    // 2. 准备 prompt
    const promptText = messagesArray.map(m => `${m.isSelf ? '用户' : chat.name}: ${m.text}`).join('\n');
    const customInstruction = chat.chatMemory || ""; 

    const systemPrompt = `
    [System Command]:
    你现在的任务是【记忆总结员】。
    
    【用户特别指令】：
    ${customInstruction}
    
    【通用要求】：
    1. 请阅读对话片段，提取关键信息、事件进展、用户偏好和情感变化。
    2. 必须简明扼要，使用陈述句。
    3. 直接输出总结段落，不要加任何前缀。
    
    待总结的对话片段：
    ${promptText}
    `;

    // 3. 调用 API
    const response = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: systemPrompt }],
            temperature: 1.0 
        })
    });

    if (!response.ok) throw new Error('API请求失败: ' + response.status);
    
    const data = await response.json();
    const summaryText = data.choices[0].message.content.trim();

    // 4. 更新内存数据
    if (!chat.summaries) chat.summaries = [];
    chat.summaries.push({
        date: new Date().toLocaleString() + (dateSuffix ? ` [${dateSuffix}]` : ""),
        content: summaryText
    });

    chat.lastSummarizedIndex = chat.messages.length;
    
    await db.chats.put(chat);
    
    // 5. 刷新界面
    renderMemSummaryList(chat);
    updateMemStats(chat);
}

function updateMemStats(chat) {
    if(!chat) return;
    const msgCount = chat.messages.length;
    document.getElementById('statMsgCount').innerText = msgCount;

    let totalText = "";
    let imageCount = 0; 
    
    // 1. 基础人设
    totalText += (chat.charPersona || "") + (chat.userPersona || "");
    
    // 2. 记忆摘要
    if (chat.summaries) {
        chat.summaries.forEach(s => totalText += s.content);
    }
    
    // 3. 聊天记录 & 图片扫描
    chat.messages.forEach(m => {
        totalText += m.text; 

        if (m.text.includes('<img') && !m.text.includes('chat-sticker-img')) {
            imageCount++;
        }
    });

    // 4. 世界书消耗 (保持原有逻辑)
    if (typeof worldBooks !== 'undefined') {
        const boundList = chat.worldBooks || []; 
        worldBooks.forEach(wb => {
            const isBound = boundList.some(ref => ref == wb.id || ref === wb.name) || wb.boundCharId === chat.id;
            
            if (isBound && wb.triggerType === 'always') {
                wb.entries.forEach(entry => {
                    totalText += (entry.title || "") + (entry.content || "");
                });
            }
        });
    }

    let tokenEst = 0;
    tokenEst += imageCount * 258;

    for (let i = 0; i < totalText.length; i++) {
        const code = totalText.charCodeAt(i);
        if (code > 255) {
            tokenEst += 1.2; 
        } 
        else {
            tokenEst += 0.25;           
        }
    }
    
    document.getElementById('statTokenCount').innerText = Math.ceil(tokenEst);
}

async function triggerManualSummary(isAuto = false) {
    const chat = chatList.find(c => c.id === currentChatId);
    if (!chat) return;

    const key = document.getElementById('apiKey').value;
    if (!key) {
        if (!isAuto) alert("请先在API配置页面填写API Key");
        return;
    }

    const btn = document.getElementById('btnManualSummary');
    if (!isAuto && btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在总结...';
        btn.classList.add('loading');
    }

    try {
        // ★★★ 修复：只获取“上次总结之后”的新消息 ★★★
        let lastIndex = parseInt(chat.lastSummarizedIndex) || 0;
        let msgsToProcess = chat.messages.slice(lastIndex);
        
        if (msgsToProcess.length === 0) {
            // 理论上 sendMsg 做了判断进不来这里，但防一手
            if (!isAuto) alert("没有新的消息需要总结");
            return;
        }

        // 执行总结
        await executeSummaryApi(chat, msgsToProcess, isAuto ? "自动总结" : "手动总结");
        
        if (!isAuto) {
            alert("✅ 总结成功！\n记忆库已更新，进度已保存。");
        }
    } catch (error) {
        console.error("总结失败", error);
        if (!isAuto) alert("总结失败: " + error.message);
    } finally {
        if (!isAuto && btn) {
            btn.innerHTML = '<i class="fas fa-magic"></i> 立即执行总结';
            btn.classList.remove('loading');
        }
    }
}

const bubbleColors = [
    { name: "默认", userBg: "#ffeeb0", aiBg: "#ffffff", userText: "#000", aiText: "#333" },
    { name: "黑白", userBg: "#000000", aiBg: "#ffffff", userText: "#fff", aiText: "#000" },
    { name: "绿白", userBg: "#dcf8c6", aiBg: "#ffffff", userText: "#000", aiText: "#333" },
    { name: "奶桃", userBg: "#F3E4E9", aiBg: "#FFF7FA", userText: "#333", aiText: "#333" }, 
    { name: "豆沙", userBg: "#8D6F7B", aiBg: "#F2E4E9", userText: "#fff", aiText: "#333" },
    { name: "海盐", userBg: "#E6F2FD", aiBg: "#A3ACAD", userText: "#333", aiText: "#fff" },
    { name: "芝麻", userBg: "#BFBBBE", aiBg: "#fffef8", userText: "#fff", aiText: "#333" },
    { name: "极光", userBg: "#C0C0C0", aiBg: "#EBF7F7", userText: "#fff", aiText: "#333" }
];

function renderColorGrid() {
    const grid = document.getElementById('colorGrid');
    if(!grid) return;
    grid.innerHTML = '';

    bubbleColors.forEach(theme => {
        const item = document.createElement('div');
        item.className = 'color-option';
        item.onclick = () => generateCssForTheme(theme);

        item.innerHTML = `
            <div class="color-circle">
                <div class="c-half-left" style="background:${theme.aiBg}"></div>
                <div class="c-half-right" style="background:${theme.userBg}"></div>
            </div>
            <div class="color-name">${theme.name}</div>
        `;
        grid.appendChild(item);
    });
}

function generateCssForTheme(theme) {
    const css = `/* ${theme.name}配色 */

/* 1. 普通文本气泡 */
.Miu-miu.user .content {
    background: ${theme.userBg} !important;
    color: ${theme.userText} !important;
}
.Miu-miu.ai .content {
    background: ${theme.aiBg} !important;
    color: ${theme.aiText} !important;
}

/* 2. ★★★ 语音气泡 ★★★ */
/* 直接给语音气泡的容器上背景色 */
.Miu-miu.user .content.voice-bubble {
    background-color: ${theme.userBg} !important;
}
.Miu-miu.ai .content.voice-bubble {
    background-color: ${theme.aiBg} !important;
}

/* 语音气泡内部所有元素的文字/图标颜色 */
.Miu-miu.user .content.voice-bubble .voice-icon,
.Miu-miu.user .content.voice-bubble .voice-duration {
    color: ${theme.userText} !important;
}
.Miu-miu.ai .content.voice-bubble .voice-icon,
.Miu-miu.ai .content.voice-bubble .voice-duration {
    color: ${theme.aiText} !important;
}

/* 3. 小尾巴 (保持不变) */
.Miu-miu.user .content::after {
    background-color: ${theme.userBg} !important;
}
.Miu-miu.ai .content::before {
    background-color: ${theme.aiBg} !important;
}`;
    
    document.getElementById('customCssInput').value = css;
    updateBubblePreview(); 
}
function updateBubblePreview() {
    const cssCode = document.getElementById('customCssInput').value;
    
    let previewStyle = document.getElementById('preview-dynamic-style');
    if (!previewStyle) {
        previewStyle = document.createElement('style');
        previewStyle.id = 'preview-dynamic-style';
        document.head.appendChild(previewStyle);
    }
    previewStyle.innerHTML = cssCode;
}

function togglePresetManager() {
    const body = document.getElementById('presetManagerBody');
    const arrow = document.getElementById('presetArrow');
    
    if (body.style.display === 'flex') {
        body.style.display = 'none';
        arrow.classList.replace('fa-chevron-up', 'fa-chevron-down');
    } else {
        body.style.display = 'flex';
        arrow.classList.replace('fa-chevron-down', 'fa-chevron-up');
    }
}

let cssPresets = []; 

async function loadPresetsFromDB() {
    try {
        const settings = await db.globalSettings.get('main');
        if (settings && settings.cssPresets) {
            cssPresets = settings.cssPresets;
        } else {
            cssPresets = [];
        }
        renderPresetDropdown();
    } catch (e) {
        console.error("加载预设失败", e);
    }
}

function renderPresetDropdown() {
    const select = document.getElementById('cssPresetDropdown');
    if(!select) return;
    select.innerHTML = '<option value="">-- 选择已保存的预设 --</option>';
    cssPresets.forEach((preset, index) => {
        const opt = document.createElement('option');
        opt.value = index;
        opt.innerText = preset.name;
        select.appendChild(opt);
    });
}

function loadSelectedPreset() {
    const select = document.getElementById('cssPresetDropdown');
    const index = select.value;
    if (index === "") return;
    
    const preset = cssPresets[index];
    if (preset) {
        document.getElementById('customCssInput').value = preset.code;
        updateBubblePreview(); 
    }
}

async function saveNewPreset() {
    const code = document.getElementById('customCssInput').value.trim();
    if (!code) { alert("代码为空，无法保存"); return; }
    
    const name = prompt("给这个气泡预设起个名字：");
    if (!name) return;

    cssPresets.push({ name: name, code: code });
    await savePresetsToDB();
    renderPresetDropdown();
    alert("已保存预设：" + name);
}

async function updateCurrentPreset() {
    const select = document.getElementById('cssPresetDropdown');
    const index = select.value;
    if (index === "") { alert("请先在下拉框选择一个要修改的预设"); return; }
    
    const code = document.getElementById('customCssInput').value.trim();
    if (confirm(`确定要覆盖更新预设 "${cssPresets[index].name}" 吗？`)) {
        cssPresets[index].code = code;
        await savePresetsToDB();
        alert("更新成功");
    }
}

async function deleteCurrentPreset() {
    const select = document.getElementById('cssPresetDropdown');
    const index = select.value;
    if (index === "") { alert("请先选择一个要删除的预设"); return; }

    if (confirm(`确定删除预设 "${cssPresets[index].name}" 吗？`)) {
        cssPresets.splice(index, 1);
        await savePresetsToDB();
        renderPresetDropdown();
        document.getElementById('customCssInput').value = ""; 
        updateBubblePreview();
    }
}

async function savePresetsToDB() {
    const settings = await db.globalSettings.get('main') || { id: 'main' };
    settings.cssPresets = cssPresets;
    await db.globalSettings.put(settings);
    globalData.cssPresets = cssPresets; 
}

document.addEventListener('DOMContentLoaded', () => {
    renderColorGrid();
    loadPresetsFromDB();
    const fontSlider = document.getElementById('fontSizeSlider');
    if (fontSlider) {
        // 1. 拖动时：实时改变大小 (不保存，保证流畅)
        fontSlider.addEventListener('input', (e) => {
            applyFontSize(e.target.value);
        });

        // 2. 松手时：保存数据 (存入数据库)
        fontSlider.addEventListener('change', () => {
            saveData();
        });
    }
});
// ★★★ 新增：点击头像开关立刻保存并刷新 ★★★
function toggleAvatarSwitch(el, type) {
    // 1. 切换开关视觉状态
    el.classList.toggle('checked');
    
    // 2. 获取当前聊天数据
    const chat = chatList.find(c => c.id === currentChatId);
    if (!chat) return;
    
    // 3. 更新数据对象
    const isChecked = el.classList.contains('checked');
    if (type === 'ai') {
        chat.showAiAvatar = isChecked;
    } else if (type === 'user') {
        chat.showUserAvatar = isChecked;
    }
    
    // 4. 保存到数据库
    saveData();
    
    // 5. 立刻重新渲染聊天界面 (这样你关掉设置页时，背后已经变了)
    renderMessages(chat);
}

// =========================================
// ★★★ [新增] 通用世界书上下文提取函数 ★★★
// =========================================
function getWorldBookContext(chat, checkText = "") {
    if (!chat || !worldBooks) return "";

    let wbContext = "";
    // 兼容旧数据的 Name 绑定和新数据的 ID 绑定
    const boundList = chat.worldBooks || [];

    worldBooks.forEach(wb => {
        // 判断绑定关系
        const isBound = boundList.some(ref => ref == wb.id || ref === wb.name) || wb.boundCharId === chat.id;

        if (isBound) {
            // 1. 始终触发 (Always)
            if (wb.triggerType === 'always') {
                wb.entries.forEach(entry => {
                    wbContext += `【世界观设定 - ${entry.title || '设定'}】: ${entry.content}\n`;
                });
            } 
            // 2. 关键词触发 (Keyword)
            // checkText 是我们需要检测的文本（聊天时是聊天记录，发朋友圈时是环境描述）
            else if (wb.triggerType === 'keyword' && wb.keywords && checkText) {
                const keys = wb.keywords.replace(/，/g, ',').split(',').map(k => k.trim()).filter(k => k);
                // 只要 checkText 包含任意一个关键词
                const isHit = keys.some(key => checkText.includes(key));
                
                if (isHit) {
                    wb.entries.forEach(entry => {
                        wbContext += `【触发相关设定 - ${entry.title || '设定'}】: ${entry.content}\n`;
                    });
                }
            }
        }
    });

    return wbContext;
}

// =========================================
// ★★★ [优化版] 聊天生成函数 (去油腻/自然化) ★★★
// =========================================
async function generateAiReply(chat, isRegenerate = false) {
    if (!chat) return;

    // 1. 获取配置
    const endpoint = document.getElementById('apiEndpoint').value;
    const key = document.getElementById('apiKey').value;
    const model = document.getElementById('apiModel').value;
    const temp = parseFloat(document.getElementById('apiTemp').value) || 1.0;

    if (!key) { alert("请先在 API 配置中填写 Key"); return; }

    // 2. UI 交互：修改标题为 "对方正在输入..."
    const titleEl = document.getElementById('roomTitle');
    if (titleEl && currentChatId === chat.id) {
        titleEl.innerText = "对方正在输入...";
    }

    // 1. 基础数据准备
    const validHistory = chat.messages.filter(m => !m.isLoading && !m.isHidden);
    const aiHistory = validHistory.filter(m => !m.isSelf);
    const lastAiMsg = aiHistory[aiHistory.length - 1]; // 找到 AI 说的最后一句话

    let timeGapPrompt = "";
    
    // 2. 如果 AI 以前说过话，计算到现在过去了多久
    if (lastAiMsg) {
        // 如果旧消息没有时间戳，给个当前时间兜底，防止报错
        const lastTime = lastAiMsg.timestamp || Date.now();
        const nowTime = Date.now();
        
        // 计算绝对时间差 (毫秒 -> 分钟)
        const diffMs = nowTime - lastTime;
        const diffMins = Math.floor(diffMs / (1000 * 60));

        const currentHour = parseInt(new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai',
    hour: 'numeric',
    hour12: false 
}).format(new Date()));

let timePeriodDesc = "";
if (currentHour >= 0 && currentHour < 5) timePeriodDesc = "深夜/凌晨";
else if (currentHour >= 5 && currentHour < 9) timePeriodDesc = "刚睡醒的清晨";
else if (currentHour >= 9 && currentHour < 12) timePeriodDesc = "上午";
else if (currentHour >= 12 && currentHour < 14) timePeriodDesc = "中午午休时间";
else if (currentHour >= 14 && currentHour < 18) timePeriodDesc = "下午";
else if (currentHour >= 18 && currentHour < 23) timePeriodDesc = "晚上";
else timePeriodDesc = "深夜";

const isMorningWakeUp = (currentHour >= 5 && currentHour <= 11) && (diffMins > 360 && diffMins < 840);

        console.log(`[时间感知] AI上次发言: ${new Date(lastTime).toLocaleString()}`);
        console.log(`[时间感知] 当前时间: ${new Date(nowTime).toLocaleString()}`);
        console.log(`[时间感知] 相差分钟: ${diffMins}, 当前小时: ${currentHour}`);

        // --- 场景 A: 间隔极短 (< 2分钟) ---
        if (diffMins < 2) {
            timeGapPrompt = `(当前是实时对话，用户秒回了你)`;
        }
        // --- 场景 B: 正常间隔 (< 1小时) ---
        else if (diffMins < 60) {
            timeGapPrompt = `(距离你上次发言过去了 ${diffMins} 分钟)`;
        }
        // --- 场景 C: 长时间间隔 (> 1小时) ---
        else {
            // 格式化时间显示 (例如: 1.5天 或 3.5小时)
            let timeDesc = "";
            if (diffMins > 1440) timeDesc = `${(diffMins / 1440).toFixed(1)}天`;
            else timeDesc = `${(diffMins / 60).toFixed(1)}小时`;

            // ★★★ 核心：判断是“过夜”还是“失踪” ★★★
            // 条件：当前是早上(5点-11点) 且 间隔时间在(6小时-14小时之间)
            // 这种情况下，大概率是昨天聊完睡了一觉，今天早上醒来回消息
            const isMorningWakeUp = (currentHour >= 5 && currentHour <= 11) && (diffMins > 360 && diffMins < 840);

            if (isMorningWakeUp) {
                // 触发“早安”逻辑
                timeGapPrompt = `
[系统强指令：场景感知]
距离上次对话过去了 ${timeDesc}。
【特殊情况判定】：现在是早上，且间隔正好是一晚上的睡眠时间。
用户应该是刚醒来看到消息，而不是故意不理你。
请根据人设自然地打招呼（如：早安、睡醒了吗），语气要温和自然，**不要**抱怨用户消失。
`;
            } else {
                // 触发“被冷落”逻辑
                timeGapPrompt = `
[系统强指令：用户回归]
距离你上次发言已经过去了 ${timeDesc}。
注意：是你发完消息后，**用户一直没回**，把你晾在这一边长达 ${timeDesc}。
请根据人设做出反应（例如：抱怨用户去哪了、撒娇说想你了、或者高冷地问“你还知道回来？”）。
禁止说是你自己去忙了。
【系统强制校准】：
当前绝对现实时间：北京时间 ${new Date().toLocaleTimeString('en-US', {timeZone:'Asia/Shanghai', hour12:false})} (${timePeriodDesc})。
请务必根据【${timePeriodDesc}】这个时间段来调整你的精神状态（例如深夜是困倦或感性，清晨是朦胧）。
`;
            }
        }
    } else {
        timeGapPrompt = `(这是新的对话，请主动开启话题)`;
    }

    // ============================================================
    // ★★★ 新版时间感知逻辑 END ★★★
    // ============================================================
   
    const charName = chat.name;
    const activeSystemPrompt = SYSTEM_COMMAND_PROMPT.replace(/{{char}}/g, charName);
    
    let systemPrompt = activeSystemPrompt + `\n\n` + getFullPersona(chat) + timeGapPrompt;
    if (typeof getCoupleStatusForAI === 'function') {
        systemPrompt += getCoupleStatusForAI(chat);
    }
    // 1. 世界书
    const recentContextText = chat.messages.slice(-5).map(m => m.text).join(' ');
    const wbContext = getWorldBookContext(chat, recentContextText);
    if (wbContext) {
        systemPrompt += `\n【必须遵守的世界观/背景设定】：\n${wbContext}\n`;
    }

    // ★★★ 2. 朋友圈 (自然化修改 - 修复评论可见性) ★★★
    const recentMoments = momentList.filter(m => m.userId === chat.id).slice(0, 3);
    if (recentMoments.length > 0) {
        systemPrompt += `\n【你最近发布的朋友圈动态】(注意：以下内容完全是你自己发布的)：\n`;
        recentMoments.forEach(m => {
            systemPrompt += `- [我自己发的动态]: ${m.content} (时间:${m.time})\n`;
            
            // ★★★ 新增：把评论也喂给AI ★★★
            if (m.comments && m.comments.length > 0) {
                m.comments.forEach(c => {
                    // 标记这是用户的评论
                    systemPrompt += `  * [用户评论]: ${c.content} (评论者:${c.name})\n`;
                });
            }
        });
    }

    // ★★★ 3. 日记 (自然化修改) ★★★
    if (chat.diaryEntries && chat.diaryEntries.length > 0) {
        const lastDiary = chat.diaryEntries[chat.diaryEntries.length - 1];
        systemPrompt += `\n【你内心深处的真实想法】(仅供参考你当下的潜意识)：\n- ${lastDiary.content}\n`;
    }

    // 4. 长期记忆
    if (chat.summaries && chat.summaries.length > 0) {
        systemPrompt += `\n【长期记忆/前情提要】：\n${chat.summaries.map(s => s.content).join('\n')}\n`;
    }
    systemPrompt += `\n请沉浸在角色中回复，拒绝任何AI味，保持极度口语化。`;
    
// 5. 能力注入
    if (myStickers && myStickers.length > 0) {
        // 防止表情太多导致Token爆炸，只取前50个，并用顿号连接
        const stickerNames = myStickers.slice(0, 50).map(s => s.name).join('、');
        
        systemPrompt += `\n\n【表情包强制指令】：
当前可用表情名：[${stickerNames}]
当你想发表情时，**必须且只能**输出指令格式：[STICKER:名称]
【绝对禁止】输出“发送了一张表情包”或“丢给你一个表情”这种描述性文字！
正确示例：[STICKER:滑稽]
错误示例：(发送了一张滑稽表情)`;
    }
    systemPrompt += `\n【语音】：格式 [VOICE:内容]`;
    systemPrompt += `\n【照片】：格式 [PHOTO:描述]`;
systemPrompt += `\n【写情书/信件】：
    如果用户让你去“情侣空间”写封信，或者你想主动写一封长信存入信箱，请在回复中单独包含指令：
    [CP_LETTER:标题:正文内容]
    例如：[CP_LETTER:给最爱的你:这是我今天特别想对你说的话...]
    注意：标题不要太长，正文可以长一点。`;
    systemPrompt += `
【最终输出格式严格要求】：
请务必返回一个标准的 **JSON 对象**（不要返回 Markdown 代码块，不要返回纯文本）。
格式如下：
{
  "replies": [
    "这里是第一句回复", 
    "这里是第二句回复（强制换行）", 
    "[STICKER:滑稽]"
  ],
  "heartVoice": {
    "mbti":"此处填MBTI | 性格关键词 (必须精准符合人设！严禁出现OOC标签)"
    "quote": "此处填符合氛围的短句文案",
    "content": "此处填长句心声/心理活动 (符合${chat.name}的说话逻辑)",
    "mutter": "符合人设的短语或颜文字",
    "bottomText": "富有氛围感的结语或环境描写"
  }
}
`;
systemPrompt += `\n\n【自主转账能力】：
    如果你想主动给用户转账（例如：发红包、还钱、安慰），请在回复中单独包含指令：
    [TRANSFER:金额:备注]
    例如：[TRANSFER:520:拿去买糖吃] 或 [TRANSFER:66.66:祝你顺利]
    注意：金额必须是数字。`;
// ★★★ 新增逻辑：检查待处理的转账 ★★★
    const pendingTransfers = chat.messages.filter(m => m.type === 'transfer' && m.transferBy === 'me' && m.status === 'pending');
    if (pendingTransfers.length > 0) {
        systemPrompt += `\n\n【待处理事项 - 重要】：
你收到了用户的转账，目前处于"待确认"状态，请在本次回复中决定是收下还是退还。
待处理列表：
`;
        pendingTransfers.forEach(pt => {
            systemPrompt += `- ID: ${pt.id}, 金额: ${pt.amount}, 备注: ${pt.note}\n`;
        });
        systemPrompt += `
请务必在回复文本中插入以下指令来执行操作（不要发起新转账来退款！）：
- 收下转账：[TRANSFER_OP:${pendingTransfers[0].id}:RECEIVE]
- 退还转账：[TRANSFER_OP:${pendingTransfers[0].id}:REFUND]
注意：指令ID必须与上面的ID完全一致。`;
    }
    systemPrompt += `\n【主动通话能力】：
    如果你想向用户发起实时语音通话（例如：用户让你打过来，或者情感到位了），请在回复中单独包含指令：
    [CALL:通话理由]
    例如：[CALL:我也想听你的声音] 或 [CALL:接电话]
    注意：这是一个非常亲密的行为。`;

    const TRANS_SPLIT = "@@@TRANS@@@"; 
    
    if (globalData.autoTranslateEnabled) {
        systemPrompt += `
\n【强翻译模式已开启】：
用户要求开启实时翻译。请遵循以下格式规则：
在 "replies" 数组中的每一句话后面，**必须**加上该句的简体中文翻译。
原文和翻译之间，**必须**使用 "${TRANS_SPLIT}" 作为分隔符。
格式示例： "replies": ["Hello there.${TRANS_SPLIT}你好呀。", "How are you?${TRANS_SPLIT}你怎么样？"]
注意：不要改变 JSON 结构，只在字符串内部拼接翻译。
`;
    }

    // 6. 消息构建与清洗
    const limit = chat.memContextLimit || 50;
    const validMsgs = chat.messages.filter(m => !m.isLoading);
    // ★★★ 识图功能核心修改区 ★★★
    const contextMsgs = validMsgs.slice(-limit).map(m => {
        let contentToSend = m.contentDescription || m.text;
        
        // 1. 尝试提取图片链接 (匹配表情包、拍照、相册图片的 img 标签)
        const imgMatch = m.text.match(/<img[^>]+src="([^"]+)"[^>]*>/i);
        
        // 2. ★★★ 修复：智能判断图片类型，跳过不支持的 GIF 表情包 ★★★
        // 如果是用户发的消息(isSelf) 且 包含图片(imgMatch) 且 这张图不是表情包(!isSticker)
        const isSticker = m.text.includes('chat-sticker-img');
        if (m.isSelf && imgMatch && imgMatch[1] && !isSticker) {
            const imgSrc = imgMatch[1];
            // 提取辅助描述文字 (如果有)
            let textDesc = "[图片]";
            if (m.contentDescription) textDesc = m.contentDescription;
            else if (m.text.includes('chat-sticker-img')) textDesc = "[表情包]";
            
            // ★★★ 新增修复点 1：Vision API 模式下也要带上引用内容 ★★★
            if (m.replyCtx) {
                textDesc = `[回复 ${m.replyCtx.name}: ${m.replyCtx.content}]\n${textDesc}`;
            }

            return {
                role: "user",
                content: [
                    { type: "text", text: textDesc }, 
                    {
                        type: "image_url",
                        image_url: {
                            url: imgSrc // 支持 URL 和 Base64
                        }
                    }
                ]
            };
        }

        // 3. 如果没有图片，或者 是AI发的消息，走原来的纯文本清洗逻辑
        if (contentToSend.includes('<div') || contentToSend.includes('<img')) {
             if (contentToSend.includes('voice-trans-result')) {
                 const t = document.createElement('div'); t.innerHTML = m.text;
                 const r = t.querySelector('.voice-trans-result');
                 contentToSend = r ? `[语音消息：${r.innerText.trim()}]` : '[语音消息]';
             }
             else if (contentToSend.includes('chat-sticker-img')) contentToSend = '[表情包]';
             else if (contentToSend.includes('photo-msg-img')) contentToSend = '[照片]';
             else if (contentToSend.includes('album-msg-img')) contentToSend = '[图片]';
             else contentToSend = '[多媒体内容]';
        }
        if (m.replyCtx) {
            contentToSend = `[回复 ${m.replyCtx.name}: ${m.replyCtx.content}]\n${contentToSend}`;
        }

        return { role: m.isSelf ? "user" : "assistant", content: contentToSend };
    });
    
    const messagesPayload = [
        { role: "system", content: systemPrompt },
        ...contextMsgs
    ];

    try {
        const response = await fetch(`${endpoint}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
            body: JSON.stringify({ model: model, messages: messagesPayload, temperature: temp })
        });

        if (!response.ok) {
            let errorMsg = `API Error: ${response.status}`; // 默认显示状态码
            try {
                // 尝试解析 API 返回的 JSON 错误包
                const errData = await response.json();
                // 常见的错误格式适配 (OpenAI / Claude / 中转商)
                if (errData.error && errData.error.message) {
                    errorMsg = errData.error.message;
                } else if (errData.message) {
                    errorMsg = errData.message;
                } else if (typeof errData.error === 'string') {
                    errorMsg = errData.error;
                } else {
                    // 实在解析不出具体字段，就把整个对象转字符串显示
                    errorMsg = JSON.stringify(errData);
                }
            } catch (e) {
                // 如果返回的不是 JSON (比如 HTML 报错页)，就保持只显示状态码
            }
            throw new Error(errorMsg); // 抛出具体的错误信息
        }
        const data = await response.json();
        let replyContent = data.choices[0].message.content;

    // --- ★★★ 新版解析逻辑 (增强鲁棒性修复版) ★★★ ---
        let segments = [];
        
        try {
            // 1. 基础清洗：去掉 markdown 标记
            let cleanContent = replyContent.replace(/```json/gi, '').replace(/```/g, '').trim();
            
            // 2. 尝试定位并截取 JSON 对象范围
            const jsonStart = cleanContent.indexOf('{');
            const jsonEnd = cleanContent.lastIndexOf('}');
            
            if (jsonStart !== -1 && jsonEnd !== -1) {
                // 提取 { ... }
                const jsonStr = cleanContent.substring(jsonStart, jsonEnd + 1);
                
                // 3. 尝试标准解析
                const parsedObj = JSON.parse(jsonStr);

                // A. 提取心声
                if (parsedObj.heartVoice) {
                    chat.currentHeartVoice = parsedObj.heartVoice;
                    saveData();
                    console.log("💗 心声更新:", parsedObj.heartVoice);
                }

                // B. 提取回复数组
                if (parsedObj.replies && Array.isArray(parsedObj.replies)) {
                    segments = parsedObj.replies;
                } else if (parsedObj.replies) {
                    // 容错：replies 存在但不是数组（变成了字符串）
                    segments = [String(parsedObj.replies)];
                } else {
                    // ★ 关键修复：如果是对象但没有 replies 字段
                    // 不要直接 stringify 整个对象，否则就会出现你截图里的乱码
                    // 尝试查找备用字段，如果没有则视为空消息（只更新心声）
                    if (parsedObj.content) segments = [parsedObj.content];
                    else segments = []; 
                }
            } else {
                // 兼容旧格式：如果是纯数组 [ ... ]
                const arrStart = cleanContent.indexOf('[');
                const arrEnd = cleanContent.lastIndexOf(']');
                if (arrStart !== -1 && arrEnd !== -1) {
                    const jsonStr = cleanContent.substring(arrStart, arrEnd + 1);
                    segments = JSON.parse(jsonStr);
                } else {
                    // 既不是对象也不是数组，当做纯文本
                    segments = [cleanContent];
                }
            }

        } catch (e) {
            console.error("标准解析失败，启动正则救援:", e);
            
            // ★★★ 正则强力兜底 (即便是烂 JSON 也能救回来) ★★★
            // 1. 尝试用心声正则提取心声（防止心声丢失）
            try {
                // 简单的正则匹配心声部分的 quote 或 content，救一点是一点
                const hvMatch = replyContent.match(/"heartVoice"\s*:\s*(\{[\s\S]*?\})/);
                if (hvMatch) {
                    // 尝试单独解析心声部分，注意这里不做深究，能救就救
                    const simpleHv = JSON.parse(hvMatch[1]); 
                    if(simpleHv) {
                         chat.currentHeartVoice = simpleHv;
                         saveData();
                    }
                }
            } catch(ex) {}

            // 2. 尝试用正则强行抠出 "replies": [ ... ] 里的内容
            const replyMatch = replyContent.match(/"replies"\s*:\s*\[(.*?)\]/s);
            if (replyMatch && replyMatch[1]) {
                // 匹配双引号内的内容，忽略转义符
                const regexQuotes = /"([^"\\]*(?:\\.[^"\\]*)*)"/g;
                let match;
                segments = [];
                while ((match = regexQuotes.exec(replyMatch[1])) !== null) {
                    // 手动去引号和处理转义
                    try {
                        segments.push(JSON.parse(`"${match[1]}"`));
                    } catch (err) {
                        segments.push(match[1]); // 解析不了就直接用原文
                    }
                }
                if (segments.length === 0) segments = [replyContent]; // 匹配到了数组但没匹配到字符串，放弃
            } else {
                segments = [replyContent]; 
            }
        }

        // 确保 segments 是数组
        if (!Array.isArray(segments)) segments = [String(segments)];
        segments = segments.flatMap(s => {
            if (typeof s === 'string') {
                // 按换行符切分，并去掉多余空格
                return s.split(/\n+/).map(t => t.trim()).filter(t => t);
            }
            return [s];
        });

        // 过滤空消息
        segments = segments.filter(s => s && s.trim());
        
        // 恢复标题为角色名字
        if (document.getElementById('roomTitle') && currentChatId === chat.id) {
            document.getElementById('roomTitle').innerText = chat.name;
        }

        let hasUsedReplyInThisTurn = false;

        // 必须和上面定义的保持一致
        const TRANS_SPLIT = "@@@TRANS@@@"; 

        for (let i = 0; i < segments.length; i++) {
            const newTime = new Date();
            const newTimeStr = `${String(newTime.getHours()).padStart(2,'0')}:${String(newTime.getMinutes()).padStart(2,'0')}`;
            
            // 1. 获取原始文本
            let rawSegment = segments[i].trim();
            
            // 2. ★★★ 核心步骤：切分原文和翻译 ★★★
            let segmentText = rawSegment; // 默认全是原文
            let transText = null;         // 默认没翻译

            if (rawSegment.includes(TRANS_SPLIT)) {
                const parts = rawSegment.split(TRANS_SPLIT);
                segmentText = parts[0].trim(); // 前半截是原文(Hello)
                if (parts[1] && parts[1].trim()) {
                    transText = parts[1].trim(); // 后半截是翻译(你好)
                }
            }

            // 3. 插件处理 (处理的是不带翻译的 segmentText)
            let mainText = segmentText;
            if (window.aiCommandProcessors && window.aiCommandProcessors.length > 0) {
                for (const processor of window.aiCommandProcessors) {
                    try {
                        const result = processor(chat, mainText);
                        if (result !== undefined && result !== null) {
                            mainText = result;
                        }
                    } catch (e) {
                        console.error("插件处理出错:", e);
                    }
                }
            }

            if (!mainText) continue;

            // 4. --- 各种指令处理 (保持原有逻辑) ---
            let aiRecallContent = null;
            const withdrawMatch = mainText.match(/^\[WITHDRAWN:(.*?)\]$/);
            if (withdrawMatch) { aiRecallContent = withdrawMatch[1]; mainText = aiRecallContent; }
           
            // 转账操作指令
            mainText = mainText.replace(/\[TRANSFER_OP:([0-9.]+):([A-Z]+)\]/g, (match, id, action) => {
                const targetMsg = chat.messages.find(m => m.id == id);
                if (targetMsg && targetMsg.status === 'pending') {
                    if (action === 'RECEIVE') targetMsg.status = 'received';
                    else if (action === 'REFUND') targetMsg.status = 'refunded';
                    updateChatLastMsg(chat); 
                }
                return ''; 
            });

            // 主动转账
            const transferMatch = mainText.match(/\[TRANSFER:([0-9.]+):(.*?)\]/);
            if (transferMatch) {
                const amount = transferMatch[1]; 
                const note = transferMatch[2];   
                const aiTransferMsg = {
                    id: Date.now() + Math.random(),
                    type: 'transfer', isSelf: false, time: newTimeStr, timestamp: Date.now(),
                    amount: parseFloat(amount).toFixed(2), note: note, status: 'pending', transferBy: 'ai',  
                    text: `[转账] ¥${amount}`, contentDescription: `[发起转账 ¥${amount}]`
                };
                chat.messages.push(aiTransferMsg);
                mainText = mainText.replace(transferMatch[0], '').trim();
                if (!mainText) { updateChatLastMsg(chat); renderMessages(chat); continue; }
            }

            // 主动通话
            const callMatch = mainText.match(/\[CALL:(.*?)\]/);
            if (callMatch) {
                const reason = callMatch[1] || "想听听你的声音";
                setTimeout(() => { if (typeof showIncomingCallModal === 'function') showIncomingCallModal(chat, reason); }, 800);
                mainText = mainText.replace(callMatch[0], '').trim();
                if (!mainText) continue; 
            }

            // 引用回复
            let aiReplyCtx = null;
            if (mainText.includes('[REPLY:')) {
                const replyMatch = mainText.match(/\[REPLY:([^\]]{1,50})\]/);
                if (replyMatch) {
                    let quotedContent = replyMatch[1].trim();
                    if (quotedContent.startsWith('我:') || quotedContent.startsWith('我：')) quotedContent = quotedContent.slice(2).trim();
                    if (quotedContent.length > 30) quotedContent = quotedContent.slice(0, 30) + '...';
                    aiReplyCtx = { name: "我", content: quotedContent };
                    mainText = mainText.replace(/\[REPLY:[^\]]+\]/, '').trim();
                }
            }

            // 5. --- 富媒体替换 (Photo/Voice/Sticker) ---
            mainText = mainText.replace(/\[PHOTO:(.*?)\]/g, (match, desc) => {
                const aiImgUrl = "https://img.heliar.top/file/1767108859529_IMG_9793.jpeg"; 
                const photoDesc = (desc || "图片").trim();
                return `<img src="${aiImgUrl}" class="photo-msg-img" data-desc="${photoDesc}" onclick="showPhotoDescription(this.dataset.desc, event)">`;
            });

            const voiceMatch = mainText.match(/\[VOICE:(.*?)\]/);
            if (voiceMatch) {
                let voiceContent = voiceMatch[1].trim();
                let voiceDuration = Math.min(60, Math.max(1, Math.ceil(voiceContent.length / 3)));
                let audioUrl = null;
                if (chat.minimaxVoiceId) {
                    // 注意：这里需要 await，外层循环必须是 async 的 (generateAiReply 已经是 async 了)
                    audioUrl = await fetchMiniMaxTTS(voiceContent, chat.minimaxVoiceId);
                }
                const audioAttr = audioUrl ? `data-audio="${audioUrl}"` : "";
                const visualClass = audioUrl ? "has-audio" : "";
                const replacement = `
                    <div class="voice-inner-container ${visualClass}" ${audioAttr} onclick="toggleVoiceText(this, event)">
                        <div class="voice-main-row">
                            <div class="voice-animate-icon"><div class="voice-line"></div><div class="voice-line"></div><div class="voice-line"></div><div class="voice-line"></div></div>
                            <span class="voice-duration">${voiceDuration}"</span>
                        </div>
                        <div class="voice-trans-result">${voiceContent}</div>
                    </div>`;
                mainText = mainText.replace(voiceMatch[0], replacement);
            }

            mainText = mainText.replace(/\[STICKER:(.*?)\]/g, (match, name) => {
                const stickerName = name.trim();
                let sticker = myStickers.find(s => s.name === stickerName) || myStickers.find(s => s.name.includes(stickerName));
                if (sticker) return `<img src="${sticker.src}" class="chat-sticker-img">`;
                if (myStickers.length > 0) return `<img src="${myStickers[Math.floor(Math.random() * myStickers.length)].src}" class="chat-sticker-img">`;
                return `<span style="color:#aaa;font-size:12px;font-style:italic;">[${stickerName}]</span>`;
            });

            // 6. 生成列表预览描述
            let desc = null;
            if (mainText.includes('voice-inner-container')) {
                 const t = document.createElement('div'); t.innerHTML = mainText;
                 const r = t.querySelector('.voice-trans-result');
                 desc = r ? `[语音消息：${r.innerText}]` : '[语音消息]';
            } else if (mainText.includes('chat-sticker-img')) desc = "[发送了一张表情包]";
            else if (mainText.includes('photo-msg-img')) desc = "[发送了一张照片]";

            // 7. ★★★ 核心：如果有翻译，且内容不是纯图片/语音，就拼接到尾部 ★★★
            // 判断是不是纯富媒体消息 (这种通常不需要翻译)
            const isRichContent = mainText.includes('<img') || mainText.includes('voice-inner-container');
            
            if (transText && !isRichContent) {
                // 这里用的 CSS 是你之前定义好的
                const transHtml = `<div class="msg-trans-line"></div><div class="msg-trans-text">${transText}</div>`;
                mainText += transHtml;
            }

            // 8. 模拟打字延迟
            const delay = 500 + (segmentText.length * 50);
            if (i > 0) await new Promise(resolve => setTimeout(resolve, delay));
            else await new Promise(resolve => setTimeout(resolve, 300));
            
            // 9. 构建消息对象并保存
            let msgData = { text: mainText, isSelf: false, time: newTimeStr, timestamp: Date.now(), contentDescription: desc };
            if (aiRecallContent !== null) { msgData.isRecalled = true; msgData.recalledText = mainText; }
            if (aiReplyCtx) msgData.replyCtx = aiReplyCtx;

            chat.messages.push(msgData);
            
            // ★★★ 注意：删除了原本这里的 runBackgroundTranslation 调用 ★★★

            // 10. 通知与上屏
            const isBackground = document.hidden || (currentChatId !== chat.id);
            if (isBackground && 'Notification' in window && Notification.permission === 'granted') {
                let notifyBody = mainText.replace(/<[^>]+>/g, '');
                if (mainText.includes('<img')) notifyBody = '[图片]';
                else if (mainText.includes('voice-inner')) notifyBody = '[语音]';
                if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.ready.then(reg => {
                        reg.showNotification(chat.name, { body: notifyBody, icon: chat.avatar, tag: 'ai-msg-'+chat.id });
                    });
                } else {
                    new Notification(chat.name, { body: notifyBody, icon: chat.avatar });
                }
            }

            updateChatLastMsg(chat);
            chat.time = newTimeStr;
            if (!chat.isPinned) { chatList = chatList.filter(c => c.id !== chat.id); chatList.unshift(chat); }
            
            if (currentChatId === chat.id) {
                renderMessages(chat);
                const msgContainer = document.getElementById('roomMessages');
                if(msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;
            } else {
                if (i === 0) showNotification(chat, mainText);
            }
        }
        saveData();  

    } catch (error) {
        console.error(error);
        
        // 恢复标题状态
        const titleEl = document.getElementById('roomTitle');
        if (titleEl && currentChatId === chat.id) {
            titleEl.innerText = chat.name;
        }
        
        // 2. 获取时间
        const errTime = new Date();
        const errTimeStr = `${String(errTime.getHours()).padStart(2,'0')}:${String(errTime.getMinutes()).padStart(2,'0')}`;
        
        // 3. ★★★ 构建错误气泡：直接显示刚才提取的详细信息 ★★★
        const errorMsg = {
            text: `Error: ${error.message}`, // 这里显示的就会是 "余额不足" 或 "模型不存在" 了
            isSelf: false,
            time: errTimeStr,
            timestamp: Date.now(),
            contentDescription: '[生成失败]'
        };
        
        // 4. 保存与渲染
        chat.messages.push(errorMsg);
        updateChatLastMsg(chat);
        saveData();
        
        if (currentChatId === chat.id) {
            renderMessages(chat);
            const msgContainer = document.getElementById('roomMessages');
            if(msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;
        }
    }
}
function toggleChatTools(e) {
    if (e) e.stopPropagation();
    uploadContext = null;

    const footer = document.getElementById('newRoomFooter');
    const panel = document.getElementById('chatToolsPanel');
    const msgInput = document.getElementById('msgInput');
    
    if (!panel || !footer) return;
    
    const isActive = panel.classList.contains('active');
    
    if (isActive) {
        // --- 关闭 ---
        footer.classList.remove('tools-active');
        panel.classList.remove('active');
        
        setTimeout(() => {
            const mainMenu = document.getElementById('toolsMainMenu');
            const subView = document.getElementById('stickerSubView');
            const addView = document.getElementById('addStickerView');
            const panel = document.getElementById('chatToolsPanel');
            
            if(mainMenu) mainMenu.style.display = 'flex';
            
            // ★★★ 修复：不仅移除 active，还要强制隐藏 display ★★★
            if(subView) {
                subView.classList.remove('active');
                subView.style.display = 'none'; 
            }
            
            if(addView) addView.style.display = 'none';
            if(panel) panel.classList.remove('sticker-mode');
        }, 300);

    } else {
        // --- 打开 ---
        footer.classList.add('tools-active');
        panel.classList.add('active');
        
        if(msgInput) msgInput.blur();
    }
}

// 2. 点击消息区域自动关闭菜单
document.getElementById('roomMessages').addEventListener('click', () => {
    const panel = document.getElementById('chatToolsPanel');
    if (panel && panel.classList.contains('active')) {
        toggleChatTools(); // 关闭
    }
});

function openStickerView() {
    const mainMenu = document.getElementById('toolsMainMenu');
    const subView = document.getElementById('stickerSubView');
    const panel = document.getElementById('chatToolsPanel');

    // 强制隐藏主菜单 (防止它留在底部遮挡)
    if (mainMenu) mainMenu.style.setProperty('display', 'none', 'important');

    // 强制显示表情面板 (覆盖 HTML 里的 style="display:none")
    if (subView) {
        subView.style.display = 'flex'; 
        // 稍微延时加 active 类，确保过渡动画生效
        setTimeout(() => subView.classList.add('active'), 10);
    }
    
    // 给面板加上 sticker-mode 类，确保高度和样式正确
    if (panel) panel.classList.add('sticker-mode');
}

// 2. 返回主菜单
function backToToolsMenu() {
    const mainMenu = document.getElementById('toolsMainMenu');
    const subView = document.getElementById('stickerSubView');
    const panel = document.getElementById('chatToolsPanel');

    // 隐藏表情面板
    if (subView) {
        subView.classList.remove('active');
        subView.style.display = 'none'; // 关键：手动隐藏回去
    }

    // 恢复显示主菜单
    if (mainMenu) mainMenu.style.display = 'flex';
    
    // 移除特殊模式类
    if (panel) panel.classList.remove('sticker-mode');
}

// 5. 发送表情
function sendSticker(src) {
    if (!currentChatId) return;
    const chat = chatList.find(c => c.id === currentChatId);
    if (chat) {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        
        // 插入 HTML 图片标签
        chat.messages.push({ 
            text: `<img src="${src}" class="chat-sticker-img">`, 
            isSelf: true, 
            time: timeStr 
        });
        
        chat.msg = '[表情]';
        chat.time = timeStr;
        
        if (!chat.isPinned) {
            chatList = chatList.filter(c => c.id !== currentChatId);
            chatList.unshift(chat);
        }
        
        saveData();
        renderMessages(chat);
        
        // 发送后关闭菜单 (如果你想连续发，可以删掉这一行)
        toggleChatTools();
    }
}

// 1. 打开新版语音弹窗
function startVoiceSimulation() {
    // 关闭底部工具栏，防止遮挡
    toggleChatTools();
    
    const overlay = document.getElementById('voice-overlay');
    const textarea = document.getElementById('voice-text-area');
    
    // 清空上次的内容
    if (textarea) textarea.value = '';
    
    // 显示弹窗
    if (overlay) overlay.classList.add('show');
}

// 2. 关闭新版语音弹窗
function closeVoicePopup() {
    const overlay = document.getElementById('voice-overlay');
    if (overlay) overlay.classList.remove('show');
}

// 3. 发送语音逻辑
function sendVoicePopup() {
    const text = document.getElementById('voice-text-area').value.trim();
    
    // 如果没字或者没聊天对象，直接关掉
    if (!text || !currentChatId) {
        closeVoicePopup();
        return;
    }

    const chat = chatList.find(c => c.id === currentChatId);
    if (chat) {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        // 计算时长显示
        const duration = Math.min(60, Math.max(1, Math.ceil(text.length / 3)));

        // ★★★ 替换整个 voiceHtml 变量的定义 ★★★
const voiceHtml = `
    <div class="voice-inner-container" onclick="toggleVoiceText(this, event)">
        <div class="voice-main-row">
            <div class="voice-animate-icon">
                <div class="voice-line"></div>
                <div class="voice-line"></div>
                <div class="voice-line"></div>
                <div class="voice-line"></div>
            </div>
            <span class="voice-duration">${duration}"</span>
        </div>
        <div class="voice-trans-result">${text}</div>
    </div>
`;


        chat.messages.push({
            text: voiceHtml,
            isSelf: true,
            time: timeStr,
            contentDescription: `[语音消息：${text}]` // 让AI能听懂
        });

        chat.msg = '[语音]';
        chat.time = timeStr;

        saveData();
        renderMessages(chat);
        closeVoicePopup();
    }
}

function updateChatLastMsg(chat) {
    if (!chat || !chat.messages) return;
    const lastMsg = chat.messages[chat.messages.length - 1];
    
    // 如果没有消息，清空预览
    if (!lastMsg) {
        chat.msg = '';
        chat.time = '';
        return;
    }
    
    // 更新时间
    chat.time = lastMsg.time;

    // --- 1. 处理撤回消息 ---
    if (lastMsg.isRecalled) {
        if (lastMsg.isSelf) {
            chat.msg = "你撤回了一条消息";
        } else {
            chat.msg = `"${chat.name}"撤回了一条消息`;
        }
        return;
    }

    if (lastMsg.contentDescription) {
        chat.msg = lastMsg.contentDescription;
        return;
    }

    // --- 3. 处理特殊的 HTML 消息类型 ---
    if (lastMsg.text.includes('voice-inner-container')) { 
        chat.msg = '[语音]';
    } else if (lastMsg.text.includes('chat-sticker-img')) {
        chat.msg = '[动画表情]';
    } else if (lastMsg.text.includes('<img')) {
        chat.msg = '[图片]';
    } else if (lastMsg.text.includes('transfer-card')) {
        chat.msg = '[转账]';
    } else {
        let cleanText = lastMsg.text.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '');
        chat.msg = cleanText;
    }
}

function toggleVoiceText(el, e) {
    if (e) e.stopPropagation(); 

    // 1. 获取音频链接
    const audioSrc = el.getAttribute('data-audio');
    
    // 2. 如果有音频，播放音频
    if (audioSrc) {
        const audio = new Audio(audioSrc);
        audio.play();
    }

    // 3. 原有逻辑：切换显示/隐藏文字 (作为字幕)
    const resultBox = el.querySelector('.voice-trans-result');
    if (resultBox) {
        resultBox.classList.toggle('show');
        const container = document.getElementById('roomMessages');
        if(container) {
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 50); 
        }
    }
}
 // ★★★ 新增：清除聊天页壁纸 ★★★
            function clearChatRoomWallpaper() {
                const room = document.getElementById('chatRoom');
                room.style.backgroundImage = ''; 
                room.style.backgroundSize = '';
                openBeautifyPage(); 
                saveData();
            }
            /* ========================================= */
/* ========================================= */
/* ★★★ 音乐播放器逻辑 (移植与修复) ★★★ */
/* ========================================= */

// 初始化播放列表和播放器
let musicPlaylist = [];
let tempMusicBlob = null;
let tempMusicUrl = null;
let currentMusicIndex = -1;
const audioPlayer = new Audio();
let isPlaying = false;

// 1. 初始化事件监听
audioPlayer.ontimeupdate = () => {
    if (!audioPlayer.duration) return;
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    const fill = document.getElementById('progress-fill');
    const dot = document.getElementById('progress-dot');
    if (fill) fill.style.width = progress + '%';
    if (dot) dot.style.left = progress + '%';
};

audioPlayer.onended = () => {
    nextTrack();
};

// 进度条点击跳转
const progContainer = document.getElementById('progress-container');
if(progContainer) {
    progContainer.onclick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        if(audioPlayer.duration) {
            audioPlayer.currentTime = ((e.clientX - rect.left) / rect.width) * audioPlayer.duration;
        }
    };
}

// 2. 播放/暂停切换
function togglePlayback() {
    // 如果还没播放过且列表有歌，播放第一首
    if (currentMusicIndex === -1 && musicPlaylist.length > 0) { 
        playTrack(0); 
        return; 
    }
    if (currentMusicIndex === -1) return;
    
    const root = document.getElementById('play-btn-root');
    if (audioPlayer.paused) { 
        audioPlayer.play(); 
        if(root) root.classList.add('playing'); 
        isPlaying = true;
    } else { 
        audioPlayer.pause(); 
        if(root) root.classList.remove('playing'); 
        isPlaying = false;
    }
}

// 3. 播放指定曲目
function playTrack(index) {
    if (index < 0 || index >= musicPlaylist.length) return;
    currentMusicIndex = index;
    const track = musicPlaylist[index];
    
    // ★★★ 核心检查点：确保能兼容 URL 播放 ★★★
    // 支持 Blob (本地文件) 和 URL
    if (track.file && (track.file instanceof File || track.file instanceof Blob)) {
        audioPlayer.src = URL.createObjectURL(track.file);
    } else {
        // 对于保活音轨，它会走这里
        audioPlayer.src = track.url || "";
    }
    
    // 更新 UI
    const songNameEl = document.getElementById('main-song-name');
    const artistNameEl = document.getElementById('main-artist-name');
    if(songNameEl) songNameEl.innerText = track.name;
    if(artistNameEl) artistNameEl.innerText = track.artist || "未知艺术家";
    
    audioPlayer.play();
    const root = document.getElementById('play-btn-root');
    if(root) root.classList.add('playing');
    isPlaying = true;
    
    // 播放后关闭面板，或者保持打开，看你喜好
    // toggleMusicPanel(false); 
}

// 4. 切歌
function nextTrack() { 
    if(musicPlaylist.length) playTrack((currentMusicIndex + 1) % musicPlaylist.length); 
}
function prevTrack() { 
    if(musicPlaylist.length) playTrack((currentMusicIndex - 1 + musicPlaylist.length) % musicPlaylist.length); 
}

// 8. 面板开关动画 (修复版)
function toggleMusicPanel(show) {
    const panel = document.getElementById('music-panel');
    const overlay = document.getElementById('music-panel-overlay');
    if (!panel || !overlay) return;
    
    if (show) {
        overlay.style.display = 'block';
        renderPlaylist(); // 每次打开时刷新列表
        // 稍微延时以触发 CSS transition
        setTimeout(() => { 
            overlay.style.opacity = '1'; 
            panel.style.bottom = '0'; 
        }, 10);
    } else {
        overlay.style.opacity = '0'; 
        panel.style.bottom = '-70%'; 
        setTimeout(() => overlay.style.display = 'none', 400);
    }
}
// script.js - 音乐相关功能区域

// 1. 打开导入选择弹窗
function openMusicImportModal() {
    const modal = document.getElementById('music-import-modal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
}

// 2. 关闭导入选择弹窗
function closeMusicModal() {
    const modal = document.getElementById('music-import-modal');
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}
// 3. 触发本地文件选择
function triggerMusicFile() {
    // 修复：不再调用不存在的 closeMusicModal()
    // 而是关闭右上角的小菜单
    const menu = document.getElementById('musicPlusMenu');
    if (menu) menu.classList.remove('active');
    
    const fileInput = document.getElementById('musicFileInput');
    if (fileInput) {
        fileInput.click(); // 触发隐藏的input
    } else {
        console.error("未找到 id 为 musicFileInput 的元素");
    }
}


// 6. 渲染播放列表 (更新以包含删除按钮)
function renderPlaylist() {
    const container = document.getElementById('music-list-container');
    if (!container) return;
    
    if (musicPlaylist.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#ccc; margin-top:40px; font-size:13px;">暂无音乐<br>点击右上角 + 添加</div>';
        return;
    }
    
    container.innerHTML = "";
    
    musicPlaylist.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = "music-list-item";
        
        // 正在播放的高亮样式
        const isPlayingStyle = (index === currentMusicIndex) ? 'color: var(--accent-color); font-weight:bold;' : '';
        const iconHtml = (index === currentMusicIndex) ? '<i class="fas fa-volume-up" style="margin-right:5px; font-size:12px;"></i> ' : '';

        item.innerHTML = `
            <div class="list-info" onclick="playTrack(${index})">
                <div class="list-song" style="${isPlayingStyle}">${iconHtml}${track.name}</div>
                <div class="list-artist">${track.artist}</div>
            </div>
            <!-- 删除按钮 -->
            <div class="list-delete" onclick="deleteMusic(${index}, event)">×</div>
        `;
        container.appendChild(item);
    });
}

/* ================================================= */
/* ★★★ 修复后的音乐列表逻辑 (无图标/无来源/修复删除) ★★★ */
/* ================================================= */

// 1. 渲染播放列表 (已去除语音图标和来源文字)
function renderPlaylist() {
    const container = document.getElementById('music-list-container');
    if (!container) return;
    
    if (musicPlaylist.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#ccc; margin-top:40px; font-size:13px;">暂无音乐<br>点击右上角 + 添加</div>';
        return;
    }
    
    container.innerHTML = "";
    
    musicPlaylist.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = "music-list-item";
        
        // 正在播放的高亮样式 (仅加粗和颜色，不加图标)
        const isPlayingStyle = (index === currentMusicIndex) ? 'color: var(--accent-color); font-weight:bold;' : 'color: #333;';

        item.innerHTML = `
            <div class="list-info" onclick="playTrack(${index})" style="display:flex; align-items:center;">
                <!-- 只有歌名，没有 artist div -->
                <div class="list-song" style="${isPlayingStyle} font-size:16px;">${track.name}</div>
            </div>
            <!-- 删除按钮：增大点击区域，确保 stopPropagation 生效 -->
            <div class="list-delete" onclick="deleteMusic(${index}, event)" style="padding:10px; cursor:pointer; color:#ccc;">
                <i class="fas fa-times"></i>
            </div>
        `;
        container.appendChild(item);
    });
}

// 2. 删除音乐逻辑 (修复无反应问题)
function deleteMusic(index, event) {
    // 阻止事件冒泡，防止触发播放
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    if (confirm("确定要删除这首音乐吗？")) {
        // 如果删除的是当前正在播放的
        if (index === currentMusicIndex) {
            audioPlayer.pause();
            audioPlayer.src = "";
            
            // 重置底部播放器文字
            const songNameEl = document.getElementById('main-song-name');
            const artistNameEl = document.getElementById('main-artist-name');
            if(songNameEl) songNameEl.innerText = "尚未播放";
            if(artistNameEl) artistNameEl.innerText = "请点击这里选择音乐";
            
            const root = document.getElementById('play-btn-root');
            if(root) root.classList.remove('playing');
            
            currentMusicIndex = -1;
            isPlaying = false;
        } 
        // 如果删除的是当前播放之前的歌曲，索引需要减1
        else if (index < currentMusicIndex) {
            currentMusicIndex--;
        }

        musicPlaylist.splice(index, 1);
        renderPlaylist(); // 重新渲染列表
    }
}

// 3. 新增：控制右上角小菜单显隐
function toggleMusicPlusMenu(event) {
    if(event) event.stopPropagation();
    const menu = document.getElementById('musicPlusMenu');
    if(menu) {
        // 切换 active 类
        if (menu.classList.contains('active')) {
            menu.classList.remove('active');
        } else {
            menu.classList.add('active');
        }
    }
}

// 4. 点击页面其他地方关闭小菜单
document.addEventListener('click', (e) => {
    const menu = document.getElementById('musicPlusMenu');
    // 如果点击的不是菜单本身，也不是加号按钮
    if (menu && menu.classList.contains('active') && !e.target.closest('.panel-plus') && !e.target.closest('.music-plus-dropdown')) {
        menu.classList.remove('active');
    }
});

// 分组选择占位函数
function selectGroup(el) {
    document.querySelectorAll('.group-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    // 这里可以加逻辑筛选列表，目前先不动
}

// ★★★ 修复底栏位置 ★★★
function fixBottomNavPosition() {
    const nav = document.getElementById('wechat-bottom-nav');
    if (nav) {
        nav.style.position = 'absolute';
        nav.style.bottom = '0';
        nav.style.left = '0';
    }
}

// 初始化时执行修复
document.addEventListener('DOMContentLoaded', fixBottomNavPosition);
window.addEventListener('load', fixBottomNavPosition);

// 立即执行一次（以防 DOMContentLoaded 已触发）
fixBottomNavPosition();
// =========================================
// ★★★ iOS 键盘适配·修复版 v5 ★★★
// =========================================
(function() {
    const msgInput = document.getElementById('msgInput');
    const footer = document.getElementById('newRoomFooter');
    const chatRoom = document.getElementById('chatRoom');
    
    if (!msgInput || !footer || !chatRoom) return;

    // ★ 输入框失去焦点时（键盘收起）
    msgInput.addEventListener('blur', function() {
        setTimeout(() => {
            // 1. 强制重置输入栏位置
            footer.style.bottom = '0';
            
            // 2. ★★★ 关键修复：重置聊天室容器的滚动位置 ★★★
            chatRoom.scrollTop = 0;
            
            // 3. 防止页面整体偏移
            window.scrollTo(0, 0);
        }, 50);
    });

    // ★ visualViewport 监听
    if (window.visualViewport) {
        let lastKeyboardHeight = 0;
        
        window.visualViewport.addEventListener('resize', () => {
            if (!chatRoom.classList.contains('active')) return;
            
            const keyboardHeight = Math.round(window.innerHeight - window.visualViewport.height);
            
            // 防止重复执行
            if (keyboardHeight === lastKeyboardHeight) return;
            lastKeyboardHeight = keyboardHeight;
            
            if (keyboardHeight > 150) {
                // 键盘弹出
                footer.style.bottom = keyboardHeight + 'px';
            } else {
                // 键盘收起
                footer.style.bottom = '0';
            }
        });
    }
})();
//
// =========================================
// ★★★ 新版表情包逻辑 v2.0 (分类+命名+持久化修复) ★★★
// =========================================

let myStickers = [];           // 表情包内存数据
let isStickerEditMode = false; // 是否处于编辑模式
let selectedStickerIds = [];   // 已选中的表情ID
let tempUploadImg = null;      // 临时存储上传的图片Base64
let glassActionType = '';      // 记录弹窗当前用途
let currentStickerCategory = 'all'; // 当前选中的分类 ('all' 或具体分类名)

// ★★★ 1. 初始化表情包 (修复刷新消失bug的核心) ★★★
// 这个函数会在 loadAllDataFromDB 里被调用
function initStickers() {
    // 1. 从全局数据恢复，如果为空则初始化为空数组
    if (globalData && globalData.stickers) {
        myStickers = globalData.stickers;
    } else {
        myStickers = [];
    }

    // 2. 数据清洗：确保每个表情都有 category 字段，老数据默认为 '默认'
    let hasUpdate = false;
    myStickers.forEach(s => {
        if (!s.category) {
            s.category = '默认';
            hasUpdate = true;
        }
    });
    // 如果有老数据被更新了字段，悄悄保存一下
    if (hasUpdate) saveData();

    // 3. 渲染界面
    renderStickerCategories();
    renderStickerGrid();
    
    console.log('✅ 表情包系统已就绪，加载数量:', myStickers.length);
}

function renderStickerCategories() {
    const nav = document.getElementById('stickerCategoryNav');
    if (!nav) return;
    
    nav.innerHTML = '';

    const categories = new Set();
    myStickers.forEach(s => {
        if (s.category && s.category !== '默认' && s.category !== 'Default') {
            categories.add(s.category);
        }
    });
    
    const list = ['all', ...Array.from(categories)];

    list.forEach(cat => {
        const pill = document.createElement('div');
        const isActive = (currentStickerCategory === cat);
        
        pill.className = `cat-pill ${isActive ? 'active' : ''}`;
        
        // ★★★ 新增：编辑模式下显示删除小叉 ★★★
        if (isStickerEditMode && cat !== 'all') {
            pill.innerHTML = `
                <span class="cat-pill-text">${cat}</span>
                <span class="cat-delete-x" onclick="deleteStickerCategory('${cat}', event)">×</span>
            `;
            pill.classList.add('edit-mode');
        } else {
            pill.innerText = cat === 'all' ? '全部' : cat;
        }
        
        pill.onclick = (e) => {
            if (e.target.classList.contains('cat-delete-x')) return;
            currentStickerCategory = cat;
            renderStickerCategories();
            renderStickerGrid();
        };
        
        nav.appendChild(pill);
    });
}


function renderStickerGrid() {
    const grid = document.getElementById('stickerGrid');
    if (!grid) return;
    grid.innerHTML = '';

    // 1. 筛选数据
    let displayList = [];
    if (currentStickerCategory === 'all') {
        // 如果是“全部”，显示所有表情
        displayList = myStickers;
    } else {
        // 否则只显示对应分类
        displayList = myStickers.filter(s => s.category === currentStickerCategory);
    }

    // 2. 渲染图片
    displayList.forEach((s) => {
        const unit = document.createElement('div');
        unit.className = 'sticker-unit';

        const isSelected = selectedStickerIds.includes(s.id);
        const selectedClass = isSelected ? 'selected' : '';

        unit.innerHTML = `
            <div class="sticker-item-box" onclick="handleStickerClick('${s.id}', event)">
                <img src="${s.src}" class="sticker-img-content" loading="lazy">
                <div class="sticker-select-circle ${selectedClass}"></div>
            </div>
            <div class="sticker-name">${s.name || '未命名'}</div>
        `;
        grid.appendChild(unit);
    });

    // 3. 空状态
    if (displayList.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#ccc;padding:20px;font-size:12px;">空空如也</div>';
    }
}

// 辅助点击函数 (放在 renderStickerGrid 下面即可)
function handleStickerClick(id, event) {
    event.stopPropagation();
    const s = myStickers.find(item => item.id == id); // 注意 id 类型可能不同，用 == 比较
    if (!s) return;

    if (isStickerEditMode) {
        toggleStickerSelection(s.id);
    } else {
        sendStickerMsg(s);
    }
}

function switchStickerMode(mode) {
    const panel = document.getElementById('stickerSubView');
    const tabEmoji = document.getElementById('tabEmoji');
    const tabEdit = document.getElementById('tabEdit');

    if (mode === 'edit') {
        isStickerEditMode = true;
        panel.classList.add('edit-mode'); 
        tabEdit.classList.add('active');
        tabEmoji.classList.remove('active');
        updateDeleteButtonCount(); // ★ 新增
    } else {
        isStickerEditMode = false;
        selectedStickerIds = [];
        panel.classList.remove('edit-mode');
        tabEmoji.classList.add('active');
        tabEdit.classList.remove('active');
        renderStickerGrid();
    }
    
    renderStickerCategories(); // ★ 新增：刷新分类以显示/隐藏删除按钮
}


function toggleStickerSelection(id) {
    if (selectedStickerIds.includes(id)) {
        selectedStickerIds = selectedStickerIds.filter(pid => pid !== id);
    } else {
        selectedStickerIds.push(id);
    }
    renderStickerGrid();
    updateDeleteButtonCount(); // ★ 新增
}

// ★★★ 新增：更新删除按钮显示数量 ★★★
function updateDeleteButtonCount() {
    const deleteBtn = document.querySelector('.btn-delete-confirm');
    if (deleteBtn) {
        const count = selectedStickerIds.length;
        deleteBtn.innerHTML = `<i class="fas fa-trash"></i> 删除${count > 0 ? '(' + count + ')' : ''}`;
    }
}

// ★★★ 新增：删除表情分类 ★★★
function deleteStickerCategory(catName, event) {
    event.stopPropagation();
    if (confirm(`确定删除分类 "${catName}" 吗？\n该分类下的表情将移到"默认"分类。`)) {
        myStickers.forEach(s => {
            if (s.category === catName) {
                s.category = '默认';
            }
        });
        
        if (currentStickerCategory === catName) {
            currentStickerCategory = 'all';
        }
        
        globalData.stickers = myStickers;
        saveData();
        renderStickerCategories();
        renderStickerGrid();
    }
}

// ★★★ 修复后的 handleStickerAction 函数 ★★★
function handleStickerAction(action) {
    if (action === 'add') {
        openGlassPopup('batch');
    } else if (action === 'upload') {
        // 1. 尝试获取页面上的上传控件
        let fileInput = document.getElementById('stickerFileInput');
        
        // 2. ★ 核心修复：如果找不到控件，就自动创建一个并挂载到页面上
        if (!fileInput) {
            console.log('检测到缺少 stickerFileInput，正在自动修复...');
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'stickerFileInput';
            fileInput.accept = 'image/*'; // 限制只能选择图片
            fileInput.style.display = 'none'; // 隐藏起来
            
            // 绑定上传后的回调函数 (确保 handleStickerFile 已存在)
            fileInput.onchange = function() { 
                handleStickerFile(this); 
            };
            
            document.body.appendChild(fileInput);
        }

        // 3. 触发系统文件选择弹窗
        fileInput.click();
    }
}

// ★★★ 7. 打开分类管理弹窗 (新功能) ★★★
function openCategoryPopup() {
    if (selectedStickerIds.length === 0) {
        alert("请先选择至少一个表情哦");
        return;
    }

    const overlay = document.getElementById('stickerCategoryOverlay');
    const listContainer = document.getElementById('popupCatList');
    
    // 1. 渲染弹窗内的分类列表
    listContainer.innerHTML = '';
    const categories = new Set(['默认']);
    myStickers.forEach(s => categories.add(s.category || '默认'));
    
    Array.from(categories).forEach(cat => {
        const item = document.createElement('div');
        item.className = 'cat-option-item';
        item.innerHTML = `
            <span>${cat}</span>
            <div class="cat-check"></div>
        `;
        item.onclick = () => {
            // 单选逻辑
            document.querySelectorAll('.cat-option-item').forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');
            item.dataset.value = cat;
        };
        listContainer.appendChild(item);
    });

    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('show'), 10);
}

function closeCategoryPopup() {
    const overlay = document.getElementById('stickerCategoryOverlay');
    overlay.classList.remove('show');
    setTimeout(() => overlay.style.display = 'none', 300);
}

// ★★★ 8. 创建新分类 ★★★
function createNewCategory() {
    const input = document.getElementById('newCatInput');
    const name = input.value.trim();
    if (!name) return;

    // 检查重复
    const listContainer = document.getElementById('popupCatList');
    const existing = Array.from(listContainer.children).map(el => el.innerText);
    if (existing.includes(name)) {
        alert("这个分类已经存在啦");
        return;
    }

    // 添加到列表并自动选中
    const item = document.createElement('div');
    item.className = 'cat-option-item selected'; // 自动选中
    item.innerHTML = `
        <span>${name}</span>
        <div class="cat-check"></div>
    `;
    item.dataset.value = name;
    item.onclick = () => {
        document.querySelectorAll('.cat-option-item').forEach(el => el.classList.remove('selected'));
        item.classList.add('selected');
        item.dataset.value = name;
    };
    
    // 取消其他选中
    document.querySelectorAll('.cat-option-item').forEach(el => el.classList.remove('selected'));
    
    listContainer.insertBefore(item, listContainer.firstChild); // 插到最前面
    input.value = '';
}

function confirmCategoryAssignment() {
    const selectedItem = document.querySelector('.cat-option-item.selected');
    if (!selectedItem) {
        alert("请选择一个分类");
        return;
    }

    const targetCat = selectedItem.dataset.value;

    // 移动分类
    let count = 0;
    myStickers.forEach(s => {
        if (selectedStickerIds.includes(s.id)) {
            s.category = targetCat;
            count++;
        }
    });

    // 保存
    globalData.stickers = myStickers;
    saveData();
    
    // ★★★ 核心修复：彻底关闭编辑模式 ★★★
    selectedStickerIds = [];        // 清空选中数组
    isStickerEditMode = false;      // 标记为非编辑模式
    
    // 强制 UI 退出编辑状态 (这会隐藏 sticker-action-bar)
    const panel = document.getElementById('stickerSubView');
    if(panel) panel.classList.remove('edit-mode');
    
    // 恢复顶部 Tab 状态
    document.getElementById('tabEmoji').classList.add('active');
    document.getElementById('tabEdit').classList.remove('active');

    // 刷新视图到目标分类
    currentStickerCategory = targetCat;
    renderStickerCategories();
    renderStickerGrid();
    
    closeCategoryPopup();
    alert(`已移动 ${count} 个表情到 "${targetCat}"`);
}


// ★★★ 10. 删除逻辑 (整合版) ★★★
function deleteSelectedStickers() {
    if (selectedStickerIds.length === 0) return;
    
    if (confirm(`确定删除选中的 ${selectedStickerIds.length} 个表情吗？`)) {
        myStickers = myStickers.filter(s => !selectedStickerIds.includes(s.id));
        globalData.stickers = myStickers;
        saveData();
        
        selectedStickerIds = [];
        // 刷新当前界面
        renderStickerCategories(); // 可能把某个分类删空了
        renderStickerGrid();
    }
}


// ★★★ 第三步(1)：支持音乐命名的弹窗函数 ★★★
function openGlassPopup(type, defaultVal = '') {
    glassActionType = type;
    const modal = document.getElementById('glassPopup');
    const title = document.getElementById('glassTitle');
    const label = document.getElementById('glassLabel');
    const nameInput = document.getElementById('glassNameInput');
    const batchInput = document.getElementById('glassBatchInput');

    nameInput.value = '';
    batchInput.value = '';

    if (type === 'batch') {
        title.innerText = "批量添加";
        label.innerText = "输入链接 (格式: 名字:链接)";
        nameInput.style.display = 'none';
        batchInput.style.display = 'block';
    } else if (type === 'upload_name') {
        title.innerText = "表情命名";
        label.innerText = "给这张图片起个名字";
        nameInput.style.display = 'block';
        batchInput.style.display = 'none';
    } 
    // 新增：音乐上传模式
    else if (type === 'music_upload'|| type === 'music_link_name') { 
        title.innerText = "音乐上传";
        label.innerText = "给这首歌起个名字";
        nameInput.style.display = 'block';
        batchInput.style.display = 'none';
        nameInput.value = defaultVal; // 自动填入文件名
    }

    modal.classList.add('show');
}

function closeGlassPopup() {
    document.getElementById('glassPopup').classList.remove('show');
    tempUploadImg = null;
}

// ★★★ 第三步(2)：处理弹窗确认按钮 ★★★
function confirmGlassAction() {
    // 1. 批量表情
    if (glassActionType === 'batch') {
        const text = document.getElementById('glassBatchInput').value;
        processBatchImport(text);
    } 
    // 2. 表情命名
    else if (glassActionType === 'upload_name') {
        const name = document.getElementById('glassNameInput').value.trim() || '未命名表情';
        if (tempUploadImg) {
            saveNewStickerData(tempUploadImg, name);
        }
    } 
    else if (glassActionType === 'music_upload') {
        const name = document.getElementById('glassNameInput').value.trim() || '未命名音乐';
        if (tempMusicBlob) {
            const newTrack = {
                name: name,
                artist: "本地上传",
                file: tempMusicBlob, 
                id: Date.now()
            };
            musicPlaylist.push(newTrack);
            saveMusicPlaylist(); 
            renderPlaylist();
            
            if (musicPlaylist.length === 1) playTrack(0);
            tempMusicBlob = null;
        }
    }
    // ★★★ 新增修复：这里是缺失的“网络链接”保存逻辑 ★★★
    else if (glassActionType === 'music_link_name') {
        const name = document.getElementById('glassNameInput').value.trim() || '网络音乐';
        // 检查刚才暂存的 URL 是否存在
        if (tempMusicUrl) {
            const newTrack = {
                name: name,
                artist: "网络资源",
                url: tempMusicUrl, // 使用暂存的 URL
                id: Date.now()
            };
            musicPlaylist.push(newTrack);
            saveMusicPlaylist(); // 保存到数据库
            renderPlaylist(); // 刷新列表
            
            if (musicPlaylist.length === 1) playTrack(0);
            tempMusicUrl = null; // 用完清空，防止污染
        }
    }
    
    closeGlassPopup();
}

// 核心存储函数
function saveNewStickerData(src, name) {
    myStickers.push({
        id: Date.now() + Math.random(),
        src: src,
        name: name,
        category: '默认' // 新增默认分类
    });
    
    globalData.stickers = myStickers;
    saveData();
    renderStickerCategories();
    renderStickerGrid();
}

function processBatchImport(text) {
    if (!text) return;
    const lines = text.split('\n');
    let count = 0;
    
    lines.forEach(line => {
        line = line.trim();
        if(!line) return;
        
        if (line.includes('http')) {
            let name = "批量导入";
            let src = line;
            const match = line.match(/^(.*?)(https?:\/\/.*)$/);
            
            if (match) {
                const potentialName = match[1].trim().replace(/[:：|\s]+$/, '');
                const potentialUrl = match[2].trim();
                if (potentialName) name = potentialName;
                src = potentialUrl;
            }
            
            myStickers.push({
                id: Date.now() + Math.random(),
                src: src,
                name: name,
                category: '默认'
            });
            count++;
        }
    });
    
    if (count > 0) {
        globalData.stickers = myStickers;
        saveData();
        renderStickerCategories();
        renderStickerGrid();
        alert(`成功导入 ${count} 个表情`);
    } else {
        alert("未识别到有效链接");
    }
}

// 11. 发送表情 (点击图片)
function sendStickerMsg(sticker) {
    if (!currentChatId) return;
    const chat = chatList.find(c => c.id === currentChatId);
    if (chat) {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        
        chat.messages.push({ 
            text: `<img src="${sticker.src}" class="chat-sticker-img">`, 
            isSelf: true, 
            time: timeStr,
            contentDescription: `[发送了一个表情：${sticker.name}]` 
        });
        
        updateChatLastMsg(chat);
        
        if (!chat.isPinned) {
            chatList = chatList.filter(c => c.id !== currentChatId);
            chatList.unshift(chat);
        }
        
        saveData();
        renderMessages(chat);
        toggleChatTools(); // 发送后关闭面板
    }
}

// 文件上传监听
function handleStickerFile(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            tempUploadImg = e.target.result; 
            openGlassPopup('upload_name');
        };
        reader.readAsDataURL(file);
    }
    input.value = '';
}

/* ========================================= */
/* ★★★ 新版液态点击菜单逻辑 (5个功能版) ★★★ */
/* ========================================= */

let activeMsgIndex = null; 
let activeMsgElement = null; 

function initMsgMenu() {
    if (document.getElementById('msgActionMenu')) return;

    const menuHtml = `
    <div id="msgActionMenu" class="msg-action-menu">
        <div class="msg-action-item" onclick="handleMenuAction('copy')">复制</div>
        <div class="msg-action-item" onclick="handleMenuAction('edit')">编辑</div>
        <div class="msg-action-item" onclick="handleMenuAction('reply')">引用</div>
        <div class="msg-action-item" onclick="handleMenuAction('multi')">多选</div>
        <div class="msg-action-item" onclick="handleMenuAction('recall')">撤回</div>
        <div class="msg-action-item" onclick="handleMenuAction('regen')">重生成</div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', menuHtml);
    
    // 点击空白关闭逻辑保持不变
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('msgActionMenu');
        if (menu && menu.classList.contains('active') && !e.target.closest('#msgActionMenu')) {
            hideMsgMenu();
        }
    });
    const room = document.getElementById('roomMessages');
    if(room) room.addEventListener('scroll', hideMsgMenu);
}

// 2. 显示菜单 (位置计算保持不变，因为 CSS 改了，会自动变细长)
function showMsgMenu(element, index, isSelf) {
    initMsgMenu();
    const menu = document.getElementById('msgActionMenu');
    activeMsgIndex = index;
    activeMsgElement = element;
    
    if (navigator.vibrate) navigator.vibrate(15);

    const rect = element.getBoundingClientRect();
    
    // 先显示以便计算
    menu.style.display = 'flex'; 
    menu.style.opacity = '0'; // 先透明
    
    const menuHeight = menu.offsetHeight || 50;
    const menuWidth = menu.offsetWidth || 280;
    
    // 水平居中
    let leftPos = rect.left + (rect.width / 2) - (menuWidth / 2);
    // 边界检查
    if (leftPos < 10) leftPos = 10;
    if (leftPos + menuWidth > window.innerWidth - 10) leftPos = window.innerWidth - menuWidth - 10;

    // 垂直定位 (优先上方)
    let topPos;
    if (rect.top > menuHeight + 20) {
        topPos = rect.top - menuHeight - 8;
        menu.style.transformOrigin = 'center bottom';
    } else {
        topPos = rect.bottom + 8;
        menu.style.transformOrigin = 'center top';
    }

    menu.style.top = topPos + 'px';
    menu.style.left = leftPos + 'px';
    
    // 激活动画
    requestAnimationFrame(() => {
        menu.classList.add('active');
        menu.style.opacity = '1';
    });
}

// 3. 隐藏菜单
function hideMsgMenu() {
    const menu = document.getElementById('msgActionMenu');
    if (menu) {
        menu.classList.remove('active');
        menu.style.opacity = '0';
        setTimeout(() => {
            if(!menu.classList.contains('active')) menu.style.display = 'none';
        }, 200);
    }
    activeMsgIndex = null;
}

// [找到这个函数并替换 switch 内的 recall case]
function handleMenuAction(action) {
    if (activeMsgIndex === null || !currentChatId) return;
    const chat = chatList.find(c => c.id === currentChatId);
    if (!chat) return;
    
    const msg = chat.messages[activeMsgIndex];
    
    switch(action) {
        // ... (copy, edit, reply, multi 保持不变) ...
        case 'copy': 
            let text = msg.text;
            if (msg.text.includes('voice-trans-result')) {
                 const t = document.createElement('div'); t.innerHTML = msg.text;
                 text = t.querySelector('.voice-trans-result')?.innerText || '[语音]';
            } else if (msg.text.includes('<img')) {
                 text = '[图片]';
            }
            navigator.clipboard.writeText(text);
            break;
            
        case 'edit': 
            openEditMsgModal(currentChatId, activeMsgIndex);
            break;
            
        case 'reply':
            let rawText = msg.text;
            let previewText = rawText;
            if (rawText.includes('<img') || rawText.includes('chat-sticker-img')) previewText = '[图片/表情]';
            else if (rawText.includes('voice-inner')) previewText = '[语音]';
            else previewText = previewText.replace(/<[^>]+>/g, ''); 
            
            const replyName = msg.isSelf ? (chat.userRemark || "我") : (chat.realName || chat.name);

            activeReplyContext = {
                name: replyName,
                content: previewText
            };

            const bar = document.querySelector('.reply-bar-container');
            if (bar) {
                bar.querySelector('.reply-bar-title').innerText = `回复 ${replyName}`;
                bar.querySelector('.reply-bar-text').innerText = previewText;
                bar.classList.add('show');
            }

            const input = document.getElementById('msgInput');
            input.focus();
            break;
            
        case 'multi':
            enterMultiSelectMode(activeMsgIndex);
            return; 
            
        // ===========================================
        // ★★★ 核心修改：撤回逻辑 ★★★
        // ===========================================
        case 'recall': 
            // 1. 检查两分钟时限
            const now = Date.now();
            // 注意：旧消息可能没有 timestamp，为了兼容性，只有当有 timestamp 且差值 > 2分钟时才拦截
            if (msg.timestamp && (now - msg.timestamp > 2 * 60 * 1000)) {
                alert("超过 2 分钟的消息不能撤回了 (｡•́︿•̀｡)");
                hideMsgMenu();
                return;
            }

            if (confirm('确定撤回这条消息吗？')) {
                // 2. 标记为撤回状态，而不是删除
                msg.isRecalled = true;
                msg.recalledText = msg.text; // 备份原文本用于“重新编辑”或“查看”
                
                updateChatLastMsg(chat);
                saveData();
                renderMessages(chat);
            }
            break;
        // ===========================================

        case 'regen': 
            if (msg.isSelf) {
                alert('自己的消息不能重生成哦');
            } else {
                if(confirm('重新生成这轮回复？(将删除该轮所有AI消息并重新生成)')) {
                    // ★★★ 核心修改：寻找并删除连续的 AI 消息块 ★★★
                    
                    // 1. 向前查找：找到这一轮 AI 消息的起点
                    let startIndex = activeMsgIndex;
                    while (startIndex > 0 && !chat.messages[startIndex - 1].isSelf) {
                        startIndex--;
                    }

                    // 2. 向后查找：找到这一轮 AI 消息的终点
                    let endIndex = activeMsgIndex;
                    while (endIndex < chat.messages.length - 1 && !chat.messages[endIndex + 1].isSelf) {
                        endIndex++;
                    }

                    // 3. 计算需要删除的消息数量 (终点 - 起点 + 1)
                    const deleteCount = endIndex - startIndex + 1;

                    // 4. 一次性删除这一整块连续的 AI 消息
                    chat.messages.splice(startIndex, deleteCount);
                    
                    // 5. 更新最后一条消息的预览状态（因为刚才删除了末尾，需要更新列表显示的预览）
                    updateChatLastMsg(chat);

                    // 6. 保存并刷新界面
                    saveData();
                    renderMessages(chat);

                    // 7. 触发重新生成
                    generateAiReply(chat, true);
                }
            }
            break;
    }
    
    hideMsgMenu();
}

// 页面加载时初始化一次
document.addEventListener('DOMContentLoaded', () => {
    initMsgMenu();
    initReplySystem(); 
});

/* --- START: 引用回复功能逻辑 --- */

// 全局变量
let activeReplyContext = null; 

// 初始化：将回复条插入到 footer 中
function initReplySystem() {
    const footer = document.getElementById('newRoomFooter');
    if (!footer || footer.querySelector('.reply-bar-container')) return;

    const bar = document.createElement('div');
    bar.className = 'reply-bar-container';
    bar.innerHTML = `
        <div class="reply-bar-content">
            <div class="reply-bar-title"></div>
            <div class="reply-bar-text"></div>
        </div>
        <div class="reply-close-btn" onclick="cancelReply()">×</div>
    `;
    footer.prepend(bar); 
}

// 取消引用状态
function cancelReply() {
    activeReplyContext = null;
    const bar = document.querySelector('.reply-bar-container');
    if (bar) bar.classList.remove('show');
}
/* --- END OF FILE --- */

function openEditMsgModal(chatId, index) {
    hideMsgMenu(); 
    
    const toolsPanel = document.getElementById('chatToolsPanel');
    if(toolsPanel && toolsPanel.classList.contains('active')) {
        toggleChatTools();
    }

    const chat = chatList.find(c => c.id === chatId);
    if (!chat) return;
    const msg = chat.messages[index];
    
    editingMsgContext = { chatId, index };
    
    const container = document.getElementById('edit-dynamic-content');
    container.innerHTML = ''; 
    
    // --- A. 语音消息 ---
    if (msg.text.includes('voice-inner-container')) {
        // ... (语音部分的逻辑保持不变) ...
        const durMatch = msg.text.match(/class="voice-duration">(\d+)"<\/span>/);
        const textMatch = msg.text.match(/class="voice-trans-result[^"]*">([^<]+)<\/div>/);
        const duration = durMatch ? durMatch[1] : '5';
        const text = textMatch ? textMatch[1].trim() : '';

        container.innerHTML = `
            <div class="edit-voice-row">
                <span class="edit-voice-label">时长</span>
                <input type="number" id="edit-voice-duration" class="edit-voice-input" value="${duration}" style="width:60px;">
                <span style="font-size:12px;color:#666;">秒</span>
            </div>
            <div style="height:10px;"></div>
            <div class="edit-voice-row">
                <span class="edit-voice-label">内容</span>
                <textarea id="edit-voice-text" class="edit-text-area" style="min-height:80px;">${text}</textarea>
            </div>
        `;
    } 
    // --- ★★★ B. 新增：照片消息 (Photo) [修改版：无图预览] ★★★ ---
    else if (msg.text.includes('photo-msg-img')) {
        // 1. 提取图片 URL
        const srcMatch = msg.text.match(/src="([^"]+)"/);
        const currentSrc = srcMatch ? srcMatch[1] : '';
        
        // 2. 提取文字描述
        const descMatch = msg.text.match(/data-desc=["']([^"']+)["']/);
        const currentDesc = descMatch ? descMatch[1] : '';

        container.innerHTML = `
            <div style="margin-bottom:8px; font-size:12px; color:#666; text-align:center;">
                修改图片描述内容
            </div>
            
            <!-- ★ 关键：用一个隐藏的框存住图片地址，界面上看不见，但保存时以此为准 -->
            <input type="hidden" id="edit-photo-src-hidden" value="${currentSrc}">
            
            <!-- 只保留文字编辑框，高度稍微设高一点填补空白 -->
            <textarea id="edit-photo-desc" class="edit-text-area" style="min-height:120px; font-size:15px;">${currentDesc}</textarea>
        `;
        
        setTimeout(() => document.getElementById('edit-photo-desc').focus(), 100);
    }
    // --- C. 表情包 ---
    else if (msg.text.includes('chat-sticker-img')) {
        // ... (表情包逻辑保持不变) ...
        const srcMatch = msg.text.match(/src="([^"]+)"/);
        const currentSrc = srcMatch ? srcMatch[1] : '';
        let stickerName = '未知表情';
        if (typeof myStickers !== 'undefined') {
            const found = myStickers.find(s => s.src === currentSrc);
            if (found) stickerName = found.name;
        }
        const stickerCode = `[STICKER:${stickerName}]`;

        container.innerHTML = `
            <div style="margin-bottom:8px; font-size:12px; color:#666; text-align:center;">
                修改下方括号内的名字以切换表情
            </div>
            <textarea id="edit-sticker-code" class="edit-text-area" style="text-align:center; min-height:60px; font-family:monospace; font-weight:bold;">${stickerCode}</textarea>
            <div id="edit-sticker-preview" style="margin-top:10px; height:80px; display:flex; justify-content:center; align-items:center;">
                <img src="${currentSrc}" style="height:100%; border-radius:8px;">
            </div>
        `;
    } 
    // --- D. 普通文本 ---
    else {
        let val = msg.text;
        if (val.includes('<img')) {
             val = val.replace(/<img[^>]+>/g, '[图片]');
        }
        container.innerHTML = `
            <textarea id="edit-text-input" class="edit-text-area">${val}</textarea>
        `;
        setTimeout(() => document.getElementById('edit-text-input').focus(), 100);
    }

    document.getElementById('edit-msg-overlay').classList.add('active');
}
function confirmEditMsg() {
    if (!editingMsgContext) return;
    
    const { chatId, index } = editingMsgContext;
    const chat = chatList.find(c => c.id === chatId);
    if (!chat) return;
    
    // 获取各种可能的输入元素
    const textInput = document.getElementById('edit-text-input');
    const voiceText = document.getElementById('edit-voice-text');
    const stickerInput = document.getElementById('edit-sticker-code');
    const photoDescInput = document.getElementById('edit-photo-desc'); // ★ 新增

    let newText = "";
    let newDesc = null;

    // --- 分支 A: 普通文本 ---
    if (textInput) {
        newText = textInput.value;
    } 
    // --- 分支 B: 语音消息 ---
    else if (voiceText) {
        const duration = document.getElementById('edit-voice-duration').value || 1;
        const text = voiceText.value || "语音";
newText = `
    <div class="voice-inner-container" onclick="toggleVoiceText(this, event)">
        <div class="voice-main-row">
            <div class="voice-animate-icon">
                <div class="voice-line"></div>
                <div class="voice-line"></div>
                <div class="voice-line"></div>
                <div class="voice-line"></div>
            </div>
            <span class="voice-duration">${duration}"</span>
        </div>
        <div class="voice-trans-result show">${text}</div> 
    </div>
`;
        newDesc = `[语音消息：${text}]`;
    }
    // --- ★★★ 分支 C: 照片消息 (Photo) [修改版] ★★★ ---
    else if (photoDescInput) {
        const newDescription = photoDescInput.value.trim() || "照片";
        
        // ★ 改动：从隐藏的 input 里获取图片链接
        const hiddenSrcInput = document.getElementById('edit-photo-src-hidden');
        const imgSrc = hiddenSrcInput ? hiddenSrcInput.value : "";
        
        // 重新组装成 HTML 图片格式
        // 确保保留 class="photo-msg-img" 和 onclick 事件
        newText = `<img src="${imgSrc}" class="photo-msg-img" data-desc="${newDescription}" onclick="showPhotoDescription(this.dataset.desc, event)">`;
        
        // 更新列表预览
        newDesc = `[发送了照片：${newDescription}]`;
    }
    // --- 分支 D: 表情包 ---
    else if (stickerInput) {
        const code = stickerInput.value.trim(); 
        const match = code.match(/^\[STICKER:(.*?)\]$/i);
        
        if (match && match[1]) {
            const nameToFind = match[1].trim();
            let foundSticker = null;
            if (typeof myStickers !== 'undefined') {
                foundSticker = myStickers.find(s => s.name === nameToFind) || 
                               myStickers.find(s => s.name.includes(nameToFind));
            }
            if (foundSticker) {
                newText = `<img src="${foundSticker.src}" class="chat-sticker-img">`;
                newDesc = `[发送了一个表情：${foundSticker.name}]`;
            } else {
                alert(`未找到名为 "${nameToFind}" 的表情包`);
                return; 
            }
        } else {
             newText = code; 
        }
    }

    // 更新消息对象
    chat.messages[index].text = newText;
    
    // 更新描述字段（用于 AI 上下文理解）
    if (newDesc) {
        chat.messages[index].contentDescription = newDesc;
    } else if (textInput) {
        chat.messages[index].contentDescription = null;
    }

    // 更新列表预览 (如果是最后一条)
    if (index === chat.messages.length - 1) {
        updateChatLastMsg(chat);
    }

    saveData();
    renderMessages(chat);
    closeEditMsgModal();
}

function closeEditMsgModal() {
    const overlay = document.getElementById('edit-msg-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
    editingMsgContext = null;
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. 绑定取消按钮
    const btnCancel = document.getElementById('btn-edit-cancel');
    if (btnCancel) {
        btnCancel.addEventListener('click', closeEditMsgModal);
    }

    // 2. 绑定确定按钮
    const btnConfirm = document.getElementById('btn-edit-confirm');
    if (btnConfirm) {
        btnConfirm.addEventListener('click', confirmEditMsg);
    }

    // 3. 绑定点击空白处（遮罩）关闭
    const overlay = document.getElementById('edit-msg-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            // 只有点在遮罩背景上才关闭，点在弹窗内部不关闭
            if (e.target === overlay) {
                closeEditMsgModal();
            }
        });
    }
});

/* --- START: 多选删除模式核心逻辑 --- */

let isMultiSelectMode = false;
let selectedMsgIndices = new Set(); // 使用 Set 存储选中的索引，避免重复

// 1. 初始化顶部导航栏 (页面加载时调用一次即可，或者在 enter 时检查)
function initMultiSelectUI() {
    if (document.getElementById('multiSelectNavbar')) return;
    
    const room = document.getElementById('chatRoom');
    const navHtml = `
    <div id="multiSelectNavbar" class="multi-select-navbar">
        <div class="ms-nav-btn ms-nav-cancel" onclick="exitMultiSelectMode()">取消</div>
        <div class="ms-nav-title" id="msTitle">已选择 0 条</div>
        <div class="ms-nav-btn ms-nav-delete disabled" id="msDeleteBtn" onclick="deleteSelectedMessages()">删除</div>
    </div>`;
    
    room.insertAdjacentHTML('beforeend', navHtml);
}

// 2. 进入多选模式
function enterMultiSelectMode(initialIndex = null) {
    const menu = document.getElementById('msgActionMenu');
    if (menu) {
        menu.remove(); // <--- 关键修改：直接移除元素
    }

    isMultiSelectMode = true;
    selectedMsgIndices.clear();
    
    // 初始化 UI
    initMultiSelectUI();
    
    // 激活 CSS 状态
    const room = document.getElementById('chatRoom');
    if (room) room.classList.add('multi-select-mode');
    
    // 如果是从某条消息长按触发的，自动选中那一条
    if (initialIndex !== null) {
        setTimeout(() => {
            const rows = document.querySelectorAll('#roomMessages .Miu-miu');
            if (rows[initialIndex]) {
                handleMsgClickInMultiMode(initialIndex, rows[initialIndex]);
            }
        }, 50);
    }
}

// 3. 退出多选模式
function exitMultiSelectMode() {
    isMultiSelectMode = false;
    selectedMsgIndices.clear();
    
    const room = document.getElementById('chatRoom');
    room.classList.remove('multi-select-mode');
    
    // 清除所有选中样式
    document.querySelectorAll('.Miu-miu.ms-selected').forEach(el => {
        el.classList.remove('ms-selected');
    });
    
    // 重置顶部栏状态
    updateMultiSelectHeader();
}

// 4. 处理点击消息 (切换选中状态)
function handleMsgClickInMultiMode(index, rowElement) {
    if (!isMultiSelectMode) return;
    
    if (selectedMsgIndices.has(index)) {
        // 取消选中
        selectedMsgIndices.delete(index);
        rowElement.classList.remove('ms-selected');
    } else {
        // 选中
        selectedMsgIndices.add(index);
        rowElement.classList.add('ms-selected');
    }
    
    updateMultiSelectHeader();
}

// 5. 更新顶部栏数字和按钮状态
function updateMultiSelectHeader() {
    const count = selectedMsgIndices.size;
    const title = document.getElementById('msTitle');
    const delBtn = document.getElementById('msDeleteBtn');
    
    if (title) title.innerText = `已选择 ${count} 条`;
    
    if (delBtn) {
        if (count > 0) {
            delBtn.classList.remove('disabled');
            delBtn.innerText = `删除(${count})`;
        } else {
            delBtn.classList.add('disabled');
            delBtn.innerText = `删除`;
        }
    }
}

// 6. 执行删除
function deleteSelectedMessages() {
    if (selectedMsgIndices.size === 0) return;
    
    if (confirm(`确定删除选中的 ${selectedMsgIndices.size} 条消息吗？`)) {
        const chat = chatList.find(c => c.id === currentChatId);
        if (!chat) return;
        
        // 过滤掉被选中的消息 (保留 未被选中的)
        // 注意：filter index 必须与当前的 index 对应
        chat.messages = chat.messages.filter((_, index) => !selectedMsgIndices.has(index));
        
        // 更新最后一条消息预览
        updateChatLastMsg(chat);
        
        // 保存并重新渲染
        saveData();
        renderMessages(chat);
        
        // 退出模式
        exitMultiSelectMode();
    }
}

/* --- END: 多选删除模式核心逻辑 --- */
// === 新增：撤回消息辅助功能 ===

// 1. 重新编辑 (点击“重新编辑”)
window.restoreEdit = function(index) {
    const chat = chatList.find(c => c.id === currentChatId);
    if (!chat || !chat.messages[index]) return;
    
    const msg = chat.messages[index];
    const input = document.getElementById('msgInput');
    
    // 将被撤回的文本填入输入框
    // 如果是语音或图片代码，也原样填入
    if (input) {
        input.value = msg.recalledText || "";
        input.focus();
        // 触发高度自适应
        if(typeof autoResizeInput === 'function') autoResizeInput(input);
    }
};

// 2. 查看撤回内容 (点击“查看”)
window.viewRecalled = function(index) {
    const chat = chatList.find(c => c.id === currentChatId);
    if (!chat || !chat.messages[index]) return;
    
    const msg = chat.messages[index];
    let content = msg.recalledText || "";
    
    // 简单清洗一下内容，如果是HTML代码，尝试提取纯文本方便查看
    if (content.includes('voice-trans-result')) {
        const div = document.createElement('div');
        div.innerHTML = content;
        content = "[语音] " + (div.querySelector('.voice-trans-result')?.innerText || "");
    } else if (content.includes('<img')) {
        content = "[图片/表情包]";
    }
    
    alert(`撤回的内容是：\n\n${content}`);
};

/* ========================================= */
/* ★★★ icity 风格日记系统核心逻辑 ★★★ */
/* ========================================= */

let currentDiaryTargetId = null; // 当前正在看谁的日记 (null='me', number=chatId)
const originalSwitchAppTab = window.switchAppTab;
window.switchAppTab = function(index) {
    originalSwitchAppTab(index);
    if (index === 1) { // 如果切到了 Diary 页
        renderDiarySelection();
    }
};

// 找到 renderDiarySelection 函数并替换为以下内容：
function renderDiarySelection() {
    const grid = document.getElementById('diarySelectionGrid');
    if (!grid) return;
    
    // --- 修改开始：添加返回箭头逻辑 ---
    const titleEl = document.querySelector('.diary-app-name');
    
    if (titleEl) {
        titleEl.innerText = "他的日记"; // 保持原有的标题修改逻辑
        
        // 获取标题的父容器（Header栏）
        const headerBar = titleEl.parentElement;
        
        // 检查是否已经添加过返回按钮（防止重复添加）
        let backBtn = headerBar.querySelector('.diary-home-back-btn');
        
        if (!backBtn) {
            // 如果没有，创建一个
            backBtn = document.createElement('i');
            backBtn.className = 'fas fa-arrow-left diary-home-back-btn';
            
            // 设置样式使其像图2那样
            backBtn.style.fontSize = '20px';
            backBtn.style.color = '#333';
            backBtn.style.marginRight = '15px'; // 和标题拉开一点距离
            backBtn.style.cursor = 'pointer';
            backBtn.style.position = 'relative'; 
            backBtn.style.zIndex = '10';
            
            // 插入到标题的前面
            headerBar.insertBefore(backBtn, titleEl);
            
            // ★★★ 核心功能：点击返回消息列表 (Tab 0) ★★★
            backBtn.onclick = function() {
                switchAppTab(0); // 0 代表第一个 Tab (View Messages)
            };
        }
    }
    // --- 修改结束 ---

    grid.innerHTML = '';

    // ... (保留原本的头像渲染逻辑) ...
    // A. 添加“我” (User)
    const myAvatar = document.getElementById('meAvatarImg').src;
    let myName = document.getElementById('settingsUserName').innerText;
    if (!myName || myName.trim() === '默认') myName = "我";
    
    grid.innerHTML += `
        <div class="diary-selector-item" onclick="openDiaryBook('me')">
            <img src="${myAvatar}" class="diary-sel-avatar">
            <div class="diary-sel-name">${myName}</div>
        </div>
    `;

    // B. 添加聊天列表中的角色
    chatList.forEach(chat => {
        grid.innerHTML += `
            <div class="diary-selector-item" onclick="openDiaryBook(${chat.id})">
                <img src="${chat.avatar}" class="diary-sel-avatar">
                <div class="diary-sel-name">${chat.name}</div>
            </div>
        `;
    });
    
    // 重置图层显示
    document.getElementById('diary-selection-layer').classList.add('active');
    document.getElementById('diary-content-layer').classList.remove('active');
}

// 3. 打开具体的日记本
function openDiaryBook(targetId) {
    currentDiaryTargetId = targetId;
    
    // 获取目标信息
    let name = "";
    let entries = [];
    
    if (targetId === 'me') {
        // ★★★ 修改：判断是否为默认，是则替换
        let rawName = document.getElementById('settingsUserName').innerText;
        name = (rawName && rawName.trim() !== '默认') ? rawName : "我的日记";
        
        // 从 globalData 读取我的日记 (需要你在 saveData 里加上)
        if (!globalData.myDiaryEntries) globalData.myDiaryEntries = [];
        entries = globalData.myDiaryEntries;
    } else {
        const chat = chatList.find(c => c.id === targetId);
        if (chat) {
            name = chat.name + "的日记";
            if (!chat.diaryEntries) chat.diaryEntries = [];
            entries = chat.diaryEntries;
        }
    }

    // 更新 UI
    document.getElementById('diary-current-name').innerText = name;
    renderDiaryEntries(entries, targetId);

    // 切换视图
    document.getElementById('diary-selection-layer').classList.remove('active');
    document.getElementById('diary-content-layer').classList.add('active');
}

// 4. 关闭日记本，返回选人
function closeDiaryBook() {
    document.getElementById('diary-content-layer').classList.remove('active');
    document.getElementById('diary-selection-layer').classList.add('active');
    currentDiaryTargetId = null;
}

function renderDiaryEntries(entries, targetId) {
    const container = document.getElementById('diaryListContainer');
    container.innerHTML = '';

    if (!entries || entries.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; margin-top:50px; color:#ccc;">
                写点什么
            </div>`;
        return;
    }

    // 获取头像和名字用于显示
    let avatarSrc = "";
    let displayName = ""; // 第一行大字
    let handleName = "";  // 第二行 @xxx
    
    if (targetId === 'me') {
        avatarSrc = document.getElementById('meAvatarImg').src;
        // 名字逻辑保持不变
        let rawName = document.getElementById('settingsUserName').innerText;
        displayName = (rawName && rawName.trim() !== '默认') ? rawName : "我";
        
        // ★★★ 修复1：解决双 @ 问题 ★★★
        // 获取全局存的 handle (例如 "@Yueyuemiao77")
        let rawHandle = globalData.handle || "me";
        // 如果原本没有 @，才手动加上；如果有了就不加
        handleName = rawHandle.startsWith('@') ? rawHandle : '@' + rawHandle;

    } else {
        const chat = chatList.find(c => c.id === targetId);
        if (chat) {
            avatarSrc = chat.avatar;
            displayName = chat.name; // 第一行显示备注名
            
            // ★★★ 修改2：优先使用自定义的日记 Handle ★★★
            if (chat.diaryHandle) {
                handleName = chat.diaryHandle;
            } else {
                // === 如果没有自定义，才执行原来的自动生成逻辑 ===
                const generateReadableId = (numId) => {
                    const syllables = ['ba', 'zo', 'mi', 'ka', 'le', 'su', 'no', 'ra', 'ti', 'vi', 'ze', 'lo', 'pa', 'ki'];
                    const strId = numId.toString();
                    const seed1 = parseInt(strId.slice(-2)) || 0;
                    const seed2 = parseInt(strId.slice(-4, -2)) || 0;
                    const seed3 = parseInt(strId.slice(-6, -4)) || 0;
                    
                    const part1 = syllables[seed1 % syllables.length];
                    const part2 = syllables[seed2 % syllables.length];
                    const part3 = (seed3 % 2 === 0) ? syllables[seed3 % syllables.length] : ""; 
                    
                    return part3 + part2 + part1;
                };

                const rName = chat.realName ? chat.realName.trim() : ""; 
                const nName = chat.name ? chat.name.trim() : "";         
                const idSuffix = chat.id.toString().slice(-4);           

                if (rName && /^[a-zA-Z0-9_.]+$/.test(rName)) {
                    handleName = "@" + rName.toLowerCase();
                } 
                else if (nName && /^[a-zA-Z0-9_.]+$/.test(nName)) {
                    handleName = "@" + nName.toLowerCase().replace(/\s+/g, '_');
                } 
                else {
                    const autoId = generateReadableId(chat.id);
                    handleName = "@" + autoId + "_" + idSuffix;
                }
                // === 自动生成逻辑结束 ===
            }
        }
    }

    // 倒序显示，新的在前
    [...entries].reverse().forEach((entry, reverseIndex) => {
        // 计算真实索引以便删除
        const realIndex = entries.length - 1 - reverseIndex;
        
        const card = document.createElement('div');
        card.className = 'icity-card';
        
        // ★★★ 修改3：给 .icity-handle 加上点击事件 editDiaryHandle ★★★
        card.innerHTML = `
            <div class="icity-header">
                <div class="icity-user-info">
                    <img src="${avatarSrc}" class="icity-avatar">
                    <div class="icity-meta-col">
                        <div class="icity-name">${displayName}</div>
                        <div class="icity-handle" onclick="editDiaryHandle('${targetId}', event)" style="cursor: pointer;">${handleName}</div>
                    </div>
                </div>
                <div class="icity-date">${entry.date}</div>
            </div>
            
            <div class="icity-content">${entry.content}</div>
            
            <div class="icity-footer">
                <div class="icity-action"><i class="far fa-heart"></i> <span>${Math.floor(Math.random()*50)}</span></div>
                <div class="icity-action"><i class="far fa-comment"></i> <span>${Math.floor(Math.random()*10)}</span></div>
                <div class="icity-action" onclick="deleteDiaryEntry(${realIndex})"><i class="fas fa-trash-alt"></i></div>
            </div>
        `;
        container.appendChild(card);
    });
}
           
// ★★★ 新增：修改日记页面 Handle 的逻辑 ★★★
function editDiaryHandle(targetId, event) {
    if(event) event.stopPropagation(); // 防止冒泡

    let currentVal = "";
    let isMe = (targetId === 'me');
    let chat = null;

    // 获取当前值
    if (isMe) {
        currentVal = globalData.handle || "@me";
    } else {
        // targetId 传过来可能是字符串，需要转换回数字查找
        chat = chatList.find(c => c.id == targetId);
        if (!chat) return;
        // 如果有自定义过的用自定义的，没有则提示“未设置”让用户输入新的
        // 这里我们为了方便，直接不显示默认自动生成的长ID，让用户输入新的
        currentVal = chat.diaryHandle || "@"; 
    }

    const newVal = prompt("修改日记显示的 ID (Handle):", currentVal);

    if (newVal !== null && newVal.trim() !== "") {
        let finalVal = newVal.trim();
        // 自动补齐 @
        if (!finalVal.startsWith('@')) finalVal = '@' + finalVal;

        if (isMe) {
            // 修改“我”的全局 Handle
            globalData.handle = finalVal;
            // 同时更新首页显示
            const homeHandle = document.getElementById('homeHandle');
            if (homeHandle) homeHandle.innerText = finalVal;
            
            saveData();
            renderDiaryEntries(globalData.myDiaryEntries, 'me'); // 刷新日记页
        } else {
            // 修改角色的专属 Handle
            chat.diaryHandle = finalVal;
            saveData(); // 保存到数据库
            // 刷新当前角色的日记页
            if (chat.diaryEntries) {
                renderDiaryEntries(chat.diaryEntries, chat.id);
            }
        }
    }
}

// =========================================
// ★★★ [修改] 日记生成函数 (全知全能版) ★★★
// =========================================
async function triggerDiaryGeneration() {
    if (!currentDiaryTargetId) return;

    if (currentDiaryTargetId === 'me') {
        const content = prompt("写下此刻的想法...");
        if (content) addDiaryEntry('me', content);
        return;
    }

    const chat = chatList.find(c => c.id === currentDiaryTargetId);
    if (!chat) return;

    const apiKey = document.getElementById('apiKey').value;
    if (!apiKey) { alert("请先配置 API Key"); return; }

    const loading = document.getElementById('diary-loading-indicator');
    loading.style.display = 'block';
    const container = document.getElementById('diaryListContainer');
    container.scrollTop = container.scrollHeight;

    try {
        const recentMsgs = chat.messages.slice(-20).map(m => `${m.isSelf ? '我' : chat.name}: ${m.text}`).join('\n');
        
        // ★★★ 核心修改 1：注入世界书 ★★★
        const wbContext = getWorldBookContext(chat, recentMsgs);

        // ★★★ 核心修改 2：注入今日朋友圈 ★★★
        // 查找过去 24 小时内自己发过的朋友圈
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const todaysMoments = momentList
            .filter(m => m.userId === chat.id && m.id > oneDayAgo)
            .map(m => `[朋友圈]: ${m.content}`)
            .join('\n');

        const systemPrompt = `
你现在需要以“${chat.name}”的视角写一篇日记。
${getFullPersona(chat)}

${wbContext ? `【世界观设定】：\n${wbContext}\n` : ''}

【参考素材】：
1. 最近聊天记录：
${recentMsgs}

2. 你今天发布的朋友圈（日记里可以提到）：
${todaysMoments || "今天没发朋友圈"}

要求：
1. 请生成 1 到 3 篇日记（可以是关于今天的聊天，也可以是此时此刻的心情）。
2. **风格必须符合人设**，不要像写报告，要像真实的私人日记。
3. 有长有短，有的可以是碎碎念，有的可以是深沉的感悟。
4. 如果素材里提到“发照片”或“心情不好”，请直接在日记里描写那个时刻的感受，而不是描写“发动态”这个动作。
5. **必须返回纯 JSON 数组格式**，不要包含 markdown 代码块标记。
格式示例：
[
  {"date": "7月21日 · 星期一", "content": "今天天气真好..."},
  {"date": "7月21日 · 23:00", "content": "其实我有点..."}
]
        `;

        const endpoint = document.getElementById('apiEndpoint').value;
        const model = document.getElementById('apiModel').value;

        const response = await fetch(`${endpoint}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: model,
                messages: [{ role: "user", content: systemPrompt }],
                temperature: 0.8
            })
        });

        // ... (后续解析逻辑与原来保持一致) ...
        const data = await response.json();
        let content = data.choices[0].message.content;
        
        // JSON 清洗逻辑
        content = content.replace(/```json/gi, '').replace(/```/g, '').trim();
        content = content.replace(/^\uFEFF/, '');
        const firstBracket = content.indexOf('[');
        const lastBracket = content.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            content = content.substring(firstBracket, lastBracket + 1);
        }

        let newEntries = [];
        try {
            newEntries = JSON.parse(content);
        } catch (e) {
            try {
                let fixedContent = content.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
                newEntries = JSON.parse(fixedContent);
            } catch (e2) {
                const now = new Date();
                newEntries = [{ date: `${now.getMonth()+1}月${now.getDate()}日`, content: content }];
            }
        }

        if (Array.isArray(newEntries)) {
            newEntries.forEach(item => {
                if (!chat.diaryEntries) chat.diaryEntries = [];
                chat.diaryEntries.push({
                    date: item.date,
                    content: item.content,
                    timestamp: Date.now()
                });
            });
            saveData();
            renderDiaryEntries(chat.diaryEntries, chat.id);
        }

    } catch (err) {
        alert("生成失败: " + err.message);
    } finally {
        loading.style.display = 'none';
    }
}

// 7. 手动添加一条日记 (通用)
function addDiaryEntry(targetId, content) {
    const now = new Date();
    const weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const dateStr = `${now.getMonth()+1}月${now.getDate()}日 · ${weekMap[now.getDay()]}`;

    const entry = {
        date: dateStr,
        content: content,
        timestamp: Date.now()
    };

    if (targetId === 'me') {
        if (!globalData.myDiaryEntries) globalData.myDiaryEntries = [];
        globalData.myDiaryEntries.push(entry);
        saveData();
        renderDiaryEntries(globalData.myDiaryEntries, 'me');
    }
}

// 8. 删除日记
function deleteDiaryEntry(index) {
    if (!confirm("确定删除这条日记吗？")) return;

    if (currentDiaryTargetId === 'me') {
        globalData.myDiaryEntries.splice(index, 1);
        saveData();
        renderDiaryEntries(globalData.myDiaryEntries, 'me');
    } else {
        const chat = chatList.find(c => c.id === currentDiaryTargetId);
        if (chat) {
            chat.diaryEntries.splice(index, 1);
            saveData();
            renderDiaryEntries(chat.diaryEntries, chat.id);
        }
    }
}
/* ========================================= */
/* ★★★ 1. 原有 Photo 功能 (还原) ★★★ */
/* ========================================= */

// 打开描述弹窗
function openPhotoModal() {
    // 如果工具栏挡住了，先关掉
    const panel = document.getElementById('chatToolsPanel');
    if (panel && panel.classList.contains('active')) toggleChatTools();
    
    const overlay = document.getElementById('photo-overlay');
    const input = document.getElementById('photo-desc-input');
    
    if(input) input.value = ''; // 清空
    if(overlay) overlay.classList.add('show');
}

// 关闭描述弹窗
function closePhotoModal() {
    const overlay = document.getElementById('photo-overlay');
    if(overlay) overlay.classList.remove('show');
}

// 发送固定图片 + 文字描述
function sendPhotoMsg() {
    const descInput = document.getElementById('photo-desc-input');
    const text = descInput.value.trim();
    
    if (!currentChatId) return;

    // ★★★ 还原：这里只发固定的默认图 ★★★
    const fixedImgUrl = "https://img.heliar.top/file/1767108859529_IMG_9793.jpeg"; 
    
    const displayDesc = text || "分享了一张照片";
    const photoHtml = `<img src="${fixedImgUrl}" class="photo-msg-img" data-desc="${displayDesc}" onclick="showPhotoDescription(this.dataset.desc, event)">`;

    const chat = chatList.find(c => c.id === currentChatId);
    if (chat) {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        
        chat.messages.push({
            text: photoHtml,
            isSelf: true,
            time: timeStr,
            contentDescription: `[发送了照片：${displayDesc}]`,
            timestamp: Date.now()
        });

        chat.msg = '[照片]';
        chat.time = timeStr;

        if (!chat.isPinned) {
            chatList = chatList.filter(c => c.id !== currentChatId);
            chatList.unshift(chat);
        }

        saveData();
        renderMessages(chat);
        closePhotoModal();
    }
}

/* ========================================= */
/* ★★★ 2. 新增 Album 功能 (直接发送) ★★★ */
/* ========================================= */

// 触发选图
function triggerNativeAlbum() {
    toggleChatTools(); 
    const input = document.getElementById('native-file-input');
    if (input) input.click();
}

// 选图回调：直接发送，不弹窗
function handleNativeAlbumSelect(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64Url = e.target.result;
        // ★ 选完图直接发
        sendDirectPhoto(base64Url); 
    };
    reader.readAsDataURL(file);
    input.value = ''; 
}

// 直接发送图片函数
function sendDirectPhoto(imgUrl) {
    if (!currentChatId) return;
    const chat = chatList.find(c => c.id === currentChatId);
    
    if (chat) {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        const displayDesc = "图片"; 
        const photoHtml = `<img src="${imgUrl}" class="album-msg-img" data-desc="${displayDesc}">`;

        chat.messages.push({
            text: photoHtml,
            isSelf: true,
            time: timeStr,
            contentDescription: `[发送了一张图片]`,
            timestamp: Date.now()
        });

        chat.msg = '[图片]';
        chat.time = timeStr;

        if (!chat.isPinned) {
            chatList = chatList.filter(c => c.id !== currentChatId);
            chatList.unshift(chat);
        }

        saveData();
        renderMessages(chat);
        
        // 滚到底部
        const container = document.getElementById('roomMessages');
        if(container) container.scrollTop = container.scrollHeight;
    }
}
window.showPhotoDescription = function(desc, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const content = desc || "无文字描述";
    alert(content);
};

// --- Moment 全局变量 ---
let momentList = [];           // 存储动态列表
let tempMomentImg = null;      // 发布时的临时图片
let currentMomentFilter = 'all'; // 当前查看：'all' 或 'me'

// --- 初始化入口 (请确保在 loadAllDataFromDB 函数末尾调用此函数) ---
function initMoments() {
    // 1. 读取数据
    if (globalData && globalData.moments) {
        momentList = globalData.moments;
    } else {
        momentList = [];
    }

    syncMomentProfile();
    renderMomentFeed();
    console.log('✅ Moment 模块已就绪');
}

// --- 核心：同步/加载 Moment 个人资料 ---
function syncMomentProfile() {
    // 1. 获取 DOM 元素
    const mAvatar = document.getElementById('momentUserAvatar');
    const mBanner = document.getElementById('momentBannerImg');
    const mBgLayer = document.getElementById('momentBgLayer');
    const mName = document.getElementById('momentUserName');
    const mHandle = document.getElementById('momentUserHandle');
    const mBio = document.getElementById('momentUserBio');

    if (!mAvatar) return; // 如果页面元素还没加载，直接退出

    // 2. 准备默认兜底数据 (如果没自定义过，就用这些)
    // 默认背景图
    const defaultBg = "https://i.postimg.cc/8z6M7W7M/moment-bg.jpg";
    // 默认头像 (尝试获取"我"页面的头像，获取不到就用占位图)
    const meAvatarEl = document.getElementById('meAvatarImg');
    const defaultAvatar = meAvatarEl ? meAvatarEl.src : "https://placehold.co/100x100/pink/white?text=Me";
    // 默认文字
    const defaultName = "我";
    const defaultHandle = globalData.handle || "@user_unknown";
    const defaultBio = globalData.bio || "这里是我的精神角落。";

    // 3. 赋值：优先读取 globalData 中 moment 前缀的专属字段
    // 如果 globalData.momentAvatar 存在，就用它；否则用 defaultAvatar
    mAvatar.src = globalData.momentAvatar || defaultAvatar;
    
    // Banner (卡片顶部图)
    mBanner.src = globalData.momentBanner || defaultBg;
    
    // 全屏背景 (如果设置了专属背景就用专属的，否则跟 Banner 保持一致，再否则用默认)
    const bgUrl = globalData.momentPageBg || (globalData.momentBanner || defaultBg);
    mBgLayer.style.backgroundImage = `url(${bgUrl})`;

    // 文字信息
    mName.innerText = globalData.momentName || defaultName;
    mHandle.innerText = globalData.momentHandle || defaultHandle;
    mBio.innerText = globalData.momentBio || defaultBio;
}

// --- 视觉切换逻辑 (点击图片触发) ---
function changeMomentVisual(type) {
    // 记录当前的上传类型，供 handleBeautifyImageUpdate 使用
    if (type === 'pageBg') {
        uploadContext = { type: 'momentPageBg' };
        if (confirm("【更换全屏背景】\n点击确定：选择本地图片\n点击取消：输入网络链接")) {
            document.getElementById('fileInput').click();
        } else {
            const u = prompt("请输入背景图链接:");
            if (u) handleBeautifyImageUpdate(u);
        }
    } 
    else if (type === 'banner') {
        uploadContext = { type: 'momentBanner' };
        if (confirm("【更换顶部封面(Banner)】\n点击确定：选择本地图片\n点击取消：输入网络链接")) {
            document.getElementById('fileInput').click();
        } else {
            const u = prompt("请输入图片链接:");
            if (u) handleBeautifyImageUpdate(u);
        }
    } 
    else if (type === 'avatar') {
        uploadContext = { type: 'momentAvatar' };
        if (confirm("【更换朋友圈头像】\n点击确定：选择本地图片\n点击取消：输入网络链接")) {
            document.getElementById('fileInput').click();
        } else {
            const u = prompt("请输入头像链接:");
            if (u) handleBeautifyImageUpdate(u);
        }
    }
}

// --- 文字编辑逻辑 (点击文字触发) ---
function editMomentText(field) {
    let elId = "";
    let promptText = "";

    if (field === 'name') {
        elId = 'momentUserName';
        promptText = "修改朋友圈昵称:";
    } else if (field === 'handle') {
        elId = 'momentUserHandle';
        promptText = "修改 ID (Handle):";
    } else if (field === 'bio') {
        elId = 'momentUserBio';
        promptText = "修改个人签名:";
    }

    const el = document.getElementById(elId);
    if (!el) return;
    
    // 获取旧值并弹窗
    const newVal = prompt(promptText, el.innerText);
    
    // 如果用户输入了内容 (不是 null 也不是空字符串)
    if (newVal !== null && newVal.trim() !== "") {
        el.innerText = newVal;
        
        // 保存到对应的独立字段
        if (field === 'name') globalData.momentName = newVal;
        if (field === 'handle') globalData.momentHandle = newVal;
        if (field === 'bio') globalData.momentBio = newVal;
        
        saveData(); // 保存到数据库
    }
}

/* --- 完整修复后的 renderMomentFeed 函数 --- */
function renderMomentFeed() {
    const container = document.getElementById('momentFeedList');
    if (!container) return;
    container.innerHTML = '';

    // 筛选逻辑
    let displayData = [];
    if (currentMomentFilter === 'me') {
        displayData = momentList.filter(m => m.userId === 'me');
    } else {
        displayData = momentList;
    }

    // 空状态提示
    if (displayData.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:40px; color:#666; font-size:13px;">暂时没有动态哦<br>快点击右上角相机发布第一条吧</div>`;
        return;
    }

    // ★★★ 关键：必须保留这个循环，item 就在这里定义 ★★★
    displayData.forEach(item => {
         // 1. 图片网格 HTML (保持不变)
        let imgHtml = '';
        if (item.images && item.images.length > 0) {
            imgHtml = `<div class="mp-img-grid">`;
            const isSingle = item.images.length === 1;
            item.images.forEach(src => {
                imgHtml += `<img src="${src}" class="mp-img-item ${isSingle ? 'single' : ''}" onclick="showPhotoDescription('查看大图', event)">`;
            });
            imgHtml += `</div>`;
        }

        // 2. 评论区生成 (保持不变)
        let commentsHtml = '';
        const hasComments = item.comments && item.comments.length > 0;
        commentsHtml = `<div class="mp-comments-box" id="comment-box-${item.id}" style="display: ${hasComments ? 'block' : 'none'}">`;
        
        if (hasComments) {
            item.comments.forEach((c, index) => {
                const isReply = c.content.startsWith('回复 ');
                
                // ★★★ 修改核心：使用了 div.mp-cmt-body 包裹文字，div.mp-cmt-del 独立在右边 ★★★
                commentsHtml += `
                    <div class="mp-comment-item">
                        <!-- 左边：点击回复 -->
                        <div class="mp-cmt-body" onclick="handleUserComment('${item.id}', '${c.name}', event)">
                            <span class="mp-cmt-name">${c.name}</span>${isReply ? ' ' : '：'}<span class="mp-cmt-content">${c.content}</span>
                        </div>
                        
                        <!-- 右边：点击删除 -->
                        <div class="mp-cmt-del" onclick="deleteComment('${item.id}', ${index}, event)">×</div>
                    </div>`;
            });
        }
        commentsHtml += `</div>`;

        // ★★★ 3. Handle 逻辑修改 ★★★
        let displayHandle = item.handle || ''; 
        let handleAction = ''; // 用于存储点击事件
        let handleStyle = '';  // 用于存储样式

        if (item.userId === 'me') {
            // "我"的逻辑：跟随全局设置，不可直接点击修改
            displayHandle = globalData.momentHandle || '@me';
        } else {
            // "角色"的逻辑：
            // 1. 如果没有存过handle，默认用 @名字
            if (!displayHandle) displayHandle = '@' + item.userName;
            
            // 2. 添加点击修改事件
            handleAction = `onclick="editMomentHandle('${item.id}', event)"`;
            // 3. 添加鼠标手型，提示可点击
            handleStyle = `style="cursor: pointer;"`;
        }

        // 4. 生成卡片 HTML
        const card = document.createElement('div');
        card.className = 'moment-post-card';
        card.innerHTML = `
            <img src="${item.userAvatar}" class="mp-avatar">
            <div class="mp-content-col">
                <div class="mp-header">
                    <div class="mp-name-group">
                        <div class="mp-name">${item.userName}</div>
                        <!-- ★★★ 这里加入了 handleAction 和 handleStyle ★★★ -->
                        <div class="mp-post-handle" ${handleAction} ${handleStyle}>${displayHandle}</div>
                    </div>
                    <div class="mp-time">${item.time}</div>
                </div>
                <div class="mp-text">${item.content}</div>
                ${imgHtml}
                
                <div class="mp-actions">
                    <div class="mp-action-btn ${item.isLiked ? 'liked' : ''}" onclick="toggleMomentLike('${item.id}')">
                        <i class="${item.isLiked ? 'fas' : 'far'} fa-heart"></i> ${item.likes || 0}
                    </div>
                    <div class="mp-action-btn" onclick="handleUserComment('${item.id}', null, event)">
                        <i class="far fa-comment"></i> 评论
                    </div>
                    <div class="mp-action-btn" onclick="deleteMoment('${item.id}')">
                        <i class="fas fa-trash"></i>
                     </div>
                </div>
                ${commentsHtml}
            </div>
        `;
        container.appendChild(card);
    });
}

// --- 切换 Tab (朋友圈 / 我的) ---
function switchMomentTab(type, el) {
    currentMomentFilter = type;
    document.querySelectorAll('.moment-tab-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    renderMomentFeed();
}

// --- 发布动态相关 ---
function openMomentPublish() {
    document.getElementById('mpInputText').value = '';
    document.getElementById('mpPreviewSrc').src = '';
    document.getElementById('mpImgPreview').style.display = 'none';
    tempMomentImg = null;
    document.getElementById('momentPublishModal').classList.add('show');
}

function closeMomentPublish() {
    document.getElementById('momentPublishModal').classList.remove('show');
}

function triggerMomentImgUpload() {
    document.getElementById('momentImgInput').click();
}

function handleMomentImgSelect(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            tempMomentImg = e.target.result;
            document.getElementById('mpPreviewSrc').src = tempMomentImg;
            document.getElementById('mpImgPreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
    input.value = '';
}

function confirmPublishMoment() {
    const text = document.getElementById('mpInputText').value.trim();
    if (!text && !tempMomentImg) {
        alert("写点什么或者发张图吧~");
        return;
    }

    // 获取发布时的头像和名字 (用 Moment 页面的最新数据)
    const myAvatar = document.getElementById('momentUserAvatar').src;
    const myName = document.getElementById('momentUserName').innerText;
    const myHandle = globalData.momentHandle || '@me';

    const newMoment = {
        id: Date.now(),
        userId: 'me',
        userName: myName,
        userAvatar: myAvatar,
        handle: myHandle,
        time: '刚刚',
        content: text,
        images: tempMomentImg ? [tempMomentImg] : [],
        likes: 0,
        isLiked: false
    };

    momentList.unshift(newMoment);
    saveMomentsToDB();
    renderMomentFeed();
    closeMomentPublish();
}

// --- 互动 (点赞/删除) ---
function toggleMomentLike(id) {
    const moment = momentList.find(m => m.id == id);
    if (moment) {
        moment.isLiked = !moment.isLiked;
        if (moment.isLiked) moment.likes++;
        else moment.likes--;
        saveMomentsToDB();
        renderMomentFeed();
    }
}

function deleteMoment(id) {
    if (confirm("确定删除这条动态吗？")) {
        momentList = momentList.filter(m => m.id != id);
        saveMomentsToDB();
        renderMomentFeed();
    }
}

// 辅助保存函数
async function saveMomentsToDB() {
    globalData.moments = momentList;
    await saveData(); 
}

// =========================================
// ★★★ AI 自主生活模拟系统 (Heartbeat) ★★★
// =========================================

// 每 60 秒检查一次 (心跳)
setInterval(() => {
    simulateCharacterLife();
}, 60 * 1000); 

async function simulateCharacterLife() {
    // 1. 检查全局开关
    if (!globalData.autoActivityEnabled) {
        console.log("[后台] 全局开关已关闭，跳过检查");
        return;
    }

    console.log("[后台] 正在检查角色生活状态...");
    const now = Date.now();

    // 2. 获取频率设置 (毫秒)
    // 0=6h, 1=3h, 2=1h
    let intervalMs = 6 * 60 * 60 * 1000; // 默认低频
    const freqSetting = globalData.autoFreq || 0;
    
    if (freqSetting === 1) intervalMs = 3 * 60 * 60 * 1000; // 中频
    if (freqSetting === 2) intervalMs = 1 * 60 * 60 * 1000; // 高频

    // 3. 获取允许的角色列表
    const allowedIds = globalData.autoAllowedCharIds || [];

    // 4. 遍历所有角色
    for (const chat of chatList) {
        // 如果该角色没被勾选，直接跳过
        if (!allowedIds.includes(chat.id)) continue;

        // 获取上次发动态或说话的时间 (如果没有，默认为很久以前)
        const lastActionTime = chat.lastMomentTime || 0;
        const timeDiff = now - lastActionTime;

        // ★ 核心判定：是否达到时间间隔
        if (timeDiff >= intervalMs) {
            const isOverdue = timeDiff > (intervalMs * 1.5);
            
            if (isOverdue || Math.random() < 0.4) {
                console.log(`[后台] ${chat.name} 触发独立行动 (间隔满足)`);
                
                await triggerAiSocialAction(chat, 'life');
                
            }
        }
    }
}

// =========================================
// ★★★ [修改] AI 社交行为触发器 (朋友圈) ★★★
// =========================================
// =========================================
// ★★★ [修改核心] AI 社交行为触发器 (支持私聊/朋友圈/电话) ★★★
// =========================================
async function triggerAiSocialAction(chat, source = 'chat') {
    const apiKey = document.getElementById('apiKey').value;
    const endpoint = document.getElementById('apiEndpoint').value;
    const model = document.getElementById('apiModel').value;
    
    if (!apiKey) return;

    console.log(` [${source === 'life' ? '自主生活' : '聊天触发'}] 正在为 [${chat.name}] 生成自主行为...`);
    
    // 聊天摘要
    const recentChat = chat.messages.slice(-5).map(m => `${m.isSelf ? '用户' : '我'}: ${m.text}`).join('\n');
    
    // 注入世界书
    const wbContext = typeof getWorldBookContext === 'function' ? getWorldBookContext(chat, recentChat) : "";

    let contextPrompt = "";
    if (source === 'life') {
        contextPrompt = `
【触发模式】：这是你根据自己的生活节奏自主发起的行为（用户可能不在）。
【你的状态】：请结合你的【人设】和【世界观】，想象你现在正在做什么，或者是否想念用户。
`;
    } else {
        contextPrompt = `
【触发模式】：这是你刚结束与用户对话后的有感而发。
【最近聊天摘要】：
${recentChat}
`;
    }

    // 获取朋友圈上下文
    const userMoments = typeof momentList !== 'undefined' ? momentList.filter(m => m.userId === 'me').slice(0, 3) : [];
    let userMomentContext = "用户近期没有发朋友圈。";
    if (userMoments.length > 0) {
        userMomentContext = "用户最近发布的朋友圈：\n";
        userMoments.forEach(m => {
            userMomentContext += `- [动态ID: ${m.id}]: ${m.content} (时间:${m.time})\n`;
        });
    }

    const systemPrompt = `
你现在是“${chat.name}”，正在使用手机。
${getFullPersona(chat)}

${wbContext ? `【必须遵守的世界观设定】：\n${wbContext}\n` : ''}

${contextPrompt}

【用户动态】
${userMomentContext}

【任务目标】
根据当前模式、时间、世界观及你对用户的情感浓度，决定执行以下**其中一项**操作：

1. **POST (发动态)**: 
   - 分享你的生活，必须符合你的【世界观】。
   - 生活感强，口语化。

2. **COMMENT (评论)**: 
   - 评论用户的最新动态（如果有关联的话）。
   - 必须简短、自然。

3. **CALL (发起语音通话)**: 
   - 这是一个增进感情的绝佳方式。
   - 如果你觉得文字已经无法表达当下的心情，或者单纯**很想听听user的声音**，请不要犹豫，直接发起通话。
   - 就像真实的恋人/好友一样自然。

4.**REPLY (回复评论)**: 如果上面显示【你收到了评论】，且你觉得需要回复用户，请选择此项。

5. **NONE**: 
   - 此时此刻在忙，或者觉得没必要打扰用户。

【输出格式】(纯JSON，严禁Markdown)
- 发消息: {"action": "CHAT", "content": "..."}
- 发动态: {"action": "POST", "content": "..."}
- 评论: {"action": "COMMENT", "targetId": 123, "content": "..."} 
- 打电话: {"action": "CALL", "reason": "..."}
- 无操作: {"action": "NONE"}
`;

    try {
        const response = await fetch(`${endpoint}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: model,
                messages: [{ role: "user", content: systemPrompt }],
                temperature: 0.85 
            })
        });

        const data = await response.json();
        let resultRaw = data.choices[0].message.content;
        
        // JSON 清洗逻辑
        resultRaw = resultRaw.replace(/```json/gi, '').replace(/```/g, '').trim();
        const jsonStart = resultRaw.indexOf('{');
        const jsonEnd = resultRaw.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) resultRaw = resultRaw.substring(jsonStart, jsonEnd + 1);

        const result = JSON.parse(resultRaw);

        // ============================
        // ★★★ 核心新增：CHAT 分支 (已修复分气泡逻辑) ★★★
        // ============================
        if (result.action === 'CHAT' && result.content) {
            console.log(`[自主行为] ${chat.name} 决定发送消息: ${result.content}`);
            
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
            
            const segments = result.content.split(/\n+/).map(s => s.trim()).filter(s => s);

            segments.forEach((segText, index) => {
                const newMsg = {
                    text: segText,
                    isSelf: false, // AI发的
                    time: timeStr,
                    timestamp: Date.now() + index, 
                    contentDescription: null
                };
                
                if (!chat.messages) chat.messages = [];
                chat.messages.push(newMsg);
            });
            
            if (segments.length > 0) {
                chat.msg = segments[segments.length - 1];
            } else {
                chat.msg = result.content; // 兜底
            }
            
            chat.time = timeStr;
            chat.lastMomentTime = Date.now(); // 更新活跃时间

            if (!chat.isPinned) {
                chatList = chatList.filter(c => c.id !== chat.id);
                chatList.unshift(chat);
            }
         
            await db.chats.put(chat);
            
            if (currentChatId === chat.id) {
   
                renderMessages(chat);
                const msgContainer = document.getElementById('roomMessages');
                if(msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;
            } else {

                renderChatList(); 
                if (typeof showNotification === 'function') {
                    const notifyText = segments.join(' '); 
                    showNotification(chat, notifyText);
                }
            }

        }
       
        else if (result.action === 'POST' && result.content) {
            const aiHandle = `@${chat.name}`; 
            const newMoment = {
                id: Date.now(),
                userId: chat.id,
                userName: chat.name,
                userAvatar: chat.avatar,
                handle: aiHandle,
                time: '刚刚',
                content: result.content,
                images: [],
                likes: 0,
                isLiked: false,
                comments: []
            };
            momentList.unshift(newMoment);
            chat.lastMomentTime = Date.now();
            await db.chats.put(chat); 
            if(typeof saveMomentsToDB === 'function') saveMomentsToDB();
            if(typeof renderMomentFeed === 'function') renderMomentFeed();
            console.log(`[自主行为] ${chat.name} 发圈: ${result.content}`);

        } 
        // --- 原有的 COMMENT (评论) ---
        else if (result.action === 'COMMENT' && result.targetId && result.content) {
            const targetMoment = momentList.find(m => m.id == result.targetId);
            if (targetMoment) {
                if (!targetMoment.comments) targetMoment.comments = [];
                targetMoment.comments.push({ name: chat.name, content: result.content });
                chat.lastMomentTime = Date.now(); 
                await db.chats.put(chat);
                if(typeof saveMomentsToDB === 'function') saveMomentsToDB();
                if(typeof renderMomentFeed === 'function') renderMomentFeed(); 
                console.log(`[自主行为] ${chat.name} 评论了动态`);
            }
        } 
        // --- 原有的 CALL (打电话) ---
        else if (result.action === 'CALL') {
            console.log(`[自主行为] ${chat.name} 发起语音通话`);
            const nowCall = new Date();
            const timeStrCall = `${String(nowCall.getHours()).padStart(2,'0')}:${String(nowCall.getMinutes()).padStart(2,'0')}`;
            
            chat.messages.push({
                text: `[邀请语音通话] ${result.reason || "想听听你的声音"}`,
                isSelf: false,
                time: timeStrCall,
                timestamp: Date.now(),
                contentDescription: `[${chat.name} 向你发起了语音通话]` 
            });
            chat.msg = `[语音通话邀请]`;
            chat.time = timeStrCall;
            chat.lastMomentTime = Date.now();
            
            await db.chats.put(chat);
            if (currentChatId === chat.id) {
                renderMessages(chat); 
                setTimeout(() => {
                    if(typeof showIncomingCallModal === 'function') showIncomingCallModal(chat, result.reason);
                }, 1000);
            } else {
                 renderChatList();
                 if (typeof showNotification === 'function') showNotification(chat, "[邀请语音通话]");
            }
        }
          
    } catch (e) { console.error("AI 自主行为决策失败:", e); }
}

/* ========================================= */
/* ★★★ 朋友圈评论逻辑 (修复整合版) ★★★ */
/* ========================================= */

let currentInlineInputId = null; 

// 触发评论 (点击“评论”按钮 或 点击某条评论)
function handleUserComment(momentId, replyName = null, event = null) {
    if (event) event.stopPropagation();

    // 1. 智能判断：如果当前输入框已存在
    if (currentInlineInputId === `input-${momentId}`) {
        const existInput = document.getElementById(`input-${momentId}`);
        if(existInput) {
            const currentTarget = existInput.dataset.replyTarget || '';
            const newTarget = replyName || '';
            if (currentTarget === newTarget) {
                existInput.focus();
                return;
            }
        }
    }

    // 2. 清除已存在的输入框
    removeExistingInlineInput();

    // 3. 寻找评论容器盒子
    const boxId = `comment-box-${momentId}`;
    let box = document.getElementById(boxId);
    if (!box) return; 
    
    // 强制显示评论区
    box.style.display = 'block';

    // 4. 创建输入框行容器
    const inputRow = document.createElement('div');
    inputRow.className = 'inline-input-row'; // 这个类名我们在CSS里加了 Flex
    inputRow.id = `row-${momentId}`;

    // 5. 创建输入框
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-moment-input';
    input.id = `input-${momentId}`;
    input.dataset.replyTarget = replyName || '';
    input.placeholder = replyName ? `回复 ${replyName}:` : '评论';
    
    // 回车发送逻辑
    input.onkeydown = function(e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();  
            e.stopPropagation(); 
            submitInlineComment(momentId, replyName, input.value);
        }
    };

    // ★★★ 6. 新增：创建发送按钮 ★★★
    const sendBtn = document.createElement('button');
    sendBtn.innerText = '发送';
    sendBtn.className = 'inline-send-btn';
    // 点击按钮发送
    sendBtn.onclick = function(e) {
        e.stopPropagation();
        submitInlineComment(momentId, replyName, input.value);
    };
    
    // 插入 DOM：先放入输入框，再放入按钮
    inputRow.appendChild(input);
    inputRow.appendChild(sendBtn);
    box.appendChild(inputRow);

    // 7. 聚焦并滚动可见
    setTimeout(() => {
        input.focus();
        if(input.scrollIntoView) {
            input.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 50);
    
    currentInlineInputId = `input-${momentId}`;
}

function submitInlineComment(momentId, replyName, text) {
    uploadContext = null;

    const content = text.trim();
    if (!content) {
        removeExistingInlineInput();
        return;
    }

    const moment = momentList.find(m => m.id == momentId);
    if (!moment) return;

    let myName = "我";
    const nameEl = document.getElementById('momentUserName');
    if (nameEl) myName = nameEl.innerText;

    if (!moment.comments) moment.comments = [];

    let finalContent = content;
    if (replyName) {
        finalContent = `回复 ${replyName}：${content}`;
    }

    moment.comments.push({
        name: myName,
        content: finalContent
    });

    saveMomentsToDB();
    renderMomentFeed(); 
    
    currentInlineInputId = null;
}

// ★★★ 新增：删除评论逻辑 ★★★
function deleteComment(momentId, commentIndex, event) {
    if (event) event.stopPropagation(); // 防止触发回复

    // 简单确认
    if (!confirm("确定删除这条评论吗？")) return;

    // 找到动态
    const moment = momentList.find(m => m.id == momentId);
    if (moment && moment.comments) {
        // 删掉对应索引的评论
        moment.comments.splice(commentIndex, 1);
        
        // 保存并刷新
        saveMomentsToDB();
        renderMomentFeed();
    }
}
// 移除输入框逻辑 (包含空列表隐藏背景的处理)
function removeExistingInlineInput() {
    if (currentInlineInputId) {
        // 从 ID "input-123" 解析出 "row-123"
        const rowId = currentInlineInputId.replace('input-', 'row-');
        const row = document.getElementById(rowId);
        
        // 移除 DOM
        if (row) row.remove();
        
        // 解析 momentId
        const momentId = currentInlineInputId.replace('input-', '');
        const m = momentList.find(x => x.id == momentId);
        
        // 核心检查：如果移除了输入框后，该动态实际上没有评论，则应该把灰色的评论区背景再次隐藏起来
        if (m && (!m.comments || m.comments.length === 0)) {
            const box = document.getElementById(`comment-box-${momentId}`);
            if (box) box.style.display = 'none';
        }

        currentInlineInputId = null;
    }
}

// 全局监听：点击空白处取消输入
document.addEventListener('click', function(e) {
    if (currentInlineInputId) {
        const input = document.getElementById(currentInlineInputId);
        // 如果点击的目标不是输入框本身，也不是输入框内部的文字
        if (input && e.target !== input) {
            removeExistingInlineInput();
        }
    }
});
/* --- script.js - 新增函数 --- */

// 点击修改角色发布的动态 Handle
function editMomentHandle(momentId, event) {
    // 阻止冒泡，防止触发卡片的其他点击效果
    if(event) event.stopPropagation();

    // 找到对应的动态
    const moment = momentList.find(m => m.id == momentId);
    if (!moment) return;

    // 获取当前显示的 handle 作为默认值
    const currentVal = moment.handle || ('@' + moment.userName);

    // 弹出输入框
    const newVal = prompt("自定义该角色的 ID (Handle):", currentVal);

    // 如果用户输入了内容并点击确定
    if (newVal !== null && newVal.trim() !== "") {
        moment.handle = newVal.trim(); // 更新内存数据
        saveMomentsToDB();             // 保存到数据库
        renderMomentFeed();            // 刷新列表显示
    }
}

function openHeartVoice() {
    const chat = chatList.find(c => c.id === currentChatId);
    if (!chat) return;

    // 1. 设置头像
    const avatarEl = document.getElementById('hvAvatar');
    if(avatarEl) avatarEl.src = chat.avatar;
    
    // 2. 获取心声数据 (如果还没有生成过，就用默认占位符)
    const voiceData = chat.currentHeartVoice || {
        mbti: "未知 | 神秘",
        quote: "还没开始聊天呢...",
        content: "（在这个潮湿的雨季，我还在等待与你的第一次对话）",
        mutter: "✧˖° waiting ˖°",
        bottomText: "回忆是暗潮涌竄在潮湿栖寒的雨季，从骨缝深处传来疼痛牵扯呼吸" // ★ 默认文案
    };

    // 3. 填充数据
    document.getElementById('hvName').innerText = `Hi 我是@${chat.name}`;
    document.getElementById('hvTags').innerText = `◎${voiceData.mbti || 'MBTI'}`;
    document.getElementById('hvQuote').innerText = `「${voiceData.quote || '...' }」`;
    document.getElementById('hvMainContent').innerText = voiceData.content || '...';
    document.getElementById('hvMutter').innerText = voiceData.mutter || '✧˖°';
    document.getElementById('hvSign').innerText = `★個人產物島 #島主@${chat.name}`;

    // ★★★ 新增：填充底部文案 ★★★
    const bottomEl = document.getElementById('hvBottomText');
    if (bottomEl) {
        bottomEl.innerText = voiceData.bottomText || voiceData.content || "唯有离别苦不会戛然而止。";
    }

    // 4. 显示动画
    const overlay = document.getElementById('heart-voice-overlay');
    if(overlay) overlay.classList.add('show');
}

function closeHeartVoice() {
    const overlay = document.getElementById('heart-voice-overlay');
    if(overlay) overlay.classList.remove('show');
}

// =========================================
// ★★★ 全新的音乐功能模块 (请确保只有这一份) ★★★
// =========================================

// 1. 保存音乐到数据库 (已添加保活过滤，防止静音音轨存入数据库)
async function saveMusicPlaylist() {
    try {
        await db.playlist.clear(); 
        if (musicPlaylist.length > 0) {
            const tracksToSave = musicPlaylist.filter(track => !track.isKeepAlive);
            
            if (tracksToSave.length > 0) {
                await db.playlist.bulkAdd(tracksToSave);
            }
        }
    } catch (e) { console.error("保存音乐失败:", e); }
}

// 2. 处理本地音乐文件 (选择文件 -> 弹窗起名)
function handleMusicFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 暂存文件
    tempMusicBlob = file;
    // 获取默认文件名
    const defaultName = file.name.replace(/\.[^/.]+$/, "");
    
    // 打开弹窗让用户确认名字
    openGlassPopup('music_upload', defaultName);
    
    // 清空 input 方便下次选同一个文件
    event.target.value = ''; 
}

// 3. 处理网络链接 (输入链接 -> 弹窗起名)
function triggerMusicLink() {
    const menu = document.getElementById('musicPlusMenu');
    if (menu) menu.classList.remove('active');

    const url = prompt("请输入音乐文件的网络链接 (URL):");
    if (!url) return;

    // ★★★ 修复核心：先把 URL 存到全局变量里，别让它丢了 ★★★
    tempMusicUrl = url; 

    // 弹窗起名逻辑复用
    openGlassPopup('music_link_name', '网络音乐');
}

// 4. 删除音乐
function deleteMusic(index, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    if (confirm("确定要删除这首音乐吗？")) {
        if (index === currentMusicIndex) {
            audioPlayer.pause();
            audioPlayer.src = "";
            document.getElementById('main-song-name').innerText = "尚未播放";
            document.getElementById('main-artist-name').innerText = "请点击这里选择音乐";
            const root = document.getElementById('play-btn-root');
            if(root) root.classList.remove('playing');
            currentMusicIndex = -1;
            isPlaying = false;
        } else if (index < currentMusicIndex) {
            currentMusicIndex--;
        }

        musicPlaylist.splice(index, 1);
        saveMusicPlaylist(); // 保存
        renderPlaylist();
    }
}

/* ========================================= */
/* ★★★ 转账功能核心逻辑 ★★★ */
/* ========================================= */

// 1. 打开“转账给对方”的输入弹窗
function openTransferModal() {
    // 如果底部工具栏还没关，先关掉
    const panel = document.getElementById('chatToolsPanel');
    if (panel && panel.classList.contains('active')) toggleChatTools();
    
    const overlay = document.getElementById('transfer-input-overlay');
    document.getElementById('transfer-amount').value = '';
    document.getElementById('transfer-note').value = '';
    
    if(overlay) overlay.classList.add('show');
    // 延时聚焦，提升体验
    setTimeout(() => document.getElementById('transfer-amount').focus(), 100);
}

// 2. 关闭所有转账相关弹窗
function closeTransferModal() {
    const inputOverlay = document.getElementById('transfer-input-overlay');
    const actionOverlay = document.getElementById('transfer-action-overlay');
    if(inputOverlay) inputOverlay.classList.remove('show');
    if(actionOverlay) actionOverlay.classList.remove('show');
}

// 3. 我点击“转账”按钮 -> 发送给 AI
function confirmSendTransfer() {
    const amountVal = document.getElementById('transfer-amount').value;
    const noteVal = document.getElementById('transfer-note').value.trim() || "转账给你";
    
    if (!amountVal || parseFloat(amountVal) <= 0) {
        alert("请输入正确的金额");
        return;
    }

    if (!currentChatId) return;
    const chat = chatList.find(c => c.id === currentChatId);
    if (!chat) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const amountFixed = parseFloat(amountVal).toFixed(2);

    // ★ 构造转账消息
    const msg = {
        id: Date.now(),
        type: 'transfer', // 标记类型
        isSelf: true,     // 我发的
        time: timeStr,
        timestamp: Date.now(),
        amount: amountFixed,
        note: noteVal,
        status: 'pending', // 初始状态：等待处理
        transferBy: 'me',  // 发起人是我
        text: `[转账] ¥${amountFixed}`, // 列表预览用
        contentDescription: `[向对方转账 ¥${amountFixed}，备注：${noteVal}]` // 给AI看的
    };

    chat.messages.push(msg);
    chat.msg = `[转账] ¥${amountFixed}`;
    chat.time = timeStr;
    
    // 置顶聊天
    if (!chat.isPinned) {
        chatList = chatList.filter(c => c.id !== currentChatId);
        chatList.unshift(chat);
    }

    saveData();
    renderMessages(chat);
    closeTransferModal();
}

// 4. AI 收到转账后的反应逻辑 (收下或退还)
async function triggerAiTransferReaction(chat, msgId, amount) {
    const apiKey = document.getElementById('apiKey').value;
    const endpoint = document.getElementById('apiEndpoint').value;
    const model = document.getElementById('apiModel').value;
    
    if (!apiKey) return;

    const systemPrompt = `
你现在收到了用户的一笔转账。
【转账金额】：¥${amount}
${getFullPersona(chat)}

请根据你的人设和当前关系，决定是【收下】(RECEIVE) 还是【退还】(REFUND)。
- 比如：如果是红包或小钱，通常收下。
- 比如：如果还在生气或不想欠人情，可以退还。

请严格输出 JSON 格式：
{
    "action": "RECEIVE" 或 "REFUND",
    "reply": "你对这笔转账的口语回复"
}
`;

    try {
        const response = await fetch(`${endpoint}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: model,
                messages: [{ role: "user", content: systemPrompt }],
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        let content = data.choices[0].message.content;
        
        // 简单提取 JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            
            // 找到刚才那条转账消息，更新状态
            const targetMsg = chat.messages.find(m => m.id === msgId);
            if (targetMsg) {
                if (result.action === 'RECEIVE') targetMsg.status = 'received';
                else targetMsg.status = 'refunded';
            }
            
            // AI 发送回复消息
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
            chat.messages.push({
                text: result.reply,
                isSelf: false,
                time: timeStr,
                timestamp: Date.now()
            });
            
            saveData();
            renderMessages(chat); // 刷新界面，转账卡片状态会变
        }
    } catch (e) {
        console.error("AI 转账处理失败", e);
    }
}

// 5. 点击气泡的处理逻辑
let currentOperatingMsgId = null;

// 注意：这个函数必须挂在 window 上，因为 HTML onclick 会调用它
window.handleTransferClick = function(msgId, event) {
    if(event) event.stopPropagation();
    
    const chat = chatList.find(c => c.id === currentChatId);
    if (!chat) return;
    
    const msg = chat.messages.find(m => m.id == msgId);
    if (!msg) return;

    // 情况A：我发出的转账 -> 只能看，不能点
    if (msg.transferBy === 'me') {
        let statusStr = "等待对方确认";
        if (msg.status === 'received') statusStr = "对方已收款";
        if (msg.status === 'refunded') statusStr = "已被退还";
        // 你可以把这个 alert 去掉，或者换成一个轻提示
        console.log(`转账状态: ${statusStr}`); 
        return;
    }

    // 情况B：AI 发给我的转账 (transferBy === 'ai')
    if (msg.transferBy === 'ai') {
        if (msg.status !== 'pending') {
            alert(`该转账${msg.status === 'received' ? '已收款' : '已退还'}`);
            return;
        }
        
        // 还没处理 -> 弹出操作框
        currentOperatingMsgId = msgId;
        document.getElementById('action-title').innerText = `收到 ${chat.name} 的转账`;
        document.getElementById('action-amount').innerText = msg.amount;
        document.getElementById('action-note').innerText = msg.note || "无备注";
        document.getElementById('transfer-action-overlay').classList.add('show');
    }
};

// 6. 我处理 AI 的转账 (收款/退还)
function handleTransferDecision(action) {
    if (!currentOperatingMsgId || !currentChatId) return;
    
    const chat = chatList.find(c => c.id === currentChatId);
    const msg = chat.messages.find(m => m.id == currentOperatingMsgId);
    
    if (msg && msg.status === 'pending') {
        if (action === 'receive') {
            msg.status = 'received';
        } else {
            msg.status = 'refunded';
        }
        saveData();
        renderMessages(chat); // 刷新气泡显示状态
    }
    closeTransferModal();
    currentOperatingMsgId = null;
}
/* ========================================= */
/* ★★★ 语音通话 (Together) 功能逻辑 ★★★ */
/* ========================================= */

let vcTimerInterval = null;
let vcSeconds = 0;
let isVcConnecting = false;
let activeVoiceCallChatId = null;

// 1. 开启语音通话界面
function startVoiceCallUI() {
    // 关闭工具栏
    toggleChatTools();
    
     const chat = chatList.find(c => c.id === currentChatId);
    if (!chat) return;
    
    activeVoiceCallChatId = chat.id;
    // 填充数据
    document.getElementById('vcCharName').innerText = chat.name;
    document.getElementById('vcCharAvatar').src = chat.avatar;
    
    // ★★★ 修复：优先使用当前聊天设置的自定义头像，如果没有才用全局头像 ★★★
    const globalMeAvatar = document.getElementById('meAvatarImg').src;
    const myAvatar = chat.userAvatar || globalMeAvatar;
    
    document.getElementById('vcUserAvatar').src = myAvatar;
    
    const bgLayer = document.getElementById('vc-bg-layer');
    if (globalData.voiceCallWallpaper) {
        bgLayer.style.backgroundImage = `url(${globalData.voiceCallWallpaper})`;
    } else {
        bgLayer.style.backgroundImage = `url(${chat.avatar})`;
    }

    // 重置状态
    document.getElementById('vcScrollContent').innerHTML = ''; // 清空屏幕文字
    document.getElementById('vcTimer').innerText = "正在接通...";
    isVcConnecting = true;
    vcSeconds = 0;
    
    // 显示界面
    document.getElementById('voice-call-overlay').classList.add('active');

    // 模拟接通逻辑：1.5秒后接通，开始计时，AI说话
    setTimeout(() => {
        startVcTimer();
        triggerVcFirstMessage(chat);
    }, 1500);
}

// ★★★ 新增：挂断电话并结算时长 ★★★
function hangUpVoiceCall() {
    // 1. 停止计时
    if (vcTimerInterval) clearInterval(vcTimerInterval);
    
    // ★★★ 修改：使用 activeVoiceCallChatId 来查找角色，防止你不在聊天室时挂断报错 ★★★
    const targetId = activeVoiceCallChatId || currentChatId;
    const chat = chatList.find(c => c.id === targetId);
    
    if (chat) {
        // 2. 计算时长字符串
        const hours = Math.floor(vcSeconds / 3600);
        const minutes = Math.floor((vcSeconds % 3600) / 60);
        const seconds = vcSeconds % 60;
        
        let durationText = "";
        if (hours > 0) durationText = `${hours}小时${minutes}分`;
        else durationText = `${minutes}分${seconds}秒`;
        
        // 3. 插入记录
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        
        chat.messages.push({
            text: `通话时长 ${durationText}`,
            isSelf: true, 
            time: timeStr,
            timestamp: Date.now(),
            type: 'call_summary' 
        });
        
        // 更新列表预览
        chat.msg = `[通话结束] ${durationText}`;
        chat.time = timeStr;
        
        saveData();
        
        // ★★★ 只有当用户真的在这个聊天室里时，才刷新消息界面 ★★★
        if (currentChatId === chat.id) {
            renderMessages(chat); 
        }
    }
    
    // 4. 关闭界面
    document.getElementById('voice-call-overlay').classList.remove('active');
    document.getElementById('vc-floating-window').style.display = 'none';
    
    // 5. 恢复状态
    isVcConnecting = false;
    vcSeconds = 0;
    
    // ★★★ 最后一步：清空通话锁定ID ★★★
    activeVoiceCallChatId = null;
}

// 2. 最小化/关闭界面
function minimizeVoiceCall() {
    document.getElementById('voice-call-overlay').classList.remove('active');
    // 如果需要后台继续计时，这里就不 clearInterval
    // 但为了演示简单，我们假设关闭就是挂断
    clearInterval(vcTimerInterval);
}

// 3. 计时器逻辑
function startVcTimer() {
    if (vcTimerInterval) clearInterval(vcTimerInterval);
    
    // 初始显示
    updateVcTimerDisplay();
    
    vcTimerInterval = setInterval(() => {
        vcSeconds++;
        updateVcTimerDisplay();
    }, 1000); // 真正每秒跳动
}

function updateVcTimerDisplay() {
    const hours = Math.floor(vcSeconds / 3600);
    const minutes = Math.floor((vcSeconds % 3600) / 60);
    const seconds = vcSeconds % 60; // 虽然UI只要求分钟，但为了真实感内部在走秒
    
    // UI 逻辑：如果不足一小时只显示分钟 (例如：一起通话了 05:20)
    // 网易云风格通常是： 05:20 (分:秒) 或者 超过1小时显示 01:20:30
    
    let timeStr = "";
    const pad = (n) => String(n).padStart(2, '0');
    
    if (hours > 0) {
        timeStr = `一起通话了 ${hours}小时 ${minutes}分钟`;
    } else {
        // 如果是刚刚开始，显示分秒更有即时感
        timeStr = `一起通话了 ${pad(minutes)}:${pad(seconds)}`;
    }
    
    document.getElementById('vcTimer').innerText = timeStr;
}

// 【修改版】第一句开场白
async function triggerVcFirstMessage(chat) {
    // 1. 使用新函数获取干净的上下文
    const recentChat = getCleanChatContext(chat, 20);
    const wbContext = typeof getWorldBookContext === 'function' ? getWorldBookContext(chat, recentChat) : "";
    
    // 2. 判断最后一条消息的时间距离现在多久（毫秒）
    const lastMsg = chat.messages[chat.messages.length - 1];
    const now = Date.now();
    const lastMsgTime = lastMsg ? (lastMsg.timestamp || now) : now;
    const isInstantCall = (now - lastMsgTime) < 5 * 60 * 1000; // 5分钟内算“刚才”

    // 3. 构造 Prompt
    const systemPrompt = `
    [System Command]:
    你现在刚刚接通了与用户的【语音通话】。
    
    ${getFullPersona(chat)}
    
    ${wbContext ? `【世界观/背景设定】：\n${wbContext}\n` : ''}

    【接通电话前的文字聊天记录】：
    ${recentChat}
    
    【当前情境】：
    ${isInstantCall ? '用户是在刚才文字聊天的过程中突然打来的。' : '用户是在很久没说话后突然打来的。'}

    【任务】：
    这是接通电话后的第一句话。
    
    【强制要求】：
    1. **必须衔接上下文**：${isInstantCall ? '严禁开启新话题！必须紧接着刚才文字聊到的内容继续说。比如刚才在聊吃饭，接通就要说“喂？刚才说的那个餐厅...”' : '可以先打招呼，比如“喂？怎么突然想起给我打电话了？”'}。
    2. **极其口语化**：这是电话，不是写信。要有语气词。
    3. **分句输出**：想表达多句话时，请用**换行符**分隔。
    `;
    
    try {
        const apiKey = document.getElementById('apiKey').value;
        const endpoint = document.getElementById('apiEndpoint').value;
        const model = document.getElementById('apiModel').value;
        
        if (!apiKey) {
            addVcMessage("ai", "(请先配置API Key)");
            return;
        }

        const response = await fetch(`${endpoint}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: model,
                messages: [{ role: "user", content: systemPrompt }],
                temperature: 0.85 
            })
        });
        
        const data = await response.json();
        let reply = data.choices[0].message.content.trim();
        reply = reply.replace(/^["']|["']$/g, ''); 

        const segments = reply.split(/\n+/).filter(s => s.trim());
        
        // ★★★ 修改：语音通话首句支持 TTS ★★★
        for (let i = 0; i < segments.length; i++) {
            const segText = segments[i].trim();
            if(!segText) continue;

            let audioUrl = null;
            if (chat.minimaxVoiceId) {
                audioUrl = await fetchMiniMaxTTS(segText, chat.minimaxVoiceId);
            }

            await new Promise(r => setTimeout(r, 500 + segText.length * 50));

            addVcMessage("ai", segText);
            
            if (audioUrl) {
                const audio = new Audio(audioUrl);
                audio.play();
            }
            
            saveToHistory(chat, segText, false);
        }

    } catch (e) {
        console.error(e);
        addVcMessage("ai", "...");
    }
}
function addVcMessage(type, text) {
    const container = document.getElementById('vcScrollContent');
    const row = document.createElement('div');
    row.className = `vc-msg-row ${type}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'vc-msg-text';
    
    // ★★★ 核心修改：将换行符 \n 替换为 <br>，并使用 innerHTML ★★★
    // 同时也处理一下 HTML 转义，防止 AI 输出代码被执行（安全起见）
    let formattedText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, '<br>'); // 将换行符变身

    bubble.innerHTML = formattedText;
    
    row.appendChild(bubble);
    container.appendChild(row);
    
    // 自动滚动到底部
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

function sendVcMsg() {
    const input = document.getElementById('vcInput');
    const text = input.value.trim();
    
    // ★★★ 修改：优先使用 activeVoiceCallChatId ★★★
    const targetId = activeVoiceCallChatId || currentChatId;
    const chat = chatList.find(c => c.id === targetId);
    
    if (!chat) return;

    // ★★★ 分支 A：输入框有字 -> 我说话，AI闭嘴 ★★★
    if (text) {
        // 1. 显示在当前屏幕
        addVcMessage("self", text);
        input.value = ''; // 清空
        
        // 2. 存入历史记录
        saveToHistory(chat, text, true);
    } 
    else {

        const lastMyMsg = chat.messages.filter(m => m.isSelf).slice(-1)[0];
        const contextText = lastMyMsg ? lastMyMsg.text.replace('[语音通话] ', '') : "（沉默）";
        
        generateVcReply(chat, contextText);
    }
}

// 回车发送 (修复版)
function handleVcEnter(e) {
    // 兼容电脑 Enter (key='Enter') 和手机键盘的发送键 (keyCode=13)
    if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault(); // ★ 关键：阻止默认换行，手机上这步很重要
        
        sendVcMsg(); // 调用发送逻辑
        
        // e.target.blur(); // 收起键盘模式
        setTimeout(() => {
            const input = document.getElementById('vcInput');
            if(input) input.focus(); // 保持聚焦模式（推荐）
        }, 10);
    }
}

// 辅助：存入历史
function saveToHistory(chat, text, isSelf) {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    
    chat.messages.push({
        text: `[语音通话] ${text}`, // 加个标记，让主界面知道这是通话内容
        isSelf: isSelf,
        time: timeStr,
        timestamp: Date.now(),
        isHidden: true
    });
    // 更新列表预览
    chat.msg = '[语音通话中]';
    chat.time = timeStr;
    saveData();
}

// 【新增辅助函数】提取干净的聊天上下文
function getCleanChatContext(chat, limit = 20) {
    // 过滤掉加载中或隐藏的消息
    const validMsgs = chat.messages.filter(m => !m.isLoading && !m.isHidden).slice(-limit);
    
    return validMsgs.map(m => {
        let cleanText = m.text;
        
        // 1. 清洗 HTML 图片/表情/语音标签，转为文字描述
        if (m.contentDescription) {
            cleanText = m.contentDescription; // 优先使用已有的描述
        } else {
            if (cleanText.includes('voice-inner-container')) cleanText = '[发送了一条语音]';
            else if (cleanText.includes('chat-sticker-img')) cleanText = '[发送了一个表情包]';
            else if (cleanText.includes('<img')) cleanText = '[发送了一张图片]';
            else if (cleanText.includes('transfer-card')) cleanText = '[发起了转账]';
            else {
                // 去除其他 HTML 标签
                cleanText = cleanText.replace(/<[^>]+>/g, '');
            }
        }
        
        return `${m.isSelf ? '用户' : '我'}: ${cleanText}`;
    }).join('\n');
}

// 【修改版】后续对话生成
async function generateVcReply(chat, userText) {
    const apiKey = document.getElementById('apiKey').value;
    const endpoint = document.getElementById('apiEndpoint').value;
    const model = document.getElementById('apiModel').value;

    // 1. 获取【通话前】的文字聊天记录（作为背景记忆）
    const textHistory = chat.messages
        .filter(m => !m.text.includes('[语音通话]') && !m.isHidden)
        .slice(-20)
        .map(m => {
            // 简单清洗一下
            let txt = m.text.replace(/<[^>]+>/g, '[媒体]'); 
            if(m.contentDescription) txt = m.contentDescription;
            return `(文字记录) ${m.isSelf ? '用户' : '我'}: ${txt}`;
        })
        .join('\n');

    // 2. 获取【通话中】的实时记录
    const callHistory = chat.messages
        .filter(m => m.text && m.text.includes('[语音通话]'))
        .slice(-20) // 获取最近20句语音
        .map(m => {
            const cleanText = m.text.replace('[语音通话] ', '');
            return `(正在通话) ${m.isSelf ? '用户' : '我'}: ${cleanText}`;
        })
        .join('\n');

    const wbContext = typeof getWorldBookContext === 'function' ? getWorldBookContext(chat, userText) : "";

    const systemPrompt = `
    你正在和用户进行【实时语音通话】。
    
    ${getFullPersona(chat)}
    
    ${wbContext ? `【世界观】：\n${wbContext}\n` : ''}
    
    === 记忆库 ===
    【接通电话前的文字聊天背景】(不要重复这部分内容，但要基于此背景进行对话)：
    ${textHistory}
    
    === 当前进程 ===
    【通话记录】：
    ${callHistory}
    
    【用户刚说】："${userText}"
    
    【回复要求】：
    1. **逻辑连贯**：请结合“文字聊天背景”和“当前通话记录”进行回复。不要产生割裂感。
    2. **强制分句**：想说多句话请务必**换行**！每一行一个气泡。
    3. **短句为主**：模拟真实的电话聊天，不要长篇大论。
    4. **禁止**输出动作描写（如 *笑*），只输出声音内容。
    `;

    try {
        const response = await fetch(`${endpoint}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: model,
                messages: [{ role: "user", content: systemPrompt }],
                temperature: 0.75
            })
        });
        const data = await response.json();
        let reply = data.choices[0].message.content.trim();
        
        reply = reply.replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').trim();

        const segments = reply.split(/\n+/).filter(s => s.trim());
        
        for (let i = 0; i < segments.length; i++) {
            const segText = segments[i].trim();
            
            // 1. 生成语音
            let audioUrl = null;
            if (chat.minimaxVoiceId) {
                audioUrl = await fetchMiniMaxTTS(segText, chat.minimaxVoiceId);
            }

            // 2. 模拟语速延迟
            await new Promise(resolve => setTimeout(resolve, 600 + (segText.length * 50))); 
            
            // 3. 上屏
            addVcMessage("ai", segText);
            
            // 4. 播放
            if (audioUrl) {
                const audio = new Audio(audioUrl);
                audio.play();
            }

            saveToHistory(chat, segText, false);
        }
        
    } catch (e) {
        console.error(e);
        addVcMessage("ai", "..."); 
    }
}
// --- ★★★ 新增：悬浮窗逻辑开始 ★★★ ---

// 1. 点击右上角按钮：最小化到悬浮窗
function minimizeVoiceCallToFloat() {
    const targetId = activeVoiceCallChatId || currentChatId;
    const chat = chatList.find(c => c.id === targetId);
    
    if (!chat) return;

    const currentBigAvatar = document.getElementById('vcCharAvatar').src;
    document.getElementById('vc-float-avatar').src = currentBigAvatar;

    // 隐藏大屏通话页
    document.getElementById('voice-call-overlay').classList.remove('active');
    
    // 显示悬浮小窗
    document.getElementById('vc-floating-window').style.display = 'flex';
}

// 2. 点击悬浮窗：恢复全屏通话
function restoreVoiceCallFromFloat() {
    // 隐藏悬浮小窗
    document.getElementById('vc-floating-window').style.display = 'none';
    
    // 显示大屏通话页
    document.getElementById('voice-call-overlay').classList.add('active');
}

// --- ★★★ 悬浮窗逻辑结束 ★★★ ---
/* ========================================= */
/* ★★★ 新增：来电弹窗控制逻辑 ★★★ */
/* ========================================= */

let tempIncomingChatId = null; // 暂存正在打电话的角色ID

// 1. 显示来电弹窗
function showIncomingCallModal(chat, reason) {
    tempIncomingChatId = chat.id;
    
    // 填充数据
    document.getElementById('ic-avatar').src = chat.avatar;
    document.getElementById('ic-name').innerText = chat.name;
    document.getElementById('ic-reason').innerText = reason || "想听听你的声音...";
    
    // 显示弹窗 (复用现有的 CSS 类)
    document.getElementById('incoming-call-overlay').classList.add('show');
    
    // 可选：让手机震动一下提醒
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

// 2. 接听
function acceptIncomingCall() {
    document.getElementById('incoming-call-overlay').classList.remove('show');
    
    // 确保当前聊天对象指向拨打者
    if (tempIncomingChatId) {
        currentChatId = tempIncomingChatId;
        startVoiceCallUI(); // 进入通话界面
    }
}

// 3. 挂断
function rejectIncomingCall() {
    document.getElementById('incoming-call-overlay').classList.remove('show');
    
    if (tempIncomingChatId) {
        const chat = chatList.find(c => c.id === tempIncomingChatId);
        if (chat) {
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
            
            // 插入一条“已拒绝”的消息记录
            chat.messages.push({
                text: "已拒绝通话",
                isSelf: true,
                time: timeStr,
                timestamp: Date.now()
            });
            saveData();
            // 如果正好在看列表，刷新一下
            if (currentChatId === chat.id) renderMessages(chat);
        }
    }
    tempIncomingChatId = null;
}
// --- 新增：消息通知弹窗逻辑 ---
let currentToastTimer = null;
let currentToastChatId = null; // 记录弹窗是哪个角色的

function showNotification(chat, text) {
    const toast = document.getElementById('msg-notification-toast');
    const nameEl = document.getElementById('toast-name');
    const msgEl = document.getElementById('toast-msg');
    const avatarEl = document.getElementById('toast-avatar');
    
    if(!toast) return;

    // 记录ID，方便点击跳转
    currentToastChatId = chat.id;

    // 填充内容
    nameEl.innerText = chat.name;
    
    // 简单清洗一下文本，去掉HTML标签
    let cleanText = text;
    if (text.includes('<img')) cleanText = '[图片]';
    else if (text.includes('voice-inner')) cleanText = '[语音]';
    else cleanText = text.replace(/<[^>]+>/g, '');
    
    msgEl.innerText = cleanText;
    avatarEl.src = chat.avatar;

    // 显示动画
    toast.classList.add('show');
    
    // 手机震动反馈
    if(navigator.vibrate) navigator.vibrate(15);

    // 3秒后自动消失
    if (currentToastTimer) clearTimeout(currentToastTimer);
    currentToastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// 点击弹窗，跳转到该角色的聊天室
function handleToastClick() {
    const toast = document.getElementById('msg-notification-toast');
    if (currentToastChatId) {
        // 关闭弹窗
        toast.classList.remove('show');
        // 打开对应的聊天室
        openChatRoom(currentToastChatId);
    }
}

/* ========================================= */
/* ★★★ 数据管理美化与重置功能 (新增融合版) ★★★ */
/* ========================================= */

// 1. 弹窗开关控制
function openDataModal() {
    const modal = document.getElementById('backup-modal');
    if(modal) {
        modal.style.display = 'flex';
        // 稍微延时加 opacity 动画
        setTimeout(() => modal.style.opacity = '1', 10);
    }
}

function closeDataModal() {
    const modal = document.getElementById('backup-modal');
    if(modal) {
        modal.style.opacity = '0';
        setTimeout(() => modal.style.display = 'none', 300);
    }
}

// 2. 导出备份 (覆盖原有 exportBackup，增强功能)
async function exportBackup() {
    try {
        // ★ 核心修改：只导出你数据库里真实存在的表，防止报错
        const allData = {
            version: "2.0", // 保持版本号兼容
            timestamp: new Date().toISOString(),
            // 你的 Dexie 数据库定义是: chats, globalSettings, apiConfig, playlist
            chats: await db.chats.toArray() || [],
            settings: await db.globalSettings.get('main') || {},
            apiConfig: await db.apiConfig.toArray() || [],
            playlist: await db.playlist.toArray() || [] // 新增音乐列表备份
        };

        const blob = new Blob([JSON.stringify(allData)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // 文件名加上时间戳
        const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, "");
        a.download = `Miu_Backup_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        closeDataModal(); // 导出后关闭弹窗
        
    } catch (e) {
        alert("导出失败: " + e.message);
    }
}

// 4. ★★★ 新增：重置所有数据 (危险操作) ★★★
async function resetAllData() {
    if (confirm("高能预警\n\n此操作将【彻底清除】所有数据，包括：\n- 所有角色和聊天记录\n- 所有设置和API Key\n- 所有音乐和图片\n\n数据一旦清除无法恢复！确定要恢复出厂设置吗？")) {
        
        // 二次确认，防止手滑
        if(confirm("再次确认：真的要全部清空吗？")) {
            try {
                // 彻底删除数据库
                await db.delete();
                alert("数据已全部清除，即将刷新页面重置...");
                
                // 刷新页面，Dexie 会自动重建空数据库
                window.location.reload();
            } catch (err) {
                alert("清除失败: " + err);
            }
        }
    }
}

// =========================================
// ★★★ 系统级通知核心逻辑 (新增) ★★★
// =========================================

// 1. 自动注册 Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('✅ Service Worker 注册成功:', reg.scope))
        .catch(err => console.error('❌ Service Worker 注册失败:', err));
}

// 2. 申请权限的函数 (防抖，防止重复弹)
let isRequestingPerm = false;
function tryRequestNotificationPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') return; // 已经给了就不烦用户
    if (Notification.permission === 'denied') return;  // 拒绝了也不烦
    if (isRequestingPerm) return;

    isRequestingPerm = true;
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            console.log('✅ 通知权限已获取');
            // 可以试发一条，测试用
            // new Notification('通知测试', { body: '系统通知已开启' });
        }
        isRequestingPerm = false;
    });
}

// 3. 绑定“全屏点击”事件：只要用户点了一下屏幕，就顺便申请权限
// 这样就实现了“不需要专门按钮，用着用着就自带了”的效果
document.addEventListener('click', () => {
    tryRequestNotificationPermission();
}, { once: true }); // once: true 表示只执行一次，申请过就不再监听点击了

// 1. 切换全局开关
function toggleAutoActivityGlobal() {
    const toggle = document.getElementById('autoActivityToggle');
    const panel = document.getElementById('autoFreqPanel');
    
    // 1. 切换 UI 状态
    toggle.classList.toggle('checked');
    const isEnabled = toggle.classList.contains('checked');
    
    // 2. 实时更新界面显隐
    if (isEnabled) {
        panel.style.display = 'flex';
        renderAutoCharList(); // 打开时刷新列表
    } else {
        panel.style.display = 'none';
    }

    // ★★★ 核心修复：点击开关后，立刻同步到内存并保存到数据库 ★★★
    if (typeof globalData !== 'undefined') {
        globalData.autoActivityEnabled = isEnabled;
    }
    saveData(); // 强制执行保存
}

// 2. 更新频率文字显示
function updateAutoFreqDisplay(val) {
    const display = document.getElementById('autoFreqDisplay');
    const v = parseInt(val);
    if (v === 0) display.innerText = "低频 (6h)";
    else if (v === 1) display.innerText = "中频 (3h)";
    else display.innerText = "高频 (1h)";
}

// 3. 渲染角色勾选列表
function renderAutoCharList() {
    const container = document.getElementById('autoCharListBody');
    if (!container) return;
    container.innerHTML = '';
    
    // 获取已保存的允许列表 (存的是 ID 数组)
    const allowedIds = globalData.autoAllowedCharIds || [];

    chatList.forEach(chat => {
        const item = document.createElement('div');
        item.className = 'auto-char-item';
        
        const isChecked = allowedIds.some(id => id == chat.id) ? 'checked' : '';
        
        item.innerHTML = `
            <div class="auto-char-info">
                <img src="${chat.avatar}" class="auto-char-avatar">
                <span class="auto-char-name">${chat.name}</span>
            </div>
            <input type="checkbox" class="auto-char-checkbox" value="${chat.id}" ${isChecked}>
        `;
        container.appendChild(item);
    });
}

// 4. 折叠/展开角色列表
function toggleAutoCharList() {
    const body = document.getElementById('autoCharListBody');
    const arrow = document.getElementById('autoCharArrow');
    
    if (body.style.display === 'none') {
        body.style.display = 'block';
        arrow.classList.replace('fa-chevron-down', 'fa-chevron-up');
    } else {
        body.style.display = 'none';
        arrow.classList.replace('fa-chevron-up', 'fa-chevron-down');
    }
}

// 5. 保存设置
function saveAutoSettings() {
    // 获取开关状态
    const isEnabled = document.getElementById('autoActivityToggle').classList.contains('checked');
    
    // 获取频率
    const freq = document.getElementById('autoFreqSlider').value;
    
    // 获取勾选的角色ID
    const checkboxes = document.querySelectorAll('.auto-char-checkbox:checked');
    const allowedIds = Array.from(checkboxes).map(cb => parseInt(cb.value)); // 确保是数字
    
    // 存入全局数据
    globalData.autoActivityEnabled = isEnabled;
    globalData.autoFreq = parseInt(freq);
    globalData.autoAllowedCharIds = allowedIds;
    
    saveData(); // 保存到数据库
    
    alert("后台活动配置已保存！\n" + (isEnabled ? "AI 将按设定频率开始活跃。" : "后台活动已关闭。"));
}
// ★★★ 新增：自动翻译开关控制 ★★★
function toggleAutoTranslate() {
    const toggle = document.getElementById('autoTranslateToggle');
    toggle.classList.toggle('checked');
    
    // 立即保存状态
    const isEnabled = toggle.classList.contains('checked');
    if (typeof globalData !== 'undefined') {
        globalData.autoTranslateEnabled = isEnabled;
    }
    saveData();
}
// =========================================
// ★★★ MiniMax TTS 核心功能 ★★★
// =========================================
async function fetchMiniMaxTTS(text, voiceId) {
    // 获取全局配置
    const groupId = document.getElementById('minimaxGroupId').value;
    const apiKey = document.getElementById('minimaxApiKey').value;
    
    if (!groupId || !apiKey || !voiceId) {
        console.warn("MiniMax TTS 配置缺失，跳过语音生成");
        return null; // 配置不全，返回空
    }

    const url = `https://api.minimax.chat/v1/text_to_speech?GroupId=${groupId}`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                voice_id: voiceId,
                text: text,
                model: "speech-01", 
                speed: 1.0,
                vol: 1.0,
                pitch: 0
            })
        });

        if (!response.ok) {
            console.error("MiniMax TTS API Error:", response.status);
            return null;
        }

        // MiniMax 返回的是音频流 (Blob)
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        return audioUrl;

    } catch (e) {
        console.error("MiniMax TTS 请求失败:", e);
        return null;
    }
}