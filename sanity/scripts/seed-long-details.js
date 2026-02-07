import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2025-02-06', dataset: 'production' })

const imageUrl = (seed, width, height) =>
  `https://picsum.photos/seed/${seed}/${width}/${height}`

const block = (text) => ({
  _type: 'block',
  style: 'normal',
  markDefs: [],
  children: [
    {
      _type: 'span',
      text,
      marks: [],
    },
  ],
})

const toBlocks = (paragraphs) => paragraphs.map((text) => block(text))

const countries = [
  {
    _id: 'sample-country-frostgate',
    _type: 'country',
    name: '霜石联邦',
    slug: { _type: 'slug', current: 'sample-frostgate' },
    summary:
      '霜石联邦坐落在北境高原与冻湖之间，以岩脊与寒风为疆界。城镇围绕盐泉与冰裂谷建立，冬季漫长而清澈，居民在严苛气候中形成重誓守约、重技艺传承的传统。联邦的驿路以石碑与风标指引，远行者被要求在每一处风口留名，记录来路与去向。冰雪并非阻隔，而是使誓约更清晰的背景。',
    featuredRegions: [{ _type: 'reference', _ref: 'sample-region-froststep' }],
    image: imageUrl('country-frostgate', 1400, 900),
  },
  {
    _id: 'sample-country-crimson-tide',
    _type: 'country',
    name: '赤霞海国',
    slug: { _type: 'slug', current: 'sample-crimson-tide' },
    summary:
      '赤霞海国由群岛与外海构成，海雾与红霞在黎明前最为壮阔。港城依潮汐修建，潮落时露出古老的礁道与灯塔基座。海国重视航线与契约，渔场、贸易与海风同样被视为可继承的遗产，水手们将航海日志视作家族的记忆之书。群岛间的灯号是海国的语言。',
    featuredRegions: [
      { _type: 'reference', _ref: 'sample-region-vermilion-reef' },
    ],
    image: imageUrl('country-crimson-tide', 1400, 900),
  },
  {
    _id: 'sample-country-mistwood',
    _type: 'country',
    name: '雾林公国',
    slug: { _type: 'slug', current: 'sample-mistwood' },
    summary:
      '雾林公国的疆域被常年雾气笼罩，林地深处以树冠交错为天幕。聚落隐藏在高地与溪谷之间，擅长利用林相与光影作为防线。居民崇尚静默与守护，药草、木材与古道的维护是他们的日常，连歌谣也被编排成记录路径的密码。公国相信森林会回应耐心。',
    featuredRegions: [{ _type: 'reference', _ref: 'sample-region-mistweald' }],
    image: imageUrl('country-mistwood', 1400, 900),
  },
  {
    _id: 'sample-country-embersand',
    _type: 'country',
    name: '烬沙王域',
    slug: { _type: 'slug', current: 'sample-embersand' },
    summary:
      '烬沙王域位于干热的沙海与黑色岩脊之间，白昼炽烈而夜晚冷冽。王域以移动哨站与地下蓄水井维持交通，沙海里的每一条路都依赖风向与星象判断。使者善于在荒原中辨别遗迹与安全水源，守望与引路成为一种荣耀。人们以记录对抗遗忘。',
    featuredRegions: [{ _type: 'reference', _ref: 'sample-region-ashdune' }],
    image: imageUrl('country-embersand', 1400, 900),
  },
  {
    _id: 'sample-country-starbay',
    _type: 'country',
    name: '星湾同盟',
    slug: { _type: 'slug', current: 'sample-starbay' },
    summary:
      '星湾同盟由多座海湾城邦结成，夜空清澈时群星映在海面如同光之航图。这里崇尚协作与远航，灯塔与浮标被视作同盟的语言。沿岸学院记录潮汐与星轨，培养能够解读海图、风向与海鸟迁徙的引航者。每一盏远灯都是归途的承诺。',
    featuredRegions: [
      { _type: 'reference', _ref: 'sample-region-starlit-archipelago' },
    ],
    image: imageUrl('country-starbay', 1400, 900),
  },
]

