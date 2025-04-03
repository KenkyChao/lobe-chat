// 文件路径: app/sso-activate/page.tsx

'use client';

import { useLayoutEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'

const Page = () => {
  console.log("进入Page...")
  const router = useRouter()
  const { setActive } = useClerk()

  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const clerkToken = params.get('clerk_token')
    console.log("clerkToken = " + clerkToken)
    if (!clerkToken) {
      console.error('[SSO] 未在 URL 中获取到 clerk_token')
      router.replace('/login')
      return
    }

    setActive({ session: clerkToken })
      .then(() => {
        console.log('[SSO] Clerk 会话激活成功')
        router.replace('/chat')
      })
      .catch((error) => {
        console.error('[SSO] 激活 Clerk 会话失败:', error)
        router.replace('/login')
      })
  }, [router, setActive])

  return <p style={{ padding: 20 }}>正在激活登录状态，请稍候...</p>
}

export default Page
