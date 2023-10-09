'use client'

import dynamic from 'next/dynamic'

const Canvas = dynamic(() => import('../components/Canvas'), {
    ssr: false,
})

export default function Home(props) {
    return (
        <main className="bg-slate-100 dark:bg-slate-900">
            <Canvas />
        </main>
    )
}