const regions = [
  {
    _id: 'sample-region-froststep',
    _type: 'region',
    name: '霜阶高原',
    slug: { _type: 'slug', current: 'sample-froststep' },
    summary:
      '霜阶高原以层叠的岩台得名，风在台阶之间回旋，形成稳定的寒流与回声。高原边缘分布着古老的石碑群，记录过往誓约与迁徙路线，是联邦最重要的路标体系。',
    country: { _type: 'reference', _ref: 'sample-country-frostgate' },
    featuredHeroes: [{ _type: 'reference', _ref: 'sample-hero-yaohan' }],
    image: imageUrl('region-froststep', 1400, 900),
  },
  {
    _id: 'sample-region-vermilion-reef',
    _type: 'region',
    name: '绯湾礁海',
    slug: { _type: 'slug', current: 'sample-vermilion-reef' },
    summary:
      '绯湾礁海由密集珊瑚礁与潜沟组成，潮汐在礁缝间产生独特的红色反光。水手在这里学习辨识暗流与潮门，航线多靠口传与灯号维系。',
    country: { _type: 'reference', _ref: 'sample-country-crimson-tide' },
    featuredHeroes: [{ _type: 'reference', _ref: 'sample-hero-qilan' }],
    image: imageUrl('region-vermilion-reef', 1400, 900),
  },
  {
    _id: 'sample-region-mistweald',
    _type: 'region',
    name: '雾语林地',
    slug: { _type: 'slug', current: 'sample-mistweald' },
    summary:
      '雾语林地树冠交织，雾气沿树干缓缓攀升，形成可遮蔽视线的层层薄幕。林地遍布药草与潮湿岩壁，是公国最重要的采集与守护区域。',
    country: { _type: 'reference', _ref: 'sample-country-mistwood' },
    featuredHeroes: [{ _type: 'reference', _ref: 'sample-hero-linqi' }],
    image: imageUrl('region-mistweald', 1400, 900),
  },
  {
    _id: 'sample-region-ashdune',
    _type: 'region',
    name: '烬脊沙海',
    slug: { _type: 'slug', current: 'sample-ashdune' },
    summary:
      '烬脊沙海的沙丘颜色深沉，风暴来临时像燃尽后的余烬。岩脊与旧河床在沙下隐现，行者需靠风标与星影判断方向。',
    country: { _type: 'reference', _ref: 'sample-country-embersand' },
    featuredHeroes: [{ _type: 'reference', _ref: 'sample-hero-sharen' }],
    image: imageUrl('region-ashdune', 1400, 900),
  },
  {
    _id: 'sample-region-starlit-archipelago',
    _type: 'region',
    name: '星澜群岛',
    slug: { _type: 'slug', current: 'sample-starlit-archipelago' },
    summary:
      '星澜群岛星罗棋布，海流在岛间回旋，形成多条光亮的夜航通道。岛民以灯塔、信标与歌声传递讯息，夜间尤为繁忙。',
    country: { _type: 'reference', _ref: 'sample-country-starbay' },
    featuredHeroes: [{ _type: 'reference', _ref: 'sample-hero-zixun' }],
    image: imageUrl('region-starlit-archipelago', 1400, 900),
  },
]

