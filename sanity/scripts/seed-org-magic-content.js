import { getCliClient } from 'sanity/cli'

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

export const imageUrlById = {
  'seed-org-astral-council':
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
  'seed-org-ember-bank':
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
  'seed-org-veil-rangers':
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1600&q=80',
  'seed-org-runic-forge':
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1600&q=80',
  'seed-org-echo-courier':
    'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1600&q=80',
  'seed-magic-principle-resonance':
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
  'seed-magic-principle-anchor':
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80',
  'seed-magic-principle-phase':
    'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1600&q=80',
  'seed-magic-principle-memory':
    'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1600&q=80',
  'seed-magic-principle-threshold':
    'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1600&q=80',
  'seed-magic-spell-skyward-lance':
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
  'seed-magic-spell-mire-bind':
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80',
  'seed-magic-spell-ember-gate':
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
  'seed-magic-spell-aurora-veil':
    'https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?auto=format&fit=crop&w=1600&q=80',
  'seed-magic-spell-silent-bell':
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80',
}

function imageExtension(contentType) {
  if (contentType?.includes('png')) return 'png'
  if (contentType?.includes('webp')) return 'webp'
  return 'jpg'
}

export async function uploadExternalImage(client, { id, url }) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch image (${res.status}): ${url}`)
  }

  const contentType = res.headers.get('content-type') ?? 'image/jpeg'
  const ext = imageExtension(contentType)
  const buffer = Buffer.from(await res.arrayBuffer())

  return client.assets.upload('image', buffer, {
    filename: `${id}.${ext}`,
    contentType,
  })
}

export const organizations = [
  {
    _id: 'seed-org-astral-council',
    _type: 'country',
    kind: 'organization',
    name: '星穹议会',
    slug: { _type: 'slug', current: 'org-astral-council' },
    summary:
      '统筹各国观星台与天象档案的跨境组织。议会负责校准历法、发布潮汐与星潮预警，并维护古代星图的解释权。其权威来自“公开记录”而非武力，因此每次发布都附带可追溯的观测链路。',
    themeColor: '248',
    imageMeta: {
      title: '星穹议会',
      subtitle: '跨境观星与历法统筹',
      colors: ['#2b3a67', '#4a66a3', '#7f9dd1'],
    },
  },
  {
    _id: 'seed-org-ember-bank',
    _type: 'country',
    kind: 'organization',
    name: '烬纹商银同盟',
    slug: { _type: 'slug', current: 'org-ember-bank' },
    summary:
      '由港城商团和沙海驿站共同组建的流通同盟，核心职能是保管契券、跨境清算与货运担保。其内部采用“三重火漆印”制度，任何跨域资产必须经三方见证才能生效，极大压缩了伪造空间。',
    themeColor: '18',
    imageMeta: {
      title: '烬纹商银同盟',
      subtitle: '跨境清算与契券担保',
      colors: ['#5a2a1d', '#8a4130', '#c9754d'],
    },
  },
  {
    _id: 'seed-org-veil-rangers',
    _type: 'country',
    kind: 'organization',
    name: '雾林巡守会',
    slug: { _type: 'slug', current: 'org-veil-rangers' },
    summary:
      '负责古道、林脉与药材保护的半军事化组织。巡守会采用“季节轮值+地脉日志”模式，每季度更新封林区与采集配额，确保高价值生态资源能在扩张与保育间保持平衡。',
    themeColor: '142',
    imageMeta: {
      title: '雾林巡守会',
      subtitle: '古道管控与林脉保育',
      colors: ['#1f4b3a', '#2f6b55', '#5a9a7b'],
    },
  },
  {
    _id: 'seed-org-runic-forge',
    _type: 'country',
    kind: 'organization',
    name: '铭文工匠联盟',
    slug: { _type: 'slug', current: 'org-runic-forge' },
    summary:
      '掌握符材标准、器具认证与工坊仲裁的技术公会。联盟将所有可流通符器划分为九级并配发追溯铭码，既降低了危险器物外泄，也让学徒晋升路径有了统一尺度。',
    themeColor: '212',
    imageMeta: {
      title: '铭文工匠联盟',
      subtitle: '符器标准与工坊仲裁',
      colors: ['#16334e', '#215780', '#4f86b5'],
    },
  },
  {
    _id: 'seed-org-echo-courier',
    _type: 'country',
    kind: 'organization',
    name: '回声驿传团',
    slug: { _type: 'slug', current: 'org-echo-courier' },
    summary:
      '横贯群岛与高原的情报快递网络。驿传团以“灯号-旗语-风笛”三套协议同步传讯，在极端天气下仍可保持基础链路；其信誉来自“准时与原文不改”的双重誓约。',
    themeColor: '286',
    imageMeta: {
      title: '回声驿传团',
      subtitle: '跨地形高速情报网络',
      colors: ['#3a1d5e', '#5d2c8e', '#9360c9'],
    },
  },
]

export const principles = [
  {
    _id: 'seed-magic-principle-resonance',
    _type: 'magic',
    kind: 'principle',
    name: '共振律',
    slug: { _type: 'slug', current: 'principle-resonance-law' },
    school: 'Arcane Mechanics',
    summary:
      '描述“施术频率与环境频率同调”时，法效被放大的基础规律。',
    details: toBlocks([
      '共振律认为，任何施法行为都不是凭空发生，而是把施术者的心智节律、媒介材质与环境波段临时拉到同一频率。当三者的误差低于阈值时，法术会进入“低耗高效”区间。',
      '这一原理解释了为何同一术式在不同地形表现差异巨大：潮湿洞窟偏向放大水系与回声系术式，干燥高原则更利于火系与折射系。环境不是背景板，而是算式的一部分。',
      '高阶施术者会在起手阶段先做“试探脉冲”，用最小代价测量环境响应，再选择主术式。忽略这一步会导致法效漂移，轻则衰减，重则引发反相回冲。',
      '共振律也催生了工程化施法：通过布设校准柱与导频符文，把战场改造成可预测的共振场，从而实现团队级施法协同。',
    ]),
    imageMeta: {
      title: '共振律',
      subtitle: '施法频率与环境同调原理',
      colors: ['#1d2b64', '#3950a2', '#6f83d6'],
    },
  },
  {
    _id: 'seed-magic-principle-anchor',
    _type: 'magic',
    kind: 'principle',
    name: '锚定守恒',
    slug: { _type: 'slug', current: 'principle-anchor-conservation' },
    school: 'Thaumic Safety',
    summary:
      '强调所有大规模法效都必须绑定“锚点”，否则结构无法长期稳定。',
    details: toBlocks([
      '锚定守恒指出：越是范围广、持续久的法术，越依赖可验证的现实锚点。锚点可以是实体装置、地标符阵，或被多人见证的誓约文本，其作用是约束法效边界。',
      '没有锚点的法效并非立刻失效，而是会在一段时间后出现“边界漂移”，表现为覆盖区域缓慢偏移、强度分布失衡，最终演变为不可控泄露。',
      '工程实践中常用“双锚互校”机制：主锚负责输出，副锚实时比对偏差。若偏差超阈值，系统会自动降载，避免灾难性坍缩。',
      '锚定守恒让城市级防护成为可能，也让施法责任可追溯。谁布设锚点、谁维护记录，都会进入公证档案，形成长期治理体系。',
    ]),
    imageMeta: {
      title: '锚定守恒',
      subtitle: '大范围法效的稳定边界',
      colors: ['#20374a', '#2f5e78', '#5b93b2'],
    },
  },
  {
    _id: 'seed-magic-principle-phase',
    _type: 'magic',
    kind: 'principle',
    name: '相位置换',
    slug: { _type: 'slug', current: 'principle-phase-shift' },
    school: 'Spatial Theory',
    summary:
      '用于解释“同一能量在不同相位显现不同性质”的时空原理。',
    details: toBlocks([
      '相位置换把法术视为“能量-相位”二元系统：能量总量可守恒，但相位不同会改变它的外在表现，例如从热效应转为冲击效应，或从位移效应转为遮蔽效应。',
      '施法核心不是单纯堆能，而是精确控制相位切换时机。提前切换会导致输出中断，滞后切换会产生相位撕裂，常见后果是术式边缘出现不规则噪波。',
      '相位理论在战术上极具价值：同一术式可在“压制-封锁-转移”之间快速切换，减少术库冗余，让施术者在高压场景下保留更多决策空间。',
      '现代术学院将相位训练拆成节拍课程，要求学员先掌握稳定节律，再学习复杂置换链，以降低实战失误率。',
    ]),
    imageMeta: {
      title: '相位置换',
      subtitle: '能量显现形态的切换机制',
      colors: ['#2f2457', '#4f3c8b', '#8570c9'],
    },
  },
  {
    _id: 'seed-magic-principle-memory',
    _type: 'magic',
    kind: 'principle',
    name: '记忆回路',
    slug: { _type: 'slug', current: 'principle-memory-circuit' },
    school: 'Cognitive Arcanum',
    summary:
      '提出“法术结构可由重复仪式写入环境记忆”的积累模型。',
    details: toBlocks([
      '记忆回路认为，环境并非被动承载体。重复且一致的仪式会在特定区域留下“术式痕迹”，使后续施法启动成本逐步下降，形成可继承的施法红利。',
      '这解释了古老圣所与旧战场的“易施法”现象：它们并不神秘，而是长期重复行为叠加出的高密度记忆层。新手在此施法更容易成功，但也更容易被旧回路误导。',
      '维护记忆回路需要严格的仪式版本管理。若不同流派在同一区域叠加互斥协议，会造成回路冲突，表现为咒文延迟、意图误读或法效畸变。',
      '因此，大型组织会给公共施法场配套“回路年检”，清理废弃协议并保留核心模板，确保知识传承而非混乱累积。',
    ]),
    imageMeta: {
      title: '记忆回路',
      subtitle: '环境可继承的施法痕迹',
      colors: ['#3f2e2a', '#705146', '#b28272'],
    },
  },
  {
    _id: 'seed-magic-principle-threshold',
    _type: 'magic',
    kind: 'principle',
    name: '阈值裂变',
    slug: { _type: 'slug', current: 'principle-threshold-fission' },
    school: 'Applied Dynamics',
    summary:
      '说明法效在跨越临界点后会发生“非线性跃迁”的动力学原理。',
    details: toBlocks([
      '阈值裂变强调，法术输出并非总是线性增长。当能量、媒介纯度与环境扰动叠加到某一临界点，系统会突然进入新状态，出现倍增、分叉或崩塌。',
      '实战上最常见的是“伪稳定区”：施术者以为术式可控，实则已逼近裂变阈值。此时任何微小误差都可能触发极端结果，造成友军误伤。',
      '规范施法要求在术式中预置“降载节点”，一旦监测到阈值逼近，优先牺牲范围与持续时间，确保结构完整退出，而不是赌一次极限爆发。',
      '阈值裂变原理推动了现代法术安全工程，把“可终止”置于“高上限”之前，减少不可逆事故。',
    ]),
    imageMeta: {
      title: '阈值裂变',
      subtitle: '法效跨临界点后的跃迁',
      colors: ['#2f2a1f', '#64563c', '#af8f54'],
    },
  },
]

export const spells = [
  {
    _id: 'seed-magic-spell-skyward-lance',
    _type: 'magic',
    kind: 'spell',
    element: 'fire',
    name: '天穹矛',
    slug: { _type: 'slug', current: 'spell-skyward-lance' },
    school: 'Arcane Spear',
    summary:
      '将高密度光压缩成直线穿透束，适合中远距离破甲。',
    details: toBlocks([
      '天穹矛以短暂蓄能换取高穿透，核心在于把光压缩成窄束并锁定目标躯干中线。施术者起手时需固定肩线，否则后坐震动会造成轨迹漂移。',
      '标准施法分三拍：聚焦、锁线、释放。若在锁线阶段受到干扰，建议立刻中止，不可强行出手，以免能量在炮口端回灌。',
      '该术式对单体重甲目标极具压制力，但横向覆盖很窄，适合配合牵制型队友使用。面对高机动目标时，应先用限制术降低位移能力。',
      '在高湿环境中，天穹矛会出现边缘散射，建议提前布设导光符片提高束线稳定性。',
    ]),
    imageMeta: {
      title: '天穹矛',
      subtitle: '高穿透定向光束术式',
      colors: ['#1f325f', '#365aa6', '#6f91dd'],
    },
  },
  {
    _id: 'seed-magic-spell-mire-bind',
    _type: 'magic',
    kind: 'spell',
    element: 'earth',
    name: '沼缚',
    slug: { _type: 'slug', current: 'spell-mire-bind' },
    school: 'Control Casting',
    summary:
      '在目标脚下生成黏滞能场，削弱位移并制造节奏断点。',
    details: toBlocks([
      '沼缚并非实体泥沼，而是模拟高黏滞地表反馈。目标每次发力都会被额外阻尼拖慢，短时间内极难完成冲刺或急停。',
      '该术式最适合在狭窄通道与坡地使用，能强迫敌人进入可预测路径。若施放在开阔平地，收益会因绕行空间过大而下降。',
      '沼缚可与爆发术形成连携：先控制位移，再进行定点打击。需要注意的是，友军同样受影响，施放前务必完成区域口令确认。',
      '当敌方具备高强度位移豁免时，可叠加二段“深陷符”提高阻尼阈值，但会显著增加施法耗能。',
    ]),
    imageMeta: {
      title: '沼缚',
      subtitle: '区域黏滞控制术式',
      colors: ['#244a3b', '#35735a', '#69ad87'],
    },
  },
  {
    _id: 'seed-magic-spell-ember-gate',
    _type: 'magic',
    kind: 'spell',
    element: 'fire',
    name: '烬门',
    slug: { _type: 'slug', current: 'spell-ember-gate' },
    school: 'Flame Transit',
    summary:
      '短程位移术，借高温裂隙完成“入门-出门”的瞬时转移。',
    details: toBlocks([
      '烬门通过制造一对短寿命热裂隙完成位移，施术者在极短窗口内跨越障碍。与传统闪移不同，它更依赖入口与出口的温差匹配。',
      '安全使用要求先标记落点，确保出口空间无障碍且地面承重可靠。若出口温差不足，裂隙会提前闭合，导致位移中断。',
      '烬门适合突入与撤离，不适合长距离机动。连续施放会快速堆积体内热负荷，建议配套冷却符液与节奏间隔。',
      '在雨雾天气中，裂隙边界会被湿气扰动，位移误差上升。实战常用“热钉”先行预热目标点，提高成功率。',
    ]),
    imageMeta: {
      title: '烬门',
      subtitle: '热裂隙短程位移术',
      colors: ['#4f2118', '#8b3725', '#d56a45'],
    },
  },
  {
    _id: 'seed-magic-spell-aurora-veil',
    _type: 'magic',
    kind: 'spell',
    element: 'water',
    name: '极光幕',
    slug: { _type: 'slug', current: 'spell-aurora-veil' },
    school: 'Defensive Weave',
    summary:
      '展开半透明光幕，削弱远程打击并干扰敌方瞄准。',
    details: toBlocks([
      '极光幕属于团队防护术，展开后形成弧形薄幕，能对高速投射与弱能束进行折偏。其价值不在“硬抗”，而在“改写命中概率”。',
      '光幕强度与队形有关：站位越紧凑，幕面越稳定。若队伍拉得过散，幕面会出现裂缝，反而暴露破口。',
      '面对持续火力时，应采用脉冲维持而非常开模式，以避免过快耗空术能。指挥端通常按三秒节拍给出开闭口令。',
      '在夜战环境中，极光幕还可充当视觉遮断层，隐藏后排施术动作，给团队争取重整窗口。',
    ]),
    imageMeta: {
      title: '极光幕',
      subtitle: '团队折偏防护术',
      colors: ['#1e3f53', '#2f6b8e', '#66b0d1'],
    },
  },
  {
    _id: 'seed-magic-spell-silent-bell',
    _type: 'magic',
    kind: 'spell',
    element: 'wind',
    name: '寂钟',
    slug: { _type: 'slug', current: 'spell-silent-bell' },
    school: 'Sonic Null',
    summary:
      '制造短暂静音域，切断口令、咏唱与声学侦测链路。',
    details: toBlocks([
      '寂钟会在指定半径内建立“声学空窗”，外部声音难以传入，内部声音也难以泄出。它是反施法与潜入作战中的关键工具。',
      '施放时需先明确己方替代通信手段，如手势或光标。若无预案，静音域会同时削弱我方指挥效率。',
      '寂钟对依赖咏唱触发的术式克制明显，可打断敌方高耗时大术；但对纯意念触发体系效果有限，需要与其他压制手段配合。',
      '该术式持续时间短、窗口明确，最佳用法是围绕“关键 6-10 秒”进行战术设计，而不是追求长时间覆盖。',
    ]),
    imageMeta: {
      title: '寂钟',
      subtitle: '短时静音压制术式',
      colors: ['#2b2e3f', '#4a4f71', '#8086b2'],
    },
  },
]

export async function attachImage(client, doc, fieldName) {
  const imageUrl = imageUrlById[doc._id]
  if (!imageUrl) {
    throw new Error(`Missing image URL for document: ${doc._id}`)
  }
  const asset = await uploadExternalImage(client, {
    id: doc._id,
    url: imageUrl,
  })
  doc[fieldName] = {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
  }
  delete doc.imageMeta
}

export async function createAll(client, docs, label) {
  for (const doc of docs) {
    await client.createOrReplace(doc)
    // eslint-disable-next-line no-console
    console.log(`${label}: ${doc._id}`)
  }
}

export function buildSeedDocs() {
  return {
    organizations: structuredClone(organizations),
    principles: structuredClone(principles),
    spells: structuredClone(spells),
  }
}

export async function runSeed(client, docs = buildSeedDocs()) {
  const { organizations, principles, spells } = docs

  for (const org of organizations) {
    await attachImage(client, org, 'mapImage')
  }
  for (const principle of principles) {
    await attachImage(client, principle, 'coverImage')
  }
  for (const spell of spells) {
    await attachImage(client, spell, 'coverImage')
  }

  await createAll(client, organizations, 'organization')
  await createAll(client, principles, 'magic-principle')
  await createAll(client, spells, 'magic-spell')
}

if (!process.env.VITEST) {
  const client = getCliClient({ apiVersion: '2026-02-17', dataset: 'production' })
  runSeed(client).catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
}
