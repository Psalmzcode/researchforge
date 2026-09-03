'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HeroSlider } from './HeroSlider'
import { FounderSpotlight } from './FounderSpotlight'
import { WhereWeWork } from './WhereWeWork'

const IMG = {
  field: 'https://images.unsplash.com/photo-1596788068873-9ffd5cacd4c4?auto=format&fit=crop&w=900&q=80',
  landscape: 'https://images.unsplash.com/photo-1592650938062-c4cc6ab48951?auto=format&fit=crop&w=900&q=80',
  community: '/approach/impact.png',
  agriculture: 'https://images.unsplash.com/photo-1509099381441-ea3c0cf98b94?auto=format&fit=crop&w=900&q=80',
  solar: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=900&q=80',
  climate: 'https://images.unsplash.com/photo-1569103470379-7a55ae911d86?auto=format&fit=crop&w=900&q=80',
  environment: 'https://images.unsplash.com/photo-1489676138048-ba1786a7f026?auto=format&fit=crop&w=900&q=80',
  data: 'https://images.unsplash.com/photo-1585306874600-bbaa4f36941f?auto=format&fit=crop&w=900&q=80',
  impact: 'https://images.unsplash.com/photo-1734036871909-906fb9b3d474?auto=format&fit=crop&w=900&q=80',
  cta: '/focus/agriculture-alt.png',
  project1: 'https://images.unsplash.com/photo-1622149108046-f92384a63e75?auto=format&fit=crop&w=1200&q=80',
} as const

const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#focus', label: 'Focus Areas' },
  { href: '#team', label: 'Team' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
]

const FOCUS_AREAS = [
  { tag: '01', title: 'Agriculture & Food Systems', img: '/focus/agriculture.png', alt: 'Hands holding freshly harvested vegetables, representing agriculture and food systems research' },
  { tag: '02', title: 'Energy & Productive Use', img: '/focus/energy.png', alt: 'Solar panel arrays in an open field, representing energy and productive use research' },
  { tag: '03', title: 'Climate Resilience', img: '/focus/climate.png', alt: 'Young plant growing from cracked dry soil, representing climate resilience research' },
  { tag: '04', title: 'Environmental Sustainability', img: '/focus/environment.png', alt: 'Wind turbines in an open landscape, representing environmental sustainability research' },
  { tag: '05', title: 'Data & Resource Intelligence', img: '/focus/data.png', alt: 'Aerial view of agricultural land use patterns, representing data and resource intelligence' },
  { tag: '06', title: 'Impact & Development Research', img: '/focus/impact.png', alt: 'Young people joining hands in a huddle, representing impact and development research' },
]

const TEAM = [
  { mono: 'A.O.', role: 'Founder & Lead Researcher', name: 'Full Name', bio: 'Sets research design and leads engagements with governments and development partners.' },
  { mono: 'C.N.', role: 'Head of Field Data', name: 'Full Name', bio: 'Designs and runs field surveys, digital data collection and household profiling.' },
  { mono: 'B.E.', role: 'Data & GIS Lead', name: 'Full Name', bio: 'Builds the spatial and resource-mapping layer behind every Researchforge study.' },
  { mono: 'R.K.', role: 'Partnerships Lead', name: 'Full Name', bio: 'Connects Researchforge evidence to the partners financing and scaling what it points to.' },
]

const PATHWAY_STEPS = [
  ['01', 'Diagnose', 'Define the real question and who needs the answer.'],
  ['02', 'Gather Data', 'Field surveys, GIS mapping and digital collection.'],
  ['03', 'Co-Design', 'Shape the response with the people it affects.'],
  ['04', 'Pilot', 'Test the intervention at a manageable scale.'],
  ['05', 'Measure', 'Track outcomes against what was intended.'],
  ['06', 'Learn', 'Feed evidence back into the design.'],
  ['07', 'Scale', 'Finance and grow what the evidence supports.'],
]

