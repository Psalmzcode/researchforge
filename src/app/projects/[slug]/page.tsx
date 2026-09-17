import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteFooter, SiteHeader } from '@/components/home/SiteChrome'
import { getAllProjectSlugs, getProject, PROJECTS } from '@/data/projects'
import '../../researchforge.css'

export function generateStaticParams() {
  return getAllProjectSlugs().map(slug => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug)
  if (!project) return { title: 'Project — ResearchForge' }
  return {
    title: `${project.title} — ResearchForge`,
    description: project.excerpt,
  }
}

export default function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug)
  if (!project) notFound()

  const others = PROJECTS.filter(p => p.slug !== project.slug).slice(0, 2)

  return (
    <div className="rf-site">
      <SiteHeader />

      <article className="project-detail">
        <div className="project-detail-hero">
          <img src={project.image} alt={project.imageAlt} />
          <div className="project-detail-hero-shade" />
          <div className="wrap project-detail-hero-inner">
            <Link href="/#projects" className="project-detail-back">&#8592; All projects</Link>
            <div className="proj-meta">
              <span>{project.region}</span>
              <span>{project.focus}</span>
            </div>
            <h1>{project.title}</h1>
            <p className="project-detail-theme">{project.theme}</p>
          </div>
        </div>

        <div className="wrap project-detail-body">
          {project.body.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}

          <div className="proj-tags project-detail-tags">
            {project.tags.map(tag => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <div className="project-detail-cta">
            <Link href="/#contact" className="btn btn-solid">Partner with us</Link>
            <Link href="/#projects" className="btn btn-outline">Back to projects</Link>
          </div>
        </div>

        {others.length > 0 && (
          <div className="wrap project-detail-more">
            <div className="eyebrow">More projects</div>
            <div className="project-detail-more-grid">
              {others.map(item => (
                <Link key={item.slug} href={`/projects/${item.slug}`} className="project-detail-more-card">
                  <img src={item.image} alt={item.imageAlt} />
                  <div>
                    <div className="proj-meta"><span>{item.region}</span></div>
                    <h3>{item.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <SiteFooter />
    </div>
  )
}
