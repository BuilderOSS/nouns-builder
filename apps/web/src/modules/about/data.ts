import {
  ActivityItem,
  BuilderFeature,
  BuilderStep,
  BuilderValueProp,
  CoiningHighlight,
  DroposalHighlight,
} from './types'

// TODO: Replace seeded showcase data with an aggregated ecosystem endpoint once
// cross-DAO ranking and coining feeds are available for the public about page.
export const coiningHighlights: CoiningHighlight[] = [
  {
    id: 'studio-coin',
    title: 'Studio Coin',
    creator: '0x7d4f...19ae',
    dao: 'Studio Nouns',
    chainLabel: 'Base',
    amount: '$1.8M market cap',
    href: '/explore?search=studio%20nouns',
    eyebrow: 'DAO paired coin',
    surface: 'linear-gradient(135deg, #F9E7FF 0%, #D9EEFF 100%)',
    previewLabel: 'Creator pair',
  },
  {
    id: 'camp-coin',
    title: 'Camp Coin',
    creator: '0x4ac2...d6bf',
    dao: 'Camp Nouns',
    chainLabel: 'Base',
    amount: '$940K market cap',
    href: '/explore?search=camp%20nouns',
    eyebrow: 'DAO paired coin',
    surface: 'linear-gradient(135deg, #FFF0CC 0%, #FFD9BF 100%)',
    previewLabel: 'Content pair',
  },
  {
    id: 'builder-coin',
    title: 'Builder Coin',
    creator: '0x8cf4...b2da',
    dao: 'BuilderDAO',
    chainLabel: 'Base',
    amount: '$1.2M market cap',
    href: '/explore?search=builderdao',
    eyebrow: 'DAO paired coin',
    surface: 'linear-gradient(135deg, #DFFFF0 0%, #D5F8FF 100%)',
    previewLabel: 'Onchain market',
  },
  {
    id: 'fest-coin',
    title: 'Fest Coin',
    creator: '0x1ce9...42f0',
    dao: 'Nouns Fest',
    chainLabel: 'Ethereum',
    amount: '$680K market cap',
    href: '/explore?search=nouns%20fest',
    eyebrow: 'DAO paired coin',
    surface: 'linear-gradient(135deg, #E2EBFF 0%, #EDE8FF 100%)',
    previewLabel: 'Content pair',
  },
]

export const dropHighlights: DroposalHighlight[] = [
  {
    id: 'open-edition-jam-drop',
    title: 'Open Edition Jam',
    dao: 'Studio Nouns',
    amount: 'ETH 18.6 sold',
    status: 'Live',
    summary:
      'A live edition drop distributing creative work onchain with sales flowing to the DAO treasury.',
    href: '/explore?search=studio%20nouns',
    category: 'Base',
  },
  {
    id: 'summer-camp-poster-drop',
    title: 'Summer Camp Poster Pack',
    dao: 'Camp Nouns',
    amount: 'ETH 9.4 sold',
    status: 'Recent',
    summary:
      'A collectible poster release used to distribute media and fund creative output through Builder.',
    href: '/explore?search=camp%20nouns',
    category: 'Base',
  },
  {
    id: 'governance-zine-drop',
    title: 'Governance Zine 001',
    dao: 'BuilderDAO',
    amount: 'ETH 12.1 sold',
    status: 'Recent',
    summary:
      'An editorial drop that packages governance content into onchain ownership and treasury formation.',
    href: '/explore?search=builderdao',
    category: 'Base',
  },
  {
    id: 'signal-radio-drop',
    title: 'Signal Radio Session',
    dao: 'Nouns Fest',
    amount: 'ETH 6.8 sold',
    status: 'Live',
    summary:
      'A media drop extending event programming into onchain distribution, ownership, and funding.',
    href: '/explore?search=nouns%20fest',
    category: 'Ethereum',
  },
]

