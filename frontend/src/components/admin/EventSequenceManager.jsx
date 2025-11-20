import { ArrowUp, ArrowDown, X, Plus } from 'lucide-react';

export default function EventSequenceManager({
  availableCategories,
  eventSequence,
  currentSequenceIndex,
  onAddToSequence,
  onRemoveFromSequence,
  onMoveUp,
  onMoveDown,
  isVotingActive
}) {
  const isInSequence = (categoryId) => eventSequence.find(c => c.id === categoryId);
  const canMove = (index) => !(isVotingActive && index <= currentSequenceIndex);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
          {/* Available Categories Section */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 pl-1">
              Available Categories
            </h4>
            <div className="space-y-1.5">
              {availableCategories.map((category) => {
                const inSequence = isInSequence(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => onAddToSequence(category)}
                    disabled={inSequence}
                    className={`
                      w-full px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5
                      ${inSequence
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        : 'bg-white text-slate-700 border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95'
                      }
                    `}
                  >
                    <Plus size={14} className={inSequence ? 'opacity-50' : ''} />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

          {/* Current Sequence Section */}
          <div>
            <h4 className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
              Sequence Order
            </h4>
            {eventSequence.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-400">No categories added yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {eventSequence.map((category, index) => {
                  const isActive = index === currentSequenceIndex;
                  const canMoveItem = canMove(index);

                  return (
                    <div
                      key={category.id}
                      className={`
                        px-3 py-2 rounded-lg border-2 transition-all duration-200 flex items-center gap-2
                        ${isActive
                          ? 'bg-emerald-50 border-emerald-400 shadow-sm'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }
                      `}
                    >
                      {/* Index Badge */}
                      <div className={`
                        w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs
                        ${isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-300 text-slate-700'
                        }
                      `}>
                        {index + 1}
                      </div>

                      {/* Category Name */}
                      <span className={`
                        flex-1 text-xs font-medium
                        ${isActive ? 'text-emerald-700' : 'text-slate-700'}
                      `}>
                        {category.name}
                      </span>

                      {/* Action Buttons */}
                      <div className="flex gap-0.5">
                        <button
                          onClick={() => onMoveUp(index)}
                          disabled={index === 0 || !canMoveItem}
                          title={!canMoveItem ? "Cannot move active or completed rounds" : "Move up"}
                          className={`
                            p-1 rounded transition-all duration-200
                            ${(index === 0 || !canMoveItem)
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800 active:scale-90'
                            }
                          `}
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          onClick={() => onMoveDown(index)}
                          disabled={index === eventSequence.length - 1 || !canMoveItem}
                          title={!canMoveItem ? "Cannot move active or completed rounds" : "Move down"}
                          className={`
                            p-1 rounded transition-all duration-200
                            ${(index === eventSequence.length - 1 || !canMoveItem)
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800 active:scale-90'
                            }
                          `}
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          onClick={() => onRemoveFromSequence(category.id)}
                          disabled={isVotingActive && index <= currentSequenceIndex}
                          title={isVotingActive && index <= currentSequenceIndex ? "Cannot remove active or completed rounds" : "Remove"}
                          className={`
                            p-1 rounded transition-all duration-200
                            ${(isVotingActive && index <= currentSequenceIndex)
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-red-500 hover:bg-red-50 hover:text-red-700 active:scale-90'
                            }
                          `}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
      </div>
    </div>
  );
}