const heroes = [
  {
    _id: 'sample-hero-yaohan',
    _type: 'hero',
    name: '耀翰',
    title: '雪碑守望者',
    slug: { _type: 'slug', current: 'sample-yaohan' },
    faction: '霜石誓碑团',
    roles: ['守望', '引路'],
    region: { _type: 'reference', _ref: 'sample-region-froststep' },
    country: { _type: 'reference', _ref: 'sample-country-frostgate' },
    bio: toBlocks([
      '耀翰出生在霜阶高原的石碑村，自幼就被教导如何辨识风向与回声。他的家族世代守护誓碑，负责在风雪后修复碑文，确保旅人仍能找到旧路。',
      '成年后，耀翰加入誓碑团，带领小队巡行高原边境。他擅长在视线被雪幕遮蔽时，通过脚下的震动判断地形，并以石钉与布标重新标记通行路径。',
      '他认为誓约不是束缚，而是人们在荒野中彼此信任的方式。耀翰常在风口停下，替未归的旅人补刻姓名，让后来者知道有人曾在此守望。',
      '如今的耀翰已成为高原上最可靠的引路人之一。他带着旧誓与新名穿行于雪与石之间，相信每一块被修复的碑文都能让高原更像一个家。',
    ]),
    image: imageUrl('hero-yaohan', 900, 1200),
  },
  {
    _id: 'sample-hero-linqi',
    _type: 'hero',
    name: '林祈',
    title: '树影行者',
    slug: { _type: 'slug', current: 'sample-linqi' },
    faction: '雾林守护会',
    roles: ['巡林', '采集'],
    region: { _type: 'reference', _ref: 'sample-region-mistweald' },
    country: { _type: 'reference', _ref: 'sample-country-mistwood' },
    bio: toBlocks([
      '林祈在雾语林地长大，熟悉每一条被苔藓覆盖的旧路。他的耳朵能够分辨风穿过树冠时的细微变化，也能从鸟鸣中听出林地是否安全。',
      '作为守护会的一员，他负责巡查药草生长的区域，避免过度采集。每当有人迷失在浓雾中，他会以树脂与布条编成临时灯标，引导对方回到林道。',
      '林祈相信森林是活着的记忆，脚下的落叶与树根会记录来访者的心意。他不轻易拔剑，更愿意用熟悉的路径与耐心化解误解。',
      '在公国的传说里，林祈被称为“听风的人”。他把每一次巡行当作与雾林对话，守护着这片常年低语的森林。',
    ]),
    image: imageUrl('hero-linqi', 900, 1200),
  },
  {
    _id: 'sample-hero-qilan',
    _type: 'hero',
    name: '岐岚',
    title: '潮汐破浪者',
    slug: { _type: 'slug', current: 'sample-qilan' },
    faction: '赤霞航团',
    roles: ['引航', '侦探'],
    region: { _type: 'reference', _ref: 'sample-region-vermilion-reef' },
    country: { _type: 'reference', _ref: 'sample-country-crimson-tide' },
    bio: toBlocks([
      '岐岚出生在绯湾礁海的渔港，从小在潮汐与风向之间学会判断时机。他的父亲是一名引航师，常在夜里带他看潮门的变化。',
      '加入赤霞航团后，岐岚专门负责高风险航线的试探。他能从海面细小的纹路判断暗流位置，并在礁区为船队开辟安全通道。',
      '他将航海日志视为誓约的一部分，细致记录每一次潮汐的异常变化。岐岚相信，只有把海的脾气写下来，才能让后来的人少走弯路。',
      '在赤霞海国，人们称他为“破浪者”，不仅因为他敢于穿越险滩，更因为他愿意把经验留给每一位后来者。',
    ]),
    image: imageUrl('hero-qilan', 900, 1200),
  },
  {
    _id: 'sample-hero-sharen',
    _type: 'hero',
    name: '沙刃',
    title: '烬沙侦猎者',
    slug: { _type: 'slug', current: 'sample-sharen' },
    faction: '烬沙哨骑',
    roles: ['侦查', '护送'],
    region: { _type: 'reference', _ref: 'sample-region-ashdune' },
    country: { _type: 'reference', _ref: 'sample-country-embersand' },
    bio: toBlocks([
      '沙刃出生在烬脊沙海边缘的哨站，从幼年开始就学习辨别风暴的方向与强度。他擅长在夜里行走，依靠星象与风沙的声纹判断地形。',
      '成为哨骑后，沙刃负责为商队与使者探路。他习惯在沙丘上插下短刃作为标记，提醒后来者此处有暗坑或旧井。',
      '沙刃相信沙海会吞没遗忘，因此他不断把行走过的路线写进记忆与地图。他说，只要有人愿意记录，荒原就不会变成空白。',
      '在王域的传说里，沙刃是能在风暴中听见远方水声的人。他的沉默与精准使他成为最可靠的引路者之一。',
    ]),
    image: imageUrl('hero-sharen', 900, 1200),
  },
  {
    _id: 'sample-hero-zixun',
    _type: 'hero',
    name: '子勋',
    title: '远灯引航者',
    slug: { _type: 'slug', current: 'sample-zixun' },
    faction: '星湾引航会',
    roles: ['引航', '记录'],
    region: { _type: 'reference', _ref: 'sample-region-starlit-archipelago' },
    country: { _type: 'reference', _ref: 'sample-country-starbay' },
    bio: toBlocks([
      '子勋在星澜群岛长大，夜里总是跟随父辈巡查灯塔。他熟悉每一处光标的节奏，也能从海鸟的航迹判断风向。',
      '加入引航会后，子勋负责远航船队的夜间联络。他会用特定的光序与旗语传递消息，让不同岛屿的船只在黑夜里保持队形。',
      '子勋相信灯塔不仅是导航工具，也是记忆的象征。他常在灯下记录故事，把航海者的经历写成短诗，留给后来的人。',
      '人们称他为“远灯引航者”，因为他愿意在最黑的夜里点亮最远的光，把同盟的海面连成一张温暖的网。',
    ]),
    image: imageUrl('hero-zixun', 900, 1200),
  },
]

