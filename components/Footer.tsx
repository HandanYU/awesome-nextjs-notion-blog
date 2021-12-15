import * as React from 'react'
import { SiGithub, SiWechat, SiNotion } from 'react-icons/si'
import { IoSunnyOutline, IoMoonSharp } from 'react-icons/io5'
import * as config from 'lib/config'

import styles from './styles.module.css'

// TODO: merge the data and icons from PageSocial with the social links in Footer

export const Footer: React.FC<{
  pageId: string
  isDarkMode: boolean
  toggleDarkMode: () => void
}> = ({ isDarkMode, toggleDarkMode }) => {
  const [hasMounted, setHasMounted] = React.useState(false)
  const toggleDarkModeCb = React.useCallback(
    (e) => {
      e.preventDefault()
      toggleDarkMode()
    },
    [toggleDarkMode]
  )

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  const author = `${config.author}`

  return (
    <footer className={styles.footer}>
      <div className={styles.copyright}>
        {new Date().getFullYear()} All rights reserved · {author + ' '}
      </div>

      {hasMounted ? (
        <div className={styles.settings}>
          <a
            className={styles.toggleDarkMode}
            onClick={toggleDarkModeCb}
            title='Tottle dark mode'
          >
            {isDarkMode ? <IoMoonSharp /> : <IoSunnyOutline />}
          </a>
        </div>
      ) : null}

      <div className={styles.social}>
        {config.github && (
          <a
            className={styles.github}
            href={`https://github.com/${config.github}`}
            title={`GitHub @${config.github}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <span className={styles.tooltiptext}>@{config.github}</span>
            <SiGithub />
          </a>
        )}
        {config.wechatPublicName && (
          <a
            className={styles.wechatPublicName}
            href={`${config.wechatPublicURL}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <SiWechat />
            <span className={styles.tooltiptext}>
              Official Account: {config.wechatPublicName}
            </span>
          </a>
        )}
        {config.notionPublic && (
          <a
            className={styles.notionPublic}
            href={`${config.notionPublic}`}
            title='via Notion'
            target='_blank'
            rel='noopener noreferrer'
          >
            <SiNotion />
            <span className={styles.tooltiptext}>via Notion</span>
          </a>
        )}
      </div>
    </footer>
  )
}
