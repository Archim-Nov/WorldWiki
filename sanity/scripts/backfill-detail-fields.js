import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-02-19', dataset: 'production' })

const block = (text) => ({
  _type: 'block',
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', text, marks: [] }],
})

const toBlocks = (paragraphs) => paragraphs.map((text) => block(text))

const countryDefaultsById = {
  'country-auris': {
    capital: '潮光港',
    governance: '港务议会',
    population: '约 86 万',
    currency: '潮铸币',
    languages: ['通用语', '海港行话'],
    motto: '灯不灭，航路不绝。',
    customs:
      '沿海城镇以“点灯礼”迎接远航归船，港口值夜人会在潮位更替时敲响钟声，提醒商队与渔船调整靠泊。',
    summary: '以灯塔、峭壁与潮汐航线闻名的海岸国度，城镇围绕港湾与修船坞扩张。',
  },
  'country-noctis': {
    capital: '黑曜城',
    governance: '尖塔城邦议政',
    population: '约 54 万',
    currency: '余烬券',
    languages: ['通用语', '工匠术语'],
    motto: '在熔火边缘守住秩序。',
    customs:
      '每逢火季前夜，铸工与巡卫会共同举行“封炉誓”，登记可进入火口区的队伍名册，以避免无序冒进。',
    summary: '火山风暴塑造的边境高地，黑曜尖塔与熔岩裂谷交织成天然要塞。',
  },
  'country-verdant': {
    capital: '青穗原庭',
    governance: '部族议事联盟',
    population: '约 73 万',
    currency: '草原筹片',
    languages: ['通用语', '游牧方言'],
    motto: '循旧路，守新芽。',
    customs:
      '春季迁徙前会举行“路石祭”，各部族在古路碑前交换路线情报与补给，确认当季可通行草场。',
    summary: '广袤草原与古林并存的联盟地带，以游牧路线和季节市集维系秩序。',
  },
  'sample-country-frostgate': {
    capital: '霜门城',
    governance: '联邦议庭',
    population: '约 61 万',
    currency: '霜银铸',
    languages: ['通用语', '高原方言'],
    motto: '誓碑不倒，归路常明。',
    customs:
      '冬季第一场大雪后会举行“补碑礼”，巡路队按传统修复风口石碑，并公开更新边境通行记录。',
  },
  'sample-country-crimson-tide': {
    capital: '赤潮港',
    governance: '港主联席',
    population: '约 68 万',
    currency: '潮票',
    languages: ['通用语', '海民语'],
    motto: '顺潮而行，逆险而定。',
    customs:
      '船队远航前会在灯塔下登记航线，返航后公开潮门变化，形成代代传承的航海档案。',
  },
  'sample-country-mistwood': {
    capital: '雾杉城',
    governance: '公国议会',
    population: '约 49 万',
    currency: '林印币',
    languages: ['通用语', '林地口语'],
    motto: '听风识路，守林见心。',
    customs:
      '采集季采用“留根采法”，每次采药须在树脂牌上标记区域与数量，防止过度采伐。',
  },
  'sample-country-embersand': {
    capital: '烬砂王庭',
    governance: '王域与哨站共治',
    population: '约 57 万',
    currency: '砂铸金片',
    languages: ['通用语', '沙海行语'],
    motto: '记下每条路，便不会迷失。',
    customs:
      '跨沙商队会在每处风口石标刻下队徽与日期，形成可复核的行程链路，供后续队伍参照。',
  },
  'sample-country-starbay': {
    capital: '星湾议庭',
    governance: '同盟议会',
    population: '约 64 万',
    currency: '湾星券',
    languages: ['通用语', '海湾方言'],
    motto: '远灯所及，皆为归途。',
    customs:
      '夜航季实行“共灯值守”，多港轮班维护浮标与灯号，确保群岛间航道的连续可见性。',
  },
}

const organizationCountryDefaults = {
  governance: '理事会治理',
  population: '核心成员约数百人',
  currency: '同盟凭证',
  languages: ['通用语', '行会术语'],
  motto: '以公开记录维持跨域协作。',
  customs:
    '每季召开公开记录会，统一发布行动日志与资源调度结果，保证跨区协作可追溯。',
}

