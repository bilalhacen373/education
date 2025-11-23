import { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import ChatFileAttachment from '@/Components/ChatFileAttachment';
import MessageAttachment from '@/Components/MessageAttachment';
import {
    PaperAirplaneIcon,
    PlusIcon,
    TrashIcon,
    PencilIcon,
    CheckIcon,
    XMarkIcon,
    ChatBubbleLeftRightIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

export default function Show({ auth, conversation, conversations }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState(conversation.messages || []);
    const [isSending, setIsSending] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(conversation.title);
    const [apiError, setApiError] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const messagesEndRef = useRef(null);
    const messageInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || isSending) return;

        const userMessage = message;
        const filesToSend = selectedFiles;
        setMessage('');
        setSelectedFiles([]);
        setIsSending(true);
        setApiError(null);

        const tempUserMessage = {
            id: Date.now(),
            role: 'user',
            content: userMessage,
            attachments: filesToSend.length > 0 ? filesToSend.map(f => ({
                name: f.name,
                size: f.size,
                type: f.type
            })) : null,
            created_at: new Date().toISOString()
        };
        setMessages([...messages, tempUserMessage]);

        try {
            const formData = new FormData();
            formData.append('message', userMessage);

            filesToSend.forEach(file => {
                formData.append('files[]', file);
            });

            const response = await axios.post(
                route('chat.send-message', conversation.id),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.data.success) {
                setMessages([
                    ...messages,
                    response.data.userMessage,
                    response.data.assistantMessage
                ]);
            } else {
                setApiError(response.data.message || 'Failed to send message');
                setMessages(messages);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setApiError(error.response?.data?.message || 'Failed to connect to AI service. Please make sure the external API is running.');
            setMessages(messages);
        } finally {
            setIsSending(false);
            messageInputRef.current?.focus();
        }
    };

    const updateTitle = async () => {
        if (!editedTitle.trim()) return;

        try {
            await axios.put(route('chat.update', conversation.id), {
                title: editedTitle
            });
            setIsEditingTitle(false);
            router.reload({ only: ['conversation', 'conversations'] });
        } catch (error) {
            console.error('Error updating title:', error);
        }
    };

    const deleteConversation = async () => {
        if (!confirm('Are you sure you want to delete this conversation?')) return;

        try {
            await axios.delete(route('chat.destroy', conversation.id));
            router.visit(route('chat.index'));
        } catch (error) {
            console.error('Error deleting conversation:', error);
        }
    };

    const createNewConversation = () => {
        router.post(route('chat.store'), {
            title: 'New Conversation'
        }, {
            onSuccess: (response) => {
                const newConversationId = response.props.conversation?.id;
                if (newConversationId) {
                    router.visit(route('chat.show', newConversationId));
                }
            }
        });
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Chat - ${conversation.title}`} />

            <div className="h-[calc(100vh-4rem)]">
                <div className="h-full max-w-7xl mx-auto sm:px-6 lg:px-8 py-6">
                    <div className="h-full flex gap-4">
                        <div className="w-72 bg-white rounded-lg shadow-sm p-4 flex flex-col">
                            <div className="mb-4">
                                <PrimaryButton onClick={createNewConversation} className="w-full">
                                    <PlusIcon className="w-5 h-5 mr-2 rtl:ml-2" />
                                    New Chat
                                </PrimaryButton>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2">
                                {conversations.map((conv) => (
                                    <div
                                        key={conv.id}
                                        onClick={() => router.visit(route('chat.show', conv.id))}
                                        className={`p-3 rounded-lg cursor-pointer transition ${
                                            conv.id === conversation.id
                                                ? 'bg-blue-50 border-2 border-blue-500'
                                                : 'hover:bg-gray-50 border-2 border-transparent'
                                        }`}
                                    >
                                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                            {conv.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(conv.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 bg-white rounded-lg shadow-sm flex flex-col">
                            <div className="border-b border-gray-200 p-4 flex items-center justify-between">
                                <div className="flex-1 flex items-center gap-2">
                                    {isEditingTitle ? (
                                        <div className="flex items-center gap-2 flex-1">
                                            <TextInput
                                                value={editedTitle}
                                                onChange={(e) => setEditedTitle(e.target.value)}
                                                className="flex-1"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') updateTitle();
                                                    if (e.key === 'Escape') setIsEditingTitle(false);
                                                }}
                                            />
                                            <button
                                                onClick={updateTitle}
                                                className="text-green-600 hover:text-green-700"
                                            >
                                                <CheckIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsEditingTitle(false);
                                                    setEditedTitle(conversation.title);
                                                }}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <XMarkIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
                                            <h2 className="text-lg font-semibold text-gray-900">
                                                {conversation.title}
                                            </h2>
                                            <button
                                                onClick={() => setIsEditingTitle(true)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                                <button
                                    onClick={deleteConversation}
                                    className="text-red-600 hover:text-red-700 p-2"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {apiError && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                        <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-medium text-red-900">Connection Error</h3>
                                            <p className="text-sm text-red-700 mt-1">{apiError}</p>
                                            <p className="text-xs text-red-600 mt-2">
                                                Make sure the external AI API is running at http://localhost:5000
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {messages.length === 0 ? (
                                    <div className="text-center py-12">
                                        <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            Start a conversation
                                        </h3>
                                        <p className="text-gray-600">
                                            Ask me anything and I'll do my best to help!
                                        </p>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-3xl rounded-lg p-4 ${
                                                    msg.role === 'user'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-900'
                                                }`}
                                            >
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                                <MessageAttachment
                                                    attachments={msg.attachments}
                                                    isUser={msg.role === 'user'}
                                                />
                                                <p
                                                    className={`text-xs mt-2 ${
                                                        msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                                                    }`}
                                                >
                                                    {formatTime(msg.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}

                                {isSending && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 rounded-lg p-4">
                                            <div className="flex space-x-2 rtl:space-x-reverse">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="border-t border-gray-200 p-4">
                                <div className="mb-3">
                                    <ChatFileAttachment
                                        onFilesChange={setSelectedFiles}
                                        disabled={isSending}
                                    />
                                </div>
                                <form onSubmit={sendMessage} className="flex gap-2">
                                    <TextInput
                                        ref={messageInputRef}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1"
                                        disabled={isSending}
                                    />
                                    <PrimaryButton type="submit" disabled={isSending || !message.trim()}>
                                        <PaperAirplaneIcon className="w-5 h-5" />
                                    </PrimaryButton>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
