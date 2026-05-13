import { Navbar } from '@/components/layout/Navbar'
import { ContactForm } from '@/components/ContactForm'
import { HeroCarousel } from '@/components/HeroCarousel'

export default function HomePage() {
  return (
    <main style={{ background: 'var(--navy)', color: 'var(--text)' }}>
      <Navbar />

      {/* HERO */}
      <HeroCarousel />

      {/* PHILOSOPHY */}
      <section id="about" className="px-[6%] py-24" style={{background:'var(--alt)'}}>
        <div className="max-w-[1200px] mx-auto">
          <SectionTag>Our Philosophy</SectionTag>
          <h2 className="font-serif text-[clamp(1.7rem,3vw,2.6rem)] font-bold mb-4">More Than a Consultant — A Thinking Partner</h2>
          <p className="text-[.95rem] leading-[1.8] mb-12 max-w-[520px]" style={{color:'var(--muted)'}}>We bridge research and real-world application, combining data, systems thinking, and sustainability to deliver structured solutions that actually get used.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[['🎯','Evidence-Based Decisions','Every recommendation is rooted in structured data and verified methodology — not assumption or trend-chasing.'],
              ['⚙️','Practical Innovation',"We don't deliver theory-heavy reports that gather dust. Our solutions are built to be implemented and iterated on."],
              ['🌿','Sustainability Thinking','Long-term impact is non-negotiable. We embed sustainability into every research system and strategy we produce.'],
              ['🔄','Cross-Sector Adaptability','Our frameworks travel across industries — making us broadly relevant while our core strength stays constant.']
            ].map(([icon,title,desc])=>(
              <PillarCard key={title} icon={icon} title={title} desc={desc} />
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="px-[6%] py-24">
        <div className="max-w-[1200px] mx-auto">
          <SectionTag>What We Do</SectionTag>
          <h2 className="font-serif text-[clamp(1.7rem,3vw,2.6rem)] font-bold mb-4">Our Service Architecture</h2>
          <p className="text-[.95rem] leading-[1.8] mb-12 max-w-[520px]" style={{color:'var(--muted)'}}>Structured, outcome-driven services designed around your most critical needs.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
            {[
              ['01 — Research','Research & Data Solutions','We design and execute research that informs decisions.',['Study design & methodology development','Data collection frameworks','Analysis, interpretation & reporting','Impact & policy research'],'"We turn questions into structured insights."'],
              ['02 — Digital Intelligence','Digital Survey & Field Intelligence','Modern data collection systems built for scale, speed, and reliability.',['Digital survey platforms & mobile data capture','Field data systems & workflows','Monitoring & evaluation tools','Real-time data tracking'],'"Smarter, faster, more reliable data collection."'],
              ['03 — Sustainability','Sustainability, Energy & Environmental Consulting','Domain expertise built for the long term.',['Energy systems analysis','Environmental impact assessments','Waste & circular economy studies','Sustainability strategy development'],'"Solutions that are effective and sustainable."'],
              ['04 — Advisory','Advisory & Strategic Consulting','High-level thinking when you need it most.',['Project design & structuring','Policy & program advisory','Organizational strategy support','Technical consulting for research projects'],'"Better decisions, with clarity and structure."'],
            ].map(([num,title,desc,items,value])=>(
              <ServiceCard key={String(num)} num={num as string} title={title as string} desc={desc as string} items={items as string[]} value={value as string} />
            ))}
          </div>
        </div>
      </section>

      {/* CLIENTS */}
      <section id="clients" className="px-[6%] py-24" style={{background:'var(--alt)'}}>
        <div className="max-w-[1200px] mx-auto">
          <SectionTag>Who We Serve</SectionTag>
          <h2 className="font-serif text-[clamp(1.7rem,3vw,2.6rem)] font-bold mb-4">Built For Organizations That Run on Data</h2>
          <p className="text-[.95rem] leading-[1.8] mb-12 max-w-[520px]" style={{color:'var(--muted)'}}>If your work depends on data, research, or impact — we are relevant to you.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[['🏢','Businesses & Corporations','Market insights, operational data analysis, and sustainability strategy for forward-thinking companies.'],
              ['🤝','NGOs & Development Organizations','Impact assessment, M&E systems, and field research built to meet donor standards and program goals.'],
              ['🎓','Academic & Research Institutions','Research design, data systems, and collaborative study support for institutions producing world-class work.'],
              ['🏛️','Government & Policy Stakeholders','Evidence-based policy support and large-scale data projects for agencies driving public sector decisions.']
            ].map(([icon,title,desc])=>(
              <div key={title} className="rounded-2xl p-8 border transition-all duration-300 cursor-default hover:-translate-y-1"
                style={{background:'var(--card-bg)',borderColor:'var(--card-border)'}}>
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="text-[.97rem] font-bold mb-2">{title}</h3>
                <p className="text-[.84rem] leading-[1.65]" style={{color:'var(--muted)'}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APPROACH */}
      <section id="approach" className="px-[6%] py-24" style={{background:'var(--alt)'}}>
        <div className="max-w-[1200px] mx-auto text-center">
          <SectionTag center>How We Work</SectionTag>
          <h2 className="font-serif text-[clamp(1.7rem,3vw,2.6rem)] font-bold mb-4">Our Methodology</h2>
          <p className="text-[.95rem] leading-[1.8] mb-12 max-w-[520px] mx-auto" style={{color:'var(--muted)'}}>Simple, methodical, professional — converting complex problems into clear, actionable outcomes.</p>
          <div className="max-w-[740px] mx-auto text-left">
            {[['01','Understand the Problem','We start by deeply understanding your context, constraints, and goals — before recommending anything.'],
              ['02','Design a Structured Solution','Using the right frameworks and methodologies, we design a solution tailored to your specific challenge.'],
              ['03','Implement With the Right Tools','We deploy proven digital and research tools — spanning collection, processing, and advanced analytics — to bring the solution to life.'],
              ['04','Analyze & Interpret Data','Raw data becomes structured intelligence through our rigorous analysis and interpretation process.'],
              ['05','Deliver Actionable Recommendations',"You receive clear, practical recommendations — not just reports — that your team can act on immediately."],
            ].map(([num,title,desc], i, arr)=>(
              <div key={num} className="flex gap-7 items-start relative">
                {i < arr.length-1 && <div className="absolute left-[21px] top-[46px] w-[2px] bottom-[-1rem]" style={{background:'linear-gradient(to bottom,var(--accent),transparent)'}}/>}
                <div className="w-11 h-11 flex-shrink-0 rounded-full flex items-center justify-center text-[.83rem] font-bold border-[1.5px] transition-all duration-300 hover:text-[var(--text-on-accent)]"
                  style={{background:'rgba(0,198,162,.1)',borderColor:'var(--accent)',color:'var(--accent)'}}>
                  {num}
                </div>
                <div className="flex-1 rounded-2xl p-5 mb-4 border transition-all duration-300 hover:border-[rgba(0,198,162,.3)]"
                  style={{background:'var(--card-bg)',borderColor:'var(--card-border)'}}>
                  <h3 className="text-[.97rem] font-bold mb-1">{title}</h3>
                  <p className="text-[.85rem] leading-[1.65]" style={{color:'var(--muted)'}}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSIGHTS */}
      <section id="insights" className="px-[6%] py-24">
        <div className="max-w-[1200px] mx-auto">
          <SectionTag>Knowledge Hub</SectionTag>
          <h2 className="font-serif text-[clamp(1.7rem,3vw,2.6rem)] font-bold mb-4">Perspectives & Insights</h2>
          <p className="text-[.95rem] leading-[1.8] mb-12 max-w-[520px]" style={{color:'var(--muted)'}}>Our thinking on sustainability, research methods, data systems, and the future of consulting.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {[['Data Systems','Why Most Field Data Collection Fails — And How to Fix It','The gap between field reality and digital design kills data quality. Here is the framework we use to close it.'],
              ['Sustainability','Circular Economy in Practice: Translating Strategy Into Operations','Most sustainability strategies look good on paper. We explore what it takes to operationalize them.'],
              ['Research Methods','The Hidden Cost of Weak Research Design in Development Projects','Poor methodology costs more than money. We break down the compounding impact on program outcomes.']
            ].map(([cat,title,desc])=>(
              <div key={title} className="rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,.4)] cursor-pointer"
                style={{background:'var(--card-bg)',borderColor:'var(--card-border)'}}>
                <div className="h-[5px]" style={{background:'linear-gradient(90deg,var(--accent),var(--gold))'}}/>
                <div className="p-7">
                  <div className="text-[.69rem] font-semibold tracking-[.1em] uppercase mb-2" style={{color:'var(--accent)'}}>{cat}</div>
                  <h3 className="text-[.97rem] font-bold mb-2 leading-[1.45]">{title}</h3>
                  <p className="text-[.83rem] leading-[1.65]" style={{color:'var(--muted)'}}>{desc}</p>
                  <div className="mt-4 text-[.8rem] font-semibold flex items-center gap-1.5 transition-all" style={{color:'var(--accent)'}}>Read More →</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="px-[6%] py-24 relative overflow-hidden text-center">
        <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(circle 300px at 50% 50%,rgba(0,198,162,.07),transparent)'}}/>
        <div className="relative max-w-[700px] mx-auto">
          <SectionTag center>Get In Touch</SectionTag>
          <h2 className="font-serif text-[clamp(1.7rem,3vw,2.6rem)] font-bold mb-4">Let&apos;s Design Your Next Project Together</h2>
          <p className="text-[.95rem] leading-[1.8] mb-10 max-w-[520px] mx-auto" style={{color:'var(--muted)'}}>Tell us what you&apos;re working on. We&apos;ll respond within 24 hours.</p>
          <ContactForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-[6%] pt-12 pb-7 border-t" style={{background:'var(--footer-bg)',borderColor:'var(--card-border)'}}>
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            <div>
              <a href="#hero" className="font-serif text-xl font-bold block mb-3" style={{ color: 'var(--text)' }}>Research<span style={{color:'var(--accent)'}}>Forge</span></a>
              <p className="text-[.82rem] leading-[1.7] max-w-[240px]" style={{color:'var(--muted)'}}>A multidisciplinary consulting firm transforming ideas into measurable outcomes through rigorous research, digital tools, and strategic advisory.</p>
            </div>
            {[['Services',['Research & Data Solutions','Digital Survey Design','Sustainability Consulting','Advisory & Strategy']],
              ['Company',['About Us','Clients We Serve','Our Approach','Insights']],
              ['Contact',['Request a Consultation','hello@researchforge.com','Subscribe to Insights']]
            ].map(([title, links])=>(
              <div key={title as string}>
                <h4 className="text-[.77rem] font-bold tracking-[.1em] uppercase mb-4" style={{ color: 'var(--text)' }}>{title as string}</h4>
                <ul className="flex flex-col gap-2 list-none">
                  {(links as string[]).map(l=><li key={l}><a href="#" className="text-[.83rem] transition-colors hover:text-[var(--accent)]" style={{color:'var(--muted)'}}>{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t pt-5 flex flex-col sm:flex-row justify-between items-center gap-3" style={{borderColor:'var(--card-border)'}}>
            <p className="text-[.78rem]" style={{color:'var(--muted)'}}>© 2025 ResearchForge Consulting. All rights reserved.</p>
            <div className="flex gap-3">
              {['in','𝕏','✉'].map(s=>(
                <a key={s} href="#" className="w-8 h-8 border rounded-full flex items-center justify-center text-[.77rem] transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]" style={{borderColor:'var(--card-border)',color:'var(--muted)'}}>{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

function SectionTag({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-[.72rem] font-semibold tracking-[.14em] uppercase mb-3 ${center ? 'justify-center' : ''}`} style={{color:'var(--accent)'}}>
      {!center && <span className="w-[22px] h-[1.5px] inline-block" style={{background:'var(--accent)'}}/>}
      {children}
    </div>
  )
}

function PillarCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl p-7 border transition-all duration-300 cursor-default hover:-translate-y-1.5 hover:border-[var(--accent)] hover:shadow-[0_12px_36px_rgba(0,198,162,.1)]"
      style={{background:'var(--card-bg)',borderColor:'var(--card-border)'}}>
      <div className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center text-xl mb-4 transition-all duration-300" style={{background:'rgba(0,198,162,.1)'}}>{icon}</div>
      <h3 className="text-[.97rem] font-bold mb-2">{title}</h3>
      <p className="text-[.84rem] leading-[1.65]" style={{color:'var(--muted)'}}>{desc}</p>
    </div>
  )
}

function ServiceCard({ num, title, desc, items, value }: { num:string; title:string; desc:string; items:string[]; value:string }) {
  return (
    <div className="relative rounded-3xl p-8 border overflow-hidden transition-all duration-300 cursor-default hover:-translate-y-2 hover:border-[rgba(0,198,162,.3)] hover:shadow-[0_20px_50px_rgba(0,0,0,.4)] group"
      style={{background:'var(--card-bg)',borderColor:'var(--card-border)'}}>
      <div className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background:'linear-gradient(90deg,var(--accent),transparent)'}}/>
      <span className="block text-[.69rem] font-bold tracking-[.12em] uppercase mb-3" style={{color:'var(--accent)'}}>{num}</span>
      <h3 className="text-[1.1rem] font-bold mb-3">{title}</h3>
      <p className="text-[.86rem] leading-[1.72] mb-5" style={{color:'var(--muted)'}}>{desc}</p>
      <ul className="list-none flex flex-col gap-1.5">
        {items.map(item=>(
          <li key={item} className="text-[.82rem] pl-4 relative" style={{color:'var(--muted)'}}>
            <span className="absolute left-0 text-[.74rem]" style={{color:'var(--accent)'}}>→</span>{item}
          </li>
        ))}
      </ul>
      <div className="mt-5 pt-4 text-[.8rem] font-semibold italic border-t" style={{color:'var(--accent)',borderColor:'var(--card-border)'}}>{value}</div>
    </div>
  )
}