const regionDefaultsById = {
  'region-azure-bay': {
    climate: '海洋性温带',
    terrain: '港湾海岸 / 石崖码头',
    dangerLevel: 'low',
    landmarks: ['潮光主码头', '双塔灯台'],
    travelAdvice: '涨潮前后是最稳妥的靠港窗口，夜间请遵循灯台信号进出航道。',
    summary: '晴空与海面交汇的主港区，航运与地图测绘活动密集。',
  },
  'region-glass-marsh': {
    climate: '湿地雾潮',
    terrain: '镜面浅滩 / 沉降遗迹',
    dangerLevel: 'medium',
    landmarks: ['镜沼石环', '漂灯水道'],
    travelAdvice: '请沿浮灯路径行进，避免踏入无标记浅滩，晨雾期建议双人同行。',
    summary: '镜水与流光并存的湿地遗迹区，地表平静但暗流频繁改道。',
  },
  'region-obsidian-spires': {
    climate: '火山干热',
    terrain: '黑曜尖塔 / 熔岩裂谷',
    dangerLevel: 'high',
    landmarks: ['余烬风井', '断脊观测塔'],
    travelAdvice: '进入前需确认风向与落灰预警，务必携带隔热护具并遵循巡卫路线。',
    summary: '由火山风暴塑形的尖塔地带，地形锋利且热流不稳定。',
  },
  'region-emerald-steppe': {
    climate: '温带草原',
    terrain: '起伏草海 / 古路碑线',
    dangerLevel: 'low',
    landmarks: ['长风路石', '迁徙集点'],
    travelAdvice: '顺着路石群移动最安全，暴雨后草沟积水明显，需绕行低洼地。',
    summary: '连绵草海与古路碑共同构成的迁徙通道，是游牧部族的核心活动区。',
  },
  'sample-region-froststep': {
    climate: '高寒风雪',
    terrain: '层台高原 / 风口石脊',
    dangerLevel: 'high',
    landmarks: ['誓碑群', '北境风口'],
    travelAdvice: '暴雪后请优先确认石碑序号，沿巡路队标线移动可显著降低迷失风险。',
  },
  'sample-region-vermilion-reef': {
    climate: '海岛湿热',
    terrain: '珊瑚暗礁 / 潜流航门',
    dangerLevel: 'medium',
    landmarks: ['绯湾灯礁', '潮门水道'],
    travelAdvice: '建议在潮门开启时段通过礁区，夜航务必保持队形并同步灯号。',
  },
  'sample-region-mistweald': {
    climate: '常年湿雾',
    terrain: '高冠密林 / 溪谷药带',
    dangerLevel: 'medium',
    landmarks: ['雾语古树', '光穗溪谷'],
    travelAdvice: '雾重时请使用树脂路标，不要脱离既有林道；采集行动需先登记区域。',
  },
  'sample-region-ashdune': {
    climate: '极端干热',
    terrain: '火山沙脊 / 旧河床暗坑',
    dangerLevel: 'high',
    landmarks: ['风脊哨点', '旧井石圈'],
    travelAdvice: '午后风暴频率高，建议清晨和夜间行进，务必记录补给井位。',
  },
  'sample-region-starlit-archipelago': {
    climate: '海风湿润',
    terrain: '群岛浅湾 / 环流航道',
    dangerLevel: 'medium',
    landmarks: ['远灯主塔', '星潮浮标链'],
    travelAdvice: '群岛间航道依赖浮标链，浓雾夜请按港务台统一调度进港。',
  },
}

