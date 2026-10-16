import { Navigate, Route, Routes } from 'react-router-dom';
import { ListAiConversationsPage } from '../pages/list-ai-conversations-page/list-ai-conversations-page';
import { DetailsAiConversationPage } from '../pages/details-ai-conversation-page/details-ai-conversation-page';

export const AiRoutes = () => {
  return (
    <Routes>
      <Route index element={<ListAiConversationsPage />} />
      <Route path=":conversationId" element={<DetailsAiConversationPage />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
};
