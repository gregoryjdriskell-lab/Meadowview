/**
 * All neighbour-help dialogs. App keeps one `dialog` state and renders <SocialDialog>.
 *   { type: 'share', share }               show a link to send
 *   { type: 'name', onDone }               ask for the player's name
 *   { type: 'incoming', link }             a decoded #help / #gift link (or { error })
 *   { type: 'paste' }                      paste a link by hand (iPhone home-screen apps)
 */
import { useState } from 'react'
import { ClipboardPaste, Copy, Gift, HeartHandshake, Share2, X } from 'lucide-react'
import { CLIENTS } from '../../game/config/index.js'
import { useGame } from '../../game/state/GameProvider.jsx'
import { canAcceptGift, canSendHelp, helperReward } from '../../game/state/help.js'
import { decodeLink } from '../../game/social/links.js'
import { Button, CoinTag, ItemNeed, XpTag } from '../ui/primitives.jsx'
import ClientEmblem from '../ui/ClientEmblem.jsx'
import Sprite from '../ui/Sprite.jsx'
import { giftShare, randomId, shareOrCopy } from './share.js'

function Dialog({ title, icon, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[60] grid animate-fade-in place-items-center bg-ink/30 p-5">
      <div className="relative w-full max-w-sm animate-pop rounded-[2rem] bg-cream p-5 shadow-2xl">
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-cream-dark text-ink-soft">
          <X size={18} />
        </button>
        <div className="mb-3 flex items-center gap-2 pr-8">
          {icon}
          <h2 className="text-lg font-bold leading-tight">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  )
}

function ShareDialog({ share, onClose, notify }) {
  const [status, setStatus] = useState(null)
  const go = async () => {
    const r = await shareOrCopy(share)
    setStatus(r)
    if (r === 'copied') notify('Link copied. Paste it into a message.')
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${share.message} ${share.url}`)
      setStatus('copied')
      notify('Link copied')
    } catch {
      setStatus('failed')
    }
  }
  return (
    <Dialog title={share.title} icon={<Share2 className="text-meadow-600" />} onClose={onClose}>
      <p className="rounded-2xl bg-white p-3 text-sm">{share.message}</p>
      <input readOnly value={share.url} onFocus={(e) => e.target.select()} className="mt-2 w-full truncate rounded-xl bg-cream-dark px-3 py-2 text-xs text-ink-soft" style={{ userSelect: 'text' }} />
      <div className="mt-3 flex gap-2">
        <Button variant="soft" className="flex-1" onClick={copy}>
          <Copy size={16} /> Copy
        </Button>
        <Button className="flex-1" onClick={go}>
          <Share2 size={16} /> Share…
        </Button>
      </div>
      {status === 'shared' && <p className="mt-2 text-center text-sm text-meadow-600">Sent! You can share it again anytime from Settings.</p>}
      {status === 'failed' && <p className="mt-2 text-center text-sm text-berry-500">Couldn't share automatically. Long-press the link above to copy it.</p>}
    </Dialog>
  )
}

function NameDialog({ onDone, onClose }) {
  const { state, actions } = useGame()
  const [name, setName] = useState(state.profile.name)
  const save = () => {
    const clean = name.trim().slice(0, 24)
    if (!clean) return
    actions.setName(clean)
    onDone(clean)
  }
  return (
    <Dialog title="What should neighbours call you?" icon={<HeartHandshake className="text-berry-500" />} onClose={onClose}>
      <p className="mb-2 text-sm text-ink-soft">Your name is shown on the links you send.</p>
      <input
        autoFocus
        value={name}
        maxLength={24}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && save()}
        placeholder="Your name"
        className="w-full rounded-2xl border-2 border-cream-dark bg-white px-4 py-3 text-lg outline-none focus:border-meadow-400"
        style={{ userSelect: 'text' }}
      />
      <Button className="mt-3 w-full" disabled={!name.trim()} onClick={save}>
        Continue
      </Button>
    </Dialog>
  )
}

function HelpRequestDialog({ request, onClose, onShare, needName }) {
  const { state, actions } = useGame()
  const check = canSendHelp(state, request)
  const reward = helperReward(request.items)
  const client = CLIENTS[request.client]
  const who = request.from?.name || 'A neighbour'

  const send = (name = state.profile.name) => {
    const giftId = randomId()
    actions.sendHelp(request, giftId)
    const gift = { id: giftId, req: request.id, to: request.from.id, toName: request.from.name, items: request.items }
    onShare(giftShare({ ...state.profile, name }, gift))
  }

  return (
    <Dialog title={`${who} needs a hand`} icon={<HeartHandshake className="text-berry-500" />} onClose={onClose}>
      {client && (
        <div className="mb-2 flex items-center gap-2 text-sm text-ink-soft">
          <ClientEmblem client={client} className="h-8 w-8" /> For their {client.name} order
        </div>
      )}
      <div className="flex flex-wrap gap-1">
        {request.items.map(({ id, qty }) => (
          <ItemNeed key={id} id={id} need={qty} have={state.inventory[id] ?? 0} />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white px-3 py-2 text-sm">
        <span className="text-ink-soft">You'll earn</span>
        <CoinTag amount={reward.coins} />
        <XpTag amount={reward.xp} />
      </div>
      {!check.ok && <p className="mt-2 text-sm text-berry-500">{check.reason}</p>}
      <Button className="mt-3 w-full" disabled={!check.ok} onClick={() => (state.profile.name ? send() : needName(send))}>
        <Gift size={18} /> Send items
      </Button>
    </Dialog>
  )
}

function GiftDialog({ gift, onClose, notify }) {
  const { state, actions } = useGame()
  const check = canAcceptGift(state, gift)
  const who = gift.from?.name || 'A neighbour'
  return (
    <Dialog title={`A delivery from ${who}!`} icon={<Gift className="text-peach-500" />} onClose={onClose}>
      <div className="grid grid-cols-3 gap-2">
        {gift.items.map(({ id, qty }) => (
          <div key={id} className="relative flex flex-col items-center rounded-2xl bg-white p-2">
            <Sprite id={`item.${id}`} className="h-10 w-10" />
            <span className="absolute right-1.5 top-1 rounded-full bg-butter-300 px-1.5 text-xs font-bold">{qty}</span>
          </div>
        ))}
      </div>
      {!check.ok && <p className="mt-2 text-sm text-berry-500">{check.reason}</p>}
      <Button
        className="mt-3 w-full"
        disabled={!check.ok}
        onClick={() => {
          actions.acceptGift(gift)
          notify(`Unpacked ${who}'s delivery. Check your order board!`)
          onClose()
        }}
      >
        Unpack into barn
      </Button>
    </Dialog>
  )
}