const heroDefaultsById = {
  'hero-lyra': {
    alias: '潮痕绘者',
    age: '29',
    status: 'active',
    signatureWeapon: '风测短杖',
    motto: '地图不是线条，是会呼吸的边界。',
    title: '潮汐绘图师',
    faction: '潮契盟',
    roles: ['观潮师', '引航者'],
    bio: toBlocks([
      'Lyra 最初是沿岸测绘员，长期记录不断改道的潮痕与风向。她将潮汐日志改写为可复用的航路图，让海岸线不再只是静态边界。',
      '在执行任务时，她擅长把天气变化拆成可验证的航段建议，并通过短周期复测修正路线，降低船队误判风险。',
      '如今她负责更新 Auris Coast 的沿岸图册，训练新手测绘员在复杂海况下维持“先观测、后下结论”的工作纪律。',
    ]),
  },
  'hero-sable': {
    alias: '草线守望',
    age: '34',
    status: 'active',
    signatureWeapon: '巡林长弓',
    motto: '看清路的人，先学会慢下来。',
    title: '草海守望者',
    faction: '青野守卫',
    roles: ['巡林者', '护路人'],
    bio: toBlocks([
      'Sable 长年巡守 Emerald Steppe 的古路碑线，擅长在草海与古林交界地带建立短时安全通道。',
      '他把护路重点放在“提前预判风险”，例如暴雨后低洼积水与迁徙道冲突，从而减少商旅和部族冲突。',
      '在 Verdant Expanse，Sable 也承担年轻巡守的带训工作，确保巡路经验能够持续传承。',
    ]),
  },
  'hero-kellan': {
    alias: '熔库匠守',
    age: '41',
    status: 'active',
    signatureWeapon: '铸纹重锤',
    motto: '真正的锻造，是把风险也锻进规程。',
    title: '余烬库看守',
    faction: '尖塔工匠会',
    roles: ['工匠', '护库人'],
    bio: toBlocks([
      'Kellan 负责 Noctis Reach 熔库区的器具校验与风暴防护装置维护，核心工作是确保高热环境下的装备稳定性。',
      '他将工坊经验整理成标准化检修流程，使前线队伍能在极端条件下快速完成装备复位。',
      '面对突发风暴，Kellan 往往是最后撤离的一员，以确保余烬库与锚定装置在停工后仍保持安全状态。',
    ]),
  },
  'sample-hero-yaohan': {
    alias: '北风刻碑者',
    age: '32',
    status: 'active',
    signatureWeapon: '誓碑刻刀',
    motto: '把名字刻清楚，路就不会丢。',
  },
  'sample-hero-linqi': {
    alias: '听风人',
    age: '27',
    status: 'active',
    signatureWeapon: '树脂短刃',
    motto: '森林会回答耐心的人。',
  },
  'sample-hero-qilan': {
    alias: '潮门先导',
    age: '31',
    status: 'active',
    signatureWeapon: '导潮长杆',
    motto: '先读潮，再扬帆。',
  },
  'sample-hero-sharen': {
    alias: '风痕引路',
    age: '35',
    status: 'active',
    signatureWeapon: '砂脊短刀',
    motto: '记住每一口井，沙海就有方向。',
  },
  'sample-hero-zixun': {
    alias: '远灯守夜',
    age: '28',
    status: 'active',
    signatureWeapon: '讯号旗枪',
    motto: '灯亮着，就有人能回家。',
  },
}