const RESEARCH_FILTERS = ['All', 'Agriculture', 'Energy', 'Climate', 'Environment', 'Data', 'Impact'] as const

const LOGO_SRC = '/researchforge-logo.png'

function BrandLogo() {
  return (
    <>
      <img src={LOGO_SRC} alt="Researchforge mark" />
      RESEARCH<span>FORGE</span>
    </>
  )
}

const PUBLICATIONS = [
  { cat: 'Energy', type: 'Research Report', title: 'Productive-use energy for smallholder value chains', desc: 'Examines how reliable power for irrigation, processing and cold storage changes rural income patterns.', meta: 'Field Study · Ongoing' },
  { cat: 'Climate', type: 'Field Study', title: 'Climate-smart practice adoption in resilience pilots', desc: 'Tracks farmer uptake of water-management and crop-resilience practices across pilot sites.', meta: 'Field Study · Ongoing' },
  { cat: 'Data', type: 'Data Insight', title: 'Resource mapping methods for spatial intelligence', desc: 'A methods note on combining GIS, satellite layers and ground-truthed survey data.', meta: 'Methods Note · Ongoing' },
  { cat: 'Agriculture', type: 'Market Intelligence', title: 'Post-harvest loss and cold-chain gaps in rural markets', desc: 'Maps where produce value is lost between farm gate and market, and what closes the gap.', meta: 'Market Brief · Ongoing' },
  { cat: 'Environment', type: 'Policy Brief', title: 'Environmental monitoring frameworks for donor programs', desc: 'A policy-facing brief on setting measurable environmental baselines for funded programs.', meta: 'Policy Brief · Ongoing' },
  { cat: 'Impact', type: 'Field Study', title: 'Measuring livelihood change after productive-energy pilots', desc: 'A framework for attributing livelihood outcomes to energy and infrastructure interventions.', meta: 'Field Study · Ongoing' },
]

function TeamLinks() {
  return (
    <div className="t-links">
      <a href="#" aria-label="Email">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z" /><path d="M4 6l8 7 8-7" /></svg>
      </a>
      <a href="#" aria-label="LinkedIn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 11v5M8 8v.01M12 16v-5M12 11c0-1.5 1-2 2-2s2 .8 2 2v5" /></svg>
      </a>
    </div>
  )
}

