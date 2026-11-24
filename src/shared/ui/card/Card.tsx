import type {
  CSSProperties,
  ElementType,
  HTMLAttributes,
  ReactNode,
} from 'react'

import styles from './Card.module.css'

export interface ICardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  children: ReactNode
}

/** Surface card with stepped frame and block shadow. */
const Card = (props: ICardProps) => {
  const { as: Tag = 'div', className, children, ...rest } = props
  const rootClass = [styles.root, className].filter(Boolean).join(' ')
  return (
    <Tag className={rootClass} {...rest}>
      {children}
    </Tag>
  )
}

export interface ICardPicProps extends HTMLAttributes<HTMLDivElement> {
  tile?: string
  children?: ReactNode
}

const CardPic = (props: ICardPicProps) => {
  const { tile, className, style, children, ...rest } = props
  const rootClass = [styles.pic, className].filter(Boolean).join(' ')
  const mergedStyle = {
    ...style,
    ...(tile ? ({ ['--tile']: tile } as CSSProperties) : null),
  }

  return (
    <div className={rootClass} style={mergedStyle} {...rest}>
      {children}
    </div>
  )
}

export interface ICardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

const CardBody = (props: ICardBodyProps) => {
  const { className, children, ...rest } = props
  const rootClass = [styles.body, className].filter(Boolean).join(' ')
  return (
    <div className={rootClass} {...rest}>
      {children}
    </div>
  )
}

export interface IFactsProps extends HTMLAttributes<HTMLDListElement> {
  children: ReactNode
}

/** Label/value pairs with dashed separators. */
const Facts = (props: IFactsProps) => {
  const { className, children, ...rest } = props
  const rootClass = [styles.facts, className].filter(Boolean).join(' ')
  return (
    <dl className={rootClass} {...rest}>
      {children}
    </dl>
  )
}

export { CardPic, CardBody, Facts }
export default Card