const creatureDefaultsById = {
  'creature-glowmoth': {
    habitat: '雾沼浅滩与遗迹边缘',
    diet: '湿地孢子与微型浮藻',
    temperament: '群聚趋光',
    activityCycle: '黄昏至夜间活跃',
    threatLevel: 'low',
    abilities: ['群体发光', '雾中导航'],
    species: '辉沼飞蛾',
    bio: toBlocks([
      'Glowmoth 常在 Glass Marsh 的暮色时段成群升空，利用体表发光在雾层中保持队形。',
      '它们对环境扰动敏感，能在短时间内改变飞行方向，常被向导用于判断湿地暗流和沉降带。',
      '由于威胁性较低，研究者通常采用“远距观测”而非捕捉，以避免破坏其群体行为。',
    ]),
  },
  'creature-ironelk': {
    habitat: '草原缓坡与古林边带',
    diet: '硬质苔草与灌木嫩枝',
    temperament: '群居警戒',
    activityCycle: '清晨与傍晚活跃',
    threatLevel: 'medium',
    abilities: ['骨甲御冲', '群体护幼'],
    species: '铁角甲麋',
    bio: toBlocks([
      'Ironelk 是 Verdant Expanse 的大型群居兽，角冠坚硬，常在迁徙季形成移动屏障保护幼群。',
      '其群体路线与草场恢复周期高度相关，巡守队会据此调整商旅路径以减少惊扰。',
      '在受威胁时，Ironelk 会以扇形阵列反冲，需保持安全距离并避免堵截其退路。',
    ]),
  },
  'creature-rift-wyrm': {
    habitat: '火山灰云与尖塔风井',
    diet: '高热气旋中的矿尘颗粒',
    temperament: '领空排外',
    activityCycle: '夜间与风暴前后活跃',
    threatLevel: 'high',
    abilities: ['灰云穿梭', '高频震鸣'],
    species: '裂隙空蛇',
    bio: toBlocks([
      'Rift Wyrm 盘旋于 Obsidian Spires 上空，常借火山热流完成高机动巡游。',
      '其鸣叫会在尖塔间产生多重回声，影响常规侦测与口令传达，是该区高危环境因素之一。',
      '面对 Rift Wyrm，标准做法是降低噪声源并尽快脱离其盘旋高度范围，避免触发追击行为。',
    ]),
  },
  'sample-creature-icehorn': {
    habitat: '高原风口与岩台边缘',
    diet: '寒地地衣与盐霜苔',
    temperament: '谨慎群居',
    activityCycle: '清晨与黄昏迁行',
    threatLevel: 'low',
    abilities: ['冰角感风', '薄冰稳行'],
  },
  'sample-creature-tideglider': {
    habitat: '珊瑚暗礁外缘',
    diet: '浮游生物群',
    temperament: '群游协同',
    activityCycle: '黎明前后高活跃',
    threatLevel: 'low',
    abilities: ['潮线滑翔', '流向预警'],
  },
  'sample-creature-lumaflora': {
    habitat: '雾林湿壁与溪谷',
    diet: '矿盐雾滴与腐殖层',
    temperament: '环境依附',
    activityCycle: '夜间发光显著',
    threatLevel: 'low',
    abilities: ['微光引路', '湿地稳态指示'],
  },
  'sample-creature-mistfungus': {
    habitat: '古树根部与潮湿阴影区',
    diet: '木质腐殖与湿雾微粒',
    temperament: '扩散缓慢',
    activityCycle: '雾浓时生长加快',
    threatLevel: 'medium',
    abilities: ['菌丝扩张', '湿度响应'],
  },
  'sample-creature-embermote': {
    habitat: '沙脊浅层与旧井周边',
    diet: '热尘粒子与矿盐结晶',
    temperament: '受惊易散',
    activityCycle: '夜间可见度更高',
    threatLevel: 'medium',
    abilities: ['热流感应', '群体闪烁'],
  },
}

