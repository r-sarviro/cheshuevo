import {
  useEffect,
  useId,
  useRef,
  type DialogHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react'

import styles from './Dialog.module.css'

export interface IDialogProps extends Omit<
  DialogHTMLAttributes<HTMLDialogElement>,
  'title'
> {
  open: boolean
  onClose: () => void
  title: ReactNode
  children?: ReactNode
  actions?: ReactNode
}

/** Native modal dialog: overlay + stepped card (LK kb-dialog / vitrina overlay). */
const Dialog = (props: IDialogProps) => {
  const {
    open,
    onClose,
    title,
    children,
    actions,
    className,
    onCancel,
    onClick,
    ...rest
  } = props
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      if (!dialog.open) dialog.showModal()
      return
    }

    if (dialog.open) dialog.close()
  }, [open])

  const rootClass = [styles.root, className].filter(Boolean).join(' ')

  return (
    <dialog
      ref={dialogRef}
      className={rootClass}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onCancel?.(event)
        onClose()
      }}
      onClick={(event: MouseEvent<HTMLDialogElement>) => {
        onClick?.(event)
        if (event.target === event.currentTarget) onClose()
      }}
      {...rest}
    >
      <div className={styles.box}>
        <h2 className={styles.title} id={titleId}>
          {title}
        </h2>
        {children ? <div className={styles.body}>{children}</div> : null}
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    </dialog>
  )
}

export default Dialog
