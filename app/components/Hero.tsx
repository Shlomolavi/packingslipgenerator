import React from 'react';
import Link from "next/link";
import Image from "next/image";

interface HeroProps {
    title: string;
    intro: React.ReactNode;
}

export const Hero = ({ title, intro }: HeroProps) => {
    return (
        <section className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
                {title}
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                {intro}
            </p>

            {/* CTA to scroll to generator (visual cue) */}
            <div className="flex justify-center" aria-hidden="true">
                <svg
                    className="w-6 h-6 text-blue-500 animate-bounce"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                </svg>
            </div>
        </section>
    );
};