const creatures = [
  {
    _id: 'sample-creature-icehorn',
    _type: 'creature',
    name: '冰角鹿',
    slug: { _type: 'slug', current: 'sample-icehorn-stag' },
    species: '高原鹿科',
    category: 'animal',
    region: { _type: 'reference', _ref: 'sample-region-froststep' },
    country: { _type: 'reference', _ref: 'sample-country-frostgate' },
    bio: toBlocks([
      '冰角鹿生活在霜阶高原的风口地带，鹿角呈半透明冰晶状，能在晨光中折射出冷白色光芒。它们在寒季沿着旧碑路线迁徙，避开风雪最烈的区域。',
      '传说冰角鹿的角能够感应风向变化，高原守望者会观察鹿群的行踪来判断天气。它们的皮毛厚实，蹄印密而浅，能在薄冰上保持平衡。',
      '冬季结束后，冰角鹿会在岩台边缘停留，舔舐岩石上的盐霜，为下一段迁徙储备矿物。当地人尊重它们，避免在繁殖季穿越鹿群路线。',
    ]),
    image: imageUrl('creature-icehorn', 1200, 900),
  },
  {
    _id: 'sample-creature-tideglider',
    _type: 'creature',
    name: '潮翼鱼',
    slug: { _type: 'slug', current: 'sample-tideglider' },
    species: '远洋滑鳍鱼',
    category: 'animal',
    region: { _type: 'reference', _ref: 'sample-region-vermilion-reef' },
    country: { _type: 'reference', _ref: 'sample-country-crimson-tide' },
    bio: toBlocks([
      '潮翼鱼栖息于绯湾礁海的暗流之上，胸鳍宽大，能借潮汐滑行于水面，像银色的风帆。它们在黎明时成群跃出海面，形成短暂的银雨。',
      '渔民会观察潮翼鱼跃起的方向，判断暗流走向与潮门变化。它们以浮游生物为食，常在潮汐交汇处停留，形成自然的航线指示。',
      '在赤霞海国的传说里，潮翼鱼是海的信使。只有心怀敬意的船只才能见到它们的群跃，因此航团把潮翼鱼视为幸运的预兆。',
    ]),
    image: imageUrl('creature-tideglider', 1200, 900),
  },
  {
    _id: 'sample-creature-lumaflora',
    _type: 'creature',
    name: '光穗草',
    slug: { _type: 'slug', current: 'sample-lumaflora' },
    species: '荧穗草属',
    category: 'plant',
    region: { _type: 'reference', _ref: 'sample-region-mistweald' },
    country: { _type: 'reference', _ref: 'sample-country-mistwood' },
    bio: toBlocks([
      '光穗草是雾语林地的常见药草，叶片细长，穗状花序在夜晚会散发柔和的光。它们多生长在潮湿岩壁与溪流边，形成微弱的光带。',
      '守护会会在采集时保留根部，避免过度采伐。光穗草的汁液可用于缓解低温带来的僵硬感，也能作为引路标记，被系在树枝上指示方向。',
      '雾林居民把光穗草称作“夜里的低语”，因为它们的光线会随风微微摇曳，像是在回应林地深处的声音。',
    ]),
    image: imageUrl('creature-lumaflora', 1200, 900),
  },
  {
    _id: 'sample-creature-mistfungus',
    _type: 'creature',
    name: '雾缕菌',
    slug: { _type: 'slug', current: 'sample-mistbound-fungus' },
    species: '雾绢菌',
    category: 'plant',
    region: { _type: 'reference', _ref: 'sample-region-mistweald' },
    country: { _type: 'reference', _ref: 'sample-country-mistwood' },
    bio: toBlocks([
      '雾缕菌附着在古树根部，菌丝如薄绢般延展，能在雾气浓度高时快速生长。菌盖呈浅灰色，表面覆有细密纹路。',
      '林地医生会采集雾缕菌制作敷料，用以吸附伤口湿气。由于菌丝容易在干燥环境中断裂，采集必须在清晨完成。',
      '雾缕菌被视为森林的呼吸之一，居民认为它们能帮助树木抵御外来的腐蚀，因此采集前会先向树根献上清水。',
    ]),
    image: imageUrl('creature-mistfungus', 1200, 900),
  },
  {
    _id: 'sample-creature-embermote',
    _type: 'creature',
    name: '烬灵砂',
    slug: { _type: 'slug', current: 'sample-embermote' },
    species: '炽砂灵',
    category: 'element',
    region: { _type: 'reference', _ref: 'sample-region-ashdune' },
    country: { _type: 'reference', _ref: 'sample-country-embersand' },
    bio: toBlocks([
      '烬灵砂是烬脊沙海中罕见的元素生灵，常在风暴后出现在沙丘背风面。它们像细小的红色砂粒，会在夜晚缓缓聚拢，形成微弱光点。',
      '哨骑认为烬灵砂的出现意味着地下水源接近，因为它们喜欢靠近残存湿气的地带。行者会跟随光点寻找安全驻扎处。',
      '烬灵砂对声音敏感，风吹动金属时会惊散。向导在观察时会卸下饰物，以免惊扰这些稀少的生灵。',
    ]),
    image: imageUrl('creature-embermote', 1200, 900),
  },
]

