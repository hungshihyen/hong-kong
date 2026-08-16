import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'motion/react'
import IntroExperience from './components/IntroExperience'

type ItemStatus = 'done' | 'skipped' | 'later'
type TravelMode = 'normal' | 'rain' | 'tired' | 'queue'

type TripItem = {
  id: string
  time: string
  sortTime: string
  place: string
  note: string
  location?: string
  type: '交通' | '美食' | '景點' | '住宿' | '表演' | '採買'
  priority?: 'must' | 'flex'
  planB?: string
}

type TripDay = {
  id: string
  date: string
  displayDate: string
  title: string
  stay: string
  accent: string
  items: TripItem[]
}

type TransportInfo = {
  from: string
  to: string
  method: '步行' | '港鐵' | '飯店接駁' | '巴士' | '混合交通'
  duration: string
  headline: string
  steps: string[]
  note?: string
  taxiBackup?: string
  mapMode?: 'walking' | 'transit' | 'driving'
}

type DiningInfo = {
  estimate: string
  payment: string
  cashNeed: string
  basis: string
  note?: string
}

const days: TripDay[] = [
  {
    id: 'day-1',
    date: '2026-08-26',
    displayDate: '8/26 Wed',
    title: 'Hello Hong Kong',
    stay: "Disney's Hollywood Hotel",
    accent: '🌃',
    items: [
      { id: 'd1-arrive', time: '12:00', sortTime: '12:00', place: '抵達香港機場', note: '入境、領行李後前往迪士尼飯店', location: 'Hong Kong International Airport', type: '交通', priority: 'must', planB: '入境較久時，澳洲牛奶公司改為 Optional，優先保留維港夜景。' },
      { id: 'd1-hotel', time: '14:00', sortTime: '14:00', place: 'Hollywood Hotel', note: '寄放行李 / Check-in', location: "Disney's Hollywood Hotel Hong Kong", type: '住宿', priority: 'must' },
      { id: 'd1-adc', time: '15:30', sortTime: '15:30', place: '澳洲牛奶公司', note: '炒蛋多士、燉奶；第一餐不要吃太飽', location: 'Australia Dairy Company Hong Kong', type: '美食', priority: 'flex', planB: '飛行後太累就跳過，直接到尖沙咀找咖啡或簡單小吃。' },
      { id: 'd1-harbour', time: '17:00', sortTime: '17:00', place: '尖沙咀・維多利亞港', note: '星光大道、Golden Hour、夜景', location: 'Avenue of Stars Hong Kong', type: '景點', priority: 'must', planB: '雨勢大時改逛 K11 MUSEA／海港城，接近 20:00 再看天氣決定是否到海旁。' },
      { id: 'd1-symphony', time: '20:00', sortTime: '20:00', place: '幻彩詠香江', note: '看完後可搭天星小輪', location: 'Tsim Sha Tsui Promenade', type: '表演', priority: 'must', planB: '能見度差就縮短停留；天星小輪直接取消，把體力留給晚餐。' },
      { id: 'd1-mak', time: '21:00', sortTime: '21:00', place: '麥文記麵家', note: '鮮蝦雲吞麵', location: 'Mak Man Kee Noodle Shop Hong Kong', type: '美食', priority: 'must', planB: '若已休息或排隊過久，就在尖沙咀找雲吞麵，保留「雲吞麵」品項即可。' },
      { id: 'd1-kai', time: '21:40', sortTime: '21:40', place: '佳佳甜品', note: '芝麻糊 / 寧波薑汁湯丸', location: 'Kai Kai Dessert Hong Kong', type: '美食', priority: 'flex', planB: '累了就取消，不影響核心行程。' },
      { id: 'd1-return', time: '22:30', sortTime: '22:30', place: '返回 Disney', note: '留體力給生日 Disney Day', location: "Disney's Hollywood Hotel Hong Kong", type: '交通', priority: 'must' },
    ],
  },
  {
    id: 'day-2',
    date: '2026-08-27',
    displayDate: '8/27 Thu',
    title: 'Birthday Disney Day',
    stay: "Disney's Hollywood Hotel",
    accent: '🎂',
    items: [
      { id: 'd2-breakfast', time: '08:00', sortTime: '08:00', place: '飯店早餐', note: '輕鬆開始生日的一天', location: "Disney's Hollywood Hotel Hong Kong", type: '美食', priority: 'flex' },
      { id: 'd2-disney', time: '09:00', sortTime: '09:00', place: '香港迪士尼', note: 'World of Frozen、Mystic Manor、Big Grizzly 等', location: 'Hong Kong Disneyland', type: '景點', priority: 'must', planB: '下雨先看室內表演、Mystic Manor 與商店；依官方 App 排隊時間調整順序。' },
      { id: 'd2-birthday', time: '全天', sortTime: '12:00', place: 'Disney Birthday', note: '拍照、遊行、表演，行程不塞市區', location: 'Hong Kong Disneyland Castle', type: '景點', priority: 'must', planB: '體力下降時刪除重複排隊項目，保留生日拍照與晚間表演。' },
      { id: 'd2-dinner', time: '晚餐', sortTime: '18:00', place: '晶荷軒（Optional）', note: '若想要生日儀式感，可提前預訂', location: 'Crystal Lotus Hong Kong Disneyland Hotel', type: '美食', priority: 'flex', planB: '沒訂到或時間不合，就留在園內用餐，避免為餐廳犧牲 Momentous。' },
      { id: 'd2-momentous', time: '晚上', sortTime: '20:30', place: 'Momentous', note: '留到夜間城堡表演結束', location: 'Castle of Magical Dreams Hong Kong Disneyland', type: '表演', priority: 'must', planB: '依官方公告確認演出；若取消，把城堡夜景與生日合照作為收尾。' },
    ],
  },
  {
    id: 'day-3',
    date: '2026-08-28',
    displayDate: '8/28 Fri',
    title: 'Old Town Walk + H2K Night Tour',
    stay: 'The Fleming・灣仔',
    accent: '🚌',
    items: [
      { id: 'd3-checkout', time: '08:00', sortTime: '08:00', place: 'Disney Check-out', note: '約 08:30 出發，移動到灣仔寄放行李', location: "Disney's Hollywood Hotel Hong Kong", type: '住宿', priority: 'must', planB: '若出發延誤，直接搭車到餐廳，稍後再處理寄放行李。' },
      { id: 'd3-fleming', time: '09:30', sortTime: '09:30', place: 'The Fleming 寄放行李', note: '輕裝前往中環，開始老城區散步', location: 'The Fleming Hong Kong', type: '住宿', priority: 'must' },
      { id: 'd3-dimsum', time: '10:00', sortTime: '10:00', place: '蓮香樓早茶', note: '兩人 5–6 籠即可，保留後續胃容量', location: 'Lin Heung Lau Hong Kong', type: '美食', priority: 'must', planB: '排隊過久時保留傳統早茶類型，改找附近點心店。' },
      { id: 'd3-taikwun', time: '11:15', sortTime: '11:15', place: '大館・半山扶手電梯', note: '前警署建築、監獄空間與中環街景，停留約 50 分鐘', location: 'Tai Kwun Hong Kong', type: '景點', priority: 'must', planB: '大雨時以大館室內展覽為主；太累則只拍建築與廣場，30 分鐘離開。' },
      { id: 'd3-kaukee', time: '12:30', sortTime: '12:30', place: '九記牛腩', note: '兩人交換口味，不一定各吃一大碗', location: 'Kau Kee Food Cafe Hong Kong', type: '美食', priority: 'must', planB: '排隊超過 30 分鐘就先走 PMQ，或改吃附近牛腩店，避免壓縮傍晚 H2K。' },
      { id: 'd3-oldtown', time: '13:20', sortTime: '13:20', place: 'PMQ・荷李活道散步', note: '設計小店、街頭壁畫；有體力再延伸至文武廟', location: 'PMQ Hong Kong', type: '景點', priority: 'flex', planB: '下雨只逛 PMQ；太累直接省略文武廟，前往一樂。' },
      { id: 'd3-yatlok', time: '14:30', sortTime: '14:30', place: '一樂燒鵝', note: '共享 1/4 燒鵝＋主食，不求吃飽', location: 'Yat Lok Restaurant Hong Kong', type: '美食', priority: 'must', planB: '排隊過長改甘牌燒鵝；若還很飽，延到 Day 4 最後一餐。' },
      { id: 'd3-pier', time: '15:15', sortTime: '15:15', place: '中環天星碼頭・往尖沙咀', note: '搭天星小輪過海，銜接尖沙咀日落與 H2K', location: 'Tsim Sha Tsui Star Ferry Pier Hong Kong', type: '交通', priority: 'must', planB: '時間落後就直接搭港鐵或的士到尖沙咀，不再繞行。' },
      { id: 'd3-tst', time: '16:30–18:20', sortTime: '16:30', place: '尖沙咀・維港日落（可與 H2K 調序）', note: '星光大道／K11 MUSEA；依 H2K 即時到站與候車人潮決定停留長度', location: 'Avenue of Stars Hong Kong', type: '景點', priority: 'flex', planB: '若 H2K 即將到站或候車人潮明顯增加，先去排 H2K；日落改為縮短，或改在回到中環後看港島夜景。' },
      { id: 'd3-h2k', time: '18:30 起', sortTime: '18:30', place: 'H2K 夜賞香港・逆向上車（可與日落調序）', note: '尖沙咀天星碼頭／漢口道附近上車，搭往中環方向；不死守 18:30，依即時班次決定', location: 'Tsim Sha Tsui Star Ferry Pier Bus Terminus Hong Kong', type: '景點', priority: 'must', planB: '若下一班仍有時間或排隊太長，就回海旁繼續看日落／喝咖啡，改搭下一班；惡劣天氣停駛時，改港鐵過海到中環晚餐。' },
      { id: 'd3-centralnight', time: '20:00', sortTime: '20:00', place: '中環・SoHo 輕鬆夜遊', note: '依胃口吃正餐、甜點或喝一杯；不再折返九龍', location: 'SoHo Hong Kong', type: '美食', priority: 'flex', planB: '很累就直接搭港鐵回灣仔，附近簡單用餐。' },
      { id: 'd3-return', time: '21:30', sortTime: '21:30', place: '回 The Fleming', note: '取房休息，隔天還有採買與機場時限', location: 'The Fleming Hong Kong', type: '交通', priority: 'must' },
    ],
  },
  {
    id: 'day-4',
    date: '2026-08-29',
    displayDate: '8/29 Sat',
    title: 'Last Bites & Airport',
    stay: '18:00 HKG departure',
    accent: '🥧',
    items: [
      { id: 'd4-bakehouse', time: '08:00', sortTime: '08:00', place: 'Bakehouse 灣仔', note: '酸種蛋撻：現場吃 + 當天買回台灣', location: 'Bakehouse Wan Chai Hong Kong', type: '美食', priority: 'must', planB: '排隊太久就只外帶，避免拖延上環採買。' },
      { id: 'd4-capital', time: '09:00', sortTime: '09:00', place: '華星冰室', note: '黑松露炒蛋多士 / 奶茶 / 菠蘿油', location: 'Capital Cafe Wan Chai Hong Kong', type: '美食', priority: 'flex', planB: '早餐已飽就直接取消。' },
      { id: 'd4-lemon', time: '10:30', sortTime: '10:30', place: '上環檸檬王', note: '甘草檸檬、陳皮、話梅等伴手禮', location: 'Lemon King Hong Kong', type: '採買', priority: 'must', planB: '若未營業或缺貨，改買其他香港涼果伴手禮，不延誤最後一餐。' },
      { id: 'd4-lastmeal', time: '12:00', sortTime: '12:00', place: '香港 Last Meal', note: '留給前三天沒吃到的遺珠，13:30 前結束', location: 'Wan Chai Hong Kong', type: '美食', priority: 'flex', planB: '時間不足就改成外帶或直接取消，機場時限優先。' },
      { id: 'd4-luggage', time: '14:00', sortTime: '14:00', place: '回飯店拿行李', note: '最晚 14:30 離開市區', location: 'The Fleming Hong Kong', type: '住宿', priority: 'must' },
      { id: 'd4-airport', time: '16:00', sortTime: '16:00', place: '抵達香港機場', note: '預留國際線報到與安檢時間', location: 'Hong Kong International Airport', type: '交通', priority: 'must', planB: '若市區延誤，立即使用最快交通方式前往機場，不再增加任何採買。' },
      { id: 'd4-flight', time: '18:00', sortTime: '18:00', place: '返程', note: '香港生日旅行完成 ✈️', location: 'Hong Kong International Airport Departures', type: '交通', priority: 'must' },
    ],
  },
]

