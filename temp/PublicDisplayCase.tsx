import { useParams } from "react-router-dom";
import { useDisplayCase } from "@/hooks/useDisplayCase";
import LikeButton from "@/components/display/LikeButton";
import { CommentSection } from "@/components/display-cases/CommentSection";
import { Card } from "@/types/Card";
import { DisplayCaseComment } from "@/lib/firebase/displayCases";
import { MessageSellerButton } from "@/components/display/MessageSellerButton";
import { EnhancedShareButton } from "@/components/display/EnhancedShareButton";

export default function PublicDisplayCase() {
  const { publicId } = useParams<{ publicId: string }>();
  const { displayCase, cards, isLoading } = useDisplayCase(publicId);

  if (isLoading) return <div className="text-center mt-10">Loading...</div>;
  if (!displayCase) return <div className="text-center mt-10">Display case not found.</div>;

  return (
    <div className="p-4 space-y-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">{displayCase.name}</h1>
          {displayCase.description && (
            <p className="text-gray-500 max-w-2xl mx-auto">{displayCase.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>Created: {displayCase.createdAt.toLocaleDateString()}</span>
          <span>Theme: {displayCase.background || "Default"}</span>
          <LikeButton displayCaseId={displayCase.id} />
        </div>

        <div className="mt-4 flex justify-center space-x-2">
          {displayCase?.publicId && (
            <EnhancedShareButton 
              publicId={displayCase.publicId} 
              title={displayCase.name}
            />
          )}
          {displayCase?.userId && (
            <MessageSellerButton 
              sellerId={displayCase.userId} 
              displayCaseId={displayCase.id}
              sellerName="Owner"
            />
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <CommentSection displayCaseId={displayCase.id} />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Cards</h2>
        {cards.length === 0 ? (
          <div className="text-center text-gray-400 italic mt-8">
            No cards in this display case yet.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {cards.map((card: Card) => (
                <div key={card.id} className="relative group">
                  {card.imageUrl ? (
                    <>
                      <img 
                        src={card.imageUrl} 
                        alt={`${card.playerName} ${card.year} ${card.cardSet}`}
                        className="rounded-xl w-full shadow-md aspect-[2/3] object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-white text-sm rounded-xl p-2">
                        <div className="text-center">
                          <div className="font-semibold">{card.playerName}</div>
                          <div className="text-xs">{card.year} {card.cardSet}</div>
                          {card.price && (
                            <div className="text-xs mt-1">${card.price.toLocaleString()}</div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl w-full shadow-md aspect-[2/3] bg-gray-100 flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="font-semibold">{card.playerName}</div>
                        <div className="text-xs text-gray-600">
                          {card.year} {card.cardSet}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="block md:hidden text-xs text-gray-400 mt-2 text-center">
              Tap cards to view details
            </div>
          </>
        )}
      </div>

      {displayCase.comments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Comments</h2>
          <div className="space-y-4">
            {displayCase.comments.map((comment: DisplayCaseComment, index: number) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{comment.text}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {comment.timestamp.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 