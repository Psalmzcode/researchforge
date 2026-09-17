'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HeroSlider } from './HeroSlider'
import { FounderSpotlight } from './FounderSpotlight'
import { WhereWeWork } from './WhereWeWork'
import { SiteFooter, SiteHeader } from './SiteChrome'
import { ContactModalProvider, ContactTrigger } from './ContactModal'
import { PROJECTS } from '@/data/projects'

const IMG = {
  field: 'https://images.unsplash.com/photo-1596788068873-9ffd5cacd4c4?auto=format&fit=crop&w=900&q=80',
  landscape: 'https://images.unsplash.com/photo-1592650938062-c4cc6ab48951?auto=format&fit=crop&w=900&q=80',
  community: '/approach/impact.png',
  cta: '/focus/agriculture-alt.png',
} as const

const FOCUS_AREAS = [
  { tag: '01', title: 'Agriculture & Food Systems', img: '/focus/agriculture.png', alt: 'Hands holding freshly harvested vegetables, representing agriculture and food systems research' },
  { tag: '02', title: 'Energy & Productive Use', img: '/focus/energy.png', alt: 'Solar panel arrays in an open field, representing energy and productive use research' },
  { tag: '03', title: 'Climate Resilience', img: '/focus/climate.png', alt: 'Young plant growing from cracked dry soil, representing climate resilience research' },
  { tag: '04', title: 'Environmental Sustainability', img: '/focus/environment.png', alt: 'Wind turbines in an open landscape, representing environmental sustainability research' },
  { tag: '05', title: 'Data & Resource Intelligence', img: '/focus/data.png', alt: 'Aerial view of agricultural land use patterns, representing data and resource intelligence' },
  { tag: '06', title: 'Impact & Development Research', img: '/focus/impact.png', alt: 'Young people joining hands in a huddle, representing impact and development research' },
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

const PUBLICATIONS = [
  { cat: 'Energy', type: 'Research Report', title: 'Productive-use energy for smallholder value chains', desc: 'Examines how reliable power for irrigation, processing and cold storage changes rural income patterns.', meta: 'Field Study · Ongoing' },
  { cat: 'Climate', type: 'Field Study', title: 'Climate-smart practice adoption in resilience pilots', desc: 'Tracks farmer uptake of water-management and crop-resilience practices across pilot sites.', meta: 'Field Study · Ongoing' },
  { cat: 'Data', type: 'Data Insight', title: 'Resource mapping methods for spatial intelligence', desc: 'A methods note on combining GIS, satellite layers and ground-truthed survey data.', meta: 'Methods Note · Ongoing' },
  { cat: 'Agriculture', type: 'Market Intelligence', title: 'Post-harvest loss and cold-chain gaps in rural markets', desc: 'Maps where produce value is lost between farm gate and market, and what closes the gap.', meta: 'Market Brief · Ongoing' },
  { cat: 'Environment', type: 'Policy Brief', title: 'Environmental monitoring frameworks for donor programs', desc: 'A policy-facing brief on setting measurable environmental baselines for funded programs.', meta: 'Policy Brief · Ongoing' },
  { cat: 'Impact', type: 'Field Study', title: 'Measuring livelihood change after productive-energy pilots', desc: 'A framework for attributing livelihood outcomes to energy and infrastructure interventions.', meta: 'Field Study · Ongoing' },
]

export function ResearchForgeHome() {
  const [researchFilter, setResearchFilter] = useState<string>('All')

  return (
    <ContactModalProvider>
    <div className="rf-site">
      <SiteHeader />

      <HeroSlider />

      <section className="evidence" id="position">
        <div className="wrap reveal">
          <div className="eyebrow">Our position</div>
          <h2>Evidence for better decisions.</h2>
          <p>
            ResearchForge works at the intersection of data, research and sustainable development — generating the field-level evidence that governments, investors and development organizations need to design, finance and scale solutions that actually hold up in African contexts.
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
                <p>We capture real-world insights through field data collection, stakeholder engagement, spatial mapping, and market assessments to understand communities, businesses, farmers, and energy systems.</p>
              </div>
            </div>
            <div className="a-card reveal">
              <div className="a-img"><img src={IMG.landscape} alt="Rural landscape used for resource and research mapping" /></div>
              <div className="a-body">
                <div className="a-num">02 / Research &amp; Analytics</div>
                <h3>Research &amp; Analytics</h3>
                <p>We transform data and research into actionable insights, uncovering patterns, opportunities, and evidence to support informed decisions across energy, agriculture, climate, and sustainable development.</p>
              </div>
            </div>
            <div className="a-card reveal">
              <div className="a-img"><img src={IMG.community} alt="Rural hillside settlement, representing impact and project intelligence" /></div>
              <div className="a-body">
                <div className="a-num">03 / Impact &amp; Project Intelligence</div>
                <h3>Impact &amp; Project Intelligence</h3>
                <p>We turn evidence into practical project intelligence, supporting the design, assessment, and development of solutions that are relevant, viable, and capable of delivering measurable impact.</p>
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
            <p>Reports, field studies and briefs drawn directly from ResearchForge engagements.</p>
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
            <p>A sample of the kinds of engagements ResearchForge runs, from diagnosis through to scale.</p>
          </div>
          <div className="projects-list">
            {PROJECTS.map(project => (
              <article key={project.slug} className="proj reveal">
                <div className="proj-media">
                  <img src={project.image} alt={project.imageAlt} />
                </div>
                <div className="proj-body">
                  <div className="proj-meta">
                    <span>{project.region}</span>
                    <span>{project.focus}</span>
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.excerpt}</p>
                  <div className="proj-tags">
                    {project.tags.map(tag => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <Link href={`/projects/${project.slug}`} className="proj-link">
                    Read more &#8594;
                  </Link>
                </div>
              </article>
            ))}
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
            <ContactTrigger className="btn btn-solid">Start a conversation</ContactTrigger>
            <a href="#projects" className="btn btn-ghost">See our projects</a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
    </ContactModalProvider>
  )
}
