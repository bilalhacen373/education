import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { PlusIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, conversations }) {
    const [isCreating, setIsCreating] = useState(false);

    const createNewConversation = () => {
        setIsCreating(true);
        router.post(route('chat.store'), {
            title: 'New Conversation'
        }, {
            onSuccess: (response) => {
                const newConversationId = response.props.conversation?.id;
                if (newConversationId) {
                    router.visit(route('chat.show', newConversationId));
                }
            },
            onFinish: () => setIsCreating(false)
        });
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now - d);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return d.toLocaleDateString();
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="AI Chat Assistant" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">AI Chat Assistant</h2>
                                    <p className="text-gray-600 mt-1">Start a conversation with your AI assistant</p>
                                </div>
                                <PrimaryButton
                                    onClick={createNewConversation}
                                    disabled={isCreating}
                                >
                                    <PlusIcon className="w-5 h-5 mr-2 rtl:ml-2" />
                                    New Chat
                                </PrimaryButton>
                            </div>

                            {conversations.length === 0 ? (
                                <div className="text-center py-12">
                                    <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                                    <p className="text-gray-600 mb-6">Start your first conversation with the AI assistant</p>
                                    <PrimaryButton onClick={createNewConversation} disabled={isCreating}>
                                        <PlusIcon className="w-5 h-5 mr-2 rtl:ml-2" />
                                        Start First Chat
                                    </PrimaryButton>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {conversations.map((conversation) => (
                                        <div
                                            key={conversation.id}
                                            onClick={() => router.visit(route('chat.show', conversation.id))}
                                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-semibold text-gray-900 line-clamp-2">
                                                    {conversation.title}
                                                </h3>
                                            </div>
                                            {conversation.messages && conversation.messages.length > 0 && (
                                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                                    {conversation.messages[0].content}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>{formatDate(conversation.updated_at)}</span>
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                    {conversation.messages?.length || 0} messages
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
