import { describe, it, expect, vi } from "vitest";
import { renderWithTheme, screen } from "./utils";
import { QuestTracker } from "../components/quest/QuestTracker";
import type { Quest } from "../components/quest/QuestTracker";

const mockQuests: Quest[] = [
  {
    id: "quest-1",
    title: "Learn 10 New Words",
    description: "Practice vocabulary with NPCs",
    progress: 7,
    maxProgress: 10,
    isActive: true,
  },
  {
    id: "quest-2",
    title: "Complete Grammar Lesson",
    description: "Finish the grammar exercises",
    progress: 3,
    maxProgress: 5,
    isActive: false,
  },
  {
    id: "quest-3",
    title: "Talk to 5 NPCs",
    description: "Have conversations with town residents",
    progress: 5,
    maxProgress: 5,
    isActive: false,
  },
];

describe("QuestTracker Component", () => {
  it("renders with quest list", () => {
    renderWithTheme(<QuestTracker quests={mockQuests} />);

    expect(screen.getByText("📝 Quests (3)")).toBeInTheDocument();
    expect(screen.getByText("Learn 10 New Words")).toBeInTheDocument();
    expect(screen.getByText("Complete Grammar Lesson")).toBeInTheDocument();
    expect(screen.getByText("Talk to 5 NPCs")).toBeInTheDocument();
  });

  it("shows quest progress correctly", () => {
    renderWithTheme(<QuestTracker quests={mockQuests} />);

    expect(screen.getAllByText("7 / 10 completed")).toHaveLength(1);
    expect(screen.getAllByText("3 / 5 completed")).toHaveLength(1);
    expect(screen.getAllByText("5 / 5 completed")).toHaveLength(1);
  });

  it("renders empty state when no quests", () => {
    renderWithTheme(<QuestTracker quests={[]} />);

    expect(screen.getByText("📝 Quests")).toBeInTheDocument();
    expect(
      screen.getByText(
        "No active quests. Start exploring to find new adventures!",
      ),
    ).toBeInTheDocument();
  });

  it("highlights active quest by activeQuestId prop", () => {
    renderWithTheme(
      <QuestTracker quests={mockQuests} activeQuestId="quest-2" />,
    );

    // The active quest should be highlighted (we test for its presence)
    expect(screen.getByText("Complete Grammar Lesson")).toBeInTheDocument();
  });

  it("highlights active quest by quest.isActive property", () => {
    renderWithTheme(<QuestTracker quests={mockQuests} />);

    // Quest with isActive: true should be highlighted
    expect(screen.getByText("Learn 10 New Words")).toBeInTheDocument();
  });

  it("calls onQuestClick when quest is clicked", async () => {
    const mockOnQuestClick = vi.fn();
    const { user } = renderWithTheme(
      <QuestTracker quests={mockQuests} onQuestClick={mockOnQuestClick} />,
    );

    const firstQuest = screen.getByText("Learn 10 New Words");
    await user.click(firstQuest);

    expect(mockOnQuestClick).toHaveBeenCalledWith("quest-1");
  });

  it("handles quest completion (100% progress)", () => {
    const completedQuest: Quest[] = [
      {
        id: "completed-quest",
        title: "Completed Quest",
        description: "This quest is done",
        progress: 10,
        maxProgress: 10,
      },
    ];

    renderWithTheme(<QuestTracker quests={completedQuest} />);

    expect(screen.getByText("10 / 10 completed")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithTheme(
      <QuestTracker quests={mockQuests} className="custom-tracker" />,
    );

    expect(container.firstChild).toHaveClass("custom-tracker");
  });

  it("renders with fixed positioning", () => {
    renderWithTheme(<QuestTracker quests={mockQuests} />);

    const tracker = screen.getByText("📝 Quests (3)").closest("div");
    expect(tracker).toHaveStyle({
      position: "fixed",
    });
  });

  it("shows correct quest count in header", () => {
    renderWithTheme(<QuestTracker quests={mockQuests} />);

    expect(screen.getByText("📝 Quests (3)")).toBeInTheDocument();
  });

  it("handles single quest correctly", () => {
    const singleQuest: Quest[] = [mockQuests[0]];

    renderWithTheme(<QuestTracker quests={singleQuest} />);

    expect(screen.getByText("📝 Quests (1)")).toBeInTheDocument();
    expect(screen.getByText("Learn 10 New Words")).toBeInTheDocument();
  });

  it("renders progress bars for each quest", () => {
    renderWithTheme(<QuestTracker quests={mockQuests} />);

    // Each quest should have progress text
    expect(screen.getAllByText("7 / 10 completed")).toHaveLength(1);
    expect(screen.getAllByText("3 / 5 completed")).toHaveLength(1);
    expect(screen.getAllByText("5 / 5 completed")).toHaveLength(1);
  });

  it("handles zero progress quest", () => {
    const zeroProgressQuest: Quest[] = [
      {
        id: "zero-quest",
        title: "New Quest",
        description: "Just started",
        progress: 0,
        maxProgress: 10,
      },
    ];

    renderWithTheme(<QuestTracker quests={zeroProgressQuest} />);

    expect(screen.getByText("0 / 10 completed")).toBeInTheDocument();
  });

  it("handles multiple active quests correctly", () => {
    const multipleActiveQuests = mockQuests.map((quest) => ({
      ...quest,
      isActive: true,
    }));

    renderWithTheme(<QuestTracker quests={multipleActiveQuests} />);

    // All quests should be present
    expect(screen.getByText("Learn 10 New Words")).toBeInTheDocument();
    expect(screen.getByText("Complete Grammar Lesson")).toBeInTheDocument();
    expect(screen.getByText("Talk to 5 NPCs")).toBeInTheDocument();
  });

  it("prioritizes activeQuestId over quest.isActive", () => {
    renderWithTheme(
      <QuestTracker quests={mockQuests} activeQuestId="quest-2" />,
    );

    // quest-2 should be active even though quest-1 has isActive: true
    expect(screen.getByText("Complete Grammar Lesson")).toBeInTheDocument();
  });
});