export const proposalHighlights: DroposalHighlight[] = [
  {
    id: 'operator-tooling',
    title: 'Operator tooling sprint for treasury reporting',
    dao: 'BuilderDAO',
    amount: '42 voters',
    status: 'Queued',
    summary:
      'Shared treasury analytics and operator tooling improve governance workflows across Builder DAOs.',
    href: '/explore?search=builderdao',
    category: 'Base',
  },
  {
    id: 'festival-grants',
    title: 'Mini grants for local Nouns Fest activations',
    dao: 'Nouns Fest',
    amount: '18 voters',
    status: 'Succeeded',
    summary:
      'Regional teams get budget for activations, documentation, and post-event publishing.',
    href: '/explore?search=nouns%20fest',
    category: 'Ethereum',
  },
  {
    id: 'creator-retainer',
    title: 'Quarterly creative retainer for media releases',
    dao: 'Studio Nouns',
    amount: '24 voters',
    status: 'Active',
    summary:
      'Sustains ongoing visual output with transparent milestones and release cadence.',
    href: '/explore?search=studio%20nouns',
    category: 'Base',
  },
  {
    id: 'builder-residency',
    title: 'Residency round for new onchain builders',
    dao: 'Far House',
    amount: '30 voters',
    status: 'Defeated',
    summary:
      'Funds a cohort of builders experimenting with coining, drops, and governance flows.',
    href: '/explore?search=far%20house',
    category: 'Optimism',
  },
  {
    id: 'archive-pipeline',
    title: 'Archive and indexing pipeline for DAO memory',
    dao: 'Prop House',
    amount: '12 voters',
    status: 'Executed',
    summary:
      'Creates searchable records for proposal outcomes, experiments, and funded work.',
    href: '/explore?search=prop%20house',
    category: 'Ethereum',
  },
]

export const builderSteps: BuilderStep[] = [
  {
    id: 'launch',
    title: 'Launch your DAO',
    body: 'Spin up a DAO with auctions, governance, and treasury built in.',
    marker: '1',
  },
  {
    id: 'grow',
    title: 'Grow your treasury',
    body: 'Use auctions and coining to generate ongoing funding.',
    marker: '2',
  },
  {
    id: 'fund',
    title: 'Fund ideas',
    body: 'Use proposals to allocate capital to builders, events, and experiments.',
    marker: '3',
  },
]

export const builderFeatures: BuilderFeature[] = [
  {
    id: 'auctions',
    marker: '1',
    title: 'Auctions bring in new members and fund the treasury',
    body: 'Ownership and capital contribution in one simple mechanic.',
  },
  {
    id: 'coining',
    marker: '2',
    title: 'Members participate in collaborative content creation',
    body: 'Create content as coins and droposals to turn media into funding utilizing built in distribution methods.',
  },
  {
    id: 'proposals',
    marker: '3',
    title: 'The treasury funds ideas',
    body: 'Members vote on proposals to fund work and allocate capital, all transparently onchain.',
  },
]

export const builderValueProps: BuilderValueProp[] = [
  {
    id: 'launch-fast',
    title: 'Launch a DAO in minutes',
  },
  {
    id: 'treasury-auctions',
    title: 'Built-in treasury formation through auctions',
  },
  {
    id: 'governance-day-one',
    title: 'Governance included from day one',
  },
  {
    id: 'creative-output',
    title: 'Native support for creative output',
  },
]

export const ecosystemActivity: ActivityItem[] = [
  {
    id: 'launches',
    title: 'New launches keep expanding the graph',
    detail:
      'Fresh DAOs continue showing up with tighter scopes: media, local communities, product teams, and events.',
    meta: 'Recent launches',
    tone: 'launch',
  },
  {
    id: 'coining',
    title: 'Coining is broadening what a DAO can publish',
    detail:
      'Posts are becoming funding surfaces for essays, visuals, audio, and experiments instead of just announcements.',
    meta: 'Creator momentum',
    tone: 'coin',
  },
  {
    id: 'droposals',
    title: 'Droposals are routing treasury into clearer outcomes',
    detail:
      'Teams are packaging work with tighter scope, deliverables, and faster governance cycles.',
    meta: 'Governance patterns',
    tone: 'governance',
  },
  {
    id: 'protocol',
    title: 'Builder keeps shipping new primitives',
    detail:
      'The protocol is evolving around creation flows, treasury tooling, content, and governance ergonomics.',
    meta: 'Protocol motion',
    tone: 'protocol',
  },
]

export const heroHighlights = [
  'Each new member joins through an auction.',
  'Every auction funds a shared treasury.',
  'Token holders propose and vote on how that capital is used.',
]

export const builderUseCases: BuilderValueProp[] = [
  {
    id: 'media-collectives',
    title: 'Community owned brands',
    imageSrc: '/noggles-square.svg',
  },
  { id: 'creative-communities', title: 'Creative and media collectives', emoji: '🎨' },
  { id: 'events-local-groups', title: 'Local and event-based groups', emoji: '🎪' },
  { id: 'protocol-teams', title: 'Protocol teams', emoji: '⚙️' },
  {
    id: 'experimental-governance',
    title: 'Subculture communities',
    emoji: '🛹',
  },
]
