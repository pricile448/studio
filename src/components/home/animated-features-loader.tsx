
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { Dictionary } from '@/lib/dictionaries';

const AnimatedFeatures = dynamic(() => import('@/components/home/animated-features').then(mod => mod.AnimatedFeatures), {
    ssr: false,
    loading: () => <Skeleton className="relative h-[320px] w-[300px] sm:h-[350px] sm:w-[420px] lg:h-[400px] lg:w-[480px] mx-auto rounded-xl" />,
});

interface AnimatedFeaturesLoaderProps {
    dict: Dictionary;
}

export function AnimatedFeaturesLoader({ dict }: AnimatedFeaturesLoaderProps) {
    return <AnimatedFeatures dict={dict} />;
}
