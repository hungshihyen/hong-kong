const days = [
  {
    date: '8/26 Wed',
    title: 'Hello Hong Kong',
    stay: "Disney's Hollywood Hotel",
    accent: '🌃',
    items: [
      ['12:00', '抵達香港機場', '入境、領行李後前往迪士尼飯店'],
      ['14:00', 'Hollywood Hotel', '寄放行李 / Check-in'],
      ['15:30', '澳洲牛奶公司', '炒蛋多士、燉奶；第一餐不要吃太飽'],
      ['17:00', '尖沙咀・維多利亞港', '星光大道、Golden Hour、夜景'],
      ['20:00', '幻彩詠香江', '看完後可搭天星小輪'],
      ['21:00', '麥文記麵家', '鮮蝦雲吞麵'],
      ['21:40', '佳佳甜品', '芝麻糊 / 寧波薑汁湯丸'],
      ['22:30', '返回 Disney', '留體力給生日 Disney Day'],
    ],
  },
  {
    date: '8/27 Thu',
    title: 'Birthday Disney Day',
    stay: "Disney's Hollywood Hotel",
    accent: '🎂',
    items: [
      ['08:00', '飯店早餐', '輕鬆開始生日的一天'],
      ['09:00', '香港迪士尼', 'World of Frozen、Mystic Manor、Big Grizzly 等'],
      ['全天', 'Disney Birthday', '拍照、遊行、表演，行程不塞市區'],
      ['晚上', 'Momentous', '留到夜間城堡表演結束'],
      ['晚餐', '晶荷軒（Optional）', '若想要生日儀式感，可提前預訂'],
    ],
  },
  {
    date: '8/28 Fri',
    title: 'Eat Hong Kong + H1',
    stay: 'The Fleming・灣仔',
    accent: '🚌',
    items: [
      ['08:00', 'Disney Check-out', '移動到灣仔 The Fleming 寄放行李'],
      ['10:00', '蓮香樓早茶', '這趟的核心必吃：蝦餃、燒賣、鳳爪、排骨、馬拉糕'],
      ['12:30', '九記牛腩', '上湯牛爽腩 + 咖喱牛筋腩，建議共享'],
      ['14:30', '一樂燒鵝', '1/4 燒鵝 + 白飯 / 瀨粉'],
      ['15:30', 'H1 懷舊之旅', '二樓前排；班次與上車點出發前再確認'],
      ['19:00', '九龍美食夜', '看胃口補煲仔飯、街頭小吃或糖水'],
      ['22:00', '回 The Fleming', '灣仔住宿，隔天採買也順路'],
    ],
  },
  {
    date: '8/29 Sat',
    title: 'Last Bites & Shopping',
    stay: '18:00 HKG departure',
    accent: '🥧',
    items: [
      ['08:00', 'Bakehouse 灣仔', '酸種蛋撻：現場吃 + 當天買回台灣'],
      ['09:00', '華星冰室', '黑松露炒蛋多士 / 奶茶 / 菠蘿油'],
      ['10:30', '上環檸檬王', '甘草檸檬、陳皮、話梅等伴手禮'],
      ['12:00', '香港 Last Meal', '留給前三天沒吃到的遺珠'],
      ['14:00', '回飯店拿行李', '約 14:30–15:00 離開市區'],
      ['16:00', '抵達香港機場', '預留國際線報到與安檢時間'],
      ['18:00', '返程', '香港生日旅行完成 ✈️'],
    ],
  },
]

const foods = [
  ['澳洲牛奶公司', '茶餐廳', '炒蛋多士・燉奶', '8/26'],
  ['麥文記麵家', '雲吞麵', '鮮蝦雲吞麵', '8/26'],
  ['佳佳甜品', '港式糖水', '芝麻糊・湯丸', '8/26'],
  ['蓮香樓', '早茶', '蝦餃・燒賣・鳳爪', '8/28 必吃'],
  ['九記牛腩', '牛腩', '上湯牛爽腩', '8/28'],
  ['一樂燒鵝', '燒味', '1/4 燒鵝', '8/28'],
  ['Bakehouse', '蛋撻', '酸種蛋撻', '8/29'],
  ['華星冰室', '茶餐廳', '黑松露炒蛋', '8/29'],
  ['檸檬王', '伴手禮', '甘草檸檬', '8/29'],
]

