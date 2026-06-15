import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Drawer from '@/Components/Drawer';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import MathInput from 'react-math-keyboard';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import OnlineIndicator from '@/Components/OnlineIndicator';

interface Subject {
    id: number;
    name: string;
    color_code: string;
}

interface Question {
    id: number;
    title: string;
    body: string;
    status: 'open' | 'resolved';
    answers_count: number;
    likes_count: number;
    liked_by_viewer: boolean;
    user_reaction?: string | null;
    reactions_summary?: Record<string, number>;
    image_url?: string | null;
    quiz_id?: number | null;
    created_at: string;
    user: {
        id: number;
        name: string;
        profile_photo_url: string;
    };
    subject?: Subject | null;
}

interface Props extends PageProps {
    questions: {
        data: Question[];
    };
    subjects: {
        data: Subject[];
    };
    dashboardStats?: {
        avgGrade: number;
        pendingAssignments: number;
        todaysSchedule: Array<{
            id: number;
            start_time: string;
            subject: {
                name: string;
            };
        }>;
        nextSchedule?: {
            id: number;
            start_time: string;
            next_occurrence: string;
            subject: {
                name: string;
            };
        };
        nextTask?: {
            id: number;
            title: string;
            due_date: string;
            deadline_at: string;
            subject?: {
                name: string;
            };
        };
    };
    current_streak: number;
    today_streak: {
        status: 'none' | 'half' | 'full';
        qna_done: boolean;
        quiz_done: boolean;
    } | null;
}

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
    const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number, seconds: number } | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = new Date(targetDate).getTime() - now;

            if (distance < 0) {
                setTimeLeft(null);
                clearInterval(interval);
                return;
            }

            setTimeLeft({
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    if (!timeLeft) return <span className="text-red-500 text-xs font-bold">Waktunya Tiba!</span>;

    return (
        <span className="font-mono text-sm font-bold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/40 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
            {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </span>
    );
};

export default function Index({ auth, questions, subjects, dashboardStats, current_streak, today_streak }: Props) {
    const [timelineQuestions, setTimelineQuestions] = useState<Question[]>(questions.data);
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [activeReactionPicker, setActiveReactionPicker] = useState<number | null>(null);
    const [bodyEditorKey, setBodyEditorKey] = useState(0);
    const [editorMode, setEditorMode] = useState<'text' | 'math'>('text');

    const REACTIONS = [
        { type: 'icon', value: 'lightbulb', label: 'Genius' },
        { type: 'icon', value: 'school', label: 'Akademis' },
        { type: 'icon', value: 'menu_book', label: 'Bermanfaat' },
        { type: 'icon', value: 'emoji_events', label: 'Juara' },
        { type: 'emoji', value: '👍', label: 'Setuju' },
        { type: 'emoji', value: '🙌', label: 'Mantap' },
        { type: 'emoji', value: '😮', label: 'Wow' },
        { type: 'emoji', value: '🤔', label: 'Berpikir' },
        { type: 'emoji', value: '🥳', label: 'Hore' },
        { type: 'emoji', value: '👏', label: 'Tepuk Tangan' },
    ];

    const { data, setData, post, processing, errors, reset, transform } = useForm<{
        subject_id: string;
        title: string;
        body: string;
        image: File | null;
        stay_on_timeline: boolean;
    }>({
        subject_id: '',
        title: '',
        body: '',
        image: null,
        stay_on_timeline: true,
    });

    useEffect(() => {
        setTimelineQuestions(questions.data);
    }, [questions.data]);

    useEffect(() => {
        // @ts-ignore
        if (window.renderMathInElement) {
            // @ts-ignore
            window.renderMathInElement(document.body, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false },
                    { left: '\\(', right: '\\)', display: false },
                    { left: '\\[', right: '\\]', display: true },
                ],
                throwOnError: false,
            });
        }
    }, [timelineQuestions]);

    useEffect(() => {
        const channelName = 'questions.timeline';

        window.Echo.channel(channelName)
            .listen('.question.created', (event: { question: Question }) => {
                setTimelineQuestions((currentQuestions) => {
                    if (currentQuestions.some((question) => question.id === event.question.id)) {
                        return currentQuestions;
                    }

                    return [event.question, ...currentQuestions];
                });
            })
            .listen('.answer.submitted', (event: { answer: { question_id: number } }) => {
                setTimelineQuestions((currentQuestions) =>
                    currentQuestions.map((question) =>
                        question.id === event.answer.question_id
                            ? { ...question, answers_count: (question.answers_count ?? 0) + 1 }
                            : question,
                    ),
                );
            })
            .listen('.question.like.toggled', (event: { question: { id: number; likes_count: number }; user_id: number; liked: boolean }) => {
                setTimelineQuestions((currentQuestions) =>
                    currentQuestions.map((question) =>
                        question.id === event.question.id
                            ? {
                                ...question,
                                likes_count: event.question.likes_count,
                                liked_by_viewer: event.user_id === auth.user?.id ? event.liked : question.liked_by_viewer,
                            }
                            : question,
                    ),
                );
            })
            .listen('.question.reaction.toggled', (event: { question_id: number; reactions: Record<string, number> }) => {
                setTimelineQuestions((currentQuestions) =>
                    currentQuestions.map((question) =>
                        question.id === event.question_id
                            ? { ...question, reactions_summary: event.reactions }
                            : question
                    )
                );
            })
            .listen('.question.updated', (event: { question: Question }) => {
                setTimelineQuestions((currentQuestions) =>
                    currentQuestions.map((question) =>
                        question.id === event.question.id ? { ...question, ...event.question } : question
                    )
                );
            })
            .listen('.question.resolved', (event: { question: { id: number; status: 'open' | 'resolved' } }) => {
                setTimelineQuestions((currentQuestions) =>
                    currentQuestions.map((question) =>
                        question.id === event.question.id
                            ? { ...question, status: event.question.status }
                            : question,
                    ),
                );
            });

        return () => {
            window.Echo.leave(channelName);
        };
    }, [auth.user?.id]);

    const openCreateQuestionModal = () => {
        setEditingQuestion(null);
        reset();
        setEditorMode('text');
        setBodyEditorKey((currentKey) => currentKey + 1);
        setIsQuestionModalOpen(true);
    };

    const closeQuestionModal = () => {
        setIsQuestionModalOpen(false);
        setEditingQuestion(null);
        reset();
    };

    const submitQuestion: FormEventHandler = (event) => {
        event.preventDefault();
        
        const finalBody = editorMode === 'math' && !data.body.trim().startsWith('$$') 
            ? `$$${data.body.trim()}$$` 
            : data.body;

        if (editingQuestion) {
            router.post(route('questions.update', editingQuestion.id), {
                ...data,
                _method: 'patch',
                body: finalBody,
            }, {
                onSuccess: () => closeQuestionModal(),
                preserveScroll: true,
            });
        } else {
            transform((d) => ({ ...d, body: finalBody }));
            post(route('questions.store'), {
                onSuccess: () => closeQuestionModal(),
                preserveScroll: true,
            });
        }
    };

    const startEdit = (question: Question) => {
        setEditingQuestion(question);
        
        let initialBody = question.body || '';
        let mode: 'text' | 'math' = 'text';

        if (initialBody.trim().startsWith('$$') && initialBody.trim().endsWith('$$')) {
            mode = 'math';
            initialBody = initialBody.trim().substring(2, initialBody.trim().length - 2);
        }

        setData({
            subject_id: question.subject?.id.toString() || '',
            title: question.title,
            body: initialBody,
            image: null,
            stay_on_timeline: true,
        });
        setEditorMode(mode);
        setBodyEditorKey((currentKey) => currentKey + 1);
        setIsQuestionModalOpen(true);
    };

    const toggleLike = (questionId: number) => {
        const question = timelineQuestions.find((item) => item.id === questionId);

        if (!question) {
            return;
        }

        setTimelineQuestions((currentQuestions) =>
            currentQuestions.map((item) =>
                item.id === questionId
                    ? {
                        ...item,
                        liked_by_viewer: !item.liked_by_viewer,
                        likes_count: Math.max(0, (item.likes_count ?? 0) + (item.liked_by_viewer ? -1 : 1)),
                    }
                    : item,
            ),
        );

        window.axios
            .post(route('questions.likes.toggle', questionId))
            .then((response: any) => {
                setTimelineQuestions((currentQuestions) =>
                    currentQuestions.map((item) =>
                        item.id === questionId
                            ? {
                                ...item,
                                liked_by_viewer: response.data.liked,
                                likes_count: response.data.likes_count,
                            }
                            : item,
                    ),
                );
            })
            .catch(() => {
                setTimelineQuestions((currentQuestions) =>
                    currentQuestions.map((item) =>
                        item.id === questionId ? question : item,
                    ),
                );
            });
    };

    const toggleReaction = (questionId: number, reaction: string) => {
        const question = timelineQuestions.find(q => q.id === questionId);
        if (!question) return;

        const isRemoving = question.user_reaction === reaction;

        // Optimistic update
        setTimelineQuestions(current => current.map(q => {
            if (q.id === questionId) {
                const nextSummary = { ...(q.reactions_summary || {}) };
                if (q.user_reaction) {
                    nextSummary[q.user_reaction] = Math.max(0, (nextSummary[q.user_reaction] || 0) - 1);
                    if (nextSummary[q.user_reaction] === 0) delete nextSummary[q.user_reaction];
                }
                if (!isRemoving) {
                    nextSummary[reaction] = (nextSummary[reaction] || 0) + 1;
                }
                return {
                    ...q,
                    user_reaction: isRemoving ? null : reaction,
                    reactions_summary: nextSummary
                };
            }
            return q;
        }));

        window.axios.post(route('questions.reactions.toggle', questionId), { reaction })
            .finally(() => setActiveReactionPicker(null));
    };

    return (
        <AuthenticatedLayout header="Timeline Belajar">
            <Head title="Timeline Belajar" />

            <div className="mx-auto max-w-6xl space-y-4 md:space-y-5">
                        <section className="rounded-md border border-gray-100 shadow-none dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex items-center gap-2 md:gap-3">
                                <button
                                    type="button"
                                    onClick={openCreateQuestionModal}
                                    className="flex min-h-9 md:min-h-10 flex-1 items-center rounded-lg border border-gray-200 bg-white px-3 md:px-4 text-left text-sm text-gray-500 transition-colors hover:border-sky-200 hover:bg-sky-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-sky-900 dark:hover:bg-sky-900/20"
                                >
                                    Ketik pertanyaan..
                                </button>
                                <button
                                    type="button"
                                    onClick={openCreateQuestionModal}
                                    className="inline-flex h-9 md:h-10 items-center gap-1.5 md:gap-2 rounded-lg bg-primary px-3 md:px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700"
                                >
                                    <span className="material-symbols-outlined text-base">edit</span>
                                    Post
                                </button>
                            </div>
                        </section>
                <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
                    <main className="space-y-4 order-2 lg:order-1">

                        <div className="space-y-2">
                            {timelineQuestions.map((question) => (
                                <article
                                    key={question.id}
                                    className="group overflow-hidden rounded-lg border border-gray-200/80 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-sky-800"
                                >
                                    <Link href={route('questions.show', question.id)} className="block p-3 md:p-5">
                                        <div className="flex gap-4">
                                            <div className="min-w-0 flex-1">
                                                {/* Meta */}
                                                <div className="flex items-center justify-between mb-1.5 md:mb-2">
                                                    <div className="flex flex-wrap items-center gap-x-1.5 md:gap-x-2 gap-y-0.5 text-xs md:text-sm">
                                                        <div className="flex items-center gap-1.5">
                                                            <Link 
                                                                href={route('users.show', question.user.id)}
                                                                className="font-bold text-gray-900 dark:text-gray-100 hover:text-primary transition-colors"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {question.user.name}
                                                            </Link>
                                                            <OnlineIndicator userId={question.user.id} />
                                                        </div>

                                                        <span className="text-gray-400 dark:text-gray-500">
                                                            mengajukan pertanyaan
                                                        </span>

                                                        <span className="text-gray-300 dark:text-gray-600">•</span>

                                                        <span className="text-gray-400 dark:text-gray-500">
                                                            {new Date(question.created_at).toLocaleDateString('id-ID')}
                                                        </span>
                                                    </div>

                                                    {auth.user && auth.user.id === question.user.id && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                startEdit(question);
                                                            }}
                                                            className="flex items-center gap-1 rounded-lg bg-sky-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-primary hover:bg-sky-100 transition-colors dark:bg-sky-900/20 dark:hover:bg-sky-900/40"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">edit</span>
                                                            Edit
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Badge */}
                                                <div className="mt-2 md:mt-3 flex flex-wrap items-center gap-1">
                                                    {question.subject && (
                                                        <span
                                                            className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-semibold tracking-wide dark:border-gray-700 dark:bg-gray-900"
                                                            style={{ color: question.subject.color_code }}
                                                        >
                                                            <span
                                                                className="mr-2 h-1 w-1 rounded-full"
                                                                style={{ backgroundColor: question.subject.color_code }}
                                                            />

                                                            {question.subject.name}
                                                        </span>
                                                    )}

                                                    <span
                                                        className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide ${
                                                            question.quiz_id
                                                                ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                                                                : question.status === 'resolved'
                                                                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                                                : 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300'
                                                        }`}
                                                    >
                                                        {question.quiz_id
                                                            ? 'Berbagi Kuis'
                                                            : question.status === 'resolved'
                                                            ? 'Terjawab'
                                                            : 'Butuh Bantuan'}
                                                    </span>
                                                </div>

                                                {/* Title */}
                                                <h2 className="mt-3 md:mt-4 line-clamp-2 text-sm md:text-base font-bold leading-snug tracking-tight text-gray-900 transition-colors group-hover:text-primary dark:text-white">
                                                    {question.title}
                                                </h2>

                                                {/* Body */}
                                                <div 
                                                    className="mt-2 md:mt-3 relative max-h-[100px] md:max-h-[120px] overflow-hidden text-[11px] md:text-[12px] leading-6 md:leading-7 text-gray-600 dark:text-gray-400 prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1"
                                                    style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}
                                                    dangerouslySetInnerHTML={{ __html: question.body }}
                                                />

                                                {/* Image */}
                                                {question.image_url && (
                                                    <div className="mt-3 md:mt-4 overflow-hidden rounded-md border border-gray-100 dark:border-gray-800">
                                                        <img 
                                                            src={question.image_url} 
                                                            alt={question.title}
                                                            className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    </div>
                                                )}

                                                {/* Quiz Link */}
                                                {question.quiz_id && (
                                                    <div className="mt-3 md:mt-4 p-3 md:p-4 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group/quiz">
                                                        <div className="flex items-center gap-2 md:gap-3">
                                                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-md bg-primary text-white flex items-center justify-center flex-shrink-0">
                                                                <span className="material-symbols-outlined text-lg md:text-xl">psychology_alt</span>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] md:text-xs font-semibold text-primary uppercase tracking-wider">Kuis AI Tersedia</p>
                                                                <p className="text-xs md:text-sm font-bold text-gray-900 dark:text-gray-100">Klik untuk mulai latihan</p>
                                                            </div>
                                                        </div>
                                                        <Link 
                                                            href={route('quizzes.show', question.quiz_id)}
                                                            className="w-full sm:w-auto text-center px-3 py-1.5 bg-white dark:bg-gray-800 border border-sky-200 dark:border-sky-700 rounded-md text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                                                        >
                                                            Buka Kuis
                                                        </Link>
                                                    </div>
                                                )}

                                                {/* Reactions Summary */}
                                                {question.reactions_summary && Object.keys(question.reactions_summary).length > 0 && (
                                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                                        {Object.entries(question.reactions_summary).map(([reaction, count]) => {
                                                            const reactionData = REACTIONS.find(r => r.value === reaction);
                                                            return (
                                                                <div 
                                                                    key={reaction}
                                                                    className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                                                                        question.user_reaction === reaction
                                                                            ? 'border-sky-200 bg-sky-50 text-primary dark:border-sky-800 dark:bg-sky-900/20'
                                                                            : 'border-gray-100 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                                                    }`}
                                                                >
                                                                    {reactionData?.type === 'icon' ? (
                                                                        <span className="material-symbols-outlined text-[12px] fill-current">{reaction}</span>
                                                                    ) : (
                                                                        <span>{reaction}</span>
                                                                    )}
                                                                    <span>{count}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Footer */}
                                    <div className="grid grid-cols-4 border-t border-gray-100 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900/20">
                                        <button
                                            type="button"
                                            onClick={() => toggleLike(question.id)}
                                            className={`flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-2.5 text-sm font-medium transition-all hover:bg-white hover:text-primary dark:hover:bg-gray-800 ${question.liked_by_viewer
                                                    ? 'text-primary'
                                                    : 'text-gray-500 dark:text-gray-400'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[16px] md:text-[18px]">
                                                {question.liked_by_viewer ? 'shift_lock' : 'shift'}
                                            </span>

                                            <span className="text-[11px] md:text-xs">{question.likes_count ?? 0}</span>
                                        </button>

                                        <div className="relative border-l border-gray-100 dark:border-gray-700">
                                            <button
                                                type="button"
                                                onClick={() => setActiveReactionPicker(activeReactionPicker === question.id ? null : question.id)}
                                                className={`flex w-full items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-2.5 text-sm font-medium transition-all hover:bg-white hover:text-primary dark:hover:bg-gray-800 ${question.user_reaction 
                                                        ? 'text-primary' 
                                                        : 'text-gray-500 dark:text-gray-400'
                                                    }`}
                                            >
                                                {question.user_reaction ? (
                                                    REACTIONS.find(r => r.value === question.user_reaction)?.type === 'icon' ? (
                                                        <span className="material-symbols-outlined text-[16px] md:text-[18px] fill-current">{question.user_reaction}</span>
                                                    ) : (
                                                        <span className="text-[14px] md:text-[16px]">{question.user_reaction}</span>
                                                    )
                                                ) : (
                                                    <span className="material-symbols-outlined text-[16px] md:text-[18px]">add_reaction</span>
                                                )}
                                                <span className="hidden sm:inline text-[11px] md:text-xs">{question.user_reaction ? 'Bereaksi' : 'Reaksi'}</span>
                                            </button>

                                            {activeReactionPicker === question.id && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mb-2 z-10 w-56 sm:w-64 rounded-lg border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-gray-800 animate-in fade-in slide-in-from-bottom-2">
                                                    <div className="grid grid-cols-5 gap-0.5 sm:gap-1">
                                                        {REACTIONS.map((reaction) => (
                                                            <button
                                                                key={reaction.value}
                                                                onClick={() => toggleReaction(question.id, reaction.value)}
                                                                title={reaction.label}
                                                                className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-md transition-all hover:scale-110 ${
                                                                    question.user_reaction === reaction.value 
                                                                        ? 'bg-sky-100 text-primary dark:bg-sky-900/40' 
                                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                                                }`}
                                                            >
                                                                {reaction.type === 'icon' ? (
                                                                    <span className={`material-symbols-outlined text-[20px] ${question.user_reaction === reaction.value ? 'fill-current' : ''}`}>
                                                                        {reaction.value}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[20px]">{reaction.value}</span>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <Link
                                            href={route('questions.show', question.id)}
                                            className="flex items-center justify-center gap-1 md:gap-2 border-x border-gray-100 px-2 md:px-4 py-2 md:py-2.5 text-sm font-medium text-gray-500 transition-all hover:bg-white hover:text-primary dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                                        >
                                            <span className="material-symbols-outlined text-[16px] md:text-[18px]">
                                                forum
                                            </span>

                                            <span className="text-[11px] md:text-xs">{question.answers_count ?? 0}</span>
                                        </Link>

                                        <Link
                                            href={route('questions.show', question.id)}
                                            className="flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-2.5 text-sm font-medium text-gray-500 transition-all hover:bg-white hover:text-primary dark:text-gray-400 dark:hover:bg-gray-800"
                                        >
                                            <span className="material-symbols-outlined text-[16px] md:text-[18px]">
                                                send
                                            </span>

                                            <span className="hidden sm:inline text-[11px] md:text-xs">Jawab</span>
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {timelineQuestions.length === 0 && (
                            <div className="rounded-lg border border-gray-100 bg-white p-8 md:p-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <span className="material-symbols-outlined mb-2 text-4xl md:text-5xl text-gray-300 dark:text-gray-600">forum</span>
                                <p className="font-medium text-gray-500 dark:text-gray-400 text-sm">Timeline masih kosong.</p>
                                <p className="mt-1 text-xs md:text-sm text-gray-400 dark:text-gray-500">Mulai diskusi pertama dari tombol Post.</p>
                            </div>
                        )}
                    </main>

                    <aside className="lg:space-y-4 lg:sticky lg:top-24 lg:self-start order-1 lg:order-2">
                        {/* Mobile: Horizontal Scrollable Strip */}
                        <div className="lg:hidden -mx-4 sm:-mx-0 px-4 sm:px-0 mb-4">
                            <div className="flex gap-2.5 overflow-x-auto pb-2 custom-scrollbar snap-x snap-mandatory">
                                {/* Streak Widget */}
                                <Link href={route('attendances.index')} className="snap-start flex-shrink-0 w-44 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg p-3 text-white shadow-sm relative overflow-hidden">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="material-symbols-outlined text-xl">local_fire_department</span>
                                        <span className="text-lg font-black">Hari ke-{current_streak}</span>
                                    </div>
                                    <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-fit border ${
                                        today_streak?.status === 'full' 
                                            ? 'bg-white/20 border-white/30' 
                                            : today_streak?.status === 'half'
                                            ? 'bg-amber-900/30 border-amber-500/40 text-amber-100'
                                            : 'bg-black/15 border-black/10 text-white/70'
                                    }`}>
                                        {today_streak?.status === 'full' ? 'Penuh 🔥' : today_streak?.status === 'half' ? 'Setengah 🟡' : 'Belum Aktif'}
                                    </div>
                                    <span className="material-symbols-outlined absolute -right-1 -bottom-2 text-[50px] text-white opacity-10 pointer-events-none">
                                        local_fire_department
                                    </span>
                                </Link>

                                {/* Next Schedule */}
                                {dashboardStats?.nextSchedule && (
                                    <div className="snap-start flex-shrink-0 w-44 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-3 shadow-sm">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">
                                            <span className="material-symbols-outlined text-sm">schedule</span>
                                            Kelas Berikutnya
                                        </div>
                                        <p className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 mb-2">{dashboardStats.nextSchedule.subject?.name}</p>
                                        <CountdownTimer targetDate={dashboardStats.nextSchedule.next_occurrence} />
                                    </div>
                                )}

                                {/* Next Task */}
                                {dashboardStats?.nextTask && (
                                    <div className="snap-start flex-shrink-0 w-44 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-3 shadow-sm">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1.5">
                                            <span className="material-symbols-outlined text-sm">assignment_late</span>
                                            Tugas Terdekat
                                        </div>
                                        <p className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 mb-2">{dashboardStats.nextTask.title}</p>
                                        <CountdownTimer targetDate={dashboardStats.nextTask.deadline_at} />
                                    </div>
                                )}

                                {/* Pending Assignments */}
                                {dashboardStats && (
                                    <div className="snap-start flex-shrink-0 w-32 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-3 shadow-sm">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="material-symbols-outlined text-lg text-orange-500">assignment_late</span>
                                        </div>
                                        <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{dashboardStats.pendingAssignments}</p>
                                        <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tugas Pending</p>
                                    </div>
                                )}

                                {/* Today's Schedule Quick */}
                                {dashboardStats && dashboardStats.todaysSchedule.length > 0 && (
                                    <div className="snap-start flex-shrink-0 w-44 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-3 shadow-sm">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2">
                                            <span className="material-symbols-outlined text-sm">today</span>
                                            Jadwal Hari Ini
                                        </div>
                                        <div className="space-y-1.5">
                                            {dashboardStats.todaysSchedule.slice(0, 3).map((schedule) => (
                                                <div key={schedule.id} className="flex items-center gap-2 text-xs">
                                                    <span className="font-bold text-gray-900 dark:text-gray-100 tabular-nums">{schedule.start_time.substring(0, 5)}</span>
                                                    <span className="truncate text-gray-500 dark:text-gray-400">{schedule.subject.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Desktop: Full Sidebar Cards */}
                        <div className="hidden lg:block space-y-4">
                        {/* Mini Streak Widget */}
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg p-4 text-white shadow-sm relative overflow-hidden group">
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold flex items-center gap-1.5 mb-0.5 text-sm">
                                        <span className="material-symbols-outlined text-base">local_fire_department</span>
                                        Api Belajar
                                    </h3>
                                    <p className="text-[11px] text-orange-100 font-medium">Hari ke-{current_streak} beruntun!</p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <div className={`text-xs font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                                        today_streak?.status === 'full' 
                                            ? 'bg-white/20 border-white/40' 
                                            : today_streak?.status === 'half'
                                            ? 'bg-amber-900/40 border-amber-500/50 text-amber-200'
                                            : 'bg-black/20 border-black/10 text-gray-300'
                                    }`}>
                                        {today_streak?.status === 'full' ? 'Penuh 🔥' : today_streak?.status === 'half' ? 'Setengah 🟡' : 'Belum Aktif ⚪'}
                                    </div>
                                    <Link href={route('attendances.index')} className="text-[10px] underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity">
                                        Lihat detail
                                    </Link>
                                </div>
                            </div>
                            <span className="material-symbols-outlined absolute -right-2 -bottom-3 text-[64px] text-white opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                                local_fire_department
                            </span>
                        </div>

                        {dashboardStats && dashboardStats.nextSchedule && (
                            <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 transition-all hover:border-sky-200">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[16px] text-blue-500">schedule</span>
                                        Kelas Mendatang
                                    </h3>
                                </div>
                                <p className="font-bold text-sm text-gray-900 dark:text-white mb-1.5 line-clamp-1">{dashboardStats.nextSchedule.subject?.name}</p>
                                <div className="flex items-center justify-between mt-2 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-md border border-gray-100 dark:border-gray-700/50">
                                    <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Dimulai dalam:</span>
                                    <CountdownTimer targetDate={dashboardStats.nextSchedule.next_occurrence} />
                                </div>
                            </section>
                        )}

                        {dashboardStats && dashboardStats.nextTask && (
                            <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 transition-all hover:border-orange-200">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[16px] text-orange-500">assignment_late</span>
                                        Tugas Terdekat
                                    </h3>
                                </div>
                                <p className="font-bold text-sm text-gray-900 dark:text-white mb-1.5 line-clamp-1">{dashboardStats.nextTask.title}</p>
                                <div className="flex items-center justify-between mt-2 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-md border border-gray-100 dark:border-gray-700/50">
                                    <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Deadline:</span>
                                    <CountdownTimer targetDate={dashboardStats.nextTask.deadline_at} />
                                </div>
                            </section>
                        )}

                        {dashboardStats && (
                            <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <h2 className="font-bold text-sm text-gray-900 dark:text-gray-100">Dashboard Saya</h2>
                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center justify-between rounded-md bg-gray-50 p-2.5 dark:bg-gray-900">
                                        <div>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400">Tugas Pending</p>
                                            <p className="text-base font-bold text-gray-900 dark:text-gray-100">{dashboardStats.pendingAssignments}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-orange-500">assignment_late</span>
                                    </div>
                                    <div className="rounded-md bg-gray-50 p-2.5 dark:bg-gray-900">
                                        <div className="mb-1.5 flex items-center justify-between">
                                            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Jadwal Hari Ini</p>
                                            <span className="material-symbols-outlined text-base text-blue-500">calendar_today</span>
                                        </div>
                                        {dashboardStats.todaysSchedule.length > 0 ? (
                                            <div className="space-y-2">
                                                {dashboardStats.todaysSchedule.slice(0, 3).map((schedule) => (
                                                    <div key={schedule.id} className="flex items-center gap-2 text-xs">
                                                        <span className="font-semibold text-gray-900 dark:text-gray-100">{schedule.start_time.substring(0, 5)}</span>
                                                        <span className="truncate text-gray-500 dark:text-gray-400">{schedule.subject.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400">Tidak ada kelas hari ini</p>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}
                        </div>
                    </aside>
                </div>
            </div>

            <Drawer show={isQuestionModalOpen} maxWidth="2xl" onClose={closeQuestionModal}>
                <div className="bg-white p-4 md:p-6 dark:bg-gray-800">
                    <div className="mb-4 md:mb-6 flex items-start justify-between gap-3 md:gap-4">
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">
                                {editingQuestion ? 'Edit Pertanyaan' : 'Buat Pertanyaan'}
                            </h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {editingQuestion ? 'Perbarui isi pertanyaan yang sudah diposting.' : 'Bagikan soal dan konteksnya ke timeline belajar.'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={closeQuestionModal}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-900 dark:hover:text-gray-200"
                            aria-label="Tutup modal"
                        >
                            <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                    </div>

                    <form onSubmit={submitQuestion} className="space-y-4 md:space-y-5">
                        <div>
                            <InputLabel htmlFor="timeline_subject_id" value="Mata Pelajaran (Opsional)" />
                            <select
                                id="timeline_subject_id"
                                name="subject_id"
                                value={data.subject_id}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm transition-colors focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                onChange={(event) => setData('subject_id', event.target.value)}
                            >
                                <option value="">Tanpa Mata Pelajaran</option>
                                {subjects.data.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.subject_id} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="timeline_title" value="Judul Pertanyaan" />
                            <TextInput
                                id="timeline_title"
                                type="text"
                                name="title"
                                value={data.title}
                                className="mt-1 block w-full"
                                onChange={(event) => setData('title', event.target.value)}
                                placeholder="Contoh: Kenapa grafik fungsi kuadrat terbuka ke atas?"
                                required
                            />
                            <InputError message={errors.title} className="mt-2" />
                        </div>

                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                                <InputLabel htmlFor="timeline_body" value="Isi Pertanyaan" />
                                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                    <button
                                        type="button"
                                        onClick={() => setEditorMode('text')}
                                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${editorMode === 'text' ? 'bg-white shadow dark:bg-gray-700 text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                                    >
                                        ✏️ Mode Teks
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditorMode('math')}
                                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${editorMode === 'math' ? 'bg-white shadow dark:bg-gray-700 text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                                    >
                                        🔢 Mode Matematika
                                    </button>
                                </div>
                            </div>
                            
                            {editorMode === 'text' ? (
                                <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/50">
                                    <ReactQuill 
                                        theme="snow" 
                                        value={data.body} 
                                        onChange={(val) => setData('body', val)} 
                                        modules={{
                                            toolbar: [
                                                ['bold', 'italic', 'underline'],
                                                [{'list': 'ordered'}, {'list': 'bullet'}],
                                                ['clean']
                                            ]
                                        }}
                                        className="h-48 pb-10"
                                    />
                                </div>
                            ) : (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 md:p-4 dark:border-gray-700 dark:bg-gray-900/50">
                                    <MathInput
                                        key={bodyEditorKey}
                                        setValue={(value) => setData('body', value)}
                                        initialLatex={data.body}
                                        lang="en"
                                        fullWidth
                                        withShowKeyboardButton
                                        numericToolbarKeys={[]}
                                        alphabeticToolbarKeys={[]}
                                        size="medium"
                                    />
                                </div>
                            )}
                            <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                                Tulis biasa seperti chat, lalu pakai tombol keyboard jika perlu rumus atau simbol matematika.
                            </p>
                            <InputError message={errors.body} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="timeline_image" value="Gambar Soal (Opsional)" />
                            <div className="mt-1 flex items-center gap-4">
                                <label className="flex h-24 md:h-32 flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-primary hover:bg-sky-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-primary/50">
                                    <div className="flex flex-col items-center justify-center py-3">
                                        <span className="material-symbols-outlined mb-1 text-gray-400 text-xl">image</span>
                                        <p className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400">
                                            {data.image ? data.image.name : 'Upload gambar soal (JPG, PNG)'}
                                        </p>
                                    </div>
                                    <input
                                        id="timeline_image"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(event) => setData('image', event.target.files?.[0] || null)}
                                    />
                                </label>
                                {data.image && (
                                    <div className="relative h-24 w-24 md:h-32 md:w-32 shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                                        <img
                                            src={URL.createObjectURL(data.image)}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setData('image', null)}
                                            className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white shadow-sm hover:bg-red-600"
                                        >
                                            <span className="material-symbols-outlined text-xs">close</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <InputError message={errors.image} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={closeQuestionModal}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100"
                            >
                                Batal
                            </button>
                            <PrimaryButton disabled={processing}>
                                {editingQuestion ? 'Simpan Perubahan' : 'Post Pertanyaan'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Drawer>
        </AuthenticatedLayout>
    );
}
