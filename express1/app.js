/* ============================================
   悦读 - 随身图书馆
   核心应用逻辑
   ============================================ */

// ==================== 数据模型 ====================

// 书籍封面渐变色库
const gradientColors = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#a18cd1', '#fbc2eb'],
    ['#fccb90', '#d57eeb'],
    ['#e0c3fc', '#8ec5fc'],
    ['#f5576c', '#fd8d32'],
    ['#30cfd0', '#330867'],
    ['#a8edea', '#fed6e3'],
    ['#5ee7df', '#b490ca'],
    ['#c471f5', '#fa71cd'],
    ['#48c6ef', '#6f86d6'],
    ['#feada6', '#f5efef'],
    ['#d299c2', '#fef9d7'],
    ['#89f7fe', '#66a6ff'],
    ['#fddb92', '#d1fdff'],
    ['#9890e3', '#b1f4cf'],
    ['#ebbba7', '#cfc7f8'],
];

// 生成渐变背景
function gradientStyle(index) {
    const colors = gradientColors[index % gradientColors.length];
    return `background: linear-gradient(135deg, ${colors[0]}, ${colors[1]});`;
}

// 书籍数据库
const allBooks = [
    { id: 1, title: '三体', author: '刘慈欣', cate: '科幻', emoji: '🌍', desc: '文化大革命如火如荼进行的同时，军方探寻外星文明的绝秘计划"红岸工程"取得了突破性进展。但在按下发射键的那一刻，历经劫难的叶文洁没有意识到，她彻底改变了人类的命运...', tags: ['科幻', '雨果奖', '硬科幻'], chapters: 35, words: '90万字', rating: 9.4, hot: true, banner: '🔥 雨果奖获奖神作' },
    { id: 2, title: '盗墓笔记', author: '南派三叔', cate: '悬疑', emoji: '🏺', desc: '五十年前，一群长沙土夫子挖到一部战国帛书，残篇中记载了一座奇特的战国古墓的位置。但那群土夫子在地下碰上了诡异事件，几乎全部身亡...', tags: ['悬疑', '冒险', '盗墓'], chapters: 65, words: '120万字', rating: 9.2, hot: true, banner: '⭐ 悬疑探险经典' },
    { id: 3, title: '斗破苍穹', author: '天蚕土豆', cate: '玄幻', emoji: '⚔️', desc: '斗之力，三段！望着测验魔石碑上面闪亮得甚至有些刺眼的五个大字，少年面无表情，唇角有着一抹自嘲，紧握的手掌，因为大力，而导致略微尖锐的指甲深深的刺进了掌心之中...', tags: ['玄幻', '热血', '天才流'], chapters: 1623, words: '530万字', rating: 8.8, hot: true, banner: '🌟 玄幻经典巨作' },
    { id: 4, title: '红楼梦', author: '曹雪芹', cate: '文学', emoji: '🏮', desc: '满纸荒唐言，一把辛酸泪。都云作者痴，谁解其中味？《红楼梦》以贾、史、王、薛四大家族的兴衰为背景，以贾宝玉、林黛玉、薛宝钗的爱情婚姻故事为主线...', tags: ['古典文学', '四大名著', '悲剧'], chapters: 120, words: '96万字', rating: 9.8, hot: true, banner: '📖 中国古典文学巅峰' },
    { id: 5, title: '何以笙箫默', author: '顾漫', cate: '言情', emoji: '💕', desc: '一段年少时的爱恋，牵出一生的纠缠。大学时代的赵默笙阳光灿烂，对法学系大才子何以琛一见钟情，开朗直率的她拔足倒追，终于使才气斐然的何以琛为她停留...', tags: ['言情', '都市', '甜宠'], chapters: 28, words: '25万字', rating: 9.0, hot: true },
    { id: 6, title: '明朝那些事儿', author: '当年明月', cate: '历史', emoji: '📜', desc: '从朱元璋的出身开始写起，到崇祯皇帝自缢明朝灭亡结束。以史料为基础，以年代和具体人物为主线，并加入了小说的笔法，语言幽默风趣...', tags: ['历史', '通俗', '明朝'], chapters: 268, words: '200万字', rating: 9.5, hot: true, banner: '📚 最好读的历史书' },
    { id: 7, title: '解忧杂货店', author: '东野圭吾', cate: '悬疑', emoji: '🏠', desc: '现代人内心流失的东西，这家杂货店能帮你找回。僻静的街道旁有一家杂货店，只要写下烦恼投进卷帘门的投信口，第二天就会在店后的牛奶箱里得到回答...', tags: ['悬疑', '温情', '治愈'], chapters: 22, words: '20万字', rating: 9.3, hot: false },
    { id: 8, title: '庆余年', author: '猫腻', cate: '玄幻', emoji: '🗡️', desc: '一个年轻的病人，因为一次毫不意外的经历，重生到一个完全不同的世界，成为庆国伯爵府一个并不光彩的私生子。修行无名功诀，踏足京都官场...', tags: ['玄幻', '权谋', '穿越'], chapters: 758, words: '300万字', rating: 9.1, hot: true, banner: '🎬 热播剧原著' },
    { id: 9, title: '流浪地球', author: '刘慈欣', cate: '科幻', emoji: '🚀', desc: '太阳即将毁灭，人类在地球表面建造出巨大的推进器，寻找新的家园。然而宇宙之路危机四伏，为了拯救地球，流浪地球时代的年轻人挺身而出...', tags: ['科幻', '末日', '电影原著'], chapters: 15, words: '12万字', rating: 8.9, hot: false },
    { id: 10, title: '鬼吹灯', author: '天下霸唱', cate: '悬疑', emoji: '🕯️', desc: '胡八一上山下乡来到云南，某日他去河里游泳，意外之下被卷入急流，冲入一个幽深的洞穴中。洞内竟然是一处千年古墓，各种诡异事件由此展开...', tags: ['悬疑', '盗墓', '灵异'], chapters: 56, words: '98万字', rating: 9.0, hot: true },
    { id: 11, title: '平凡的世界', author: '路遥', cate: '文学', emoji: '🌾', desc: '以中国70年代中期到80年代中期十年间为背景，以孙少安和孙少平两兄弟为中心，刻画了当时社会各阶层众多普通人的形象...', tags: ['文学', '现实主义', '茅盾文学奖'], chapters: 54, words: '100万字', rating: 9.6, hot: false },
    { id: 12, title: '天龙八部', author: '金庸', cate: '玄幻', emoji: '🐉', desc: '以北宋哲宗时代为背景，通过宋、辽、大理、西夏、吐蕃等王国之间的武林恩怨和民族矛盾，展现了一幅波澜壮阔的生活画卷...', tags: ['武侠', '经典', '金庸'], chapters: 50, words: '120万字', rating: 9.5, hot: false },
    { id: 13, title: '全职高手', author: '蝴蝶蓝', cate: '热门', emoji: '🎮', desc: '网游荣耀中被誉为教科书级别的顶尖高手叶修，因为种种原因遭到俱乐部的驱逐，离开职业圈的他寄身于一家网吧成了一个小小的网管...', tags: ['电竞', '热血', '游戏'], chapters: 1728, words: '530万字', rating: 8.9, hot: true, banner: '🏆 电竞文天花板' },
    { id: 14, title: '步步惊心', author: '桐华', cate: '言情', emoji: '👘', desc: '繁华都市的喧嚣中，张晓因一场意外穿越到清朝康熙年间，成为了满族贵族少女马尔泰·若曦。她见证了康熙九子夺嫡的历史风云...', tags: ['言情', '穿越', '清朝'], chapters: 38, words: '40万字', rating: 9.0, hot: false },
    { id: 15, title: '长安十二时辰', author: '马伯庸', cate: '历史', emoji: '🏯', desc: '唐天保三载，上元节前夕，长安城混入可疑人员，一场毁灭长安的危机即将爆发。死囚张小敬临危受命，必须在十二时辰内拯救长安...', tags: ['历史', '悬疑', '唐朝'], chapters: 24, words: '35万字', rating: 9.2, hot: true, banner: '🎬 精品剧集原著' },
    { id: 16, title: '雪中悍刀行', author: '烽火戏诸侯', cate: '玄幻', emoji: '❄️', desc: '有个白狐儿脸，佩双刀绣冬春雷，要做那天下第一。湖底有白发老魁爱吃荤。缺门牙老仆背剑匣。还有个骑熊猫扛向日葵的少女...', tags: ['玄幻', '江湖', '烽火'], chapters: 1008, words: '400万字', rating: 9.3, hot: true, banner: '🏔️ 雪中江湖传奇' },
    { id: 17, title: '围城', author: '钱钟书', cate: '文学', emoji: '🏛️', desc: '围在城里的人想逃出来，城外的人想冲进去，对婚姻也罢，职业也罢，人生的愿望大都如此。方鸿渐留学归国后的生活与感情纠葛...', tags: ['文学', '讽刺', '经典'], chapters: 9, words: '25万字', rating: 9.4, hot: false },
    { id: 18, title: '亮剑', author: '都梁', cate: '历史', emoji: '🎖️', desc: '在李云龙独特的战术指挥下，骄横的日军山崎大队全军覆灭。李云龙会同国军358团团长楚云飞闯进日军重兵把守的县城...', tags: ['历史', '战争', '热血'], chapters: 36, words: '45万字', rating: 9.1, hot: false },
    { id: 19, title: '银河帝国', author: '阿西莫夫', cate: '科幻', emoji: '🌌', desc: '人类蜗居在银河系的一个小角落——太阳系，在围绕太阳旋转的第三颗行星上，生活了十多万年之久。人类在这个小小的行星上，建立了两百多个不同的行政区域...', tags: ['科幻', '经典', '太空'], chapters: 45, words: '60万字', rating: 9.5, hot: false },
    { id: 20, title: '白夜行', author: '东野圭吾', cate: '悬疑', emoji: '🌃', desc: '我的天空里没有太阳，总是黑夜，但并不暗，因为有东西代替了太阳。虽然没有太阳那么明亮，但对我来说已经足够。凭借着这份光，我便能把黑夜当成白天...', tags: ['悬疑', '推理', '东野圭吾'], chapters: 13, words: '35万字', rating: 9.4, hot: true, banner: '🔪 东野圭吾巅峰之作' },
];

