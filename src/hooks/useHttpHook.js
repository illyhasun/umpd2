'use client'

import { useCallback, useState } from 'react';

export const useHttp = () => {

  // const [loading, setLoading] = useState(false)
  // const [error, setError] = useState(null)
  // const [message, setMessage] = useState('')

  const req = useCallback(async (url, method = 'GET', body = null, headers = {}) => {
    // setLoading(true);

    try {

      if (body) {
        if (!(body instanceof FormData)) {
          body = JSON.stringify(body)
          headers['Content-Type'] = 'application/json'
        }
      }

      const res = await fetch(url, { method, body, headers })
      const data = await res.json()

      if (!data.success) {
        // setError(data.message || 'Something went wrong..')
        // setLoading(false)
        return
      }

      // setMessage(data.message)
      // setLoading(false)
      // setError(null)

      return data

    } catch (e) {
      // setLoading(false)
      console.log(e)
    }
  }, [])

  return {
    // loading,
    req,
    // error,
    // message
  }
};