const mapUrl = (name: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' Hong Kong')}`

function App() {
  return (
    <main className="min-h-screen bg-[#f7f1e8] text-slate-900">
      <section className="relative overflow-hidden bg-slate-950 px-5 pb-12 pt-10 text-white sm:px-8">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-rose-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-amber-300/15 blur-3xl" />
        <div className="relative mx-auto max-w-5xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-amber-300">Hong Kong · 2026</p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-6xl">生日旅行，<br />吃遍香港。 🎂🇭🇰</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">8/26–8/29 · Disney Birthday · H1 懷舊之旅 · 早茶 · 經典香港美食</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <InfoCard label="ARRIVAL" value="8/26 · 12:00 HKG" />
            <InfoCard label="BIRTHDAY" value="8/27 · Hong Kong Disneyland" />
            <InfoCard label="DEPARTURE" value="8/29 · 18:00 HKG" />
          </div>
        </div>
      </section>

      <nav className="sticky top-0 z-20 border-b border-black/5 bg-[#f7f1e8]/90 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto text-sm font-bold">
          <a className="nav-pill" href="#itinerary">行程</a>
          <a className="nav-pill" href="#food">必吃</a>
          <a className="nav-pill" href="#stays">住宿</a>
          <a className="nav-pill" href="#notes">提醒</a>
        </div>
      </nav>

      <section id="itinerary" className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <SectionTitle eyebrow="ITINERARY" title="四天行程" description="不追景點數量，把 Disney、夜景、H1 與香港美食排成順路的節奏。" />
        <div className="mt-8 space-y-6">
          {days.map((day) => (
            <article key={day.date} className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-sm">
              <header className="flex items-start justify-between gap-4 border-b border-black/5 px-5 py-5 sm:px-7">
                <div>
                  <p className="text-xs font-black tracking-[0.18em] text-rose-600">{day.date}</p>
                  <h2 className="mt-1 text-2xl font-black">{day.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{day.stay}</p>
                </div>
                <span className="text-4xl">{day.accent}</span>
              </header>
              <div className="px-5 py-2 sm:px-7">
                {day.items.map(([time, place, note]) => (
                  <div key={`${time}-${place}`} className="grid grid-cols-[64px_1fr] gap-3 border-b border-black/5 py-4 last:border-0 sm:grid-cols-[90px_1fr]">
                    <span className="pt-0.5 text-xs font-black text-rose-600 sm:text-sm">{time}</span>
                    <div>
                      <h3 className="font-extrabold">{place}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="food" className="bg-[#efe3d2] px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <SectionTitle eyebrow="MUST EAT" title="香港必吃清單" description="刻意不重複類型；每間店負責一種香港味道。" />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {foods.map(([name, type, order, day]) => (
              <a key={name} href={mapUrl(name)} target="_blank" rel="noreferrer" className="group rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-black text-white">{type}</span>
                  <span className="text-xs font-bold text-rose-600">{day}</span>
                </div>
                <h3 className="mt-5 text-xl font-black group-hover:text-rose-600">{name}</h3>
                <p className="mt-2 text-sm text-slate-500">必點：{order}</p>
                <p className="mt-5 text-xs font-bold text-slate-400">Google Maps ↗</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="stays" className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <SectionTitle eyebrow="STAYS" title="住宿節奏" description="前兩晚留在 Disney，第三晚搬到灣仔，讓吃喝與採買路線更有效率。" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <StayCard date="8/26–8/27" name="Disney's Hollywood Hotel" note="Disney Birthday base · 8/28 早上 Check-out" />
          <StayCard date="8/28" name="The Fleming · Wan Chai" note="Day 3 H1 後回灣仔，Day 4 買蛋撻與前往上環都很順" />
        </div>
      </section>

      <section id="notes" className="px-5 pb-14 sm:px-8">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-amber-200 p-6 sm:p-8">
          <p className="text-xs font-black tracking-[0.18em] text-amber-900">BEFORE DEPARTURE</p>
          <h2 className="mt-2 text-2xl font-black">出發前最後確認</h2>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-amber-950/80">
            <li>✓ H1 懷舊之旅當日班次、上車點與開篷安排</li>
            <li>✓ 蓮香樓、九記、一樂等店家營業時間與休息日</li>
            <li>✓ 8/27 Disney Momentous 時間與晶荷軒訂位</li>
            <li>✓ 8/29 Bakehouse、檸檬王營業狀態</li>
          </ul>
        </div>
      </section>

      <footer className="border-t border-black/5 px-5 py-8 text-center text-xs text-slate-400">Hong Kong Birthday Trip · Aug 26–29, 2026</footer>
    </main>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-[10px] font-black tracking-[0.2em] text-slate-400">{label}</p><p className="mt-2 text-sm font-bold">{value}</p></div>
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div><p className="text-xs font-black tracking-[0.2em] text-rose-600">{eyebrow}</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">{title}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">{description}</p></div>
}

function StayCard({ date, name, note }: { date: string; name: string; note: string }) {
  return <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm"><p className="text-xs font-black text-rose-600">{date}</p><h3 className="mt-2 text-xl font-black">{name}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{note}</p></div>
}

export default App