const transports: Record<string, TransportInfo> = {
  'd1-hotel': {
    from: '香港國際機場一號客運大樓',
    to: "Disney's Hollywood Hotel Hong Kong",
    method: '混合交通',
    duration: '約 50–60 分',
    headline: '機場站 → 青衣站 → 欣澳站 → 迪士尼站＋飯店接駁',
    steps: [
      '入境大堂依「機場快綫 Airport Express」指標前往機場站。',
      '機場站上車，搭機場快綫至青衣站下車。',
      '青衣站轉東涌綫往東涌方向，於欣澳站下車。',
      '欣澳站轉迪士尼綫，於迪士尼站下車。',
      '由迪士尼站 A 出口前往公共運輸交匯處，搭免費接駁車至 Hollywood Hotel。',
    ],
    note: '全程可使用電梯與大型閘機；帶行李時在青衣站與欣澳站依無障礙指標轉乘。',
    taxiBackup: '若行李很多、有人不舒服或鐵路服務異常，可在機場排班區搭紅色市區的士直達 Disney Hollywood Hotel，正常路況約 20–25 分鐘。',
    mapMode: 'transit',
  },
  'd1-adc': {
    from: "Disney's Hollywood Hotel Hong Kong",
    to: 'Australia Dairy Company Hong Kong',
    method: '混合交通',
    duration: '約 55–65 分',
    headline: '飯店接駁＋港鐵：迪士尼站 → 佐敦站 C2',
    steps: [
      '飯店搭免費接駁車至迪士尼公共運輸交匯處。',
      '迪士尼站上車，搭迪士尼綫至欣澳站。',
      '欣澳站轉東涌綫往香港方向，於荔景站下車。',
      '荔景站轉荃灣綫往中環方向，於佐敦站下車。',
      '由 C2 出口步行約 3 分鐘至白加士街 47 號。',
    ],
    taxiBackup: '若接駁或港鐵轉乘不順，可請飯店協助叫紅色市區的士，直接前往「佐敦白加士街 47 號・澳洲牛奶公司」，正常路況約 35–45 分鐘。',
    mapMode: 'transit',
  },
  'd1-harbour': {
    from: 'Australia Dairy Company Hong Kong',
    to: 'Avenue of Stars Hong Kong',
    method: '港鐵',
    duration: '約 18–22 分',
    headline: '佐敦站 → 尖沙咀站，往東尖沙咀 J2 出口',
    steps: [
      '步行回佐敦站 C2 出口。',
      '佐敦站上車，搭荃灣綫往中環方向 1 站。',
      '尖沙咀站下車，依「東尖沙咀／星光大道」指標走地下通道。',
      '由 J2 出口前往星光大道與維港海旁。',
    ],
    mapMode: 'transit',
  },
  'd1-symphony': {
    from: 'Avenue of Stars Hong Kong',
    to: 'Tsim Sha Tsui Promenade',
    method: '步行',
    duration: '約 5–10 分',
    headline: '沿維港海旁步行至文化中心一帶觀賞區',
    steps: ['沿星光大道向香港文化中心／鐘樓方向步行。', '不需搭車，選視野未被樹木與建築遮擋的位置即可。'],
    mapMode: 'walking',
  },
  'd1-mak': {
    from: 'Tsim Sha Tsui Promenade',
    to: 'Mak Man Kee Noodle Shop Hong Kong',
    method: '港鐵',
    duration: '約 15–20 分',
    headline: '尖沙咀站 → 佐敦站 C2',
    steps: ['步行至尖沙咀站，搭荃灣綫往荃灣方向。', '佐敦站下車，由 C2 出口步行至白加士街。'],
    taxiBackup: '若看完燈光秀後很累，可在尖沙咀海旁上車，向司機出示「佐敦白加士街 51 號・麥文記麵家」，正常路況約 8–12 分鐘。',
    mapMode: 'transit',
  },
  'd1-kai': {
    from: 'Mak Man Kee Noodle Shop Hong Kong',
    to: 'Kai Kai Dessert Hong Kong',
    method: '步行',
    duration: '約 3–5 分',
    headline: '沿白加士街步行至寧波街',
    steps: ['從麥文記沿白加士街向北走。', '右轉寧波街即可抵達佳佳甜品，不需搭車。'],
    mapMode: 'walking',
  },
  'd1-return': {
    from: 'Kai Kai Dessert Hong Kong',
    to: "Disney's Hollywood Hotel Hong Kong",
    method: '混合交通',
    duration: '約 55–65 分',
    headline: '佐敦站 → 荔景站 → 欣澳站 → 迪士尼站',
    steps: [
      '步行至佐敦站 C2 出口。',
      '佐敦站搭荃灣綫往荃灣方向，於荔景站轉車。',
      '荔景站轉東涌綫往東涌方向，於欣澳站下車。',
      '欣澳站轉迪士尼綫，於迪士尼站下車。',
      '公共運輸交匯處搭免費飯店接駁車回 Hollywood Hotel。',
    ],
    note: '晚間移動請預留轉乘與候車時間，並在出發前確認迪士尼綫末班車。',
    taxiBackup: '若錯過末班車或體力不足，可由佐敦搭紅色市區的士直達 Disney Hollywood Hotel，正常路況約 30–40 分鐘。',
    mapMode: 'transit',
  },
  'd2-breakfast': {
    from: "Disney's Hollywood Hotel 客房",
    to: "Disney's Hollywood Hotel 餐廳",
    method: '步行',
    duration: '館內約 3–5 分',
    headline: '客房 → 飯店早餐餐廳',
    steps: ['依飯店館內指標前往早餐餐廳；吃完回房拿隨身物品再出發。'],
    mapMode: 'walking',
  },
  'd2-disney': {
    from: "Disney's Hollywood Hotel Hong Kong",
    to: 'Hong Kong Disneyland',
    method: '飯店接駁',
    duration: '約 10–15 分',
    headline: 'Hollywood Hotel 上車 → 迪士尼公共運輸交匯處下車',
    steps: ['飯店門口搭免費度假區接駁車。', '於迪士尼公共運輸交匯處下車。', '步行約 3–5 分鐘至樂園安檢與入口。'],
    note: '官方接駁車通常每 10–20 分鐘一班，車程約 5–7 分鐘。',
    mapMode: 'transit',
  },
  'd2-birthday': {
    from: 'Hong Kong Disneyland Park Entrance',
    to: 'Hong Kong Disneyland Castle',
    method: '步行',
    duration: '園內移動',
    headline: '樂園內依官方 App 地圖步行',
    steps: ['所有生日拍照、遊行與設施皆在園區內，以官方 App 地圖安排步行順序。'],
    mapMode: 'walking',
  },
  'd2-dinner': {
    from: 'Hong Kong Disneyland',
    to: 'Crystal Lotus Hong Kong Disneyland Hotel',
    method: '飯店接駁',
    duration: '約 15–20 分',
    headline: '樂園出口 → 公共運輸交匯處 → 香港迪士尼樂園酒店',
    steps: ['離開樂園後步行至公共運輸交匯處。', '搭免費度假區接駁車，於香港迪士尼樂園酒店下車。', '進入飯店後依「晶荷軒 Crystal Lotus」指標前往餐廳。'],
    note: '若步行，沿 Park Promenade 約需 15–20 分鐘。',
    mapMode: 'transit',
  },
  'd2-momentous': {
    from: 'Crystal Lotus Hong Kong Disneyland Hotel',
    to: 'Castle of Magical Dreams Hong Kong Disneyland',
    method: '飯店接駁',
    duration: '約 20–30 分',
    headline: '迪士尼樂園酒店 → 公共運輸交匯處 → 樂園城堡',
    steps: ['飯店搭免費接駁車回迪士尼公共運輸交匯處。', '步行至樂園入口並重新安檢入園。', '入園後沿美國小鎮大街前往奇妙夢想城堡。'],
    note: '訂生日晚餐時必須確認用餐結束後仍可趕上重新入園與 Momentous；沒訂晶荷軒則留在園內即可。',
    mapMode: 'transit',
  },
  'd3-checkout': {
    from: "Disney's Hollywood Hotel 客房",
    to: "Disney's Hollywood Hotel 大廳",
    method: '步行',
    duration: '館內約 5 分',
    headline: '客房 → 飯店大廳辦理退房',
    steps: ['帶齊行李至飯店大廳 Check-out；出發前再檢查護照、票券與充電設備。'],
    mapMode: 'walking',
  },
  'd3-fleming': {
    from: "Disney's Hollywood Hotel Hong Kong",
    to: 'The Fleming Hong Kong',
    method: '混合交通',
    duration: '約 75–90 分',
    headline: '飯店接駁＋迪士尼站 → 欣澳站 → 香港／中環站 → 灣仔站 A1',
    steps: [
      'Hollywood Hotel 搭免費接駁車至迪士尼公共運輸交匯處。',
      '迪士尼站上車，搭迪士尼綫至欣澳站。',
      '欣澳站轉東涌綫往香港方向，於香港站下車。',
      '依站內「中環站／港島綫」指標經連通通道轉乘。',
      '中環站搭港島綫往柴灣方向，於灣仔站下車。',
      '由 A1 出口步行約 4 分鐘至 The Fleming。',
    ],
    note: '這段帶行李且轉乘較多，青衣／欣澳與香港站均優先依電梯及大型閘機指標移動。',
    taxiBackup: '若行李多或轉乘狀況不佳，可請 Disney 飯店協助叫紅色市區的士，直達「灣仔菲林明道 41 號・The Fleming」，正常路況約 35–45 分鐘。',
    mapMode: 'transit',
  },
  'd3-dimsum': {
    from: 'The Fleming Hong Kong',
    to: 'Lin Heung Lau Hong Kong',
    method: '港鐵',
    duration: '約 20–25 分',
    headline: '灣仔站 A1 → 上環站 A2',
    steps: ['從飯店步行約 4 分鐘至灣仔站 A1 出口。', '灣仔站搭港島綫往堅尼地城方向。', '上環站下車，由 A2 出口步行約 5 分鐘至蓮香樓。'],
    note: '蓮香樓地址曾調整，出發前請用下方導航確認當日店址。',
    mapMode: 'transit',
  },
  'd3-taikwun': {
    from: 'Lin Heung Lau Hong Kong',
    to: 'Tai Kwun Hong Kong',
    method: '步行',
    duration: '約 15–20 分',
    headline: '經中環街市與半山扶手電梯上行至大館',
    steps: ['往中環街市方向步行，接上中環至半山自動扶手電梯。', '於荷李活道附近離開扶手電梯，步行至大館入口。'],
    note: '這段為上坡動線，善用半山扶手電梯可明顯減少爬坡。',
    taxiBackup: '若不適合走上坡，可由蓮香樓搭紅色市區的士至「大館・荷李活道入口」，正常路況約 5–10 分鐘。',
    mapMode: 'walking',
  },
  'd3-kaukee': {
    from: 'Tai Kwun Hong Kong',
    to: 'Kau Kee Food Cafe Hong Kong',
    method: '步行',
    duration: '約 6–10 分',
    headline: '大館 → 奧卑利街 → 歌賦街',
    steps: ['由大館荷李活道出口離開。', '沿奧卑利街往歌賦街方向下行至九記牛腩。'],
    mapMode: 'walking',
  },
  'd3-oldtown': {
    from: 'Kau Kee Food Cafe Hong Kong',
    to: 'PMQ Hong Kong',
    method: '步行',
    duration: '約 5 分',
    headline: '歌賦街 → 鴨巴甸街 → PMQ',
    steps: ['從歌賦街步行至鴨巴甸街。', '沿鴨巴甸街上行至 PMQ 元創方。'],
    mapMode: 'walking',
  },
  'd3-yatlok': {
    from: 'PMQ Hong Kong',
    to: 'Yat Lok Restaurant Hong Kong',
    method: '步行',
    duration: '約 8–10 分',
    headline: 'PMQ → 荷李活道／擺花街 → 士丹利街',
    steps: ['由 PMQ 往中環方向下坡。', '依步行導航前往士丹利街的一樂燒鵝。'],
    mapMode: 'walking',
  },
  'd3-pier': {
    from: 'Yat Lok Restaurant Hong Kong',
    to: 'Tsim Sha Tsui Star Ferry Pier Hong Kong',
    method: '混合交通',
    duration: '約 35–45 分',
    headline: '士丹利街 → 中環天星碼頭 → 尖沙咀天星碼頭',
    steps: ['沿皇后大道中往中環碼頭方向步行。', '依「Star Ferry／尖沙咀」指標購票上船。', '抵達尖沙咀後沿海旁前往星光大道，開始日落行程。'],
    note: '若前面行程延誤，直接搭港鐵或的士到尖沙咀，18:15 前回到 H2K 候車區即可。',
    taxiBackup: '若想保留更多尖沙咀時間，可由一樂搭紅色市區的士直達「尖沙咀天星碼頭」，正常路況約 20–35 分鐘，視過海交通而定。',
    mapMode: 'transit',
  },
  'd3-tst': {
    from: 'Tsim Sha Tsui Star Ferry Pier Hong Kong',
    to: 'Avenue of Stars Hong Kong',
    method: '步行',
    duration: '約 10–15 分',
    headline: '尖沙咀天星碼頭 → 星光大道／維港海旁',
    steps: ['沿海旁往尖東方向散步，看維港日落。', '可視體力延伸至 K11 MUSEA。', '打開城巴 App 看 H2K 下一班與候車狀況，再決定繼續看日落或先去候車。'],
    note: '此段與 H2K 可依即時狀況調整：車快到／人潮增加就先上車；有餘裕就多留在海旁。',
    mapMode: 'walking',
  },
  'd3-h2k': {
    from: 'Tsim Sha Tsui Star Ferry Pier Bus Terminus Hong Kong',
    to: 'Central Ferry Pier Hong Kong',
    method: '巴士',
    duration: '約 80 分；依當日班次',
    headline: 'H2K：尖沙咀中途站上車 → 夜遊後回中環',
    steps: ['由天星碼頭出口 P2 一帶，依城巴 App 顯示前往 H2K 往中環方向的實際站點。', '先看下一班到站時間與候車人潮：車快到就優先排隊；否則先到海旁看日落。', '搭城巴 H2K「夜賞香港」，二樓後半部靠外側通常較適合夜景。', '抵達中環後步行至 SoHo 或蘭桂坊一帶用餐。'],
    note: '「逆向」是避開中環起點人潮的上車策略，不是反向搭 H1。這段與尖沙咀日落採「依即時狀況調序」，H2K 停站、班次、票價與天氣服務安排當天以城巴官方資訊為準。',
    mapMode: 'transit',
  },
  'd3-centralnight': {
    from: 'Central Ferry Pier Hong Kong',
    to: 'SoHo Hong Kong',
    method: '步行',
    duration: '約 15–20 分',
    headline: '中環碼頭 → 中環街市 → SoHo',
    steps: ['由中環碼頭往 IFC／中環街市方向步行。', '依胃口選擇正餐、甜點或飲料，避免勉強再塞一餐。', '晚間保留彈性，準備回灣仔飯店休息。'],
    mapMode: 'walking',
  },
  'd3-return': {
    from: 'SoHo Hong Kong',
    to: 'The Fleming Hong Kong',
    method: '港鐵',
    duration: '約 15–20 分',
    headline: '中環／香港站 → 灣仔站 A1',
    steps: ['步行至中環站，搭港島綫往柴灣方向。', '於灣仔站下車，由 A1 出口步行約 4 分鐘回 The Fleming。'],
    taxiBackup: '若晚間港鐵服務異常或兩人都很疲累，可由中環搭紅色市區的士直達「灣仔菲林明道 41 號・The Fleming」，正常路況約 10–15 分鐘。',
    mapMode: 'transit',
  },
  'd4-bakehouse': {
    from: 'The Fleming Hong Kong',
    to: 'Bakehouse Wan Chai Hong Kong',
    method: '步行',
    duration: '約 8–10 分',
    headline: '菲林明道 → 莊士敦道 → 大王東街',
    steps: ['從飯店沿菲林明道往南走。', '經莊士敦道前往大王東街 14 號 Bakehouse。'],
    note: 'Bakehouse 位於灣仔站 B2 出口步行約 4 分鐘的位置。',
    mapMode: 'walking',
  },
  'd4-capital': {
    from: 'Bakehouse Wan Chai Hong Kong',
    to: 'Capital Cafe Wan Chai Hong Kong',
    method: '步行',
    duration: '約 10–15 分',
    headline: 'Bakehouse → 灣仔華星冰室',
    steps: ['由大王東街步行回軒尼詩道北側街區。', '依步行導航前往華星冰室；不需搭港鐵。'],
    mapMode: 'walking',
  },
  'd4-lemon': {
    from: 'Capital Cafe Wan Chai Hong Kong',
    to: 'Lemon King Hong Kong',
    method: '港鐵',
    duration: '約 18–25 分',
    headline: '灣仔站 → 上環站 E1',
    steps: ['步行至灣仔站，搭港島綫往堅尼地城方向。', '於上環站下車，由 E1 出口右轉。', '步行約 2 分鐘至永吉街 18 號檸檬王。'],
    mapMode: 'transit',
  },
  'd4-lastmeal': {
    from: 'Lemon King Hong Kong',
    to: 'Wan Chai Hong Kong',
    method: '港鐵',
    duration: '約 15–20 分',
    headline: '上環站 E1 → 灣仔站',
    steps: ['由檸檬王步行回上環站 E1。', '搭港島綫往柴灣方向，於灣仔站下車。', '最後一餐尚未指定店家，確定後依導航選最接近的出口。'],
    note: '為了準時取行李，最後一餐建議選在灣仔站或 The Fleming 步行 10 分鐘內。',
    mapMode: 'transit',
  },
  'd4-luggage': {
    from: 'Wan Chai Hong Kong',
    to: 'The Fleming Hong Kong',
    method: '步行',
    duration: '約 5–10 分',
    headline: '灣仔最後一餐 → The Fleming 取行李',
    steps: ['選擇灣仔站附近餐廳，餐後直接步行回飯店。', '若最後一餐改到其他區域，13:15 前開啟導航返回飯店。'],
    mapMode: 'walking',
  },
  'd4-airport': {
    from: 'The Fleming Hong Kong',
    to: 'Hong Kong International Airport',
    method: '混合交通',
    duration: '約 45–60 分',
    headline: '灣仔站 → 中環／香港站 → 機場快綫機場站',
    steps: ['從飯店步行至灣仔站 A1 出口。', '搭港島綫往堅尼地城方向，於中環站下車。', '依站內「香港站／機場快綫」指標，經連通通道步行轉乘。', '香港站搭機場快綫，於機場站下車。', '依航空公司資訊前往一號客運大樓報到櫃檯。'],
    note: '帶行李時在中環／香港站依「機場快綫」與電梯指標前進；連通通道較長，建議另外預留 10 分鐘。',
    taxiBackup: '若機場快綫停駛、行李移動困難或已接近最晚出發時間，可由飯店搭紅色市區的士直達香港機場一號客運大樓，正常路況約 35–50 分鐘；尖峰時段需再預留塞車時間。',
    mapMode: 'transit',
  },
  'd4-flight': {
    from: 'Hong Kong International Airport Station',
    to: 'Hong Kong International Airport Departures',
    method: '步行',
    duration: '約 10–15 分',
    headline: '機場站 → 航空公司報到櫃檯 → 安檢／登機門',
    steps: ['機場快綫下車後依航空公司與航班看板前往報到區。', '完成報到、托運與安檢後，再依即時看板前往登機門。'],
    mapMode: 'walking',
  },
}

