import type { Metadata } from 'next'
import Link from 'next/link'
import { TEAM } from '@/data/team'
import { SiteShell, TeamLinks } from '@/components/home/SiteChrome'
import { ContactTrigger } from '@/components/home/ContactModal'
import '../researchforge.css'

export const metadata: Metadata = {
  title: 'About — ResearchForge',
  description:
    'Learn about ResearchForge’s mission, vision, and the team turning African field evidence into decisions that work.',
}

export default function AboutPage() {
  return (
    <SiteShell active="/about">
      <section className="about-hero">
        <div className="wrap">
          <div className="eyebrow">About ResearchForge</div>
          <h1>Better decisions begin with better intelligence.</h1>
          <p>
            ResearchForge was founded to close the gap between fragmented information and the decisions that shape livelihoods, businesses, communities, and development across Africa.
          </p>
        </div>
      </section>

      <section className="about-story">
        <div className="wrap">
          <div className="about-story-grid">
            <div>
              <div className="eyebrow">Who we are</div>
              <h2>Evidence rooted in the field, ready for action.</h2>
            </div>
            <div className="about-story-copy">
              <p>
                We bring together research, field data, technology, and strategic intelligence to understand real-world challenges and develop practical, evidence-driven solutions.
              </p>
              <p>
                Our work spans productive use of energy, smart agriculture, climate resilience, resource efficiency, and sustainable development — with a strong emphasis on understanding people, markets, and systems from the ground up.
              </p>
              <p>
                For us, research is not the destination. It is the foundation for action. We transform information gathered from communities, farmers, businesses, and other stakeholders into intelligence that can inform projects, investments, policies, technologies, and interventions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-mv" id="mission">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">Purpose</div>
              <h2>Mission &amp; vision.</h2>
            </div>
            <p>Drafted from how we already work — and the future we are building toward.</p>
          </div>
          <div className="about-mv-grid">
            <article className="about-mv-card">
              <div className="eyebrow">Mission</div>
              <h3>Turn field evidence into intelligence partners can act on.</h3>
              <p>
                ResearchForge generates field-based data, research, and strategic intelligence that help governments, investors, development organizations, and businesses design, finance, and scale sustainable solutions across Africa.
              </p>
              <p>
                We work directly in the communities our evidence is drawn from — connecting agricultural production, energy systems, resource recovery, and local livelihoods to decisions that hold up in real operating contexts.
              </p>
            </article>
            <article className="about-mv-card">
              <div className="eyebrow">Vision</div>
              <h3>A more productive, resilient, and sustainable Africa — guided by usable evidence.</h3>
              <p>
                We envision a continent where information is no longer fragmented or disconnected from action, and where insight becomes impact for the people and institutions shaping Africa’s future.
              </p>
              <p>
                ResearchForge aims to be the platform where evidence meets innovation — so productive energy, climate resilience, and sustainable development are built on what is actually happening on the ground.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="team about-team" id="team">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">The team</div>
              <h2>The people behind the evidence.</h2>
            </div>
            <p>A small, field-tested team spanning data collection, spatial analysis, research and partnerships.</p>
          </div>
          <div className="team-grid">
            {TEAM.map(({ mono, role, name, bio, image, imageAlt }) => (
              <div key={mono} className="t-card">
                <div className="t-avatar">
                  <img src={image} alt={imageAlt} />
                </div>
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

      <section className="about-cta">
        <div className="wrap">
          <div className="eyebrow">Work with us</div>
          <h2>Have a problem that needs evidence?</h2>
          <p>Research with us. Commission a study. Partner on a project.</p>
          <div className="cta-actions" style={{ justifyContent: 'flex-start', marginTop: 28 }}>
            <ContactTrigger className="btn btn-solid">Start a conversation</ContactTrigger>
            <Link href="/#projects" className="btn btn-outline">See our projects</Link>
          </div>
        </div>
      </section>
    </SiteShell>
  )
}
