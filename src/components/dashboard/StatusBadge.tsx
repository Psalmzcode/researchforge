const config: Record<string, {bg:string;color:string}> = {
  ACTIVE:    {bg:'rgba(0,198,162,.12)',color:'#00c6a2'},
  PENDING:   {bg:'rgba(240,165,0,.12)',color:'#f0a500'},
  IN_REVIEW: {bg:'rgba(55,138,221,.12)',color:'#378add'},
  COMPLETE:  {bg:'rgba(0,198,162,.12)',color:'#00c6a2'},
  CANCELLED: {bg:'rgba(226,75,74,.12)',color:'#e24b4a'},
  PAID:      {bg:'rgba(0,198,162,.12)',color:'#00c6a2'},
  UNPAID:    {bg:'rgba(240,165,0,.12)',color:'#f0a500'},
  PARTIAL:   {bg:'rgba(240,165,0,.12)',color:'#f0a500'},
  OVERDUE:   {bg:'rgba(226,75,74,.12)',color:'#e24b4a'},
  SENT:      {bg:'rgba(55,138,221,.12)',color:'#378add'},
  DRAFT:     {bg:'rgba(136,146,164,.12)',color:'#8892a4'},
  PENDING_REVIEW: {bg:'rgba(240,165,0,.12)',color:'#f0a500'},
  AWAITING_CLIENT_PAYMENT: { bg: 'rgba(240,165,0,.12)', color: '#f0a500' },
  SUBMITTED: {bg:'rgba(55,138,221,.12)',color:'#378add'},
  REVIEWING: {bg:'rgba(55,138,221,.12)',color:'#378add'},
  IN_PROGRESS: {bg:'rgba(0,198,162,.12)',color:'#00c6a2'},
  NEEDS_CLARIFICATION: {bg:'rgba(226,75,74,.12)',color:'#e24b4a'},
  COMPLETED: {bg:'rgba(0,198,162,.12)',color:'#00c6a2'},
  DELIVERED: {bg:'rgba(0,198,162,.12)',color:'#00c6a2'},
}
export function StatusBadge({ status }: { status: string }) {
  const c = config[status] || {bg:'rgba(136,146,164,.12)',color:'#8892a4'}
  return <span className="inline-block text-[.7rem] font-semibold px-2.5 py-0.5 rounded-full" style={{background:c.bg,color:c.color}}>{status.replace('_',' ')}</span>
}
