/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.externals = [...config.externals, { canvas: 'canvas' }] // required to make Konva & react-konva work
        return config
    },

    // hostname for images
    images: {
        domains: ['images.unsplash.com'],
    },
}

module.exports = nextConfig
