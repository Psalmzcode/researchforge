export function FounderSpotlight() {
  return (
    <section className="spotlight" id="founder">
      <div className="wrap">
        <div className="spotlight-card">
          <div className="spotlight-media">
            <img src="/founder-spotlight.png" alt="Researchforge founder" />
            <div className="spotlight-media-tag">
              <div className="name">Full Name</div>
              <div className="role">Founder &amp; Lead Researcher</div>
            </div>
          </div>
          <div className="spotlight-body">
            <div className="eyebrow">From the founder</div>
            <div className="spotlight-quote-mark">&ldquo;</div>
            <blockquote>
              African agriculture and enterprise do not lack ambition or capability. What they often lack is the evidence that lets good decisions hold up over time. Researchforge was set up to help close that gap — to gather evidence carefully, turn it into analysis that is useful to the people making decisions, and work in partnership to put it to use. We are early, and we intend to earn trust through the quality of the work.
            </blockquote>
            <a href="#about" className="spotlight-link">Read more &#8594;</a>
          </div>
        </div>
        <div className="spotlight-rule" />
      </div>
    </section>
  )
}