// 分类数据
const categoryData = [
    { name: '热门', icon: '🔥', count: 128 },
    { name: '玄幻', icon: '⚔️', count: 256 },
    { name: '言情', icon: '💕', count: 342 },
    { name: '悬疑', icon: '🔍', count: 189 },
    { name: '科幻', icon: '🚀', count: 145 },
    { name: '历史', icon: '📜', count: 203 },
    { name: '文学', icon: '📖', count: 167 },
    { name: '武侠', icon: '🐉', count: 98 },
    { name: '都市', icon: '🏙️', count: 215 },
    { name: '游戏', icon: '🎮', count: 76 },
    { name: '轻小说', icon: '📘', count: 134 },
    { name: '更多', icon: '⋯', count: 567 },
];

// 搜索热词
const hotSearchWords = [
    '三体', '盗墓笔记', '斗破苍穹', '凡人修仙传',
    '鬼吹灯', '全职高手', '雪中悍刀行', '剑来',
    '庆余年', '诡秘之主', '大奉打更人', '夜的命名术',
];

// 模拟章节内容
function generateChapterContent(bookId, chapterIndex) {
    const book = allBooks.find(b => b.id === bookId);
    const contents = [
        '夜色如墨，繁星点点。远处的山峦在月光下若隐若现，仿佛一幅泼墨山水画静静地铺展在天地之间。山脚下的村庄早已陷入沉睡，只有偶尔传来的几声犬吠，打破了这宁静的夜。',
        '清晨的第一缕阳光穿过云层，洒在小镇的青石板路上。街边的早点铺子已经升起了袅袅炊烟，豆浆的香气混着油条的酥脆，飘散在微凉的空气中。卖菜的大婶支起了摊位，新鲜的蔬菜上还挂着晶莹的露珠。',
        '深秋的风带着一丝凉意，卷起满地的落叶在空中打着旋儿。枯黄的梧桐叶像一只只金色的蝴蝶，在秋日的午后跳着最后的舞蹈。天空湛蓝如洗，几朵白云悠闲地飘过，仿佛时间在这一刻也放慢了脚步。',
        '雨淅淅沥沥地下着，打在芭蕉叶上发出清脆的声响。空气中弥漫着泥土的芬芳和青草的清香，整个世界像是被洗过一般清新透亮。远处的山峰笼罩在雨雾之中，若隐若现，宛如仙境。',
        '春风轻拂，柳絮纷飞。河边的垂柳抽出了嫩绿的新芽，在微风中轻轻摇曳着柔软的身姿。几只燕子掠过水面，激起一圈圈涟漪，打破了河面的平静。岸边的桃花开得正盛，粉色的花瓣随风飘落。',
    ];

    let text = `<h3>第${chapterIndex + 1}章</h3>\n\n`;
    const paragraphs = 8 + (chapterIndex % 6);
    for (let i = 0; i < paragraphs; i++) {
        const base = contents[i % contents.length];
        const extended = base + '这一切都显得那么和谐而自然，让人忍不住想要停下脚步，静静地感受这份难得的宁静与美好。或许这就是生活最本真的模样——平淡中见真情，细微处有乾坤。';
        text += `<p>${extended}</p>\n\n`;
    }
    return text;
}