function PasteDialog({ onOpen, onClose }) {
  const [text, setText] = useState('')
  const [error, setError] = useState(null)
  const open = (value = text) => {
    const hashAt = value.indexOf('#')
    const link = decodeLink(hashAt >= 0 ? value.slice(hashAt).trim() : '')
    if (!link) return setError("That doesn't look like a Meadowvale help link.")
    onOpen(link)
  }
  const paste = async () => {
    try {
      const t = await navigator.clipboard.readText()
      setText(t)
      open(t)
    } catch {
      setError('Long-press the box and choose Paste.')
    }
  }
  return (
    <Dialog title="Open a neighbour's link" icon={<ClipboardPaste className="text-pond-500" />} onClose={onClose}>
      <p className="mb-2 text-sm text-ink-soft">Copy the link from your messages, then paste it here.</p>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setError(null)
        }}
        rows={3}
        placeholder="https://…#help=…"
        className="w-full resize-none rounded-2xl border-2 border-cream-dark bg-white px-3 py-2 text-sm outline-none focus:border-meadow-400"
        style={{ userSelect: 'text' }}
      />
      {error && <p className="mt-1 text-sm text-berry-500">{error}</p>}
      <div className="mt-2 flex gap-2">
        <Button variant="soft" className="flex-1" onClick={paste}>
          <ClipboardPaste size={16} /> Paste
        </Button>
        <Button className="flex-1" disabled={!text.trim()} onClick={() => open()}>
          Open
        </Button>
      </div>
    </Dialog>
  )
}

export default function SocialDialog({ dialog, setDialog, notify }) {
  const close = () => setDialog(null)
  const needName = (then) =>
    setDialog({ type: 'name', onDone: (name) => then(name), back: dialog })
  if (!dialog) return null
  if (dialog.type === 'share') return <ShareDialog share={dialog.share} onClose={close} notify={notify} />
  if (dialog.type === 'name') return <NameDialog onClose={close} onDone={dialog.onDone} />
  if (dialog.type === 'paste') return <PasteDialog onClose={close} onOpen={(link) => setDialog({ type: 'incoming', link })} />
  if (dialog.type === 'incoming') {
    const { link } = dialog
    if (link.error) {
      return (
        <Dialog title="Hmm, that link didn't work" icon={<X className="text-berry-500" />} onClose={close}>
          <p className="text-sm">{link.error}</p>
          <Button className="mt-3 w-full" onClick={close}>OK</Button>
        </Dialog>
      )
    }
    if (link.kind === 'help') {
      return <HelpRequestDialog request={link.payload} onClose={close} needName={needName} onShare={(share) => setDialog({ type: 'share', share })} />
    }
    return <GiftDialog gift={link.payload} onClose={close} notify={notify} />
  }
  return null
}