export function ResearchForgeHome() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [researchFilter, setResearchFilter] = useState<string>('All')

  return (
    <div className="rf-site">
      <header className="site-nav">
        <div className="nav-inner">
          <a href="#top" className="logo">
            <BrandLogo />
          </a>
          <nav className={`links${menuOpen ? ' open' : ''}`}>
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
            ))}
          </nav>
          <a href="#contact" className="btn btn-solid nav-cta">Partner with us</a>
          <button type="button" className="menu-toggle" aria-label="Menu" onClick={() => setMenuOpen(v => !v)}>
            &#9776;
          </button>
        </div>
      </header>

      <HeroSlider />

      <section className="evidence" id="about">
        <div className="wrap reveal">
          <div className="eyebrow">Our position</div>
          <h2>Evidence for better decisions.</h2>
          <p>
            Researchforge works at the intersection of data, research and sustainable development — generating the field-level evidence that governments, investors and development organizations need to design, finance and scale solutions that actually hold up in African contexts.
          </p>
          <div className="data-strip">
            <div><div className="k">Field-first</div><div className="v">Data collection</div></div>
            <div><div className="k">Evidence-led</div><div className="v">Research &amp; analytics</div></div>
            <div><div className="k">Decision-ready</div><div className="v">Intelligence outputs</div></div>
            <div><div className="k">Outcome-tracked</div><div className="v">Impact measurement</div></div>
          </div>
        </div>
      </section>

      <section className="approach">
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">What we do</div>
              <h2>From field evidence to actionable intelligence.</h2>
            </div>
            <p>Three connected capabilities carry a question from the field to a decision a partner can act on.</p>
          </div>
          <div className="approach-grid">
            <div className="a-card reveal">
              <div className="a-img"><img src={IMG.field} alt="Field researcher in a rural African setting" /></div>
              <div className="a-body">
                <div className="a-num">01 / Field Intelligence</div>
                <h3>Field Intelligence</h3>
                <p>Structured field surveys, digital data collection, GIS and spatial mapping, and socioeconomic profiling that ground every finding in what is actually happening on site.</p>
              </div>
            </div>
            <div className="a-card reveal">
              <div className="a-img"><img src={IMG.landscape} alt="Rural landscape used for resource and research mapping" /></div>
              <div className="a-body">
                <div className="a-num">02 / Research &amp; Analytics</div>
                <h3>Research &amp; Analytics</h3>
                <p>Market intelligence, resource mapping and applied research that turn raw field data into evidence a decision-maker can actually use.</p>
              </div>
            </div>
            <div className="a-card reveal">
              <div className="a-img"><img src={IMG.community} alt="Rural hillside settlement, representing impact and project intelligence" /></div>
              <div className="a-body">
                <div className="a-num">03 / Impact &amp; Project Intelligence</div>
                <h3>Impact &amp; Project Intelligence</h3>
                <p>Monitoring and development-impact assessment that track whether a pilot, project or investment is delivering the outcomes it set out to.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="focus" id="focus">
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Focus areas</div>
              <h2>Where our evidence is built.</h2>
            </div>
            <p>Six connected fields of work, each grounded in field data rather than assumption.</p>
          </div>
          <div className="focus-grid">
            {FOCUS_AREAS.map(({ tag, title, img, alt }) => (
              <div key={tag} className="f-card reveal">
                <img src={img} alt={alt} />
                <div className="f-inner"><span className="f-tag">{tag}</span><h3>{title}</h3></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhereWeWork />

      <section className="team" id="team">
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">The team</div>
              <h2>The people behind the evidence.</h2>
            </div>
            <p>A small, field-tested team spanning data collection, spatial analysis, research and partnerships.</p>
          </div>
          <div className="team-grid">
            {TEAM.map(({ mono, role, name, bio }) => (
              <div key={mono} className="t-card reveal">
                <div className="t-avatar"><span className="t-dot" /><span className="t-mono">{mono}</span></div>
                <div className="t-body">
                  <div className="t-role">{role}</div>
                  <h3>{name}</h3>
                  <p>{bio}</p>
                  <TeamLinks />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pathway" id="pathway">
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Our method</div>
              <h2>Evidence-to-impact pathway.</h2>
            </div>
            <p>Every engagement moves through the same seven-stage pathway, from an unanswered question in the field to a scaled, measured solution.</p>
          </div>
          <div className="steps">
            {PATHWAY_STEPS.map(([num, title, desc]) => (
              <div key={num} className="step reveal">
                <div className="step-dot">{num}</div>
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="research" id="research">
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Research &amp; insights</div>
              <h2>Recent findings from the field.</h2>
            </div>
            <p>Reports, field studies and briefs drawn directly from Researchforge engagements.</p>
          </div>
          <div className="filters reveal">
            {RESEARCH_FILTERS.map(f => (
              <button
                key={f}
                type="button"
                className={`chip${researchFilter === f ? ' active' : ''}`}
                onClick={() => setResearchFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="pubs reveal">
            {PUBLICATIONS.filter(p => researchFilter === 'All' || p.cat === researchFilter).map(p => (
              <div key={p.title} className="pub" data-cat={p.cat}>
                <div className="pub-type"><span>{p.type}</span><span>{p.cat}</span></div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <div className="pub-meta">{p.meta}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="projects" id="projects">
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Projects</div>
              <h2>Evidence at work in the field.</h2>
            </div>
            <p>A sample of the kinds of engagements Researchforge runs, from diagnosis through to scale.</p>
          </div>
          <div className="proj reveal">
            <div className="proj-media"><img src={IMG.project1} alt="Field team working in a rural landscape" /></div>
            <div className="proj-body">
              <div className="proj-meta"><span>East Africa</span><span>Productive Energy</span></div>
              <h3>Solar irrigation for smallholder value chains</h3>
              <p>Field diagnostics and data collection to size demand for solar-powered irrigation among smallholder cooperatives, feeding a financing and rollout plan for a regional energy partner.</p>
              <div className="proj-tags"><span>GIS Mapping</span><span>Household Survey</span><span>Financing Design</span></div>
            </div>
          </div>
          <div className="proj reveal">
            <div className="proj-media"><img src={IMG.climate} alt="Landscape used for climate resilience fieldwork" /></div>
            <div className="proj-body">
              <div className="proj-meta"><span>Southern Africa</span><span>Climate Resilience</span></div>
              <h3>Resilience baseline for a smallholder agroforestry pilot</h3>
              <p>Baseline data collection and monitoring design for a multi-year agroforestry and soil-health pilot, in partnership with a regional development finance institution.</p>
              <div className="proj-tags"><span>Baseline Study</span><span>Monitoring Design</span></div>
            </div>
          </div>
          <div className="proj reveal">
            <div className="proj-media"><img src={IMG.impact} alt="Rural landscape and settlement used for livelihoods research" /></div>
            <div className="proj-body">
              <div className="proj-meta"><span>West Africa</span><span>Rural Livelihoods</span></div>
              <h3>Socioeconomic profiling for a rural enterprise program</h3>
              <p>Household-level profiling and market intelligence to guide the design of a rural enterprise and productive-use financing program.</p>
              <div className="proj-tags"><span>Socioeconomic Profiling</span><span>Market Intelligence</span></div>
            </div>
          </div>
        </div>
      </section>

      <FounderSpotlight />

      <section className="cta-section" id="contact">
        <div className="cta-media">
          <img src={IMG.cta} alt="Child at an African marketplace" />
        </div>
        <div className="wrap reveal">
          <div className="eyebrow">Work with us</div>
          <h2>Have a problem that needs evidence?</h2>
          <p>Research with us. Commission a study. Partner on a project. Fund evidence-driven innovation across Africa.</p>
          <div className="cta-options">
            <span>Research with us</span>
            <span>Commission a study</span>
            <span>Partner on a project</span>
            <span>Fund innovation</span>
          </div>
          <div className="cta-actions">
            <a href="mailto:researchforgeconsulting@gmail.com" className="btn btn-solid">Start a conversation</a>
            <a href="#projects" className="btn btn-ghost">See our projects</a>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <div className="foot-logo"><BrandLogo /></div>
              <p>Turning African evidence into decisions that work — field-based data, research and intelligence for governments, investors, development organizations and businesses.</p>
            </div>
            <div className="foot-col">
              <h5>Site</h5>
              <ul>
                <li><a href="#about">About</a></li>
                <li><a href="#focus">Focus Areas</a></li>
                <li><a href="#research">Research &amp; Insights</a></li>
                <li><a href="#projects">Projects</a></li>
              </ul>
            </div>
            <div className="foot-col">
              <h5>Focus Areas</h5>
              <ul>
                <li><a href="#focus">Agriculture &amp; Food Systems</a></li>
                <li><a href="#focus">Energy &amp; Productive Use</a></li>
                <li><a href="#focus">Climate Resilience</a></li>
                <li><a href="#focus">Data &amp; Resource Intelligence</a></li>
              </ul>
            </div>
            <div className="foot-col">
              <h5>Contact</h5>
              <ul>
                <li><a href="mailto:researchforgeconsulting@gmail.com">researchforgeconsulting@gmail.com</a></li>
                <li><a href="#contact">Partner with us</a></li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 Researchforge. All rights reserved.</span>
            <span>Turning African evidence into decisions that work.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