// 生成章节列表
function generateChapters(bookId) {
    const book = allBooks.find(b => b.id === bookId);
    const chapters = [];
    for (let i = 0; i < Math.min((book?.chapters || 20), 20); i++) {
        chapters.push({
            num: i + 1,
            title: `第${i + 1}章`,
            isFree: i < 3,
        });
    }
    return chapters;
}

// ==================== 状态管理 ====================
const state = {
    currentPage: 'bookshelf',
    bookshelf: [],         // { bookId, progress, chapterIndex, scrollPos, addedAt }
    currentBook: null,     // 当前阅读的书
    currentChapter: 0,     // 当前章节索引
    nightMode: false,
    fontSize: 18,
    gridView: true,
    currentCate: 'all',
    searchHistory: [],
    readHistory: [],       // 最近阅读记录
    readingGoals: { target: 30, unit: 'minutes' },
    bannerIndex: 0,
    bannerTimer: null,
};

// 从 localStorage 加载状态
function loadState() {
    try {
        const saved = localStorage.getItem('yuedu_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(state, parsed);
        }
    } catch (e) {
        // 静默处理
    }
}

// 保存状态
function saveState() {
    try {
        const toSave = {
            bookshelf: state.bookshelf,
            currentBook: state.currentBook,
            currentChapter: state.currentChapter,
            nightMode: state.nightMode,
            fontSize: state.fontSize,
            gridView: state.gridView,
            searchHistory: state.searchHistory,
            readHistory: state.readHistory,
            readingGoals: state.readingGoals,
        };
        localStorage.setItem('yuedu_state', JSON.stringify(toSave));
    } catch (e) {
        // 静默处理
    }
}

// ==================== 工具函数 ====================

function $(selector) { return document.querySelector(selector); }
function $$(selector) { return document.querySelectorAll(selector); }

function showToast(message) {
    const toast = $('#toast');
    const toastText = $('#toastText');
    toastText.textContent = message;
    toast.style.display = 'block';
    toast.style.animation = 'none';
    toast.offsetHeight;
    toast.style.animation = 'toastFade 2s ease forwards';
    setTimeout(() => { toast.style.display = 'none'; }, 2000);
}

function goToPage(pageName) {
    // 隐藏所有页面
    $$('.page').forEach(p => p.classList.remove('active'));
    // 显示目标页面
    const target = $(`#page-${pageName}`);
    if (target) {
        target.classList.add('active');
        state.currentPage = pageName;
    }
    // 更新底部导航
    $$('.tab-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === pageName);
    });
    // 处理覆盖层页面
    const isOverlay = ['search', 'detail', 'reader'].includes(pageName);
    if (pageName === 'reader') {
        $('#tabBar').style.display = 'none';
        $('#appContainer').style.display = 'none';
    } else {
        $('#tabBar').style.display = '';
        $('#appContainer').style.display = '';
    }
    // 滚动到顶部
    window.scrollTo(0, 0);
    if (target) target.scrollTop = 0;
}

function getBookById(id) {
    return allBooks.find(b => b.id === id);
}

function getShelfBook(bookId) {
    return state.bookshelf.find(s => s.bookId === bookId);
}

function isInShelf(bookId) {
    return state.bookshelf.some(s => s.bookId === bookId);
}

