export type Project = {
  slug: string
  title: string
  theme: string
  region: string
  focus: string
  tags: string[]
  excerpt: string
  image: string
  imageAlt: string
  body: string[]
}

export const PROJECTS: Project[] = [
  {
    slug: 'mapping-biomass-resources-north-central-nigeria',
    title: 'Mapping Biomass Resources Across North-Central Nigeria',
    theme: 'Field Intelligence | Resource Mapping | Productive Use of Energy',
    region: 'North-Central Nigeria',
    focus: 'Productive Use of Energy',
    tags: ['Field Intelligence', 'Resource Mapping', 'Productive Use of Energy'],
    excerpt:
      'Agricultural residues can represent significant opportunities for decentralised energy development, but identifying those opportunities requires more than estimating how much agricultural waste a region produces.',
    image: '/projects/biomass-field.png',
    imageAlt: 'Young person inspecting crops in a field, representing agricultural biomass fieldwork',
    body: [
      'Agricultural residues can represent significant opportunities for decentralised energy development, but identifying those opportunities requires more than estimating how much agricultural waste a region produces.',
      'ResearchForge contributed to a biomass feedstock assessment for Mirai Denchi Inc., Japan, examining the availability of rice husk, sawdust, and shea cake across five states in Nigeria’s North-Central region.',
      'The assessment focused on developing a clearer picture of the resource landscape—where relevant agricultural residues are generated and the conditions that may influence their availability for energy applications. This involved looking beyond the existence of biomass to the practical realities surrounding its collection, accessibility, and potential utilisation.',
      'Such intelligence is important because a feedstock may exist in large quantities without necessarily being suitable for a particular energy project. Seasonality, competing uses, geographical concentration, transportation requirements, and the relationship between feedstock availability and proposed energy demand can all influence project viability.',
      'The work therefore illustrates an important principle behind ResearchForge’s approach to field intelligence: resources must be understood within their real operating context before they can be effectively developed into opportunities.',
      'By connecting agricultural production with energy-resource intelligence, the assessment provides a foundation for further technical, economic, and project-level evaluation.',
      'For ResearchForge, this is where field data becomes more than information. Properly structured and interpreted, it becomes intelligence that can help energy developers, investors, researchers, and other stakeholders understand where opportunities may exist and what questions need to be answered before moving toward implementation.',
    ],
  },
  {
    slug: 'biomass-feedstock-potential-cross-river',
    title: 'Assessing Biomass Feedstock Potential in Cross River State',
    theme: 'Research & Analytics | Agricultural Intelligence | Renewable Energy',
    region: 'Cross River State',
    focus: 'Renewable Energy',
    tags: ['Research & Analytics', 'Agricultural Intelligence', 'Renewable Energy'],
    excerpt:
      'Agricultural production creates both economic value and substantial quantities of residues. Understanding how those residues can contribute to cleaner energy systems requires reliable information about their availability and distribution.',
    image: '/reach/landscape.png',
    imageAlt: 'Aerial view of tropical plantations and agricultural land in a rural landscape',
    body: [
      'Agricultural production creates both economic value and substantial quantities of residues. Understanding how those residues can contribute to cleaner energy systems requires reliable information about their availability and distribution.',
      'ResearchForge undertook a biomass feedstock assessment covering seven major Local Government Areas in Cross River State, focusing on rice husk, sawdust, and palm-kernel dust.',
      'The research sought to understand the relationship between agricultural and processing activities and the availability of residues that could potentially support biomass energy applications. This type of assessment is particularly relevant to decentralised energy planning, where the proximity, consistency, and accessibility of feedstock can strongly influence the practicality of an energy project.',
      'The work demonstrates the importance of connecting agricultural intelligence with energy planning. Production and residue estimates become significantly more useful when they can help answer practical questions: Where are resources concentrated? What quantities may be available? How accessible are they? What competing uses exist? And what energy applications could potentially be matched with them?',
      'At ResearchForge, we view this connection as an important part of productive-use-of-energy intelligence.',
      'The objective is not simply to catalogue agricultural residues, but to understand how resources within local economies may potentially support productive energy systems. Such intelligence can contribute to subsequent feasibility studies, technology selection, project design, and investment assessment.',
      'The Cross River assessment demonstrates how field research can help reveal opportunities at the intersection of agriculture, energy, and resource efficiency—while recognising that further technical and economic assessment is essential before any specific opportunity can be considered viable.',
    ],
  },
  {
    slug: 'waste-plastics-tyres-resource-recovery',
    title: 'Exploring Waste Plastics and End-of-Life Tyres for Resource Recovery',
    theme: 'Resource Intelligence | Circular Economy | Waste-to-Energy',
    region: 'Rivers State',
    focus: 'Circular Economy',
    tags: ['Resource Intelligence', 'Circular Economy', 'Waste-to-Energy'],
    excerpt:
      'The growing volume of plastic waste, nylon, and end-of-life tyres presents a significant resource-management challenge, but it also raises an important question: how can difficult waste streams be transformed into useful resources?',
    image: '/projects/waste-energy.png',
    imageAlt: 'Wind turbines in an open landscape, representing energy and resource recovery',
    body: [
      'The growing volume of plastic waste, nylon, and end-of-life tyres presents a significant resource-management challenge, but it also raises an important question: how can difficult waste streams be transformed into useful resources?',
      'As part of a waste-to-energy research project undertaken for ACE-SPED, members of the ResearchForge team were identified to support the project, bringing experience in assessing the potential for oil extraction from waste nylon, plastics, and used tyres in Rivers State.',
      'The work focused on understanding the availability and characteristics of these waste streams and exploring their potential for conversion into useful outputs. Such research requires more than identifying a suitable conversion technology. The availability and consistency of feedstock, collection systems, processing requirements, environmental considerations, economics, and potential end uses all influence whether a waste-to-energy concept can progress toward practical application.',
      'The project reflects an area of expertise that aligns strongly with ResearchForge’s interest in resource intelligence and circular economy opportunities.',
      'By examining waste streams as potential resources rather than solely as disposal challenges, this kind of research can help reveal opportunities for recovering value from materials that would otherwise remain underutilised or create environmental pressures.',
      'It also demonstrates the importance of bringing technical expertise into the early stages of project development. Understanding the resource base and its characteristics provides an evidence base for subsequent technical, economic, and feasibility assessments.',
      'For ResearchForge, this experience contributes to a broader objective: using field information, technical knowledge, and analytical research to understand where resource-recovery opportunities exist and what would be required to develop them responsibly.',
      'The Rivers State project therefore forms part of the experience and technical foundation that informs ResearchForge’s approach to emerging opportunities across waste, energy, resource efficiency, and sustainable development.',
    ],
  },
  {
    slug: 'productive-energy-needs-agor-illa-costain-delta',
    title: 'Understanding Productive Energy Needs in Agor-Illa and Costain, Delta State',
    theme: 'Productive Use of Energy | Field Intelligence | Local Economies',
    region: 'Delta State',
    focus: 'Productive Use of Energy',
    tags: ['Productive Use of Energy', 'Field Intelligence', 'Local Economies'],
    excerpt:
      'Productive Use of Energy (PUE) starts with understanding how energy supports real economic activity. In Agor-Illa and Costain, Delta State, work undertaken with A1 Power Technologies provided field-level insight into the energy needs, productive activities, and challenges experienced by local users.',
    image: '/projects/delta-community.png',
    imageAlt: 'Rural African hillside settlement representing productive energy users in the field',
    body: [
      'Productive Use of Energy (PUE) starts with understanding how energy supports real economic activity. In Agor-Illa and Costain, Delta State, work undertaken with A1 Power Technologies provided field-level insight into the energy needs, productive activities, and challenges experienced by local users.',
      'The assessment looked beyond energy access to understand how electricity and other energy sources are used for income-generating and productive activities. This distinction is important because the value of an energy intervention is often determined by what users are able to accomplish with the energy available to them.',
      'The field intelligence gathered provides a basis for understanding energy demand across productive activities and identifying where appropriate energy technologies could improve productivity, reduce operating constraints, or create new economic opportunities.',
      'For ResearchForge, this reflects a core principle of our PUE approach: energy solutions should be informed by productive demand rather than technology alone. Understanding the users, their activities, equipment, energy requirements, operating patterns, and existing energy costs helps establish the evidence needed to determine appropriate technologies and potential business models.',
      'The experience in Delta State contributes to our broader approach to PUE project development—connecting field intelligence, energy-demand assessment, technology selection, and socioeconomic impact.',
      'Ultimately, the objective is not simply to provide more energy, but to understand how energy can enable businesses, livelihoods, and local economic activities to become more productive and resilient.',
    ],
  },
]

export function getProject(slug: string) {
  return PROJECTS.find(p => p.slug === slug)
}

export function getAllProjectSlugs() {
  return PROJECTS.map(p => p.slug)
}