const diningInfo: Record<string, DiningInfo> = {
  'd1-adc': {
    estimate: 'HK$150–220／兩人',
    payment: '準備港幣現金',
    cashNeed: 'HK$150–220',
    basis: '兩份早餐／茶餐、兩杯飲品，加一份燉奶共享。',
    note: '目前資料顯示每人約 HK$50–80；多點甜品或單點炒蛋時預算會再增加。',
  },
  'd1-mak': {
    estimate: 'HK$150–230／兩人',
    payment: '準備港幣現金',
    cashNeed: 'HK$150–230',
    basis: '兩碗鮮蝦雲吞麵、一份蠔油芥蘭；有胃口再加一份南乳豬手。',
    note: '傳統麵店的電子付款可能調整，進店前先看收銀處標示。',
  },
  'd1-kai': {
    estimate: 'HK$65–95／兩人',
    payment: '準備港幣現金',
    cashNeed: 'HK$65–95',
    basis: '每人一碗糖水；一般款約 HK$29 起，楊枝甘露等較高價。',
  },
  'd2-disney': {
    estimate: 'HK$400–600／兩人／園內餐飲',
    payment: '刷信用卡',
    cashNeed: 'HK$0',
    basis: '兩份園內套餐約 HK$160 上下，加兩杯飲品與 1–2 份共享點心。',
    note: '不含門票與商品；若早餐吃得飽，可把午餐改成輕食，預算降到約 HK$300–400。',
  },
  'd2-dinner': {
    estimate: 'HK$950–1,250／兩人',
    payment: '刷信用卡',
    cashNeed: 'HK$0',
    basis: '以兩人 Disney Friends 點心套餐或相近份量晚餐估算，已預留 10% 服務費與基本飲品。',
    note: '角色點心須至少提前 24 小時預訂；加點主菜、酒精飲品或生日蛋糕會超出此範圍。',
  },
  'd3-dimsum': {
    estimate: 'HK$280–420／兩人',
    payment: '刷信用卡',
    cashNeed: 'HK$0',
    basis: '兩人共享 5–6 籠／碟點心，加茶位與可能的 10% 服務費。',
    note: '上環店目前各類點心約 HK$30–48；拿點心前先看點心卡級別。',
  },
  'd3-kaukee': {
    estimate: 'HK$160–230／兩人',
    payment: '準備港幣現金',
    cashNeed: 'HK$160–230',
    basis: '一碗上湯牛爽腩伊麵、一碗咖喱牛筋腩河粉，加一份飲品或小食。',
    note: '老店付款規則可能臨時調整；排隊前確認身上至少有 HK$250 現金。',
  },
  'd3-yatlok': {
    estimate: 'HK$300–420／兩人',
    payment: '準備港幣現金',
    cashNeed: 'HK$300–420',
    basis: '共享 1/4 隻燒鵝、兩份白飯或瀨粉，加一份青菜。',
    note: '若改成每人燒鵝飯而非 1/4 隻單點，通常可控制在 HK$180–260。',
  },
  'd3-centralnight': {
    estimate: 'HK$180–400／兩人',
    payment: '信用卡／現金皆可',
    cashNeed: 'HK$0–200',
    basis: '依胃口選一份輕食、甜點或飲料；若改吃完整晚餐，預算提高至 HK$400 以上。',
    note: '下午已安排三餐，晚間以不勉強吃飽為原則。',
  },
  'd4-bakehouse': {
    estimate: 'HK$140–240／兩人',
    payment: '刷信用卡',
    cashNeed: 'HK$0',
    basis: '現場兩個蛋撻與兩杯飲品，再外帶一盒 6 個蛋撻或其他麵包。',
    note: '若只現場吃兩個蛋撻、不買伴手禮，約 HK$30–80。',
  },
  'd4-capital': {
    estimate: 'HK$130–200／兩人',
    payment: '準備港幣現金',
    cashNeed: 'HK$130–200',
    basis: '兩份早餐／多士類餐點與兩杯奶茶；黑松露炒蛋或額外菠蘿油會接近上限。',
  },
  'd4-lastmeal': {
    estimate: '預留 HK$250–450／兩人',
    payment: '優先選可刷卡店家',
    cashNeed: 'HK$0',
    basis: '以一般灣仔茶餐廳、燒味或粉麵店的兩人最後一餐作預算上限。',
    note: '若最後改吃現金店家，請從緩衝金支出，或再增加約 HK$250–450 現金。',
  },
}

