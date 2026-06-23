export function ChatMessage({ text, isUser }: { text: string; isUser: boolean }) {
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm md:text-base ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm border border-gray-200'
        }`}
      >
        {text}
      </div>
    </div>
  );
}
