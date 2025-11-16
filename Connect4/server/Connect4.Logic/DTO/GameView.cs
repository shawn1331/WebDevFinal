using Connect4.Logic.Domain;
namespace Connect4.Logic.DTO;
public class GameView
{
    public string Id { get; init; } = "";
    public int Rows { get; init; }
    public int Cols { get; init; }
    public int[][] Board { get; init; } = Array.Empty<int[]>();
    public int Turn { get; init; }
    public string Status { get; init; } = "";
    public int Winner { get; init; }
    public Cell[] WinLine { get; init; } = Array.Empty<Cell>();
    public string? P1 { get; init; }
    public string? P2 { get; init; }

    public static GameView From(Game game)
    {
        var snap = game.Board.Snapshot();
        var jagged = new int[game.Board.Rows][];
        for (int r = 0; r < game.Board.Rows; r++)
        {
            jagged[r] = new int[game.Board.Columns];
            for (int c = 0; c < game.Board.Columns; c++) jagged[r][c] = snap[r, c];
        }
        return new GameView
        {
            Id = game.Id,
            Rows = game.Board.Rows,
            Cols = game.Board.Columns,
            Board = jagged,
            Turn = game.Turn,
            Status = game.Status.ToString(),
            Winner = game.Winner,
            WinLine = game.WinLine.ToArray(),
            P1 = game.Player1?.Name,
            P2 = game.Player2?.Name
        };
    }
}