const confirmations = [
  { id: 'h2k', label: 'H2K 班次、尖沙咀往中環站點與開篷安排', deadline: '8/28 當日', url: 'https://www.hkcitysightseeing.com/' },
  { id: 'disney-hours', label: 'Disney 開園與 Momentous 時間', deadline: '8/26 前', url: 'https://www.hongkongdisneyland.com/calendars/day/' },
  { id: 'disney-booking', label: '晶荷軒／生日晚餐訂位', deadline: '越早越好', url: 'https://www.hongkongdisneyland.com/dining/hong-kong-disneyland-hotel/crystal-lotus/' },
  { id: 'symphony', label: '幻彩詠香江當日演出', deadline: '8/26 當日', url: 'https://www.tourism.gov.hk/symphony/' },
  { id: 'restaurants-d1', label: 'Day 1 餐廳營業與休息日', deadline: '8/25', url: 'https://www.google.com/maps' },
  { id: 'restaurants-d3', label: '蓮香樓、九記、一樂營業狀態', deadline: '8/27', url: 'https://www.google.com/maps' },
  { id: 'shopping-d4', label: 'Bakehouse、檸檬王營業狀態', deadline: '8/28', url: 'https://www.google.com/maps' },
  { id: 'weather', label: '四天天氣、雨勢與颱風資訊', deadline: '每天確認', url: 'https://www.hko.gov.hk/tc/wxinfo/currwx/fnd.htm' },
]

