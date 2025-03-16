import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Image Generation',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    console.log('Initializing Dashboard component');
    
    const { data, setData, post, processing, errors, reset } = useForm({
        prompt: '',
        previewUrl: '',
    });

    console.log('Form state initialized:', { data, processing, errors });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        console.log('Form submission started with prompt:', data.prompt);
        
        post(route('generate-image'), {
            onSuccess: (response) => {
                console.log('Image generated successfully:', response);
                setData('previewUrl', response.props.imageUrl as string);
                // setData('prompt', data.prompt);
            },
            onError: (error) => {
                console.error('Error generating image:', error);
            },
            onFinish: () => {
                console.log('Form submission completed');
                // reset('prompt');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <form onSubmit={handleSubmit} className="w-full">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={data.prompt}
                            onChange={(e) => setData('prompt', e.target.value)}
                            placeholder="Enter your image generation prompt..."
                            className="flex-1 rounded-lg border border-sidebar-border/70 bg-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-primary px-6 py-2 text-black hover:bg-primary/90 disabled:opacity-50"
                        >
                            {processing ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                </form>

                <div className="flex-1 rounded-xl border border-sidebar-border/70 p-4">
                    {data.previewUrl ? (
                        <img
                            src={data.previewUrl}
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