const magicDefaultsById = {
  'seed-magic-principle-resonance': {
    school: '奥术机理',
    difficulty: 'advanced',
    castType: 'ritual',
    manaCost: '高',
    cooldown: '短间隔复诵',
    requirements: ['共振导频节点', '稳定施法场'],
    risks: '频率漂移会导致法效衰减或回冲，建议先做试探脉冲。',
  },
  'seed-magic-principle-anchor': {
    school: '术式安全',
    difficulty: 'advanced',
    castType: 'ritual',
    manaCost: '中高',
    cooldown: '按锚点维护周期',
    requirements: ['主副锚点', '见证记录'],
    risks: '缺失锚点会引发边界漂移，长期可能导致结构性泄露。',
  },
  'seed-magic-principle-phase': {
    school: '空间相位',
    difficulty: 'master',
    castType: 'ritual',
    manaCost: '高',
    cooldown: '需相位复位',
    requirements: ['相位校准符', '节拍训练'],
    risks: '切换节奏错误会出现相位撕裂，导致术式边缘畸变。',
  },
  'seed-magic-principle-memory': {
    school: '心智奥术',
    difficulty: 'advanced',
    castType: 'ritual',
    manaCost: '中',
    cooldown: '按回路维护窗口',
    requirements: ['一致仪式模板', '版本记录'],
    risks: '多套冲突协议叠加会触发误读，需定期做回路年检。',
  },
  'seed-magic-principle-threshold': {
    school: '应用动力学',
    difficulty: 'master',
    castType: 'ritual',
    manaCost: '高',
    cooldown: '阈值监测后可复启',
    requirements: ['阈值监测器', '降载节点'],
    risks: '逼近裂变阈值时任何误差都可能放大，需预留终止路径。',
  },
  'seed-magic-spell-skyward-lance': {
    school: '奥术矛系',
    difficulty: 'advanced',
    castType: 'instant',
    manaCost: '中高',
    cooldown: '8 秒',
    requirements: ['导光媒介', '稳固站姿'],
    risks: '锁线阶段受扰会导致束线偏移，近距误伤风险上升。',
  },
  'seed-magic-spell-mire-bind': {
    school: '控制塑形',
    difficulty: 'intermediate',
    castType: 'channel',
    manaCost: '中',
    cooldown: '12 秒',
    requirements: ['地表触媒', '区域口令'],
    risks: '对友军同样生效，协同时需先确认队形和撤离线。',
  },
  'seed-magic-spell-ember-gate': {
    school: '焰门迁移',
    difficulty: 'advanced',
    castType: 'instant',
    manaCost: '高',
    cooldown: '18 秒',
    requirements: ['预热落点', '出口净空'],
    risks: '温差不足会使裂隙提前闭合，导致位移中断。',
  },
  'seed-magic-spell-aurora-veil': {
    school: '防御编织',
    difficulty: 'intermediate',
    castType: 'channel',
    manaCost: '中',
    cooldown: '10 秒',
    requirements: ['稳定队形', '防御节拍'],
    risks: '阵型分散会削弱幕面稳定性，产生可被穿透的裂缝。',
  },
  'seed-magic-spell-silent-bell': {
    school: '静声学派',
    difficulty: 'advanced',
    castType: 'ritual',
    manaCost: '中高',
    cooldown: '16 秒',
    requirements: ['替代通信手段', '静域边界标记'],
    risks: '会同步压制己方口令链路，必须提前切换信号协议。',
  },
}

const schoolLabelMap = {
  'Arcane Mechanics': '奥术机理',
  'Arcane Spear': '奥术矛系',
  'Sonic Null': '静声学派',
  'Defensive Weave': '防御编织',
  'Control Casting': '控制塑形',
  'Flame Transit': '焰门迁移',
  'Spatial Theory': '空间相位',
  'Cognitive Arcanum': '心智奥术',
  'Thaumic Safety': '术式安全',
  'Applied Dynamics': '应用动力学',
}

async function patchCountries() {
  const docs = await client.fetch(
    `*[_type == "country" && !(_id in path("drafts.**"))]{_id,name,kind,summary}`
  )
  let tx = client.transaction()
  for (const doc of docs) {
    const mapped = countryDefaultsById[doc._id] ?? {}
    const base =
      doc.kind === 'organization'
        ? {
            capital: '总部驻地未公开',
            ...organizationCountryDefaults,
            ...mapped,
          }
        : {
            capital: '待补充',
            governance: '待补充',
            population: '待补充',
            currency: '待补充',
            languages: ['通用语'],
            motto: '待补充',
            customs: '待补充',
            ...mapped,
          }
    tx = tx.patch(doc._id, (patch) => patch.setIfMissing(base))
    if (mapped.summary) {
      tx = tx.patch(doc._id, (patch) => patch.set({ summary: mapped.summary }))
    }
  }
  await tx.commit({ autoGenerateArrayKeys: true })
  return docs.length
}

async function patchRegions() {
  const docs = await client.fetch(
    `*[_type == "region" && !(_id in path("drafts.**"))]{_id,name,summary}`
  )
  let tx = client.transaction()
  for (const doc of docs) {
    const base = {
      climate: '待补充',
      terrain: '待补充',
      dangerLevel: 'medium',
      landmarks: ['待补充'],
      travelAdvice: '待补充',
      ...(regionDefaultsById[doc._id] ?? {}),
    }
    tx = tx.patch(doc._id, (patch) => patch.setIfMissing(base))
    if (regionDefaultsById[doc._id]?.summary) {
      tx = tx.patch(doc._id, (patch) =>
        patch.set({ summary: regionDefaultsById[doc._id].summary })
      )
    }
  }
  await tx.commit({ autoGenerateArrayKeys: true })
  return docs.length
}