const modeCopy: Record<TravelMode, { label: string; icon: string; title: string; body: string }> = {
  normal: { label: '照原計畫', icon: '✓', title: '原定節奏', body: '保留緩衝，不為了打卡壓縮休息與交通時間。' },
  rain: { label: '下雨了', icon: '☂', title: '雨天備案已開啟', body: '優先室內場域，縮短海旁與街區散步；核心訂位和 H2K 再看即時公告。' },
  tired: { label: '有點累', icon: '◡', title: '省體力模式已開啟', body: '先移除 Optional，再縮短步行；住宿、生日、H2K 與機場時限優先。' },
  queue: { label: '排太久', icon: '↻', title: '排隊備案已開啟', body: '單站排隊超過 30 分鐘就啟用替代店家或交換順序，避免整天連鎖延誤。' },
}

const mapUrl = (location: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
const directionsUrl = (transport: TransportInfo) => {
  const params = new URLSearchParams({
    api: '1',
    origin: transport.from,
    destination: transport.to,
    travelmode: transport.mapMode ?? 'transit',
  })
  return `https://www.google.com/maps/dir/?${params.toString()}`
}
const taxiDirectionsUrl = (transport: TransportInfo) => {
  const params = new URLSearchParams({
    api: '1',
    origin: transport.from,
    destination: transport.to,
    travelmode: 'driving',
  })
  return `https://www.google.com/maps/dir/?${params.toString()}`
}
const tripStart = new Date('2026-08-26T00:00:00+08:00')
const cityDeparture = new Date('2026-08-29T14:30:00+08:00')
const introStorageKey = 'hk-trip-intro-seen-v2'

function shouldShowIntro() {
  try {
    const forceReplay = new URLSearchParams(window.location.search).get('intro') === '1'
    return forceReplay || localStorage.getItem(introStorageKey) !== 'true'
  } catch {
    return true
  }
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) as T : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}

