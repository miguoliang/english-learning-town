import { useEffect, useRef, useState } from 'react';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
import { EventBus } from './game/EventBus';

// Learning activity types
interface LearningActivity {
  location: string;
  npc?: string;
  activity: string;
  name?: string;
  greeting?: string;
}

// Learning progress tracking
interface LearningProgress {
  grammar: number;
  vocabulary: number;
  reading: number;
  conversation: number;
}

function App() {
  // Game references
  const phaserRef = useRef<IRefPhaserGame | null>(null);

  // Learning state
  const [currentActivity, setCurrentActivity] = useState<LearningActivity | null>(null);
  const [showLearningModule, setShowLearningModule] = useState(false);
  const [learningProgress, setLearningProgress] = useState<LearningProgress>({
    grammar: 0,
    vocabulary: 0,
    reading: 0,
    conversation: 0,
  });

  // Current scene tracking
  const [currentSceneName, setCurrentSceneName] = useState<string>('');

  useEffect(() => {
    // Listen for building/location entry events
    EventBus.on('enter-school', handleEnterLocation);
    EventBus.on('enter-library', handleEnterLocation);
    EventBus.on('enter-cafe', handleEnterLocation);
    EventBus.on('enter-shop', handleEnterLocation);

    // Listen for NPC conversation events
    EventBus.on('talk-to-npc', handleNPCConversation);

    return () => {
      EventBus.removeListener('enter-school');
      EventBus.removeListener('enter-library');
      EventBus.removeListener('enter-cafe');
      EventBus.removeListener('enter-shop');
      EventBus.removeListener('talk-to-npc');
    };
  }, []);

  const handleEnterLocation = (data: LearningActivity) => {
    setCurrentActivity(data);
    setShowLearningModule(true);
  };

  const handleNPCConversation = (data: LearningActivity) => {
    setCurrentActivity(data);
    setShowLearningModule(true);
  };

  const completeLearningActivity = (activityType: keyof LearningProgress) => {
    setLearningProgress(prev => ({
      ...prev,
      [activityType]: Math.min(prev[activityType] + 10, 100),
    }));
    setShowLearningModule(false);
    setCurrentActivity(null);
  };

  const closeLearningModule = () => {
    setShowLearningModule(false);
    setCurrentActivity(null);
  };

  // Event emitted from the PhaserGame component
  const currentScene = (scene: Phaser.Scene) => {
    setCurrentSceneName(scene.scene.key);
  };

  const renderLearningModule = () => {
    if (!currentActivity) return null;

    const { activity, npc, name, greeting } = currentActivity;

    switch (activity) {
      case 'grammar-lesson':
        return (
          <div className='learning-module grammar'>
            <h2>📝 Grammar Lesson with {name ?? npc}</h2>
            <p className='greeting'>{greeting}</p>
            <div className='lesson-content'>
              <h3>Present Simple vs Present Continuous</h3>
              <p>
                <strong>Present Simple:</strong> I <u>work</u> every day.
              </p>
              <p>
                <strong>Present Continuous:</strong> I <u>am working</u> right now.
              </p>
              <div className='quiz'>
                <p>Complete: "She _____ to school every morning."</p>
                <button onClick={() => completeLearningActivity('grammar')}>goes</button>
                <button onClick={() => completeLearningActivity('grammar')}>is going</button>
              </div>
            </div>
          </div>
        );

      case 'vocabulary-shopping':
        return (
          <div className='learning-module vocabulary'>
            <h2>🛒 Shopping Vocabulary with {name ?? npc}</h2>
            <p className='greeting'>{greeting}</p>
            <div className='lesson-content'>
              <h3>Shopping Items</h3>
              <div className='vocabulary-grid'>
                <div className='vocab-item'>🍎 Apple</div>
                <div className='vocab-item'>🥛 Milk</div>
                <div className='vocab-item'>🍞 Bread</div>
                <div className='vocab-item'>🧀 Cheese</div>
              </div>
              <p>Practice: "I'd like to buy some _____, please."</p>
              <button onClick={() => completeLearningActivity('vocabulary')}>
                Complete Vocabulary Practice
              </button>
            </div>
          </div>
        );

      case 'reading-comprehension':
        return (
          <div className='learning-module reading'>
            <h2>📚 Reading Comprehension with {name ?? npc}</h2>
            <p className='greeting'>{greeting}</p>
            <div className='lesson-content'>
              <h3>Short Story</h3>
              <div className='reading-text'>
                <p>
                  Tom walks to school every day. He likes to read books in the library. Today, he
                  borrowed a book about animals. He plans to read it tonight.
                </p>
              </div>
              <div className='comprehension-questions'>
                <p>
                  <strong>Question:</strong> What does Tom like to do in the library?
                </p>
                <button onClick={() => completeLearningActivity('reading')}>Read books</button>
              </div>
            </div>
          </div>
        );

      case 'conversation-practice':
        return (
          <div className='learning-module conversation'>
            <h2>☕ Conversation Practice</h2>
            <p className='greeting'>Welcome to the café! Let's practice ordering.</p>
            <div className='lesson-content'>
              <h3>Café Conversation</h3>
              <div className='conversation'>
                <p>
                  <strong>Waiter:</strong> "Good morning! What would you like to drink?"
                </p>
                <p>
                  <strong>You:</strong> "I'd like a coffee, please."
                </p>
                <p>
                  <strong>Waiter:</strong> "Would you like sugar with that?"
                </p>
                <p>
                  <strong>You:</strong> "No, thank you."
                </p>
              </div>
              <button onClick={() => completeLearningActivity('conversation')}>
                Practice Complete
              </button>
            </div>
          </div>
        );

      default:
        return <div>Unknown activity</div>;
    }
  };

  return (
    <div id='app'>
      <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />

      {/* Learning Progress Panel */}
      <div className='progress-panel'>
        <h3>🎓 Learning Progress</h3>
        <div className='progress-bars'>
          <div className='progress-item'>
            <span>📝 Grammar:</span>
            <div className='progress-bar'>
              <div
                className='progress-fill'
                style={{ width: `${learningProgress.grammar}%` }}
              ></div>
            </div>
            <span>{learningProgress.grammar}%</span>
          </div>
          <div className='progress-item'>
            <span>📚 Reading:</span>
            <div className='progress-bar'>
              <div
                className='progress-fill'
                style={{ width: `${learningProgress.reading}%` }}
              ></div>
            </div>
            <span>{learningProgress.reading}%</span>
          </div>
          <div className='progress-item'>
            <span>🛒 Vocabulary:</span>
            <div className='progress-bar'>
              <div
                className='progress-fill'
                style={{ width: `${learningProgress.vocabulary}%` }}
              ></div>
            </div>
            <span>{learningProgress.vocabulary}%</span>
          </div>
          <div className='progress-item'>
            <span>💬 Conversation:</span>
            <div className='progress-bar'>
              <div
                className='progress-fill'
                style={{ width: `${learningProgress.conversation}%` }}
              ></div>
            </div>
            <span>{learningProgress.conversation}%</span>
          </div>
        </div>
      </div>

      {/* Game Info */}
      <div className='game-info'>
        <p>
          <strong>Current Scene:</strong> {currentSceneName}
        </p>
        <p>
          <strong>Instructions:</strong>{' '}
          {currentSceneName === 'Game'
            ? 'Click on buildings and NPCs to start learning!'
            : currentSceneName === 'MainMenu'
              ? 'Click anywhere to enter the town'
              : 'Navigate through the learning experience'}
        </p>
      </div>

      {/* Learning Module Modal */}
      {showLearningModule && (
        <div className='modal-overlay'>
          <div className='modal-content'>
            <button className='close-button' onClick={closeLearningModule}>
              ✕
            </button>
            {renderLearningModule()}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