async function patchHeroes() {
  const docs = await client.fetch(
    `*[_type == "hero" && !(_id in path("drafts.**"))]{_id,name}`
  )
  let tx = client.transaction()
  for (const doc of docs) {
    const mapped = heroDefaultsById[doc._id] ?? {}
    tx = tx.patch(doc._id, (patch) =>
      patch.setIfMissing({
        alias: '待补充',
        age: '待考',
        status: 'active',
        signatureWeapon: '待补充',
        motto: '待补充',
        ...mapped,
      })
    )
    const forceUpdate = {}
    if (mapped.bio) forceUpdate.bio = mapped.bio
    if (mapped.title) forceUpdate.title = mapped.title
    if (mapped.faction) forceUpdate.faction = mapped.faction
    if (mapped.roles) forceUpdate.roles = mapped.roles
    if (Object.keys(forceUpdate).length > 0) {
      tx = tx.patch(doc._id, (patch) => patch.set(forceUpdate))
    }
  }
  await tx.commit({ autoGenerateArrayKeys: true })
  return docs.length
}

async function patchCreatures() {
  const docs = await client.fetch(
    `*[_type == "creature" && !(_id in path("drafts.**"))]{_id,name,category}`
  )
  let tx = client.transaction()
  for (const doc of docs) {
    const mapped = creatureDefaultsById[doc._id] ?? {}
    tx = tx.patch(doc._id, (patch) =>
      patch.setIfMissing({
        temperament: '待补充',
        habitat: '待补充',
        diet: '待补充',
        activityCycle: '待补充',
        threatLevel: 'medium',
        abilities: ['待补充'],
        ...mapped,
      })
    )
    const forceUpdate = {}
    if (mapped.bio) forceUpdate.bio = mapped.bio
    if (mapped.species) forceUpdate.species = mapped.species
    if (Object.keys(forceUpdate).length > 0) {
      tx = tx.patch(doc._id, (patch) => patch.set(forceUpdate))
    }
  }
  await tx.commit({ autoGenerateArrayKeys: true })
  return docs.length
}

async function patchMagics() {
  const docs = await client.fetch(
    `*[_type == "magic" && !(_id in path("drafts.**"))]{_id,kind,school}`
  )
  let tx = client.transaction()
  for (const doc of docs) {
    const mapped = magicDefaultsById[doc._id] ?? {}
    const fallback =
      doc.kind === 'principle'
        ? {
            difficulty: 'advanced',
            castType: 'ritual',
            manaCost: '中高',
            cooldown: '按记录窗口',
            requirements: ['稳定施法环境'],
            risks: '结构不稳定时可能产生法效漂移。',
          }
        : {
            difficulty: 'intermediate',
            castType: 'instant',
            manaCost: '中',
            cooldown: '10 秒',
            requirements: ['基础施法介质'],
            risks: '连续施放可能造成负荷累积。',
          }
    tx = tx.patch(doc._id, (patch) =>
      patch.setIfMissing({
        ...fallback,
        ...mapped,
      })
    )
    const forceUpdate = {}
    if (mapped.school) {
      forceUpdate.school = mapped.school
    } else if (doc.school && schoolLabelMap[doc.school]) {
      forceUpdate.school = schoolLabelMap[doc.school]
    }
    if (Object.keys(forceUpdate).length > 0) {
      tx = tx.patch(doc._id, (patch) => patch.set(forceUpdate))
    }
  }
  await tx.commit({ autoGenerateArrayKeys: true })
  return docs.length
}

async function run() {
  const countryCount = await patchCountries()
  const regionCount = await patchRegions()
  const heroCount = await patchHeroes()
  const creatureCount = await patchCreatures()
  const magicCount = await patchMagics()

  console.log('Backfill finished:', {
    countryCount,
    regionCount,
    heroCount,
    creatureCount,
    magicCount,
  })
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
