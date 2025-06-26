'use client';

import Image from 'next/image';
import type { Dictionary } from '@/lib/dictionaries';
import { cn } from '@/lib/utils';
import { PiggyBank, TrendingUp, Wallet } from 'lucide-react';

// Adjusted icon sizes for better responsiveness
const icons = {
    mainAccount: () => <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-teal-400 flex items-center justify-center"><Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-white" /></div>,
    savings: () => <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-slate-100 flex items-center justify-center"><PiggyBank className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" /></div>,
    stocks: () => <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-emerald-100 flex items-center justify-center"><TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" /></div>,
    crypto: () => (
        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-teal-500 flex items-center justify-center text-white">
            <svg width="16" height="16" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.5 15.5C13.1 16.2 11.5 16.2 10.1 15.5C8.70001 14.8 7.80001 13.4 7.50001 12C7.80001 10.6 8.70001 9.20001 10.1 8.50001C11.5 7.80001 13.1 7.80001 14.5 8.50001" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 6.5V17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
    )
};

// Repositioned features for better aesthetics and to avoid overlap
const features = [
    {
        iconKey: "mainAccount" as const,
        textKey: "mainAccount" as const,
        position: "top-8 -left-4 sm:top-12 sm:-left-8",
        delay: "0s"
    },
    {
        iconKey: "savings" as const,
        textKey: "savings" as const,
        position: "bottom-12 -left-8 sm:bottom-16 sm:-left-12",
        delay: "0.2s"
    },
    {
        iconKey: "stocks" as const,
        textKey: "stocks" as const,
        position: "top-16 -right-4 sm:top-24 sm:-right-8",
        delay: "0.4s"
    },
    {
        iconKey: "crypto" as const,
        textKey: "crypto" as const,
        position: "bottom-24 -right-2 sm:bottom-28 sm:-right-6",
        delay: "0.6s"
    }
];

interface AnimatedFeaturesProps {
    dict: Dictionary;
}

export function AnimatedFeatures({ dict }: AnimatedFeaturesProps) {
    const featureDict = dict.homePage.animatedFeatures;

    return (
        <div className="relative h-[320px] w-[280px] sm:h-[400px] sm:w-[320px] lg:h-[450px] lg:w-[350px] mx-auto">
            <Image
                src="https://res.cloudinary.com/dxvbuhadg/image/upload/v1750899643/imd_esmugj.png"
                alt="Man using his banking app"
                width={500}
                height={700}
                priority
                data-ai-hint="man banking"
                className="object-cover h-full w-full rounded-xl shadow-2xl"
            />
            {features.map((feature) => {
                const Icon = icons[feature.iconKey];
                return (
                    <div
                        key={feature.textKey}
                        className={cn(
                            "absolute z-10 opacity-0 animate-fade-in-up",
                            feature.position
                        )}
                        style={{ animationDelay: feature.delay, animationFillMode: 'forwards' }}
                    >
                        {/* Adjusted padding and gap for responsiveness */}
                        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-card/90 backdrop-blur-md rounded-lg shadow-lg border border-white/10">
                            <Icon />
                            <span className="text-sm font-medium text-card-foreground whitespace-nowrap">
                                {featureDict[feature.textKey]}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
