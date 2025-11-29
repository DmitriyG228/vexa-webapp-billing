import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vexa - Meeting Transcription API',
    short_name: 'Vexa',
    description: 'Open-source meeting transcription API with Microsoft Teams and Google Meet support',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/logodark.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}