function hongKongDateKey(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now)
}

function defaultDayIndex() {
  const today = hongKongDateKey()
  const found = days.findIndex((day) => day.date === today)
  if (found >= 0) return found
  return today < days[0].date ? 0 : days.length - 1
}

function formatCountdown(target: Date, now: Date) {
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return null
  const totalMinutes = Math.floor(diff / 60_000)
  const daysLeft = Math.floor(totalMinutes / 1440)
  const hoursLeft = Math.floor((totalMinutes % 1440) / 60)
  const minutesLeft = totalMinutes % 60
  if (daysLeft > 0) return `${daysLeft} 天 ${hoursLeft} 小時`
  return `${hoursLeft} 小時 ${minutesLeft} 分`
}

function App() {
  const [showIntro, setShowIntro] = useState(shouldShowIntro)
  const [selectedDay, setSelectedDay] = useState(defaultDayIndex)
  const [statuses, setStatuses] = useLocalStorage<Record<string, ItemStatus>>('hk-trip-statuses', {})
  const [mode, setMode] = useLocalStorage<TravelMode>('hk-trip-mode', 'normal')
  const [checked, setChecked] = useLocalStorage<Record<string, string>>('hk-trip-confirmations', {})
  const [openPlan, setOpenPlan] = useState<string | null>(null)
  const [now, setNow] = useState(() => new Date())
  const shouldFocusAfterIntro = useRef(false)
  const day = days[selectedDay]
  const todayKey = hongKongDateKey(now)
  const isTripDay = days.some((candidate) => candidate.date === todayKey)

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(interval)
  }, [])

  const todayIndex = days.findIndex((candidate) => candidate.date === todayKey)
  const liveDay = todayIndex >= 0 ? days[todayIndex] : day
  const nextItem = useMemo(() => {
    const remaining = liveDay.items.filter((item) => statuses[item.id] !== 'done' && statuses[item.id] !== 'skipped')
    if (!isTripDay) return remaining[0]
    const currentMinutes = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Hong_Kong', hour: '2-digit', minute: '2-digit', hour12: false }).format(now).split(':')[0]) * 60
      + Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Hong_Kong', hour: '2-digit', minute: '2-digit', hour12: false }).format(now).split(':')[1])
    return remaining.find((item) => {
      const [hours, minutes] = item.sortTime.split(':').map(Number)
      return hours * 60 + minutes >= currentMinutes - 30
    }) ?? remaining[0]
  }, [isTripDay, liveDay, now, statuses])
  const nextTransport = nextItem ? transports[nextItem.id] : undefined

  const completedCount = day.items.filter((item) => statuses[item.id] === 'done').length
  const confirmationCount = confirmations.filter((item) => checked[item.id]).length
  const tripCountdown = formatCountdown(tripStart, now)
  const airportCountdown = formatCountdown(cityDeparture, now)
  const afterCityDeparture = now >= cityDeparture
  const isDepartureDay = todayKey === '2026-08-29'

  const updateStatus = (itemId: string, status: ItemStatus) => {
    setStatuses((current) => {
      const next = { ...current }
      if (next[itemId] === status) delete next[itemId]
      else next[itemId] = status
      return next
    })
  }

  const toggleConfirmation = (id: string) => {
    setChecked((current) => {
      const next = { ...current }
      if (next[id]) delete next[id]
      else next[id] = new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', month: 'numeric', day: 'numeric' }).format(new Date())
      return next
    })
  }

  const jumpToToday = () => {
    setSelectedDay(todayIndex >= 0 ? todayIndex : defaultDayIndex())
    document.getElementById('today')?.scrollIntoView({ behavior: 'smooth' })
  }

  const dismissIntro = () => {
    try {
      localStorage.setItem(introStorageKey, 'true')
    } catch {
      // The intro can still be dismissed when browser storage is unavailable.
    }
    shouldFocusAfterIntro.current = true
    setShowIntro(false)
  }

  const replayIntro = () => {
    window.scrollTo({ top: 0 })
    setShowIntro(true)
  }

  const handleIntroExitComplete = () => {
    if (!shouldFocusAfterIntro.current) return
    shouldFocusAfterIntro.current = false
    document.getElementById('site-main-heading')?.focus()
  }

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence onExitComplete={handleIntroExitComplete}>
        {showIntro && (
          <IntroExperience
            key="hong-kong-trip-intro"
            onComplete={dismissIntro}
            posterSrc={`${import.meta.env.BASE_URL}trip-poster.jpg`}
          />
        )}
      </AnimatePresence>

      <main aria-hidden={showIntro || undefined} inert={showIntro || undefined} className="min-h-screen bg-[#f5efe5] text-[#18211c]">
      <section id="today" className="safe-gutter hero-section relative overflow-hidden bg-[#153b2e] px-5 pb-10 pt-8 text-white sm:px-8 sm:pb-14 sm:pt-12">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#f8c950]">Hong Kong · 2026</p>
            <button onClick={jumpToToday} className="home-button rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-white">回到今天</button>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div>
              <p className="text-sm font-bold text-[#b9d4c8]">{isTripDay ? `${liveDay.displayDate} · 旅途中` : tripCountdown ? `離出發還有 ${tripCountdown}` : '香港生日旅行'}</p>
              <h1 id="site-main-heading" tabIndex={-1} className="mt-3 max-w-3xl text-4xl font-black leading-[1.05] outline-none sm:text-6xl">下一步，<br /><span className="text-[#f8c950]">就去這裡。</span></h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/70 sm:text-base">打開就知道下一站、怎麼去，以及行程變動時該保留什麼。</p>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-[#f8c950] px-3 py-1 text-[11px] font-black text-[#153b2e]">NEXT STOP</span>
                <span className="text-sm font-black text-white/70">{nextItem?.time ?? '完成'}</span>
              </div>
              <h2 className="mt-5 text-2xl font-black">{nextItem?.place ?? '今天的行程完成了'}</h2>
              <p className="mt-2 text-sm leading-6 text-white/65">{nextItem?.note ?? '好好休息，明天再繼續。'}</p>
              {nextTransport && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="flex items-center justify-between gap-3 text-xs font-black">
                    <span className="text-[#f8c950]">{nextTransport.method}</span>
                    <span className="text-white/55">{nextTransport.duration}</span>
                  </div>
                  <p className="mt-2 text-sm font-bold leading-6 text-white/85">{nextTransport.headline}</p>
                </div>
              )}
              {nextItem?.location && (
                <a className="mt-5 flex min-h-12 items-center justify-center rounded-2xl bg-white px-4 text-sm font-black text-[#153b2e]" href={nextTransport ? directionsUrl(nextTransport) : mapUrl(nextItem.location)} target="_blank" rel="noreferrer">{nextTransport ? '開啟點到點路線 ↗' : '開始導航 ↗'}</a>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <InfoCard label="TRIP" value="8/26–8/29 · 4 days" />
            <InfoCard label="BIRTHDAY" value="8/27 · Disneyland" />
            <InfoCard className="col-span-2 sm:col-span-1" label="READY" value={`${confirmationCount}/${confirmations.length} 項已確認`} />
          </div>

          <figure className="mt-6 overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/15 p-1.5 shadow-2xl sm:mt-8 sm:rounded-[2.25rem] sm:p-2">
            <img
              src={`${import.meta.env.BASE_URL}trip-poster.jpg`}
              alt="香港 2026 生日旅行海報：維港天際線、開篷巴士、城堡、生日蛋糕與蛋撻"
              className="h-auto w-full rounded-[1.4rem] sm:rounded-[1.8rem]"
              decoding="async"
              fetchPriority="high"
            />
          </figure>
        </div>
      </section>

      <nav aria-label="頁面區段" className="safe-gutter sticky top-0 z-30 border-b border-black/5 bg-[#f5efe5]/92 px-4 py-2 backdrop-blur-xl sm:px-8 sm:py-3">
        <div className="mobile-nav mx-auto grid max-w-6xl grid-cols-5 gap-1 text-xs font-black sm:flex sm:gap-2 sm:text-sm">
          <a className="nav-pill" href="#today">現在</a>
          <a className="nav-pill" href="#itinerary">行程</a>
          <a className="nav-pill" href="#plan-b">Plan B</a>
          <a className="nav-pill" href="#confirmations">確認</a>
          <a className="nav-pill" href="#airport">機場</a>
        </div>
      </nav>

      <section id="plan-b" className="safe-gutter mx-auto max-w-6xl px-5 pt-10 sm:px-8 sm:pt-14">
        <SectionTitle eyebrow="QUICK ADJUST" title="現在的旅行狀態" description="情況有變就切換模式，每個行程會顯示對應備案。" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.keys(modeCopy) as TravelMode[]).map((key) => (
            <button key={key} onClick={() => setMode(key)} aria-pressed={mode === key} className={`mode-button ${mode === key ? 'mode-button-active' : ''}`}>
              <span className="text-xl" aria-hidden="true">{modeCopy[key].icon}</span>
              <span>{modeCopy[key].label}</span>
            </button>
          ))}
        </div>
        <div className={`mt-3 rounded-3xl p-5 ${mode === 'normal' ? 'bg-white' : 'bg-[#ffe49a]'}`}>
          <p className="font-black">{modeCopy[mode].title}</p>
          <p className="mt-1 text-sm leading-6 text-black/60">{modeCopy[mode].body}</p>
        </div>
      </section>

      <section id="itinerary" className="safe-gutter mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <SectionTitle eyebrow="ITINERARY" title="四天行程" description="每一站都有點到點交通；點開交通卡可看上車站、轉乘、下車站與出口。" />
          <p className="w-fit rounded-full bg-[#dceadf] px-4 py-2 text-xs font-black text-[#24513e]">{completedCount}/{day.items.length} 已完成</p>
        </div>

        <div className="cash-summary mt-7">
          <div>
            <p className="cash-summary-eyebrow">兩人換匯建議</p>
            <p className="cash-summary-total">準備 HK$2,000 現金</p>
            <p className="cash-summary-note">早餐已預訂；Disney、可刷卡餐廳、港鐵與機場快綫均不計入現金。</p>
          </div>
          <div className="cash-summary-breakdown">
            <p><span>現金型餐飲</span><strong>HK$1,135–1,715</strong></p>
            <p><span>零用／交通緩衝</span><strong>HK$285–865</strong></p>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-4 gap-2" role="tablist" aria-label="選擇行程日期">
          {days.map((candidate, index) => (
            <button key={candidate.id} role="tab" aria-selected={selectedDay === index} onClick={() => setSelectedDay(index)} className={`day-tab ${selectedDay === index ? 'day-tab-active' : ''}`}>
              <span className="text-xl sm:text-2xl">{candidate.accent}</span>
              <span className="mt-1 text-[11px] font-black sm:text-sm">{candidate.displayDate.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <article className="mt-4 overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-sm">
          <header className="flex items-start justify-between gap-4 border-b border-black/5 px-5 py-6 sm:px-7">
            <div>
              <p className="text-xs font-black tracking-[0.16em] text-[#c94932]">{day.displayDate}</p>
              <h2 className="mt-1 text-2xl font-black sm:text-3xl">{day.title}</h2>
              <p className="mt-1 text-sm text-black/50">{day.stay}</p>
            </div>
            <span className="text-4xl">{day.accent}</span>
          </header>

          <div className="px-4 py-2 sm:px-7">
            {day.items.map((item) => {
              const status = statuses[item.id]
              const transport = transports[item.id]
              const dining = diningInfo[item.id]
              const showPlan = Boolean(item.planB && (openPlan === item.id || mode !== 'normal'))
              return (
                <div key={item.id} className={`timeline-item ${status === 'done' ? 'timeline-done' : ''} ${status === 'skipped' ? 'timeline-skipped' : ''}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#c94932] sm:text-sm">{item.time}</span>
                      <span className={`type-badge type-${item.type}`}>{item.type}</span>
                    </div>
                    <span className={`priority-badge ${item.priority === 'must' ? 'priority-must' : ''}`}>{item.priority === 'must' ? '必留' : '彈性'}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-black">{item.place}</h3>
                  <p className="mt-1 text-sm leading-6 text-black/55">{item.note}</p>

                  {dining && (
                    <div className="dining-card mt-4">
                      <div className="dining-grid">
                        <div>
                          <p className="dining-label">兩人預估</p>
                          <p className="dining-price">{dining.estimate}</p>
                        </div>
                        <div>
                          <p className="dining-label">建議付款</p>
                          <p className="dining-payment">{dining.payment}</p>
                        </div>
                        <div className="dining-cash-block">
                          <p className="dining-label">需準備現金</p>
                          <p className={`dining-cash ${dining.cashNeed === 'HK$0' ? 'dining-cash-zero' : ''}`}>{dining.cashNeed}</p>
                        </div>
                      </div>
                      <div className="dining-basis">
                        <p><span>估價內容</span>{dining.basis}</p>
                        {dining.note && <p><span>注意</span>{dining.note}</p>}
                      </div>
                    </div>
                  )}

                  {transport && (
                    <details className="transport-card mt-4">
                      <summary className="transport-summary">
                        <span className="transport-icon" aria-hidden="true">{transportIcon(transport.method)}</span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-xs font-black text-[#c94932]">從上一站前往</span>
                            <span className="text-[11px] font-bold text-black/40">{transport.method} · {transport.duration}</span>
                          </span>
                          <span className="mt-1 block text-sm font-black leading-5 text-[#18211c]">{transport.headline}</span>
                        </span>
                        <span className="transport-chevron" aria-hidden="true">⌄</span>
                      </summary>
                      <div className="transport-details">
                        <div className="transport-endpoints">
                          <p><span>起點</span>{transport.from}</p>
                          <p><span>終點</span>{transport.to}</p>
                        </div>
                        <ol className="transport-steps">
                          {transport.steps.map((step, index) => <li key={`${item.id}-transport-${index}`}>{step}</li>)}
                        </ol>
                        {transport.note && <p className="transport-note"><span className="font-black">補充：</span>{transport.note}</p>}
                        {transport.taxiBackup && (
                          <div className="taxi-backup">
                            <p className="taxi-backup-title"><span aria-hidden="true">的</span>計程車／的士備案</p>
                            <p>{transport.taxiBackup}</p>
                            <a href={taxiDirectionsUrl(transport)} target="_blank" rel="noreferrer">開啟叫車路線 ↗</a>
                          </div>
                        )}
                        <a className="transport-map-link" href={directionsUrl(transport)} target="_blank" rel="noreferrer">開啟點到點導航 ↗</a>
                      </div>
                    </details>
                  )}

                  {showPlan && (
                    <div className="mt-3 rounded-2xl bg-[#fff3cf] p-4 text-sm leading-6 text-[#5d4310]">
                      <span className="font-black">備案：</span>{item.planB}
                    </div>
                  )}

                  <div className="timeline-actions mt-4">
                    {item.location && <a className="action-button action-primary action-map" href={mapUrl(item.location)} target="_blank" rel="noreferrer">導航 ↗</a>}
                    <button className={`action-button ${status === 'done' ? 'action-selected' : ''}`} onClick={() => updateStatus(item.id, 'done')}>✓ 完成</button>
                    <button className={`action-button ${status === 'later' ? 'action-selected' : ''}`} onClick={() => updateStatus(item.id, 'later')}>延後</button>
                    <button className={`action-button ${status === 'skipped' ? 'action-selected' : ''}`} onClick={() => updateStatus(item.id, 'skipped')}>跳過</button>
                    {item.planB && mode === 'normal' && <button className="action-button action-plan" onClick={() => setOpenPlan(openPlan === item.id ? null : item.id)}>{openPlan === item.id ? '收起備案' : 'Plan B'}</button>}
                  </div>
                </div>
              )
            })}
          </div>
        </article>
      </section>

      <section id="confirmations" className="safe-gutter bg-[#e6dbc8] px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionTitle eyebrow="FRESHNESS CHECK" title="出發前確認中心" description="有時效的資訊不要靠記憶；點進官方來源後，記錄最後確認日期。" />
            <span className="w-fit text-sm font-black">{confirmationCount}/{confirmations.length} 完成</span>
          </div>
          <div className="mt-7 grid gap-3 lg:grid-cols-2">
            {confirmations.map((item) => (
              <div key={item.id} className={`confirmation-card ${checked[item.id] ? 'confirmation-done' : ''}`}>
                <button className="confirmation-check" onClick={() => toggleConfirmation(item.id)} aria-label={`${checked[item.id] ? '取消確認' : '標示已確認'}：${item.label}`}>
                  {checked[item.id] ? '✓' : ''}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="font-black">{item.label}</p>
                  <p className="mt-1 text-xs text-black/45">{checked[item.id] ? `上次確認：${checked[item.id]}` : `建議確認：${item.deadline}`}</p>
                </div>
                <a href={item.url} target="_blank" rel="noreferrer" className="source-link">查看 ↗</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="airport" className="safe-gutter px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-[#c94932] text-white lg:grid-cols-[.9fr_1.1fr]">
          <div className="p-6 sm:p-9">
            <p className="text-xs font-black tracking-[0.18em] text-[#ffd9c6]">AIRPORT CLOCK</p>
            <h2 className="mt-2 text-3xl font-black">最晚 14:30<br />離開市區</h2>
            <div className="mt-7 rounded-2xl bg-black/15 p-5">
              <p className="text-xs font-bold text-white/65">{isDepartureDay ? '距離離開市區' : '8/29 離開市區倒數'}</p>
              <p className="mt-1 text-2xl font-black">{afterCityDeparture ? '該前往機場了' : airportCountdown ?? '行程已完成'}</p>
            </div>
          </div>
          <div className="bg-[#fff5e7] p-6 text-[#3d241c] sm:p-9">
            <ol className="space-y-5">
              <AirportStep time="13:30" title="最後一餐結束" note="停止新增行程，回灣仔。" />
              <AirportStep time="14:00" title="飯店取行李" note="確認護照、伴手禮與充電設備。" />
              <AirportStep time="14:30" title="離開香港市區" note="延誤時直接採用最快交通方式。" />
              <AirportStep time="16:00" title="抵達 HKG" note="預留報到、安檢與找登機門時間。" />
            </ol>
            <a href={mapUrl('Hong Kong International Airport Departures')} target="_blank" rel="noreferrer" className="mt-7 flex min-h-12 items-center justify-center rounded-2xl bg-[#3d241c] px-4 text-sm font-black text-white">導航到香港機場 ↗</a>
          </div>
        </div>
      </section>

      <section className="safe-gutter px-5 pb-14 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 rounded-[2rem] border border-black/5 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="font-black">離線也能看</p>
            <p className="mt-1 text-sm leading-6 text-black/50">首次載入後會保留行程；可從瀏覽器選單加入主畫面。</p>
          </div>
          <span className="w-fit rounded-full bg-[#dceadf] px-4 py-2 text-xs font-black text-[#24513e]">Offline ready</span>
        </div>
      </section>

        <footer className="safe-gutter safe-footer flex flex-col items-center justify-center gap-2 border-t border-black/5 px-5 py-8 text-center text-xs text-black/35 sm:flex-row sm:gap-3">
          <span>Hong Kong Birthday Trip · Aug 26–29, 2026</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <button type="button" onClick={replayIntro} className="min-h-11 rounded-full px-4 font-black text-[#24513e] transition-colors hover:bg-black/5 focus-visible:bg-black/5">重播開場</button>
        </footer>
      </main>
    </MotionConfig>
  )
}

function InfoCard({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-white/5 p-4 ${className}`}><p className="text-[10px] font-black tracking-[0.2em] text-white/45">{label}</p><p className="mt-2 text-sm font-bold">{value}</p></div>
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div><p className="text-xs font-black tracking-[0.2em] text-[#c94932]">{eyebrow}</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">{title}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-black/50 sm:text-base">{description}</p></div>
}

function AirportStep({ time, title, note }: { time: string; title: string; note: string }) {
  return <li className="grid grid-cols-[56px_1fr] gap-3"><span className="text-sm font-black text-[#c94932]">{time}</span><div><p className="font-black">{title}</p><p className="mt-1 text-sm text-black/50">{note}</p></div></li>
}

function transportIcon(method: TransportInfo['method']) {
  if (method === '步行') return '步'
  if (method === '港鐵') return '鐵'
  if (method === '巴士') return '巴'
  if (method === '飯店接駁') return '接'
  return '轉'
}

export default App
