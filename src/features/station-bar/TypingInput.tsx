
import { useGameContext } from '../game-engine/useGameContext';
import { useStationInputHandling } from './useStationInputHandling';

export function TypingInput() {
  const { state, dispatch } = useGameContext();
  const inputRef = useStationInputHandling();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'UPDATE_INPUT',
      payload: e.target.value,
    });
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={state.typedInput}
      onChange={handleChange}
      placeholder="Type the station name..."
      autoFocus
      className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-lg font-semibold focus:outline-none focus:border-blue-500"
    />
  );
}