const stories = [
  {
    _id: 'sample-story-frost-oath',
    _type: 'story',
    title: '霜阶誓约',
    slug: { _type: 'slug', current: 'sample-frost-oath' },
    relatedHeroes: [{ _type: 'reference', _ref: 'sample-hero-yaohan' }],
    relatedRegions: [{ _type: 'reference', _ref: 'sample-region-froststep' }],
    relatedCreatures: [
      { _type: 'reference', _ref: 'sample-creature-icehorn' },
    ],
    content: toBlocks([
      '霜阶高原的冬天来得极早。风从北境的石脊下卷过，携着细碎的冰粒在空中打着旋，像在试探旅人的意志。耀翰站在旧碑前，用指尖抚过被风磨平的刻痕，他知道这条路已经有很久没有人走过了。',
      '誓碑团的规矩简单却严苛：每一块碑都要在风雪后修复，每一个名字都要在路口被留存。耀翰带着小队穿行高原，背囊里装着刻刀与石粉。夜里他们围着短火取暖，火光映出石粉细白的尘，像一场迟来的雪。',
      '清晨的风口最冷，风标抖动的方向告诉他们今日将有更强的寒流。耀翰坚持继续前行，因为他在旧记里看到一个陌生的名字——那是十年前未归的旅者。他想把那人的归途写回碑上，给后来者一个可以对话的线索。',
      '在风雪的空隙里，他们见到了冰角鹿的身影。鹿群缓慢穿过岩台，鹿角折射着暗淡的光。耀翰停下脚步，观察它们的行走路线。他知道鹿群不会踏入危险的裂谷，因此沿着鹿蹄印划出新的标记。',
      '午后，他们抵达一处被风雪掩埋的碑。石面破碎，刻痕几乎消失。耀翰将石粉混入温水，细细填补裂缝，再把名字重新刻上。他不认识那个名字，却依照誓约把它写得工整，因为誓约不是属于一个人，而是属于这片高原。',
      '傍晚时分，一位迷路的牧羊人出现在风口。耀翰没有责怪，只是把新刻的碑文指给对方看，告诉他可以沿着石碑回到村落。牧羊人低声道谢，那一刻，碑文像从石头中重新醒来。',
      '夜幕降临，他们回到营地。风仍在呼啸，但耀翰的心里多了一份安定。他把今天的路线写进日志，记下鹿群的方向与风标的变化。霜阶誓约在他手中变得具体：不是口头的承诺，而是一段段被写下、被守护的路。',
      '在高原的星空下，耀翰把刻刀收进囊中。他知道明天还会有新的风雪、新的路标，也许还有新的名字等待被刻上。只要有人愿意守望，誓约就不会消失，霜阶的路就会一直通向远方。',
    ]),
    image: imageUrl('story-frost-oath', 1400, 900),
  },
  {
    _id: 'sample-story-mistwood-whisper',
    _type: 'story',
    title: '雾林低语',
    slug: { _type: 'slug', current: 'sample-mistwood-whisper' },
    relatedHeroes: [{ _type: 'reference', _ref: 'sample-hero-linqi' }],
    relatedRegions: [{ _type: 'reference', _ref: 'sample-region-mistweald' }],
    relatedCreatures: [
      { _type: 'reference', _ref: 'sample-creature-lumaflora' },
      { _type: 'reference', _ref: 'sample-creature-mistfungus' },
    ],
    content: toBlocks([
      '雾语林地的清晨总是比别处更慢一些。雾气贴着地面缓缓移动，像在替林子把昨夜的梦收起。林祈背着药箱沿着溪谷前行，脚下的湿土柔软，树根的纹理在雾中若隐若现。',
      '守护会的职责并不显赫，更多时候是细碎的日常：检查林道，记录药草生长的位置，提醒采集者留下根系。林祈熟悉每一处光穗草的分布，他把它们当作林地的星辰，静静记在心里。',
      '这一天，他听到远处传来陌生的脚步声。雾气里有人迷失，声音却带着焦急。林祈没有立刻呼喊，而是取出树脂在树干上画出一个小小的方向符号，再把光穗草系在枝梢，让那束柔光穿过雾气。',
      '迷路的是一名年轻的木匠，他在寻找传说中的雾缕菌，想为家人制作防潮的屋顶。林祈带他来到古树根部，教他辨别菌丝的纹路与采集的节奏。林祈说，森林不拒绝人，但也不喜欢被急促对待。',
      '午后，雾渐渐稀薄，阳光在树冠间落下斑驳的光点。木匠在离开前向树根献上一碗清水，林祈则在日志里记下新的路径与一处水洼的变化。雾林的低语在他的笔下变得具体而温和。',
      '他们沿着溪流折返，林祈指着不远处的光穗草说，那些微光是给迟到的旅人准备的。木匠点点头，明白守护不仅是站在前方阻拦，也是为后来的人点亮一点点路。',
      '傍晚时分，林祈独自站在林道边，听着风与叶子摩擦的声响。他明白守护不仅仅是阻止破坏，更是让每一次来访都能与林地建立一种缓慢而持久的联系。',
      '雾林低语，他用行动回应。每一次脚步、每一次记录，都让这片森林的路径变得更清晰。林祈知道，总有人会在雾里迷路，而他要做的，就是让那些人看见回家的光。',
    ]),
    image: imageUrl('story-mistwood-whisper', 1400, 900),
  },
  {
    _id: 'sample-story-crimson-tide',
    _type: 'story',
    title: '赤霞回潮',
    slug: { _type: 'slug', current: 'sample-crimson-tide' },
    relatedHeroes: [{ _type: 'reference', _ref: 'sample-hero-qilan' }],
    relatedRegions: [
      { _type: 'reference', _ref: 'sample-region-vermilion-reef' },
    ],
    relatedCreatures: [
      { _type: 'reference', _ref: 'sample-creature-tideglider' },
    ],
    content: toBlocks([
      '赤霞海国的黎明常被称作回潮时刻。太阳还未完全升起，红色的光已在礁海上铺开，像潮水一样缓缓退去又轻轻涌回。岐岚站在船首，闻着盐与风的味道，确认潮门的方向。',
      '今天的航程要穿过一段险滩，商队的船只在码头前摇摆不安。岐岚检查了潮汐表，决定等到潮翼鱼群第一次跃起时再启航。他相信海不会说谎，它会用鱼群的轨迹给出答案。',
      '当潮翼鱼像银色的箭矢冲出水面，岐岚举起信旗，船队开始缓缓移动。他在礁区最狭窄的地方放慢速度，用长杆探测暗流，指引后方的船只紧随他的航迹。礁石在水下闪烁着暗红的光。',
      '途中，一阵突如其来的回潮让海面起了不易察觉的横波。岐岚迅速调整航向，将船头对准更深的暗沟。他知道过度抗拒潮汐只会让船陷入涡流，顺势而行才是与海对话的方式。',
      '一艘小船在礁缝间失去平衡，船员惊慌呼喊。岐岚抛出牵引绳，命令船队减速，亲自靠近引导那艘小船脱离险区。他明白航海不仅是计算潮汐，更是守住彼此的信任。',
      '当船队安全穿过险滩，港口的灯塔逐渐清晰。岐岚在日志里写下今日的潮门位置与礁海色泽的变化。他把这些细节视为航海者的誓约——不是给自己看的，而是给那些尚未出海的人。',
      '夜里，岐岚坐在船舷边听潮声。他明白回潮不仅是一种自然现象，也是一种提醒：海总会把人带回到应当铭记的地方。赤霞的光散去又归来，他的心也随之稳住。',
      '当最后一盏灯在港口亮起时，岐岚合上日志。他知道自己只是海国众多引航者中的一员，但每一次写下的潮汐，都会成为后来者的路标。赤霞回潮，海与人都在缓缓回到彼此。',
    ]),
    image: imageUrl('story-crimson-tide', 1400, 900),
  },
  {
    _id: 'sample-story-ashdune-guide',
    _type: 'story',
    title: '烬沙引路人',
    slug: { _type: 'slug', current: 'sample-ashdune-guide' },
    relatedHeroes: [{ _type: 'reference', _ref: 'sample-hero-sharen' }],
    relatedRegions: [{ _type: 'reference', _ref: 'sample-region-ashdune' }],
    relatedCreatures: [
      { _type: 'reference', _ref: 'sample-creature-embermote' },
    ],
    content: toBlocks([
      '烬脊沙海在正午时像一片燃尽的海，热浪从地表升起，远处的岩脊被拉成摇晃的影子。沙刃带着一支商队离开哨站，他知道今天的风向不稳定，必须提前规划停驻点。',
      '一路上，他在沙丘背风面插下短刃，告诉后方的队伍此处可以短暂歇息。每一处标记都对应一段记忆：一次风暴、一次迷途、一次水源的发现。沙刃把这些记忆当作地图的经纬。',
      '傍晚时，风势突然变强，沙粒像细针般扑向面颊。沙刃让队伍靠拢，并示意大家用斗篷遮住眼睛。他抬头看星位，判断风暴将持续多久，再决定是否绕行。',
      '风暴稍息时，沙刃看见沙地上浮现出细小的红光，那是烬灵砂在聚拢。他立刻带队绕过光点，因为那往往意味着地下有残存湿气与脆弱的沙层。对沙刃而言，危险与希望往往同行。',
      '夜里，他们在岩脊下扎营。商队的人靠着火光重拾镇定，沙刃则在地图上画下新的避风路线。他知道，真正的引路不仅是带队穿越沙海，更是把每一次经验传下去。',
      '第二天清晨，队伍抵达一处旧井。沙刃把井口的石圈清理出来，示意大家汲水。他没有多说，只提醒众人把水位记录在册，因为这条线会影响下一次的行程。',
      '沙海的路很容易被风抹去，但沙刃相信，只要有人愿意记录，荒原就不会变成空白。他把昨夜的风向写进日志，把烬灵砂出现的方位画在边角，像在为未来留下细小的路标。',
      '当商队安全抵达城门时，沙刃只是点点头。他不需要掌声，只需要人们记得在沙海里有人守望。烬沙引路人，守的是方向，也守的是人们心中的回程。',
    ]),
    image: imageUrl('story-ashdune-guide', 1400, 900),
  },
  {
    _id: 'sample-story-starbay-lantern',
    _type: 'story',
    title: '星湾远灯',
    slug: { _type: 'slug', current: 'sample-starbay-lantern' },
    relatedHeroes: [{ _type: 'reference', _ref: 'sample-hero-zixun' }],
    relatedRegions: [
      { _type: 'reference', _ref: 'sample-region-starlit-archipelago' },
    ],
    relatedCreatures: [
      { _type: 'reference', _ref: 'sample-creature-tideglider' },
    ],
    content: toBlocks([
      '星澜群岛的夜色很深，海面像一面巨大的镜子，把群星完整地映下来。子勋站在灯塔顶端，检查灯光的节奏。他知道今晚有远航船队返航，必须让灯光保持稳定的呼吸。',
      '引航会的规矩是先听海，再点灯。子勋把耳朵贴在塔壁上，听到远处波浪的回声后，才开始调整灯芯。他把每一次风速与灯光角度记在册中，因为这些细节决定船队能否看见同盟的岸。',
      '当第一艘船靠近时，子勋用旗语与短暂的光序回应。他看见甲板上摇晃的身影，知道那是熟悉的引航师。他们在夜色里无需言语，灯光就是彼此的语言。',
      '海面忽然起了风，浪线被拉得更长。子勋立刻改变光序，提醒船队靠近外侧航道避开暗礁。他知道一盏灯的改变，可能就决定一整支船队的命运。',
      '船队入港后，子勋收起旗子，坐在灯塔边缘写下今日的记录。他在日志里补上一段短诗，描述海面上群星的倒影与船只的影子。他相信文字能让远航不再孤单。',
      '清晨时，他把日志交给学徒，让对方誊写进学院的档案。子勋说，引航不仅是点灯，更是把经验传下去。学徒点头时，他看见自己年轻时的影子。',
      '后来，子勋到港口迎接回来的船员，听他们讲述远方的海流与异域的灯火。他把故事记下来，准备在下一次值守时讲给年轻的学员听，让他们明白灯塔的意义不仅是照亮，更是传递归途的信号。',
      '夜深时，海风渐缓，灯火仍稳稳燃着。子勋站在塔顶，看着光在水面延伸成一条长长的路。他知道，无论船只走得多远，星湾的远灯都会在某个夜晚把他们带回家。',
    ]),
    image: imageUrl('story-starbay-lantern', 1400, 900),
  },
]

