import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { LLMService } from '@/service/llmservice';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Image Generation',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const [prompt, setPrompt] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const llmService = new LLMService();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await llmService.generateResponse(prompt);
            console.log(response);
        } catch (error) {
            console.error('Error generating response:', error);
            // Handle error appropriately
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <form onSubmit={handleSubmit} className="w-full">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Enter your image generation prompt..."
                            className="flex-1 rounded-lg border border-sidebar-border/70 bg-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                            type="submit"
                            className="rounded-lg bg-primary px-6 py-2 text-black hover:bg-primary/90"
                        >
                            Generate
                        </button>
                    </div>
                </form>

                <div className="flex-1 rounded-xl border border-sidebar-border/70 p-4">
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Generated preview"
                            className="mx-auto max-h-[600px] rounded-lg object-contain"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-neutral-500">
                            Enter a prompt to generate an image
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
