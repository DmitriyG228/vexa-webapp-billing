'use client';

import Image from 'next/image';
import { useState } from 'react';

export function BlogHeroImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <div className="mb-8 overflow-hidden rounded-2xl">
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={630}
        className="w-full h-auto object-cover"
        priority
        onError={() => setFailed(true)}
      />
    </div>
  );
}
