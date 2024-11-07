import { useState } from "react";
import ChatButtons from "./ChatButtons";
import ChatPanel from "./ChatPanel";

export type ChatMessage = {
  message: string,
  isSelf: boolean,
}

export type ServerSideChatMessage = {
  userId: string,
  message: string,
}

/**
 * The chatting overlay component. This is a full-screen overlay on the top layer of the frontend contains the UI for chatting feature.
 * @param otherUserName The other user's name to chat to. It will be displayed in the title of the chatting panel.
 * @param questionId The question ID to establish the question context for the AI chatbot.
 */
export default function ChattingOverlay({otherUserName, questionId} : {otherUserName : string, questionId: string | null}) {

  /** Display settings related to the chatting overlay between the two matched users */
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [displayChattingPanel, setDisplayChattingPanel] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  /** Display settings related to the chatting overlay between user and bot */
  const [chatMessagesBot, setChatMessagesBot] = useState<ChatMessage[]>([]);
  const [displayChattingPanelBot, setDisplayChattingPanelBot] = useState(false);
  const [hasUnreadMessagesBot, setHasUnreadMessagesBot] = useState(false);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-50">
        <ChatPanel 
          chatMessages={ chatMessages }
          setChatMessages={ setChatMessages }
          otherUserName={ otherUserName } 
          isShown={ displayChattingPanel }
          onAddChatMessage={ () => {
            if(!displayChattingPanel) {
              setHasUnreadMessages(true);
            }
          } }
          onClose={ () => {
            // close panel
            setDisplayChattingPanel(false);

            // the messages have been displayed
            setHasUnreadMessages(false);
          }}
        />
        <ChatPanel 
          isBot
          questionId={ questionId }
          chatMessages={ chatMessagesBot }
          setChatMessages={ setChatMessagesBot }
          otherUserName="PeerPrepBot" 
          isShown={ displayChattingPanelBot }
          onAddChatMessage={ () => {
            if(!displayChattingPanelBot) {
              setHasUnreadMessagesBot(true);
            }
          } }
          onClose={ () => {
            // close panel
            setDisplayChattingPanelBot(false);

            // the messages have been displayed
            setHasUnreadMessagesBot(false);
          }}
        />
        <ChatButtons
          hasUnreadMessages={ hasUnreadMessages }
          hasUnreadMessagesBot={ hasUnreadMessagesBot }
          isShown={ !displayChattingPanel && !displayChattingPanelBot }
          onChatClick={ () => { setDisplayChattingPanel(true); setHasUnreadMessages(false); } }
          onBotChatClick={ () => { setDisplayChattingPanelBot(true); setHasUnreadMessagesBot(false); } }
        />
      </div>
    </>
  );
}