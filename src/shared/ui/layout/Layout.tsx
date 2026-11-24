import type { HTMLAttributes, ReactNode } from 'react'

import styles from './Layout.module.css'

export interface IWrapProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/** Page content width + gutters from the landing kit. */
const Wrap = (props: IWrapProps) => {
  const { className, children, ...rest } = props
  const rootClass = [styles.wrap, className].filter(Boolean).join(' ')
  return (
    <div className={rootClass} {...rest}>
      {children}
    </div>
  )
}

export interface ISectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
}

/** Vertical section rhythm for landing blocks. */
const Section = (props: ISectionProps) => {
  const { className, children, ...rest } = props
  const rootClass = [styles.section, className].filter(Boolean).join(' ')
  return (
    <section className={rootClass} {...rest}>
      {children}
    </section>
  )
}

export interface ISectionHeadProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

const SectionHead = (props: ISectionHeadProps) => {
  const { className, children, ...rest } = props
  const rootClass = [styles.sectionHead, className].filter(Boolean).join(' ')
  return (
    <div className={rootClass} {...rest}>
      {children}
    </div>
  )
}

export { Wrap, Section, SectionHead }
