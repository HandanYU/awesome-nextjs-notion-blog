import React, { useState, useEffect, useRef } from 'react'
import format from 'comma-number'

export function SimpleFeedback({ slug }) {
  const [helpful, setHelpful] = useState(null)
  const [count, setCount] = useState({ helpful: 0, unHelpful: 0 })

  const uuidRef = useRef(null)
  const mountedRef = useRef(null)
  const isDirtyRef = useRef(null)

  useEffect(() => {
    mountedRef.current = true
    import('device-uuid').then((mod) => {
      const uuid = new mod.DeviceUUID().get()
      uuidRef.current = uuid
      syncFeedback(uuid)
    })

    return () => {
      mountedRef.current = false
    }
  }, [slug])

  function syncFeedback(uuid) {
    fetch(`/api/feedbacks/${slug}?uuid=${uuid}`)
      .then((res) => res.json())
      .then(
        ({ helpful: countHelpful, unHelpful: countNotHelpful, feedback }) => {
          if (!mountedRef.current) return

          const userFeedback =
            feedback === 'helpful'
              ? true
              : feedback === 'unHelpful'
              ? false
              : null

          if (userFeedback !== helpful) {
            setHelpful(userFeedback)
          }

          if (
            count.helpful !== countHelpful ||
            count.unHelpful !== countNotHelpful
          ) {
            setCount({ helpful: countHelpful, unHelpful: countNotHelpful })
          }
        }
      )
  }

  function sendFeedback(isHelpful) {
    // Do nothing if `sendFeedback` is still processing
    if (isDirtyRef.current) return

    // Add feedback or remove
    const prevState =
      helpful === true ? 'helpful' : helpful === false ? 'unHelpful' : null
    const newVal = helpful === isHelpful ? null : isHelpful

    setHelpful(newVal)

    // Optimistic update
    const newCount = { ...count }
    if (newVal === true) {
      newCount.helpful++
    } else if (newVal === false) {
      newCount.unHelpful++
    }

    if (prevState !== null) {
      newCount[prevState]--
    }
    setCount(newCount)

    isDirtyRef.current = true

    fetch(`/api/feedbacks/${slug}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uuid: uuidRef.current,
        helpful: newVal,
        prevState: prevState
      })
    })
      .then(async () => {
        await syncFeedback(uuidRef.current)
      })
      .finally(() => {
        isDirtyRef.current = false
      })
  }

  return (
    <>
      <style jsx>{`
        .container {
          display: flex;
          align-items: baseline;
          max-width: var(--notion-max-width);
        }
        .btn-feedback {
          margin: 0px 5px;
          padding: 0;
          background: none;
          border: none;
          cursor: pointer;
          font-size: unset;
        }
        @media only screen and (max-width: 600px) {
          .container {
            flex-direction: column;
          }
          .btn-feedback:first-child {
            margin-left: 0px;
          }
        }
      `}</style>
      <div className='container'>
        <div>Is this article helpful for you?</div>
        <div>
          <button
            className='btn-feedback'
            onClick={() => sendFeedback(true)}
            style={{
              color: helpful === true ? '#1b8cff' : 'unset',
              textDecoration: helpful === true ? 'underline 2px' : undefined
            }}
          >
            Awesome{' '}
            {helpful === null ||
              (count.helpful > 0 && `(${format(count.helpful)})`)}
          </button>
          <span>·</span>
          <button
            className='btn-feedback'
            onClick={() => sendFeedback(false)}
            style={{
              color: helpful === false ? '#1b8cff' : 'unset',
              textDecoration: helpful === false ? 'underline 2px' : undefined
            }}
          >
            Just so-so{' '}
            {helpful === null ||
              (count.unHelpful > 0 && `(${format(count.unHelpful)})`)}
          </button>
        </div>
      </div>
    </>
  )
}
