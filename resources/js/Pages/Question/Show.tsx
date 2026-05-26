import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

interface Subject {
    id: number;
    name: string;
    color_code: string;
}

interface Answer {
    id: number;
    body: string;
    is_brainliest: boolean;
    is_ai_verified: boolean;
    created_at: string;
    likes_count: number;
    liked_by_viewer: boolean;
    user: {
        id: number;
        name: string;
    };
}

interface Question {
    id: number;
    title: string;
    body: string;
    status: 'open' | 'resolved';
    ai_hint?: string | null;
    brainliest_answer_id?: number | null;
    likes_count: number;
    liked_by_viewer: boolean;
    user_reaction?: string | null;
    reactions_summary?: Record<string, number>;
    image_url?: string | null;
    user: {
        id: number;
        name: string;
    };
    subject?: Subject | null;
    answers?: Answer[] | {
        data: Answer[];
    };
}

interface Props extends PageProps {
    question: {
        data: Question;
    };
}

export default function Show({ auth, question }: Props) {
    const item = question.data;
    const initialAnswers = Array.isArray(item.answers) ? item.answers : item.answers?.data ?? [];
    const sortAnswersByLikes = (arr: Answer[]) =>
        [...arr].sort((a, b) => {
            const diff = (b.likes_count || 0) - (a.likes_count || 0);
            if (diff !== 0) return diff;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

    const [answers, setAnswers] = useState<Answer[]>(() => sortAnswersByLikes(initialAnswers));
    const [questionLikesCount, setQuestionLikesCount] = useState<number>(item.likes_count);
    const [questionLikedByViewer, setQuestionLikedByViewer] = useState<boolean>(item.liked_by_viewer);
    const [userReaction, setUserReaction] = useState<string | null>(item.user_reaction ?? null);
    const [reactionsSummary, setReactionsSummary] = useState<Record<string, number>>(item.reactions_summary ?? {});
    const [questionStatus, setQuestionStatus] = useState<Question['status']>(item.status);
    const [brainliestAnswerId, setBrainliestAnswerId] = useState<number | null>(item.brainliest_answer_id ?? null);
    const [showReactionPicker, setShowReactionPicker] = useState(false);

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

    const { data, setData, post, processing, errors, reset } = useForm({
        body: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('questions.answers.store', item.id), {
            onSuccess: () => reset('body'),
        });
    };

    const markBrainliest = (answerId: number) => {
        router.patch(route('questions.answers.brainliest', [item.id, answerId]));
    };

    const toggleQuestionLike = () => {
        setQuestionLikedByViewer(!questionLikedByViewer);
        setQuestionLikesCount(count => questionLikedByViewer ? count - 1 : count + 1);
        router.post(route('questions.likes.toggle', item.id), {}, { preserveScroll: true, preserveState: true });
    };

    const toggleReaction = (reaction: string) => {
        const isRemoving = userReaction === reaction;
        
        // Optimistic UI update
        setUserReaction(isRemoving ? null : reaction);
        setReactionsSummary(prev => {
            const next = { ...prev };
            if (userReaction) {
                next[userReaction] = Math.max(0, (next[userReaction] || 0) - 1);
                if (next[userReaction] === 0) delete next[userReaction];
            }
            if (!isRemoving) {
                next[reaction] = (next[reaction] || 0) + 1;
            }
            return next;
        });

        router.post(route('questions.reactions.toggle', item.id), { reaction }, { 
            preserveScroll: true, 
            preserveState: true,
            onFinish: () => setShowReactionPicker(false)
        });
    };

    const toggleAnswerLike = (answerId: number) => {
        setAnswers(currentAnswers => currentAnswers.map(answer => {
            if (answer.id === answerId) {
                return {
                    ...answer,
                    liked_by_viewer: !answer.liked_by_viewer,
                    likes_count: answer.liked_by_viewer ? answer.likes_count - 1 : answer.likes_count + 1,
                };
            }
            return answer;
        }));
        router.post(route('answers.likes.toggle', answerId), {}, { preserveScroll: true, preserveState: true });
    };

    const canChooseBrainliest = auth.user.id === item.user.id;

    useEffect(() => {
        setAnswers(sortAnswersByLikes(initialAnswers));
        setQuestionStatus(item.status);
        setBrainliestAnswerId(item.brainliest_answer_id ?? null);
        setUserReaction(item.user_reaction ?? null);
        setReactionsSummary(item.reactions_summary ?? {});
    }, [item.id]);

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
    }, [item.body, answers]);

    useEffect(() => {
        const channelName = `questions.${item.id}`;

        window.Echo.channel(channelName).listen('.answer.submitted', (event: { answer: Answer }) => {
            setAnswers((currentAnswers) => {
                if (currentAnswers.some((answer) => answer.id === event.answer.id)) {
                    return currentAnswers;
                }

                return sortAnswersByLikes([...currentAnswers, event.answer]);
            });
        }).listen('.question.resolved', (event: { question: { status: Question['status']; brainliest_answer_id: number | null } }) => {
            setQuestionStatus(event.question.status);
            setBrainliestAnswerId(event.question.brainliest_answer_id);
            setAnswers((currentAnswers) =>
                currentAnswers.map((answer) => ({
                    ...answer,
                    is_brainliest: answer.id === event.question.brainliest_answer_id,
                })),
            );
        }).listen('.question.like.toggled', (event: { question: { id: number, likes_count: number } }) => {
            setQuestionLikesCount(event.question.likes_count);
        }).listen('.question.reaction.toggled', (event: { question_id: number, reactions: Record<string, number> }) => {
            setReactionsSummary(event.reactions);
        }).listen('.answer.like.toggled', (event: { answer: { id: number, likes_count: number } }) => {
            setAnswers((currentAnswers) =>
                sortAnswersByLikes(
                    currentAnswers.map((answer) =>
                        answer.id === event.answer.id
                            ? { ...answer, likes_count: event.answer.likes_count }
                            : answer
                    )
                )
            );
        });

        return () => {
            window.Echo.leave(channelName);
        };
    }, [item.id]);

    return (
        <AuthenticatedLayout header="Detail Pertanyaan">
            <Head title={item.title} />

            <div className="mx-auto max-w-4xl space-y-4">
                <Link
                    href={route('questions.index')}
                    className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-primary dark:text-gray-400"
                >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Kembali ke Tanya Jawab
                </Link>

                <article className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 md:p-6 dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        {item.subject && (
                            <span
                                className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium dark:border-gray-700 dark:bg-gray-900"
                                style={{ color: item.subject.color_code }}
                            >
                                <span
                                    className="mr-1.5 h-1.5 w-1.5 rounded-full"
                                    style={{ backgroundColor: item.subject.color_code }}
                                />
                                {item.subject.name}
                            </span>
                        )}
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            questionStatus === 'resolved'
                                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-sky-50 text-primary dark:bg-sky-900/20'
                        }`}>
                            {questionStatus === 'resolved' ? 'Terjawab' : 'Terbuka'}
                        </span>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{item.title}</h2>
                    
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 font-bold text-primary dark:bg-sky-900/30">
                                {item.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.user.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Penanya</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleQuestionLike}
                                className={`inline-flex shrink-0 text-[14px] items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium transition-colors ${
                                    questionLikedByViewer 
                                        ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                                <span className={`material-symbols-outlined text-[14px] ${questionLikedByViewer ? 'fill-current' : ''}`}>arrow_upward</span>
                                <span className="text-xs font-medium">{questionLikesCount} Dukung</span>
                            </button>
                                                        <div className="relative">
                                <button
                                    onClick={() => setShowReactionPicker(!showReactionPicker)}
                                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium transition-colors ${
                                        userReaction 
                                            ? 'bg-sky-50 text-primary dark:bg-sky-900/20' 
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {userReaction ? (
                                        REACTIONS.find(r => r.value === userReaction)?.type === 'icon' ? (
                                            <span className="material-symbols-outlined text-[18px] fill-current">{userReaction}</span>
                                        ) : (
                                            <span className="text-[16px]">{userReaction}</span>
                                        )
                                    ) : (
                                        <span className="material-symbols-outlined text-[18px]">add_reaction</span>
                                    )}
                                    <span className="text-xs font-medium">{userReaction ? 'Bereaksi' : 'Reaksi'}</span>
                                </button>

                                {showReactionPicker && (
                                    <div className="absolute bottom-full right-0 mb-2 z-10 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800 animate-in fade-in slide-in-from-bottom-2">
                                        <div className="grid grid-cols-5 gap-1">
                                            {REACTIONS.map((reaction) => (
                                                <button
                                                    key={reaction.value}
                                                    onClick={() => toggleReaction(reaction.value)}
                                                    title={reaction.label}
                                                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all hover:scale-110 ${
                                                        userReaction === reaction.value 
                                                            ? 'bg-sky-100 text-primary dark:bg-sky-900/40' 
                                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }`}
                                                >
                                                    {reaction.type === 'icon' ? (
                                                        <span className={`material-symbols-outlined text-[20px] ${userReaction === reaction.value ? 'fill-current' : ''}`}>
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
                        </div>
                    </div>

                    {Object.keys(reactionsSummary).length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {Object.entries(reactionsSummary).map(([reaction, count]) => {
                                const reactionData = REACTIONS.find(r => r.value === reaction);
                                return (
                                    <div 
                                        key={reaction}
                                        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                                            userReaction === reaction
                                                ? 'border-sky-200 bg-sky-50 text-primary dark:border-sky-800 dark:bg-sky-900/20'
                                                : 'border-gray-100 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                        }`}
                                    >
                                        {reactionData?.type === 'icon' ? (
                                            <span className="material-symbols-outlined text-[14px] fill-current">{reaction}</span>
                                        ) : (
                                            <span>{reaction}</span>
                                        )}
                                        <span>{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="mt-5 whitespace-pre-line text-sm md:text-base leading-relaxed text-gray-700 dark:text-gray-300">{item.body}</div>

                    {item.image_url && (
                        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <img 
                                src={item.image_url} 
                                alt={item.title}
                                className="w-full object-contain max-h-[600px] bg-gray-50 dark:bg-gray-900"
                            />
                        </div>
                    )}

                    {item.ai_hint && (
                        <div className="mt-6 rounded-xl border border-sky-100 bg-sky-50 p-4 md:p-5 text-sm md:text-base text-sky-900 dark:border-sky-900/40 dark:bg-sky-900/20 dark:text-sky-100">
                            <div className="mb-2 flex items-center gap-2 font-semibold">
                                <span className="material-symbols-outlined text-base">psychology</span>
                                Petunjuk AI
                            </div>
                            {item.ai_hint}
                        </div>
                    )}
                </article>

                <section className="space-y-4 md:space-y-6">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 px-1">Jawaban</h3>

                    {answers.map((answer) => (
                        <div
                            key={answer.id}
                            className={`rounded-2xl border bg-white p-4 sm:p-5 dark:bg-gray-800 transition-colors ${
                                answer.is_brainliest || brainliestAnswerId === answer.id
                                    ? 'border-green-300 dark:border-green-700 bg-green-50/30'
                                    : 'border-gray-200 dark:border-gray-700'
                            }`}
                        >
                            <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                        {answer.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{answer.user.name}</p>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            {(answer.is_brainliest || brainliestAnswerId === answer.id) && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                                    <span className="material-symbols-outlined text-[14px]">verified</span>
                                                    Terbaik
                                                </span>
                                            )}
                                            {answer.is_ai_verified && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-primary dark:bg-sky-900/20">
                                                    <span className="material-symbols-outlined text-[14px]">psychology</span>
                                                    Terverifikasi AI
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {canChooseBrainliest && brainliestAnswerId !== answer.id && (
                                    <button
                                        type="button"
                                        onClick={() => markBrainliest(answer.id)}
                                        className="inline-flex shrink-0 w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-green-900 dark:hover:bg-green-900/20 dark:hover:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">task_alt</span>
                                        Jadikan Terbaik
                                    </button>
                                )}
                            </div>
                            <div className="whitespace-pre-line text-sm md:text-base leading-relaxed text-gray-700 dark:text-gray-300 mt-2">
                                {answer.body}
                            </div>
                            
                            <div className="mt-3 flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700 border-dashed">
                                <button
                                    onClick={() => toggleAnswerLike(answer.id)}
                                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                        answer.liked_by_viewer 
                                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <span className={`material-symbols-outlined text-[16px] ${answer.liked_by_viewer ? 'fill-current' : ''}`}>
                                        thumb_up
                                    </span>
                                    {answer.likes_count || 0}
                                </button>
                            </div>
                        </div>
                    ))}

                    {answers.length === 0 && (
                        <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-8 text-center text-sm md:text-base text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400 border-dashed">
                            Belum ada jawaban. Jadilah yang pertama membantu!
                        </div>
                    )}
                </section>

                <section className="rounded-2xl border border-sky-200 bg-white p-4 sm:p-5 dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">edit_square</span>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Bantu Jawab Pertanyaan Ini</h3>
                    </div>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <textarea
                                value={data.body}
                                className="block w-full rounded-xl border-gray-300 transition-colors focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 resize-y p-4"
                                rows={5}
                                onChange={(event) => setData('body', event.target.value)}
                                placeholder="Bagaimana cara menyelesaikan soal ini langkah demi langkah? ..."
                                required
                            />
                            <InputError message={errors.body} className="mt-2" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400">
                                Gunakan format yang sopan dan mudah dimengerti.
                            </span>
                            <PrimaryButton disabled={processing} className="flex items-center gap-2 px-5 p-3">
                                <span className="material-symbols-outlined text-[18px]">send</span>
                                Kirim Jawaban
                            </PrimaryButton>
                        </div>
                    </form>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
