'use client';

import dynamic from 'next/dynamic';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from 'react';
import JobOnboardingPage from '@/features/configuring/documents/components/JobOnboardingPage';


export default function Page() {
    return <JobOnboardingPage />;
}