// 计算阅读进度百分比（基于章节）
function calcProgress(bookId, chapterIndex) {
    const book = allBooks.find(b => b.id === bookId);
    if (!book) return 0;
    return Math.round((chapterIndex / Math.max(book.chapters, 1)) * 100);
}

// ==================== 书架渲染 ====================

function renderBookshelf() {
    // 渲染最近阅读
    renderRecentBooks();
    // 渲染书架
    renderShelfGrid();
    // 更新计数
    updateBookCount();
    // 更新个人中心统计
    updateProfileStats();
}

function renderRecentBooks() {
    const container = $('#recentBooks');
    if (!container) return;

    let recentBooks = [];
    if (state.readHistory.length > 0) {
        recentBooks = state.readHistory.slice(0, 8).map(h => {
            const book = getBookById(h.bookId);
            return book ? { ...book, progress: h.progress, chapterIndex: h.chapterIndex } : null;
        }).filter(Boolean);
    }

    if (recentBooks.length === 0) {
        // 无最近阅读，显示推荐
        recentBooks = allBooks.filter(b => b.hot).slice(0, 6).map(b => ({ ...b, progress: 0, chapterIndex: 0 }));
    }

    container.innerHTML = recentBooks.map((book, i) => {
        const progress = book.progress || 0;
        const progressText = progress > 0 ? `已读 ${progress}%` : '未开始';
        return `
        <div class="recent-card" onclick="navigateToDetail(${book.id})">
            <div class="recent-cover" style="${gradientStyle(i)}">
                <span>${book.emoji}</span>
            </div>
            <div class="recent-title">${book.title}</div>
            <div class="recent-progress-text">${progressText}</div>
            <div class="recent-progress-bar">
                <div class="recent-progress-fill" style="width:${progress}%"></div>
            </div>
        </div>`;
    }).join('');
}