async function uploadImage(url, filename) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${url}`)
  }
  const buffer = Buffer.from(await res.arrayBuffer())
  return client.assets.upload('image', buffer, { filename })
}

async function attachImages(docs, fieldName, sizeName) {
  for (const doc of docs) {
    const asset = await uploadImage(doc.image, `${doc._id}-${sizeName}.jpg`)
    doc[fieldName] = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
    delete doc.image
  }
}

async function createAll(docs, label) {
  for (const doc of docs) {
    await client.createOrReplace(doc)
    // eslint-disable-next-line no-console
    console.log(`${label}: ${doc._id}`)
  }
}

async function patchCountryLinks(docs) {
  for (const doc of docs) {
    if (!doc.featuredRegions) continue
    await client
      .patch(doc._id)
      .set({ featuredRegions: doc.featuredRegions })
      .commit()
    // eslint-disable-next-line no-console
    console.log(`country links: ${doc._id}`)
  }
}

async function patchRegionLinks(docs) {
  for (const doc of docs) {
    const updates = {}
    if (doc.country) updates.country = doc.country
    if (doc.featuredHeroes) updates.featuredHeroes = doc.featuredHeroes
    if (Object.keys(updates).length === 0) continue
    await client.patch(doc._id).set(updates).commit()
    // eslint-disable-next-line no-console
    console.log(`region links: ${doc._id}`)
  }
}

async function run() {
  await attachImages(countries, 'mapImage', 'map')
  await attachImages(regions, 'mapImage', 'map')
  await attachImages(heroes, 'portrait', 'portrait')
  await attachImages(creatures, 'portrait', 'portrait')
  await attachImages(stories, 'coverImage', 'cover')

  const countryBase = countries.map(({ featuredRegions, ...rest }) => rest)
  const regionBase = regions.map(({ country, featuredHeroes, ...rest }) => rest)

  await createAll(countryBase, 'country')
  await createAll(regionBase, 'region')
  await createAll(heroes, 'hero')
  await createAll(creatures, 'creature')
  await createAll(stories, 'story')

  await patchRegionLinks(regions)
  await patchCountryLinks(countries)
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error)
  process.exit(1)
})
