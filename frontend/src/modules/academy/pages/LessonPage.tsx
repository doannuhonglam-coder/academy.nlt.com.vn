import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import type { LessonContent, QuizQuestion, QuizResult, LessonCompleteResult } from '../types/academy.types';
import { API_PREFIX, STALE_TIME, LESSON_TYPE_ICON } from '../constants/academy.constants';

async function fetchLesson(id: string): Promise<LessonContent> {
  const res = await fetch(`${API_PREFIX}/lessons/${id}`, {
    headers: { Authorization: `Bearer mock-token` },
  });
  return res.json();
}

async function fetchQuiz(lessonId: string): Promise<QuizQuestion[]> {
  const res = await fetch(`${API_PREFIX}/lessons/${lessonId}/quiz`, {
    headers: { Authorization: `Bearer mock-token` },
  });
  return res.json();
}

async function submitQuiz(lessonId: string, questionId: string, optionId: string): Promise<QuizResult> {
  const res = await fetch(`${API_PREFIX}/lessons/${lessonId}/quiz/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer mock-token` },
    body: JSON.stringify({ question_id: questionId, selected_option_id: optionId }),
  });
  return res.json();
}

async function completeLesson(lessonId: string): Promise<LessonCompleteResult> {
  const res = await fetch(`${API_PREFIX}/lessons/${lessonId}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer mock-token` },
  });
  return res.json();
}

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [completionResult, setCompletionResult] = useState<LessonCompleteResult | null>(null);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['academy-lesson', lessonId],
    queryFn: () => fetchLesson(lessonId!),
    staleTime: STALE_TIME.LESSON,
    enabled: !!lessonId,
  });

  const { data: quiz } = useQuery({
    queryKey: ['academy-quiz', lessonId],
    queryFn: () => fetchQuiz(lessonId!),
    enabled: !!lessonId && lesson?.lesson_type === 'quiz',
  });

  const quizMutation = useMutation({
    mutationFn: ({ qId, oId }: { qId: string; oId: string }) =>
      submitQuiz(lessonId!, qId, oId),
    onSuccess: setQuizResult,
  });

  const completeMutation = useMutation({
    mutationFn: () => completeLesson(lessonId!),
    onSuccess: setCompletionResult,
  });

  if (isLoading || !lesson) {
    return (
      <div className="flex min-h-screen bg-gray-950 items-center justify-center text-gray-400">
        Đang tải bài học...
      </div>
    );
  }

  const breadcrumb = [
    { label: lesson.course_brief.title, to: `/training/courses/${lesson.course_brief.slug}` },
    { label: `Bài ${lesson.lesson_order}: ${lesson.title}` },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <Topbar breadcrumb={breadcrumb} />

      <div className="flex flex-1">
        {/* Main content */}
        <main className="flex-1 p-6 max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">{LESSON_TYPE_ICON[lesson.lesson_type]}</span>
            <h1 className="text-xl font-bold text-white">{lesson.title}</h1>
          </div>

          {/* Video Player */}
          {lesson.lesson_type === 'video' && (
            <div className="bg-black/60 rounded-xl aspect-video flex items-center justify-center border border-white/10 mb-6">
              {lesson.video_stream_url ? (
                <video src={lesson.video_stream_url} controls className="w-full h-full rounded-xl" />
              ) : (
                <div className="text-center text-gray-500">
                  <span className="text-4xl block mb-2">🎬</span>
                  <p className="text-sm">Video chưa sẵn sàng</p>
                  {lesson.video_duration_s && (
                    <p className="text-xs mt-1">{Math.round(lesson.video_duration_s / 60)} phút</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reading Content */}
          {(lesson.lesson_type === 'reading' || lesson.content_markdown) && (
            <div className="prose prose-invert prose-sm max-w-none mb-6">
              {lesson.content_markdown ? (
                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {lesson.content_markdown}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Nội dung đang được cập nhật...</p>
              )}
            </div>
          )}

          {/* Key Points */}
          {lesson.key_points.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-bold text-white mb-3">📌 Điểm chính cần nhớ</h3>
              <ul className="space-y-2">
                {lesson.key_points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-teal-400 mt-0.5">•</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quiz */}
          {lesson.lesson_type === 'quiz' && quiz && quiz.length > 0 && (
            <div className="space-y-4 mb-6">
              {quiz.map(q => (
                <div key={q.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <p className="text-sm font-medium text-white mb-4">{q.question_text}</p>
                  <div className="space-y-2">
                    {q.options.map(opt => {
                      const answered = quizResult?.question_id === q.id;
                      const isSelected = quizResult?.selected_option_id === opt.id;
                      const withAnswer = quizResult?.options_with_answer.find(o => o.id === opt.id);
                      let cls = 'border border-white/10 bg-white/5 text-gray-300';
                      if (answered && withAnswer?.is_correct) cls = 'border border-teal-500 bg-teal-500/10 text-teal-300';
                      else if (answered && isSelected && !withAnswer?.is_correct) cls = 'border border-red-500/50 bg-red-500/10 text-red-300';

                      return (
                        <button
                          key={opt.id}
                          disabled={!!quizResult}
                          onClick={() => quizMutation.mutate({ qId: q.id, oId: opt.id })}
                          className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${cls} ${!quizResult ? 'hover:bg-white/10 cursor-pointer' : 'cursor-default'}`}
                        >
                          {opt.option_text}
                          {answered && withAnswer?.explanation && (
                            <p className="text-[11px] mt-1 opacity-80">{withAnswer.explanation}</p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {quizResult && (
                    <div className={`mt-3 text-sm font-medium ${quizResult.is_correct ? 'text-teal-400' : 'text-red-400'}`}>
                      {quizResult.is_correct ? `✓ Đúng! +${quizResult.xp_earned} XP` : '✗ Chưa đúng. Xem lại đáp án.'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Completion Banner */}
          {completionResult ? (
            <div className="rounded-2xl p-6 bg-gradient-to-r from-teal-900/60 to-teal-700/40 border border-teal-500/30 text-center">
              <p className="text-2xl mb-2">
                {completionResult.course_completed ? '🏆' : '🎉'}
              </p>
              <h3 className="text-lg font-bold text-white mb-1">
                {completionResult.course_completed ? 'Khoá học hoàn thành!' : `Bài ${lesson.lesson_order} hoàn thành!`}
              </h3>
              <p className="text-teal-300 text-sm mb-4">+{completionResult.xp_earned} XP</p>
              {completionResult.gamification_delta.badges_earned.length > 0 && (
                <div className="flex justify-center gap-2 mb-4">
                  {completionResult.gamification_delta.badges_earned.map(b => (
                    <span key={b.id} className="bg-gold-500/20 text-gold-400 text-xs font-bold px-3 py-1 rounded-full">
                      🏅 {b.title}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex justify-center gap-3">
                {completionResult.course_completed ? (
                  <>
                    <button onClick={() => navigate('/training/profile')} className="bg-teal-500 text-white text-sm font-bold px-5 py-2 rounded-lg">
                      Xem chứng chỉ
                    </button>
                    <button onClick={() => navigate('/academy')} className="bg-white/10 text-white text-sm font-bold px-5 py-2 rounded-lg">
                      Khám phá thêm
                    </button>
                  </>
                ) : completionResult.next_lesson ? (
                  <>
                    <button
                      onClick={() => navigate(`/training/lessons/${completionResult.next_lesson!.id}`)}
                      className="bg-coral-500 text-white text-sm font-bold px-5 py-2 rounded-lg"
                    >
                      → Bài tiếp
                    </button>
                    <button onClick={() => navigate(`/training/courses/${lesson.course_brief.slug}`)} className="bg-white/10 text-white text-sm font-bold px-5 py-2 rounded-lg">
                      ← Về khoá học
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ) : (
            <button
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
              className="w-full py-3 bg-coral-500 hover:bg-coral-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {completeMutation.isPending ? 'Đang lưu...' : 'Xong bài này ✓'}
            </button>
          )}
        </main>

        {/* Right panel — lesson list */}
        <aside className="w-72 flex-shrink-0 border-l border-white/5 p-4 sticky top-14 self-start overflow-y-auto max-h-screen academy-scrollbar">
          <h3 className="text-sm font-bold text-white mb-3">Danh sách bài học</h3>
          {lesson.course_brief && (
            <div className="space-y-1">
              {[lesson.prev_lesson, lesson, lesson.next_lesson].filter(Boolean).map((l) => {
                if (!l) return null;
                const isCurrent = l.id === lesson.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => !isCurrent && navigate(`/training/lessons/${l.id}`)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      isCurrent
                        ? 'bg-coral-500/20 border border-coral-500/30 text-coral-300'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="mr-2">{LESSON_TYPE_ICON[l.lesson_type]}</span>
                    {l.title}
                  </button>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