function renderShelfGrid() {
    const grid = $('#bookshelfGrid');
    const empty = $('#bookshelfEmpty');
    if (!grid || !empty) return;

    if (state.bookshelf.length === 0) {
        grid.innerHTML = '';
        grid.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    grid.style.display = '';
    empty.style.display = 'none';
    grid.className = state.gridView ? 'book-grid' : 'book-grid list-view';

    grid.innerHTML = state.bookshelf.map((shelfItem, i) => {
        const book = getBookById(shelfItem.bookId);
        if (!book) return '';
        const progress = calcProgress(book.id, shelfItem.chapterIndex);
        const progressText = progress > 0 ? ` ${progress}%` : '';
        return `
        <div class="book-card" onclick="navigateToReader(${book.id})">
            <div class="book-cover" style="${gradientStyle(i)}">
                <span>${book.emoji}</span>
            </div>
            <div class="book-info">
                <div class="book-title">${book.title}</div>
                <div class="book-author">${book.author}</div>
                ${!state.gridView ? `<div class="book-meta">共${book.chapters}章 · ${book.words}${progressText}</div>` : ''}
            </div>
            ${progress > 0 ? `<div class="book-tag">${progress}%</div>` : ''}
        </div>`;
    }).join('');
}

function updateBookCount() {
    const badge = $('#bookCount');
    if (badge) {
        badge.textContent = state.bookshelf.length;
    }
}

function updateProfileStats() {
    const statRead = $('#statRead');
    const statFinished = $('#statFinished');
    const statHours = $('#statHours');
    if (statRead) statRead.textContent = state.bookshelf.length;
    if (statFinished) {
        const finished = state.bookshelf.filter(s => {
            const book = getBookById(s.bookId);
            return book && calcProgress(book.id, s.chapterIndex) >= 95;
        }).length;
        statFinished.textContent = finished;
    }
    if (statHours) {
        // 估算阅读时长
        const totalChapters = state.bookshelf.reduce((sum, s) => sum + (s.chapterIndex || 0), 0);
        const hours = Math.floor(totalChapters * 0.25);
        statHours.textContent = hours + 'h';
    }
}

// ==================== 书城渲染 ====================

function renderStore(cate = 'all') {
    state.currentCate = cate;
    renderStoreList(cate);
    renderBanner();
}

function renderStoreList(cate) {
    const list = $('#storeList');
    if (!list) return;

    let books = allBooks;
    if (cate && cate !== 'all') {
        books = allBooks.filter(b => b.cate === cate);
    }

    list.innerHTML = books.map((book, i) => `
        <div class="book-list-item" onclick="navigateToDetail(${book.id})">
            <div class="book-list-cover" style="${gradientStyle(i)}">
                <span>${book.emoji}</span>
            </div>
            <div class="book-list-info">
                <div class="book-list-title">${book.title}</div>
                <div class="book-list-author">${book.author} · ${book.words}</div>
                <div class="book-list-desc">${book.desc.substring(0, 60)}...</div>
                <div class="book-list-tags">
                    ${book.tags.map(t => `<span class="book-list-tag">${t}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function renderBanner() {
    const track = $('#bannerTrack');
    const dots = $('#bannerDots');
    if (!track || !dots) return;

    const bannerBooks = allBooks.filter(b => b.banner);
    track.innerHTML = bannerBooks.map((book, i) => `
        <div class="banner-slide" style="${gradientStyle(i + 5)}" onclick="navigateToDetail(${book.id})">
            <div class="banner-text">
                <div class="banner-subtitle">${book.banner}</div>
                <div class="banner-title">${book.title}</div>
                <div class="banner-desc">${book.author} · 评分 ${book.rating}</div>
            </div>
        </div>
    `).join('');

    dots.innerHTML = bannerBooks.map((_, i) => `
        <span class="banner-dot ${i === 0 ? 'active' : ''}" onclick="setBanner(${i})"></span>
    `).join('');

    state.bannerIndex = 0;
    updateBannerPosition();
    startBannerAutoPlay();
}

function updateBannerPosition() {
    const track = $('#bannerTrack');
    const dots = $('#bannerDots');
    if (!track || !dots) return;
    track.style.transform = `translateX(-${state.bannerIndex * 100}%)`;
    $$('.banner-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === state.bannerIndex);
    });
}

function setBanner(index) {
    state.bannerIndex = index;
    updateBannerPosition();
    startBannerAutoPlay();
}

function startBannerAutoPlay() {
    if (state.bannerTimer) clearInterval(state.bannerTimer);
    const bannerBooks = allBooks.filter(b => b.banner);
    if (bannerBooks.length <= 1) return;
    state.bannerTimer = setInterval(() => {
        state.bannerIndex = (state.bannerIndex + 1) % bannerBooks.length;
        updateBannerPosition();
    }, 4000);
}

// ==================== 分类渲染 ====================

function renderCategories() {
    const grid = $('#categoryGrid');
    if (!grid) return;
    grid.innerHTML = categoryData.map(c => `
        <div class="cate-card" onclick="openCategoryFromGrid('${c.name}')">
            <div class="cate-icon">${c.icon}</div>
            <div class="cate-name">${c.name}</div>
            <div class="cate-count">${c.count}本</div>
        </div>
    `).join('');
}

// ==================== 搜索渲染 ====================

function renderSearchPage() {
    renderSearchHistory();
    renderHotSearch();
}

function renderSearchHistory() {
    const historyContainer = $('#historyTags');
    const historySection = $('#searchHistory');
    if (!historyContainer || !historySection) return;

    if (state.searchHistory.length === 0) {
        historySection.style.display = 'none';
        return;
    }
    historySection.style.display = 'block';
    historyContainer.innerHTML = state.searchHistory.map(h => `
        <span class="history-tag" onclick="doSearch('${escapeHtml(h)}')">${escapeHtml(h)}</span>
    `).join('');
}

function renderHotSearch() {
    const hotContainer = $('#hotList');
    if (!hotContainer) return;
    hotContainer.innerHTML = hotSearchWords.map(w => `
        <span class="hot-tag" onclick="doSearch('${escapeHtml(w)}')">${w}</span>
    `).join('');
}

function doSearch(keyword) {
    if (!keyword || !keyword.trim()) return;
    const kw = keyword.trim();

    // 添加到搜索历史
    state.searchHistory = state.searchHistory.filter(h => h !== kw);
    state.searchHistory.unshift(kw);
    if (state.searchHistory.length > 10) {
        state.searchHistory = state.searchHistory.slice(0, 10);
    }
    renderSearchHistory();

    // 执行搜索
    const results = allBooks.filter(b =>
        b.title.includes(kw) || b.author.includes(kw) || b.tags.some(t => t.includes(kw))
    );

    const resultList = $('#searchResultList');
    const resultsSection = $('#searchResults');
    const searchEmpty = $('#searchEmpty');
    const searchHot = $('#searchHot');
    const searchHistory = $('#searchHistory');

    if (results.length === 0) {
        if (resultList) resultList.innerHTML = '';
        if (resultsSection) resultsSection.style.display = 'block';
        if (searchEmpty) searchEmpty.style.display = 'block';
        if (searchHot) searchHot.style.display = 'none';
        if (searchHistory) searchHistory.style.display = 'none';
        return;
    }

    if (searchEmpty) searchEmpty.style.display = 'none';
    if (searchHot) searchHot.style.display = 'none';
    if (searchHistory) searchHistory.style.display = 'none';
    if (resultsSection) resultsSection.style.display = 'block';

    if (resultList) {
        resultList.innerHTML = results.map((book, i) => `
            <div class="book-list-item" onclick="navigateToDetail(${book.id})">
                <div class="book-list-cover" style="${gradientStyle(i)}">
                    <span>${book.emoji}</span>
                </div>
                <div class="book-list-info">
                    <div class="book-list-title">${highlightMatch(book.title, kw)}</div>
                    <div class="book-list-author">${highlightMatch(book.author, kw)} · ${book.words}</div>
                    <div class="book-list-desc">${book.desc.substring(0, 60)}...</div>
                </div>
            </div>
        `).join('');
    }

    saveState();
}

function highlightMatch(text, keyword) {
    const regex = new RegExp(`(${escapeRegex(keyword)})`, 'gi');
    return text.replace(regex, '<span style="color:var(--primary);font-weight:600;">$1</span>');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ==================== 详情页渲染 ====================

function renderDetail(bookId) {
    const book = getBookById(bookId);
    if (!book) return;

    const content = $('#detailContent');
    if (!content) return;

    const inShelf = isInShelf(bookId);
    const shelfItem = getShelfBook(bookId);
    const chapters = generateChapters(bookId);
    const progress = shelfItem ? calcProgress(bookId, shelfItem.chapterIndex) : 0;

    content.innerHTML = `
        <div class="detail-info">
            <div class="detail-cover" style="${gradientStyle(bookId)}">
                <span>${book.emoji}</span>
            </div>
            <div class="detail-book-title">${book.title}</div>
            <div class="detail-book-author">${book.author}</div>
            <div class="detail-book-stats">
                <div class="detail-stat">
                    <div class="detail-stat-num">${book.rating}</div>
                    <div class="detail-stat-label">评分</div>
                </div>
                <div class="detail-stat">
                    <div class="detail-stat-num">${book.chapters}</div>
                    <div class="detail-stat-label">章节</div>
                </div>
                <div class="detail-stat">
                    <div class="detail-stat-num">${book.words}</div>
                    <div class="detail-stat-label">字数</div>
                </div>
                ${progress > 0 ? `
                <div class="detail-stat">
                    <div class="detail-stat-num">${progress}%</div>
                    <div class="detail-stat-label">已读</div>
                </div>` : ''}
            </div>
            <div class="detail-book-desc">${book.desc}</div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">目录预览</div>
            <div class="detail-chapters">
                ${chapters.map((ch, i) => `
                    <div class="detail-chapter-item" onclick="navigateToReaderWithChapter(${bookId}, ${i})">
                        <span><span class="catalog-item-num">${ch.num}.</span> ${ch.title}</span>
                        <span class="chapter-free">${ch.isFree ? '免费' : 'VIP'}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">书籍标签</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                ${book.tags.map(t => `<span style="padding:6px 14px;background:var(--primary-light);color:var(--primary-dark);border-radius:16px;font-size:13px;">${t}</span>`).join('')}
            </div>
        </div>
        <div style="height:80px;"></div>
    `;

    // 更新底部按钮状态
    const addBtn = $('#btnAddShelf');
    if (addBtn) {
        addBtn.textContent = inShelf ? '已加入书架' : '加入书架';
        addBtn.classList.toggle('added', inShelf);
        addBtn.onclick = () => toggleShelf(bookId);
    }

    const readBtn = $('#btnStartRead');
    if (readBtn) {
        readBtn.onclick = () => {
            if (shelfItem) {
                navigateToReader(bookId);
            } else {
                toggleShelf(bookId);
                setTimeout(() => navigateToReader(bookId), 300);
            }
        };
    }
}

function toggleShelf(bookId) {
    if (isInShelf(bookId)) {
        state.bookshelf = state.bookshelf.filter(s => s.bookId !== bookId);
        showToast('已从书架移除');
    } else {
        state.bookshelf.unshift({
            bookId: bookId,
            progress: 0,
            chapterIndex: 0,
            scrollPos: 0,
            addedAt: Date.now(),
        });
        showToast('已加入书架');
    }
    renderDetail(bookId);
    renderBookshelf();
    saveState();
}

// ==================== 阅读器渲染 ====================

function navigateToReader(bookId) {
    const shelfItem = getShelfBook(bookId);
    if (!shelfItem) {
        // 不在书架中，自动添加
        state.bookshelf.unshift({
            bookId: bookId,
            progress: 0,
            chapterIndex: 0,
            scrollPos: 0,
            addedAt: Date.now(),
        });
    }
    const updatedShelf = getShelfBook(bookId);
    state.currentBook = bookId;
    state.currentChapter = updatedShelf ? updatedShelf.chapterIndex : 0;
    goToPage('reader');
    renderReader();
    saveState();
}

function navigateToReaderWithChapter(bookId, chapterIndex) {
    const shelfItem = getShelfBook(bookId);
    if (!shelfItem) {
        state.bookshelf.unshift({
            bookId: bookId,
            progress: 0,
            chapterIndex: chapterIndex,
            scrollPos: 0,
            addedAt: Date.now(),
        });
    } else {
        shelfItem.chapterIndex = chapterIndex;
    }
    state.currentBook = bookId;
    state.currentChapter = chapterIndex;
    goToPage('reader');
    renderReader();
    saveState();
}

function renderReader() {
    const book = getBookById(state.currentBook);
    if (!book) return;

    const title = $('#readerTitle');
    const text = $('#readerText');
    const progress = $('#readerProgress');
    const slider = $('#fontSlider');

    if (title) title.textContent = `${book.title} · 第${state.currentChapter + 1}章`;
    if (text) {
        text.style.fontSize = state.fontSize + 'px';
        text.innerHTML = generateChapterContent(state.currentBook, state.currentChapter);
    }
    if (progress) {
        const pct = calcProgress(state.currentBook, state.currentChapter);
        progress.textContent = `阅读进度 ${pct}%`;
    }
    if (slider) {
        slider.value = state.fontSize;
    }

    // 更新阅读记录
    const shelfItem = getShelfBook(state.currentBook);
    if (shelfItem) {
        shelfItem.chapterIndex = state.currentChapter;
        shelfItem.progress = calcProgress(state.currentBook, state.currentChapter);
    }

    // 更新阅读历史
    state.readHistory = state.readHistory.filter(h => h.bookId !== state.currentBook);
    state.readHistory.unshift({
        bookId: state.currentBook,
        chapterIndex: state.currentChapter,
        progress: calcProgress(state.currentBook, state.currentChapter),
        timestamp: Date.now(),
    });
    if (state.readHistory.length > 20) {
        state.readHistory = state.readHistory.slice(0, 20);
    }

    renderCatalog();
    saveState();
}

function renderCatalog() {
    const book = getBookById(state.currentBook);
    if (!book) return;

    const catalogList = $('#catalogList');
    if (!catalogList) return;

    const chapters = generateChapters(book.id);
    catalogList.innerHTML = chapters.map((ch, i) => `
        <div class="catalog-item ${i === state.currentChapter ? 'active' : ''}" onclick="jumpToChapter(${i})">
            <span><span class="catalog-item-num">${ch.num}.</span> ${ch.title}</span>
            <span class="chapter-free">${ch.isFree ? '免费' : 'VIP'}</span>
        </div>
    `).join('');
}

function jumpToChapter(index) {
    state.currentChapter = index;
    renderReader();
    closeCatalog();
    const readerContent = $('#readerContent');
    if (readerContent) readerContent.scrollTop = 0;
}

function nextChapter() {
    const book = getBookById(state.currentBook);
    if (!book) return;
    const maxCh = Math.min((book.chapters || 20), 20);
    if (state.currentChapter < maxCh - 1) {
        state.currentChapter++;
        renderReader();
        const readerContent = $('#readerContent');
        if (readerContent) readerContent.scrollTop = 0;
        showToast(`跳至第${state.currentChapter + 1}章`);
    } else {
        showToast('已经是最后一章了');
    }
}

function prevChapter() {
    if (state.currentChapter > 0) {
        state.currentChapter--;
        renderReader();
        const readerContent = $('#readerContent');
        if (readerContent) readerContent.scrollTop = 0;
        showToast(`返回第${state.currentChapter + 1}章`);
    } else {
        showToast('已经是第一章了');
    }
}

function openCatalog() {
    const modal = $('#catalogModal');
    if (modal) {
        renderCatalog();
        modal.style.display = 'block';
    }
}

function closeCatalog() {
    const modal = $('#catalogModal');
    if (modal) modal.style.display = 'none';
}

// ==================== 导航函数 ====================

function navigateToDetail(bookId) {
    goToPage('detail');
    renderDetail(bookId);
}

function navigateToSearch() {
    goToPage('search');
    renderSearchPage();
    // 聚焦输入框
    setTimeout(() => {
        const input = $('#searchInput');
        if (input) input.focus();
    }, 300);
}

function openCategoryFromGrid(cateName) {
    goToPage('store');
    renderStore(cateName);
    // 更新分类标签高亮
    $$('.cate-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.cate === cateName);
    });
}

// ==================== 夜间模式 ====================

function toggleNightMode() {
    state.nightMode = !state.nightMode;
    document.body.classList.toggle('night-mode', state.nightMode);
    const switchToggle = $('#switchNightMode');
    if (switchToggle) {
        switchToggle.classList.toggle('active', state.nightMode);
    }
    const nightBtn = $('#btnNightMode2');
    if (nightBtn) {
        nightBtn.textContent = state.nightMode ? '☀️' : '🌙';
    }
    saveState();
}

// ==================== 事件绑定 ====================

function initEvents() {
    // 底部导航切换
    $$('.tab-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            if (['bookshelf', 'store', 'category', 'profile'].includes(page)) {
                goToPage(page);
                if (page === 'bookshelf') renderBookshelf();
                if (page === 'store') renderStore(state.currentCate);
                if (page === 'category') renderCategories();
                if (page === 'profile') updateProfileStats();
            }
        });
    });

    // 书架页事件
    $('#btnEdit')?.addEventListener('click', () => {
        showToast('长按书籍卡片即可编辑');
    });
    $('#btnGridToggle')?.addEventListener('click', () => {
        state.gridView = !state.gridView;
        renderShelfGrid();
        const btn = $('#btnGridToggle');
        if (btn) btn.textContent = state.gridView ? '≡' : '⊞';
        saveState();
    });
    $('#btnSort')?.addEventListener('click', () => {
        state.bookshelf.sort((a, b) => b.addedAt - a.addedAt);
        renderShelfGrid();
        showToast('已按收藏时间排序');
    });

    // 搜索栏点击
    $('#goSearch')?.addEventListener('click', navigateToSearch);
    $('#goSearch2')?.addEventListener('click', navigateToSearch);
    $('#goSearch3')?.addEventListener('click', navigateToSearch);

    // 书城分类标签
    $$('.cate-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const cate = tab.dataset.cate;
            $$('.cate-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderStoreList(cate);
            state.currentCate = cate;
        });
    });

    // 搜索页事件
    $('#searchCancel')?.addEventListener('click', () => {
        goToPage('bookshelf');
        const input = $('#searchInput');
        if (input) input.value = '';
        const results = $('#searchResults');
        const hot = $('#searchHot');
        const history = $('#searchHistory');
        if (results) results.style.display = 'none';
        if (hot) hot.style.display = 'block';
        if (history) history.style.display = 'block';
    });

    $('#searchInput')?.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        const clearBtn = $('#searchClear');
        if (clearBtn) clearBtn.style.display = val ? 'block' : 'none';
        if (val) {
            doSearch(val);
        } else {
            const results = $('#searchResults');
            const hot = $('#searchHot');
            const history = $('#searchHistory');
            if (results) results.style.display = 'none';
            if (hot) hot.style.display = 'block';
            if (history) history.style.display = 'block';
        }
    });

    $('#searchInput')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            doSearch(e.target.value);
            e.target.blur();
        }
    });

    $('#searchClear')?.addEventListener('click', () => {
        const input = $('#searchInput');
        if (input) {
            input.value = '';
            input.focus();
        }
        const clearBtn = $('#searchClear');
        const results = $('#searchResults');
        const hot = $('#searchHot');
        const history = $('#searchHistory');
        if (clearBtn) clearBtn.style.display = 'none';
        if (results) results.style.display = 'none';
        if (hot) hot.style.display = 'block';
        if (history) history.style.display = 'block';
    });

    $('#clearHistory')?.addEventListener('click', () => {
        state.searchHistory = [];
        renderSearchHistory();
        saveState();
        showToast('搜索历史已清空');
    });

    // 详情页事件
    $('#detailBack')?.addEventListener('click', () => {
        goToPage('bookshelf');
        renderBookshelf();
    });

    // 阅读器事件
    $('#readerBack')?.addEventListener('click', () => {
        goToPage('bookshelf');
        renderBookshelf();
        saveState();
    });

    $('#readerMenu')?.addEventListener('click', () => {
        openCatalog();
    });

    $('#btnPrevChapter')?.addEventListener('click', prevChapter);
    $('#btnNextChapter')?.addEventListener('click', nextChapter);
    $('#btnCatalog')?.addEventListener('click', openCatalog);
    $('#btnNightMode2')?.addEventListener('click', toggleNightMode);
    $('#btnBookmark')?.addEventListener('click', () => {
        showToast('书签已添加 ✓');
    });

    $('#catalogOverlay')?.addEventListener('click', closeCatalog);
    $('#catalogClose')?.addEventListener('click', closeCatalog);

    $('#fontSlider')?.addEventListener('input', (e) => {
        state.fontSize = parseInt(e.target.value);
        const readerText = $('#readerText');
        if (readerText) readerText.style.fontSize = state.fontSize + 'px';
        const fontSizeDisplay = $('#fontSizeDisplay');
        const labels = { 14: '小', 18: '默认', 22: '大', 28: '超大' };
        if (fontSizeDisplay) {
            fontSizeDisplay.textContent = labels[state.fontSize] || state.fontSize + 'px';
        }
        saveState();
    });

    // 阅读器左右滑动翻页
    let touchStartX = 0;
    const readerContent = $('#readerContent');
    if (readerContent) {
        readerContent.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });
        readerContent.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 80) {
                if (diff > 0) {
                    nextChapter();
                } else {
                    prevChapter();
                }
            }
        });
    }

    // 键盘翻页（桌面端）
    document.addEventListener('keydown', (e) => {
        if (state.currentPage === 'reader') {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                nextChapter();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                prevChapter();
            }
        }
    });

    // 个人中心事件
    $('#switchNightMode')?.addEventListener('click', toggleNightMode);

    $('#menuReadingGoals')?.addEventListener('click', () => {
        const goals = ['每日10分钟', '每日30分钟', '每日1小时', '每日2小时'];
        const current = state.readingGoals.target;
        const idx = goals.findIndex(g => g.includes(current.toString()));
        const next = (idx + 1) % goals.length;
        const nextGoal = goals[next];
        const targetNum = parseInt(nextGoal);
        state.readingGoals.target = isNaN(targetNum) ? 30 : targetNum;
        state.readingGoals.unit = nextGoal.includes('小时') ? 'hours' : 'minutes';
        const goalDisplay = $('#goalDisplay');
        if (goalDisplay) goalDisplay.textContent = nextGoal;
        saveState();
        showToast(`阅读目标已设为：${nextGoal}`);
    });

    $('#menuNotes')?.addEventListener('click', () => {
        showToast('笔记功能开发中，敬请期待');
    });

    $('#menuBookmarks')?.addEventListener('click', () => {
        showToast('书签管理功能开发中');
    });

    $('#menuFontSize')?.addEventListener('click', () => {
        const sizes = [14, 16, 18, 20, 22, 24, 28];
        const currentIdx = sizes.indexOf(state.fontSize);
        const next = (currentIdx + 1) % sizes.length;
        state.fontSize = sizes[next];
        const labels = { 14: '小', 16: '较小', 18: '默认', 20: '较大', 22: '大', 24: '很大', 28: '超大' };
        const fontSizeDisplay = $('#fontSizeDisplay');
        if (fontSizeDisplay) {
            fontSizeDisplay.textContent = labels[state.fontSize] || state.fontSize + 'px';
        }
        saveState();
        showToast(`阅读字体：${labels[state.fontSize]}`);
    });

    $('#menuClearCache')?.addEventListener('click', () => {
        state.bookshelf = [];
        state.readHistory = [];
        state.searchHistory = [];
        saveState();
        updateBookCount();
        updateProfileStats();
        renderBookshelf();
        const cacheSizeDisplay = $('#cacheSizeDisplay');
        if (cacheSizeDisplay) cacheSizeDisplay.textContent = '0KB';
        showToast('缓存已清除');
    });

    $('#menuAbout')?.addEventListener('click', () => {
        showToast('悦读 v1.0.0 · 随身图书馆');
    });

    // 头像点击
    $('#avatar')?.addEventListener('click', () => {
        const emojis = ['😊', '🤓', '😎', '🥳', '🤩', '🧐', '😇', '🤠', '👩‍🎓', '🧑‍💻'];
        const current = $('#avatar').textContent;
        const idx = emojis.indexOf(current);
        const next = (idx + 1) % emojis.length;
        $('#avatar').textContent = emojis[next];
        const profileName = $('#profileName');
        const names = ['爱读书的你', '阅读达人', '博学的书虫', '文艺青年', '沉浸书海', '知识探索者', '书香门第', '阅读冒险家', '学霸附体', '终身学习者'];
        if (profileName) profileName.textContent = names[next];
        showToast(`身份切换：${names[next]}`);
    });

    // 分享按钮
    $$('.detail-share').forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('已复制分享链接');
        });
    });
}

// ==================== 初始化 ====================

function init() {
    loadState();

    // 应用夜间模式
    if (state.nightMode) {
        document.body.classList.add('night-mode');
    }
    const switchToggle = $('#switchNightMode');
    if (switchToggle) {
        switchToggle.classList.toggle('active', state.nightMode);
    }
    const nightBtn = $('#btnNightMode2');
    if (nightBtn) {
        nightBtn.textContent = state.nightMode ? '☀️' : '🌙';
    }

    // 初始渲染
    goToPage('bookshelf');
    renderBookshelf();
    renderCategories();

    // 绑定事件
    initEvents();

    // 更新状态栏时间
    updateStatusTime();
    setInterval(updateStatusTime, 30000);
}

function updateStatusTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeEl = $('#statusTime');
    if (timeEl) timeEl.textContent = `${hours}:${minutes}`;
}

// 启动应用
document.addEventListener('DOMContentLoaded', init);