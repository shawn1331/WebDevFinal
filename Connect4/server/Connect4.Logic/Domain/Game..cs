namespace Connect4.Logic.Domain;

public class Game
{
    public string Id { get; }
    public Board Board { get; }
    public Player? Player1 { get; private set; }
    public Player? Player2 { get; private set; }
    public int Turn { get; private set; } = 1;
    public GameStatus Status { get; private set; } = GameStatus.Waiting;
    public int Winner { get; private set; } = 0;
    public IReadOnlyList<Cell> WinLine { get; private set; } = Array.Empty<Cell>();

    public Game(string id, Board board)
    {
        Id = id;
        Board = board;
    }

    public void Join(Player player)
    {
        if (Player1 == null)
        {
            Player1 = player with { Number = 1 };
            return;
        }
        if (Player2 == null)
        {
            Player2 = player with { Number = 2 };
            Status = GameStatus.Live;
            return;
        }
        throw new InvalidOperationException("Game already has 2 players.");
    }

    public void SetWin(int player, IReadOnlyList<Cell> line)
    {
        Status = GameStatus.Finished;
        Winner = player;
        WinLine = line;
    }

    public void SetDraw()
    {
        Status = GameStatus.Finished;
        Winner = 0;
        WinLine = Array.Empty<Cell>();
    }

    public void NextTurn() => Turn = Turn == 1 ? 2 : 1;
}
